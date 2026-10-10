import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";

/**
 * Session 31 R3 (D119) — the CHART_ROWS 8↔9 NOTE-TRANSITION boundary
 * suite (the session_60 S31 candidate: "the CHART_ROWS edge at exactly
 * 8/9 rows with a tie at the boundary — the S28 tie-break spec pins the
 * tie order but not the 8↔9 note transition itself").
 *
 * The chart's honesty note renders when `total > CHART_ROWS`:
 *   - at EXACTLY 8 rows NO note renders (`8 > 8` is false — an
 *     off-by-one in the comparison would surface HERE and nowhere else;
 *     the seeded 6-row workspace never reaches 8, the S28 workspace
 *     starts at 10);
 *   - at 9 the note reads "Showing the top 8 of 9 workflows by runs."
 *     — the transition point where the note FIRST appears.
 *
 * And with a TIE at the membership boundary (the 8th and 9th rows equal
 * on runs), the tie-break decides which row is charted and which is the
 * first-ever EXCLUDED row: `runs DESC, createdAt DESC` — the NEWER of
 * the tied pair keeps the seat (the S28 law, now pinned at the exact
 * membership edge).
 *
 * The two honesty contracts sit SIDE BY SIDE at the same 9-row
 * workspace: the chart's note is PRESENT (9 > 8) while the LIST's note
 * is ABSENT (9 < 100 — `workflows.length < total` is false; the list is
 * uncapped) — the S30 dual-ceiling suite's mirror image at the small
 * end.
 *
 * The workspace shape (a discriminating one): the champion (1,500,
 * t-25d) → a 300-run tie cluster (NEW t-2d / MID t-20d) → fillers 200 /
 * 150 / 120 / 100 → the boundary row (96 runs, t-1d). Test (b) mints
 * the 9th row ONTO the same workspace: 96 runs (TIED with the boundary
 * row), t-30d (OLDER) — the excluded row must be the OLDER one.
 *
 * Workspace isolation (the Session-27/28/30 register pattern): the
 * dedicated user registered through the API, the rows minted through a
 * spec-scoped PrismaClient (the e2e webServer's
 * WORKFLOW_RATE_LIMIT_MAX=50 discipline), cascade-deleted in the
 * afterAll.
 *
 * .serial (the Session-29 hardening): the tests share one minted
 * workspace (test (b) mints ONTO (a)'s rows) and a worker restart would
 * silently split it across fresh users — fail-fast is the honest
 * structure for state-sharing groups.
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts AFTER session31-head-parity.spec.ts and BEFORE
 * typography-parity.spec.ts. One API register + three UI sign-ins sit
 * far inside the webServer's AUTH_RATE_LIMIT_MAX=100 budget.
 */

const E2E_BASE = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const EMAIL = `e2e-s31-edge-${Date.now()}@example.com`;
const PASSWORD = "ChartEdge1234!";

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${resolve("db/e2e.db")}` } },
});

const DAY = 86_400_000;

/** The 9th row's name — TIED with the boundary row at 96 runs, OLDER. */
const BOUNDARY_OLD_NAME = "S31 Boundary OLD";

async function registerAndMint8(): Promise<void> {
  const res = await fetch(`${E2E_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Chart Edge Probe", email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`register ${EMAIL} failed: ${res.status}`);
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error("registered user missing from e2e.db");
  const now = Date.now();
  await prisma.workflow.createMany({
    data: [
      // the champion (full-track bar; 5 of the workspace's 12 hours)
      { userId: user.id, name: "S31 Champion", description: "session31 chart-edge pin row", status: "active", category: "Ops", runs: 1500, successRate: 100, timeSavedHours: 5, createdAt: new Date(now - 25 * DAY) },
      // the 300-run tie cluster within the cap (the S28 order law at a
      // new shape: NEW before MID among equals)
      { userId: user.id, name: "S31 Tie MID", description: "session31 chart-edge pin row", status: "active", category: "Ops", runs: 300, successRate: 100, timeSavedHours: 1, createdAt: new Date(now - 20 * DAY) },
      { userId: user.id, name: "S31 Tie NEW", description: "session31 chart-edge pin row", status: "active", category: "Ops", runs: 300, successRate: 100, timeSavedHours: 1, createdAt: new Date(now - 2 * DAY) },
      // the fillers
      { userId: user.id, name: "S31 Filler 200", description: "session31 chart-edge pin row", status: "active", category: "Ops", runs: 200, successRate: 100, timeSavedHours: 1, createdAt: new Date(now - 15 * DAY) },
      { userId: user.id, name: "S31 Filler 150", description: "session31 chart-edge pin row", status: "active", category: "Ops", runs: 150, successRate: 100, timeSavedHours: 1, createdAt: new Date(now - 12 * DAY) },
      { userId: user.id, name: "S31 Filler 120", description: "session31 chart-edge pin row", status: "active", category: "Ops", runs: 120, successRate: 100, timeSavedHours: 1, createdAt: new Date(now - 10 * DAY) },
      { userId: user.id, name: "S31 Filler 100", description: "session31 chart-edge pin row", status: "active", category: "Ops", runs: 100, successRate: 100, timeSavedHours: 1, createdAt: new Date(now - 8 * DAY) },
      // the boundary row: the 8th chart seat, the NEWER of the to-be-tied pair
      { userId: user.id, name: "S31 Boundary NEW", description: "session31 chart-edge pin row", status: "active", category: "Ops", runs: 96, successRate: 100, timeSavedHours: 1, createdAt: new Date(now - 1 * DAY) },
    ],
  });
}

