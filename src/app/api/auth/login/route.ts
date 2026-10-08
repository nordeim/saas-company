import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { authRateLimit, clientIpOf } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/validation";

/** POST /api/auth/login — sign in, sets the session cookie. */
export async function POST(request: Request) {
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
  if (!user || !verifyPassword(data.password, user.passwordHash)) {
    return fail("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  await setSessionCookie(user.id);
  return ok({ id: user.id, email: user.email, name: user.name });
}
