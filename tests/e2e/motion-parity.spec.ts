import { expect, test } from "@playwright/test";

/**
 * Session-8 motion-layer pins (docs/remediation-plan-session8.md).
 *
 * The audit surveyed the MOTION layer for the first time — computed
 * transition/animation values of every animated element, live vs clone,
 * plus MutationObserver traces and per-frame opacity sampling on the live:
 *
 *   1. The reference drives its scroll entrances with framer-motion — a
 *      rAF loop writing inline opacity/transform per frame, easing
 *      cubic-bezier(0, 0, 0.58, 1), settled inline exactly
 *      "opacity: 1; transform: none;". The clone's CSS-transition Reveal
 *      was broken three ways (F1): entrances SNAPPED on transition-colors
 *      children (the property-list cascade), hover transitions were
 *      corrupted to 0.7s + stagger delays + will-change residue, and the
 *      timings/easings/staggers were all off.
 *   2. Entrances the live has that the clone lacked: the testimonial strip
 *      cards, the dashboard mockup, the hero mount trio, the legal pages,
 *      the /faq items; entrances the clone INVENTED: the logo-cloud
 *      container, the One-Platform inner chips, the whole-CTA block.
 *   3. Token-level engine shifts (F2/F3): v4 renamed the small shadows
 *      (shadow-sm renders one step bigger) and widened the
 *      transition-colors property list.
 *   4. The v3/v4 line-height cascade inversion (F4): responsive text-size
 *      utilities beat leading-* on the live (v3 media-query order); v4's
 *      --tw-leading always wins — three elements rendered taller.
 *   5. The login route inherits this app's global violet outline rule the
 *      live's login bundle does not ship, and its buttons/inputs lack the
 *      live's focus-visible:ring-ring class (F5).
 */

const PROBLEM_CARD = "div.hover\\:border-red-500\\/20";

