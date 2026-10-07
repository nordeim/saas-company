import { expect, test } from "@playwright/test";

/**
 * Session 9 palette-parity pins (docs/remediation-plan-session9.md F1/F2/
 * F3/F4/F5). The Session-9 audit surveyed the RENDERED PALETTE for the
 * first time — every default-palette color this app uses, converted to
 * sRGB and compared against the live's v3-era hex values:
 *
 *   1. Tailwind v4's default palette is OKLCH-DEFINED — the oklch→sRGB
 *      roundtrip renders up to 69 RGB units off the v3 hex the live's
 *      compiled css carries (green-400: rgb(5,223,114) vs #4ade80's
 *      rgb(74,222,128); the problem cards' red-500, the stars'
 *      yellow-400, the features tabs' gray-600, the login slates, the
 *      avatar gradient endpoints — all drifted). Fixed by pinning the 30
 *      drifted, used tokens to the v3 hex in @theme (F1).
 *   2. The login Sign in's keyboard ring rendered currentColor WHITE —
 *      v4's `ring-ring` utility reads `--color-ring` (not in @theme → the
 *      utility never emitted → the class inert). The live renders a
 *      slate-950 ring. Fixed with `--color-ring: hsl(240 10% 3.9%)` (F2).
 *   3. The violet ::selection rule was an invention — the live ships no
 *      ::selection rule anywhere (platform default). Removed (F3).
 *   4. The live's /login sets `html { overscroll-behavior-y: none }` —
 *      pinned route-scoped (F4).
 *   5. The live's login bundle ships a light --border (gray-200); the
 *      clone's login inherited the dark #242424 (inert — width-0
 *      borders). Pinned for computed parity (F5).
 */

test.describe("landing palette (Session-9 F1)", () => {
  test("the problem cards' solid red-500 chip renders the live's #ef4444", async ({ page }) => {
    await page.goto("/");
    const bg = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('[class*="bg-red-500"]')).find(
        (n) => !n.className.toString().includes("/"),
      );
      return el ? getComputedStyle(el).backgroundColor : "NOT FOUND";
    });
    expect(bg).toBe("rgb(239, 68, 68)");
  });

  test("the stars' fill-yellow-400 renders the live's #facc15", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y <= H; y += 800) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    const fill = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("svg")).find(
        (s) => (s.getAttribute("class") || "").includes("yellow-400"),
      );
      return el ? getComputedStyle(el).fill : "NOT FOUND";
    });
    expect(fill).toBe("rgb(250, 204, 21)");
  });

  test("the features tabs' text-gray-600 renders the live's #4b5563", async ({ page }) => {
    await page.goto("/");
    const color = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText.trim() === "Real-time Analytics",
      );
      return el ? getComputedStyle(el).color : "NOT FOUND";
    });
    expect(color).toBe("rgb(75, 85, 99)");
  });

  test("the features card's bg-green-500 renders the live's #22c55e", async ({ page }) => {
    await page.goto("/");
    const bg = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('[class*="bg-green-500"]')).find(
        (n) => !n.className.toString().includes("/"),
      );
      return el ? getComputedStyle(el).backgroundColor : "NOT FOUND";
    });
    expect(bg).toBe("rgb(34, 197, 94)");
  });

  test("the avatar gradients' purple-600 endpoint renders the live's #9333ea", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y <= H; y += 800) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    const img = await page.evaluate(() => {
      // strip-scoped gradient circles carrying the live's per-person classes
      const el = Array.from(document.querySelectorAll("div, span")).find(
        (n) =>
          (n.className.toString().includes("from-violet") &&
            n.className.toString().includes("to-purple-600")) ||
          n.className.toString().includes("to-blue-600"),
      );
      return el ? getComputedStyle(el).backgroundImage : "NOT FOUND";
    });
    // purple-600 = rgb(147, 51, 234); blue-600 = rgb(37, 99, 235) — the v3 hex
    expect(
      img.includes("rgb(147, 51, 234)") || img.includes("rgb(37, 99, 235)"),
      `gradient endpoints to carry the v3 hex (got: ${img})`,
    ).toBe(true);
  });

  test("the login Google button's slate-700 text renders the live's #334155", async ({ page }) => {
    await page.goto("/login");
    const color = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Google"),
      );
      return el ? getComputedStyle(el).color : "NOT FOUND";
    });
    expect(color).toBe("rgb(51, 65, 85)");
  });

  test("the login Google button's slate-200 border renders the live's #e2e8f0", async ({ page }) => {
    await page.goto("/login");
    const border = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("button")).find((b) =>
        b.innerText.includes("Google"),
      );
      return el ? getComputedStyle(el).borderColor : "NOT FOUND";
    });
    expect(border).toBe("rgb(226, 232, 240)");
  });

  test("the Sign in button's slate-900 bg renders the live's #0f172a", async ({ page }) => {
    await page.goto("/login");
    const bg = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText.trim() === "Sign in",
      );
      return el ? getComputedStyle(el).backgroundColor : "NOT FOUND";
    });
    expect(bg).toBe("rgb(15, 23, 42)");
  });
});

