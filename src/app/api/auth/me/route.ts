import { ok, apiRoute } from "@/lib/api";
import { sessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";

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
