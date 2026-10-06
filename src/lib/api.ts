import { NextResponse } from "next/server";
import { sessionUserId } from "./auth";
import { db } from "./db";

/**
 * Uniform API envelope: every route handler returns
 * `{ ok: true, data }` or `{ ok: false, error: { code, message } }`.
 */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}

export function fail(code: string, message: string, status: number) {
  return NextResponse.json(
    { ok: false as const, error: { code, message } },
    { status },
  );
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