test.describe("login focus + route chrome (Session-9 F2/F4/F5)", () => {
  test("the keyboard-focused Sign in renders the live's slate-950 ring", async ({ page }) => {
    await page.goto("/login");
    // Session 11 F1 — TWO flake sources fixed:
    // (a) the tab ORDER shifts with hydration timing: a blind Tab×4
    //     sometimes lands on an input, whose slate-400 focus ring is a
    //     DIFFERENT pin — tab until the ACTIVE element is the Sign in
    //     button (bounded);
    // (b) the ring's box-shadow TRANSITIONS in (observed 3.98466px /
    //     alpha .996 frames), and Chromium serializes the settled value
    //     as either rgb(9, 9, 11) or rgba(9, 9, 11, 1) — poll the shadow
    //     to its settled 4px form, matching either spelling, instead of
    //     string-matching at a fixed 200ms offset.
    for (let i = 0; i < 10; i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el instanceof HTMLButtonElement && (el.innerText || "").trim() === "Sign in";
      });
      if (focused) break;
      await page.keyboard.press("Tab");
    }
    await expect
      .poll(
        async () => {
          const shadow = await page.evaluate(() => {
            const el = document.activeElement;
            return el instanceof HTMLButtonElement && (el.innerText || "").trim() === "Sign in"
              ? getComputedStyle(el).boxShadow
              : "NOT FOCUSED ON SIGN IN";
          });
          return shadow;
        },
        { timeout: 10_000 },
      )
      .toMatch(/rgba?\(9, 9, 11(, 1)?\) 0px 0px 0px 4px/);
  });

  test("the focused email input's ring renders the live's slate-400 (#94a3b8)", async ({ page }) => {
    await page.goto("/login");
    await page.locator("input#email").focus();
    await page.waitForTimeout(200);
    const shadow = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? getComputedStyle(el).boxShadow : "NO ACTIVE ELEMENT";
    });
    expect(shadow.includes("rgb(148, 163, 184)")).toBe(true);
  });

  test("the Sign in's implicit border color matches the live's login bundle (gray-200, inert)", async ({ page }) => {
    await page.goto("/login");
    const border = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText.trim() === "Sign in",
      );
      return el ? getComputedStyle(el).borderColor : "NOT FOUND";
    });
    expect(border).toBe("rgb(229, 231, 235)");
  });

  test("the login route pins the live's html overscroll-behavior-y: none", async ({ page }) => {
    await page.goto("/login");
    const y = await page.evaluate(() =>
      getComputedStyle(document.documentElement).overscrollBehaviorY,
    );
    expect(y).toBe("none");
  });

  test("the landing keeps overscroll-behavior-y: auto (the pin is login-scoped)", async ({ page }) => {
    await page.goto("/");
    const y = await page.evaluate(() =>
      getComputedStyle(document.documentElement).overscrollBehaviorY,
    );
    expect(y).toBe("auto");
  });
});

test.describe("the ::selection removal (Session-9 F3)", () => {
  test("no ::selection rule ships — the computed selection bg is transparent (platform default)", async ({ page }) => {
    await page.goto("/");
    const bg = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.textContent = "selection probe";
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe, "::selection");
      const bgc = cs.backgroundColor;
      probe.remove();
      return bgc;
    });
    expect(bg).toBe("rgba(0, 0, 0, 0)");
  });
});
