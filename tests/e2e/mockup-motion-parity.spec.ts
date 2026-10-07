import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session-10 looping-motion pins (docs/remediation-plan-session10.md).
 *
 * The audit surveyed the LOOP layer for the first time — a full-page census
 * sampling every element's computed transform/opacity across multiple
 * rounds AFTER all entrances settle, plus animate/transition config
 * extraction from the live's JS bundle:
 *
 *   1. The live runs TWELVE looping animations; the clone shipped FOUR.
 *      framer-motion writes inline styles per frame, so every element below
 *      reads animation:none on BOTH sides — the Session-4 "the mockup is
 *      completely STATIC" census (a CSS-property read) was falsified by
 *      value sampling. The live's extracted configs, verbatim:
 *        ambient -inset-32 glow   scale:[1,1.15,1] opacity:[.3,.5,.3] 4s easeInOut
 *        red chrome dot (w-2.5)   scale:[1,1.2,1]                     2s
 *        4 side-list dots         scale:[1,1.2,1] delay:i*.1          2s (i from 1)
 *        under-glow -bottom-16    y:[0,-12,0] opacity:[.3,.5,.3]      3s
 *        mini-dashboard h-4       opacity:[.5,1,.5]                   3s
 *        mini-dashboard h-3       opacity:[.3,.8,.3] delay:.5         3s
 *        mini-dashboard 4 tiles   opacity:[.4,1,.4] delay:t*.2        3s (t from 1)
 *        mini-dashboard h-20      opacity:[.3,.9,.3] delay:1          3s
 *   2. The under-glow is a SIBLING of the mockup card on the live (child
 *      of the max-w-4xl wrapper — unclipped), rendered UNCENTERED (its
 *      framer transform replaces v3's --tw-translate-x, so -translate-x-1/2
 *      is inert in effect — the left edge sits at the wrapper's center,
 *      extending past the card's right edge). The clone had it clipped
 *      inside the card, centered, static (Session 10 F2).
 *   3. The dashboard superset failed axe-core: text-white/40 muted lines
 *      (3.6:1) and no <h1> (Session 10 F3).
 *
 * The loops pause under prefers-reduced-motion via the global 0.01ms
 * collapse — the D47-family documented a11y superset (the live's framer
 * loops run under RM).
 */

const AMBIENT = "absolute -inset-32";

function locatorFor(cls: string) {
  return `[class*="${cls}"]`;
}

test.describe("the hero mockup's looping layer (Session-10 F1)", () => {
  test("the ambient -inset-32 glow pulses scale 1→1.15→1 and opacity .3→.5→.3 at 4s", async ({ page }) => {
    await page.goto("/");
    const anim = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("div")).find((d) =>
        typeof d.className === "string" && d.className.includes("-inset-32"),
      ) as HTMLElement | undefined;
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { name: cs.animationName, dur: cs.animationDuration, iter: cs.animationIterationCount, tf: cs.animationTimingFunction };
    });
    expect(anim).not.toBeNull();
    expect(anim!.name).toBe("mockup-ambient");
    expect(anim!.dur).toBe("4s");
    expect(anim!.iter).toBe("infinite");
    expect(anim!.tf).toContain("ease-in-out");
  });

  test("the red browser-chrome dot pulses scale 1→1.2→1 at 2s", async ({ page }) => {
    await page.goto("/");
    const anim = await page.evaluate(() => {
      // the mockup chrome dot is w-2.5 (the mini-dashboard's is w-2 and static)
      const el = document.querySelector('[class*="w-2.5"][class*="bg-red-500"]');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { name: cs.animationName, dur: cs.animationDuration, iter: cs.animationIterationCount };
    });
    expect(anim).not.toBeNull();
    expect(anim!.name).toBe("mockup-dot");
    expect(anim!.dur).toBe("2s");
    expect(anim!.iter).toBe("infinite");
  });

  test("the four side-list dots pulse with the live's staggered delays (0.1/0.2/0.3/0.4s)", async ({ page }) => {
    await page.goto("/");
    const dots = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[class*="bg-primary/80"]')).map((el) => {
        const cs = getComputedStyle(el);
        return { name: cs.animationName, dur: cs.animationDuration, delay: cs.animationDelay };
      });
    });
    expect(dots).toHaveLength(4);
    for (const d of dots) {
      expect(d.name).toBe("mockup-dot");
      expect(d.dur).toBe("2s");
    }
    expect(dots.map((d) => d.delay)).toEqual(["0.1s", "0.2s", "0.3s", "0.4s"]);
  });

  test("the loops actually RUN (rendered transform/opacity changes across samples)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1200);
    const samples: { t0: string; t1: string } = await page.evaluate(`(async () => {
      const red = document.querySelector('[class*="w-2.5"][class*="bg-red-500"]');
      const ambient = Array.from(document.querySelectorAll("div")).find((d) =>
        typeof d.className === "string" && d.className.includes("-inset-32"));
      const snap = (el) => el ? getComputedStyle(el).transform + "|" + getComputedStyle(el).opacity : "none";
      const t0 = snap(red) + " ## " + snap(ambient);
      await new Promise((r) => setTimeout(r, 700));
      const t1 = snap(red) + " ## " + snap(ambient);
      return { t0, t1 };
    })()`);
    expect(samples.t0).not.toBe(samples.t1);
  });
});

