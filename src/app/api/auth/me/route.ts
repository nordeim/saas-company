import { ok } from "@/lib/api";
import { sessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";

/** GET /api/auth/me — current user or null. */
export async function GET() {
  const userId = await sessionUserId();
  if (!userId) return ok(null);
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  return ok(user);
}
