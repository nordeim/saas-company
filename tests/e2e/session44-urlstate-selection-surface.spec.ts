import { expect, test, type Page } from "@playwright/test";

/**
 * Session 44 — the NINETEENTH surface (the URL-state + navigation-class +
 * selection/view-transition contracts) + the eighteenth surface's ROUTE
 * EXTENSION (the /demo input census).
 *
 * THE MEASUREMENTS (research/recon-s44.mjs + adj-s44.mjs + adj2-s44.mjs,
 * paired clone-vs-live):
 *
 * THE HASH-CLICK CONTRACT — exact parity: the hero `#pricing` CTA settles
 * at the same scrollY on both sides with the target's top at 0 (the
 * SCROLL-SETTLE law applied — poll scrollY to a stable pair; both sites
 * ANIMATE programmatic scrolls: the clone's Lenis, the live's CSS
 * scroll-behavior).
 *
 * THE FRESH-LOAD HASH — the REGISTERED SUPERSET (the gotcha-18 burger
 * family): the live NEVER scrolls on `/#pricing` direct loads (its SPA
 * shell lacks the anchor at parse time — `#pricing` enters the DOM at
 * t≈516–810ms, after the browser's native hash-jump has already failed;
 * nothing re-triggers the scroll after mount), while the clone's SSR HTML
 * carries the anchor from t≈69ms and the native jump settles at the target
 * by t≈325–470ms. Deep links to page sections WORK in the clone — shareable
 * `#pricing` URLs land at the section. Never "fix" the clone toward the
 * live's broken state.
 *
 * THE QUERY-PARAM TOLERANCE — parity: `?utm_source` / `?ref` leave every
 * page rendering normally with canonical + og:url CLEAN of the query on
 * both sides.
 *
 * THE TRAILING-SLASH + CASE RECORDS — the honest-status family: `/faq/`
 * answers 308 → `/faq` (single canonical URL at the status-code layer —
 * the live serves 200-at-both, the SPA anything-answers family, its
 * canonical self-correcting); `/FAQ` answers the honest 404 (the live:
 * 200 + rendered SPA-404 — the D68 family).
 *
 * THE SELECTION + VIEW-TRANSITION EMPTY-SETS — parity: zero `::selection`
 * rules (the gotcha-23 record, now formally measured), `user-select: auto`
 * on EVERY text-bearing element (neither side disables selection), zero
 * `@view-transition` rules, zero `view-transition-name` declarations (the
 * S42 print-surface pattern: `document.startViewTransition === "function"`
 * is browser API availability, not app behavior — excluded).
 *
 * THE ROUTE-CHANGE CLASS — the platform superset (the D125 law): the live
 * does FULL PAGE LOADS on its route links (the footer `/faq` link and the
 * Log In button: 1 full load each — the window mark gone; its logo click
 * is same-document, its own inconsistency), while the clone does
 * CLIENT-SIDE transitions everywhere (0 full loads, the window mark
 * survives — the Next App Router `<Link>`/`router.push` behavior). The
 * decisive instrument: the page `load`-event counter (fires ONLY on full
 * document loads) + the window-mark survival test. (The inverted-probe
 * law, SKILL lesson 83: a naive same-document mark comparison reads TRUE
 * on the full-load side when its comparator is undefined — undefined ===
 * undefined — and FALSE on the client-nav side; always pair the mark with
 * the load counter.)
 *
 * THE /demo INPUT CENSUS (the eighteenth surface's route extension — the
 * registered D73 superset route; the live soft-404s /demo, no pairing
 * possible): 22 pointer + 5 text + 0 other across 27 rendered
 * interactives; the autocomplete trio `name`/`email`/`organization` (the
 * S14 functional-superset family) with the message textarea + the footer
 * newsletter input attribute-less (the registered parity contract); the
 * caret uniform rgb(255, 255, 255).
 *
 * These pins version the CLONE side of the contracts so a future
 * regression (a broken hash scroll, a query-leaking canonical, a dropped
 * 308, a selection rule invented, a full-load regression on a route link,
 * a restyled cursor on /demo) surfaces loudly.
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

test.describe("the hash-click contract (Session 44 — the nineteenth surface)", () => {
  test("the hero #pricing CTA settles with the target at the viewport top", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    await page.click('a[href="#pricing"]');
    const settledY = await settleScroll(page);
    const after = await page.evaluate(() => {
      const target = document.getElementById("pricing");
      const rect = target ? target.getBoundingClientRect() : null;
      return { hash: location.hash, exists: !!target, top: rect ? Math.abs(Math.round(rect.top)) : null };
    });
    expect(after.exists).toBe(true);
    expect(after.hash).toBe("#pricing");
    expect(after.top).toBe(0);
    expect(settledY).toBeGreaterThan(0);
  });

  test("the nav #features link settles with the target at the viewport top", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    await page.click('nav a[href="#features"]');
    await settleScroll(page);
    const after = await page.evaluate(() => {
      const target = document.getElementById("features");
      const rect = target ? target.getBoundingClientRect() : null;
      return { hash: location.hash, exists: !!target, top: rect ? Math.abs(Math.round(rect.top)) : null };
    });
    expect(after.exists).toBe(true);
    expect(after.hash).toBe("#features");
    expect(after.top).toBe(0);
  });
});

test.describe("the fresh-load hash contract (the registered superset)", () => {
  test("/#pricing direct: the SSR anchor scrolls the page to the section", async ({ page }) => {
    await page.goto("/#pricing");
    // the anchor exists in the SSR HTML — verify pre-scroll (the contract
    // the live's SPA shell cannot satisfy: its anchor mounts at t≈500ms+,
    // after the native hash-jump window)
    const anchorEarly = await page.evaluate(() => !!document.getElementById("pricing"));
    const settledY = await settleScroll(page);
    const after = await page.evaluate(() => {
      const target = document.getElementById("pricing");
      const rect = target ? target.getBoundingClientRect() : null;
      return { hash: location.hash, top: rect ? Math.abs(Math.round(rect.top)) : null };
    });
    expect(anchorEarly).toBe(true);
    expect(after.hash).toBe("#pricing");
    expect(after.top).toBe(0);
    expect(settledY).toBeGreaterThan(0);
  });

  test("/#features direct: the SSR anchor scrolls the page to the section", async ({ page }) => {
    await page.goto("/#features");
    const settledY = await settleScroll(page);
    const after = await page.evaluate(() => {
      const target = document.getElementById("features");
      const rect = target ? target.getBoundingClientRect() : null;
      return { hash: location.hash, top: rect ? Math.abs(Math.round(rect.top)) : null };
    });
    expect(after.hash).toBe("#features");
    expect(after.top).toBe(0);
    expect(settledY).toBeGreaterThan(0);
  });
});

test.describe("the query-param tolerance", () => {
  test("utm/ref params render the page and leave canonical + og:url clean", async ({ page }) => {
    const cases: Array<[string, string, number]> = [
      ["/?utm_source=test", "/", 739],
      ["/faq?utm_medium=x", "/faq", 101],
      ["/thank-you?ref=42", "/thank-you", 36],
    ];
    for (const [url, path, words] of cases) {
      await page.goto(url);
      await page.waitForTimeout(700);
      const head = await page.evaluate(() => ({
        canonical: (document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null)?.href ?? null,
        ogUrl: (document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null)?.content ?? null,
        wordCount: (document.body.innerText || "").trim().split(/\s+/).filter(Boolean).length,
      }));
      expect(head.wordCount).toBe(words);
      expect(new URL(head.canonical!).pathname).toBe(path);
      expect(new URL(head.canonical!).search).toBe("");
      expect(new URL(head.ogUrl!).pathname).toBe(path);
      expect(new URL(head.ogUrl!).search).toBe("");
    }
  });
});

test.describe("the trailing-slash + case-canonicalization records (the honest-status family)", () => {
  test("/faq/ 308-redirects to the canonical /faq; / stays 200", async ({ page }) => {
    const slashed = await page.request.get("/faq/", { maxRedirects: 0 });
    expect(slashed.status()).toBe(308);
    expect(slashed.headers()["location"]).toBe("/faq");
    const root = await page.request.get("/", { maxRedirects: 0 });
    expect(root.status()).toBe(200);
  });

  // THE BUILD (D149). The first draft of this pin asserted "/FAQ serves
  // the honest 404" — an UNPROBED assumption from the recon (only the
  // live's HTTP 200 was measured; the render was assumed to match the
  // soft-404 four). The adj3-s44 P2 probe disproved it: the live serves
  // THE FAQ PAGE ITSELF at /FAQ (101 words, title "FAQ | SAAS Company")
  // — its SPA router matches case-insensitively for every working
  // content route (/Faq, /FaQ, /THANK-YOU, /Privacy, /TERMS,
  // /Accessibility, /Refund-Policy all serve their pages; only /LOGIN —
  // the live's separate Base44 auth page — stays case-sensitive). The
  // clone 404'd every case variant — the S43 /thank-you family again:
  // the clone 404ing what the live serves working. The middleware now
  // canonicalizes: 308 to the lowercase route (the honest-status family
  // — the live serves duplicate 200s at every casing; the clone serves
  // the single canonical URL).
  test("/FAQ 308-redirects to the lowercase canonical /faq (the case-insensitive live's parity)", async ({ page }) => {
    const res = await page.request.get("/FAQ", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe("/faq");
    const followed = await page.request.get("/faq");
    expect(followed.status()).toBe(200);
  });

  test("every case variant of every route canonicalizes (the sweep)", async ({ page }) => {
    // the content routes the live serves case-insensitively + the
    // clone's own superset routes (/LOGIN, /DEMO, /DASHBOARD — the live
    // FAILS all three at any casing; the clone serving them is the
    // functional superset)
    const variants: Array<[string, string]> = [
      ["/Faq", "/faq"],
      ["/FaQ", "/faq"],
      ["/THANK-YOU", "/thank-you"],
      ["/Privacy", "/privacy"],
      ["/TERMS", "/terms"],
      ["/Accessibility", "/accessibility"],
      ["/Refund-Policy", "/refund-policy"],
      ["/LOGIN", "/login"],
      ["/DEMO", "/demo"],
      ["/DASHBOARD", "/dashboard"],
    ];
    for (const [variant, canonical] of variants) {
      const res = await page.request.get(variant, { maxRedirects: 0 });
      expect(res.status(), `${variant} should 308`).toBe(308);
      expect(res.headers()["location"], `${variant} location`).toBe(canonical);
    }
  });

  test("case + trailing slash canonicalizes through the redirect chain (/FAQ/ -> /FAQ -> /faq)", async ({ page }) => {
    // TWO 308 hops, both permanent and cacheable: Next 16's own
    // trailing-slash normalization answers FIRST (it precedes the proxy
    // in the request chain — /FAQ/ -> /FAQ, the case preserved), then
    // the proxy canonicalizes the case (/FAQ -> /faq). The end state is
    // the single canonical URL; the chain is the framework's order,
    // not a defect (the one-hop ideal would require fighting Next's
    // core slash handling — never worth it).
    const hop1 = await page.request.get("/FAQ/", { maxRedirects: 0 });
    expect(hop1.status()).toBe(308);
    expect(hop1.headers()["location"]).toBe("/FAQ");
    const hop2 = await page.request.get("/FAQ", { maxRedirects: 0 });
    expect(hop2.status()).toBe(308);
    expect(hop2.headers()["location"]).toBe("/faq");
    const final = await page.request.get("/faq");
    expect(final.status()).toBe(200);
  });

  test("the query string survives the canonicalization", async ({ page }) => {
    const res = await page.request.get("/FAQ?utm_source=test", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe("/faq?utm_source=test");
  });

  test("unknown routes stay the honest 404 (no over-eager redirect)", async ({ page }) => {
    for (const p of ["/PRICING", "/NOT-A-ROUTE"]) {
      const res = await page.request.get(p, { maxRedirects: 0 });
      expect(res.status(), `${p} should 404`).toBe(404);
    }
  });

  test("static assets never redirect (the pass-through)", async ({ page }) => {
    const res = await page.request.get("/OG-IMAGE.PNG", { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });
});

test.describe("the selection surface (the empty-set + all-auto contract)", () => {
  test("zero ::selection rules in CSSOM and document style text", async ({ page }) => {
    for (const route of ["/", "/login", "/faq"]) {
      await page.goto(route);
      await page.waitForTimeout(700);
      const scan = await page.evaluate(() => {
        let cssomHits = 0;
        const walk = (rules: CSSRuleList) => {
          for (const rule of rules) {
            if ((rule as CSSMediaRule).cssRules) walk((rule as CSSMediaRule).cssRules);
            if ((rule as CSSStyleRule).selectorText?.includes("::selection")) cssomHits++;
          }
        };
        for (const sheet of document.styleSheets) {
          try {
            walk(sheet.cssRules);
          } catch {
            /* cross-origin */
          }
        }
        let docStyleHits = 0;
        for (const el of document.querySelectorAll("style")) {
          docStyleHits += (el.textContent || "").match(/::selection/g)?.length ?? 0;
        }
        return { cssomHits, docStyleHits };
      });
      expect(scan.cssomHits).toBe(0);
      expect(scan.docStyleHits).toBe(0);
    }
  });

  test("user-select reads auto on every text-bearing element (the versioned census)", async ({ page }) => {
    // the clone's measured counts (recon-s44 R2a @1280×720): / 355,
    // /login 31, /faq 91 — the counts include only rendered text-bearing
    // elements; the live's counts differ by the registered DOM-structure
    // families (toaster shells, route announcer, Radix wrappers)
    const expected: Record<string, { auto: number; total: number }> = {
      "/": { auto: 355, total: 355 },
      "/login": { auto: 31, total: 31 },
      "/faq": { auto: 91, total: 91 },
    };
    for (const [route, want] of Object.entries(expected)) {
      await page.goto(route);
      await page.waitForTimeout(700);
      const census = await page.evaluate(() => {
        const counts: Record<string, number> = {};
        let total = 0;
        for (const el of document.body.querySelectorAll("*")) {
          if (!el.textContent?.trim()) continue;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") continue;
          total++;
          counts[cs.userSelect] = (counts[cs.userSelect] || 0) + 1;
        }
        return { counts, total };
      });
      expect(census.total).toBe(want.total);
      expect(census.counts["auto"]).toBe(want.auto);
      expect(Object.keys(census.counts)).toEqual(["auto"]);
    }
  });
});

