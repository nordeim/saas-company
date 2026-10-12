import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 47 — the TWENTY-SECOND SURFACE (the print-to-PDF text layer,
 * D163) + THE ENTRANCE BUILD it exposed (the logo-cloud wordmark
 * entrances D164 + the CTA whole-block entrance D165) + the forced-colors
 * empty-set (D162) + the focus-visible ring parity (D161) + the
 * twenty-first surface's ROUTE EXTENSIONS (the offline render on the
 * content routes + the clipboard census on /login and /demo — D166).
 *
 * THE MEASUREMENTS (research/recon-s47.mjs + adj-s47a–h, paired
 * clone-vs-live):
 *
 * THE PRINT-TO-PDF TEXT LAYER (D163) — exact parity. With pdftotext (the
 * naive stream regex is blind to Chromium's CID-subset encodings): the
 * four content routes at EXACT word parity (/login 26 = 26, /faq 104 =
 * 104, /privacy 344 = 344, /thank-you 36 = 36) and the landing at
 * 251 = 251 AFTER the entrance build (pre-build the clone read 291 — the
 * 40-token delta was the un-revealed entrance set: the live's below-fold
 * framer elements stay opacity-0 at print time and vanish from its PDF;
 * the clone's static wordmarks + static CTA were the only tokens it
 * painted that the live did not).
 *
 * THE LOGO-CLOUD WORDMARK ENTRANCES (D164) — the clone gap CLOSED. The
 * live wraps EACH of the 8 wordmark carriers (`div.text-white/60
 * hover:text-white/90 …`) as a framer motion element with initial
 * `opacity: 0` — an OPACITY-ONLY fade (no transform at any phase),
 * per-element reveals with a ~50ms stagger (measured starts 490→890ms)
 * and ~400ms durations. The settled residue is exactly `opacity: 1`
 * (no `transform: none` write). The CONTAINER stays static (the S8
 * F1-EXTRA container record still true).
 *
 * THE CTA WHOLE-BLOCK ENTRANCE (D165) — the clone gap CLOSED. The live
 * wraps the ENTIRE CTA content (the badge pill + the h2 + the copy + the
 * pills) in ONE unclassed motion div with initial `opacity: 0; transform:
 * translateY(30px)`, ~800ms easeOut. The S8 badge-only record described
 * an earlier live deployment (gotcha 7 — the moving-target law).
 *
 * THE FORCED-COLORS EMPTY-SET (D162) — parity. Zero forced-color-adjust
 * rules in any stylesheet on either side; the browser's own
 * system-color substitution is the whole contract (the h1 flips to
 * rgb(0, 0, 0) with a transparent background identically); the document
 * height is STABLE under emulation (no reflow on either side).
 *
 * THE FOCUS-VISIBLE RING (D161) — rendered parity (pinned by the
 * interaction suite's standing columns; this spec records the surface's
 * rule census: the clone ships no top-level :focus/:focus-visible rules —
 * its ring rides the UA default with the S5 outline-color pin).
 *
 * THE OFFLINE ROUTE EXTENSION (D166) — the D159 superset extended to the
 * content routes: the clone renders /faq 87 words (the full FAQ copy —
 * the 87-vs-101 styled delta is the CSS-abort CONCATENATION artifact:
 * the aborted stylesheet leaves nav links and footer columns unstyled and
 * adjacent inline elements merge in innerText; the words are all
 * present), /privacy 321, /login 23 + the h1 — where the live renders its
 * 127/127/137-word SPA shells. The CLIPBOARD census on /login + /demo:
 * oncopy/oncut/onpaste null, user-select auto, zero .select-none
 * carriers — both sides, both routes.
 */

const pdfText = async (page: import("@playwright/test").Page, route: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = join(tmpdir(), `s47-pin${route.replace(/\//g, "_")}.pdf`);
  writeFileSync(file, buf);
  const text = execFileSync("pdftotext", [file, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    words: text.trim().split(/\s+/).filter(Boolean).length,
    hasWordmarks: /BRANT|Thrune|Zphlix|Melpyx/i.test(text),
    hasStop: /Stop Managing/i.test(text),
    bytes: buf.length,
  };
};

test.describe("the logo-cloud wordmark entrances (Session 47 — D164)", () => {
  test("the 8 carriers ride opacity-ONLY motion at rest (no transform key) + the container stays static", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const cloud = await page.evaluate(() => {
      const sections = [...document.querySelectorAll("section")];
      const cloudEl = sections.find((s) => /BRANT|Zphlix|Melpyx/i.test(s.textContent ?? ""));
      if (!cloudEl) return null;
      const container = [...cloudEl.querySelectorAll("div")].find((d) =>
        typeof d.className === "string" && d.className.includes("flex-wrap")
      );
      const carriers = [...cloudEl.querySelectorAll("div")].filter((d) => {
        const st = d.getAttribute("style") ?? "";
        return /opacity/.test(st) || /transform/.test(st);
      });
      return {
        containerStyle: container?.getAttribute("style") ?? null,
        carriers: carriers.map((d) => ({
          style: d.getAttribute("style") ?? "",
          text: (d.textContent ?? "").trim().slice(0, 12),
        })),
      };
    });
    expect(cloud).not.toBeNull();
    // the container carries NO motion (the S8 F1-EXTRA record)
    expect(cloud!.containerStyle).toBeNull();
    // 9 motion carriers: the eyebrow (y=20) + the 8 wordmark carriers
    expect(cloud!.carriers.length).toBe(9);
    const [eyebrow, ...wordmarks] = cloud!.carriers;
    expect(eyebrow.style).toContain("opacity");
    expect(eyebrow.style).toContain("transform"); // the eyebrow keeps its y=20 travel
    // the wordmarks: opacity-ONLY — the transform key is absent at rest
    for (const w of wordmarks) {
      expect(w.style, `${w.text} must carry opacity`).toContain("opacity");
      expect(w.style, `${w.text} must carry NO transform (the live's opacity-only family)`).not.toContain("transform");
    }
  });

  test("the carriers settle to the live's exact residue (opacity: 1, no transform write for the wordmarks)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const sections = [...document.querySelectorAll("section")];
      const cloud = sections.find((s) => /BRANT|Zphlix|Melpyx/i.test(s.textContent ?? ""));
      cloud?.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(2200);
    const settled = await page.evaluate(() => {
      const sections = [...document.querySelectorAll("section")];
      const cloud = sections.find((s) => /BRANT|Zphlix|Melpyx/i.test(s.textContent ?? ""));
      if (!cloud) return null;
      const carriers = [...cloud.querySelectorAll("div")].filter((d) => {
        const st = d.getAttribute("style") ?? "";
        return /opacity/.test(st) || /transform/.test(st);
      });
      return carriers.map((d) => d.getAttribute("style") ?? "");
    });
    expect(settled).not.toBeNull();
    expect(settled!.length).toBe(9);
    // the eyebrow settles with the full framer residue
    expect(settled![0]).toBe("opacity: 1; transform: none;");
    // the wordmarks settle opacity-ONLY — the live's exact write
    // (the browser serializes the imperative style with the trailing
    // semicolon — the live's settled carriers read `opacity: 1;` byte-
    // identically, probe G)
    for (const style of settled!.slice(1)) {
      expect(style).toBe("opacity: 1;");
    }
  });
});

