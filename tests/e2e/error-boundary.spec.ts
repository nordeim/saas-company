import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 13 F2 — the render-fault boundary suite. A client-side render
 * error (here: an API row that violates the contract — `runs: null`
 * crashes `w.runs.toLocaleString()` in the article template) must surface
 * the BRANDED recovery UI, never Next.js's default unbranded error page
 * ("This page couldn't load"), and Try again must restore the segment
 * with the server-provided initial state.
 *
 * Pre-fix RED: the default page rendered (no error.tsx shipped) and the
 * pageerror `TypeError: Cannot read properties of null (reading
 * 'toLocaleString')` surfaced. Note: the browser's error report for a
 * GENUINE render fault is inherent (like the 404's document log) — this
 * suite pins the RECOVERY UI, not console silence.
 *
 * The live is an SPA with no equivalent surface (D62/D59: superset).
 */
async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

// A contract-violating row: passes the Array.isArray envelope guard but
// crashes the article render (`runs: null` → null.toLocaleString()).
const BROKEN_ROW = {
  id: "broken-probe",
  name: "Contract violation probe",
  description: null,
  status: "active",
  category: null,
  runs: null,
  successRate: null,
  timeSavedHours: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

test.describe("render-fault error boundary (Session-13 F2)", () => {
  test("(a) a contract-violating API row crashes the render → the BRANDED boundary (not the Next.js default)", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();

    // The LIST endpoint returns the violating row (200 + ok:true); the
    // PATCH succeeds so the post-mutation refresh() ingests it.
    await page.route("**/api/workflows", (route) => {
      const method = route.request().method();
      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true, data: [BROKEN_ROW] }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: { id: "x", name: "ok", status: "paused" } }),
      });
    });
    await page.locator('button[aria-label^="Pause"]').first().click();
    await page.waitForTimeout(2500);

    // The branded boundary — role=alert, brand copy, the Try again button.
    await expect(page.getByRole("alert").filter({ hasText: /something went wrong/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
    // NOT the Next.js default error page.
    await expect(page.getByText("This page couldn’t load")).toHaveCount(0);
    await expect(page.getByText("This page couldn't load")).toHaveCount(0);
  });

  test("(b) Try again restores the segment with the server-provided initial state", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();

    await page.route("**/api/workflows", (route) => {
      const method = route.request().method();
      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true, data: [BROKEN_ROW] }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: { id: "x", name: "ok", status: "paused" } }),
      });
    });
    await page.locator('button[aria-label^="Pause"]').first().click();
    await expect(page.getByRole("alert").filter({ hasText: /something went wrong/i })).toBeVisible();

    // reset() re-renders the segment — the server-provided initial state
    // (the seeded workflows) renders again.
    await page.getByRole("button", { name: /try again/i }).click();
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
