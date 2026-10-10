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

  // Session 4: the reference's accordion is the Radix/shadcn pattern — the
  // panel carries data-state + the measured accordion keyframes (0.2s
  // ease-out height animation). Session 35 D132 re-measured the closed
  // state in vivo: the live's panels are MOUNTED-HIDDEN (the old Session-4
  // "unmounted" record described the pre-hydration SPA shell; the S4
  // word-parity 0.6052 artifact was CSS-COLLAPSED panels, which innerText
  // includes — display:none it does not).
  test("open panels carry the reference's animation classes", async ({ page }) => {
    await page.goto("/faq");
    const trigger = page.getByRole("button", { name: "Is my data secure with NovaAI?" });
    await trigger.click();
    const panel = page.locator("#faq-panel-0");
    await expect(panel).toHaveAttribute("data-state", "open");
    await expect(panel).toHaveClass(/data-\[state=open\]:animate-accordion-down/);
    // The keyframes rule exists in the served stylesheet.
    const hasKeyframes = await page.evaluate(async () => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (
              rule instanceof CSSKeyframesRule &&
              rule.name.startsWith("accordion-")
            ) {
              return true;
            }
          }
        } catch {
          /* cross-origin sheet — skip */
        }
      }
      return false;
    });
    expect(hasKeyframes).toBe(true);
  });

  test("closed answers are mounted-hidden, out of innerText (live parity, Session 35 D132)", async ({ page }) => {
    await page.goto("/faq");
    // Nothing is open on load — every answer is mounted-hidden (the live's
    // Radix regions resolve at rest with hidden=true — re-measured in vivo
    // Session 35; the old Session-4 "unmounted" record described the
    // pre-hydration SPA shell). Hidden = display:none = excluded from
    // innerText exactly like the live.
    await expect(page.getByText(/SOC 2 Type II certified/)).toBeHidden();
    await expect(page.getByText(/200\+ tools/)).toBeHidden();
    // Open, then close — the answer animates out and hides again.
    const trigger = page.getByRole("button", { name: "Is my data secure with NovaAI?" });
    await trigger.click();
    await expect(page.getByText(/SOC 2 Type II certified/)).toBeVisible();
    await trigger.click();
    await expect(page.getByText(/SOC 2 Type II certified/)).toBeHidden();
  });
});

test.describe("pricing section", () => {
  // Session 4 audit: the live's toggle DEFAULTS TO ANNUAL — the "Annual /
  // Save 20%" pill is the active one on fresh load, Pro shows $39 (the
  // annual price); switching to Monthly shows $49 (the list price).
  test("defaults to Annual with the reference prices", async ({ page }) => {
    await page.goto("/#pricing");
    await expect(page.getByRole("heading", { name: "Simple, Transparent Pricing" })).toBeVisible();
    await expect(page.getByText("$0").first()).toBeVisible();
    await expect(page.getByText("$39").first()).toBeVisible();
    await expect(page.getByText("Custom").first()).toBeVisible();
    await expect(page.getByText("Most Popular")).toBeVisible();
    // The Annual pill is active on load (bg-white), Monthly is not.
    const annual = page.getByRole("button", { name: /Annual/ });
    await expect(annual).toHaveClass(/bg-white/);
    const monthly = page.getByRole("button", { name: "Monthly", exact: true });
    await expect(monthly).not.toHaveClass(/bg-white/);
    // The live never renders a "billed annually" suffix in either state.
    await expect(page.getByText(/billed annually/)).toHaveCount(0);
  });

  test("switching to Monthly shows the $49 list price", async ({ page }) => {
    await page.goto("/#pricing");
    await page.getByRole("button", { name: "Monthly", exact: true }).click();
    await expect(page.getByText("$49").first()).toBeVisible();
    await expect(page.getByText("Save 20%")).toBeVisible();
  });

  test("switching back to Annual restores $39", async ({ page }) => {
    await page.goto("/#pricing");
    await page.getByRole("button", { name: "Monthly", exact: true }).click();
    await page.getByRole("button", { name: /Annual/ }).click();
    await expect(page.getByText("$39").first()).toBeVisible();
    // Custom stays Custom — no /month suffix next to it.
    const custom = page.getByText("Custom", { exact: true }).first();
    await expect(custom).toBeVisible();
  });
});

