import { redirect } from "next/navigation";
import { sessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { DashboardUnavailable } from "@/components/dashboard/dashboard-unavailable";
import { routeMetadata } from "@/lib/seo";

// No live counterpart (the superset) — follow the app-wide per-route head
// pattern (Session 6 F5).
export const metadata = routeMetadata("Dashboard");
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await sessionUserId();
  if (!userId) redirect("/login?from_url=/dashboard");

  // Session 19 F2: the server-crash branded boundary. Pre-fix, a DB
  // failure here surfaced Next's minimal __next_error__ document — the
  // S13 branded-boundary goal never covered the SERVER half. Two NARROW
  // try/catch blocks, deliberately: `redirect()` throws a control error
  // internally (NEXT_REDIRECT) that a single wrapping try/catch would
  // SWALLOW — the S14 authenticated gate between the blocks must stay
  // OUTSIDE both catches. The status stays 200 (the page answered with
  // an honest degraded state; /api/health's db field owns the alerting).
  let user: { id: string; email: string; name: string } | null;
  try {
    user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
  } catch {
    return <DashboardUnavailable />;
  }
  if (!user) redirect("/login?from_url=/dashboard");

  let workflows;
  try {
    workflows = await db.workflow.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }],
    });
  } catch {
    return <DashboardUnavailable />;
  }

  return <DashboardApp user={user} initialWorkflows={workflows} />;
}
