import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 61 — THE THIRTY-SIXTH SURFACE: the pdftohtml -xml READING-ORDER
 * layer, measured at FULL PARITY on its first honest two-sided capture
 * (research/readingorder-s61.mjs, both sides fresh, identical inputs per
 * the pin-your-own-input law). NO src/ fix was required — this spec pins
 * the CLONE side of the measured parity so any drift in the clone's print
 * output surfaces at the gate.
 *
 * The three censuses per printed state (all EQUAL across sides at capture):
 *   (A) the per-word FONT census — every <text> element's fontspec
 *       (family|size|color) counted; the family's SUBSET PREFIX stripped
 *       (the AAAAAA+ bookkeeping is object numbering, not a value — the
 *       embedding layer itself is S49/D171's pdffonts census);
 *   (B) the READING-ORDER sequence — poppler's own layout ordering of the
 *       words (a SECOND engine's read of the text the S58/D198 line layer
 *       pinned through the qpdf token stream);
 *   (C) the COLUMN assignment — per 4pt line-bucket the sorted x-origins
 *       (measured EQUAL both sides on every route at capture; pinned here
 *       through the sequence's embedded left-origins).
 *
 * THE MEASURED PARITY (13 states): login 11v11 · typed 11v11 · reset 6v6
 * · signup 8v8 · error 12v12 · faq 33v33 · thank-you 3v3 · privacy 46v46
 * · terms 49v49 · accessibility 81v81 · refund-policy 44v44 · landing
 * 43v43 — every one EQUAL on all three censuses; the 404 7v7 with the
 * font census EQUAL and the order/column delta at exactly ONE word — the
 * REGISTERED 404 2-space-glyph emission family (S47/S58): the live's
 * engine emits a trailing space on "The page" the clone's does not,
 * shifting the next word's x-origin by 4pt. The clone-side shape is
 * pinned here (D217c) so the registered delta cannot silently change.
 *
 * THE LOGIN SYSTEM-STACK RECORD (S49/D171): /login prints in the sandbox's
 * DejaVu stack — the REGISTERED computed-family parity at the print layer;
 * the typed/error state deltas surface in this census as the #08080a
 * typed-text and #b91b1b error-message entries (the D217a constants).
 */

const pdfFile = (route: string) =>
  join(tmpdir(), `s61-pin${route.replace(/\//g, "_")}.pdf`);

const dwell = async (page: import("@playwright/test").Page, route: string) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
};

const renderPdf = async (page: import("@playwright/test").Page, route: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(route);
  writeFileSync(file, buf);
  return file;
};

interface Word {
  top: number;
  left: number;
  family: string;
  size: string;
  color: string;
  text: string;
}

/** The D217 instrument: pdftohtml -xml — the fontspec table resolved onto
 * every <text> element, the subset prefix stripped from the family, the
 * basic XML entities decoded (&#34; is the 404's quoted-route form). */
const parseReadingOrder = (file: string): Word[] => {
  const xml = execFileSync("pdftohtml", ["-xml", "-i", "-q", "-stdout", file], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const fonts = new Map<string, { size: string; family: string; color: string }>();
  for (const m of xml.matchAll(
    /<fontspec id="(\d+)" size="(\d+)" family="([^"]+)" color="([^"]+)"/g,
  )) {
    fonts.set(m[1]!, {
      size: m[2]!,
      family: m[3]!.replace(/^[A-Z]+\+/, ""),
      color: m[4]!,
    });
  }
  // decode via charCode constants -- the quote literals are mangling-prone
  // through tool write layers (the S61 in-flight catch)
  const DQ = String.fromCharCode(34); // &#34;
  const decode = (s: string) =>
    s.replace(/&#34;/g, DQ).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  const words: Word[] = [];
  for (const m of xml.matchAll(
    /<text top="(\d+)" left="(\d+)" width="(\d+)" height="(\d+)" font="(\d+)">([^<]*)<\/text>/g,
  )) {
    const f = fonts.get(m[5]!) ?? { size: "?", family: "?", color: "?" };
    words.push({
      top: +m[1]!,
      left: +m[2]!,
      family: f.family,
      size: f.size,
      color: f.color,
      text: decode(m[6]!),
    });
  }
  return words;
};

const fontCensus = (words: Word[]) => {
  const c = new Map<string, number>();
  for (const w of words) {
    const k = `${w.family}|${w.size}|${w.color}`;
    c.set(k, (c.get(k) ?? 0) + 1);
  }
  return Object.fromEntries([...c.entries()].sort());
};

const seq = (words: Word[]) =>
  words.map((w) => `${w.family}|${w.size}|${w.color}:${w.text}`).join(" ¬ ");

const PIN_EMAIL = "s52-pin@test.local";

const toLoginState = async (
  page: import("@playwright/test").Page,
  state: "default" | "typed" | "reset" | "signup" | "error",
) => {
  await dwell(page, "/login");
  if (state === "typed") {
    await page.fill('input[type="email"]', PIN_EMAIL);
    await page.waitForTimeout(300);
  } else if (state === "reset") {
    await page.click("text=Forgot password?");
    await page.waitForTimeout(500);
  } else if (state === "signup") {
    await page.click("text=Need an account?");
    await page.waitForTimeout(500);
  } else if (state === "error") {
    await page.fill('input[type="email"]', PIN_EMAIL);
    await page.fill('input[type="password"]', "wrong-password");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(800);
  }
};

// ---------- D217a: the login family's five-state censuses ----------

test("D217a the login family's reading-order censuses (5 states, the system-stack record)", async ({ page }) => {
  test.setTimeout(90_000);
  const EXPECT: Record<string, { words: number; fonts: Record<string, number> }> = {
    default: {
      words: 11,
      fonts: {
        "DejaVuSans|13|#64748b": 1, "DejaVuSans|16|#334154": 3,
        "DejaVuSans|16|#465469": 2, "DejaVuSans|16|#64748b": 2,
        "DejaVuSans|16|#ffffff": 1, "DejaVuSans|18|#334154": 1,
        "DejaVuSans|18|#64748b": 1,
      },
    },
    typed: {
      words: 11,
      fonts: {
        "DejaVuSans|13|#64748b": 1, "DejaVuSans|16|#08080a": 1,
        "DejaVuSans|16|#334154": 3, "DejaVuSans|16|#465469": 1,
        "DejaVuSans|16|#64748b": 2, "DejaVuSans|16|#ffffff": 1,
        "DejaVuSans|18|#334154": 1, "DejaVuSans|18|#64748b": 1,
      },
    },
    reset: {
      words: 6,
      fonts: {
        "DejaVuSans|16|#334154": 1, "DejaVuSans|16|#64748b": 1,
        "DejaVuSans|16|#94a2b8": 1, "DejaVuSans|16|#ffffff": 1,
        "DejaVuSans|18|#465469": 2,
      },
    },
    signup: {
      words: 8,
      fonts: {
        "DejaVuSans|16|#334154": 3, "DejaVuSans|16|#64748b": 1,
        "DejaVuSans|16|#94a2b8": 3, "DejaVuSans|16|#ffffff": 1,
      },
    },
    error: {
      words: 12,
      fonts: {
        "DejaVuSans|13|#64748b": 1, "DejaVuSans|16|#08080a": 2,
        "DejaVuSans|16|#334154": 3, "DejaVuSans|16|#64748b": 2,
        "DejaVuSans|16|#b91b1b": 1, "DejaVuSans|16|#ffffff": 1,
        "DejaVuSans|18|#334154": 1, "DejaVuSans|18|#64748b": 1,
      },
    },
  };
  for (const state of ["default", "typed", "reset", "signup", "error"] as const) {
    await toLoginState(page, state);
    const file = await renderPdf(page, `login-${state}`);
    const words = parseReadingOrder(file);
    expect(words.length, `${state} word count`).toBe(EXPECT[state]!.words);
    expect(fontCensus(words), `${state} font census`).toEqual(EXPECT[state]!.fonts);
  }
});

// ---------- D217b: the content routes' censuses ----------

test("D217b the content routes' reading-order censuses (the deterministic six)", async ({ page }) => {
  test.setTimeout(90_000);
  const EXPECT: Record<string, { words: number; fonts: Record<string, number> }> = {
    "/faq": {
      words: 33,
      fonts: {
        "VendSans-Light|11|#ffffff": 4, "VendSans-Light|13|#d400ff": 1,
        "VendSans-Light|13|#ffffff": 6, "VendSans-Light|15|#000000": 2,
        "VendSans-Light|15|#ffffff": 14, "VendSans-Light|18|#ffffff": 5,
        "VendSans-Light|20|#ffffff": 1,
      },
    },
    "/thank-you": {
      words: 3,
      fonts: { "VendSans-Light|15|#ffffff": 1, "VendSans-Light|20|#ffffff": 2 },
    },
    "/privacy": {
      words: 46,
      fonts: {
        "VendSans-Light|11|#ffffff": 4, "VendSans-Light|13|#ffffff": 6,
        "VendSans-Light|15|#000000": 1, "VendSans-Light|15|#ffffff": 15,
        "VendSans-Light|18|#ffffff": 18, "VendSans-Light|27|#ffffff": 2,
      },
    },
    "/terms": {
      words: 49,
      fonts: {
        "VendSans-Light|11|#ffffff": 2, "VendSans-Light|13|#ffffff": 6,
        "VendSans-Light|15|#000000": 2, "VendSans-Light|15|#ffffff": 16,
        "VendSans-Light|18|#ffffff": 21, "VendSans-Light|21|#ffffff": 2,
      },
    },
    "/accessibility": {
      words: 81,
      fonts: {
        "VendSans-Light|11|#ffffff": 4, "VendSans-Light|13|#ffffff": 6,
        "VendSans-Light|15|#000000": 3, "VendSans-Light|15|#ffffff": 20,
        "VendSans-Light|18|#ffffff": 40, "VendSans-Light|27|#ffffff": 8,
      },
    },
    "/refund-policy": {
      words: 44,
      fonts: {
        "VendSans-Light|11|#ffffff": 4, "VendSans-Light|13|#ffffff": 6,
        "VendSans-Light|15|#000000": 2, "VendSans-Light|15|#ffffff": 15,
        "VendSans-Light|18|#ffffff": 15, "VendSans-Light|27|#ffffff": 2,
      },
    },
  };
  for (const [route, expected] of Object.entries(EXPECT)) {
    await dwell(page, route);
    const file = await renderPdf(page, route);
    const words = parseReadingOrder(file);
    expect(words.length, `${route} word count`).toBe(expected.words);
    expect(fontCensus(words), `${route} font census`).toEqual(expected.fonts);
  }
});

// ---------- D217c: the 404 — the census + the REGISTERED space-glyph guard ----------

test("D217c the 404's census + the registered trailing-space clone-side shape", async ({ page }) => {
  await dwell(page, "/session61-bogus-404");
  const file = await renderPdf(page, "s61-404");
  const words = parseReadingOrder(file);
  expect(words.length).toBe(7);
  expect(fontCensus(words)).toEqual({
    "VendSans-Light|11|#334154": 1, "VendSans-Light|18|#334154": 1,
    "VendSans-Light|18|#465469": 3, "VendSans-Light|26|#1d293b": 1,
    "VendSans-Light|59|#cbd5e1": 1,
  });
  // the REGISTERED 2-space-glyph family (S47/S58): the CLONE's third word
  // carries NO trailing space (the LIVE's engine emits one), and the next
  // word's x-origin sits 4pt right of the live's — both sides' shapes are
  // pinned by this guard (the clone side) at the registered values.
  expect(words[2]!.text).toBe("The page");
  expect(words[2]!.left).toBe(209);
  expect(words[3]!.text).toBe('"session61-bogus-404"');
  expect(words[4]!.text).toBe("could not be found in this");
  expect(words[4]!.left).toBe(481);
});

// ---------- D217d: the landing's census (the animation-band dwell contract) ----------

test("D217d the landing's reading-order census (43 words at the 800ms dwell)", async ({ page }) => {
  await dwell(page, "/");
  const file = await renderPdf(page, "landing");
  const words = parseReadingOrder(file);
  expect(words.length).toBe(43);
  expect(fontCensus(words)).toEqual({
    "VendSans-Light|11|#ffffff": 4, "VendSans-Light|13|#374150": 4,
    "VendSans-Light|13|#4a5462": 1, "VendSans-Light|13|#d400ff": 1,
    "VendSans-Light|13|#ffffff": 7, "VendSans-Light|15|#111726": 2,
    "VendSans-Light|15|#374150": 2, "VendSans-Light|15|#ffffff": 11,
    "VendSans-Light|16|#000000": 1, "VendSans-Light|16|#4a5462": 2,
    "VendSans-Light|18|#374150": 3, "VendSans-Light|18|#ffffff": 1,
    "VendSans-Light|20|#ffffff": 4,
  });
});

// ---------- D217e: the reading-order SEQUENCE pins (poppler's own ordering) ----------

test("D217e the faq's full reading-order sequence (poppler's layout ordering)", async ({ page }) => {
  await dwell(page, "/faq");
  const words = parseReadingOrder(await renderPdf(page, "faq-seq"));
  expect(seq(words)).toBe([
    "VendSans-Light|15|#ffffff:Automate your workflows with intelligent AI.",
    "VendSans-Light|11|#ffffff:PRODUCT",
    "VendSans-Light|15|#ffffff:Features",
    "VendSans-Light|15|#ffffff:Pricing",
    "VendSans-Light|11|#ffffff:LEGAL",
    "VendSans-Light|11|#ffffff:SOCIAL",
    "VendSans-Light|11|#ffffff:SUBSCRIBE",
    "VendSans-Light|13|#ffffff:Get the latest",
    "VendSans-Light|13|#ffffff:updates",
    "VendSans-Light|13|#ffffff:delivered to",
    "VendSans-Light|13|#ffffff:your inbox.",
    "VendSans-Light|13|#ffffff:your@email.c",
    "VendSans-Light|13|#d400ff:FA Q",
    "VendSans-Light|20|#ffffff:Everything you need to know about getting started with NovaAI.",
    "VendSans-Light|18|#ffffff:Is my data secure with NovaAI?",
    "VendSans-Light|18|#ffffff:What integrations do you support?",
    "VendSans-Light|18|#ffffff:Can I cancel my subscription anytime?",
    "VendSans-Light|18|#ffffff:How long does setup take?",
    "VendSans-Light|18|#ffffff:Do I need technical skills to use NovaAI?",
    "VendSans-Light|15|#ffffff:Features",
    "VendSans-Light|15|#ffffff:How",
    "VendSans-Light|15|#ffffff:It",
    "VendSans-Light|15|#ffffff:Works",
    "VendSans-Light|15|#ffffff:Pricing",
    "VendSans-Light|15|#ffffff:Testimonials",
    "VendSans-Light|15|#000000:Get Started",
    "VendSans-Light|13|#ffffff:© 2026 NovaaAI. Built on Base44.",
    "VendSans-Light|15|#ffffff:Features",
    "VendSans-Light|15|#ffffff:How",
    "VendSans-Light|15|#ffffff:It",
    "VendSans-Light|15|#ffffff:Works",
    "VendSans-Light|15|#ffffff:Pricing",
    "VendSans-Light|15|#000000:Get Started",
  ].join(" ¬ "));
});

test("D217f the login-typed sequence (the interpolation-input law at the reading-order layer)", async ({ page }) => {
  await toLoginState(page, "typed");
  const words = parseReadingOrder(await renderPdf(page, "login-typed-seq"));
  expect(seq(words)).toBe([
    "DejaVuSans|18|#64748b:Sign in to continue",
    "DejaVuSans|18|#334154:Continue with Google",
    "DejaVuSans|16|#334154:Email",
    "DejaVuSans|16|#334154:Password",
    "DejaVuSans|16|#ffffff:Sign in",
    "DejaVuSans|16|#64748b:Forgot password?",
    "DejaVuSans|16|#64748b:Need an account? ",
    "DejaVuSans|16|#334154:Sign up",
    "DejaVuSans|13|#64748b:OR",
    `DejaVuSans|16|#08080a:${PIN_EMAIL}`,
    "DejaVuSans|16|#465469:••••••••",
  ].join(" ¬ "));
});
