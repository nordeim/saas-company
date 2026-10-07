import { expect, test } from "@playwright/test";

// Session 3 brand-parity pins — the measured token/copy/metadata contracts
// from the live reference (audit: docs/remediation-plan-session3.md).
// Every check here was observed RED against the pre-remediation build.
//
// Color notes: Tailwind v4 may serialize gradient stops through oklab, so
// the assertions match the rgb components in either spelling (the D6 rule).

// Convert the first color stop of a computed gradient to sRGB triplets,
// accepting either serialization (v4 emits oklab(...) for alpha colors —
// rendering-identical to rgba; the D6 rule). Returns [r,g,b] or null.
async function firstGradientStopRgb(page: import("@playwright/test").Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const bg = getComputedStyle(el).backgroundImage;
    const rgbM = bg.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)/);
    if (rgbM) return [+rgbM[1], +rgbM[2], +rgbM[3]];
    const labM = bg.match(/oklab\(([-\d.]+) ([-\d.]+) ([-\d.]+)/);
    if (!labM) return null;
    // oklab → linear sRGB (Björn Ottosson), then gamma-encode.
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
}

function expectRgb(actual: number[] | null, expected: [number, number, number], tol = 2) {
  expect(actual, "gradient stop resolved to rgb").not.toBeNull();
  for (let i = 0; i < 3; i++) {
    expect(Math.abs((actual as number[])[i] - expected[i]), `channel ${i}`).toBeLessThanOrEqual(tol);
  }
}

test.describe("brand tokens (Session 3)", () => {
  test("primary gradients render the reference's #8624ff purple", async ({ page }) => {
    await page.goto("/");
    // A from-primary surface: the dashboard mockup's glow / chart bars.
    const bar = page.locator("[class*='from-primary']").first();
    await expect(bar).toHaveCount(1);
    // Live: from-primary → rgba(134, 36, 255, a) = hsl(267 100% 57%).
    expectRgb(await firstGradientStopRgb(page, "[class*='from-primary']"), [134, 36, 255]);
  });

  test("electric-blue gradients render the reference's #0055ff blue", async ({ page }) => {
    await page.goto("/");
    // The pricing "Most Popular" badge: from-violet to-electric-blue.
    const badge = page.locator("div.absolute.-top-3\\.5 > div").first();
    await expect(badge).toBeVisible();
    const bg = await badge.evaluate((el) => getComputedStyle(el).backgroundImage);
    // Gradient present and its violet start stop resolves (from-violet).
    expect(bg).toContain("gradient");
    // Direct value pin: the theme var holds the literal token (v4 emits the
    // declared value; the browser may serialize as the 3-digit shorthand).
    const expandHex = (h: string) =>
      /^#[0-9a-f]{3}$/.test(h) ? "#" + [...h.slice(1)].map((c) => c + c).join("") : h;
    const token = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-electric-blue").trim()
    );
    expect(expandHex(token.toLowerCase())).toBe("#0055ff");
    const accentToken = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim()
    );
    expect(expandHex(accentToken.toLowerCase())).toBe("#0055ff");
  });

  test("violet stays the reference's #d500ff magenta", async ({ page }) => {
    await page.goto("/");
    const el = page.locator(".text-violet").first();
    await expect(el).toBeVisible();
    const color = await el.evaluate((n) => getComputedStyle(n).color);
    expect(color).toContain("213, 0, 255");
  });
});

test.describe("typography (Session 3)", () => {
  test("body font resolves Vend Sans (the Display cut) first", async ({ page }) => {
    await page.goto("/");
    const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    // The reference's body chain is "Vend Sans", sans-serif — the Display
    // cut renders every element on the live (no element resolves the Text
    // cut there). The first face in the chain is the rendered one.
    const firstFace = font.split(",")[0].trim();
    expect(firstFace).toBe('"Vend Sans"');
  });
});

test.describe("copy parity (Session 3)", () => {
  test("testimonial headlines use the reference's straight quotes", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#testimonials");
    await expect(section).toBeVisible();
    const text = await section.innerText();
    expect(text).toContain('"Cut our pipeline errors by 94%"');
    expect(text).toContain('"Enterprise-grade, startup-fast"');
    expect(text).not.toContain("\u201c"); // no curly left quote anywhere
    expect(text).not.toContain("\u201d"); // no curly right quote anywhere
  });

  test("testimonial copy reads on-prem (not on-premise)", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("#testimonials").innerText();
    expect(text).toContain("on-prem option");
    expect(text).not.toContain("on-premise");
  });

  test("the AI-suggestion card uses straight quotes", async ({ page }) => {
    await page.goto("/");
    const card = page.getByText("Merge steps 3-5 to save 12 min/run");
    await expect(card).toBeVisible();
    await expect(card).toHaveText('"Merge steps 3-5 to save 12 min/run"');
  });
});

test.describe("page titles (Session 3)", () => {
  test("landing and login keep the bare site title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("SAAS Company");
    await page.goto("/login");
    await expect(page).toHaveTitle("SAAS Company");
  });

  test("content pages use the reference's short-name | site pattern", async ({ page }) => {
    const cases: Array<[string, string]> = [
      ["/faq", "FAQ | SAAS Company"],
      ["/privacy", "Privacy | SAAS Company"],
      ["/terms", "Terms | SAAS Company"],
      ["/accessibility", "Accessibility | SAAS Company"],
      ["/refund-policy", "Refund Policy | SAAS Company"],
    ];
    for (const [path, title] of cases) {
      await page.goto(path);
      await expect(page, `title for ${path}`).toHaveTitle(title);
    }
  });
});

