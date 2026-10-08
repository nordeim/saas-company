import { ok, apiRoute, methodGuard, optionsGuard } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

/** Session 20 F1: the method-mismatch layer answers the envelope too. */
export const GET = methodGuard("OPTIONS, POST");
export const HEAD = methodGuard("OPTIONS, POST");
export const PUT = methodGuard("OPTIONS, POST");
export const PATCH = methodGuard("OPTIONS, POST");
export const DELETE = methodGuard("OPTIONS, POST");
export const OPTIONS = optionsGuard("OPTIONS, POST");

/** POST /api/auth/logout — clear the session cookie. */
export async function POST() {
  // Session 19 F1: uniform crash-path coverage (the handler touches no
  // database — the wrapper is the unconditional belt).
  return apiRoute(async () => {
  await clearSessionCookie();
  return ok({ signedOut: true });
  });
}
