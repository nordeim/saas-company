import { expect, test } from "@playwright/test";

/**
 * Session 46 — the TWENTY-FIRST SURFACE (the clipboard/keyboard +
 * drag-and-drop + offline-render contracts) + the mobile-nav CLICKABILITY
 * record (the operator's explicit focus).
 *
 * THE MEASUREMENTS (research/recon-s46.mjs + adj2–adj6, paired
 * clone-vs-live):
 *
 * THE CLIPBOARD/KEYBOARD EMPTY-SET (D157) — parity. Neither side ships
 * app-level clipboard interference or hotkeys: `document.oncopy`/`oncut`/
 * `onpaste` null on both, the body `user-select` auto on both, ZERO
 * `::selection` rules on both (the S44 record re-verified), and the
 * listener-census deltas are framework internals (React/Lenis vs the
 * Base44 runtime — the D125 law). The live's compiled css carries one
 * `.select-none { user-select: none; }` rule with ZERO carriers on any
 * probed route — inert reference residue (the gotcha-6 family extended to
 * the rule layer); the clone ships no such rule.
 *
 * THE DRAG-AND-DROP NATIVE-OVERFLOW CONTRACT (D158) — parity. The
 * testimonial strip is structurally IDENTICAL across sides (`cursor:
 * grab`, `overflow-x: auto`, `scroll-snap-type: none`, `touch-action:
 * auto`, no `draggable` attribute, 8 cards, scrollWidth 3208 at 1440) and
 * behaviorally identical: a real 360px mouse drag leaves scrollLeft
 * unchanged on BOTH sides, the native wheel does not horizontal-scroll on
 * either side, and zero drag-family listeners are scoped to the strip
 * subtree on either side — the strip scrolls only through native
 * touch/trackpad/scrollbar; the grab cursor is cosmetic on both.
 *
 * THE OFFLINE RENDER SUPERSET (D159) — the registered platform superset
 * (the D125 family). With every non-document request aborted, the clone's
 * SSR-first architecture renders the FULL landing (718 words measured in
 * the recon; the pin floors at 700 to absorb harmless copy drift — the h1
 * and the hero <video> present) where the live's SPA renders a 136-word
 * shell (1 body child, no video). Never fix toward the live's empty
 * shell.
 *
 * THE BURGER CLICKABILITY RECORD (D160) — the registered superset. The
 * live's burger icon (y16-40 at 390) is TWO-THIRDS UNCLICKABLE: two
 * dormant react-hot-toast containers (`fixed top-0 z-[100]`,
 * `pointer-events: auto`, a 32px band) sit over the icon — real clicks at
 * its upper (y20) and center (y28) points hit the toaster and the menu
 * never opens; only the bottom sliver (y36) works. The CLONE's burger
 * opens at EVERY point of the icon. The live's menu panel ITSELF is
 * byte-identical when opened programmatically (the 7-row/44px black-95
 * contract this clone was built from) — the affordance, not the
 * component, is degraded on the reference.
 *
 * These pins version the CLONE side of the contracts so a future
 * regression (an invented clipboard guard, a JS drag-pan, a lost SSR
 * render, a partially-blocked burger) surfaces loudly.
 */

test.describe("the clipboard/keyboard empty-set (Session 46 — D157)", () => {
  test("no clipboard interference: oncopy/oncut/onpaste null + user-select auto", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const landing = await page.evaluate(() => ({
      oncopy: document.oncopy === null,
      oncut: document.oncut === null,
      onpaste: document.onpaste === null,
      userSelect: getComputedStyle(document.body).userSelect,
    }));
    expect(landing.oncopy).toBe(true);
    expect(landing.oncut).toBe(true);
    expect(landing.onpaste).toBe(true);
    expect(landing.userSelect).toBe("auto");

    await page.goto("/faq", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const faq = await page.evaluate(() => ({
      oncopy: document.oncopy === null,
      userSelect: getComputedStyle(document.body).userSelect,
    }));
    expect(faq.oncopy).toBe(true);
    expect(faq.userSelect).toBe("auto");
  });

  test("zero ::selection rules in the CSSOM (the S44 record re-pinned) + zero .select-none carriers", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const scan = await page.evaluate(() => {
      let selectionRules = 0;
      let userSelectRules = 0;
      const walk = (sheet: CSSStyleSheet) => {
        try {
          for (const rule of sheet.cssRules) {
            if (rule instanceof CSSMediaRule) walk(rule as unknown as CSSStyleSheet);
            if ((rule as CSSStyleRule).selectorText) {
              const st = (rule as CSSStyleRule).selectorText;
              if (/::selection|::-moz-selection/i.test(st)) selectionRules += 1;
              if (/user-select/i.test(rule.cssText)) userSelectRules += 1;
            }
          }
        } catch {
          /* cross-origin sheet */
        }
      };
      for (const s of document.styleSheets) walk(s);
      return {
        selectionRules,
        userSelectRules,
        selectNoneCarriers: document.querySelectorAll(".select-none").length,
      };
    });
    expect(scan.selectionRules).toBe(0);
    // The clone ships NO user-select rules at all (the live's single inert
    // .select-none definition is reference css residue — gotcha 6: never
    // ship inert css to chase rule-set parity).
    expect(scan.userSelectRules).toBe(0);
    expect(scan.selectNoneCarriers).toBe(0);
  });
});

