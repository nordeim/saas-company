import { expect, test, type Page } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 25 — the runs-chart honesty + semantics suite (the S46 log's
 * a11y deep-dive surface, extended to its class):
 *
 *  F1 — the chart truncation lie. The chart renders slice(0, 8) — with
 *  more than 8 workflows it silently dropped rows with NO note (the
 *  section heading "Runs by workflow" implies the workspace). The
 *  workflow LIST received its honest truncation note in Session 21 R1
 *  precisely because "a ceiling that lies is worse than no ceiling";
 *  the chart's own ceiling never got the same honesty. The fix: the
 *  same S21-pattern note with the TRUE server-side total.
 *
 *  Session 26 R1 update: the chart now RANKS BY RUNS (the heading's
 *  promise governs — the note names the criterion: "Showing the top 8
 *  of {N} workflows by runs."; the ranking pins live in
 *  session26-chart-rank.spec.ts). This spec keeps owning the CEILING
 *  contract: the cap, the note's presence, and the list semantics.
 *
 *  F3 — the chart's missing list semantics. The rows were div soup —
 *  a screen reader never announced "list, 8 items". The fix: a semantic
 *  ul/li (preflight resets the styling — visually identical).
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts AFTER session24-temporal.spec.ts — at that point the DB
 * carries the session23-honesty deletions, so the ≤8 test asserts
 * against whatever rows survive (no hardcoded seed count), and the >8
 * test CREATES its own surplus through the authenticated create API
 * (in-page fetch — gotcha 30: page.request refuses Secure cookies over
 * plain http) and DELETES every row it created afterwards (the
 * composer-cleanup pattern).
 */

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

async function createRow(page: Page, name: string): Promise<void> {
  // gotcha 30: authenticated API probing goes through in-page fetches
  // after a navigation (page.request drops Secure cookies on plain http).
  const res = await page.evaluate(async (body) => {
    const r = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: r.ok, status: r.status };
  }, { name, description: "session25 chart pin row", category: "Ops", runs: 12, successRate: 99, timeSavedHours: 1 });
  expect(res.ok, `create "${name}" via the API (status ${res.status})`).toBe(true);
}

async function deleteRow(page: Page, name: string): Promise<void> {
  await page.evaluate(async (n) => {
    const list = await fetch("/api/workflows").then((r) => r.json());
    const row = Array.isArray(list?.data) ? list.data.find((w: { name: string }) => w.name === n) : null;
    if (row) await fetch(`/api/workflows/${row.id}`, { method: "DELETE" });
  }, name);
}

test.describe("runs-chart honesty + semantics (Session 25)", () => {
  test("(a) the chart charts every workflow while the workspace fits (no note)", async ({ page }) => {
    await signIn(page);
    const section = page.getByRole("region", { name: "Runs by workflow" });
    await expect(section).toBeVisible();
    // Whatever rows the suite's earlier specs left (the session23-honesty
    // deletions), the chart's list items equal the visible article rows.
    const articles = await page.locator("article").count();
    const chartItems = await section.locator("li").count();
    expect(chartItems).toBe(Math.min(articles, 8));
    // No truncation note while the whole workspace fits (the suite state
    // never exceeds 8 — the session23 deletions leave ~3). Any wording —
    // the criterion-naming note arrived in Session 26 ("top … by runs").
    await expect(section.getByText(/Showing the/)).toHaveCount(0);
  });

  test("(b) the chart caps at 8 with the honest note when the workspace is larger", async ({ page }) => {
    await signIn(page);
    const section = page.getByRole("region", { name: "Runs by workflow" });
    const before = await page.locator("article").count();
    // Mint a surplus through the create API (deleted in the finally
    // cleanup — later specs see the same state this spec found).
    const surplus: string[] = [];
    try {
      while (before + surplus.length < 10) {
        const name = `S25 chart pin ${surplus.length + 1} ${Date.now()}`;
        surplus.push(name);
        await createRow(page, name);
      }
      await page.reload(); // the server-rendered initial state carries the new rows
      await expect(page.getByRole("heading", { name: "Workflows" })).toBeVisible();
      const articlesAfter = await page.locator("article").count();
      expect(articlesAfter).toBeGreaterThanOrEqual(10);
      // The chart caps at 8 items…
      await expect(section.locator("li")).toHaveCount(8);
      // …and SAYS so — the S21 honesty pattern with the TRUE total, naming
      // the ranking criterion (Session 26 R1: the chart ranks BY RUNS —
      // "top 8 … by runs", not "8 most recent").
      await expect(section.getByText(/Showing the top 8 of \d+ workflows by runs\./)).toBeVisible();
      const noteText = await section.getByText(/Showing the top 8/).innerText();
      expect(noteText).toContain(`of ${articlesAfter} workflows`);
    } finally {
      for (const name of surplus) await deleteRow(page, name);
      await page.reload();
      await expect.poll(() => page.locator("article").count()).toBe(before);
    }
  });

  test("(c) the chart rows carry list semantics (announced to screen readers)", async ({ page }) => {
    await signIn(page);
    const section = page.getByRole("region", { name: "Runs by workflow" });
    // The row container is a semantic list; each row a listitem — a
    // screen reader announces the structure ("list, N items") instead of
    // reading div soup. (Preflight resets the list styling: visually
    // identical to the pre-fix divs — the mobile-nav screenshots keep
    // matching.)
    const list = section.getByRole("list");
    await expect(list).toBeVisible();
    const items = list.getByRole("listitem");
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(8);
    // Each row's text carries the honest pair: the name AND the exact
    // value (the F2 clamp adjudication's contract — the adjacent exact
    // number is what makes the 4% floor honest).
    const first = items.first();
    await expect(first.getByText(/[\d,]+$/)).toBeVisible();
  });
});