/** Test (b)'s mint: the 9th row — TIED at 96 runs with the boundary row,
 * OLDER (t-30d): the tie-break must EXCLUDE this row, never the newer. */
async function mintThe9th(): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error("user missing before the 9th-row mint");
  await prisma.workflow.create({
    data: {
      userId: user.id,
      name: BOUNDARY_OLD_NAME,
      description: "session31 chart-edge pin row",
      status: "active",
      category: "Ops",
      runs: 96,
      successRate: 100,
      timeSavedHours: 1,
      createdAt: new Date(Date.now() - 30 * DAY),
    },
  });
}

async function cleanup(): Promise<void> {
  // The cascade takes the minted workflows with it; the demo workspace
  // is never touched (deleteMany — a no-op when the run failed early).
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.$disconnect();
}

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
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

async function statCardValue(page: Page, index: number): Promise<string> {
  return page
    .locator('section[aria-label="Workspace stats"] > div')
    .nth(index)
    .locator(".font-heading")
    .innerText();
}

test.describe.serial("the chart 8↔9 note transition (Session 31 R3 — constructed-correct, now pinned)", () => {
  test.beforeAll(async () => {
    await registerAndMint8();
  });

  test.afterAll(async () => {
    await cleanup();
  });

  test("(a) at EXACTLY 8 rows the chart fits the cap: ALL 8 charted, NO chart note — the list note absent, the header TRUE", async ({ page }) => {
    await signIn(page);

    // The chart: every row charted (the workspace fits CHART_ROWS), in
    // rank order — the champion, then the tie cluster NEW-before-MID,
    // then the fillers, then the boundary row.
    const names = await chartNames(page);
    expect(names).toHaveLength(8);
    expect(names).toEqual([
      "S31 Champion",
      "S31 Tie NEW",
      "S31 Tie MID",
      "S31 Filler 200",
      "S31 Filler 150",
      "S31 Filler 120",
      "S31 Filler 100",
      "S31 Boundary NEW",
    ]);

    // The chart's honesty note does NOT render — `total > CHART_ROWS`
    // is false at exactly 8/8 (the boundary this pin guards: an
    // off-by-one in the comparison surfaces here, never on the seeded
    // 6-row workspace).
    await expect(page.getByText(/Showing the top 8 of \d+ workflows/)).toHaveCount(0);

    // The LIST's note is absent too (8 < 100 — the list is uncapped).
    await expect(page.getByText(/most recent of \d+ workflows/)).toHaveCount(0);

    // The header counter reads the TRUE total.
    await expect(page.getByText("8 total")).toBeVisible();

    // The champion's bar is the full track (the max is displayed).
    const championBar = page
      .getByRole("region", { name: "Runs by workflow" })
      .locator("li")
      .first()
      .locator("div.h-2 > div");
    await expect(championBar).toHaveAttribute("style", /width:\s*100%/);
  });

  test("(b) the 9th row (TIED at the boundary, OLDER): the chart still 8 — the note APPEARS, the list note still ABSENT, the newer keeps the seat", async ({ page }) => {
    await mintThe9th();
    await signIn(page);

    // The chart: STILL exactly 8 rows, the same order — the OLDER of the
    // tied 96-run pair is the first-ever EXCLUDED row (createdAt DESC:
    // the newer keeps the seat; the S28 law at the exact membership edge).
    const names = await chartNames(page);
    expect(names).toHaveLength(8);
    expect(names[7]).toBe("S31 Boundary NEW");
    expect(names).not.toContain(BOUNDARY_OLD_NAME);

    // The chart's honesty note APPEARS at the transition point — 9 > 8.
    await expect(
      page.getByRole("region", { name: "Runs by workflow" }).getByText("Showing the top 8 of 9 workflows by runs."),
    ).toBeVisible();

    // The LIST's note is STILL ABSENT at the same workspace (9 < 100):
    // the two honesty contracts side by side — the S30 dual-ceiling
    // mirror image at the small end.
    await expect(page.getByText(/most recent of \d+ workflows/)).toHaveCount(0);

    // The list itself renders all 9 articles (the list cap is 100).
    await expect(page.locator('section[aria-label="Workflows"] article')).toHaveCount(9, { timeout: 20_000 });

    // The header counter reads the TRUE 9.
    await expect(page.getByText("9 total")).toBeVisible();

    // The champion's bar is still the full track across the transition.
    const championBar = page
      .getByRole("region", { name: "Runs by workflow" })
      .locator("li")
      .first()
      .locator("div.h-2 > div");
    await expect(championBar).toHaveAttribute("style", /width:\s*100%/);
  });

  test("(c) the stats carry the FULL-workspace truth across the cap (the excluded row's runs and hours still counted)", async ({ page }) => {
    await signIn(page);

    // 9 active; 2,862 total runs (1,500 + 300 + 300 + 200 + 150 + 120 +
    // 100 + 96 + 96 — the EXCLUDED row's 96 is counted; the charted
    // subset would read 2,766); 13 hours (5 + 8×1 — the excluded row's
    // hour is counted; the subset would read 12); the run-weighted rate
    // at all-100 rows is 100.0%.
    await expect(await statCardValue(page, 0)).toBe("9"); // active
    await expect(await statCardValue(page, 1)).toBe("2,862"); // runs
    await expect(await statCardValue(page, 2)).toBe("13"); // hours
    await expect(await statCardValue(page, 3)).toBe("100.0%"); // success rate
  });
});
