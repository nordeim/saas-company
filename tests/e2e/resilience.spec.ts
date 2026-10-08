import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 12 F3 — the fault-resilience suite. Under network-level failures
 * (route.abort), the dashboard's mutation handlers must uphold the same
 * contract as the composer: NO uncaught rejections (zero pageerrors) and a
 * VISIBLE error surface. Pre-fix, `toggleStatus`/`remove`/`signOut` carried
 * no catch — a network fault produced `pageerror: TypeError: Failed to
 * fetch` with zero user feedback, and Sign out's navigation never ran (the
 * user was stranded on /dashboard). The composer (`compose()`) was already
 * the model: catch → setError → a role="alert" banner.
 *
 * The live has no dashboard (D62 — this is the clone's superset surface;
 * the D59 precedent: fix and document).
 */
async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

test.describe("dashboard fault resilience (Session-12 F3)", () => {
  test("pausing a workflow under a network fault: zero pageerrors + the visible banner", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();

    // The PATCH never lands (network-level failure).
    await page.route(/\/api\/workflows\/[^/]+$/, (route) => route.abort("connectionfailed"));
    await page.locator('button[aria-label^="Pause"]').first().click();
    await page.waitForTimeout(1500);

    expect(pageErrors, `pageerrors: ${pageErrors.join(" | ")}`).toEqual([]);
    await expect(page.getByRole("alert").filter({ hasText: "Could not update that workflow" })).toBeVisible();
    // The UI state was never mutated (no refresh ran) — the button still
    // offers Pause, not Resume.
    await expect(page.locator('button[aria-label^="Pause"]').first()).toBeVisible();
  });

  test("deleting a workflow under a network fault: zero pageerrors + the visible banner", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();

    await page.route(/\/api\/workflows\/[^/]+$/, (route) => route.abort("connectionfailed"));
    await page.locator('button[aria-label^="Delete"]').first().click();
    await page.waitForTimeout(1500);

    expect(pageErrors, `pageerrors: ${pageErrors.join(" | ")}`).toEqual([]);
    await expect(page.getByRole("alert").filter({ hasText: "Could not delete that workflow" })).toBeVisible();
    // Nothing was deleted — the seeded workflow is still in the list.
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();
  });

  test("signing out under a network fault: zero pageerrors + the banner, and the user stays (honest state)", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();

    await page.route("**/api/auth/logout", (route) => route.abort("connectionfailed"));
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForTimeout(1500);

    expect(pageErrors, `pageerrors: ${pageErrors.join(" | ")}`).toEqual([]);
    // The session cookie is still live server-side — navigating away would
    // lie to the user. The banner explains instead.
    await expect(page.getByRole("alert").filter({ hasText: "Could not sign out" })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("composing under a network fault: the composer's own error surfaces, zero pageerrors (the regression pin)", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();

    // generate + create both die; the list GET is also dead (the catch
    // contract must not depend on the refresh succeeding).
    await page.route("**/api/workflows**", (route) => route.abort("connectionfailed"));
    await page.getByLabel("Workflow idea").fill("Resilience suite fault probe");
    await page.getByRole("button", { name: "Compose" }).click();
    await page.waitForTimeout(1500);

    expect(pageErrors, `pageerrors: ${pageErrors.join(" | ")}`).toEqual([]);
    await expect(page.getByRole("alert").filter({ hasText: "Could not compose" })).toBeVisible();
  });
});
