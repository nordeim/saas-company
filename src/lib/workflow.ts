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

/**
 * The SDK hang ceiling (Session-15 F3): ADR-004's "degrade, never fail"
 * covers SDK FAILURES but not SDK HANGS — a black-holed connection left
 * POST /api/workflows/generate blocked indefinitely with the composer's
 * busy guard engaged. A hang is a DEGRADE condition, not a failure: the
 * timer resolves with the fallback (the deterministic template) instead
 * of throwing, while a genuine rejection still propagates so the
 * caller's existing catch owns the failure class. The timer is cleared
 * on settle — no dangling handle holds the process.
 */
export const SDK_TIMEOUT_MS = 10_000;

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: () => T,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback()), ms);
  });
  try {
    return await Promise.race([promise, timedOut]);
  } finally {
    clearTimeout(timer);
  }
}