test.describe("entrance behavior (Session-8 F1)", () => {
  test("problem cards ENTRANCE-ANIMATE (intermediate frames sampled, not a snap)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      // scroll past the hero so the problem section enters from below
      const card = document.querySelector("div[class*='hover:border-red-500']");
      card?.scrollIntoView({ block: "center" });
    });
    // sample in-page at rAF granularity — no round-trip latency
    const frames = await page.evaluate(() => new Promise<number[]>((resolve) => {
      const card = document.querySelector("div[class*='hover:border-red-500']") as HTMLElement | null;
      const samples: number[] = [];
      const t0 = performance.now();
      const tick = () => {
        if (card) samples.push(parseFloat(getComputedStyle(card).opacity));
        if (performance.now() - t0 < 1400) requestAnimationFrame(tick);
        else resolve(samples);
      };
      requestAnimationFrame(tick);
    }));
    // the live ramps 0 -> 1 over ~600ms; a CSS snap would jump 0 -> 1 in
    // one frame. Require at least 3 distinct intermediate values.
    const mids = frames.filter((v) => v > 0.02 && v < 0.98);
    expect(mids.length).toBeGreaterThanOrEqual(3);
    expect(frames[frames.length - 1]).toBe(1);
  });

  test("settled problem card: inline style EXACTLY 'opacity: 1; transform: none;' — no residue", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const card = document.querySelector("div[class*='hover:border-red-500']");
      card?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 1500));
    });
    const state = await page.evaluate(() => {
      const card = document.querySelector("div[class*='hover:border-red-500']") as HTMLElement;
      const cs = getComputedStyle(card);
      return {
        style: card.getAttribute("style"),
        willChange: cs.willChange,
        transDelay: cs.transitionDelay,
        transDur: cs.transitionDuration,
      };
    });
    // the live's settled framer inline state — byte-exact
    expect(state.style).toBe("opacity: 1; transform: none;");
    expect(state.willChange).toBe("auto");
    expect(state.transDelay).toBe("0s");
    // the card's OWN hover transition is back in charge (the live: 0.15s)
    expect(state.transDur).toBe("0.15s");
  });

  test("settled pricing card keeps its own 0.3s transition-all hover", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const cards = [...document.querySelectorAll("div")].filter(
        (d) => typeof d.className === "string" && d.className.includes("hover:border-white/10"),
      );
      cards[0]?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 1800));
    });
    const state = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("div")].filter(
        (d) => typeof d.className === "string" && d.className.includes("hover:border-white/10"),
      );
      const cs = getComputedStyle(cards[0]);
      return { style: cards[0].getAttribute("style"), dur: cs.transitionDuration, prop: cs.transitionProperty, delay: cs.transitionDelay };
    });
    expect(state.style).toBe("opacity: 1; transform: none;");
    expect(state.dur).toBe("0.3s");
    expect(state.prop).toBe("all");
    expect(state.delay).toBe("0s");
  });

  test("testimonial strip cards carry the motion state pre-reveal and keep their 0.5s hover", async ({ page }) => {
    await page.goto("/");
    // no scrolling: the strip is far below the fold — the cards must sit at
    // the live's initial state (y=40), each with the framer-style inline
    const pre = await page.evaluate(() => {
      const strip = [...document.querySelectorAll("div")].find(
        (d) => typeof d.className === "string" && /overflow-x-auto/.test(d.className),
      );
      const card = strip?.querySelector(":scope > div") as HTMLElement | null;
      return card ? card.getAttribute("style") : "NOT FOUND";
    });
    // React SSR serializes the initial style without spaces
    // ("opacity:0;transform:translateY(40px)") — normalize before matching.
    const preNorm = (pre ?? "").replace(/\s/g, "");
    expect(preNorm).toContain("opacity:0");
    expect(preNorm).toContain("translateY(40px)");
    // after reveal: settled exactly, hover intact (0.5s colors)
    const post = await page.evaluate(async () => {
      const strip = [...document.querySelectorAll("div")].find(
        (d) => typeof d.className === "string" && /overflow-x-auto/.test(d.className),
      );
      const card = strip?.querySelector(":scope > div") as HTMLElement;
      card?.scrollIntoView({ block: "center", inline: "start" });
      await new Promise((r) => setTimeout(r, 1800));
      const cs = getComputedStyle(card);
      return { style: card.getAttribute("style"), dur: cs.transitionDuration };
    });
    expect(post.style).toBe("opacity: 1; transform: none;");
    expect(post.dur).toBe("0.5s");
  });

  test("the dashboard mockup pre-reveals at translateY(60px) like the live", async ({ page }) => {
    await page.goto("/");
    const style = await page.evaluate(() => {
      const mockup = [...document.querySelectorAll("div")].find(
        (d) => typeof d.className === "string" && d.className.includes("max-w-4xl") && (d.textContent || "").includes("Dashboard"),
      );
      return mockup ? mockup.getAttribute("style") : "NOT FOUND";
    });
    const styleNorm = (style ?? "").replace(/\s/g, "");
    expect(styleNorm).toContain("opacity:0");
    expect(styleNorm).toContain("translateY(60px)");
  });

  test("the hero H1 is a mount-motion element (inline style carries opacity/transform)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2500);
    const style = await page.evaluate(() => document.querySelector("h1")?.getAttribute("style") || "NONE");
    // the live's H1 inline: letterSpacing/mix-blend/filter + opacity: 1; transform: none;
    expect(style).toContain("opacity: 1");
    expect(style).toContain("transform: none");
  });

  test("the legal pages' content blocks reveal on mount (settled framer inline state)", async ({ page }) => {
    await page.goto("/privacy");
    await page.waitForTimeout(1800);
    const style = await page.evaluate(() => {
      const block = [...document.querySelectorAll("div")].find(
        (d) => typeof d.className === "string" && d.className.includes("max-w-3xl"),
      );
      return block ? block.getAttribute("style") : "NOT FOUND";
    });
    expect(style).toBe("opacity: 1; transform: none;");
  });

  test("the /faq items sit in unclassed motion wrappers with staggered reveals", async ({ page, request }) => {
    // Session 12 F1 (the de-flake): the PRE-REVEAL state is pinned through
    // the STATIC HTML contract — the first FAQ item is in the initial
    // viewport, so the rAF reveal engine (delay 0, 400ms) could settle
    // BEFORE an immediate post-goto DOM read lands under load (observed
    // 2/10 isolated failures + a full-suite failure). The SSR markup ships
    // the motion endpoints deterministically.
    const ssr = await request.get("/faq");
    expect(ssr.ok()).toBe(true);
    const html = await ssr.text();
    expect(html).toContain('<div style="opacity:0;transform:translateY(15px)">');
    // The wrapper is an unclassed DIV (stable in SSR and post-hydration).
    await page.goto("/faq");
    const wrap = await page.evaluate(() => {
      const item = document.querySelector("div[class*='rounded-xl'][class*='bg-white/[0.02]']");
      const w = item?.parentElement;
      return w ? { tag: w.tagName, cls: w.getAttribute("class") } : null;
    });
    expect(wrap?.tag).toBe("DIV");
    expect(wrap?.cls).toBeNull();
    // The settled state — POLLED, never a fixed wait against a
    // transitioning property (the Session-11 R1 lesson).
    await page.evaluate(() => {
      const item = document.querySelector("div[class*='rounded-xl'][class*='bg-white/[0.02]']");
      item?.scrollIntoView({ block: "center" });
    });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document
              .querySelector("div[class*='rounded-xl'][class*='bg-white/[0.02]']")
              ?.parentElement?.getAttribute("style") || "NONE",
        ),
      )
      .toBe("opacity: 1; transform: none;");
  });

  test("the CTA animates ONLY the badge — the H2 carries no motion", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const h2 = [...document.querySelectorAll("h2")].find((h) => /stop managing/i.test(h.textContent || ""));
      h2?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 2000));
    });
    const state = await page.evaluate(() => {
      const h2 = [...document.querySelectorAll("h2")].find((h) => /stop managing/i.test(h.textContent || ""));
      const badge = h2?.parentElement?.querySelector("div[class*='rounded-full'][class*='border-violet']");
      return {
        h2Style: h2?.getAttribute("style") || null,
        badgeOwnStyle: badge?.getAttribute("style") || null,
        // the live's motion element is the badge's unclassed PARENT wrapper
        badgeWrapperStyle: badge?.parentElement?.getAttribute("style") || null,
      };
    });
    // the H2 carries only the --tw-leading pin (F4) — no motion state
    expect(state.h2Style).not.toContain("opacity");
    expect(state.h2Style).not.toContain("transform");
    expect(state.badgeOwnStyle).toBeNull();
    expect(state.badgeWrapperStyle).toBe("opacity: 1; transform: none;");
  });

  test("the logo-cloud wordmark container is NOT animated (the live's is static)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const cloud = [...document.querySelectorAll("div")].find(
        (d) => typeof d.className === "string" && d.className.includes("flex-wrap") && /Zphlix|Thrune/i.test(d.textContent || ""),
      );
      cloud?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 1500));
    });
    const style = await page.evaluate(() => {
      const cloud = [...document.querySelectorAll("div")].find(
        (d) => typeof d.className === "string" && d.className.includes("flex-wrap") && /Zphlix|Thrune/i.test(d.textContent || ""),
      );
      return cloud?.getAttribute("style") || null;
    });
    expect(style).toBeNull();
  });

  test("the One-Platform chips have no own motion (the showcase animates as ONE)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const chips = [...document.querySelectorAll("div")].filter(
        (d) => typeof d.className === "string" && d.className.includes("bg-violet/20"),
      );
      chips[0]?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 2200));
    });
    const state = await page.evaluate(() => {
      const chips = [...document.querySelectorAll("div")].filter(
        (d) => typeof d.className === "string" && d.className.includes("bg-violet/20"),
      );
      const showcase = chips[0]?.closest("div[class*='rounded-3xl']");
      return {
        chipStyles: chips.map((c) => c.getAttribute("style")),
        showcaseStyle: showcase?.getAttribute("style") || null,
      };
    });
    for (const s of state.chipStyles) expect(s).toBeNull();
    expect(state.showcaseStyle).toBe("opacity: 1; transform: none;");
  });
});