test.describe("the drag-and-drop native-overflow contract (Session 46 — D158)", () => {
  // The strip finder (the recon's instrument — the S43/S45 parameter
  // pattern: the helper takes the page, never a module-scope reference):
  // the widest horizontally-scrollable div — the testimonial card row.
  const findStrip = (page: import("@playwright/test").Page) =>
    page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll("div")).filter((d) => {
        const cs = getComputedStyle(d);
        return /(auto|scroll|hidden)/.test(cs.overflowX) && d.scrollWidth > d.clientWidth + 40;
      });
      const strip = candidates.sort((a, b) => b.scrollWidth - a.scrollWidth)[0];
      if (!strip) return { found: false };
      const cs = getComputedStyle(strip);
      return {
        found: true,
        cursor: cs.cursor,
        overflowX: cs.overflowX,
        snap: cs.scrollSnapType,
        touchAction: cs.touchAction,
        draggable: strip.getAttribute("draggable"),
        scrollWidth: strip.scrollWidth,
        cards: strip.querySelectorAll(":scope > *").length,
      };
    });

  const stripScrollLeft = (page: import("@playwright/test").Page) =>
    page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll("div")).filter((d) => {
        const cs = getComputedStyle(d);
        return /(auto|scroll|hidden)/.test(cs.overflowX) && d.scrollWidth > d.clientWidth + 40;
      });
      return candidates.sort((a, b) => b.scrollWidth - a.scrollWidth)[0]?.scrollLeft ?? null;
    });

  test("the strip's structural contract: grab cursor, auto overflow, no snap, 8 cards", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const strip = await findStrip(page);
    expect(strip.found).toBe(true);
    expect(strip.cursor).toBe("grab"); // cosmetic on both sides (D158)
    expect(strip.overflowX).toBe("auto");
    expect(strip.snap).toBe("none");
    expect(strip.touchAction).toBe("auto");
    expect(strip.draggable).toBeNull();
    expect(strip.cards).toBe(8);
  });

  test("the behavioral empty-set: a real mouse drag + the native wheel leave scrollLeft unchanged", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const box = await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll("div")).filter((d) => {
        const cs = getComputedStyle(d);
        return /(auto|scroll|hidden)/.test(cs.overflowX) && d.scrollWidth > d.clientWidth + 40;
      });
      const strip = candidates.sort((a, b) => b.scrollWidth - a.scrollWidth)[0];
      if (!strip) return null;
      const r = strip.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + Math.min(r.height / 2, 200) };
    });
    expect(box).not.toBeNull();

    // the native wheel first (trusted input)
    await page.mouse.move(box!.x, box!.y);
    await page.mouse.wheel(0, 240);
    await page.waitForTimeout(400);
    expect(await stripScrollLeft(page)).toBe(0); // no wheel-to-horizontal conversion (both sides)

    // the real pointer drag (mousedown + 360px of moves + up)
    await page.mouse.move(box!.x, box!.y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(box!.x - i * 30, box!.y, { steps: 3 });
      await page.waitForTimeout(20);
    }
    await page.mouse.up();
    await page.waitForTimeout(500);
    expect(await stripScrollLeft(page)).toBe(0); // no JS drag-pan (both sides — the empty-set)
  });
});

