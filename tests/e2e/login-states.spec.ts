import { expect, test } from "@playwright/test";
import { DEMO_EMAIL } from "./helpers";

// Session 5 login alternate-state pins — the measured structures of the
// reference's /login card in its NON-DEFAULT modes (audit:
// docs/remediation-plan-session5.md F2). Sessions 1-4 only measured the
// default sign-in state; the live's sign-up / forgot / error / success
// views use a DIFFERENT layout (back-button + h2 + form, no logo chip,
// no Google, no OR divider) and shadcn-style alert banners.
//
// Every check here was observed RED against the pre-remediation build.

test.describe("login sign-up state (Session 5)", () => {
  test("matches the reference's compact back-button + h2 + three-field layout", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Need an account\?/ }).click();

    // h2 heading (NOT h1 — the default state's h1 is unmounted).
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    expect(await page.locator("h1").count()).toBe(0);

    // No logo chip, no Google, no OR divider, no subtitle.
    expect(await page.locator("span.rounded-full.ring-4").count()).toBe(0);
    expect(await page.getByRole("button", { name: "Continue with Google" }).count()).toBe(0);
    expect(await page.locator("main div.text-xs.uppercase").count()).toBe(0);
    await expect(page.getByText("Start automating in minutes")).toHaveCount(0);

    // Fields: email + password + confirm — and NO name field.
    await expect(page.getByLabel("Email")).toBeVisible();
    const password = page.getByLabel("Password", { exact: true });
    await expect(password).toHaveAttribute("placeholder", "Min. 8 characters");
    await expect(page.getByLabel("Confirm Password")).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toHaveAttribute("placeholder", "Re-enter password");
    await expect(page.getByLabel("Name")).toHaveCount(0);

    // The back button sits at the top of the card.
    await expect(page.getByRole("button", { name: "Back to sign in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();

    // Card geometry pin: the reference's signup card measures 470px at
    // 1440×900 (the auth-stack spacing — v4's preceding-sibling space-y
    // lets the back button's -mb-2 cancel the gap; the route style
    // restores the reference's following-sibling pattern).
    await page.setViewportSize({ width: 1440, height: 900 });
    const cardH = await page.evaluate(
      () => Math.round(document.querySelector("main > div > div")!.getBoundingClientRect().height),
    );
    expect(cardH).toBeGreaterThanOrEqual(462);
    expect(cardH).toBeLessThanOrEqual(478);
  });

  test("mismatched confirm password shows the reference's alert copy", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Need an account\?/ }).click();
    await page.getByLabel("Email").fill(`mismatch-${Date.now()}@example.com`);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password999!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("login forgot state (Session 5)", () => {
  test("matches the reference's reset layout and copy", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();

    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
    await expect(
      page.getByText("Enter your email and we'll send you a link to reset your password"),
    ).toBeVisible();

    // No logo chip, no Google, no OR divider in this state either.
    expect(await page.locator("span.rounded-full.ring-4").count()).toBe(0);
    expect(await page.getByRole("button", { name: "Continue with Google" }).count()).toBe(0);

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to sign in" })).toBeVisible();
  });

  test("submitting shows the reference's check-your-email success view", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Forgot password?" }).click();
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible({ timeout: 10_000 });
    // The subtitle renders "…instructions to<br><span>email</span>" — assert
    // the two text runs separately (a single getByText over the <br> split
    // does not match).
    await expect(page.getByText("We've sent password reset instructions to")).toBeVisible();
    await expect(page.getByText(DEMO_EMAIL)).toBeVisible();
    // Next's route announcer also carries role=alert — scope to main.
    const alert = page.locator('main div[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(
      "Please check your email for the password reset link. It may take a few minutes to arrive.",
    );
    // The green variant of the reference's alert banner.
    await expect(alert).toHaveClass(/bg-green-50\/70/);
    await expect(alert).toHaveClass(/border-green-200/);
    await expect(page.getByRole("button", { name: "Back to sign in" })).toBeVisible();
  });
});

test.describe("login error state (Session 5)", () => {
  test("wrong credentials render the reference's red alert banner between field and submit", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    // Next's route announcer also carries role=alert — scope to main.
    const alert = page.locator('main div[role="alert"]');
    await expect(alert).toBeVisible({ timeout: 15_000 });
    await expect(alert).toContainText("Invalid email or password");
    // The reference's shadcn alert styling (red variant).
    await expect(alert).toHaveClass(/bg-red-50\/70/);
    await expect(alert).toHaveClass(/border-red-200/);

    // Position pin: the alert renders BETWEEN the password input and the
    // submit button in DOM order (the reference measured Password → alert
    // → Sign in; the old clone rendered the error after the button).
    const order = await page.evaluate(() => {
      const pw = document.querySelector('input[type="password"]');
      const alert = document.querySelector('main div[role="alert"]');
      const btn = [...document.querySelectorAll("button")].find((b) =>
        b.innerText.trim() === "Sign in",
      );
      if (!pw || !alert || !btn) return "missing";
      return [pw, alert, btn].every((el, i, arr) => i === 0 || el.compareDocumentPosition(arr[i - 1]) & Node.DOCUMENT_POSITION_PRECEDING)
        ? "correct"
        : "wrong";
    });
    expect(order).toBe("correct");
  });
});
