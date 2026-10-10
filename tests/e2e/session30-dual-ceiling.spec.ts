import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";

/**
 * Session 30 R2 (D116) — the 100/101-row DUAL-CEILING boundary suite (the
 * session_58 S30 candidate: "the two ceilings' honesty side by side at
 * exactly 100/101 rows").
 *
 * The dashboard holds TWO independent caps at one surface:
 *   - the LIST cap (MAX_WORKFLOW_LIST = 100, newest first) whose honesty
 *     note renders only when `workflows.length < total` — at EXACTLY 100
 *     rows the workspace fits the cap and NO note renders;
 *   - the CHART cap (CHART_ROWS = 8, ranked by runs server-side) whose
 *     note renders whenever `total > 8`.
 * The seeded 6-row workspace hides BOTH ceilings (the S25 survey law:
 * probe every capped surface with data that EXCEEDS its cap — the 100-row
 * edge is the list cap's own boundary). Nothing pinned the two notes'
 * side-by-side behavior at exactly 100/101 rows until this suite.
 *
 * The workspace shape (a discriminating one): 100 rows at runs 10 /
 * rate 100 / hours 1 (the capped subset sums: 1,000 runs / 100 hours),
 * then the 101st minted as the OLDEST row at runs 500 / hours 5 — the
 * champion sits OUTSIDE the list cap (invisible to the list, FIRST in
 * the chart through the server-side topRuns, and its 500 runs must
 * appear in the stat cards: the full-workspace truth, never the capped
 * subset's 1,000).
 *
 * Workspace isolation (the Session-27/28 register pattern): the
 * dedicated user registered through the API, the rows minted through a
 * spec-scoped PrismaClient (the e2e webServer's WORKFLOW_RATE_LIMIT_MAX=50
 * forbids API-minting 100 rows), cascade-deleted in the afterAll.
 *
 * .serial (the Session-29 hardening): the tests share one minted
 * workspace and a worker restart would silently split it across fresh
 * users — fail-fast is the honest structure for state-sharing groups.
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts AFTER session29-jsonld.spec.ts and BEFORE
 * typography-parity.spec.ts. One API register + three UI sign-ins sit
 * far inside the webServer's AUTH_RATE_LIMIT_MAX=100 budget.
 */

const E2E_BASE = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const EMAIL = `e2e-s30-dual-${Date.now()}@example.com`;
const PASSWORD = "DualCeiling1234!";

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${resolve("db/e2e.db")}` } },
});

const HOUR = 3_600_000;
const DAY = 86_400_000;
/** The 101st row's name — the OLDEST, the 500-run champion OUTSIDE the cap. */
const OLDEST_NAME = "S30 Oldest 101st Champion";

async function registerAndMint100(): Promise<void> {
  const res = await fetch(`${E2E_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Dual Ceiling Probe", email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`register ${EMAIL} failed: ${res.status}`);
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error("registered user missing from e2e.db");
  const now = Date.now();
  // 100 rows, distinct createdAt (newest first), uniform volumetrics.
  await prisma.workflow.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      userId: user.id,
      name: `S30 Row ${String(i + 1).padStart(3, "0")}`,
      description: "session30 dual-ceiling pin row",
      status: "active",
      category: "Ops",
      runs: 10,
      successRate: 100,
      timeSavedHours: 1,
      createdAt: new Date(now - i * HOUR),
    })),
  });
}

/** Mint the 101st row as the OLDEST workspace member — the 500-run
 * champion that sits OUTSIDE the list cap (the ranking + aggregate truth
 * carrier). */
