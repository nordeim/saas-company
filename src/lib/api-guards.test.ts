import { describe, expect, it, vi } from "vitest";

/**
 * Session 20 F1/F2 — the method-mismatch envelope (`methodGuard` /
 * `optionsGuard`) and the request-size ceiling (`bodyTooLarge`).
 *
 * The architecture invariant says every API route answers the envelope —
 * but the method layer sits BELOW every handler: a request using a method
 * the route does not export was answered by the FRAMEWORK with a bare 405
 * (empty body, no content-type, no Allow, no cache-control — the
 * 11-probe catalog in docs/remediation-plan-session20.md). The guard
 * exports claim those methods for the envelope. The request-size layer:
 * POST/PATCH routes buffered arbitrarily large bodies at request.json()
 * (probed: a 50MB login body, fully parsed); the ceiling guard reads the
 * DECLARED content-length before any buffering.
 *
 * `./db` and `./auth` are mocked so the import graph stays pure (the S19
 * api-route.test.ts pattern — db.ts instantiates PrismaClient at import;
 * auth.ts runs module-init scrypt).
 */
vi.mock("./db", () => ({ db: {} }));
vi.mock("./auth", () => ({ sessionUserId: vi.fn(async () => null) }));

import { bodyTooLarge, MAX_JSON_BODY_BYTES, methodGuard, optionsGuard } from "./api";

function requestWithLength(value: string | null): Request {
  const headers = new Headers();
  if (value !== null) headers.set("content-length", value);
  return { headers } as unknown as Request;
}

describe("methodGuard — the method-mismatch envelope (Session 20 F1)", () => {
  it("answers 405 with the METHOD_NOT_ALLOWED envelope and generic copy", async () => {
    const res = methodGuard("OPTIONS, POST")();
    expect(res.status).toBe(405);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = (await res.json()) as {
      ok: boolean;
      error: { code: string; message: string };
    };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
    // Generic copy — the route's internals never leak to clients.
    expect(body.error.message).toMatch(/does not accept/i);
  });

  it("carries the route's real methods in the Allow header (RFC 9110 §15.4.6)", async () => {
    const res = methodGuard("GET, HEAD, OPTIONS, POST")();
    expect(res.headers.get("allow")).toBe("GET, HEAD, OPTIONS, POST");
  });

  it("carries Cache-Control: private, no-store (the S16 seam)", async () => {
    const res = methodGuard("OPTIONS, POST")();
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("optionsGuard answers 204 + Allow + no-store (the preflight contract)", async () => {
    const res = optionsGuard("GET, HEAD, OPTIONS")();
    expect(res.status).toBe(204);
    expect(res.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });
});

describe("bodyTooLarge — the request-size ceiling (Session 20 F2)", () => {
  it("rejects a declared body over the ceiling with the 413 PAYLOAD_TOO_LARGE envelope", async () => {
    const res = bodyTooLarge(requestWithLength(String(MAX_JSON_BODY_BYTES + 1)));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(413);
    expect(res!.headers.get("content-type")).toContain("application/json");
    expect(res!.headers.get("cache-control")).toBe("private, no-store");
    const body = (await res!.json()) as {
      ok: boolean;
      error: { code: string; message: string };
    };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("passes a declared body at exactly the ceiling (the boundary is inclusive)", () => {
    const res = bodyTooLarge(requestWithLength(String(MAX_JSON_BODY_BYTES)));
    expect(res).toBeNull();
  });

  it("passes an absent content-length (chunked bodies fall through to the parse path)", () => {
    expect(bodyTooLarge(requestWithLength(null))).toBeNull();
  });

  it("passes a malformed content-length without crashing the guard", () => {
    expect(bodyTooLarge(requestWithLength("not-a-number"))).toBeNull();
  });
});
