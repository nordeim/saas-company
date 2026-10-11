import { expect, test, type Page } from "@playwright/test";

/**
 * Session 41 — the focus-inventory pins (the battery's SIXTEENTH
 * surface: the focus-order inventory).
 *
 * The surface (research/recon-s41.mjs + adj-s41.mjs + adj3-s41.mjs,
 * paired clone-vs-live): the Tab sequence captured as an ORDERED
 * surface — the same walk on both sides, per viewport. The measured
 * parity contract: every combo's sequence is structurally IDENTICAL
 * across sides — the landing at 1440 (34 stops) and 390 (28 stops),
 * /login (6), /faq (28), and the open mobile menu (10). The only
 * deltas are the registered records: the Dashboard CTA card's href
 * (/dashboard vs the live's /checkout — the D-record), the accessible
 * names the clone ADDS (the logo "NovaAI home", the burger "Open
 * menu", the newsletter input "Email address" / button "Subscribe" —
 * the live's controls are unnamed), and the open-menu card height
 * (327 vs the live's unfired-entrance 311 — gotcha 52e).
 *
 * The two laws this session added:
 *   - gotcha 52f (the FULL-WALK law): consecutive UNNAMED controls are
 *     legitimate stops, never a stall signal — the first 390 walk read
 *     FIVE stops because three icon-only feature tabs share one
 *     tag|href|name key; the walk ends only on <body>.
 *   - the VIEWPORT pairing law: the tab inventory is viewport-dependent
 *     on BOTH sides (34 stops at 1440 vs 28 at 390 — the reference's
 *     own responsive reordering: the desktop nav block vs the burger).
 *
 * The measured clone contract at 1440 (the ordered walk):
 *   a×6 (logo + Features/How It Works/Pricing/Testimonials/FAQ) >
 *   button[Log In] > a[#pricing Get Started] > a[#pricing Book a
 *   Demo] > a[/dashboard — the D-record card] > button×8 (AI
 *   Intelligence, Real-time Analytics, Workflow Builder, Monthly,
 *   Annual Save 20%, Get Started Free, Start Pro Trial, Contact
 *   Sales) > div[the tabbable testimonial quote] > a×13 (Try NovaAI
 *   + the 12 footer links) > input:email > button:submit — 34 stops.
 * At 390: a[logo] > button[burger] > a[#pricing Book a Demo] >
 *   a[/dashboard] > button×3 (the icon-only feature tabs) > button×5
 *   (Monthly, Annual, the 3 plan CTAs) > div > a×13 > input > button
 *   — 28 stops.
 *
 * These pins version the CLONE side of the contract so a future
 * regression (a tab trap, a dropped control, a broken disclosure)
 * surfaces loudly at every measured viewport.
 */

const WALK_SETTLE = 85;

type Stop = { tag: string; type: string; name: string; href: string };

async function walk(page: Page, maxStops = 40): Promise<Stop[]> {
  const stops: Stop[] = [];
  for (let i = 0; i < maxStops; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(WALK_SETTLE);
    const d = await page.evaluate((): { end: boolean } & Partial<Stop> => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return { end: true };
      return {
        end: false,
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute("type") || "",
        name: (el.getAttribute("aria-label") || el.innerText || "")
          .replace(/\s+/g, " ").trim().slice(0, 30),
        href: el.getAttribute("href") || "",
      };
    });
    if (d.end) break;
    stops.push({ tag: d.tag || "", type: d.type || "", name: d.name || "", href: d.href || "" });
  }
  return stops;
}