test.describe("the view-transition surface (the empty-set)", () => {
  test("zero @view-transition rules and zero view-transition-name declarations", async ({ page }) => {
    for (const route of ["/", "/login", "/faq"]) {
      await page.goto(route);
      await page.waitForTimeout(700);
      const scan = await page.evaluate(() => {
        let atRules = 0;
        let nameDecls = 0;
        const walk = (rules: CSSRuleList) => {
          for (const rule of rules) {
            if ((rule as CSSMediaRule).cssRules) walk((rule as CSSMediaRule).cssRules);
            if (rule instanceof CSSViewTransitionRule) atRules++;
            if (/view-transition-name/.test(rule.cssText || "")) nameDecls++;
          }
        };
        for (const sheet of document.styleSheets) {
          try {
            walk(sheet.cssRules);
          } catch {
            /* cross-origin */
          }
        }
        return { atRules, nameDecls };
      });
      expect(scan.atRules).toBe(0);
      expect(scan.nameDecls).toBe(0);
    }
  });
});

test.describe("the route-change class (the platform superset)", () => {
  // the decisive instrument: the page 'load' event fires ONLY on full
  // document loads — a client-side transition fires none. Paired with the
  // window-mark survival test (the inverted-probe law, lesson 83: the
  // mark comparison ALONE reads true on the full-load side — undefined
  // === undefined — and must never be used unpaired).
  async function navClass(page: Page, startPath: string, selector: string) {
    let loadCount = 0;
    const onLoad = () => {
      loadCount++;
    };
    page.on("load", onLoad);
    await page.goto(startPath);
    await page.waitForTimeout(800);
    const mark = await page.evaluate(() => {
      const w = window as unknown as { __navMark?: string };
      w.__navMark = "m-" + Math.random();
      return w.__navMark;
    });
    loadCount = 0; // count only loads after this point
    await page.click(selector);
    await page.waitForTimeout(1500);
    const after = await page.evaluate(
      (markBefore) => ({ mark: (window as unknown as { __navMark?: string }).__navMark ?? null, url: location.pathname }),
      mark,
    );
    page.off("load", onLoad);
    return { fullLoads: loadCount, markSurvived: after.mark === mark, url: after.url };
  }

  test("the footer /faq link navigates client-side (0 full loads, mark survives)", async ({ page }) => {
    const out = await navClass(page, "/", 'footer a[href="/faq"]');
    expect(out.url).toBe("/faq");
    expect(out.fullLoads).toBe(0);
    expect(out.markSurvived).toBe(true);
  });

  test("the logo click navigates client-side; the Log In button too", async ({ page }) => {
    const logo = await navClass(page, "/faq", 'a[href="/"] >> nth=0');
    expect(logo.url).toBe("/");
    expect(logo.fullLoads).toBe(0);
    expect(logo.markSurvived).toBe(true);

    const login = await navClass(page, "/", 'nav button:has-text("Log In")');
    expect(login.url).toBe("/login");
    expect(login.fullLoads).toBe(0);
    expect(login.markSurvived).toBe(true);
  });
});