test.describe("the under-glow restructure (Session-10 F2)", () => {
  test("the glow is a SIBLING of the card (child of the max-w-4xl wrapper), not clipped inside it", async ({ page }) => {
    await page.goto("/");
    const structure = await page.evaluate(() => {
      const glow = Array.from(document.querySelectorAll("div")).find((d) =>
        typeof d.className === "string" && d.className.includes("-bottom-16"),
      ) as HTMLElement | undefined;
      if (!glow) return null;
      const parent = glow.parentElement!;
      const card = parent.querySelector(":scope > .aspect-square, :scope > [class*='aspect-square']") as HTMLElement | null;
      return {
        parentClass: parent.className,
        parentOverflow: getComputedStyle(parent).overflow,
        cardChildren: card ? card.children.length : -1,
        glowIsCardChild: card ? Array.from(card.children).includes(glow) : null,
      };
    });
    expect(structure).not.toBeNull();
    expect(structure!.parentClass).toContain("max-w-4xl");
    expect(structure!.parentOverflow).toBe("visible");
    expect(structure!.glowIsCardChild).toBe(false);
    // the card carries exactly the ambient glow + the content shell
    expect(structure!.cardChildren).toBe(2);
  });

  test("the glow renders at the live's position: left edge at the wrapper's center, unclipped past the card's right edge", async ({ page }) => {
    await page.goto("/");
    const geo = await page.evaluate(() => {
      const glow = Array.from(document.querySelectorAll("div")).find((d) =>
        typeof d.className === "string" && d.className.includes("-bottom-16"),
      ) as HTMLElement | undefined;
      if (!glow) return null;
      const parent = glow.parentElement!;
      const card = parent.querySelector(":scope > [class*='aspect-square']") as HTMLElement;
      const g = glow.getBoundingClientRect();
      const p = parent.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const cs = getComputedStyle(glow);
      return {
        translate: cs.translate,
        leftEdgeOffsetFromParentCenter: g.left - (p.left + p.width / 2),
        extendsPastCardRight: g.right - c.right,
        extendsBelowParentBottom: g.bottom - p.bottom,
      };
    });
    expect(geo).not.toBeNull();
    // the live's framer transform kills its -translate-x-1/2 — the pin
    // reproduces the rendered geometry (translate-none; v4's separate
    // `translate` property would otherwise keep it centered)
    expect(geo!.translate).toBe("none");
    expect(Math.abs(geo!.leftEdgeOffsetFromParentCenter)).toBeLessThan(2);
    expect(geo!.extendsPastCardRight).toBeGreaterThan(100);
    expect(geo!.extendsBelowParentBottom).toBeGreaterThan(40);
  });

  test("the glow pulses y 0→-12→0 and opacity .3→.5→.3 at 3s", async ({ page }) => {
    await page.goto("/");
    const anim = await page.evaluate(() => {
      const glow = Array.from(document.querySelectorAll("div")).find((d) =>
        typeof d.className === "string" && d.className.includes("-bottom-16"),
      );
      if (!glow) return null;
      const cs = getComputedStyle(glow);
      return { name: cs.animationName, dur: cs.animationDuration, iter: cs.animationIterationCount };
    });
    expect(anim).not.toBeNull();
    expect(anim!.name).toBe("mockup-glow");
    expect(anim!.dur).toBe("3s");
    expect(anim!.iter).toBe("infinite");
  });
});

