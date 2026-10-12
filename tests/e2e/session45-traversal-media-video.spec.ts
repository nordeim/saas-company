import { expect, test, type Page } from "@playwright/test";

/**
 * Session 45 — the TWENTIETH surface (the traversal/history +
 * media-capability + audio/video contracts) + the nineteenth surface's
 * ROUTE EXTENSION (the /login alternates input census).
 *
 * THE MEASUREMENTS (research/recon-s45.mjs, paired clone-vs-live):
 *
 * THE TRAVERSAL CONTRACT — the REGISTERED PLATFORM SUPERSET (the D125
 * law's extension to the history class; the gotcha-18 burger family:
 * never fix toward the live's broken state). The LIVE's route changes
 * are full page loads (D152 — the footer /faq link, the Log In button),
 * so its back/forward traversals are CROSS-DOCUMENT reloads: the window
 * mark is lost, the navigation-type entry reads `back_forward`, the
 * scroll position is DUMPED to 0 (the user's reading depth destroyed by
 * every back), and `pageshow`'s `persisted` never fires (no bfcache
 * restore — a network reload per traversal). The CLONE's route changes
 * are client-side transitions, so its back/forward are SAME-DOCUMENT
 * popstates: the window mark SURVIVES, the load-event counter stays 0,
 * and the scroll position is RESTORED exactly (4620 -> 4620 at the deep
 * #pricing anchor, through Lenis). The decisive instruments (SKILL
 * lesson 83): the page `load`-event counter (fires ONLY on full
 * document loads) + the window-mark survival test — never a bare
 * same-document boolean (the inverted-probe law).
 *
 * THE MEDIA EMPTY-SET — parity (the S42 print-surface pattern): ZERO
 * `@media` rules matching pointer/hover/any-pointer in any stylesheet
 * on either side (neither ships pointer-conditional styling),
 * `-webkit-tap-highlight-color` transparent on links, `touch-action`
 * auto on body + links. The `matchMedia` capability reads
 * (coarse/fine/hover-none/hover-hover) are browser context, not app
 * behavior — excluded from the contract (the startViewTransition
 * precedent: API availability is not app behavior).
 *
 * THE HERO-VIDEO CONTRACT — parity at the playback layer with ONE
 * REGISTERED ATTRIBUTE SUPERSET (D154): both sides 1920x1080, 8s
 * duration, autoplay + loop + playsInline + NO controls, PLAYING
 * (currentTime advancing), the `muted` PROPERTY true + volume 1, the
 * direct `src` (zero `<source>` children), zero `<audio>` elements.
 * The delta: the CLONE ships the `muted` HTML ATTRIBUTE in the SSR
 * markup; the live does NOT — its React runtime sets the property at
 * mount (the React SSR quirk: `muted` does not serialize through
 * server rendering). The clone's attribute is the MORE ROBUST contract
 * (the muted autoplay holds from first paint, no hydration timing
 * dependency) — registered in `src/lib/head-superset.ts`; never remove
 * it to chase attribute parity with the weaker contract.
 *
 * THE /login ALTERNATES CENSUS (the nineteenth surface's route
 * extension, paired — both sides ship the alternate states): DEFAULT
 * 6 interactives (4 pointer + 2 text), SIGN-UP 5 (2 pointer + 3 text),
 * FORGOT 3 (2 pointer + 1 text) — the counts structurally identical
 * across sides at every state; the clone's autocomplete set (email +
 * current-password / email + new-password x2 / email) the registered
 * D148 superset family the live ships none of.
 *
 * These pins version the CLONE side of the contracts so a future
 * regression (a full-load sneaking into a route link, a lost scroll
 * restoration, an invented pointer media query, a dead or unmuted
 * hero video, a restyled alternate-state form) surfaces loudly.
 */

// the SCROLL-SETTLE law: poll scrollY to a stable consecutive pair
async function settleScroll(page: Page): Promise<number> {
  let stable = 0;
  let last = -1;
  let guard = 0;
  while (stable < 2 && guard++ < 120) {
    await page.waitForTimeout(100);
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) stable++;
    else {
      stable = 0;
      last = y;
    }
  }
  return last;
}

async function bodyWords(page: Page): Promise<number> {
  return page.evaluate(() =>
    document.body.innerText.trim().split(/\s+/).filter(Boolean).length,
  );
}