test.describe("features section (reference card parity)", () => {
  test("AI tab: right-aligned caption, no SOC2/Alerts badges (reference parity)", async ({ page }) => {
    await page.goto("/#features");
    await expect(page.getByRole("heading", { name: "Smart Automation That Learns" })).toBeVisible();
    await expect(page.getByText("Optimization score: 78%")).toBeVisible();
    await expect(page.getByText("SOC 2 compliant")).toHaveCount(0);
    await expect(page.getByText("Alerts on")).toHaveCount(0);
    // The reference caption sits right-aligned under the progress bar.
    const caption = page.getByText("Optimization score: 78%");
    await expect(caption).toHaveClass(/text-right/);
  });

  test("Analytics tab: 12-bar chart + the reference stat chips", async ({ page }) => {
    await page.goto("/#features");
    await page.getByRole("button", { name: /Real-time Analytics/ }).click();
    await expect(page.getByRole("heading", { name: "Insights the Moment They Matter" })).toBeVisible();
    // The bar chart renders its 12 gradient bars.
    const chart = page.locator("section#features .h-32");
    await expect(chart).toBeVisible();
    await expect(chart.locator(".flex-1")).toHaveCount(12);
    // The three reference stat chips.
    await expect(page.getByText("2,847")).toBeVisible();
    await expect(page.getByText("Active Users")).toBeVisible();
    await expect(page.getByText("12.4%")).toBeVisible();
    await expect(page.getByText("Conversion")).toBeVisible();
    await expect(page.getByText("$84.2K")).toBeVisible();
    await expect(page.getByText("Revenue", { exact: true })).toBeVisible();
    // No progress bar / badges on this card (reference has neither).
    await expect(page.getByText("Uptime: 99.99%")).toHaveCount(0);
    await expect(page.getByText("SOC 2 compliant")).toHaveCount(0);
  });

  test("Builder tab: numbered steps + Pipeline Active footer (reference parity)", async ({ page }) => {
    await page.goto("/#features");
    await page.getByRole("button", { name: /Workflow Builder/ }).click();
    await expect(page.getByRole("heading", { name: "Compose Workflows Visually" })).toBeVisible();
    for (const step of ["Connect CRM", "Filter Leads", "Enrich Data", "Send to Slack"]) {
      await expect(page.getByText(step, { exact: true })).toBeVisible();
    }
    await expect(page.getByText("Pipeline Active")).toBeVisible();
    await expect(page.getByText("Optimization score: 78%")).toHaveCount(0);
  });
});

test.describe("legal pages", () => {
  for (const [path, title, hasCaption] of [
    ["/privacy", "Privacy Policy", true],
    ["/terms", "Terms & Conditions", true],
    ["/accessibility", "Accessibility Statement", false],
    ["/refund-policy", "Refund Policy", true],
  ] as const) {
    test(`${path} renders the ${title}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
      // The reference shows the "A legal disclaimer" caption on every legal
      // page EXCEPT accessibility (verified against the live DOM).
      const caption = page.getByText("A legal disclaimer");
      if (hasCaption) {
        await expect(caption).toBeVisible();
      } else {
        await expect(caption).toHaveCount(0);
      }
      // Body sections render.
      await expect(page.locator("main section").first()).toBeVisible();
      // The footer still carries the legal nav.
      await expect(page.locator("footer").getByRole("link", { name: "Privacy", exact: true })).toBeVisible();
    });
  }

  test("accessibility page carries the reference's two lists (parity)", async ({ page }) => {
    await page.goto("/accessibility");
    // The 8-item commitment list (list-disc list-inside mt-4 space-y-2).
    const commitments = page.locator("main ul.list-disc");
    await expect(commitments).toBeVisible();
    await expect(commitments.locator("li")).toHaveCount(8);
    await expect(commitments.getByText("Used the Accessibility Wizard to find and fix potential accessibility issues")).toBeVisible();
    await expect(commitments.getByText("Ensured all videos, audio, and files on the site are accessible")).toBeVisible();
    // The 4-item coordinator contact list (list-none mt-4 space-y-1).
    const coordinators = page.locator("main ul.list-none");
    await expect(coordinators).toBeVisible();
    await expect(coordinators.locator("li")).toHaveCount(4);
    await expect(coordinators.getByText("[Name of the accessibility coordinator]")).toBeVisible();
    await expect(coordinators.getByText("[Enter any additional contact details if relevant / available]")).toBeVisible();
  });
});

test.describe("login page (reference bare-card parity)", () => {
  test("renders no anchors — the reference auth card is a dead-end card", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to SAAS Company", level: 1 })).toBeVisible();
    await expect(page.locator("a")).toHaveCount(0);
    await expect(page.locator("nav")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
  });
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
