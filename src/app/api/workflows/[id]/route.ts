import { db } from "@/lib/db";
import { ok, fail, apiRoute, methodGuard, optionsGuard, bodyTooLarge } from "@/lib/api";
import { requireSession } from "@/lib/api";
import { cleanString, requiredString } from "@/lib/validation";
import { isWorkflowStatus } from "@/lib/workflow";

type Params = { params: Promise<{ id: string }> };

/** Session 20 F1: the method-mismatch layer answers the envelope too. */
export const POST = methodGuard("GET, HEAD, OPTIONS, PATCH, DELETE");
export const PUT = methodGuard("GET, HEAD, OPTIONS, PATCH, DELETE");
export const OPTIONS = optionsGuard("GET, HEAD, OPTIONS, PATCH, DELETE");

/** GET /api/workflows/[id] — one workflow (must belong to the caller). */
export async function GET(_request: Request, { params }: Params) {
  // Session 19 F1: the crash-path envelope.
  return apiRoute(async () => {
  const guard = await requireSession();
  if (!guard.user) return guard.response;
  const { id } = await params;

  const workflow = await db.workflow.findFirst({
    where: { id, userId: guard.user.id },
  });
  if (!workflow) return fail("NOT_FOUND", "Workflow not found.", 404);
  return ok(workflow);
  });
}

/** PATCH /api/workflows/[id] — update name/description/status/category.
 *
 * Session 22 F1 — the mutation-concurrency race (the UPDATE/DELETE twin
 * of S17's register race): the pre-fix route ran read-check-act
 * (findFirst → parse → update by bare id) with no P2025 classifier
 * anywhere. A DELETE committing while a slow PATCH body parsed threw
 * P2025 out of update() — the wrapper answered the 500 INTERNAL_ERROR
 * envelope for a legitimate two-tab user (probed 3/3). The write is now
 * OWNERSHIP-SCOPED and ATOMIC: updateMany({ where: { id, userId } }) is
 * the check itself (count 0 → the honest 404 the sequential miss always
 * answered) — updateMany never throws P2025, so the race is closed by
 * construction, not by catching its symptom.
 */
export async function PATCH(request: Request, { params }: Params) {
  // Session 19 F1: the crash-path envelope.
  return apiRoute(async () => {
  const guard = await requireSession();
  if (!guard.user) return guard.response;
  const { id } = await params;

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

  const patch: Record<string, string> = {};
  if ("name" in data) {
    // Session 11 F4: the SAME contract as POST (requiredString rejects
    // empty AND >120) — the pre-fix silent .slice(0, 120) truncation made
    // create-reject / update-truncate inconsistent for one field.
    const name = requiredString(data.name, 120, "Name");
    if (!name.ok) return fail("VALIDATION", name.error, 400);
    patch.name = name.value;
  }
  if ("description" in data) patch.description = cleanString(data.description, 500) ?? "";
  if ("category" in data) patch.category = cleanString(data.category, 40) ?? "";
  if ("status" in data) {
    if (!isWorkflowStatus(data.status)) return fail("VALIDATION", "Invalid status.", 400);
    patch.status = data.status;
  }

  // The empty patch keeps the long-standing 200 + row contract: a `{}`
  // body historically answered 200 with the row (update({data:{}})
  // returns it). Prisma's updateMany({data:{}}) is a no-op returning
  // count 0 EVEN FOR AN EXISTING ROW (probed) — it cannot distinguish
  // "no fields" from "no row", so the route reads directly.
  if (Object.keys(patch).length === 0) {
    const unchanged = await db.workflow.findFirst({
      where: { id, userId: guard.user.id },
    });
    if (!unchanged) return fail("NOT_FOUND", "Workflow not found.", 404);
    return ok(unchanged);
  }

  // Session 22 F1: the atomic ownership-scoped write — count 0 is the
  // honest 404 (row gone OR never the caller's); a row deleted between
  // this write and the follow-up read answers 404 too (honest for the
  // row's CURRENT state — the client refreshes and sees the truth).
  const result = await db.workflow.updateMany({
    where: { id, userId: guard.user.id },
    data: patch,
  });
  if (result.count === 0) return fail("NOT_FOUND", "Workflow not found.", 404);
  const workflow = await db.workflow.findFirst({
    where: { id, userId: guard.user.id },
  });
  if (!workflow) return fail("NOT_FOUND", "Workflow not found.", 404);
  return ok(workflow);
  });
}

/** DELETE /api/workflows/[id] — remove a workflow.
 *
 * Session 22 F1: the atomic ownership-scoped delete — deleteMany never
 * throws P2025, so the double-fire loser deterministically reads the
 * honest 404 (pre-fix: a coin-flip between 404 and the unclassified
 * P2025's 500 INTERNAL_ERROR — probed 2/5 on parallel double-fires).
 */
export async function DELETE(_request: Request, { params }: Params) {
  // Session 19 F1: the crash-path envelope.
  return apiRoute(async () => {
  const guard = await requireSession();
  if (!guard.user) return guard.response;
  const { id } = await params;

  const result = await db.workflow.deleteMany({
    where: { id, userId: guard.user.id },
  });
  if (result.count === 0) return fail("NOT_FOUND", "Workflow not found.", 404);
  return ok({ deleted: true });
  });
}
