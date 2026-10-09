import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";

/**
 * Session 28 — the topRuns TIE-BREAK suite (the S53 log's first suggested
 * surface, adjudicated CORRECT by the probe — now gated).
 *
 * The probe (:3241, db/probe-s28.db) verified the tie-break contract at
 * every shape: `runs DESC, createdAt DESC` — "newest first among equals,
 * the list's own convention" — at the TOP of the ranking (the newer of
 * two 1,000-run rows charted first), at the CHART_ROWS boundary (the
 * newer of two 400-run rows charted at position 8, the older dropped),
 * on the wire (meta.topRuns carrying exactly the rendered order), and
 * under LIVE MUTATION (pause → refresh → resume: the tie order STABLE —
 * status does not participate in the ranking, by construction: PATCH
 * never writes runs or createdAt). The behavior was UNPINNED — the
 * seeded workspace holds six all-distinct runs values and every
 * API-minted row carries runs: 0, so no spec ever asserted the order
 * among equals. These pins are the surviving memory of the probe.
 *
 * Workspace isolation (the Session-27 register pattern): the tie shape
 * needs controlled `runs` AND controlled `createdAt` — the create API
 * hardcodes runs: 0, and the DEMO workspace is survivor-shaped by this
 * point in the suite (session23-honesty has deleted three seeded rows),
 * so the spec registers its OWN unique user (registered through the API
 * from the worker — no cookie needed for creation; each test signs in
 * through the UI) and mints a FULLY deterministic 10-row workspace for
 * that user through a spec-scoped PrismaClient (the constructor
 * datasource override — the absolute path, no CWD ambiguity; SQLite
 * handles the concurrent spec+server access with short transactions,
 * the smoke's own pattern). The user is deleted in an afterAll (the
 * schema's onDelete: Cascade takes the workflows with it — the demo
 * workspace is never touched).
 *
 * The workspace (10 rows): the champion (2,000) → the 777 tie cluster
 * (NEW t-2d / MID t-20d / OLD t-40d) → fillers 600 / 500 / 400 → the
 * boundary tie pair at 96 (NEW t-1d, OLD t-30d) → the 50-run tail.
 * Expected chart (top 8 by runs, ties newest-first): Champion, TieNEW,
 * TieMID, TieOLD, F600, F500, F400, BoundaryNEW — BoundaryOLD and F50
 * dropped, with the note "Showing the top 8 of 10 workflows by runs."
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts AFTER session27-stat-honesty.spec.ts and BEFORE
 * typography-parity.spec.ts. Three UI sign-ins + one API register = four
 * auth-bucket hits per run (the webServer's AUTH_RATE_LIMIT_MAX=100 —
 * the Session-28 raise: the suite's ~45 flows had outgrown the 50 pin).
 */

const E2E_BASE = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const TIE_EMAIL = `e2e-s28-tie-${Date.now()}@example.com`;
const TIE_PASSWORD = "TieBreak1234!";

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${resolve("db/e2e.db")}` } },
});

const DAY = 86_400_000;

/** Register the dedicated user through the API (no cookie needed — the
 * tests sign in through the UI afterwards) and mint the deterministic
 * 10-row tie workspace for that user. */
async function registerAndMint(): Promise<void> {
  const res = await fetch(`${E2E_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Tie Probe", email: TIE_EMAIL, password: TIE_PASSWORD }),
  });
  if (!res.ok) throw new Error(`register ${TIE_EMAIL} failed: ${res.status}`);
  const user = await prisma.user.findUnique({ where: { email: TIE_EMAIL } });
  if (!user) throw new Error("registered user missing from e2e.db");
  const now = Date.now();
  await prisma.workflow.createMany({
    data: [
      // the champion
      { userId: user.id, name: "S28 Champion", description: "session28 tie-break pin row", status: "active", category: "Ops", runs: 2000, successRate: 99, timeSavedHours: 1, createdAt: new Date(now - 25 * DAY) },
      // the 777 tie cluster: createdAt DESC is the tie-break (newest first)
      { userId: user.id, name: "S28 Tie OLD", description: "session28 tie-break pin row", status: "active", category: "Ops", runs: 777, successRate: 99, timeSavedHours: 1, createdAt: new Date(now - 40 * DAY) },
      { userId: user.id, name: "S28 Tie MID", description: "session28 tie-break pin row", status: "active", category: "Ops", runs: 777, successRate: 99, timeSavedHours: 1, createdAt: new Date(now - 20 * DAY) },
      { userId: user.id, name: "S28 Tie NEW", description: "session28 tie-break pin row", status: "active", category: "Ops", runs: 777, successRate: 99, timeSavedHours: 1, createdAt: new Date(now - 2 * DAY) },
      // the fillers between the cluster and the boundary pair
      { userId: user.id, name: "S28 Filler 600", description: "session28 tie-break pin row", status: "active", category: "Ops", runs: 600, successRate: 99, timeSavedHours: 1, createdAt: new Date(now - 15 * DAY) },
      { userId: user.id, name: "S28 Filler 500", description: "session28 tie-break pin row", status: "active", category: "Ops", runs: 500, successRate: 99, timeSavedHours: 1, createdAt: new Date(now - 12 * DAY) },
      { userId: user.id, name: "S28 Filler 400", description: "session28 tie-break pin row", status: "active", category: "Ops", runs: 400, successRate: 99, timeSavedHours: 1, createdAt: new Date(now - 10 * DAY) },
      // the boundary tie at runs 96: NEWER than its partner — the minted
      // NEW row must take the 8th chart slot, the OLD row drops
      { userId: user.id, name: "S28 Boundary OLD", description: "session28 tie-break pin row", status: "active", category: "Ops", runs: 96, successRate: 99, timeSavedHours: 1, createdAt: new Date(now - 30 * DAY) },
      { userId: user.id, name: "S28 Boundary NEW", description: "session28 tie-break pin row", status: "active", category: "Ops", runs: 96, successRate: 99, timeSavedHours: 1, createdAt: new Date(now - 1 * DAY) },
      // the below-boundary tail
      { userId: user.id, name: "S28 Filler 50", description: "session28 tie-break pin row", status: "active", category: "Ops", runs: 50, successRate: 99, timeSavedHours: 1, createdAt: new Date(now - 5 * DAY) },
    ],
  });
}

