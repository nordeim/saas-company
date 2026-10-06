/** Workflow domain vocabulary + the AI workflow-description generator's
 * deterministic fallback (degrade-not-fail: the SDK may be unavailable). */

export const WORKFLOW_STATUSES = ["active", "paused", "draft"] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export function isWorkflowStatus(value: unknown): value is WorkflowStatus {
  return typeof value === "string" && (WORKFLOW_STATUSES as readonly string[]).includes(value);
}

export const WORKFLOW_CATEGORIES = [
  "Marketing",
  "Sales",
  "Engineering",
  "Ops",
  "Finance",
  "Support",
] as const;

export interface GeneratedWorkflow {
  name: string;
  description: string;
  category: string;
}

/**
 * Deterministic template generator — the fallback when the LLM SDK is
 * unavailable or returns malformed output. Pure and unit-tested.
 */
export function templateWorkflow(idea: string): GeneratedWorkflow {
  const clean = idea.trim().slice(0, 120);
  const lower = clean.toLowerCase();
  const category = WORKFLOW_CATEGORIES.find((c) => lower.includes(c.toLowerCase())) ?? "Ops";
  return {
    name: clean.charAt(0).toUpperCase() + clean.slice(1),
    description: `Automation pipeline for "${clean}" — connects your ${category.toLowerCase()} tools, runs on a schedule or trigger, flags anomalies, and reports outcomes to the dashboard.`,
    category,
  };
}

/** Clamp/sanitize an LLM-generated workflow before persisting. */
export function sanitizeGeneratedWorkflow(
  raw: unknown,
  idea: string,
): GeneratedWorkflow | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.trim().slice(0, 120) : "";
  const description = typeof r.description === "string" ? r.description.trim().slice(0, 500) : "";
  const category =
    typeof r.category === "string" &&
    (WORKFLOW_CATEGORIES as readonly string[]).includes(r.category)
      ? r.category
      : "Ops";
  if (!name || description.length < 10) return null;
  void idea;
  return { name, description, category };
}
