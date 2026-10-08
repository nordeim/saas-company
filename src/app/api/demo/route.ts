import { db } from "@/lib/db";
import { ok, fail, apiRoute, methodGuard, optionsGuard, bodyTooLarge } from "@/lib/api";
import { clientIpOf, newsletterRateLimit } from "@/lib/rate-limit";
import { isValidEmail, cleanString, requiredString } from "@/lib/validation";

/** Session 20 F1: the method-mismatch layer answers the envelope too. */
export const GET = methodGuard("OPTIONS, POST");
export const HEAD = methodGuard("OPTIONS, POST");
export const PUT = methodGuard("OPTIONS, POST");
export const PATCH = methodGuard("OPTIONS, POST");
export const DELETE = methodGuard("OPTIONS, POST");
export const OPTIONS = optionsGuard("OPTIONS, POST");

/** POST /api/demo — "Book a Demo" / "Contact Sales" requests. */
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
  const data = (body ?? {}) as Record<string, unknown>;

  const name = requiredString(data.name, 80, "Name");
  if (!name.ok) return fail("VALIDATION", name.error, 400);
  if (!isValidEmail(data.email)) return fail("VALIDATION", "Enter a valid email address.", 400);

  const row = await db.demoRequest.create({
    data: {
      name: name.value,
      email: data.email.trim().toLowerCase(),
      company: cleanString(data.company, 120),
      plan: cleanString(data.plan, 40),
      message: cleanString(data.message, 2000),
    },
    select: { id: true },
  });

  return ok({ id: row.id, received: true }, 201);
  });
}
