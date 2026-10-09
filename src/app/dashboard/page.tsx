import { redirect } from "next/navigation";
import { sessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { DashboardUnavailable } from "@/components/dashboard/dashboard-unavailable";
import { routeMetadata } from "@/lib/seo";
import { MAX_WORKFLOW_LIST, CHART_ROWS, statsFromAggregate, type WorkflowStats, type RankedWorkflowRow } from "@/lib/workflow";

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

  // Session 21 R1 — the list ceiling (the OUTPUT twin of the S20
  // request-size ceiling): the page fetch rides SQL
  // `take: MAX_WORKFLOW_LIST` and the four stat cards move to
  // server-side aggregates, so the numbers are TRUE at any volume from
  // the first paint (a capped list without honest aggregates would
  // silently summarize the visible subset). The queries join the
  // EXISTING narrow try/catch — the S19 redirect-outside discipline.
  //
  // Session 26 R1 — the runs chart's RANKING aggregate joins the same
  // Promise.all: the chart titled "Runs by workflow" ranks BY RUNS
  // across the FULL workspace from the first paint. At >100 workflows
  // the capped `workflows` list hides every old high-run row from any
  // client-side computation — only the server can rank honestly (the
  // S21 stat-cards precedent, extended to the ranking surface).
  let workflows;
  let totalWorkflows = 0;
  let initialStats: WorkflowStats = { active: 0, runs: 0, hours: 0, avgSuccessRate: 100 };
  let initialTopRuns: RankedWorkflowRow[] = [];
  try {
    const where = { userId };
    const [rows, total, active, agg, topRuns] = await Promise.all([
      db.workflow.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        take: MAX_WORKFLOW_LIST,
      }),
      db.workflow.count({ where }),
      db.workflow.count({ where: { ...where, status: "active" } }),
      db.workflow.aggregate({
        where,
        _sum: { runs: true, timeSavedHours: true },
        _avg: { successRate: true },
      }),
      db.workflow.findMany({
        where,
        orderBy: [{ runs: "desc" }, { createdAt: "desc" }],
        take: CHART_ROWS,
        select: { id: true, name: true, runs: true },
      }),
    ]);
    workflows = rows;
    totalWorkflows = total;
    initialTopRuns = topRuns;
    initialStats = statsFromAggregate(
      total,
      active,
      agg._sum.runs ?? 0,
      agg._sum.timeSavedHours ?? 0,
      agg._avg.successRate ?? null,
    );
  } catch {
    return <DashboardUnavailable />;
  }

  return (
    <DashboardApp
      user={user}
      initialWorkflows={workflows}
      totalWorkflows={totalWorkflows}
      initialStats={initialStats}
      initialTopRuns={initialTopRuns}
    />
  );
}
