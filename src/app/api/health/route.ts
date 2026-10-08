import { ok, apiRoute, methodGuard, optionsGuard } from "@/lib/api";
import { db } from "@/lib/db";
import { withTimeout } from "@/lib/workflow";

/** Session 20 F1: the method-mismatch layer answers the envelope too. */
export const POST = methodGuard("GET, HEAD, OPTIONS");
export const PUT = methodGuard("GET, HEAD, OPTIONS");
export const PATCH = methodGuard("GET, HEAD, OPTIONS");
export const DELETE = methodGuard("GET, HEAD, OPTIONS");
export const OPTIONS = optionsGuard("GET, HEAD, OPTIONS");

/**
 * Liveness + dependency probe.
 *
 * Session 18 F1: the probe must SEE the database. Pre-fix, this route
 * answered from the handler alone — a server whose SQLite file was
 * unreachable still reported `{"status":"ok"}` while every authenticated
 * API call failed with a bare 500, and the Docker HEALTHCHECK (which
 * polls this route) kept the broken container "healthy" forever. The
 * envelope now carries `db: "up" | "down"` from a `SELECT 1` raced
 * against a 1.5s timeout (the S15 `withTimeout` hang seam — the Docker
 * HEALTHCHECK allows 5s; a hung probe must not outlive it).
 *
 * The STATUS CODE stays 200 in both states BY DESIGN: a broken volume
 * database is not repaired by a container restart, so failing the Docker
 * healthcheck would only manufacture restart loops — `db: "down"` is the
 * operator's alerting signal instead (docs/DEPLOYMENT.md §8). The
 * existing contract surfaces (ok / status / app) are unchanged.
 */
export async function GET() {
  // Session 19 F1: uniform crash-path coverage (the handler's own probe
  // try/catch already resolves every failure — the wrapper is the
  // unconditional belt: nothing here can escape to a bare 500).
  return apiRoute(async () => {
  let dbState: "up" | "down" = "up";
  try {
    // Timeout resolves null (down); a rejection propagates to the catch
    // (down) — both failure classes land in the same honest field.
    const probe = await withTimeout(db.$queryRaw`SELECT 1`, 1_500, () => null);
    if (probe === null) dbState = "down";
  } catch {
    dbState = "down";
  }
  return ok({
    status: "ok",
    app: "saas-company",
    ts: new Date().toISOString(),
    db: dbState,
  });
  });
}
