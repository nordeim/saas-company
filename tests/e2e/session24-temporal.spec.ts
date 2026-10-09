import { expect, test, type Page } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 24 — the temporal-honesty suite. The TEMPORAL dimension of the
 * client contract (the S23 client-honesty audit's continuation):
 *
 *  F1 — the client hang class. No client fetch carried a timeout: a
 *  black-holed request (a stalled connection — the CLIENT twin of
 *  Session 15's server-side hang, D78) neither resolved nor rejected,
 *  so the dashboard's busyId stayed engaged FOREVER (the row's buttons
 *  spinning eternally) and the login card's busy state never released —
 *  no banner, no recovery (the S12 resilience pins cover ABORTS, which
 *  reject immediately — the hang class was invisible to the existing
 *  gates). The fix: fetchWithTimeout (src/lib/client-fetch.ts) converts
 *  the hang into the existing network-fault contract. Pinned here with
 *  Playwright's clock API (install + fastForward) so the 20s ceiling
 *  costs milliseconds of wall-clock.
 *
 *  F2 — the stale-banner class. The two error surfaces (the composer's
 *  local error and the global action banner) outlived the condition
 *  they describe: a failed compose followed by a SUCCESSFUL pause kept
 *  the composer asserting "Try again."; a failed pause followed by a
 *  SUCCESSFUL compose kept the global banner mounted (a retry
 *  invitation rendered after the network demonstrably recovered — the
 *  S13/S23 family: a lie by staleness). The fix: every action start
 *  clears BOTH surfaces.
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts AFTER session23-honesty.spec.ts, whose tests delete three
 * of the six seeded rows (Onboarding email orchestration, Content
 * repurposing engine, Weekly investor update digest) — the survivors
 * are Lead enrichment pipeline (possibly toggled), Anomaly scan on
 * billing events, and Churn-risk early warning. Hence the
 * status-tolerant /^(Pause|Resume)/ selectors and the survivor-victim
 * choices below; the composed row in (d) is cleaned up (the
 * dashboard.spec composer pattern). role=alert assertions filter by
 * TEXT (Next's route announcer is itself a role=alert element carrying
 * the page title — the S23 pin lesson).
 */

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

test.describe("client temporal honesty (Session 24)", () => {
  test("(a) a black-holed PATCH converts to the banner + busy release (no eternal spinner)", async ({ page }) => {
    // The mocked clock makes the 20s client ceiling cost milliseconds.
    await page.clock.install();
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Churn-risk early warning" })).toBeVisible();

    // Black-hole the PATCH: the route handler never fulfills — the
    // request hangs forever (the stalled-connection class).
    await page.route(/\/api\/workflows\/[^/]+$/, (route) => {
      if (route.request().method() === "PATCH") return; // never fulfill
      return route.continue();
    });

    const victimButton = page.getByRole("button", { name: /^(Pause|Resume) Churn-risk early warning/ });
    await victimButton.click();

    // Fast-forward past the 20s client ceiling. Pre-fix: the spinner was
    // STILL engaged and NO banner rendered (probed RED after 8s of real
    // wall-clock — the same state persists forever).
    await page.clock.fastForward(21_000);

    // The hang converted to the Session-12 network-fault contract…
    await expect(
      page.getByRole("alert").filter({ hasText: "Could not update that workflow" }),
    ).toBeVisible({ timeout: 10_000 });
    // …and the busy guard RELEASED (the row's button is usable again —
    // pre-fix it spun forever).
    await expect(victimButton).toBeEnabled({ timeout: 10_000 });
    await expect(page.locator("article button .animate-spin")).toHaveCount(0);
  });

  test("(b) a black-holed login POST converts to the card's error + button release", async ({ page }) => {
    await page.clock.install();
    await page.goto("/login");
    await page.route("**/api/auth/login", () => {}); // never fulfill — the hang

    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    const submit = page.getByRole("button", { name: "Sign in", exact: true });
    await submit.click();
    // The busy state engages while the request is pending.
    await expect(submit).toBeDisabled();

    await page.clock.fastForward(21_000);

    // The hang converted to the card's network-error contract — pre-fix
    // the button spun forever with zero feedback.
    await expect(page.getByRole("alert").filter({ hasText: "Network error" })).toBeVisible({ timeout: 10_000 });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
  });

  test("(c) a failed compose's error is CLEARED by a successful unrelated action (no stale retry invitation)", async ({ page }) => {
    await signIn(page);

    // Step 1: make compose FAIL — abort the generate POST (a network-level
    // fault; the composer's catch renders its local error).
    await page.route("**/api/workflows/generate", (route) => route.abort("connectionfailed"));
    await page.getByLabel("Workflow idea").fill("session24 staleness probe");
    await page.getByRole("button", { name: /^Compose$/ }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Could not compose that workflow" }),
    ).toBeVisible({ timeout: 10_000 });

    // Step 2: restore the network and SUCCEED at a different action (pause
    // a surviving row — status-tolerant selector).
    await page.unroute("**/api/workflows/generate");
    await page.getByRole("button", { name: /^(Pause|Resume) Anomaly scan on billing events/ }).click();
    await expect(page.getByRole("status")).toContainText(/^(Paused|Resumed) Anomaly scan/, { timeout: 10_000 });

    // The stale composer error is GONE — the retry invitation never
    // outlives the user's context (pre-fix it stayed mounted).
    await expect(
      page.getByRole("alert").filter({ hasText: "Could not compose that workflow" }),
    ).toHaveCount(0);
  });

  test("(d) a failed pause's global banner is CLEARED by a successful compose (the reverse direction)", async ({ page }) => {
    await signIn(page);

    // Step 1: make a pause FAIL — abort the PATCH (the global banner
    // renders; no state change, the row is untouched).
    await page.route(/\/api\/workflows\/[^/]+$/, (route) => {
      if (route.request().method() === "PATCH") return route.abort("connectionfailed");
      return route.continue();
    });
    await page.getByRole("button", { name: /^(Pause|Resume) Churn-risk early warning/ }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Could not update that workflow" }),
    ).toBeVisible({ timeout: 10_000 });

    // Step 2: restore the network and compose SUCCESSFULLY.
    await page.unroute(/\/api\/workflows\/[^/]+$/);
    const before = await page.locator("article").count();
    await page.getByLabel("Workflow idea").fill(`Session 24 staleness probe ${Date.now()}`);
    await page.getByRole("button", { name: /^Compose$/ }).click();
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 25_000 })
      .toBe(before + 1);
    await expect(page.getByRole("status")).toContainText("Workflow created.", { timeout: 10_000 });

    // The stale global banner is GONE — the successful compose superseded
    // the old failure surface (pre-fix it stayed mounted).
    await expect(
      page.getByRole("alert").filter({ hasText: "Could not update that workflow" }),
    ).toHaveCount(0);

    // Clean up the composed row so later specs see the prior state.
    const row = page.locator("article").first();
    await row.getByRole("button", { name: /Delete/ }).first().click();
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 10_000 })
      .toBe(before);
  });
});