test.describe("the twentieth surface — the traversal/history contract (Session 45)", () => {
  test("back after a client-side route change is same-document (0 full loads, mark survives)", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // arm BOTH instruments: the window mark + the load-event counter
    await page.evaluate(() => {
      (window as unknown as Record<string, unknown>).__s45mark = "armed";
      (window as unknown as Record<string, unknown>).__s45loads = 0;
      window.addEventListener("load", () => {
        const w = window as unknown as Record<string, unknown>;
        w.__s45loads = ((w.__s45loads as number) ?? 0) + 1;
      });
    });
    // a REAL route link (the footer /faq — the D152 probe's own vehicle)
    await page.evaluate(() => {
      const link = document.querySelector("footer a[href='/faq']");
      (link as HTMLElement).click();
    });
    await page.waitForURL(/\/faq$/, { timeout: 30000 });
    await page.waitForTimeout(800);
    expect(await bodyWords(page)).toBe(101);

    // the BACK traversal — the same-document class
    await page.goBack();
    await page.waitForURL((url) => !url.pathname.includes("faq"), { timeout: 30000 });
    await page.waitForTimeout(800);
    const mark = await page.evaluate(() => (window as unknown as Record<string, unknown>).__s45mark ?? null);
    const loads = await page.evaluate(() => (window as unknown as Record<string, unknown>).__s45loads ?? -1);
    expect(mark).toBe("armed"); // the document identity SURVIVED the traversal
    expect(loads).toBe(0); // zero full loads — a popstate, not a reload
  });

  test("the scroll position is restored through the back traversal", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // scroll to the deep #pricing anchor (the SCROLL-SETTLE law)
    await page.evaluate(() => document.querySelector("#pricing")?.scrollIntoView());
    const before = await settleScroll(page);
    expect(before).toBeGreaterThan(3000); // a real depth, not the fold

    await page.evaluate(() => {
      const link = document.querySelector("footer a[href='/faq']");
      (link as HTMLElement).click();
    });
    await page.waitForURL(/\/faq$/, { timeout: 30000 });
    await page.waitForTimeout(800);

    await page.goBack();
    await page.waitForURL((url) => !url.pathname.includes("faq"), { timeout: 30000 });
    const after = await settleScroll(page);
    expect(after).toBe(before); // EXACT restoration — the same document, the same layout
  });

  test("forward returns to /faq rendered (the traversal's other half)", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const link = document.querySelector("footer a[href='/faq']");
      (link as HTMLElement).click();
    });
    await page.waitForURL(/\/faq$/, { timeout: 30000 });
    await page.goBack();
    await page.waitForURL((url) => !url.pathname.includes("faq"), { timeout: 30000 });
    await page.goForward();
    await page.waitForURL(/\/faq$/, { timeout: 30000 });
    await page.waitForTimeout(800);
    expect(await bodyWords(page)).toBe(101);
  });

  test("history.scrollRestoration reads auto (the engine default both sides)", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const sr = await page.evaluate(() => history.scrollRestoration);
    expect(sr).toBe("auto");
  });
});

test.describe("the twentieth surface — the media empty-set (Session 45)", () => {
  test("zero pointer/hover/any-pointer media rules in any stylesheet", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const hits = await page.evaluate(() => {
      const conditions: string[] = [];
      for (const sheet of document.styleSheets) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        const walk = (list: CSSRuleList) => {
          for (const rule of Array.from(list)) {
            if (rule instanceof CSSMediaRule) {
              const cond = rule.conditionText ?? "";
              if (/pointer|hover/i.test(cond)) conditions.push(cond);
              walk(rule.cssRules);
            }
          }
        };
        walk(rules);
      }
      return conditions;
    });
    expect(hits).toEqual([]); // the empty-set: no pointer-conditional styling
  });

  test("tap-highlight transparent + touch-action auto (the touch defaults)", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const reads = await page.evaluate(() => {
      const link = document.querySelector("footer a") as HTMLElement;
      return {
        tap: getComputedStyle(link).getPropertyValue("-webkit-tap-highlight-color"),
        linkTouch: getComputedStyle(link).getPropertyValue("touch-action"),
        bodyTouch: getComputedStyle(document.body).getPropertyValue("touch-action"),
      };
    });
    expect(reads.tap).toBe("rgba(0, 0, 0, 0)");
    expect(reads.linkTouch).toBe("auto");
    expect(reads.bodyTouch).toBe("auto");
  });
});

