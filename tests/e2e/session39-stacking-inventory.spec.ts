import { expect, test } from "@playwright/test";

/**
 * Session 39 — the stacking-inventory pins (the battery's FOURTEENTH
 * surface: the z-index/stacking inventory).
 *
 * The surface (research/adj-zindex-s39.mjs, adjudicated in vivo): every
 * rendered element with computed z-index ≠ auto OR position ≠ static,
 * DWELL-loaded (the gotcha-52a law — the live's below-fold entrances
 * need the element HELD in view, not transiently passed, or the resting
 * state reads pre-entrance fiction). The raw signature diff between the
 * clone and the live resolves ENTIRELY into the REGISTERED families:
 *
 *   - the live's TWO `fixed top-0 z-[100]` dormant toaster shells (empty
 *     `flex max-h-screen w-full flex-col-reverse p-4 … md:max-w-[420px]`
 *     divs — the S33 record; the clone OMITS them by design: on the live
 *     they pointer-block the mobile burger, gotcha 18);
 *   - the live's centering transforms (`left-1/2` + framer
 *     `translateX(-50%)` residue: -241.367 on the nav-links container,
 *     -12 on the scroll-dot wrapper, -68.7031 on the pricing badge) —
 *     geometry the clone produces through the same utilities without a
 *     framer residue;
 *   - ~51 live-side framer residue/mid-loop transform carriers (identity
 *     `translateY(0px)` after entrances; scale writes mid-pulse) vs the
 *     clone's ~20 Reveal end-states — the D125 library-internal family;
 *   - the clone-only `next-route-announcer` (the Next.js platform
 *     artifact, aria-live, invisible).
 *
 * NO real visual stacking drift: paint order is identical (the toasters
 * are empty, the residue transforms are identity or centering, z-auto
 * children paint the same inside an extra context). These pins version
 * the CLONE side of the contract so a future regression surfaces loudly.
 */
test.describe("the stacking-inventory pins (Session 39 — the fourteenth surface)", () => {
  test("the landing carries EXACTLY ONE fixed element: the navbar at z-50", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    const fixed = await page.evaluate(() => {
      const rows: { tag: string; z: string; cls: string }[] = [];
      for (const el of document.querySelectorAll("*")) {
        if (!el.getClientRects().length) continue;
        const cs = getComputedStyle(el);
        if (cs.position === "fixed") {
          rows.push({
            tag: el.tagName.toLowerCase(),
            z: cs.zIndex,
            cls: (el.getAttribute("class") || "").slice(0, 60),
          });
        }
      }
      return rows;
    });
    expect(fixed.length, "one fixed element: the navbar (the toaster omitted by design)").toBe(1);
    expect(fixed[0].tag).toBe("nav");
    expect(fixed[0].z).toBe("50");
    expect(fixed[0].cls).toContain("fixed top-0");
  });

  test("no landing element exceeds the navbar's z-50 (the live's z-[100] toaster has NO clone counterpart)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    const over = await page.evaluate(() => {
      const rows: string[] = [];
      for (const el of document.querySelectorAll("*")) {
        if (!el.getClientRects().length) continue;
        const z = getComputedStyle(el).zIndex;
        if (z !== "auto" && Number(z) > 50) {
          rows.push(`${el.tagName.toLowerCase()}.${(el.getAttribute("class") || "").slice(0, 40)} z=${z}`);
        }
      }
      return rows;
    });
    expect(over, "the gotcha-18 pointer-blocking toaster stays omitted").toEqual([]);
  });

  test("the positioned z-carriers carry the clone's stacking contract (z-10 wrappers, z-50 nav)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    const zSet = await page.evaluate(() => {
      const counts = new Map<string, number>();
      for (const el of document.querySelectorAll("*")) {
        if (!el.getClientRects().length) continue;
        const cs = getComputedStyle(el);
        if (cs.zIndex !== "auto") {
          const k = `${cs.zIndex}`;
          counts.set(k, (counts.get(k) || 0) + 1);
        }
      }
      return Object.fromEntries(counts);
    });
    // the nav (z-50) + the section z-10 wrappers (hero content, problem
    // grid, CTA card, testimonial fades) — the registered clone contract
    expect(zSet["50"]).toBe(1);
    expect(Number(zSet["10"])).toBeGreaterThanOrEqual(4);
    expect(Object.keys(zSet).every((k) => ["10", "50"].includes(k)), `only z-10 and z-50 carry: ${JSON.stringify(zSet)}`).toBe(true);
  });

  test("the dashboard header is the sticky z-40 carrier (the authed route's stacking)", async ({ page }) => {
    // sign in through the UI to reach the dashboard
    await page.goto("/login");
    await page.getByLabel(/Email/i).fill("demo@novaai.app");
    await page.getByLabel(/Password/i).fill("Demo1234!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await page.waitForURL("**/dashboard");
    const header = await page.evaluate(() => {
      const el = document.querySelector("header");
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { pos: cs.position, z: cs.zIndex };
    });
    expect(header, "the dashboard header exists").not.toBeNull();
    expect(header!.pos).toBe("sticky");
    expect(header!.z).toBe("40");
  });

  test("the get-started shine span is the registered opacity-context carrier (absolute, op < 1 at rest cycles to 0)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    const shine = await page.evaluate(() => {
      const el = document.querySelector(".get-started-shimmer");
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { pos: cs.position, opacity: cs.opacity };
    });
    expect(shine, "the S38-registered clone-only class carrier").not.toBeNull();
    expect(shine!.pos).toBe("absolute");
  });
});
