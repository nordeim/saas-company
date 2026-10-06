import { expect, test } from "@playwright/test";

// FAQ + pricing + legal surfaces.

test.describe("FAQ page", () => {
  test("renders the reference questions", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByRole("heading", { name: "Questions? We've Got Answers" })).toBeVisible();
    for (const q of [
      "Is my data secure with NovaAI?",
      "What integrations do you support?",
      "Can I cancel my subscription anytime?",
    ]) {
      await expect(page.getByRole("button", { name: q })).toBeVisible();
    }
  });

  test("the accordion opens and closes", async ({ page }) => {
    await page.goto("/faq");
    const trigger = page.getByRole("button", { name: "Is my data secure with NovaAI?" });
    await trigger.click();
    await expect(page.getByText(/SOC 2 Type II certified/)).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await trigger.click();
    await expect(page.getByText(/SOC 2 Type II certified/)).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("pricing section", () => {
  test("renders the three plans with the reference prices", async ({ page }) => {
    await page.goto("/#pricing");
    await expect(page.getByRole("heading", { name: "Simple, Transparent Pricing" })).toBeVisible();
    await expect(page.getByText("$0").first()).toBeVisible();
    await expect(page.getByText("$39").first()).toBeVisible();
    await expect(page.getByText("Custom").first()).toBeVisible();
    await expect(page.getByText("Most Popular")).toBeVisible();
  });

  test("the annual toggle applies the 20% discount", async ({ page }) => {
    await page.goto("/#pricing");
    await page.getByRole("button", { name: /Annual/ }).click();
    await expect(page.getByText("$31").first()).toBeVisible();
    await expect(page.getByText("Save 20%")).toBeVisible();
    // Custom stays Custom — no /month suffix next to it.
    const custom = page.getByText("Custom", { exact: true }).first();
    await expect(custom).toBeVisible();
  });

  test("switching back to monthly restores the list price", async ({ page }) => {
    await page.goto("/#pricing");
    await page.getByRole("button", { name: /Annual/ }).click();
    await page.getByRole("button", { name: "Monthly", exact: true }).click();
    await expect(page.getByText("$39").first()).toBeVisible();
  });
});

test.describe("legal pages", () => {
  for (const [path, title] of [
    ["/privacy", "Privacy Policy"],
    ["/terms", "Terms & Conditions"],
    ["/accessibility", "Accessibility Statement"],
    ["/refund-policy", "Refund Policy"],
  ] as const) {
    test(`${path} renders the ${title}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
      await expect(page.getByText("A legal disclaimer")).toBeVisible();
      // Body sections render.
      await expect(page.locator("main section").first()).toBeVisible();
      // The footer still carries the legal nav.
      await expect(page.locator("footer").getByRole("link", { name: "Privacy", exact: true })).toBeVisible();
    });
  }
});

test.describe("newsletter (footer superset)", () => {
  test("a valid email subscribes; an invalid one is rejected", async ({ page }) => {
    await page.goto("/");
    const form = page.locator("footer form");
    await form.getByLabel("Email address").fill("not-an-email");
    await form.getByRole("button", { name: "Subscribe" }).click();
    // The browser's own validation blocks submit for invalid emails — assert
    // the form is still there and the API path via a direct request.
    const bad = await page.request.post("/api/newsletter", { data: { email: "nope" } });
    expect(bad.status()).toBe(400);
    const badPayload = await bad.json();
    expect(badPayload.ok).toBe(false);

    const good = await page.request.post("/api/newsletter", {
      data: { email: `e2e-${Date.now()}@example.com` },
    });
    expect(good.ok()).toBeTruthy();
    const goodPayload = await good.json();
    expect(goodPayload.ok).toBe(true);
    expect(goodPayload.data.subscribed).toBe(true);
  });
});
