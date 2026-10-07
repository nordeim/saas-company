import { expect, test } from "@playwright/test";

/**
 * Session 6 parity pins — the class-string-layer audit's visual findings
 * (docs/remediation-plan-session6.md F1–F4, F6, F7). Every check was
 * measured on the live reference with computed-style probes; each was
 * observed RED against the pre-fix build.
 *
 * Color assertions accept both the rgba and oklab spellings (D6): Tailwind
 * v4 serializes alpha colors through oklab — rendering-identical.
 */

const oklabOrRgb = (value: string) => value; // documented no-op for clarity

test.describe("testimonials section (Session-6 F1/F3)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#testimonials");
    await page.waitForTimeout(600);
  });

  test("avatars cycle the reference's four per-person gradients", async ({ page }) => {
    // Scoped to the strip's 280px cards (other gradient circles exist on the page).
    const avatars = page.locator('div.w-\\[280px\\] div.w-10.h-10.rounded-full');
    await expect(avatars).toHaveCount(8);

    // The live's per-person gradient classes, in card order (computed
    // probes): SC violet→purple-600, MR electric-blue→blue-600,
    // EW purple-500→violet, DP blue-500→electric-blue; cards 5–8 repeat.
    const expected = [
      "from-violet to-purple-600", // SC
      "from-electric-blue to-blue-600", // MR
      "from-purple-500 to-violet", // EW
      "from-blue-500 to-electric-blue", // DP
    ];
    for (let i = 0; i < 8; i++) {
      const cls = (await avatars.nth(i).getAttribute("class")) ?? "";
      expect(cls).toContain(expected[i % 4]);
      // The classes must RENDER (inert-class guard): a real gradient shows.
      const img = (await avatars.nth(i).evaluate((el) => getComputedStyle(el).backgroundImage)) as string;
      expect(img).toContain("linear-gradient(to right bottom");
      expect(img).not.toContain("none");
    }
  });

  test("the four avatar gradients are NOT all identical (the pre-fix bug)", async ({ page }) => {
    const avatars = page.locator('div.w-\\[280px\\] div.w-10.h-10.rounded-full');
    const imgs: string[] = [];
    for (let i = 0; i < 4; i++) {
      imgs.push(await avatars.nth(i).evaluate((el) => getComputedStyle(el).backgroundImage));
    }
    const unique = new Set(imgs);
    expect(unique.size).toBe(4); // the live has FOUR distinct per-person gradients
  });

  test("edge fades darken the strip's actual edges (direction, Session-6 F3)", async ({ page }) => {
    const fades = page.locator("div.absolute.top-0.bottom-0.from-black");
    await expect(fades).toHaveCount(2);

    const left = await fades.first().evaluate((el) => getComputedStyle(el).backgroundImage);
    const right = await fades.nth(1).evaluate((el) => getComputedStyle(el).backgroundImage);

    // LIVE: left fade = to RIGHT (black at the viewport's left edge);
    // right fade = to LEFT (black at the right edge).
    expect(left).toContain("to right");
    expect(right).toContain("to left");
  });
});

test.describe("pricing section (Session-6 F2)", () => {
  test("the Enterprise 'Custom' price renders like the reference: a text-3xl DIV, 30px/36px", async ({ page }) => {
    await page.goto("/#pricing");
    await page.waitForTimeout(600);

    const custom = page.getByText("Custom", { exact: true }).first();
    await expect(custom).toBeVisible();

    const info = await custom.evaluate((el) => {
      const c = getComputedStyle(el);
      return {
        tag: el.tagName,
        fontSize: c.fontSize,
        height: Math.round(el.getBoundingClientRect().height),
        parentCls: el.parentElement!.className,
      };
    });
    // The live renders "Custom" as a DIV at 30px, ~36px tall, directly in
    // the mb-8 block (no flex wrapper, no text-5xl span).
    expect(info.tag).toBe("DIV");
    expect(info.fontSize).toBe("30px");
    expect(info.height).toBeGreaterThanOrEqual(34);
    expect(info.height).toBeLessThanOrEqual(38);
    expect(info.parentCls).toContain("mb-8");
    expect(info.parentCls).not.toContain("flex");
  });
});

test.describe("One Platform AI-suggestion paragraph (Session-6 F4)", () => {
  test("renders FULL white like the live's inert-class truth", async ({ page }) => {
    await page.goto("/#features");
    await page.waitForTimeout(600);

    const p = page.locator("p.font-body.leading-relaxed.text-center.max-w-lg", {
      hasText: "NovaAI connects all your data sources",
    });
    await expect(p).toHaveCount(1);

    const color = await p.evaluate((el) => getComputedStyle(el).color);
    // The live's own class is a broken inert token, so the paragraph
    // INHERITS full white — the rendered truth (Session-6 F4).
    expect(color).toBe("rgb(255, 255, 255)");
  });
});

test.describe("body parity (Session-6 F6)", () => {
  test("the body carries no classes and no invented antialiasing", async ({ page }) => {
    await page.goto("/");
    const info = await page.evaluate(() => {
      const style = getComputedStyle(document.body) as CSSStyleDeclaration & {
        webkitFontSmoothing?: string;
      };
      return {
        cls: document.body.getAttribute("class") ?? "",
        smoothing: style.webkitFontSmoothing,
        bg: getComputedStyle(document.body).backgroundColor,
        color: getComputedStyle(document.body).color,
        font: getComputedStyle(document.body).fontFamily,
      };
    });
    // LIVE: <body> has NO class attribute; smoothing = auto; the stylesheet
    // (not utilities) paints it black/white/Vend Sans.
    expect(info.cls).toBe("");
    expect(info.smoothing).toBe("auto");
    expect(info.bg).toBe("rgb(0, 0, 0)");
    expect(info.color).toBe("rgb(255, 255, 255)");
    expect(info.font).toContain("Vend Sans");
  });
});

test.describe("class-string cleanups (Session-6 F7)", () => {
  test("the nav pill's inner span matches the live's exact classes", async ({ page }) => {
    await page.goto("/");
    const pill = page.locator("nav a", { hasText: "Get Started" }).first();
    const inner = pill.locator("span.relative.z-10");
    await expect(inner).toHaveCount(1);
    await expect(inner).toHaveClass("relative z-10 text-black");
  });

  test("the burger button carries no invented transition class", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const burger = page.locator("button.md\\:hidden").first();
    const cls = await burger.getAttribute("class");
    // LIVE: "md:hidden text-white/80 hover:text-white" (the aria-expanded
    // superset D22 stays).
    expect(cls).toBe("md:hidden text-white/80 hover:text-white");
    expect(cls).not.toContain("transition-colors");
  });

  test("the dashboard mockup link carries no dead overlay span", async ({ page }) => {
    await page.goto("/#features");
    const mockup = page.locator("a", { hasText: "Dashboard" }).first();
    const spanCount = await mockup.locator("span.absolute.inset-0").count();
    expect(spanCount).toBe(0);
  });
});
