import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 13 F1 — the session-lifecycle suite. When the session cookie
 * EXPIRES (or is revoked) while the dashboard tab is open, every mutation
 * gets the 401 envelope — and a 401 is NOT a network fault: retrying will
 * 401 forever. The honest contract is the same one the server-side gate
 * upholds for page loads (`page.tsx:14`): redirect to
 * /login?from_url=/dashboard.
 *
 * Pre-fix RED: the banner said "Could not update that workflow. Try
 * again." — a lie — and the user stayed stranded on /dashboard.
 *
 * The live has no dashboard (D62 — this is the clone's superset surface;
 * the D59 precedent: fix and document). Distinct from Session 12's
 * resilience suite, which pins route-ABORT behavior (retry is plausible
 * → the banner contract); pin (d) below double-locks the distinction.
 */
async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

test.describe("session-expiry handling (Session-13 F1)", () => {
  test("(a) cookie expired → Pause → redirects to /login?from_url=/dashboard (no lying banner)", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();

    // Simulate the 7-day TTL expiry: the cookie vanishes from the browser.
    await page.context().clearCookies();

    await page.locator('button[aria-label^="Pause"]').first().click();
    await expect(page).toHaveURL(/\/login\?from_url=%2Fdashboard|\/login\?from_url=\/dashboard$/, { timeout: 15_000 });
    // The login card renders — the honest next step, not a "Try again" lie.
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("(b) cookie expired → Delete → the same redirect contract", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();

    await page.context().clearCookies();
    await page.locator('button[aria-label^="Delete"]').first().click();
    await expect(page).toHaveURL(/\/login\?from_url=/, { timeout: 15_000 });
  });

  test("(c) cookie expired → Compose → the same redirect contract (the generate 401 must not strand the user either)", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();

    await page.context().clearCookies();
    await page.getByLabel("Workflow idea").fill("Session lifecycle probe");
    await page.getByRole("button", { name: "Compose" }).click();
    await expect(page).toHaveURL(/\/login\?from_url=/, { timeout: 15_000 });
  });

  test("(d) the regression pin: a NON-401 fault (route.abort) still shows the Session-12 banner and stays on /dashboard", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();

    // Network-level abort — retry IS plausible here: the banner contract.
    await page.route(/\/api\/workflows\/[^/]+$/, (route) => route.abort("connectionfailed"));
    await page.locator('button[aria-label^="Pause"]').first().click();
    await page.waitForTimeout(1500);

    await expect(page.getByRole("alert").filter({ hasText: "Could not update that workflow" })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
