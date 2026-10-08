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
 */
const NO_STORE = "private, no-store";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, {
    status,
    headers: { "Cache-Control": NO_STORE },
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
