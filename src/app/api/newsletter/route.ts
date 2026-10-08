import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { newsletterRateLimit, clientIpOf } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/validation";

/** POST /api/newsletter — footer subscribe (idempotent upsert). */
export async function POST(request: Request) {
  const ip = clientIpOf(request.headers);
  const limit = newsletterRateLimit(ip);
  if (!limit.allowed) {
    return fail("RATE_LIMITED", "Too many attempts. Try again shortly.", 429, {
      "Retry-After": String(limit.retryAfterSec),
    });
  }

  let body: unknown;
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
}