test.describe("the CTA whole-block entrance (Session 47 — D165)", () => {
  test("ONE wrapper carries badge + h2 + copy + pills, starting at y=30", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const cta = await page.evaluate(() => {
      const h2 = [...document.querySelectorAll("h2")].find((h) => /Stop Managing/i.test(h.textContent ?? ""));
      if (!h2) return null;
      const wrapper = h2.parentElement;
      return {
        wrapperStyle: wrapper?.getAttribute("style") ?? null,
        children: wrapper?.children.length ?? 0,
        carriesBadge: !!wrapper?.querySelector("div[class*='rounded-full'][class*='border-violet']"),
        carriesPill: !!wrapper?.querySelector("a[href='#pricing']"),
        carriesCopy: /competitors are already automating/i.test(wrapper?.textContent ?? ""),
        h2OwnStyle: h2.getAttribute("style") ?? null,
      };
    });
    expect(cta).not.toBeNull();
    // the whole-block wrapper starts at the live's exact initial state
    expect(cta!.wrapperStyle).toContain("opacity");
    expect(cta!.wrapperStyle).toContain("translateY(30px)");
    expect(cta!.children).toBe(4);
    expect(cta!.carriesBadge).toBe(true);
    expect(cta!.carriesPill).toBe(true);
    expect(cta!.carriesCopy).toBe(true);
    // the h2 itself keeps only the --tw-leading pin — no motion of its own
    expect(cta!.h2OwnStyle).not.toContain("opacity");
    expect(cta!.h2OwnStyle).not.toContain("transform");
  });

  test("the wrapper settles to the live's framer residue", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const h2 = [...document.querySelectorAll("h2")].find((h) => /Stop Managing/i.test(h.textContent ?? ""));
      h2?.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(2200);
    const style = await page.evaluate(() => {
      const h2 = [...document.querySelectorAll("h2")].find((h) => /Stop Managing/i.test(h.textContent ?? ""));
      return h2?.parentElement?.getAttribute("style") ?? null;
    });
    expect(style).toBe("opacity: 1; transform: none;");
  });
});

