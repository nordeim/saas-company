/** Workflow domain vocabulary + the AI workflow-description generator's
 * deterministic fallback (degrade-not-fail: the SDK may be unavailable). */

export const WORKFLOW_STATUSES = ["active", "paused", "draft"] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export function isWorkflowStatus(value: unknown): value is WorkflowStatus {
  return typeof value === "string" && (WORKFLOW_STATUSES as readonly string[]).includes(value);
}

/**
 * Session 21 R1 — the workflows list ceiling (the OUTPUT twin of the S20
 * request-size ceiling, D94). Probed: GET /api/workflows answered a
 * 134.5KB body for a 400-workflow user with no `take` anywhere, and the
 * dashboard mounted 400 article cards (9,649 DOM nodes). The capped
 * fetch rides SQL `take` (the wire-level fix), and the four stat cards
 * move to server-side aggregates so a ceiling never turns them into
 * subset summaries. 100 rows is two orders above the 6-row demo story —
 * the honest unpaginated ceiling for a personal workspace list.
 */
export const MAX_WORKFLOW_LIST = 100;

/** The stat-card shape rendered by the dashboard (the honest aggregate). */
export interface WorkflowStats {
  active: number;
  runs: number;
  hours: number;
  avgSuccessRate: number;
}

/**
 * Normalize a Prisma aggregate into the stat-card shape. Pure and
 * unit-tested; shared by the GET /api/workflows route and the dashboard
 * page (one definition, no drift between the two seams).
 *
 * - `hours` rounds to the integer the card renders.
 * - a null `_avg` (Prisma's answer for zero rows) maps to the 100 the
 *   client already displays for an empty workspace.
 */
export function statsFromAggregate(
  total: number,
  active: number,
  runs: number,
  hours: number,
  avgSuccessRate: number | null,
): WorkflowStats {
  return {
    active,
    runs,
    hours: Math.round(hours),
    avgSuccessRate: avgSuccessRate === null ? 100 : avgSuccessRate,
  };
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