async function cleanup(): Promise<void> {
  // The cascade takes the minted workflows with it; the demo workspace
  // is never touched (deleteMany — a no-op when the run failed early).
  await prisma.user.deleteMany({ where: { email: TIE_EMAIL } });
  await prisma.$disconnect();
}

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(TIE_EMAIL);
  await page.getByLabel("Password").fill(TIE_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

/** The chart's rendered row names, in chart order. */
async function chartNames(page: Page): Promise<string[]> {
  return page
    .getByRole("region", { name: "Runs by workflow" })
    .locator("li")
    .locator("span.truncate")
    .allInnerTexts();
}

test.describe("the topRuns tie-break (Session 28 R2 — probed CORRECT, now pinned)", () => {
  test.beforeAll(async () => {
    await registerAndMint();
  });

  test.afterAll(async () => {
    await cleanup();
  });

  test("the tie cluster renders NEWEST-FIRST among equals (createdAt DESC — the list's own convention)", async ({ page }) => {
    await signIn(page);
    const names = await chartNames(page);
    // The champion first (2,000), then the 777 cluster in tie-break
    // order: NEW, MID, OLD — never a rowid or insertion order.
    expect(names[0]).toBe("S28 Champion");
    expect(names.slice(1, 4)).toEqual(["S28 Tie NEW", "S28 Tie MID", "S28 Tie OLD"]);
  });

  test("the boundary tie: the NEWER of two equal-runs rows takes the last chart slot, the older drops — with the honest note", async ({ page }) => {
    await signIn(page);
    const names = await chartNames(page);
    expect(names).toHaveLength(8);
    expect(names.slice(4, 7)).toEqual(["S28 Filler 600", "S28 Filler 500", "S28 Filler 400"]);
    // The 8th slot: the NEWER of the 96-run pair; the older and the
    // 50-run tail are dropped.
    expect(names[7]).toBe("S28 Boundary NEW");
    expect(names).not.toContain("S28 Boundary OLD");
    expect(names).not.toContain("S28 Filler 50");
    // The honest truncation note names the criterion and the TRUE total.
    await expect(
      page.getByRole("region", { name: "Runs by workflow" }).getByText("Showing the top 8 of 10 workflows by runs."),
    ).toBeVisible();
  });

  test("the tie-break SURVIVES a pause/resume refresh cycle (status does not participate in the ranking)", async ({ page }) => {
    await signIn(page);

    // Pause the newest tie row through the UI — the refresh() that
    // follows re-fetches meta.topRuns; the tie order must not move.
    await page.getByRole("button", { name: "Pause S28 Tie NEW" }).click();
    const afterPause = await chartNames(page);
    expect(afterPause.slice(1, 4)).toEqual(["S28 Tie NEW", "S28 Tie MID", "S28 Tie OLD"]);

    // Resume — same stability, the row back to active.
    await page.getByRole("button", { name: "Resume S28 Tie NEW" }).click();
    const afterResume = await chartNames(page);
    expect(afterResume.slice(1, 4)).toEqual(["S28 Tie NEW", "S28 Tie MID", "S28 Tie OLD"]);
  });
});