test.describe("the /demo input census (the eighteenth surface's route extension)", () => {
  test("cursor 22 pointer + 5 text, the autocomplete trio, the caret white", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForTimeout(700);
    const census = await page.evaluate(() => {
      const cursor = { pointer: 0, text: 0, other: 0 };
      const autocomplete: string[] = [];
      const caret = new Set<string>();
      let total = 0;
      for (const el of document.querySelectorAll("a, button, input, textarea, select, [role='button']")) {
        if (!el.getClientRects().length) continue;
        total++;
        const cs = getComputedStyle(el);
        if (cs.cursor === "pointer") cursor.pointer++;
        else if (cs.cursor === "text") cursor.text++;
        else cursor.other++;
        const ac = el.getAttribute("autocomplete");
        if (ac) autocomplete.push(`${(el as HTMLInputElement).name}=${ac}`);
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") caret.add(cs.caretColor);
      }
      return { cursor, autocomplete, caret: [...caret], total };
    });
    expect(census.total).toBe(27);
    expect(census.cursor).toEqual({ pointer: 22, text: 5, other: 0 });
    expect(census.autocomplete.sort()).toEqual(["company=organization", "email=email", "name=name"]);
    expect(census.caret).toEqual(["rgb(255, 255, 255)"]);
  });
});
