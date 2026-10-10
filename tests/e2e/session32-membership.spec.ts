import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";

/**
 * Session 32 R6 (D123) — the 108-row chart/list MEMBERSHIP-DISAGREEMENT
 * suite (the session_62 S32 candidate: "a 100-row workspace where the
 * chart's topRuns and the list's newest-100 DISAGREE on membership").
 *
 * The dashboard holds TWO independent windows over ONE workspace:
 *   - the LIST (newest-100 by createdAt, MAX_WORKFLOW_LIST) and
 *   - the CHART (top-8 by runs across the FULL workspace, the
 *     server-side meta.topRuns aggregate — CHART_ROWS).
 * The S30 dual-ceiling suite pinned the 101-row shape: ONE excluded row
 * (the oldest 500-run champion) — invisible in the list yet first in
 * the chart. This suite takes the shape to its extreme: at 108 rows
 * with the 8 highest-run members ALL sitting outside the newest-100,
 * the chart and the list share ZERO members — the two surfaces render
 * completely different workspaces at one URL, each honest about its own
 * criterion ("the 100 most recent" vs "the top 8 by runs"). The
 * behavior is correct by construction (the S26 server-side ranking +
 * the S21 list ceiling + the two notes) — UNPINNED at this shape.
 *
 * The workspace shape (a discriminating one): 100 recent rows at runs
 * 10 / rate 100 / hours 1 (createdAt spaced 1h — the newest 100), plus
 * 8 OLD rows at runs 570/560/550/540/530/520/510/500 / hours 5 /
 * createdAt 200+ days back — ALL outside the newest-100. The stats
 * carry the FULL-workspace truth: 5,280 runs (100×10 + the old rows'
 * 4,280) and 140 hours (100 + 8×5) — the capped subset would read
 * 1,000/100.
 *
 * Workspace isolation (the Session-27/28/30/31 register pattern): the
 * dedicated user registered through the API, the rows minted through a
 * spec-scoped PrismaClient (the e2e webServer's
 * WORKFLOW_RATE_LIMIT_MAX=50 forbids API-minting 108 rows),
 * cascade-deleted in the afterAll.
 *
 * .serial (the Session-29 hardening): the tests share one minted
 * workspace and a worker restart would silently split it across fresh
 * users — fail-fast is the honest structure for state-sharing groups.
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts AFTER session32-head-parity.spec.ts and BEFORE
 * typography-parity.spec.ts. One API register + two UI sign-ins sit far
 * inside the webServer's AUTH_RATE_LIMIT_MAX=100 budget.
 */

const E2E_BASE = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const EMAIL = `e2e-s32-member-${Date.now()}@example.com`;
const PASSWORD = "Membership1234!";

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${resolve("db/e2e.db")}` } },
});

const HOUR = 3_600_000;
const DAY = 86_400_000;
/** The 8 old high-run members: runs 570 down to 500, hours 5 each. */
const OLD_RUNS = [570, 560, 550, 540, 530, 520, 510, 500];
const OLD_PREFIX = "S32 Old Member";

async function registerAndMint108(): Promise<void> {
  const res = await fetch(`${E2E_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Membership Probe", email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`register ${EMAIL} failed: ${res.status}`);
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error("registered user missing from e2e.db");
  const now = Date.now();
  // The 100 recent rows: distinct createdAt (1h apart), uniform
  // volumetrics — the list's own membership.
  await prisma.workflow.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      userId: user.id,
      name: `S32 Recent ${String(i + 1).padStart(3, "0")}`,
      description: "session32 membership-disagreement pin row",
      status: "active",
      category: "Ops",
      runs: 10,
      successRate: 100,
      timeSavedHours: 1,
      createdAt: new Date(now - i * HOUR),
    })),
  });
  // The 8 old high-run members: ALL outside the newest-100, ALL above
  // every recent row's runs — the chart's own membership.
  await prisma.workflow.createMany({
    data: OLD_RUNS.map((runs, i) => ({
      userId: user.id,
      name: `${OLD_PREFIX} ${runs}`,
      description: "session32 membership-disagreement pin row — the outside-the-list chart member",
      status: "active",
      category: "Ops",
      runs,
      successRate: 100,
      timeSavedHours: 5,
      createdAt: new Date(now - (200 + i) * DAY),
    })),
  });
}

