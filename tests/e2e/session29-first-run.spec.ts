import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";

/**
 * Session 29 R2 — the first-run boundary pins (the session_55/session_56
 * first suggested surface: the empty-to-FIRST workspace transition, the
 * 100.0% vacuous rate's expiry story, and the all-zero-runs chart floor).
 *
 * The Session-29 probe (:3251, db/probe-s29.db, gotcha-30) walked ONE user
 * live through the boundary shapes 0 rows → 1 row / 0 runs → 3 rows all
 * zero → one 500-run row and found the standing behavior COHERENT at
 * every shape (9/9 verdicts). These pins are the surviving memory of
 * that probe — the S25 survey law: the pin is what keeps a future
 * refactor honest at exactly the shapes the seeded demo workspace can
 * never exercise (the seeded 6 rows carry 7,120 nonzero runs; every
 * API-minted row carries runs: 0 — the boundary between them is the
 * first-run story).
 *
 * What each surface promises (adjudicated this session, documented in
 * docs/remediation-plan-session29.md so it is not re-litigated blind):
 *
 * - (a) The EMPTY-to-FIRST transition through the REAL UI compose (the
 *   production path — idea → Compose → generate → POST → refresh, no
 *   reload): the cards become 1/0/0/100.0%, the chart's "No data yet."
 *   expires exactly when data arrives, the list gains the article. The
 *   rate card reads 100.0% at 0 runs — the DOCUMENTED S21 null→100
 *   convention (vacuously true; the adjacent "Total runs 0" card
 *   carries the zero-truth within the stat-card grid itself).
 *
 * - (b) The ALL-ZERO chart (every charted row at runs 0): the
 *   Math.max(1, …) floor keeps the denominator off division-by-zero
 *   and every bar rides the 4% visibility floor UNIFORM — the top bar
 *   is NOT full-track here (the degenerate case of session26(c)'s
 *   nonzero invariant), and that is the HONEST encoding: all rows tie
 *   at zero, so equality is the truth; the "0" labels carry the value;
 *   full-width bars would falsely suggest maximal activity.
 *
 * - (c) The FIRST-RUN expiry: when a nonzero run lands, the top bar
 *   becomes the full track (100%), the zero bars stay at the floor
 *   (proportionality honest), and the rate card STILL reads 100.0% —
 *   now MEASURED (500 runs @ the seeded 100% rate), the convention
 *   expiring seamlessly into the measured story with no display flip.
 *
 * Workspace isolation (the Session-27/28 dedicated-user pattern): the
 * demo workspace is survivor-shaped by this point in the suite
 * (session23 deletes three seeded rows), and the boundary question
 * needs a workspace that starts EMPTY — the spec registers its OWN
 * unique user, builds the state through the real UI, and mints the one
 * nonzero row through a spec-scoped PrismaClient (the constructor
 * datasource override — the API cannot mint nonzero runs). The user is
 * cascade-deleted in an afterAll.
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts AFTER session28-tie-break.spec.ts and BEFORE
 * typography-parity.spec.ts. Three UI sign-ins + one API register =
 * four auth-bucket hits per run (the webServer's
 * AUTH_RATE_LIMIT_MAX=100 — the Session-28 raise).
 */

const E2E_BASE = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const EMAIL = `e2e-s29-first-${Date.now()}@example.com`;
const PASSWORD = "FirstRun1234!";

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${resolve("db/e2e.db")}` } },
});

async function register(): Promise<void> {
  const res = await fetch(`${E2E_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "First Run Probe", email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`register ${EMAIL} failed: ${res.status}`);
}

async function cleanup(): Promise<void> {
  // The cascade takes the composed workflows with it; the demo workspace
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

/** Compose one workflow through the REAL form (the production path). */
async function composeThroughUi(page: Page, idea: string): Promise<string> {
  const before = await page.locator('section[aria-label="Workflows"] article').count();
  await page.getByLabel("Workflow idea").fill(idea);
  await page.getByRole("button", { name: /^Compose$/ }).click();
  await expect
    .poll(async () => page.locator('section[aria-label="Workflows"] article').count(), { timeout: 25_000 })
    .toBe(before + 1);
  const name = await page.locator('section[aria-label="Workflows"] article h3').first().textContent();
  return (name || "").trim();
}

/** The chart's rendered bar percentages (bar width / track width × 100). */
async function barPcts(page: Page): Promise<number[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('section[aria-label="Runs by workflow"] ul > li')).map((li) => {
      const bar = li.querySelector("div.h-2 > div") as HTMLElement | null;
      const track = li.querySelector("div.h-2") as HTMLElement | null;
      if (!bar || !track) return -1;
      return (bar.getBoundingClientRect().width / track.getBoundingClientRect().width) * 100;
    }),
  );
}

/** A stat card's rendered value by its label text. */
async function statValue(page: Page, label: string): Promise<string> {
  const cards = page.locator('section[aria-label="Workspace stats"] > div');
  const n = await cards.count();
  for (let i = 0; i < n; i++) {
    if ((await cards.nth(i).locator(".text-xs").textContent())?.trim() === label) {
      return (await cards.nth(i).locator(".font-heading").textContent())?.trim() ?? "";
    }
  }
  return "";
}

