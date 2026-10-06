import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { requireSession } from "@/lib/api";
import { cleanString, requiredString } from "@/lib/validation";
import { WORKFLOW_STATUSES, isWorkflowStatus } from "@/lib/workflow";

/** GET /api/workflows — the signed-in user's workflows (newest first). */
export async function GET() {
  const guard = await requireSession();
  if (!guard.user) return guard.response;

  const workflows = await db.workflow.findMany({
    where: { userId: guard.user.id },
    orderBy: [{ createdAt: "desc" }],
  });
  return ok(workflows);
}

/** POST /api/workflows — create a workflow. */
export async function POST(request: Request) {
  const guard = await requireSession();
  if (!guard.user) return guard.response;

  let body: unknown;
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
}
