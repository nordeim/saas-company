import { db } from "@/lib/db";
import { ok, fail, apiRoute, methodGuard, optionsGuard, bodyTooLarge } from "@/lib/api";
import { requireSession } from "@/lib/api";
import { cleanString, requiredString } from "@/lib/validation";
import { WORKFLOW_STATUSES, isWorkflowStatus, MAX_WORKFLOW_LIST, statsFromAggregate } from "@/lib/workflow";
import { workflowRateLimit } from "@/lib/rate-limit";

/** Session 20 F1: the method-mismatch layer answers the envelope too. */
export const PUT = methodGuard("GET, HEAD, OPTIONS, POST");
export const PATCH = methodGuard("GET, HEAD, OPTIONS, POST");
export const DELETE = methodGuard("GET, HEAD, OPTIONS, POST");
export const OPTIONS = optionsGuard("GET, HEAD, OPTIONS, POST");

/** GET /api/workflows — the signed-in user's workflows (newest first).
 *
 * Session 21 R1 — the list ceiling (the OUTPUT twin of the S20 request-
 * size ceiling): the fetch rides SQL `take: MAX_WORKFLOW_LIST` (the
 * wire-level cap — the response body itself is bounded, not just the
 * render), and the envelope carries `meta: { total, stats }` as an
 * additive sibling of the `data` array — the TRUE total and the honest
 * server-side aggregates, so a ceiling never turns the stat cards into
 * subset summaries. Pre-fix, a 400-workflow user's GET answered a
 * 134.5KB body and the dashboard mounted 400 article cards (9,649 DOM
 * nodes) — linear growth with no ceiling anywhere.
 */
export async function GET() {
  // Session 19 F1: the crash-path envelope.
  return apiRoute(async () => {
  const guard = await requireSession();
  if (!guard.user) return guard.response;

  const where = { userId: guard.user.id };
  const [workflows, total, active, agg] = await Promise.all([
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
  ]);
  const stats = statsFromAggregate(
    total,
    active,
    agg._sum.runs ?? 0,
    agg._sum.timeSavedHours ?? 0,
    agg._avg.successRate ?? null,
  );
  return ok(workflows, 200, { meta: { total, stats } });
  });
}

/** POST /api/workflows — create a workflow.
 *
 * Session 21 R2 — the creation-frequency ceiling: this was the ONLY
 * unthrottled mutation in the app (auth, newsletter, demo, and generate
 * all carry limiters). The guard runs AFTER the session check and
 * BEFORE the body parse (the generate route's ordering — any attempt
 * counts, valid or not); a 429 keeps the S15 contract (Retry-After) and
 * the client's existing failure-class contract surfaces it as the
 * composer's error banner.
 */
export async function POST(request: Request) {
  // Session 19 F1: the crash-path envelope.
  return apiRoute(async () => {
  const guard = await requireSession();
  if (!guard.user) return guard.response;

  const limit = workflowRateLimit(guard.user.id);
  if (!limit.allowed) {
    return fail(
      "RATE_LIMITED",
      `Too many workflows created. Try again in ${limit.retryAfterSec}s.`,
      429,
      { "Retry-After": String(limit.retryAfterSec) },
    );
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

  const name = requiredString(data.name, 120, "Name");
  if (!name.ok) return fail("VALIDATION", name.error, 400);

  const status = typeof data.status === "string" ? data.status : "active";
  if (!isWorkflowStatus(status)) {
    return fail("VALIDATION", `Status must be one of: ${WORKFLOW_STATUSES.join(", ")}.`, 400);
  }

  const workflow = await db.workflow.create({
    data: {
      userId: guard.user.id,
      name: name.value,
      description: cleanString(data.description, 500),
      status,
      category: cleanString(data.category, 40),
      runs: 0,
      successRate: 100,
      timeSavedHours: 0,
    },
  });
  return ok(workflow, 201);
  });
}
