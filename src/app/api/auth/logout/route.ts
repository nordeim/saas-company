import { ok } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

/** POST /api/auth/logout — clear the session cookie. */
export async function POST() {
  await clearSessionCookie();
  return ok({ signedOut: true });
}
