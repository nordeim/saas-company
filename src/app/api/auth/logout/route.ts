import { ok, apiRoute } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

/** POST /api/auth/logout — clear the session cookie. */
export async function POST() {
  // Session 19 F1: uniform crash-path coverage (the handler touches no
  // database — the wrapper is the unconditional belt).
  return apiRoute(async () => {
  await clearSessionCookie();
  return ok({ signedOut: true });
  });
}
