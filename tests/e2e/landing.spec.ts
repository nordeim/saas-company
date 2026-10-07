import { expect, test } from "@playwright/test";

// Landing page structure: every reference section renders with its content,
// the nav carries the reference link map, and unknown paths 404.

test.describe("landing page", () => {
  test("hero renders the beta badge, gradient heading, and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Automated Workflows,");
    await expect(page.getByText("Now in Public Beta — Free for 14 Days")).toBeVisible();
    await expect(page.getByRole("link", { name: /Book a Demo/ })).toBeVisible();
    // The looping hero video is present.
    await expect(page.locator("section video").first()).toHaveAttribute("src", "/media/hero-ai-loop.mp4");
    // The scroll indicator travels down the pill like the reference (rAF-sampled
    // on the live: translateY 0→~8px, ≈1.7s period) — animate-bounce bounced in place.
    const dot = page.locator("section .absolute.bottom-8 .w-1.h-2");
    await expect(dot).toBeVisible();
    await expect(dot).toHaveClass(/animate-scroll-dot/);
  });

  test("desktop nav carries the reference link map", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await expect(nav.getByRole("link", { name: "Features", exact: true })).toHaveAttribute("href", "#features");
    await expect(nav.getByRole("link", { name: "How It Works", exact: true })).toHaveAttribute("href", "#how-it-works");
    await expect(nav.getByRole("link", { name: "Pricing", exact: true })).toHaveAttribute("href", "#pricing");
    await expect(nav.getByRole("link", { name: "Testimonials", exact: true })).toHaveAttribute("href", "#testimonials");
    await expect(nav.getByRole("link", { name: "FAQ", exact: true })).toHaveAttribute("href", "/faq");
    await expect(nav.getByRole("link", { name: "Get Started", exact: true })).toHaveAttribute("href", "#pricing");
    await expect(nav.getByRole("button", { name: "Log In", exact: true })).toBeVisible();
  });

  test("all sections render below the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Trusted by 5,000+ teams worldwide")).toBeVisible();
    await expect(page.getByText("Your Team Deserves Better")).toBeVisible();
    await expect(page.getByText("One Platform. Zero Manual Work.", { exact: false })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Everything You Need to Scale" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Up and Running in Minutes" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Simple, Transparent Pricing" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Loved by Teams Everywhere" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Stop Managing\./ })).toBeVisible();
  });

  test("footer carries the four columns and the copyright line", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("heading", { name: "Product" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Legal" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Social" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Subscribe" })).toBeVisible();
    await expect(footer.getByText(/Built on Base44/)).toBeVisible();
    await expect(footer.getByRole("link", { name: "Privacy", exact: true })).toHaveAttribute("href", "/privacy");
  });

  test("anchor navigation scrolls to the pricing section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Pricing", exact: true }).first().click();
    await expect(page).toHaveURL(/#pricing$/);
    await expect
      .poll(async () => page.evaluate(() => Math.round(window.scrollY)), { timeout: 5_000 })
      .toBeGreaterThan(500);
  });

  test("unknown paths return 404", async ({ page }) => {
    const res = await page.goto("/definitely-not-a-route");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  });

  test("health endpoint answers with the ok envelope", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const payload = await res.json();
    expect(payload.ok).toBe(true);
    expect(payload.data.status).toBe("ok");
    expect(payload.data.app).toBe("saas-company");
  });
});