test.describe("the print-to-PDF text layer (Session 47 — D163, the twenty-second surface)", () => {
  test("the content routes' PDF text at the measured parity (26/104/344/36)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const anchors: Record<string, number> = {
      "/login": 26,
      "/faq": 104,
      "/privacy": 344,
      "/thank-you": 36,
    };
    for (const [route, expected] of Object.entries(anchors)) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const pdf = await pdfText(page, route);
      expect(pdf.words, `PDF text words on ${route}`).toBe(expected);
    }
  });

  test("the landing's PDF text CONVERGED to the live's 251 (the un-revealed entrance set unpainted)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const pdf = await pdfText(page, "/");
    // Pre-build the clone read 291 (the static wordmarks + static CTA
    // painted below fold); the live read 251. Post-build both read 251 —
    // the parity-convergence the entrance build predicted, measured.
    expect(pdf.words).toBe(251);
    // the below-fold un-revealed content is UNPAINTED — exactly the
    // live's own print output (never fix toward painting it back)
    expect(pdf.hasWordmarks).toBe(false);
    expect(pdf.hasStop).toBe(false);
  });
});

test.describe("the forced-colors empty-set (Session 47 — D162)", () => {
  test("zero forced-color-adjust rules + the geometry stays stable under emulation", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const forced = await page.evaluate(() => {
      let forcedRules = 0;
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            const t = rule.cssText ?? "";
            if (/forced-color-adjust/i.test(t)) forcedRules += 1;
            if (rule instanceof CSSMediaRule && /forced-colors/i.test(rule.conditionText ?? "")) {
              forcedRules += [...rule.cssRules].filter((r) => /forced-color-adjust/i.test(r.cssText ?? "")).length;
            }
          }
        } catch {
          /* cross-origin sheet */
        }
      }
      const h1 = document.querySelector("h1");
      return {
        forcedRules,
        docHeight: Math.round(document.documentElement.scrollHeight),
        // the browser's own substitution: the h1 flips to the system
        // canvas text color with a transparent background — the live's
        // identical behavior (measured rgb(0, 0, 0) both sides)
        h1Color: h1 ? getComputedStyle(h1).color : null,
        h1Bg: h1 ? getComputedStyle(h1).backgroundColor : null,
      };
    });
    await page.emulateMedia({ forcedColors: "none" });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const normal = await page.evaluate(() => ({
      docHeight: Math.round(document.documentElement.scrollHeight),
      h1Color: getComputedStyle(document.querySelector("h1")!).color,
    }));
    // the empty-set: neither side ships forced-colors rules
    expect(forced.forcedRules).toBe(0);
    // the geometry is STABLE under emulation (no reflow — the live's
    // identical stability measured 7318 -> 7318)
    expect(Math.abs(forced.docHeight - normal.docHeight)).toBeLessThanOrEqual(2);
    // the substitution flip happened (the system color, not the authored
    // white) and the background stayed TRANSPARENT through the flip (the
    // measured `rgba(255, 255, 255, 0)` — transparent white — the live's
    // identical reading, probe B1)
    expect(forced.h1Color).not.toBe(normal.h1Color);
    expect(forced.h1Bg).toBe("rgba(255, 255, 255, 0)");
  });
});

test.describe("the twenty-first surface's route extensions (Session 47 — D166)", () => {
  test("the offline render on the content routes: the full SSR copy where the live renders its SPA shells", async ({ page }) => {
    await page.route("**/*", (route) => {
      if (route.request().resourceType() === "document") return route.continue();
      return route.abort();
    });
    const floors: Record<string, { words: number; hasH1: boolean }> = {
      "/faq": { words: 80, hasH1: false }, // /faq's heading is an h2 (the measured DOM)
      "/privacy": { words: 300, hasH1: true },
      "/login": { words: 20, hasH1: true },
    };
    for (const [route, floor] of Object.entries(floors)) {
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(1200);
      const r = await page.evaluate(() => ({
        words: (document.body.innerText || "").trim().split(/\s+/).filter(Boolean).length,
        hasH1: !!document.querySelector("h1"),
      }));
      // the /faq floor absorbs the CSS-abort CONCATENATION artifact
      // (measured 87 offline vs 101 styled — the aborted stylesheet
      // merges adjacent inline elements in innerText; the words are all
      // present, adjudicated probe A)
      expect(r.words, `offline words on ${route}`).toBeGreaterThanOrEqual(floor.words);
      expect(r.hasH1, `offline h1 on ${route}`).toBe(floor.hasH1);
    }
    await page.unrouteAll();
  });

  test("the clipboard census on /login + /demo (the D157 family extended)", async ({ page }) => {
    for (const route of ["/login", "/demo"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const r = await page.evaluate(() => ({
        oncopy: document.oncopy === null,
        oncut: document.oncut === null,
        onpaste: document.onpaste === null,
        userSelect: getComputedStyle(document.body).userSelect,
        selectNoneCarriers: document.querySelectorAll(".select-none").length,
      }));
      expect(r.oncopy, `oncopy null on ${route}`).toBe(true);
      expect(r.oncut, `oncut null on ${route}`).toBe(true);
      expect(r.onpaste, `onpaste null on ${route}`).toBe(true);
      expect(r.userSelect, `user-select auto on ${route}`).toBe("auto");
      expect(r.selectNoneCarriers, `zero .select-none carriers on ${route}`).toBe(0);
    }
  });
});
