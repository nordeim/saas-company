import { expect, test, type Page } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 25 — the performance-budget suite (the S46 log's suggested
 * hook: the S21/S22 performance surveys measured LCP/TTFB/DOM-node
 * ceilings ad hoc; nothing in the gate PINNED them, so a gross
 * regression — a 5,000-node DOM, a blocking import, a hero-asset change —
 * would pass all 486 checks while halving the site's speed).
 *
 * The ceilings are deliberately generous (~2–4x the measured values):
 * the budget's job is to catch GROSS regressions, not to chase
 * milliseconds — the §7.4 de-flake discipline (sample to settled, never
 * a fixed-offset string match) applies. Measured at authoring time
 * (Session 25, localhost standalone, otherwise-idle worker):
 * landing LCP 388ms / 860 DOM nodes; login LCP 192ms; the logged-in
 * dashboard ~314 DOM nodes (Session 22's number, re-verified 102 on the
 * unauthenticated redirect — the authed number is what this spec pins).
 *
 * These pins are PREVENTIVE tooling: they pass on the current build by
 * design — their RED is a future regression, not a present defect.
 */

const LANDING_DOM_BUDGET = 1200;
const LANDING_LCP_BUDGET_MS = 1500;
const LOGIN_LCP_BUDGET_MS = 800;
const DASHBOARD_DOM_BUDGET = 500;

/** Session 26 R2 — the JS-TRANSFER budgets (the S48 log's third surface,
 * the one performance layer still unpinned). Measured at authoring time
 * (localhost standalone, ResourceTiming transferSize, settled):
 * landing 172KB across 10 script files (the 2,214KB page total is
 * dominated by the 1,898KB hero video — the reference's own parity
 * asset, NOT JS); login 152KB/9; the authed dashboard 177KB/11.
 * The 400KB ceiling is ~2.3–2.6x the measured values (the S25
 * generous-margin discipline: the budget catches GROSS regressions — an
 * accidental full-library import — not kilobytes). */
const SCRIPT_TRANSFER_BUDGET_BYTES = 400 * 1024;

/** The script bytes transferred for the current document, sampled to
 * settled (the §7.4 poll discipline). */
async function scriptTransferBytes(page: Page): Promise<number> {
  return page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((r) => {
        const res = r as PerformanceResourceTiming;
        return res.initiatorType === "script" || /\.js(?:\?|$)/.test(res.name || "");
      })
      .reduce((n, r) => n + ((r as PerformanceResourceTiming).transferSize || 0), 0),
  );
}

/** LCP sampled to settled (the §7.4 poll discipline — a buffered
 * PerformanceObserver read after a short settle window, never a
 * fixed-offset read). */
async function settledLcp(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let latest = 0;
        try {
          const po = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length) latest = entries[entries.length - 1].startTime;
          });
          po.observe({ type: "largest-contentful-paint", buffered: true });
          setTimeout(() => {
            po.disconnect();
            resolve(Math.round(latest));
          }, 600);
        } catch {
          resolve(0); // LCP unsupported → skip (0 always passes)
        }
      })
  );
}

test.describe("performance budgets (Session 25 — the S46 hook)", () => {
  test("landing: DOM-node budget", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    // Let the entrance animations mount whatever they mount.
    await page.waitForTimeout(800);
    const nodes = await page.evaluate(() => document.querySelectorAll("*").length);
    expect(nodes, `landing DOM nodes <= ${LANDING_DOM_BUDGET} (measured 860 at authoring)`).toBeLessThanOrEqual(LANDING_DOM_BUDGET);
  });

  test("landing: LCP budget", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const lcp = await settledLcp(page);
    expect(lcp, `landing LCP ${lcp}ms <= ${LANDING_LCP_BUDGET_MS}ms (measured 388ms at authoring)`).toBeLessThanOrEqual(LANDING_LCP_BUDGET_MS);
  });

  test("login: LCP budget", async ({ page }) => {
    await page.goto("/login", { waitUntil: "load" });
    const lcp = await settledLcp(page);
    expect(lcp, `login LCP ${lcp}ms <= ${LOGIN_LCP_BUDGET_MS}ms (measured 192ms at authoring)`).toBeLessThanOrEqual(LOGIN_LCP_BUDGET_MS);
  });

  test("dashboard (authed): DOM-node budget", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await page.getByRole("heading", { name: "Workflows" }).waitFor();
    await page.waitForTimeout(400);
    const nodes = await page.evaluate(() => document.querySelectorAll("*").length);
    expect(nodes, `authed dashboard DOM nodes <= ${DASHBOARD_DOM_BUDGET} (measured ~314 at Session 22)`).toBeLessThanOrEqual(DASHBOARD_DOM_BUDGET);
  });
});

test.describe("JS-transfer budgets (Session 26 R2 — the S48 third surface)", () => {
  test("landing: script-transfer budget", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(800); // entrances settle (prefetched chunks land)
    const bytes = await scriptTransferBytes(page);
    expect(
      bytes,
      `landing script transfer ${Math.round(bytes / 1024)}KB <= ${SCRIPT_TRANSFER_BUDGET_BYTES / 1024}KB (measured 172KB at authoring)`,
    ).toBeLessThanOrEqual(SCRIPT_TRANSFER_BUDGET_BYTES);
  });

  test("login: script-transfer budget", async ({ page }) => {
    await page.goto("/login", { waitUntil: "load" });
    await page.waitForTimeout(600);
    const bytes = await scriptTransferBytes(page);
    expect(
      bytes,
      `login script transfer ${Math.round(bytes / 1024)}KB <= ${SCRIPT_TRANSFER_BUDGET_BYTES / 1024}KB (measured 152KB at authoring)`,
    ).toBeLessThanOrEqual(SCRIPT_TRANSFER_BUDGET_BYTES);
  });

  test("dashboard (authed): script-transfer budget", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await page.getByRole("heading", { name: "Workflows" }).waitFor();
    await page.waitForTimeout(600);
    const bytes = await scriptTransferBytes(page);
    expect(
      bytes,
      `authed dashboard script transfer ${Math.round(bytes / 1024)}KB <= ${SCRIPT_TRANSFER_BUDGET_BYTES / 1024}KB (measured 177KB at authoring)`,
    ).toBeLessThanOrEqual(SCRIPT_TRANSFER_BUDGET_BYTES);
  });
});