test.describe("the focus-inventory pins (Session 41 — the sixteenth surface)", () => {
  test("the landing's walk at 1440 — the full ordered contract (34 stops)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1200);
    const stops = await walk(page);
    expect(stops.length, "the total stop count").toBe(34);
    // the head: the logo + the five nav links
    expect(stops.slice(0, 6).every((s) => s.tag === "a")).toBe(true);
    expect(stops.slice(0, 6).map((s) => s.href)).toEqual([
      "/", "#features", "#how-it-works", "#pricing", "#testimonials", "/faq",
    ]);
    // the desktop right actions + the hero CTAs (the third = the D-record card)
    expect(stops[6].tag).toBe("button");
    expect(stops[6].name).toBe("Log In");
    expect(stops.slice(7, 10).map((s) => s.href)).toEqual(["#pricing", "#pricing", "/dashboard"]);
    // the middle: 8 consecutive buttons, the tabbable quote div, 13 anchors
    expect(stops.slice(10, 18).every((s) => s.tag === "button")).toBe(true);
    expect(stops[18].tag).toBe("div");
    expect(stops.slice(19, 32).every((s) => s.tag === "a")).toBe(true);
    // the tail: the newsletter pair
    expect(stops[32].tag).toBe("input");
    expect(stops[32].type).toBe("email");
    expect(stops[33].tag).toBe("button");
    // the D-record card appears exactly once in the walk
    expect(stops.filter((s) => s.href === "/dashboard").length).toBe(1);
  });

  test("the landing's walk at 390 — the mobile contract (28 stops, the burger second)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1200);
    const stops = await walk(page);
    expect(stops.length, "the total stop count at 390").toBe(28);
    expect(stops[0].tag).toBe("a");
    expect(stops[0].name).toBe("NovaAI home");
    expect(stops[1].tag).toBe("button");
    expect(stops[1].name).toBe("Open menu");
    // the hero CTAs (the second = the D-record card)
    expect(stops.slice(2, 4).map((s) => s.href)).toEqual(["#pricing", "/dashboard"]);
    // the middle: 3 icon-only feature tabs + 5 pricing buttons, the quote div, 13 anchors
    expect(stops.slice(4, 12).every((s) => s.tag === "button")).toBe(true);
    expect(stops[12].tag).toBe("div");
    expect(stops.slice(13, 26).every((s) => s.tag === "a")).toBe(true);
    // the tail: the newsletter pair
    expect(stops[26].tag).toBe("input");
    expect(stops[27].tag).toBe("button");
  });

  test("the burger's a11y trio + the aria-expanded toggle (the registered superset)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1000);
    const burger = page.locator("button[aria-controls='mobile-menu']");
    await expect(burger).toHaveAttribute("aria-label", "Open menu");
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await burger.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await expect(burger).toHaveAttribute("aria-label", "Close menu");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await expect(burger).toHaveAttribute("aria-label", "Open menu");
  });

  test("the open menu's row contract — 7 rows at 44px in order", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1000);
    const burger = page.locator("button[aria-controls='mobile-menu']");
    await burger.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(600);
    const rows = await page.evaluate(() => {
      const panel = document.getElementById("mobile-menu");
      const focusables = panel
        ? [...panel.querySelectorAll("a, button")].filter((el) => el.getBoundingClientRect().height > 0)
        : [];
      return focusables.map((el) => ({
        tag: el.tagName.toLowerCase(),
        name: ((el as HTMLElement).innerText || "").replace(/\s+/g, " ").trim(),
        href: el.getAttribute("href") || "",
        h: Math.round(el.getBoundingClientRect().height),
      }));
    });
    expect(rows.length, "the menu's focusable rows").toBe(7);
    expect(rows.map((r) => `${r.tag}:${r.name}`)).toEqual([
      "a:Features", "a:How It Works", "a:Pricing", "a:Testimonials", "a:FAQ",
      "button:Log In", "a:Get Started",
    ]);
    expect(rows.map((r) => r.href)).toEqual([
      "#features", "#how-it-works", "#pricing", "#testimonials", "/faq", "", "#pricing",
    ]);
    expect(rows.every((r) => r.h === 44), "every row is exactly 44px").toBe(true);
  });

  test("Escape from INSIDE the menu closes it and returns focus to the burger (the S13-F3 superset)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1000);
    const burger = page.locator("button[aria-controls='mobile-menu']");
    await burger.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(600);
    // walk INTO the menu: the first row receives focus
    await page.keyboard.press("Tab");
    await page.waitForTimeout(150);
    const inMenu = await page.evaluate(() => ({
      href: document.activeElement?.getAttribute("href") || "",
      inPanel: !!document.activeElement?.closest("#mobile-menu"),
    }));
    expect(inMenu.inPanel, "focus entered the menu panel").toBe(true);
    expect(inMenu.href).toBe("#features");
    // Escape: the panel unmounts its rows, focus hands back to the burger
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => {
      const burger = document.querySelector("button[aria-controls='mobile-menu']");
      const panel = document.getElementById("mobile-menu");
      return {
        focusedIsBurger: document.activeElement === burger,
        focusName: document.activeElement?.getAttribute("aria-label") || "",
        panelHidden: panel ? panel.hasAttribute("hidden") : true,
        expanded: burger?.getAttribute("aria-expanded"),
      };
    });
    expect(after.focusedIsBurger, "focus returned to the burger").toBe(true);
    expect(after.focusName).toBe("Open menu");
    expect(after.panelHidden, "the panel is hidden again").toBe(true);
    expect(after.expanded).toBe("false");
  });

  test("the scroll-lock contract — body overflow hidden while open, restored on close", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1000);
    const burger = page.locator("button[aria-controls='mobile-menu']");
    await burger.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    const whileOpen = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(whileOpen, "the clone locks scroll while the menu is open (the live does not)").toBe("hidden");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    const afterClose = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(afterClose, "scroll restored on close").not.toBe("hidden");
  });

  test("the named controls carry their accessible names (the registered supersets)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1000);
    const names = await page.evaluate(() => ({
      logo: document.querySelector("nav a[href='/']")?.getAttribute("aria-label") || "",
      input: document.querySelector("input[type='email']")?.getAttribute("aria-label") || "",
      placeholder: document.querySelector("input[type='email']")?.getAttribute("placeholder") || "",
      subscribe: (() => {
        const input = document.querySelector("input[type='email']");
        const btn = input?.closest("form")?.querySelector("button") || null;
        return btn?.getAttribute("aria-label") || "";
      })(),
    }));
    expect(names.logo).toBe("NovaAI home");
    expect(names.input).toBe("Email address");
    expect(names.placeholder, "the live's byte-identical placeholder").toBe("your@email.com");
    expect(names.subscribe).toBe("Subscribe");
  });
});
