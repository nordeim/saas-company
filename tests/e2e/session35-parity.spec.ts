import { expect, test } from "@playwright/test";

/**
 * Session 35 pins — the battery's TENTH surface (the computed-STYLE
 * inventory) + the ninth's aria-* vocabulary caught three drift classes on
 * their first run; these are their versioned pins (docs/
 * remediation-plan-session35.md):
 *
 *   1. D130 — the reference's dark bundle ships a CUSTOM border-radius
 *      scale: `rounded-sm` renders 8px and `rounded-lg` renders 12px
 *      (measured in vivo: the BRANTOX chip 8px, the five features AI
 *      chips + the 404's Go Home button 12px) where Tailwind v4's
 *      defaults emit 4px/8px. The same class string, a different engine
 *      scale — the Session-7 tracking-scale family (gotcha 22). Fixed by
 *      pinning `--radius-sm: 8px` + `--radius-lg: 12px` in the @theme.
 *   2. D131 — the reference's login bundle defines a LIGHT `--muted`
 *      (zinc-100, rgb(244,244,245)); the clone's login inherited the dark
 *      #161616 through `bg-muted` on the logo chip. INERT under the
 *      chip's opaque slate gradient (the Session-9 F5 `--border`
 *      family) — pinned for computed parity.
 *   3. D132 — the reference's FAQ panels are MOUNTED-HIDDEN at rest
 *      (Radix regions: role=region + hidden, every aria-controls id
 *      RESOLVES in the live's DOM); the clone's closed panels were
 *      UNMOUNTED, leaving every aria-controls reference DANGLING — a
 *      weaker closed-state ARIA contract than the reference's (the
 *      stale Session-4 "Radix unmounts closed content" record,
 *      disproven in vivo). The panels (and the burger's mobile-menu)
 *      now mount hidden at rest.
 */