test.describe.serial("the empty-to-first transition (Session 29 R2 — probed coherent, now pinned)", () => {
  test.beforeAll(async () => {
    await register();
  });

  test.afterAll(async () => {
    await cleanup();
  });

  test("(a) the FIRST row lands through the REAL compose — the vacuous rate's expiry story begins", async ({ page }) => {
    await signIn(page);
    const chart = page.getByRole("region", { name: "Runs by workflow" });

    // The starting boundary (this spec's OWN workspace): the empty state.
    await expect(chart.getByText("No data yet.")).toBeVisible();
    await expect(page.getByText("No workflows yet — compose your first one above.")).toBeVisible();
    await expect.poll(async () => statValue(page, "Active workflows")).toBe("0");

    // The compose — the production path (idea → Compose → generate →
    // POST → refresh; NO reload anywhere).
    await composeThroughUi(page, "First light boundary probe");

    // The cards become 1/0/0/100.0% — one active row, no runs yet, and
    // the rate card carrying the DOCUMENTED S21 null→100 convention
    // (vacuously true; "Total runs 0" carries the zero-truth adjacent).
    await expect.poll(async () => statValue(page, "Active workflows")).toBe("1");
    expect(await statValue(page, "Total runs")).toBe("0");
    expect(await statValue(page, "Hours saved")).toBe("0");
    expect(await statValue(page, "Success rate")).toBe("100.0%");

    // The chart's "No data yet." expires EXACTLY when data arrives: the
    // row renders (the 4% visibility floor bar + the honest "0" label).
    await expect(chart.getByText("No data yet.")).toBeHidden();
    await expect(chart.locator("li")).toHaveCount(1);
    await expect(chart.locator("li span").last()).toHaveText("0");
    const pcts = await barPcts(page);
    expect(pcts).toHaveLength(1);
    expect(pcts[0]).toBeGreaterThan(0);
    expect(pcts[0]).toBeLessThan(8); // the floor, never the full track

    // The list carries the row (the empty-list note expired with it).
    await expect(page.locator('section[aria-label="Workflows"] article')).toHaveCount(1);
    await expect(page.getByText("No workflows yet — compose your first one above.")).toBeHidden();
  });

  test("(b) the ALL-ZERO chart: uniform floor bars — the honest encoding for all-equal-zero data", async ({ page }) => {
    await signIn(page);
    await composeThroughUi(page, "Second wind boundary probe");
    await composeThroughUi(page, "Third rail boundary probe");

    const chart = page.getByRole("region", { name: "Runs by workflow" });
    await expect(chart.locator("li")).toHaveCount(3);

    // Every label reads the honest "0".
    const labels = await chart.locator("li span").allInnerTexts();
    expect(labels.filter((t) => t.trim() === "0")).toHaveLength(3);

    // Every bar rides the 4% visibility floor, UNIFORM — the degenerate
    // case of session26(c)'s "the top bar spans the full track" invariant
    // (which holds only for a nonzero charted max): all rows tie at
    // zero, so equality IS the honest rendering; full-width bars would
    // falsely suggest maximal activity (adjudicated Session 29).
    const pcts = await barPcts(page);
    expect(pcts).toHaveLength(3);
    for (const p of pcts) {
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThan(8);
    }
    expect(Math.abs(pcts[0] - pcts[1])).toBeLessThan(1);
    expect(Math.abs(pcts[1] - pcts[2])).toBeLessThan(1);

    // The stats stay coherent: three rows, still no runs, still no hours,
    // still the documented 100.0% convention.
    expect(await statValue(page, "Active workflows")).toBe("3");
    expect(await statValue(page, "Total runs")).toBe("0");
    expect(await statValue(page, "Success rate")).toBe("100.0%");
  });

  test("(c) the FIRST-RUN expiry: a nonzero run lands — the top bar becomes the full track and the rate becomes MEASURED", async ({ page }) => {
    // Mint the nonzero run out-of-band (the API cannot mint runs — the
    // session28 pattern): the FIRST composed row gets 500 runs at the
    // seeded 100% success rate.
    const user = await prisma.user.findUnique({ where: { email: EMAIL } });
    if (!user) throw new Error("dedicated user missing from e2e.db");
    const rows = await prisma.workflow.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    expect(rows.length).toBe(3);
    await prisma.workflow.update({ where: { id: rows[0].id }, data: { runs: 500 } });

    // A fresh sign-in (the out-of-band update is invisible to a live
    // client's state — the server-rendered paint carries the truth).
    await signIn(page);
    const chart = page.getByRole("region", { name: "Runs by workflow" });

    // The 500-run row charts FIRST at the FULL TRACK (100%) — the
    // invariant restored exactly when a nonzero max exists — while the
    // zero-run bars stay at the floor: proportionality honest.
    const pcts = await barPcts(page);
    expect(pcts).toHaveLength(3);
    expect(Math.abs(pcts[0] - 100)).toBeLessThan(1);
    for (const p of pcts.slice(1)) {
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThan(8);
    }

    // The rate card STILL reads 100.0% — now MEASURED (500 runs @ the
    // seeded 100% rate), the vacuous convention expiring seamlessly
    // into the measured story with no display flip; "Total runs 500"
    // names the measurement.
    expect(await statValue(page, "Total runs")).toBe("500");
    expect(await statValue(page, "Success rate")).toBe("100.0%");
  });
});