test.describe("token-level engine pins (Session-8 F2/F3)", () => {
  test("shadow-sm renders v3's value on the login Sign in button (not v4's bigger scale)", async ({ page }) => {
    await page.goto("/login");
    const shadow = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => /^sign in$/i.test(b.textContent.trim()));
      return btn ? getComputedStyle(btn).boxShadow : "NOT FOUND";
    });
    expect(shadow).toContain("rgba(0, 0, 0, 0.05) 0px 1px 2px");
    expect(shadow).not.toContain("0.1) 0px 1px 3px");
  });

  test("transition-colors emits the live's 6-property list", async ({ page }) => {
    await page.goto("/");
    const prop = await page.evaluate(() => {
      const link = [...document.querySelectorAll("footer a")].find(
        (a) => typeof a.className === "string" && a.className.includes("transition-colors"),
      );
      return link ? getComputedStyle(link).transitionProperty : "NOT FOUND";
    });
    expect(prop).toBe("color, background-color, border-color, text-decoration-color, fill, stroke");
  });
});

test.describe("the line-height cascade pins (Session-8 F4)", () => {
  test("hero subtitle: sm:text-base's 24px beats leading-relaxed (the v3 cascade)", async ({ page }) => {
    await page.goto("/");
    const lh = await page.evaluate(() => {
      const p = [...document.querySelectorAll("p")].find((el) => /automate your workflows/i.test(el.textContent || ""));
      return p ? getComputedStyle(p).lineHeight : "NOT FOUND";
    });
    expect(lh).toBe("24px");
  });

  test("features H3: md:text-4xl's 40px beats leading-tight", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const h3 = [...document.querySelectorAll("h3")].find((h) => /smart automation/i.test(h.textContent || ""));
      h3?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 600));
    });
    const lh = await page.evaluate(() => {
      const h3 = [...document.querySelectorAll("h3")].find((h) => /smart automation/i.test(h.textContent || ""));
      return h3 ? getComputedStyle(h3).lineHeight : "NOT FOUND";
    });
    expect(lh).toBe("40px");
  });

  test("CTA gradient span: md:text-6xl's 60px beats leading-tight", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const span = [...document.querySelectorAll("span")].find((s) => /start automating/i.test(s.textContent || ""));
      span?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 600));
    });
    const lh = await page.evaluate(() => {
      const span = [...document.querySelectorAll("span")].find((s) => /start automating/i.test(s.textContent || ""));
      return span ? getComputedStyle(span).lineHeight : "NOT FOUND";
    });
    expect(lh).toBe("60px");
  });

  test("static text+leading pairs are untouched (problem copy keeps leading-relaxed's 22.75px)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const p = [...document.querySelectorAll("p")].find((el) => /teams waste/i.test(el.textContent || ""));
      p?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 600));
    });
    const lh = await page.evaluate(() => {
      const p = [...document.querySelectorAll("p")].find((el) => /teams waste/i.test(el.textContent || ""));
      return p ? getComputedStyle(p).lineHeight : "NOT FOUND";
    });
    expect(lh).toBe("22.75px");
  });
});