test.describe("the radius scale (Session 35 D130)", () => {
  test("the 404's Go Home button renders the reference's rounded-lg = 12px", async ({ page }) => {
    await page.goto("/does-not-exist-404");
    const btn = page.getByRole("button", { name: "Go Home" });
    await expect(btn).toBeVisible();
    await expect(btn).toHaveCSS("border-top-left-radius", "12px");
    await expect(btn).toHaveCSS("border-bottom-right-radius", "12px");
  });

  test("the features AI chip renders the reference's rounded-lg = 12px", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y <= H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    const chip = page.locator("div.rounded-lg", { hasText: "Pattern Match" }).first();
    const radius = await chip.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    expect(radius).toBe("12px");
  });

  test("the logo-cloud BRANTOX chip renders the reference's rounded-sm = 8px", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y <= H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    const chip = page.locator(".rounded-sm", { hasText: "BRANTOX" }).first();
    const radius = await chip.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    expect(radius).toBe("8px");
  });

  test("rounded-xl and rounded-2xl stay at the engine defaults the reference also ships (12px / 16px)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y <= H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    const radii = await page.evaluate<Record<string, string[]>>(`(() => {
      const out = {};
      for (const el of document.body.querySelectorAll("*")) {
        const cls = (el.className || "").toString();
        const m = cls.match(/(^|\\s)(rounded-(?:xl|2xl))(?=\\s|$)/);
        if (!m) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        (out[m[2]] ??= new Set()).add(cs.borderTopLeftRadius);
      }
      return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [...v]]));
    })()`);
    expect(radii["rounded-xl"]).toEqual(["12px"]);
    expect(radii["rounded-2xl"]).toContain("16px");
  });
});

test.describe("the login --muted pin (Session 35 D131)", () => {
  test("the logo chip's bg-muted computes the reference's light zinc-100", async ({ page }) => {
    await page.goto("/login");
    const chip = page.locator("span.bg-muted").first();
    await expect(chip).toBeVisible();
    await expect(chip).toHaveCSS("background-color", "rgb(244, 244, 245)");
  });
});

test.describe("the accessibility template note (Session 35 D133)", () => {
  test("the '*Note:' paragraph renders the live's one-off white/50 italic style", async ({ page }) => {
    await page.goto("/accessibility");
    const note = page.getByText(/\*Note: This page currently/);
    await expect(note).toBeVisible();
    // Gotcha 4: v4 serializes alpha colors through oklab() — accept either
    // spelling (the rendering is identical; the mobile-navigation pins'
    // convention). The VALUE pinned: white at 0.5 alpha.
    const noteColor = await note.evaluate((el) => getComputedStyle(el).color);
    expect(noteColor).toMatch(/rgba\(255, 255, 255, 0\.5\)|oklab\(0\.99999[\d.]* [\d.]* [\d.]* \/ 0\.5\)/);
    await expect(note).toHaveCSS("font-style", "italic");
    // The surrounding paragraphs stay the standard white/70 body text.
    const purpose = page.getByText(/The purpose of the following template/);
    const purposeColor = await purpose.evaluate((el) => getComputedStyle(el).color);
    expect(purposeColor).toMatch(/rgba\(255, 255, 255, 0\.7\)|oklab\(0\.99999[\d.]* [\d.]* [\d.]* \/ 0\.7\)/);
    await expect(purpose).toHaveCSS("font-style", "normal");
  });
});

test.describe("the closed-state ARIA resolution contract (Session 35 D132)", () => {
  test("(a) every FAQ trigger's aria-controls RESOLVES to a mounted region at rest", async ({ page }) => {
    await page.goto("/faq");
    const rows = await page.evaluate<Array<{ v: string; resolves: boolean; role: string | null; hidden: boolean | null }>>(`(() => {
      const out = [];
      for (const el of document.querySelectorAll("button[aria-controls]")) {
        const v = el.getAttribute("aria-controls");
        const target = document.getElementById(v);
        out.push({ v, resolves: !!target, role: target?.getAttribute("role"), hidden: target ? target.hidden : null });
      }
      return out;
    })()`);
    expect(rows.length).toBeGreaterThanOrEqual(6);
    for (const r of rows) {
      expect(r.resolves, `${r.v} must resolve`).toBe(true);
      if (r.v.startsWith("faq-panel-")) {
        expect(r.role, `${r.v} is a region`).toBe("region");
        expect(r.hidden, `${r.v} is hidden at rest`).toBe(true);
      }
    }
  });

  test("(b) the mounted-hidden panels carry role=region + aria-labelledby + data-state=closed at rest", async ({ page }) => {
    await page.goto("/faq");
    const panels = await page.evaluate<Array<{ id: string; labelledby: string | null; state: string | null; hidden: boolean }>>(`(() =>
      [...document.querySelectorAll('[role="region"][aria-labelledby]')].map((el) => ({
        id: el.id,
        labelledby: el.getAttribute("aria-labelledby"),
        state: el.getAttribute("data-state"),
        hidden: el.hidden,
      }))
    )()`);
    expect(panels.length).toBe(6);
    for (const p of panels) {
      expect(p.state).toBe("closed");
      expect(p.hidden).toBe(true);
      expect(p.labelledby).toBeTruthy();
    }
    const resolved = await page.evaluate<Array<{ id: string | null; ok: boolean }>>(`(() => {
      const ids = new Set([...document.querySelectorAll('[role="region"][aria-labelledby]')].map((el) => el.getAttribute("aria-labelledby")));
      return [...ids].map((id) => ({ id, ok: !!document.getElementById(id || "") }));
    })()`);
    for (const r of resolved) expect(r.ok, `${r.id} resolves`).toBe(true);
  });

  test("(c) the burger's aria-controls resolves — the mobile-menu is mounted hidden at rest", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const row = await page.evaluate<{ v: string | null; resolves: boolean; hidden: boolean | null; rows: number; error?: string }>(`(() => {
      const btn = Array.from(document.querySelectorAll("nav button, header button")).find((b) => {
        const cs = getComputedStyle(b);
        return cs.display !== "none" && cs.visibility !== "hidden" && b.getBoundingClientRect().width > 0 && !(b.textContent || "").trim();
      });
      if (!btn) return { error: "no burger" };
      const v = btn.getAttribute("aria-controls");
      const target = v ? document.getElementById(v) : null;
      return { v, resolves: !!target, hidden: target ? target.hidden : null, rows: target ? target.querySelectorAll("a, button").length : 0 };
    })()`);
    expect(row.error).toBeUndefined();
    expect(row.v).toBe("mobile-menu");
    expect(row.resolves).toBe(true);
    expect(row.hidden).toBe(true);
    expect(row.rows).toBeGreaterThanOrEqual(7);
  });

  test("(d) opening a FAQ panel still works: aria-expanded flips, the region un-hides, the answer is visible", async ({ page }) => {
    await page.goto("/faq");
    const first = page.locator("button[aria-controls='faq-panel-0']");
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#faq-panel-0");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-state", "open");
    // Closing re-hides (the mounted-hidden contract, not an unmount).
    await first.click();
    await expect(page.locator("#faq-panel-0")).toBeHidden();
    await expect(page.locator("#faq-panel-0")).toHaveCount(1);
    await expect(first).toHaveAttribute("aria-expanded", "false");
  });

  test("(e) the burger still opens the mobile menu (the mounted-hidden rework preserves the behavior)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const burger = page.locator("nav button[aria-controls='mobile-menu'], header button[aria-controls='mobile-menu']").first();
    await burger.click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await expect(menu.locator("a").first()).toBeVisible();
  });
});