async function mintThe101st(): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error("dedicated user vanished mid-suite");
  await prisma.workflow.create({
    data: {
      userId: user.id,
      name: OLDEST_NAME,
      description: "session30 dual-ceiling pin row — the outside-the-cap champion",
      status: "active",
      category: "Ops",
      runs: 500,
      successRate: 100,
      timeSavedHours: 5,
      createdAt: new Date(Date.now() - 200 * DAY),
    },
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

test.describe.serial("the 100/101-row dual ceiling (Session 30 R2 — constructed-correct, now pinned)", () => {
  test.beforeAll(async () => {
    await registerAndMint100();
  });

  test.afterAll(async () => {
    await cleanup();
  });

  test("(a) at EXACTLY 100 rows the workspace fits the list cap: 100 articles, NO list note — while the chart's own note is present", async ({ page }) => {
    await signIn(page);

    // The list: the full 100 rows render (the cap holds them all).
    const articles = page.locator('section[aria-label="Workflows"] article');
    await expect(articles).toHaveCount(100, { timeout: 20_000 });

    // The list's honesty note does NOT render — `workflows.length <
    // total` is false at exactly 100/100 (the boundary this pin guards:
    // an off-by-one in the cap comparison surfaces here, never on the
    // seeded 6-row workspace).
    await expect(page.getByText(/most recent of \d+ workflows/)).toHaveCount(0);

    // The header counter reads the TRUE total (never the fetched length).
    await expect(page.getByText("100 total")).toBeVisible();

    // The CHART's own note IS present at the same surface — the two
    // ceilings live side by side with different thresholds (100 > 8).
    await expect(
      page.getByRole("region", { name: "Runs by workflow" }).getByText("Showing the top 8 of 100 workflows by runs."),
    ).toBeVisible();

    // The stat cards: the 100-row volumetrics.
    await expect(await statCardValue(page, 0)).toBe("100"); // active
    await expect(await statCardValue(page, 1)).toBe("1,000"); // runs
    await expect(await statCardValue(page, 2)).toBe("100"); // hours
  });

  test("(b) the 101st row: the list caps at 100 + the honest note, the OLDEST row invisible, the header reads the TRUE 101", async ({ page }) => {
    await mintThe101st();
    await signIn(page);

    // The out-of-band Prisma mint needs the fresh server paint (the S29
    // lesson) — the reload re-reads the envelope's meta.total.
    await page.reload();

    // The list: still 100 articles — the cap holds.
    const articles = page.locator('section[aria-label="Workflows"] article');
    await expect(articles).toHaveCount(100, { timeout: 20_000 });

    // The list's honesty note NOW renders — "the 100 most recent of 101".
    await expect(page.getByText("Showing the 100 most recent of 101 workflows.")).toBeVisible();

    // The OLDEST row (the 101st) is INVISIBLE in the list — the cap's
    // honesty at its own edge: the hidden row is named, never silently
    // vanished.
    const names = await page.locator('section[aria-label="Workflows"] article h3').allInnerTexts();
    expect(names).not.toContain(OLDEST_NAME);

    // The header counter: the TRUE total, not the fetched length.
    await expect(page.getByText("101 total")).toBeVisible();

    // The chart's note moved with the TRUE total too.
    await expect(
      page.getByRole("region", { name: "Runs by workflow" }).getByText("Showing the top 8 of 101 workflows by runs."),
    ).toBeVisible();
  });

  test("(c) the stats stay TRUE across the cap: the cards carry the FULL-workspace truth while the champion sits OUTSIDE the list", async ({ page }) => {
    await signIn(page);

    // The 500-run champion is OUTSIDE the list cap (invisible to the
    // list) yet FIRST in the chart — the server-side topRuns ranking
    // across the FULL workspace (the S26 meta aggregate; the e2e twin of
    // the smoke 111-row pin, at the exact 101 boundary).
    const names = await chartNames(page);
    expect(names[0]).toBe(OLDEST_NAME);
    expect(names).toHaveLength(8);

    // The stat cards carry the full-workspace truth — 1,500 runs
    // (1,000 in the capped subset + the champion's 500) and 105 hours
    // (100 + 5). A regression to subset-sums reads 1,000/100 here.
    await expect(await statCardValue(page, 1)).toBe("1,500");
    await expect(await statCardValue(page, 2)).toBe("105");
    await expect(await statCardValue(page, 0)).toBe("101");
    // The run-weighted rate: every row at 100 → 100.0% measured across
    // all 101 rows (1,500 runs, all successful).
    await expect(await statCardValue(page, 3)).toBe("100.0%");
  });
});
