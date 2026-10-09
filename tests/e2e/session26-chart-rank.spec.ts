import { expect, test, type Page } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 26 — the runs-chart RANKING suite (the S48 log's first
 * suggested surface, adjudicated: the heading's promise governs).
 *
 * The defect (probed RED on the probe-only server :3190 / db/probe-s26.db,
 * gotcha-30): the chart under the section heading "Runs by workflow"
 * charted the 8 most RECENT rows — mirroring the list — while its title
 * promised a runs ranking. With a 12-row workspace whose OLDEST row
 * carried 12,000 runs (13x the top displayed row), the chart rendered 8
 * stub bars (4%–7.5% of a max it never displayed) and the champion was
 * INVISIBLE. The bar-length encoding carried no information exactly when
 * a runs ranking is meaningful.
 *
 * The fix: the chart ranks BY RUNS (the server's meta.topRuns — honest at
 * any volume, the S21 stat-cards precedent extended to the ranking
 * surface; at >100 workflows the newest-100 list cap hides every old
 * high-run row, so the client-side computation alone CANNOT be honest —
 * the smoke suite's 111-row pin covers that layer). The note names the
 * criterion: "Showing the top 8 of {N} workflows by runs."
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts AFTER session25-chart.spec.ts — assert against whatever rows
 * survive, and mint surplus through the authenticated create API (in-page
 * fetch — gotcha 30: page.request refuses Secure cookies over plain http),
 * deleting every minted row afterwards (the session25-chart cleanup
 * pattern). API-created rows carry runs: 0 (the POST contract) — exactly
 * the "newer rows crowd the workspace" shape test (b) needs.
 */

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

async function createRow(page: Page, name: string): Promise<void> {
  const res = await page.evaluate(async (body) => {
    const r = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: r.ok, status: r.status };
  }, { name, description: "session26 chart rank pin row", category: "Ops" });
  expect(res.ok, `create "${name}" via the API (status ${res.status})`).toBe(true);
}

async function deleteRow(page: Page, name: string): Promise<void> {
  await page.evaluate(async (n) => {
    const list = await fetch("/api/workflows").then((r) => r.json());
    const row = Array.isArray(list?.data) ? list.data.find((w: { name: string }) => w.name === n) : null;
    if (row) await fetch(`/api/workflows/${row.id}`, { method: "DELETE" });
  }, name);
}

/** The visible articles' runs values ("N runs" in each card's stat line). */
async function articleRuns(page: Page): Promise<number[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('section[aria-label="Workflows"] article'))
      .map((a) => {
        const m = (a.textContent || "").match(/([\d,]+) runs/);
        return m ? Number(m[1].replace(/,/g, "")) : null;
      })
      .filter((n): n is number => n !== null),
  );
}

/** The chart rows' exact values (the label row's right-aligned number). */
async function chartValues(page: Page): Promise<number[]> {
  const texts = await page
    .getByRole("region", { name: "Runs by workflow" })
    .locator("li")
    .locator("span.flex-shrink-0")
    .allInnerTexts();
  return texts.map((t) => Number(t.replace(/,/g, "")));
}

test.describe("runs-chart ranking (Session 26 — the heading's promise governs)", () => {
  test("(a) the chart's first row is the TOP RUNNER, and the values are non-increasing", async ({ page }) => {
    await signIn(page);
    const section = page.getByRole("region", { name: "Runs by workflow" });
    await expect(section).toBeVisible();
    const articles = await articleRuns(page);
    expect(articles.length).toBeGreaterThan(0);
    const values = await chartValues(page);
    expect(values.length).toBeGreaterThan(0);
    // The chart's first value is the MAX among the visible articles —
    // the top runner charts first (RED pre-fix: the most RECENT row
    // charted first, whatever its runs).
    expect(values[0]).toBe(Math.max(...articles));
    // …and the chart's values are non-increasing (a ranking, not a slice
    // of the list's recency order).
    const nonIncreasing = values.every((v, i) => i === 0 || values[i - 1] >= v);
    expect(nonIncreasing, `chart values must be non-increasing, saw ${values.join(", ")}`).toBe(true);
  });

  test("(b) the champion stays visible when newer runs=0 rows crowd the workspace", async ({ page }) => {
    await signIn(page);
    const section = page.getByRole("region", { name: "Runs by workflow" });
    // The seeded/surviving articles with runs > 0 — the champions this
    // test must keep visible.
    const before = await page.evaluate(() =>
      Array.from(document.querySelectorAll('section[aria-label="Workflows"] article h3')).map(
        (h) => h.textContent?.trim() || "",
      ),
    );
    const runsBefore = await articleRuns(page);
    const champions = before.filter((_, i) => (runsBefore[i] ?? 0) > 0);
    expect(champions.length).toBeGreaterThan(0);

    // Mint enough runs=0 rows (the POST contract) that the workspace
    // exceeds 8 — the newest rows crowd the recency-ordered list's top.
    const surplus: string[] = [];
    try {
      const target = Math.max(10, before.length + 6);
      while (before.length + surplus.length < target) {
        const name = `S26 rank pin ${surplus.length + 1} ${Date.now()}`;
        surplus.push(name);
        await createRow(page, name);
      }
      await page.reload();
      await expect(page.getByRole("heading", { name: "Workflows" })).toBeVisible();

      // RED pre-fix: the chart showed the 8 most RECENT rows — the
      // minted runs=0 rows crowded every older champion out. Post-fix,
      // every runs>0 champion stays in the chart (they outrank the
      // runs=0 minted rows).
      const chartText = await section.innerText();
      for (const name of champions) {
        expect(chartText, `the champion "${name}" must stay visible in the chart`).toContain(name);
      }

      // …and the note names the ranking criterion with the TRUE total.
      const total = before.length + surplus.length;
      await expect(section.getByText(`Showing the top 8 of ${total} workflows by runs.`)).toBeVisible();
    } finally {
      for (const name of surplus) await deleteRow(page, name);
      await page.reload();
      await expect.poll(() => page.locator("article").count()).toBe(before.length);
    }
  });

  test("(c) the top bar spans the full track width — the charted max renders 100%", async ({ page }) => {
    await signIn(page);
    const section = page.getByRole("region", { name: "Runs by workflow" });
    const articles = await articleRuns(page);
    expect(articles.length).toBeGreaterThan(0);
    // Only meaningful when the top runner's runs > 0 (all-zero workspaces
    // have no bar to speak of — the floor owns that world).
    const maxRuns = Math.max(...articles);
    test.skip(maxRuns === 0, "an all-zero workspace has no ranking bar to pin");
    const firstBar = section.locator("li").first().locator(".h-2 > div");
    await expect(firstBar).toBeVisible();
    const style = (await firstBar.getAttribute("style")) || "";
    expect(style, `the top bar must render the full track (100%), saw style="${style}"`).toContain("100%");
  });

  test("(d) the note is absent while the whole workspace fits (no criterion note without truncation)", async ({ page }) => {
    await signIn(page);
    const section = page.getByRole("region", { name: "Runs by workflow" });
    const articles = await page.locator("article").count();
    test.skip(articles > 8, "the suite state exceeded 8 rows — the note is pinned in test (b)");
    await expect(section.getByText(/Showing the/)).toHaveCount(0);
  });
});
