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

test.describe("typeface (Session 5)", () => {
  // Session 5 font forensics: the live renders GOOGLE FONTS' "Vend Sans"
  // variable font (wght 300-700, fonts.gstatic.com/s/vendsans/v1/…), NOT
  // Wix Madefor as Session 1 believed (the Wix faces are declared only in
  // the live's login bundle, whose route renders the system stack). The
  // Session-1 files were Wix Madefor Display/Text — ~2.4% wider glyphs
  // (canvas "Annual" @14px: live 44.31px vs Wix 45.37px), the root cause
  // of the pricing pill deltas and the D19 Pro-card +27px.

  test("the font chain is exactly the reference's (no Text cut, no system faces)", async ({ page }) => {
    await page.goto("/");
    const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    // The live's :root: --font-heading/--font-body: "Vend Sans", sans-serif.
    expect(font).toBe('"Vend Sans", sans-serif');
  });

  test("the loaded glyph metrics match Google's Vend Sans", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const w = await page.evaluate(() => {
      const c = document.createElement("canvas").getContext("2d")!;
      c.font = '14px "Vend Sans"';
      return c.measureText("Annual").width;
    });
    // Live measures 44.31px with Google's cut; the Wix Madefor file
    // measured 45.37px. Pin the authentic metrics.
    expect(w).toBeGreaterThanOrEqual(43.8);
    expect(w).toBeLessThanOrEqual(44.8);
  });

  test("no Wix Madefor / Text-cut family is registered", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const families = await page.evaluate(() =>
      [...new Set([...document.fonts].map((f) => f.family))],
    );
    expect(families).not.toContain("Vend Sans Text");
    expect(families).toContain("Vend Sans");
  });

  test("the pricing Annual pill is the live's 161px (not the Wix 165px)", async ({ page }) => {
    await page.goto("/");
    const pill = page.locator("#pricing button", { hasText: "Annual" });
    await expect(pill).toBeVisible();
    const w = await pill.evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.round(w)).toBeGreaterThanOrEqual(159);
    expect(Math.round(w)).toBeLessThanOrEqual(163);
  });

  test("the popular plan card renders UNSCALED like the live (D19 closure)", async ({ page }) => {
    // The live's markup carries scale utilities its compiled css never
    // emits — its Pro card renders unscaled at 540px (measured at 1440 and
    // 390, scale: none). The old clone's v4 scale utilities really scaled:
    // 540 × 1.05 = the 567px D19 delta.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const pro = page.locator("#pricing h3", { hasText: "Pro" }).locator(
      "xpath=ancestor::div[contains(@class,'rounded-2xl')][1]",
    );
    const m = await pro.evaluate((el) => ({
      h: Math.round(el.getBoundingClientRect().height),
      scale: getComputedStyle(el).scale,
    }));
    expect(m.scale).toBe("none");
    expect(m.h).toBeGreaterThanOrEqual(534);
    expect(m.h).toBeLessThanOrEqual(546);
  });

  test("the testimonials strip is full-bleed like the live (no px-6)", async ({ page }) => {
    // The live's strip: scrollWidth 2408 at 390 = 8×280 + 7×24 with ZERO
    // horizontal padding — the first card starts at x=0. The old clone's
    // px-6 pb-4 had inset the cards 24px and stretched scrollWidth +48px.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const strip = page
      .locator("section", { hasText: /loved by|teams like/i })
      .locator("div[class*='overflow-x-auto']")
      .first();
    const m = await strip.evaluate((el) => ({
      sw: el.scrollWidth,
      pad: getComputedStyle(el).padding,
      x: Math.round(el.getBoundingClientRect().x),
    }));
    expect(m.pad).toBe("0px");
    expect(m.x).toBe(0);
    expect(m.sw).toBeLessThanOrEqual(2412);
  });
});

test.describe("focus ring (Session 5)", () => {
  // The live's base layer: * { border-color: hsl(var(--border));
  // outline-color: hsl(var(--ring) / .5) } with --ring: 290 100% 50% —
  // the UA default focus ring renders VIOLET at 50% (measured on a
  // focused nav link: auto 1px rgba(213,0,255,0.5)). The clone's
  // :focus-visible { outline: 2px solid primary } was an invention.

  test("a focused nav link's outline-color is the reference's violet/50", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("nav a", { hasText: "Features" }).first();
    await link.evaluate((el) => (el as HTMLElement).focus());
    const outline = await link.evaluate(
      (el) => getComputedStyle(el).outlineColor + " | " + getComputedStyle(el).outlineStyle,
    );
    // Accept rgba or the oklab serialization (the D6 rule).
    const [color, style] = outline.split(" | ");
    const rgba = /^rgba?\(213, 0, 255, 0\.5\)$/.test(color);
    const oklab = /^oklab\(/.test(color) && style === "auto";
    expect(rgba || oklab, `outline ${outline} to be violet/50`).toBe(true);
    if (rgba) expect(color).toBe("rgba(213, 0, 255, 0.5)");
  });

  test("keyboard focus renders the UA default ring, not an invented solid one", async ({ page }) => {
    await page.goto("/");
    // Tab into the page until the Features nav link is focused.
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      const isFeatures = await page.evaluate(() => {
        const a = document.activeElement as HTMLElement | null;
        return !!a && a.tagName === "A" && /Features/.test(a.innerText || "");
      });
      if (isFeatures) break;
    }
    const style = await page.evaluate(() => {
      const a = document.activeElement as HTMLElement | null;
      return a ? getComputedStyle(a).outlineStyle : "no-active-element";
    });
    // The live renders the UA default (auto); the invented rule rendered
    // solid 2px #8624ff.
    expect(style).toBe("auto");
  });
});
