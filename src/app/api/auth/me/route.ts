import { ok, apiRoute, methodGuard, optionsGuard } from "@/lib/api";
import { sessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";

/** Session 20 F1: the method-mismatch layer answers the envelope too. */
export const POST = methodGuard("GET, HEAD, OPTIONS");
export const PUT = methodGuard("GET, HEAD, OPTIONS");
export const PATCH = methodGuard("GET, HEAD, OPTIONS");
export const DELETE = methodGuard("GET, HEAD, OPTIONS");
export const OPTIONS = optionsGuard("GET, HEAD, OPTIONS");

/** GET /api/auth/me — current user or null. */
export async function GET() {
  // Session 19 F1: the crash-path envelope (an unreachable database with
  // a valid session previously answered a bare 500 with an empty body).
  return apiRoute(async () => {
  const userId = await sessionUserId();
  if (!userId) return ok(null);
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  return ok(user);
  });
}