test.describe("404 card (Session 3)", () => {
  test("quotes the missing pathname like the reference", async ({ page }) => {
    await page.goto("/definitely-not-a-session3-route");
    const span = page.locator("p.text-slate-600 span.font-medium.text-slate-700");
    await expect(span).toHaveText('"definitely-not-a-session3-route"');
    await expect(page.locator("p.text-slate-600")).toContainText(
      'The page "definitely-not-a-session3-route" could not be found in this application.'
    );
  });
});

test.describe("smooth scrolling (Session 3)", () => {
  test("Lenis is active like the reference", async ({ page }) => {
    await page.goto("/");
    // Lenis mounts in a client effect after hydration — poll for it rather
    // than racing the first evaluate (the live's own window.lenis is the
    // plain object the library assigns: { version, ... }).
    await expect
      .poll(
        () => page.evaluate(() => typeof (window as unknown as { lenis?: unknown }).lenis),
        { timeout: 5_000 }
      )
      .toBe("object");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.className), { timeout: 5_000 })
      .toContain("lenis");
  });
});

test.describe("html parity extras (Session 3)", () => {
  test("the login shell carries the reference's noscript fallback", async ({ page }) => {
    // The live serves the Vite noscript ONLY on the login route's shell
    // (a direct body child there; absent on every other route's DOM).
    await page.goto("/login");
    const html = await page.content();
    expect(html).toContain("You need to enable JavaScript to run this app.");
    // …and it must NOT leak onto the other routes.
    await page.goto("/");
    const landingHtml = await page.content();
    expect(landingHtml).not.toContain("You need to enable JavaScript");
  });

  test("emits the apple-mobile-web-app-title meta", async ({ page }) => {
    await page.goto("/");
    const meta = page.locator('meta[name="apple-mobile-web-app-title"]');
    await expect(meta).toHaveAttribute("content", "SAAS Company");
  });
});

test.describe("login route theme + head parity (Session 4)", () => {
  // The live's /login loads its OWN css bundle (static/index-*.css) whose
  // :root is the LIGHT theme: --background 0 0% 100%, --foreground
  // 240 10% 3.9% (zinc-950), and its body renders the Tailwind default
  // system font stack — measured on the live: bg rgb(255,255,255), color
  // rgb(9,9,11), font "ui-sans-serif, system-ui, …". The clone's /login
  // must swap the body theme the same way (dark theme stays on every
  // other route).
  test("login swaps the body to the reference's light theme + system font", async ({ page }) => {
    await page.goto("/login");
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
      .toBe("rgb(255, 255, 255)");
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).color))
      .toBe("rgb(9, 9, 11)");
    const loginFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    // The first face is what renders — the live resolves the system stack
    // on /login (NOT Vend Sans; that's the landing's font).
    expect(loginFont.split(",")[0].trim().replace(/["']/g, "")).toBe("ui-sans-serif");
  });

  test("login input text is dark (visible) like the reference", async ({ page }) => {
    // The reference's inputs inherit zinc-950 through the card — on the
    // clone they used to inherit the dark theme's white through
    // --color-card-foreground, rendering typed text near-invisible on the
    // light slate inputs.
    await page.goto("/login");
    const inputColor = await page.evaluate(
      () => getComputedStyle(document.querySelector('input[type="email"]')!).color
    );
    expect(inputColor).toBe("rgb(9, 9, 11)");
  });

  test("login card spacing matches the reference (inline-label space-y)", async ({ page }) => {
    // The live's compiled space-y-1.5 puts the gap on the FOLLOWING sibling
    // (v3-style margin-top) — measured label→input gap 10px, card 746px at
    // 1440×900. v4's margin-bottom-on-preceding is lost on inline labels,
    // which had tightened the card by 12px (the route style restores it).
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    const m = await page.evaluate(() => {
      const label = document.querySelector('label[for="email"]')!;
      const input = document.querySelector('input[type="email"]')!;
      const card = document.querySelector("main > div > div")!;
      const lr = label.getBoundingClientRect();
      const ir = input.getBoundingClientRect();
      return {
        gap: ir.top - (lr.top + lr.height),
        cardH: card.getBoundingClientRect().height,
      };
    });
    expect(Math.round(m.gap)).toBe(10);
    expect(Math.round(m.cardH)).toBeGreaterThanOrEqual(742);
    expect(Math.round(m.cardH)).toBeLessThanOrEqual(750);
  });

  test("the dark routes keep the dark body theme (regression guard)", async ({ page }) => {
    for (const path of ["/", "/faq"]) {
      await page.goto(path);
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(bg).toBe("rgb(0, 0, 0)");
      const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
      expect(font.split(",")[0].trim().replace(/["']/g, "")).toBe("Vend Sans");
    }
  });

  test("emits the reference's apple-mobile-web-app-status-bar-style", async ({ page }) => {
    await page.goto("/");
    const meta = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]');
    await expect(meta).toHaveAttribute("content", "black");
  });
});