test.describe("the mini-dashboard skeleton loops (Session-10 F1d)", () => {
  test("the h-4 line pulses opacity .5→1→.5 at 3s with no delay", async ({ page }) => {
    await page.goto("/");
    const anim = await page.evaluate(() => {
      const el = document.querySelector('[class*="h-4"][class*="bg-white/20"]');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { name: cs.animationName, dur: cs.animationDuration, delay: cs.animationDelay };
    });
    expect(anim).not.toBeNull();
    expect(anim!.name).toBe("skel-line");
    expect(anim!.dur).toBe("3s");
    expect(anim!.delay).toBe("0s");
  });

  test("the h-3 violet line pulses .3→.8→.3 with the live's 0.5s delay", async ({ page }) => {
    await page.goto("/");
    const anim = await page.evaluate(() => {
      const el = document.querySelector('[class*="h-3"][class*="bg-violet/30"]');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { name: cs.animationName, dur: cs.animationDuration, delay: cs.animationDelay };
    });
    expect(anim).not.toBeNull();
    expect(anim!.name).toBe("skel-violet");
    expect(anim!.dur).toBe("3s");
    expect(anim!.delay).toBe("0.5s");
  });

  test("the four h-12 tiles pulse .4→1→.4 with the live's staggered delays (0.2–0.8s)", async ({ page }) => {
    await page.goto("/");
    const tiles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[class*="h-12"][class*="bg-white/[0.15]"]')).map((el) => {
        const cs = getComputedStyle(el);
        return { name: cs.animationName, dur: cs.animationDuration, delay: cs.animationDelay };
      });
    });
    expect(tiles).toHaveLength(4);
    for (const t of tiles) {
      expect(t.name).toBe("skel-tile");
      expect(t.dur).toBe("3s");
    }
    expect(tiles.map((t) => t.delay)).toEqual(["0.2s", "0.4s", "0.6s", "0.8s"]);
  });

  test("the h-20 box pulses .3→.9→.3 with the live's 1s delay", async ({ page }) => {
    await page.goto("/");
    const anim = await page.evaluate(() => {
      const el = document.querySelector('[class*="h-20"][class*="bg-white/[0.12]"]');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { name: cs.animationName, dur: cs.animationDuration, delay: cs.animationDelay };
    });
    expect(anim).not.toBeNull();
    expect(anim!.name).toBe("skel-wide");
    expect(anim!.dur).toBe("3s");
    expect(anim!.delay).toBe("1s");
  });

  test("the skeletons actually RUN (rendered opacity changes across samples)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1200);
    const samples: { t0: string; t1: string } = await page.evaluate(`(async () => {
      const h4 = document.querySelector('[class*="h-4"][class*="bg-white/20"]');
      const snap = (el) => el ? getComputedStyle(el).opacity : "none";
      const t0 = snap(h4);
      await new Promise((r) => setTimeout(r, 700));
      return { t0, t1: snap(h4) };
    })()`);
    expect(samples.t0).not.toBe(samples.t1);
  });
});

test.describe("the dashboard a11y fixes (Session-10 F3)", () => {
  async function signIn(page: import("@playwright/test").Page) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
  }

  test("the dashboard carries exactly one h1 (the breadcrumb heading)", async ({ page }) => {
    await signIn(page);
    const h1s = await page.evaluate(() =>
      Array.from(document.querySelectorAll("h1")).map((h) => h.textContent?.trim()),
    );
    expect(h1s).toEqual(["Dashboard"]);
  });

  test("the muted dashboard text meets AA contrast (white/60 composite, not white/40)", async ({ page }) => {
    await signIn(page);
    const lines = await page.evaluate(() => {
      const targets = [
        // the workflow count badge, the run-stats line, the category tag,
        // and the email span (the four lines axe flagged at white/40)
        Array.from(document.querySelectorAll("span")).find((s) => /total$/.test(s.textContent || "")),
        Array.from(document.querySelectorAll("span")).find((s) => (s.textContent || "").includes("runs")),
        Array.from(document.querySelectorAll("span")).find((s) => /^(MARKETING|OPS|SALES|SUPPORT|FINANCE|HR)$/i.test((s.textContent || "").trim())),
        document.querySelector("header span[class*='text-white/60']"),
      ].filter(Boolean);
      return targets.map((el) => {
        const cs = getComputedStyle(el as Element);
        const color = cs.color;
        // modern browsers serialize v4's color-mix as rgba(...) or
        // color(srgb 1 1 1 / 0.6) — parse the ALPHA both ways
        let alpha = 1;
        const rgbaM = color.match(/rgba?\([^)]*,\s*([\d.]+)\)/);
        const srgbM = color.match(/\/\s*([\d.]+)\)/);
        if (rgbaM) alpha = +rgbaM[1];
        else if (srgbM) alpha = +srgbM[1];
        return { text: (el as Element).textContent?.trim().slice(0, 20), color, alpha };
      });
    });
    // every muted line carries the white/60 alpha (>= 0.55) — the
    // text-white/40 the axe audit flagged computed 3.6:1 on the dark cards
    expect(lines.length).toBeGreaterThanOrEqual(3);
    for (const l of lines) {
      expect(l.alpha).toBeGreaterThanOrEqual(0.55);
    }
  });
});