test.describe("the twentieth surface — the hero-video contract (Session 45)", () => {
  test("the hero video carries the measured attribute census (muted = the registered superset)", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const attrs = await page.evaluate(() => {
      const v = document.querySelector("video");
      if (!v) return null;
      return {
        autoplay: v.hasAttribute("autoplay"),
        loop: v.hasAttribute("loop"),
        muted: v.hasAttribute("muted"), // the D154 superset — the live's React quirk ships none
        playsInline: v.hasAttribute("playsinline"),
        controls: v.hasAttribute("controls"),
        crossOrigin: v.getAttribute("crossorigin"),
        ariaHidden: v.getAttribute("aria-hidden"),
        src: (v.currentSrc || v.src || "").replace(location.origin, ""),
        sourceChildren: v.querySelectorAll("source").length,
      };
    });
    expect(attrs).toBeTruthy();
    expect(attrs!.autoplay).toBe(true);
    expect(attrs!.loop).toBe(true);
    expect(attrs!.muted).toBe(true); // NEVER remove — the autoplay-robustness superset
    expect(attrs!.playsInline).toBe(true);
    expect(attrs!.controls).toBe(false);
    expect(attrs!.crossOrigin).toBeNull();
    expect(attrs!.ariaHidden).toBe("true");
    expect(attrs!.src).toBe("/media/hero-ai-loop.mp4"); // self-hosted (the S5 traced bytes)
    expect(attrs!.sourceChildren).toBe(0); // the direct src, no <source> children
  });

  test("the hero video plays: currentTime advances, muted property, 1920x1080, 8s", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(600); // let autoplay spin up
    const t1 = await page.evaluate(() => document.querySelector("video")?.currentTime ?? -1);
    await page.waitForTimeout(1200);
    const state = await page.evaluate(() => {
      const v = document.querySelector("video");
      if (!v) return null;
      return {
        t2: v.currentTime,
        paused: v.paused,
        mutedProp: v.muted,
        volume: v.volume,
        w: v.videoWidth,
        h: v.videoHeight,
        duration: v.duration,
      };
    });
    expect(state).toBeTruthy();
    expect(state!.paused).toBe(false); // autoplay is running
    expect(state!.t2).toBeGreaterThan(t1); // PLAYING — the clock advances
    expect(state!.mutedProp).toBe(true); // the property true both sides
    expect(state!.volume).toBe(1);
    expect(state!.w).toBe(1920);
    expect(state!.h).toBe(1080);
    expect(Math.round(state!.duration)).toBe(8); // the 8s loop
  });

  test("the loop attribute is present and the clock advances (the wrap's honest headless proxy)", async ({ page }) => {
    // THE HEADLESS-SEEK-STALL LAW (measured on BOTH sides — the clone and
    // the live stall IDENTICALLY): a programmatic `currentTime` seek on an
    // autoplaying muted <video> in headless Chromium never resolves
    // (`seeking: true, paused: true` forever at the seek target) — the loop
    // SEAM is unmeasurable headlessly. The honest proxy: pin the `loop`
    // ATTRIBUTE (pinned in the census test above) + the advancing clock —
    // a playing, looping, 8s video's currentTime is a monotone sawtooth,
    // and the advancing read is the measurable half of that contract.
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const t1 = await page.evaluate(() => document.querySelector("video")?.currentTime ?? -1);
    await page.waitForTimeout(1200);
    const t2 = await page.evaluate(() => document.querySelector("video")?.currentTime ?? -1);
    const loopAttr = await page.evaluate(() => document.querySelector("video")?.hasAttribute("loop") ?? false);
    expect(loopAttr).toBe(true);
    expect(t2).toBeGreaterThan(t1); // the clock advances — the loop's measurable half
    expect(t2).toBeLessThan(8); // still inside the 8s loop window
  });

  test("zero <audio> elements anywhere on the landing (the empty-set)", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const count = await page.evaluate(() => document.querySelectorAll("audio").length);
    expect(count).toBe(0);
  });
});

test.describe("the nineteenth surface's route extension — the /login alternates census (Session 45)", () => {
  // the census instrument (the S43 pattern): every RENDERED interactive's
  // computed cursor + autocomplete attribute
  const census = (page: Page) =>
    page.evaluate(() => {
      const els = Array.from(
        document.querySelectorAll("a[href], button, input, textarea, select"),
      ).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
      });
      return els.map((el) => ({
        tag: el.tagName.toLowerCase(),
        cursor: getComputedStyle(el).cursor,
        autocomplete: el.getAttribute("autocomplete"),
        name: el.getAttribute("name"),
      }));
    });

  test("default state: 6 interactives (4 pointer + 2 text), the autocomplete pair", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const rows = await census(page);
    expect(rows.length).toBe(6);
    expect(rows.filter((r) => r.cursor === "pointer").length).toBe(4);
    expect(rows.filter((r) => r.cursor === "text").length).toBe(2);
    const ac = rows.filter((r) => r.autocomplete).map((r) => r.autocomplete);
    expect(ac.sort()).toEqual(["current-password", "email"]); // the D148 registered superset
  });

  test("sign-up state: 5 (2 pointer + 3 text), email + new-password x2", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.getByText("Sign up", { exact: false }).first().click();
    await page.waitForTimeout(600);
    const rows = await census(page);
    expect(rows.length).toBe(5);
    expect(rows.filter((r) => r.cursor === "pointer").length).toBe(2);
    expect(rows.filter((r) => r.cursor === "text").length).toBe(3);
    const ac = rows.filter((r) => r.autocomplete).map((r) => r.autocomplete);
    expect(ac.sort()).toEqual(["email", "new-password", "new-password"]); // the password + confirm pair
  });

  test("forgot state: 3 (2 pointer + 1 text), email", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.getByText("Forgot password?", { exact: false }).first().click();
    await page.waitForTimeout(600);
    const rows = await census(page);
    expect(rows.length).toBe(3);
    expect(rows.filter((r) => r.cursor === "pointer").length).toBe(2);
    expect(rows.filter((r) => r.cursor === "text").length).toBe(1);
    const ac = rows.filter((r) => r.autocomplete).map((r) => r.autocomplete);
    expect(ac).toEqual(["email"]); // the forgot state's single field
  });
});