test.describe("the offline render superset (Session 46 — D159)", () => {
  test("with every non-document request aborted, the landing renders the full SSR copy", async ({ page }) => {
    await page.route("**/*", (route) => {
      const req = route.request();
      if (req.resourceType() === "document") return route.continue();
      return route.abort();
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const render = await page.evaluate(() => ({
      words: (document.body.innerText || "").trim().split(/\s+/).filter(Boolean).length,
      hasH1: !!document.querySelector("h1"),
      hasVideo: !!document.querySelector("video"),
      bodyChildren: document.body.children.length,
    }));
    // The recon measured 718; the floor absorbs harmless copy drift. The
    // live's SPA shell measures 136 under the same probe (D159 — the
    // registered platform superset; never fix toward the empty shell).
    expect(render.words).toBeGreaterThanOrEqual(700);
    expect(render.hasH1).toBe(true);
    expect(render.hasVideo).toBe(true);
    expect(render.bodyChildren).toBeGreaterThanOrEqual(8);
  });
});

test.describe("the burger clickability + menu structure (Session 46 — D160)", () => {
  test("the icon's top, center, and bottom points ALL open the menu (the full-clickability superset)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const box = await page.evaluate(() => {
      const burger = document.querySelector("button[aria-controls='mobile-menu']");
      if (!burger) return null;
      const r = burger.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y, h: r.height };
    });
    expect(box).not.toBeNull();

    const menuHidden = () =>
      page.evaluate(() => (document.getElementById("mobile-menu") ? document.getElementById("mobile-menu")!.hidden : true));

    // The D160 record: the LIVE's icon is 2/3 blocked by its dormant toast
    // containers (only the y36 sliver works there); the CLONE must open at
    // EVERY point — the registered superset.
    for (const offset of [4, 0.5, 0.9]) {
      // ensure closed
      if (!(await menuHidden())) {
        await page.locator("button[aria-controls='mobile-menu']").click();
        await page.waitForTimeout(500);
      }
      const y = offset === 4 ? box!.y + 4 : box!.y + box!.h * offset;
      await page.mouse.click(box!.x, y);
      await page.waitForTimeout(700);
      expect(await menuHidden(), `burger click at y=${Math.round(y)} must open the menu`).toBe(false);
    }
  });

  test("the panel contract: the measured classes + 7 rows at 44px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const panel = await page.evaluate(() => {
      const el = document.getElementById("mobile-menu");
      if (!el) return null;
      el.hidden = false; // open it directly (the structural read)
      const rows = Array.from(el.querySelectorAll("a, button")).filter((r) => {
        const rect = r.getBoundingClientRect();
        return rect.height > 20 && rect.width > 40;
      });
      const result = {
        cls: el.getAttribute("class"),
        rowCount: rows.length,
        rowHeights: [...new Set(rows.map((r) => Math.round(r.getBoundingClientRect().height)))],
        labels: rows.map((r) => (r.textContent ?? "").trim()),
        hrefs: rows.filter((r) => r.tagName === "A").map((r) => r.getAttribute("href")),
      };
      el.hidden = true; // restore
      return result;
    });
    expect(panel).not.toBeNull();
    expect(panel!.cls).toContain("md:hidden");
    expect(panel!.cls).toContain("bg-black/95");
    expect(panel!.cls).toContain("backdrop-blur-xl");
    expect(panel!.rowCount).toBe(7);
    expect(panel!.rowHeights).toEqual([44]);
    expect(panel!.labels).toEqual([
      "Features",
      "How It Works",
      "Pricing",
      "Testimonials",
      "FAQ",
      "Log In",
      "Get Started",
    ]);
    expect(panel!.hrefs).toEqual(["#features", "#how-it-works", "#pricing", "#testimonials", "/faq", "#pricing"]);
  });

  test("a nav link click closes the menu and scrolls to the section (the close-on-navigate contract)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.locator("button[aria-controls='mobile-menu']").click();
    await page.waitForTimeout(600);
    await page.locator("#mobile-menu a").first().click();
    await page.waitForTimeout(1200);
    const state = await page.evaluate(() => ({
      menuHidden: document.getElementById("mobile-menu")?.hidden ?? true,
      scrollY: Math.round(Math.abs(window.scrollY)),
    }));
    expect(state.menuHidden).toBe(true);
    expect(state.scrollY).toBeGreaterThan(100); // the #features anchor scrolled
  });
});
