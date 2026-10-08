import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { authRateLimit, clientIpOf } from "@/lib/rate-limit";
import { isValidEmail, isValidPassword, cleanString } from "@/lib/validation";

/** POST /api/auth/register — create an account (rate-limited). */
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

  if (!isValidEmail(data.email)) return fail("VALIDATION", "Enter a valid email address.", 400);
  const email = data.email.trim().toLowerCase();
  // The reference's sign-up card has NO name field (measured Session 5) —
  // name is optional and falls back to the email local-part (the smoke
  // suite's explicit-name calls keep working unchanged).
  const name = cleanString(data.name, 80) ?? (email.split("@")[0].slice(0, 80) || "New user");
  if (!isValidPassword(data.password)) {
    return fail("VALIDATION", "Password must be at least 8 characters.", 400);
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return fail("EMAIL_TAKEN", "An account with that email already exists.", 409);
  }

  const user = await db.user.create({
    data: { email, name, passwordHash: hashPassword(data.password) },
    select: { id: true, email: true, name: true },
  });

  // Sign the fresh account in immediately (sign-up lands in the workspace).
  await setSessionCookie(user.id);

  return ok(user, 201);
}
