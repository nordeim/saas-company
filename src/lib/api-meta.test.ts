import { describe, expect, it, vi } from "vitest";

/**
 * Session 21 R1 — the meta-carrying `ok()` (the output twin of the S20
 * request-size ceiling). The envelope invariant gains an additive TOP-LEVEL
 * `meta` sibling of `data` — `{ ok: true, data, meta }` — so the workflows
 * list can carry the TRUE total + honest aggregates alongside a capped
 * array. Every existing consumer that reads `data` is untouched; `meta` is
 * strictly optional everywhere (the e2e error-boundary mocks fulfill with
 * bare arrays and must keep working).
 *
 * `./db` and `./auth` are mocked so the import graph stays pure (the S19
 * api-route.test.ts pattern — db.ts instantiates PrismaClient at import;
 * auth.ts runs module-init scrypt).
 */
vi.mock("./db", () => ({ db: {} }));
vi.mock("./auth", () => ({ sessionUserId: vi.fn(async () => null) }));

import { ok } from "./api";

describe("ok() — the meta extension (Session 21 R1)", () => {
  it("carries meta as an additive top-level sibling of data, data intact", async () => {
    const res = ok([1, 2, 3], 200, { meta: { total: 412, stats: { active: 266 } } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok: boolean;
      data: unknown;
      meta?: { total: number; stats: { active: number } };
    };
    expect(body.ok).toBe(true);
    expect(body.data).toEqual([1, 2, 3]);
    expect(body.meta).toEqual({ total: 412, stats: { active: 266 } });
  });

  it("keeps the no-store directive when meta rides along (the S16 seam)", () => {
    const res = ok([], 200, { meta: { total: 0 } });
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("emits NO meta key when none is passed (the backward-compat pin)", async () => {
    const res = ok({ a: 1 });
    const body = (await res.json()) as Record<string, unknown>;
    expect("meta" in body).toBe(false);
    expect(body.data).toEqual({ a: 1 });
  });

  it("merges extra response headers with no-store (the fail() S15 mirror)", () => {
    const res = ok([], 200, { headers: { "X-Total-Count": "7" } });
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.headers.get("x-total-count")).toBe("7");
  });
});
