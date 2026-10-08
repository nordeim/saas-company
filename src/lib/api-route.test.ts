import { describe, expect, it, vi } from "vitest";

/**
 * Session 19 F1 — the crash-path envelope wrapper (`apiRoute`).
 *
 * The architecture invariant says every API route answers the envelope —
 * but that was only ever surveyed on HANDLED paths. Probed with an
 * unwritable DATABASE_URL, seven endpoints answered a BARE 500 with an
 * EMPTY body and NO content-type (the catalog in
 * docs/remediation-plan-session19.md). The wrapper formats whatever
 * ESCAPES a handler as the INTERNAL_ERROR envelope and — critically —
 * RESTORES the operator's stack to file descriptor 2 via the S18-proven
 * seam (`writeSync(2, …)` from a STATIC node:fs import): Next.js only
 * logs UNhandled route errors, so catching the error otherwise REMOVES
 * the stack from the server log.
 *
 * `node:fs` is partially mocked (writeSync only — the ESM namespace of a
 * builtin cannot be spied directly, the S18 instrumentation.test.ts
 * pattern); `./db` and `./auth` are mocked so the import graph stays pure
 * (db.ts instantiates PrismaClient at import; auth.ts runs module-init
 * scrypt).
 */
vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, writeSync: vi.fn(() => 0) };
});
vi.mock("./db", () => ({ db: {} }));
vi.mock("./auth", () => ({ sessionUserId: vi.fn(async () => null) }));

import { writeSync } from "node:fs";
import { apiRoute, fail, ok } from "./api";

const writeSyncMock = vi.mocked(writeSync);

describe("apiRoute — the crash-path envelope (Session 19 F1)", () => {
  it("passes a resolved handler through untouched (status + body verbatim)", async () => {
    const res = await apiRoute(async () => ok({ x: 1 }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; data: unknown };
    expect(body).toEqual({ ok: true, data: { x: 1 } });
    // A clean handler writes nothing to fd 2 — the log stays silent.
    expect(writeSyncMock).not.toHaveBeenCalled();
  });

  it("converts an escaping throw into the 500 INTERNAL_ERROR envelope", async () => {
    writeSyncMock.mockClear();
    const res = await apiRoute(async () => {
      throw new Error("boom: the database is unreachable");
    });
    expect(res.status).toBe(500);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = (await res.json()) as {
      ok: boolean;
      error: { code: string; message: string };
    };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    // Generic copy — internals (the boom message) never leak to clients.
    expect(body.error.message).toMatch(/something went wrong/i);
    expect(body.error.message).not.toContain("boom");
  });

  it("writes the escaped stack to file descriptor 2 (the operator's sight)", async () => {
    writeSyncMock.mockClear();
    await apiRoute(async () => {
      throw new Error("boom");
    });
    expect(writeSyncMock).toHaveBeenCalledTimes(1);
    const [fd, message] = writeSyncMock.mock.calls[0] as [number, string];
    expect(fd).toBe(2);
    expect(message).toContain("[api:unhandled]");
    expect(message).toContain("boom");
    expect(message).toContain("\n"); // one loggable line
  });

  it("never rewrites a HANDLED failure — classification passes through verbatim", async () => {
    // The S17 discipline: the register route's P2002 → 409, the 400/401/
    // 403/404/429 envelope paths — all fire INSIDE the handler and must
    // pass the wrapper byte-identical. The wrapper only formats what
    // ESCAPES.
    const res = await apiRoute(async () =>
      fail("EMAIL_TAKEN", "An account with this email already exists.", 409),
    );
    expect(res.status).toBe(409);
    const body = (await res.json()) as {
      ok: boolean;
      error: { code: string; message: string };
    };
    expect(body.error.code).toBe("EMAIL_TAKEN");
    expect(body.error.message).toBe("An account with this email already exists.");
    expect(writeSyncMock).not.toHaveBeenCalled();
  });

  it("the crash envelope carries Cache-Control: private, no-store (the S16 seam)", async () => {
    writeSyncMock.mockClear();
    const res = await apiRoute(async () => {
      throw new Error("boom");
    });
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });
});