test.describe("login focus chrome (Session-8 F5)", () => {
  test("the Sign in button's outline is NOT the SPA's violet (the login bundle ships no such rule)", async ({ page }) => {
    await page.goto("/login");
    const outline = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => /^sign in$/i.test(b.textContent.trim()));
      return btn ? getComputedStyle(btn).outlineColor : "NOT FOUND";
    });
    expect(outline).not.toBe("rgba(213, 0, 255, 0.5)");
  });

  test("the Sign in button carries the live's focus-visible:ring-ring class", async ({ page }) => {
    await page.goto("/login");
    const cls = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => /^sign in$/i.test(b.textContent.trim()));
      return btn?.getAttribute("class") || "NOT FOUND";
    });
    expect(cls).toContain("focus-visible:ring-ring");
  });

  test("the login route defines the live's --ring (240 10% 3.9%)", async ({ page }) => {
    await page.goto("/login");
    const ring = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--ring").trim());
    expect(ring).toBe("240 10% 3.9%");
  });

  test("the email input carries focus-visible:ring-ring too (class parity, inert under focus:ring-slate-400)", async ({ page }) => {
    await page.goto("/login");
    const cls = await page.evaluate(() =>
      document.querySelector("input[type='email']")?.getAttribute("class") || "NOT FOUND");
    expect(cls).toContain("focus-visible:ring-ring");
  });

  test("the Google icon wrapper (-ml-4) is a DIV (the live's tag, not a span)", async ({ page }) => {
    await page.goto("/login");
    const tag = await page.evaluate(() => {
      const el = document.querySelector("[class*='-ml-4']");
      return el ? el.tagName : "NOT FOUND";
    });
    expect(tag).toBe("DIV");
  });
});

