import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

// The dashboard superset: seeded workflows render, the AI composer creates
// one end-to-end, and pause/delete mutate the list.

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

test.describe("dashboard (functional superset)", () => {
  test("renders the seeded workspace with stats", async ({ page }) => {
    await signIn(page);
    await expect(page.getByText("Active workflows")).toBeVisible();
    await expect(page.getByText("Total runs")).toBeVisible();
    await expect(page.getByText("Hours saved")).toBeVisible();
    // A seeded workflow surfaces with its own runs.
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();
    await expect(page.getByText("1,284 runs")).toBeVisible();
    // The stats card aggregates all six seeded workflows (7,120 total runs).
    await expect(page.getByText("7,120").first()).toBeVisible();
  });

  test("the composer creates a workflow end-to-end", async ({ page }) => {
    await signIn(page);
    // Baseline row count (the seed carries six workflows).
    const before = await page.locator("article").count();
    const idea = `E2E smoke pipeline ${Date.now()}`;
    await page.getByLabel("Workflow idea").fill(idea);
    await page.getByRole("button", { name: /^Compose$/ }).click();
    // The composer persists one new row (AI-named or template-named).
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 25_000 })
      .toBe(before + 1);
    // Clean up the newest row so later specs see the pristine seed.
    const row = page.locator("article").first();
    await row.getByRole("button", { name: /Delete/ }).first().click();
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 10_000 })
      .toBe(before);
  });

  test("pause toggles the workflow status", async ({ page }) => {
    await signIn(page);
    const row = page.locator("article", { hasText: "Lead enrichment pipeline" });
    await row.getByRole("button", { name: /Pause Lead enrichment pipeline/i }).click();
    await expect(row.getByText("paused")).toBeVisible({ timeout: 10_000 });
    // Restore for other specs.
    await row.getByRole("button", { name: /Resume Lead enrichment pipeline/i }).click();
    await expect(row.getByText("active", { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test("unauthenticated API access is rejected with the 401 envelope", async ({ request }) => {
    const res = await request.get("/api/workflows");
    expect(res.status()).toBe(401);
    const payload = await res.json();
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });
});
