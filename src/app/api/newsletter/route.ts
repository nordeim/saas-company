import { db } from "@/lib/db";
import { ok, fail, apiRoute, methodGuard, optionsGuard, bodyTooLarge } from "@/lib/api";
import { newsletterRateLimit, clientIpOf } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/validation";

/** Session 20 F1: the method-mismatch layer answers the envelope too. */
export const GET = methodGuard("OPTIONS, POST");
export const HEAD = methodGuard("OPTIONS, POST");
export const PUT = methodGuard("OPTIONS, POST");
export const PATCH = methodGuard("OPTIONS, POST");
export const DELETE = methodGuard("OPTIONS, POST");
export const OPTIONS = optionsGuard("OPTIONS, POST");

/** POST /api/newsletter — footer subscribe (idempotent upsert). */
export async function POST(request: Request) {
  // Session 19 F1: the crash-path envelope.
  return apiRoute(async () => {
  const ip = clientIpOf(request.headers);
  const limit = newsletterRateLimit(ip);
  if (!limit.allowed) {
    return fail("RATE_LIMITED", "Too many attempts. Try again shortly.", 429, {
      "Retry-After": String(limit.retryAfterSec),
    });
  }

  let body: unknown;
  // Session 20 F2: the request-size ceiling — read the DECLARED size
  // before any buffering (probed: a 50MB body was fully parsed pre-fix).
  const oversized = bodyTooLarge(request);
  if (oversized) return oversized;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Expected a JSON body.", 400);
  }
  const email = (body as Record<string, unknown>)?.email;
  if (!isValidEmail(email)) {
    return fail("VALIDATION", "Enter a valid email address.", 400);
  }

  await db.subscriber.upsert({
    where: { email: email.trim().toLowerCase() },
    update: {},
    create: { email: email.trim().toLowerCase(), source: "footer" },
  });

  return ok({ subscribed: true });
  });
}
