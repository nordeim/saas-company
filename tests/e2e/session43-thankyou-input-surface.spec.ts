import { expect, test, type Page } from "@playwright/test";

/**
 * Session 43 — the /thank-you working-parity route + the EIGHTEENTH
 * surface (the cursor/caret + form-autofill contract) + the focus-order
 * ROUTE EXTENSION (the sixteenth surface's route growth).
 *
 * THE HEADLINE (research/adj-s43.mjs A1/A2/A3 + adj2-s43.mjs): the
 * live serves a REAL page at /thank-you (36 words) — a payment-success
 * interstitial ("Payment Successful!"), bare-centered (NO nav, NO
 * footer, NO landmarks — the live's own structure; the dormant toaster
 * shell the registered D124/D126 live-side family, never simulated),
 * listed in the live's own sitemap (weekly/0.8), with the full head
 * contract (the D117-truncated description — the pageDescription seam
 * reproduces the live's string byte-exactly) and the JSON-LD trio
 * (WebSite + Organization + the BreadcrumbList [Home, Thank You]).
 * The A2 probe DISPROVED the S14 rationale (the live's newsletter
 * form does NOT navigate to /thank-you — the submit stays at /, an
 * inline fetch flow): the "newsletter-success route" comment was a
 * misidentification; the page is the checkout-success destination.
 * The clone 404'd it (the registered "404-by-design") — the ONLY
 * route where the clone soft-404s what the live serves working, the
 * mirror image of the D73/D146 record. This session BUILDS it at the
 * measured parity contract: post-build every one of the live's 8
 * public routes works in the clone, plus /demo.
 *
 * THE EIGHTEENTH SURFACE (research/recon-s43.mjs R3/R4, paired
 * clone-vs-live): the cursor layer — every rendered interactive's
 * computed cursor at REST reads POINTER on links/buttons and TEXT on
 * entry controls on both sides (the clone's base-layer
 * `button, [role="button"] { cursor: pointer }` [gotcha 3] matches
 * the live's own pointer behavior; the census identical on / [32+1],
 * /login [4+2], /faq [27+1]); the caret layer — caret-color is the
 * auto-inherited currentColor on both sides (rgb(255,255,255) on the
 * dark routes, rgb(9,9,11) on /login; neither side ships an explicit
 * rule); the autofill layer — the :autofill/:-webkit-autofill rule
 * scan reads ZERO rules on both sides (the empty-set contract), and
 * the live ships NO autocomplete attributes anywhere while the clone
 * carries the REGISTERED S14-era functional superset on the login
 * pair (email + current-password — password-manager + browser
 * autofill assist, WCAG 1.3.5; the registry's fourth DOM entry).
 *
 * THE ROUTE EXTENSION (research/recon-s43.mjs R2, paired): the four
 * legal routes' walks at 1440 — IDENTICAL 22-stop sequences both
 * sides (the nav 8 + the footer 12 + the newsletter pair; the legal
 * bodies carry no tab stops), the only deltas the registered S41
 * a11y-name supersets (the logo "NovaAI home", the newsletter
 * "Email address"/"Subscribe"); /privacy at 390 — the 16-stop
 * sequence both sides (the burger swaps in for the hidden desktop
 * links).
 *
 * These pins version the CLONE side of the contracts so a future
 * regression (a reflowed success page, a dropped autocomplete attr, a
 * cursor restyle, a footer link unmounting) surfaces loudly.
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

// the legal routes' shared 22-stop skeleton at 1440 (the measured walk —
// the nav 8 + the footer 12 + the newsletter pair; stops 1/21/22 carry
// the clone's registered a11y names)
const LEGAL_1440: Stop[] = [
  { tag: "a", type: "", name: "NovaAI home", href: "/" },
  { tag: "a", type: "", name: "Features", href: "#features" },
  { tag: "a", type: "", name: "How It Works", href: "#how-it-works" },
  { tag: "a", type: "", name: "Pricing", href: "#pricing" },
  { tag: "a", type: "", name: "Testimonials", href: "#testimonials" },
  { tag: "a", type: "", name: "FAQ", href: "/faq" },
  { tag: "button", type: "", name: "Log In", href: "" },
  { tag: "a", type: "", name: "Get Started", href: "#pricing" },
  { tag: "a", type: "", name: "Features", href: "#features" },
  { tag: "a", type: "", name: "Pricing", href: "#pricing" },
  { tag: "a", type: "", name: "FAQ", href: "/faq" },
  { tag: "a", type: "", name: "Docs", href: "#" },
  { tag: "a", type: "", name: "Privacy", href: "/privacy" },
  { tag: "a", type: "", name: "Terms", href: "/terms" },
  { tag: "a", type: "", name: "Accessibility", href: "/accessibility" },
  { tag: "a", type: "", name: "Refund Policy", href: "/refund-policy" },
  { tag: "a", type: "", name: "Twitter", href: "#" },
  { tag: "a", type: "", name: "LinkedIn", href: "#" },
  { tag: "a", type: "", name: "Instagram", href: "#" },
  { tag: "a", type: "", name: "GitHub", href: "#" },
  { tag: "input", type: "email", name: "Email address", href: "" },
  { tag: "button", type: "submit", name: "Subscribe", href: "" },
];

// /privacy's 16-stop skeleton at 390 (the measured walk: the burger
// swaps in for the collapsed desktop nav block; the tab order then runs
// the footer's first-column links + the legal column + the socials +
// the newsletter pair)
const PRIVACY_390: Stop[] = [
  { tag: "a", type: "", name: "NovaAI home", href: "/" },
  { tag: "button", type: "", name: "Open menu", href: "" },
  { tag: "a", type: "", name: "Features", href: "#features" },
  { tag: "a", type: "", name: "Pricing", href: "#pricing" },
  { tag: "a", type: "", name: "FAQ", href: "/faq" },
  { tag: "a", type: "", name: "Docs", href: "#" },
  { tag: "a", type: "", name: "Privacy", href: "/privacy" },
  { tag: "a", type: "", name: "Terms", href: "/terms" },
  { tag: "a", type: "", name: "Accessibility", href: "/accessibility" },
  { tag: "a", type: "", name: "Refund Policy", href: "/refund-policy" },
  { tag: "a", type: "", name: "Twitter", href: "#" },
  { tag: "a", type: "", name: "LinkedIn", href: "#" },
  { tag: "a", type: "", name: "Instagram", href: "#" },
  { tag: "a", type: "", name: "GitHub", href: "#" },
  { tag: "input", type: "email", name: "Email address", href: "" },
  { tag: "button", type: "submit", name: "Subscribe", href: "" },
];

test.describe("the /thank-you working-parity route (Session 43 — the R1 build)", () => {
  test("the render contract: the live's payment-success page — 36 words, the verbatim classes, the BARE structure", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/thank-you");
    await page.waitForTimeout(800);
    const d = await page.evaluate(() => {
      const cta = [...document.querySelectorAll("a")].find((el) => /back to home/i.test(el.innerText || "")) || null;
      const icon = document.querySelector("svg.lucide-circle-check-big") || null;
      const wrapper = document.querySelector("div.min-h-screen"); // the page's own wrapper
      return {
        words: (document.body.innerText || "").trim().split(/\s+/).filter(Boolean).length,
        h1: document.querySelector("h1")?.innerText || "",
        p1: document.querySelectorAll("p")[0]?.innerText || "",
        p2: document.querySelectorAll("p")[1]?.innerText || "",
        ctaTag: cta?.tagName.toLowerCase() || "",
        ctaHref: cta?.getAttribute("href") || "",
        ctaText: cta?.innerText || "",
        ctaClasses: cta?.getAttribute("class") || "",
        ctaHeight: cta ? Math.round(cta.getBoundingClientRect().height) : -1,
        iconClasses: icon?.getAttribute("class") || "",
        iconColor: icon ? getComputedStyle(icon).color : "",
        wrapperClasses: wrapper?.getAttribute("class") || "",
        landmarks: document.querySelectorAll("header, nav, main, footer").length,
        inputs: document.querySelectorAll("input, textarea, select").length,
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        docH: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      };
    });
    // the live's measured word count (36) — the payment-success copy
    expect(d.words, "the 36-word payment-success body").toBe(36);
    expect(d.h1).toBe("Payment Successful!");
    expect(d.p1).toBe("Thank you for upgrading to NovaAI. Your plan is now active and you can start automating right away.");
    expect(d.p2).toBe("A confirmation email has been sent to your inbox with all the details.");
    // the CTA: the live's ANCHOR (not a button) with the verbatim pill classes
    expect(d.ctaTag).toBe("a");
    expect(d.ctaHref).toBe("/");
    expect(d.ctaText).toBe("Back to Home");
    expect(d.ctaClasses).toBe("inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-all");
    expect(d.ctaHeight).toBe(56);
    // the icon row: the lucide circle-check-big at green-500 (#22c55e — the pinned v3 hex)
    expect(d.iconClasses).toContain("lucide-circle-check-big");
    expect(d.iconClasses).toContain("text-green-500");
    expect(d.iconColor).toBe("rgb(34, 197, 94)");
    // the wrapper: the live's verbatim classes (bg-background = the pinned #000 token)
    expect(d.wrapperClasses).toBe("min-h-screen bg-background flex items-center justify-center px-6");
    // the BARE-page contract: NO nav, NO footer, NO landmarks — the live's own structure
    expect(d.landmarks, "no header/nav/main/footer — the live's bare interstitial").toBe(0);
    expect(d.inputs).toBe(0);
    expect(d.overflowX).toBe(0);
    expect(Math.abs(d.docH - d.innerHeight), "docH = the viewport (the min-h-screen center)").toBeLessThanOrEqual(4);
  });

  test("the head contract: the D117-truncated description, the per-route canonical/og:url/twitter:url, the JSON-LD trio", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/thank-you");
    await page.waitForTimeout(600);
    const head = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector("meta[name='description']")?.getAttribute("content") ?? null,
      canonical: document.querySelector("link[rel='canonical']")?.getAttribute("href") ?? null,
      ogUrl: document.querySelector("meta[property='og:url']")?.getAttribute("content") ?? null,
      twUrl: document.querySelector("meta[name='twitter:url']")?.getAttribute("content") ?? null,
      ogImage: document.querySelector("meta[property='og:image']")?.getAttribute("content") ?? null,
      ogImageAlt: document.querySelector("meta[property='og:image:alt']")?.getAttribute("content") ?? null,
      jsonld: [...document.querySelectorAll("script[type='application/ld+json']")].map((s) => s.textContent || ""),
    }));
    expect(head.title).toBe("Thank You | SAAS Company");
    // the D117-truncated description — the pageDescription seam's byte-exact output
    expect(head.desc).toBe("Thank You on SAAS Company. Your intelligent AI assistant that streamlines complex workflows with an immersi.");
    // the per-route URL trio (origin-agnostic pathname pins — the head-metadata pattern)
    expect(head.ogUrl).toBeTruthy();
    expect(new URL(head.ogUrl!).pathname).toBe("/thank-you");
    expect(head.canonical).toBe(head.ogUrl);
    expect(head.twUrl).toBeTruthy();
    expect(new URL(head.twUrl!).pathname).toBe("/thank-you");
    // the working og-image replacement (the live's own URL is dead — the D30/D121 policy)
    expect(head.ogImage).toContain("/og-image.png");
    // NO og:image:alt here (the /login-only D121 record — measured on the live's /thank-you)
    expect(head.ogImageAlt).toBeNull();
    // the JSON-LD trio: the sitewide pair + the BreadcrumbList [Home, Thank You]
    expect(head.jsonld.length).toBe(3);
    const joined = head.jsonld.join("\n");
    expect(joined).toContain('"@type":"WebSite"');
    expect(joined).toContain('"@type":"Organization"');
    expect(joined).toContain('"@type":"BreadcrumbList"');
    expect(joined).toContain('"name":"Thank You"');
    expect(joined).toContain("/thank-you"); // the breadcrumb's absolute item (origin-agnostic)
  });

  test("the focus walk: exactly ONE stop — the Back to Home anchor (the live's own walk)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/thank-you");
    await page.waitForTimeout(800);
    const stops = await walk(page, 8);
    expect(stops.length, "the single-stop walk the live ships").toBe(1);
    expect(stops[0]!.tag).toBe("a");
    expect(stops[0]!.href).toBe("/");
    expect(stops[0]!.name).toBe("Back to Home");
  });

  test("the responsive contract: the 390 rendering (the h1 at text-4xl, the CTA geometry, zero overflow)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/thank-you");
    await page.waitForTimeout(700);
    const d = await page.evaluate(() => {
      const h1 = document.querySelector("h1")!;
      const cta = [...document.querySelectorAll("a")].find((el) => /back to home/i.test(el.innerText || ""))!;
      const r1 = h1.getBoundingClientRect();
      const rc = cta.getBoundingClientRect();
      return {
        h1Font: getComputedStyle(h1).fontSize,
        h1Rect: { x: Math.round(r1.x), w: Math.round(r1.width) },
        ctaRect: { x: Math.round(rc.x), w: Math.round(rc.width), h: Math.round(rc.height) },
        ctaFont: getComputedStyle(cta).fontSize,
        ctaPad: getComputedStyle(cta).padding,
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        docH: document.documentElement.scrollHeight,
      };
    });
    expect(d.h1Font, "the h1 at text-4xl (36px) below md").toBe("36px");
    expect(d.h1Rect.x).toBe(24); // px-6
    expect(d.ctaRect.h).toBe(56);
    expect(d.ctaFont).toBe("16px");
    expect(d.ctaPad).toBe("16px 32px");
    expect(Math.abs(d.ctaRect.x + d.ctaRect.w / 2 - 195), "the CTA centered at 390").toBeLessThanOrEqual(2);
    expect(d.overflowX).toBe(0);
  });
});

test.describe("the eighteenth surface — the cursor/caret + form-autofill contract (Session 43)", () => {
  test("the cursor census at parity: pointer on interactives, text on entry controls (the measured counts)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const census = async (route: string) => {
      await page.goto(route);
      await page.waitForTimeout(700);
      return page.evaluate(() => {
        const sels = "a, button, input, textarea, select, [role='button'], [role='tab'], [role='switch'], [role='checkbox']";
        const counts: Record<string, number> = {};
        let total = 0;
        for (const el of document.querySelectorAll(sels)) {
          if (el.getClientRects().length === 0) continue; // the rendered test (gotcha 48)
          const c = getComputedStyle(el).cursor;
          counts[c] = (counts[c] || 0) + 1;
          total++;
        }
        return { total, counts };
      });
    };
    // the measured parities (recon-s43 R3): / 33 interactives = 32 pointer + 1 text;
    // /login 6 = 4 + 2; /faq 28 = 27 + 1 — the live's own census on every route
    const landing = await census("/");
    expect(landing.total).toBe(33);
    expect(landing.counts).toEqual({ pointer: 32, text: 1 });
    const login = await census("/login");
    expect(login.total).toBe(6);
    expect(login.counts).toEqual({ pointer: 4, text: 2 });
    const faq = await census("/faq");
    expect(faq.total).toBe(28);
    expect(faq.counts).toEqual({ pointer: 27, text: 1 });
  });

  test("the caret contract: the auto-inherited currentColor (white on the dark routes, zinc-950 on /login)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const carets = async (route: string) => {
      await page.goto(route);
      await page.waitForTimeout(600);
      return page.evaluate(() =>
        [...document.querySelectorAll("input, textarea")]
          .filter((el) => el.getClientRects().length > 0)
          .map((el) => getComputedStyle(el).caretColor),
      );
    };
    expect(await carets("/")).toEqual(["rgb(255, 255, 255)"]); // the newsletter input on the dark canvas
    expect(await carets("/faq")).toEqual(["rgb(255, 255, 255)"]);
    expect(await carets("/login")).toEqual(["rgb(9, 9, 11)", "rgb(9, 9, 11)"]); // the light login card (zinc-950)
  });

  test("the autocomplete contract: the login pair's REGISTERED superset, the newsletter attribute-less parity, the :autofill empty-set", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // the login pair: the registered S14 functional superset (the live ships none — measured)
    await page.goto("/login");
    await page.waitForTimeout(600);
    const login = await page.evaluate(() => ({
      email: document.querySelector("input[type='email']")?.getAttribute("autocomplete") ?? null,
      password: document.querySelector("input[type='password']")?.getAttribute("autocomplete") ?? null,
    }));
    expect(login.email).toBe("email");
    expect(login.password).toBe("current-password");
    // the newsletter inputs on / and /faq: NO autocomplete — the live's own attribute-less contract
    for (const route of ["/", "/faq"]) {
      await page.goto(route);
      await page.waitForTimeout(600);
      const ac = await page.evaluate(() =>
        [...document.querySelectorAll("footer input")].map((el) => el.getAttribute("autocomplete")),
      );
      expect(ac.length).toBeGreaterThan(0);
      expect(ac.every((v) => v === null), `${route}: the newsletter input carries no autocomplete (parity)`).toBe(true);
    }
    // the :autofill empty-set: neither side ships autofill styling (recon-s43 R4)
    await page.goto("/login");
    await page.waitForTimeout(500);
    const autofillRules = await page.evaluate(() => {
      let n = 0;
      for (const sheet of document.styleSheets) {
        let rules; try { rules = sheet.cssRules; } catch { continue; }
        if (!rules) continue;
        for (const rule of rules) if (/:(-webkit-)?autofill/.test(rule.cssText || "")) n++;
      }
      return n;
    });
    expect(autofillRules, "zero :autofill rules (the empty-set contract)").toBe(0);
  });
});

test.describe("the focus-order route extension (Session 43 — the sixteenth surface's route growth)", () => {
  test("the four legal routes share the IDENTICAL 22-stop walk at 1440 (the nav + footer + newsletter skeleton)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const route of ["/privacy", "/terms", "/accessibility", "/refund-policy"]) {
      await page.goto(route);
      await page.waitForTimeout(900);
      const stops = await walk(page, 40);
      expect(stops.length, `${route}: the 22-stop walk`).toBe(22);
      // the full ordered skeleton (the legal bodies carry no stops of their own)
      expect(stops, `${route}: the shared skeleton`).toEqual(LEGAL_1440);
    }
  });

  test("/privacy's 16-stop walk at 390 (the burger swaps in) + the walk-count sweep", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/privacy");
    await page.waitForTimeout(900);
    const stops = await walk(page, 40);
    expect(stops.length, "/privacy at 390: the 16-stop walk").toBe(16);
    expect(stops).toEqual(PRIVACY_390);
    // the sweep: the other legal routes carry the same mobile skeleton shape
    for (const route of ["/terms", "/refund-policy"]) {
      await page.goto(route);
      await page.waitForTimeout(800);
      const s = await walk(page, 40);
      expect(s.length, `${route} at 390: the same 16-stop shape`).toBe(16);
    }
  });
});
