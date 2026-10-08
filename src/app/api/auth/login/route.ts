import { db } from "@/lib/db";
import { ok, fail, apiRoute } from "@/lib/api";
import { setSessionCookie, verifyPassword, dummyPasswordHash } from "@/lib/auth";
import { authRateLimit, clientIpOf } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/validation";

/** POST /api/auth/login — sign in, sets the session cookie. */
export async function POST(request: Request) {
  // Session 19 F1: the crash-path envelope — whatever escapes the handler
  // (e.g. an unreachable database) answers the INTERNAL_ERROR envelope,
  // never a bare 500 with an empty body.
  return apiRoute(async () => {
  const ip = clientIpOf(request.headers);
  const limit = authRateLimit(ip);
  if (!limit.allowed) {
    return fail(
      "RATE_LIMITED",
      `Too many attempts. Try again in ${limit.retryAfterSec}s.`,
      429,
      { "Retry-After": String(limit.retryAfterSec) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Expected a JSON body.", 400);
  }
  const data = (body ?? {}) as Record<string, unknown>;
  if (!isValidEmail(data.email) || typeof data.password !== "string" || !data.password) {
    return fail("VALIDATION", "Email and password are required.", 400);
  }

  const user = await db.user.findUnique({ where: { email: data.email.trim().toLowerCase() } });
  // Session 17 F1 (CWE-208): burn the same scrypt cost on the unknown-email
  // path — the dummy hash keeps verifyPassword unconditional so response
  // latency cannot enumerate which addresses hold accounts (pre-fix the
  // unknown path short-circuited ~9.8x faster than the wrong-password path
  // behind an otherwise identical 401 envelope). The result never changes:
  // an unknown user can never match, a wrong password can never pass.
  const storedHash = user?.passwordHash ?? dummyPasswordHash();
  const passwordOk = verifyPassword(data.password, storedHash);
  if (!user || !passwordOk) {
    return fail("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  await setSessionCookie(user.id);
  return ok({ id: user.id, email: user.email, name: user.name });
  });
}