async function cleanup(): Promise<void> {
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

async function statCardValue(page: Page, index: number): Promise<string> {
  return page
    .locator('section[aria-label="Workspace stats"] > div')
    .nth(index)
    .locator(".font-heading")
    .innerText();
}

async function chartNames(page: Page): Promise<string[]> {
  return page
    .getByRole("region", { name: "Runs by workflow" })
    .locator("li")
    .locator("span.truncate")
    .allInnerTexts();
}

test.describe.serial("the 108-row chart/list membership disagreement (Session 32 R6 — constructed-correct, now pinned)", () => {
  test.beforeAll(async () => {
    await registerAndMint108();
  });

  test.afterAll(async () => {
    await cleanup();
  });

  test("(a) the two windows share ZERO members: the list's newest-100 and the chart's top-8-by-runs disagree completely, each honest about its criterion", async ({ page }) => {
    await signIn(page);
    await page.reload(); // the out-of-band Prisma mint needs the fresh server paint

    // The header reads the TRUE total (never the fetched length).
    await expect(page.getByText("108 total")).toBeVisible();

    // The LIST: the newest 100 — the 8 old members are ALL invisible.
    const articles = page.locator('section[aria-label="Workflows"] article');
    await expect(articles).toHaveCount(100, { timeout: 20_000 });
    const listNames = await page.locator('section[aria-label="Workflows"] article h3').allInnerTexts();
    expect(listNames).toHaveLength(100);
    for (const name of listNames) expect(name.startsWith(OLD_PREFIX)).toBe(false);

    // The list's honesty note names its own criterion + the TRUE total.
    await expect(page.getByText("Showing the 100 most recent of 108 workflows.")).toBeVisible();

    // The CHART: the top 8 by runs — the 8 OLD members, in
    // runs-descending order (NONE of them visible in the list).
    const names = await chartNames(page);
    expect(names).toHaveLength(8);
    expect(names).toEqual(OLD_RUNS.map((runs) => `${OLD_PREFIX} ${runs}`));

    // THE MEMBERSHIP DISAGREEMENT: chart ∩ list = ∅ at one URL.
    const chartSet = new Set(names);
    const shared = listNames.filter((n) => chartSet.has(n));
    expect(shared).toHaveLength(0);

    // The chart's honesty note names ITS own criterion at the same
    // surface (the two notes side by side, each true).
    await expect(
      page.getByRole("region", { name: "Runs by workflow" }).getByText("Showing the top 8 of 108 workflows by runs."),
    ).toBeVisible();

    // The champion's bar spans the full track (the charted max — the
    // 570-run member, invisible to the list). The S31 locator pattern:
    // the inline style carries the percentage, not the computed width.
    const championBar = page
      .getByRole("region", { name: "Runs by workflow" })
      .locator("li")
      .first()
      .locator("div.h-2 > div");
    await expect(championBar).toHaveAttribute("style", /width:\s*100%/);
  });

  test("(b) the stats carry the FULL-workspace truth across the disagreement: 5,280 runs / 140 hours — never the capped subset's 1,000/100", async ({ page }) => {
    await signIn(page);

    // 100×10 + (570+560+550+540+530+520+510+500) = 1,000 + 4,280.
    await expect(await statCardValue(page, 1)).toBe("5,280");
    // 100×1 + 8×5 = 140 (the subset would read 100).
    await expect(await statCardValue(page, 2)).toBe("140");
    // All 108 rows active.
    await expect(await statCardValue(page, 0)).toBe("108");
    // Every row at 100% — the run-weighted rate over all 5,000 runs.
    await expect(await statCardValue(page, 3)).toBe("100.0%");
  });

  test("(c) the ranking is SERVER-honest at the disagreement shape: a client-side ranking over the capped list would chart the 10-run recent rows instead", async ({ page }) => {
    await signIn(page);

    const names = await chartNames(page);
    // Every charted name is one of the 8 old members — the
    // meta.topRuns aggregate across the FULL workspace. A regression
    // to a client-side rankByRuns(workflows) would chart 8 of the
    // 100 recent rows (the only rows the capped list carries).
    const oldSet = new Set(OLD_RUNS.map((runs) => `${OLD_PREFIX} ${runs}`));
    for (const name of names) expect(oldSet.has(name)).toBe(true);

    // Non-increasing runs down the chart (the ranking order).
    expect(names).toEqual(OLD_RUNS.map((runs) => `${OLD_PREFIX} ${runs}`));

    // And a live refresh keeps the ranking (the meta.topRuns
    // client-consumption path — no reload needed after a re-fetch).
    await page.reload();
    await page.waitForTimeout(800);
    const reloaded = await chartNames(page);
    expect(reloaded).toEqual(names);
  });
});
