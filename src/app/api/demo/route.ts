import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { clientIpOf, newsletterRateLimit } from "@/lib/rate-limit";
import { isValidEmail, cleanString, requiredString } from "@/lib/validation";

/** POST /api/demo — "Book a Demo" / "Contact Sales" requests. */
export async function POST(request: Request) {
  const ip = clientIpOf(request.headers);
  const limit = newsletterRateLimit(ip);
  if (!limit.allowed) {
    return fail("RATE_LIMITED", "Too many attempts. Try again shortly.", 429);
  }

  let body: unknown;
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
}
