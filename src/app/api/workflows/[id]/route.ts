import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { requireSession } from "@/lib/api";
import { cleanString } from "@/lib/validation";
import { isWorkflowStatus } from "@/lib/workflow";

type Params = { params: Promise<{ id: string }> };

/** GET /api/workflows/[id] — one workflow (must belong to the caller). */
export async function GET(_request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.user) return guard.response;
  const { id } = await params;

  const workflow = await db.workflow.findFirst({
    where: { id, userId: guard.user.id },
  });
  if (!workflow) return fail("NOT_FOUND", "Workflow not found.", 404);
  return ok(workflow);
}

/** PATCH /api/workflows/[id] — update name/description/status/category. */
export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.user) return guard.response;
  const { id } = await params;

  const existing = await db.workflow.findFirst({
    where: { id, userId: guard.user.id },
    select: { id: true },
  });
  if (!existing) return fail("NOT_FOUND", "Workflow not found.", 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Expected a JSON body.", 400);
  }
  const data = (body ?? {}) as Record<string, unknown>;

  const patch: Record<string, string> = {};
  if ("name" in data) {
    const name = typeof data.name === "string" ? data.name.trim().slice(0, 120) : "";
    if (!name) return fail("VALIDATION", "Name cannot be empty.", 400);
    patch.name = name;
  }
  if ("description" in data) patch.description = cleanString(data.description, 500) ?? "";
  if ("category" in data) patch.category = cleanString(data.category, 40) ?? "";
  if ("status" in data) {
    if (!isWorkflowStatus(data.status)) return fail("VALIDATION", "Invalid status.", 400);
    patch.status = data.status;
  }

  const workflow = await db.workflow.update({ where: { id }, data: patch });
  return ok(workflow);
}

/** DELETE /api/workflows/[id] — remove a workflow. */
export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.user) return guard.response;
  const { id } = await params;

  const existing = await db.workflow.findFirst({
    where: { id, userId: guard.user.id },
    select: { id: true },
  });
  if (!existing) return fail("NOT_FOUND", "Workflow not found.", 404);

  await db.workflow.delete({ where: { id } });
  return ok({ deleted: true });
}
