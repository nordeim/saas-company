import { writeSync } from "node:fs";
import { NextResponse } from "next/server";
import { sessionUserId } from "./auth";
import { db } from "./db";

/**
 * Uniform API envelope: every route handler returns
 * `{ ok: true, data }` or `{ ok: false, error: { code, message } }`.
 * The optional `headers` argument carries response-level metadata —
 * the 429 sites use it for the machine-readable `Retry-After` signal
 * (Session-15 F4).
 *
 * Session 16 F2: every envelope response carries an explicit
 * `Cache-Control: private, no-store` — Next.js protects its dynamic
 * PAGES with no-store but NOT route-handler JSON, and authenticated
 * data must never transit a cache without an explicit directive
 * (RFC 9111 permits heuristic storage of unmarked 200s by any cache).
 * `no-store` forbids all storage; `private` additionally fences shared
 * caches — belt and braces at the single seam every response shares.
 *
 * Session 21 R1: `ok()` gains an optional opts object — `{ headers, meta }`.
 * `meta` lands as an additive TOP-LEVEL sibling of `data`
 * (`{ ok: true, data, meta }`) so a capped list can carry the TRUE total
 * and honest aggregates alongside the array (the output twin of the S20
 * request-size ceiling: the capped GET /api/workflows ships
 * `meta: { total, stats }`). Strictly optional: every consumer that
 * reads `data` — including the e2e route-fulfilled mocks with bare
 * arrays — is untouched; `ok(data)` alone emits NO meta key. The
 * headers half mirrors `fail()`'s S15 extension.
 */
const NO_STORE = "private, no-store";

export function ok<T>(
  data: T,
  status = 200,
  opts?: { headers?: Record<string, string>; meta?: Record<string, unknown> },
) {
  const body: Record<string, unknown> = { ok: true as const, data };
  if (opts?.meta) body.meta = opts.meta;
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": NO_STORE, ...opts?.headers },
  });
}

export function fail(
  code: string,
  message: string,
  status: number,
  headers?: Record<string, string>,
) {
  return NextResponse.json(
    { ok: false as const, error: { code, message } },
    { status, headers: { "Cache-Control": NO_STORE, ...headers } },
  );
}

/**
 * Session 19 F1 — the crash-path envelope. The invariant above was only
 * ever surveyed on HANDLED paths: probed with an unwritable DATABASE_URL,
 * seven endpoints answered a BARE 500 with an EMPTY body and NO
 * content-type. Whatever ESCAPES a handler is now formatted as the
 * INTERNAL_ERROR envelope (generic copy — internals never leak to
 * clients; the stack goes to the log only).
 *
 * The wrapper also RESTORES the operator's stack: Next.js only logs
 * UNhandled route errors, so catching the error would otherwise REMOVE
 * the Prisma stack from the server log. The write goes to file
 * descriptor 2 directly (`writeSync` from the STATIC node:fs import) —
 * the S18-proven seam: the Next.js 16 production runtime captures BOTH
 * `console.*` and `process.stderr.write` from bundled route code
 * (gotcha 32). Classification inside the handler is untouched (the S17
 * discipline): P2002 → 409, 400/401/403/404/429 — all fire first and
 * pass through verbatim; only what escapes reaches this catch.
 */
export function apiRoute(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  return handler().catch((err: unknown) => {
    const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
    try {
      writeSync(2, `[api:unhandled] ${detail}\n`);
    } catch {
      // Logging must never turn a handled crash into a second crash.
    }
    return fail("INTERNAL_ERROR", "Something went wrong on our side. Please try again.", 500);
  });
}

/**
 * Session 20 F1 — the method-mismatch envelope. The invariant above was
 * surveyed on handled paths (S15–S16) and crash paths (S19), but never on
 * the METHOD layer — the framework-owned answer for a request whose method
 * the route does not export sits BELOW every handler: probed, 11
 * method-mismatch requests answered a BARE 405 (empty body, no
 * content-type, no `Allow`, no `Cache-Control`). Route files now export a
 * guard for every unimplemented method so those requests too answer the
 * envelope — `methodGuard("<real methods>")()` returns the 405
 * METHOD_NOT_ALLOWED envelope with the RFC 9110 §15.4.6 `Allow` header
 * the bare framework answer never carried. The guards are module-level
 * consts: zero request-path cost for real traffic.
 */
export function methodGuard(allow: string): () => NextResponse {
  return () =>
    fail("METHOD_NOT_ALLOWED", "This endpoint does not accept that request method.", 405, {
      Allow: allow,
    });
}

/**
 * The explicit OPTIONS answer — Next.js auto-answers OPTIONS with 204 +
 * `Allow`, but the auto-answer enumerates the route file's EXPORTS (with
 * the method guards in place it would over-report). The guard keeps the
 * identical 204 shape, lists the route's REAL methods, and adds the
 * no-store directive every other API response already carries.
 */
export function optionsGuard(allow: string): () => NextResponse {
  return () =>
    new NextResponse(null, {
      status: 204,
      headers: { Allow: allow, "Cache-Control": NO_STORE },
    });
}

/**
 * Session 20 F2 — the request-size ceiling. Every POST/PATCH route
 * buffered the full request body into memory at `request.json()` with no
 * ceiling anywhere: probed, a 50MB login body was fully buffered and
 * JSON-parsed (314ms) before validation answered — while the largest real
 * payload in the app is < 2KB and the rate limits cap frequency, never
 * size. The guard reads the DECLARED `content-length` (an O(1) header
 * read — nothing is buffered) and answers 413 PAYLOAD_TOO_LARGE above
 * 128KB (60x the largest legitimate payload). A chunked body without a
 * declaration falls through to the existing parse path — the residual is
 * the proxy's to close (DEPLOYMENT.md §2, the belt-and-braces note).
 * Place the guard immediately BEFORE `request.json()` — exactly where the
 * memory is consumed; requests rejected earlier (rate limit, session
 * gate) never parse and never buffer.
 */
export const MAX_JSON_BODY_BYTES = 128 * 1024;

export function bodyTooLarge(request: Request): NextResponse | null {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_JSON_BODY_BYTES) {
    return fail("PAYLOAD_TOO_LARGE", "Request body is too large.", 413);
  }
  return null;
}

/**
 * Session guard for protected handlers: resolves the authenticated user or
 * returns a 401 envelope. Usage:
 *   const guard = await requireSession();
 *   if (!guard.user) return guard.response;
 */
export async function requireSession(): Promise<
  { user: { id: string; email: string; name: string }; response?: never }
  | { user?: never; response: NextResponse }
> {
  const userId = await sessionUserId();
  if (!userId) {
    return { response: fail("UNAUTHORIZED", "Sign in to continue.", 401) };
  }
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    return { response: fail("UNAUTHORIZED", "Session no longer valid.", 401) };
  }
  return { user };
}