test.describe("class-string cleanups (Session-8 F6/F7/F8)", () => {
  test("the FAQ chevron renders the live's muted-foreground gray (#a3a3a3)", async ({ page }) => {
    await page.goto("/faq");
    const state = await page.evaluate(() => {
      const chev = [...document.querySelectorAll("svg")].find((s) => (s.getAttribute("class") || "").includes("chevron-down"));
      return chev ? { cls: chev.getAttribute("class"), color: getComputedStyle(chev).color } : null;
    });
    expect(state?.cls).toContain("text-muted-foreground");
    expect(state?.color).toBe("rgb(163, 163, 163)");
  });

  test("the navbar logo anchor is bare 'flex items-center' (the invented chrome removed)", async ({ page }) => {
    await page.goto("/");
    const cls = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      const a = nav?.querySelector("a") || null;
      return a?.getAttribute("class") ?? "NOT FOUND";
    });
    expect(cls).toBe("flex items-center");
  });

  test("the Log In button's class string matches the live's verbatim", async ({ page }) => {
    await page.goto("/");
    const cls = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Log In");
      return btn?.getAttribute("class") ?? "NOT FOUND";
    });
    expect(cls).toBe(
      "px-5 py-2.5 text-white/80 hover:text-white transition-colors text-sm font-medium tracking-wide bg-transparent border-none cursor-pointer",
    );
  });

  test("the pricing CTAs match the live's per-plan disabled: utilities", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const card = [...document.querySelectorAll("div")].find(
        (d) => typeof d.className === "string" && d.className.includes("hover:border-white/10"),
      );
      card?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 800));
    });
    const ctas = await page.evaluate(() => {
      // all three plans' CTA buttons, in card order (free, pro, enterprise)
      const grab = (txt) => {
        const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes(txt));
        return btn?.getAttribute("class") ?? "NOT FOUND";
      };
      return { free: grab("Get Started Free"), pro: grab("Start Pro Trial"), ent: grab("Contact Sales") };
    });
    // Free + Pro carry the utilities; ONLY Enterprise omits them (the live's
    // per-plan truth, re-measured Session 8)
    expect(ctas.free).toContain("disabled:opacity-50 disabled:cursor-not-allowed");
    expect(ctas.pro).toContain("disabled:opacity-50 disabled:cursor-not-allowed");
    expect(ctas.ent).not.toContain("disabled:");
    // and the full Free string matches the live's verbatim
    expect(ctas.free).toBe(
      "w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 tracking-wide mb-8 group disabled:opacity-50 disabled:cursor-not-allowed border border-white/15 text-white/80 hover:bg-white/5 hover:text-white",
    );
  });

  test("the footer logo's petals carry the live's anim-flogo-* class names", async ({ page }) => {
    await page.goto("/");
    const petals = await page.evaluate(() => {
      const footer = document.querySelector("footer");
      const paths = footer ? [...footer.querySelectorAll("path")] : [];
      return paths.map((p) => p.getAttribute("class") || "").filter((c) => c.includes("anim-"));
    });
    expect(petals).toContain("anim-flogo-ns");
    expect(petals).toContain("anim-flogo-ew");
    expect(petals).toContain("anim-flogo-sn");
    expect(petals).toContain("anim-flogo-we");
  });
});
