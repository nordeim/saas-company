import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

// Auth flow: the /login card renders its three states, rejects bad
// credentials, signs the demo user in to the dashboard, and signs out.
// The seed's demo account is recreated by global-setup on every run.

test.describe("login page", () => {
  test("renders the reference auth card", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to SAAS Company" })).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();

    // The circular logo chip with the 4px white ring.
    const chip = page.locator("span.rounded-full.ring-4").first();
    await expect(chip).toBeVisible();
    const radius = await chip.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
    expect(radius).toBeGreaterThan(1000);

    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("the page carries the slate gradient background", async ({ page }) => {
    await page.goto("/login");
    const bg = await page.evaluate(() => {
      const main = document.querySelector("main");
      return main ? getComputedStyle(main).backgroundImage : "NO_MAIN";
    });
    expect(bg).toContain("linear-gradient");
  });

  test("wrong password is rejected with the error message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText("Incorrect email or password")).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("valid credentials land on the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Compose a workflow with AI/i })).toBeVisible();
  });

  test("sign-up state toggles and validates", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Need an account\?/ }).click();
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();

    // A short password is rejected by the API (policy: 8+).
    await page.getByLabel("Name").fill("E2E User");
    await page.getByLabel("Email").fill(`e2e-${Date.now()}@example.com`);
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("at least 8 characters", { exact: false })).toBeVisible({ timeout: 15_000 });
  });

  test("registration round-trip: sign up then sign in", async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    await page.goto("/login");
    await page.getByRole("button", { name: /Need an account\?/ }).click();
    await page.getByLabel("Name").fill("E2E Signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("Signup123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

    // Sign out via the dashboard button.
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
  });

  test("the dashboard requires a session (redirects to /login)", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Welcome to SAAS Company" })).toBeVisible();
  });

  test("forgot-password state acknowledges without leaving the page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText(/reset link is on its way/i)).toBeVisible();
  });
});
