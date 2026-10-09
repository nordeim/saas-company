import { expect, test, type Page } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 27 — the stat-honesty suite (the S50 log's second suggested
 * surface: the composed-vs-charted cross-surface consistency audit,
 * extended to the stat card's own semantics + the first-run story).
 *
 * The defect (probed RED on the probe-only server :3191 / db/probe-s27.db,
 * gotcha-30): the card labeled "Avg success rate" rendered the UNWEIGHTED
 * mean over workflows (Prisma's `_avg successRate`) — the
 * average-of-averages fallacy. With the extreme shape (1 row: 12,000 runs
 * @ 60% + 4 rows: 3 runs @ 100%) it displayed 92.0% while the workspace's
 * true (run-weighted) rate is 60.0% — a 32-point divergence displayed
 * directly beside "Total runs 12,012". Even the seeded workspace diverges
 * at the rendered decimal (the unweighted mean says 99.2%, the
 * run-weighted truth 99.3–99.5% depending on the survivors).
 *
 * The fix (D108): the card — now labeled "Success rate" (the S26
 * label-names-its-criterion law) — carries `Σ(runs × successRate) /
 * Σ(runs)` computed server-side (the S21 stat-cards precedent extended to
 * the weighting); the meta field renames `avgSuccessRate` → `successRate`
 * (name/value coherence on the wire contract).
 *
 * This suite also gates the FIRST-RUN story (the S50 third surface: the
 * empty-workspace boundary shapes — probed live at 0/1/8/9 rows, all
 * honest, none of it previously pinned) and the chart's CLIENT-refresh
 * path (the meta.topRuns consumption on compose/delete WITHOUT a reload —
 * session26-chart-rank pins the reload path only).
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): sorts
 * after session26-chart-rank.spec.ts — session23-honesty has already
 * deleted two seeded rows by then ("Onboarding email orchestration" and
 * "Content repurposing engine"), so every assertion derives its
 * expectations from whatever rows SURVIVE (the session24/26 discipline:
 * deltas and DOM-derived truths, never absolute seed counts).
 */

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

async function deleteRowByName(page: Page, name: string): Promise<void> {
  await page.evaluate(async (n) => {
    const list = await fetch("/api/workflows").then((r) => r.json());
    const row = Array.isArray(list?.data) ? list.data.find((w: { name: string }) => w.name === n) : null;
    if (row) await fetch(`/api/workflows/${row.id}`, { method: "DELETE" });
  }, name);
}

/** The chart region's row names (the ranked rows — no reload between reads). */
async function chartNames(page: Page): Promise<string[]> {
  return page
    .getByRole("region", { name: "Runs by workflow" })
    .locator("li span.truncate")
    .allInnerTexts();
}

/** Compose a workflow through the UI and answer its (AI/template-drafted) name. */
async function composeThroughUi(page: Page, idea: string): Promise<string> {
  const before = await page.locator('section[aria-label="Workflows"] article').count();
  await page.getByLabel("Workflow idea").fill(idea);
  await page.getByRole("button", { name: /^Compose$/ }).click();
  // The composer persists one new row (AI-named or template-named) — the
  // dashboard.spec count-delta pattern (never a >0 poll: seeded rows
  // always exist).
  await expect
    .poll(async () => page.locator('section[aria-label="Workflows"] article').count(), { timeout: 25_000 })
    .toBe(before + 1);
  // The newest row's name (the list is newest-first).
  const name = await page.locator('section[aria-label="Workflows"] article h3').first().textContent();
  return (name || "").trim();
}

test.describe("stat honesty (Session 27 — the run-weighted success rate)", () => {
  test("(a) the empty-workspace boundary: a brand-new user's three surfaces render their first-run states", async ({ page }) => {
    // Register a unique user through the page (gotcha-30: in-page fetch),
    // then navigate DIRECTLY to /dashboard (the D74 authenticated gate
    // would redirect a /login visit).
    const email = `e2e-s27-${Date.now()}@example.com`;
    await page.goto("/login");
    const res = await page.evaluate(async (body) => {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return { ok: r.ok, status: r.status };
    }, { email, password: "Boundary1234!" });
    expect(res.ok, `register ${email} (status ${res.status})`).toBe(true);
    await page.goto("/dashboard");

    // The chart's empty state.
    await expect(
      page.getByRole("region", { name: "Runs by workflow" }).getByText("No data yet."),
    ).toBeVisible();

    // The list's empty state.
    await expect(
      page.getByText("No workflows yet — compose your first one above."),
    ).toBeVisible();

    // The stat cards: 0 / 0 / 0 / 100.0% — with the honest label.
    const cards = page.locator('section[aria-label="Workspace stats"] > div');
    await expect(cards).toHaveCount(4);
    await expect(cards.nth(0).locator(".text-xs")).toHaveText("Active workflows");
    await expect(cards.nth(0).locator(".font-heading")).toHaveText("0");
    await expect(cards.nth(1).locator(".text-xs")).toHaveText("Total runs");
    await expect(cards.nth(1).locator(".font-heading")).toHaveText("0");
    await expect(cards.nth(2).locator(".text-xs")).toHaveText("Hours saved");
    await expect(cards.nth(2).locator(".font-heading")).toHaveText("0");
    // RED pre-fix: the label reads "Avg success rate".
    await expect(cards.nth(3).locator(".text-xs")).toHaveText("Success rate");
    await expect(cards.nth(3).locator(".font-heading")).toHaveText("100.0%");
  });

  test("(b) the rendered rate is the run-weighted truth (the wire, the card, and the DOM rows agree)", async ({ page }) => {
    await signIn(page);
    await page.getByRole("heading", { name: "Workflows" }).waitFor();

    // The wire truth: the API envelope's meta.stats.successRate.
    const metaRate = await page.evaluate(async () => {
      const payload = await fetch("/api/workflows").then((r) => r.json());
      return payload?.meta?.stats?.successRate;
    });
    // RED pre-fix: the field is avgSuccessRate — undefined here.
    expect(typeof metaRate, "meta.stats.successRate is a number").toBe("number");

    // The card renders exactly that value at one decimal, with the
    // criterion-naming label.
    const card = page.locator('section[aria-label="Workspace stats"] > div').nth(3);
    // RED pre-fix: "Avg success rate".
    await expect(card.locator(".text-xs")).toHaveText("Success rate");
    // RED pre-fix: the unweighted mean (e.g. 99.2% on the survivors).
    await expect(card.locator(".font-heading")).toHaveText(`${(metaRate as number).toFixed(1)}%`);

    // The discrimination: the run-weighted truth differs from the
    // unweighted mean over the SAME visible rows — this suite's own
    // guarantee that the pin still pins the weighting (the S17
    // timing-ratio meta-assertion pattern).
    const dom = await page.evaluate(() =>
      Array.from(document.querySelectorAll('section[aria-label="Workflows"] article')).map((a) => {
        const t = a.textContent || "";
        const runs = Number((t.match(/([\d,]+) runs/) || [])[1]?.replace(/,/g, "") || 0);
        const rate = Number((t.match(/([\d.]+)% success/) || [])[1] || 0);
        return { runs, rate };
      }),
    );
    expect(dom.length).toBeGreaterThan(0);
    const totalRuns = dom.reduce((n, r) => n + r.runs, 0);
    expect(totalRuns).toBeGreaterThan(0);
    const weighted = dom.reduce((n, r) => n + r.runs * r.rate, 0) / totalRuns;
    const unweighted = dom.reduce((n, r) => n + r.rate, 0) / dom.length;
    expect(card.locator(".font-heading")).toHaveText(`${weighted.toFixed(1)}%`);
    expect(
      weighted.toFixed(1) !== unweighted.toFixed(1),
      `the shape discriminates: weighted ${weighted.toFixed(1)}% vs unweighted ${unweighted.toFixed(1)}%`,
    ).toBe(true);
  });

  test("(c) a UI compose updates the chart WITHOUT a reload (the client meta.topRuns consumption path)", async ({ page }) => {
    await signIn(page);
    const chart = page.getByRole("region", { name: "Runs by workflow" });
    await expect(chart).toBeVisible();
    const before = await chart.locator("li").count();

    const idea = `Session 27 chart refresh probe ${Date.now()}`;
    let composed = "";
    try {
      composed = await composeThroughUi(page, idea);
      expect(composed.length).toBeGreaterThan(0);
      // No page.reload() anywhere: the chart must gain the row through
      // refresh()'s meta.topRuns consumption (the unpinned path).
      await expect
        .poll(async () => (await chartNames(page)).includes(composed), { timeout: 10_000 })
        .toBe(true);
      await expect(chart.locator("li")).toHaveCount(before + 1);
    } finally {
      if (composed) await deleteRowByName(page, composed);
    }
  });

  test("(d) a UI delete drops the row from the chart WITHOUT a reload", async ({ page }) => {
    await signIn(page);
    const chart = page.getByRole("region", { name: "Runs by workflow" });
    await expect(chart).toBeVisible();
    const before = await chart.locator("li").count();

    const idea = `Session 27 chart drop probe ${Date.now()}`;
    let composed = "";
    try {
      composed = await composeThroughUi(page, idea);
      expect(composed.length).toBeGreaterThan(0);
      await expect
        .poll(async () => (await chartNames(page)).includes(composed), { timeout: 10_000 })
        .toBe(true);

      // Delete it through the UI — the chart must drop the row on the
      // client refresh path.
      await page.getByRole("button", { name: `Delete ${composed}` }).click();
      await expect
        .poll(async () => (await chartNames(page)).includes(composed), { timeout: 10_000 })
        .toBe(false);
      await expect(chart.locator("li")).toHaveCount(before);
    } finally {
      if (composed) await deleteRowByName(page, composed);
    }
  });
});
