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

test.describe("dashboard mockup (dot fill parity)", () => {
  // The list dots render SOLID purple (bg-primary/80 → rgba(134,36,255,.8))
  // — the live's loops are transform/opacity only (Session 10: scale pulses
  // via animate-mockup-dot). The old clone's skeleton-wave shimmer also
  // overran the dot's purple background (unlayered CSS beats layered
  // utilities) — never re-add it. The mockup's OTHER motion (the ambient
  // glow, red dot, under-glow loops) is pinned by the
  // mockup-motion-parity suite.

  test("mockup list dots render solid primary purple (not the white wave)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.querySelectorAll("section")[1].scrollIntoView());
    await page.waitForTimeout(400);
    const dots = page.locator("section:nth-of-type(2) .w-2.h-2.rounded-full.bg-primary\\/80");
    await expect(dots).toHaveCount(4);
    const rgb = await dots.first().evaluate((el) => {
      const bg = getComputedStyle(el).backgroundColor;
      const rgbM = bg.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)/);
      if (rgbM) return [+rgbM[1], +rgbM[2], +rgbM[3]];
      const labM = bg.match(/oklab\(([-\d.]+) ([-\d.]+) ([-\d.]+)/);
      if (!labM) return null;
      const [L, a, b] = [+labM[1], +labM[2], +labM[3]];
      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.291485548 * b;
      const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
      const lin = [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
      ];
      return lin.map((c) => {
        const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
        return Math.round(Math.min(1, Math.max(0, v)) * 255);
      });
    });
    expect(rgb, "dot color resolved to rgb").not.toBeNull();
    for (let i = 0; i < 3; i++) {
      expect(Math.abs((rgb as number[])[i] - [134, 36, 255][i]), `channel ${i}`).toBeLessThanOrEqual(2);
    }
  });

  test("the mockup runs ONLY the live's measured loops (Session-10 correction)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.querySelectorAll("section")[1].scrollIntoView());
    await page.waitForTimeout(400);
    const animated = await page.evaluate(() => {
      const sec = document.querySelectorAll("section")[1];
      return [...sec.querySelectorAll("*")]
        .filter((el) => getComputedStyle(el).animationName !== "none")
        .map((el) => getComputedStyle(el).animationName);
    });
    // Session 10 falsified the Session-4 "zero animations" census (a
    // CSS-property read cannot see framer's per-frame inline writes — the
    // live pulses the ambient glow, the red chrome dot, and the four list
    // dots; docs/remediation-plan-session10.md F1). The only CSS-keyframe
    // animations in the section are the measured loop equivalents — no
    // skeleton-wave shimmer, no grow-in stagger.
    animated.sort();
    expect(animated).toEqual([
      "mockup-ambient",
      "mockup-dot",
      "mockup-dot",
      "mockup-dot",
      "mockup-dot",
      "mockup-dot",
      "mockup-glow",
    ]);
  });

  test("chart bars sit at the reference percentages", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.querySelectorAll("section")[1].scrollIntoView());
    await page.waitForTimeout(400);
    const heights = await page.evaluate(() => {
      const sec = document.querySelectorAll("section")[1];
      const bars = [...sec.querySelectorAll("div")].filter(
        (el) => el.className.toString().includes("flex-1") && el.className.toString().includes("rounded-t")
      );
      return bars.map((el) => (el as HTMLElement).style.height);
    });
    expect(heights).toEqual([
      "42%", "64%", "45%", "80%", "55%", "70%",
      "90%", "60%", "75%", "85%", "50%", "95%",
    ]);
  });
});
