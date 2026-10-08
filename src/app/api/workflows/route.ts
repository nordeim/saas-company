import { db } from "@/lib/db";
import { ok, fail, apiRoute, methodGuard, optionsGuard, bodyTooLarge } from "@/lib/api";
import { requireSession } from "@/lib/api";
import { cleanString, requiredString } from "@/lib/validation";
import { WORKFLOW_STATUSES, isWorkflowStatus } from "@/lib/workflow";

/** Session 20 F1: the method-mismatch layer answers the envelope too. */
export const PUT = methodGuard("GET, HEAD, OPTIONS, POST");
export const PATCH = methodGuard("GET, HEAD, OPTIONS, POST");
export const DELETE = methodGuard("GET, HEAD, OPTIONS, POST");
export const OPTIONS = optionsGuard("GET, HEAD, OPTIONS, POST");

/** GET /api/workflows — the signed-in user's workflows (newest first). */
export async function GET() {
  // Session 19 F1: the crash-path envelope.
  return apiRoute(async () => {
  const guard = await requireSession();
  if (!guard.user) return guard.response;

  const workflows = await db.workflow.findMany({
    where: { userId: guard.user.id },
    orderBy: [{ createdAt: "desc" }],
  });
  return ok(workflows);
  });
}

/** POST /api/workflows — create a workflow. */
export async function POST(request: Request) {
  // Session 19 F1: the crash-path envelope.
  return apiRoute(async () => {
  const guard = await requireSession();
  if (!guard.user) return guard.response;

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
