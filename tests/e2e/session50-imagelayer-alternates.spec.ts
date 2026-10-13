import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 50 — THE TWENTY-FIFTH SURFACE (the PDF XObject/IMAGE layer,
 * D174) + the 24th surface's ROUTE EXTENSIONS (the /login alternates'
 * print story, D175).
 *
 * THE MEASUREMENTS (research/recon-s50.mjs + research/stability-s50.mjs,
 * paired clone-vs-live through the SAME local Chromium — never stale PDFs
 * across instrument versions):
 *
 * THE IMAGE LAYER (D174) — AT FULL PARITY ON ITS FIRST HONEST
 * MEASUREMENT (the S45/S48/S49 registration pattern: pin, no build). The
 * instrument: poppler's pdfimages -list. THE RASTERIZATION LAW (the
 * surface's mechanism, VLM-attributed): Chromium's print pipeline embeds
 * as image XObjects exactly the content it cannot express vectorially —
 * VIDEO frames, GRADIENT TEXT (background-clip: text), gradient-bordered
 * / alpha-composited PILLS, and blurred GLOWS/shadows — while regular
 * text (the font layer, D171), SVG icons, and CSS shapes stay vector.
 * Both sides produce the IDENTICAL structural census because the clone
 * reproduces the same effects at the same geometry.
 *
 * THE PARSER LEADING-SPACE LAW (learned in flight — the lesson-88
 * empty-census family's third sighting): pdfimages -list's data rows are
 * right-aligned with LEADING SPACES — a `!line.startsWith(" ")` filter
 * silently returns an EMPTY census (the first recon parse did exactly
 * that, reporting zero images on every route), and an empty-equals-empty
 * comparison reads as false PARITY. The honest parse: drop the header
 * (`page num type …`) and the dashed rule, keep every other line, split
 * on whitespace runs. Validate every tabular parser against the
 * instrument's RAW output before trusting an empty reading.
 *
 * THE NORMALIZATION CONTRACT: the census key is
 * `page:type:WxH:color/comp/bpc:enc:interp:ppi`, SORTED — the emission
 * ORDER is a per-render object-allocation artifact that differs between
 * sides with identical content; the object/ID columns and the size/ratio
 * columns are normalized OUT (the video frame's byte size is
 * decode-timestamp-dependent; the clone's 1080K vs the live's 1057K is
 * the same raster at different frames).
 *
 * THE MEASURED RECORDS:
 *   /     13 image XObjects: the hero VIDEO frame (1920x1080 icc 92ppi),
 *         the H1 GRADIENT-TEXT raster (2025x534 rgb + smask), the CTA
 *         pill PAIR (1047x105 rgb + smask x2), the badge pill (1165x103
 *         rgb + smask), the blurred glows (626x204 + 710x288 gray jpeg
 *         on p1; 541x160 + 625x245 gray jpeg on p4).
 *   /login 6: the card's chrome rasters (1168x168, 1765x2696, 329x329,
 *         413x413 gray jpeg + 754x676 rgb + smask).
 *   EVERY OTHER ROUTE the EMPTY SET on both sides (/faq /privacy /terms
 *   /refund-policy /accessibility /thank-you /demo + the 404 — zero
 *   image XObjects: their graphics are CSS/SVG vectors, kept vector at
 *   print). STABILITY PROVEN: the census keys identical across fresh
 *   re-renders (13/6/0 on the probed routes).
 *
 * THE /LOGIN ALTERNATES (D175) — the 24th surface's route extensions.
 * The sign-up and forgot states (entered by the real button clicks, the
 * Session-5 measured states) rendered to PDF paired clone-vs-live, all
 * at parity: the FONT census DejaVuSans 2x + DejaVuSans-Bold 1x CID
 * TrueType/Identity-H (the SAME system-stack census as the default
 * state); the METADATA identical (Title "SAAS Company", Pages 1, the
 * standard family — dates + file size normalized by construction); the
 * LINK censuses both EMPTY SETS (the alternates carry buttons, not
 * anchors — the D169 law extended to the states); the PRINT TEXT exact
 * (sign-up 19 = 19, forgot 25 = 25 words); the IMAGE censuses 2 + 2
 * byte-identical across sides — with the STATE-TRACKED RASTER record:
 * the tall card-background raster re-rasterizes per state at the card's
 * rendered height (1765x2696 default / 1765x1833 sign-up / 1765x1533
 * forgot; the wide title-area raster 1168x168 default / 1168x156 in
 * both alternates).
 */

const pdfFile = (name: string) => join(tmpdir(), `s50-pin-${name}.pdf`);

const dwell = async (page: import("@playwright/test").Page, route: string) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
};

const renderPdf = async (page: import("@playwright/test").Page, name: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(name);
  writeFileSync(file, buf);
  return file;
};

/**
 * Raw parsed rows (all 16 columns) — the leading-space law honored.
 * THE ANIMATED-GLOW JITTER LAW: the pulsing hero glow's rasterized
 * height carries ±1px frame-dependence (the live measured 710x288 and
 * 710x289 across renders — the mid-animation scale at print time rounds
 * the raster box either way). The STATIC rasters are layout-derived and
 * deterministic (the video frame = the source video's own dimensions;
 * the gradient text, the CTA/badge pills, the stable glows = fixed
 * layout boxes). The jitter bucket normalizes ONLY the known-jittery
 * glow (the S38 loop-value range law at the raster layer).
 */
const imageRows = (file: string) => {
  const out = execFileSync("pdfimages", ["-list", file], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^page\s+num\s+type/.test(l) && !/^-{10,}$/.test(l))
    .map((l) => l.split(/\s+/))
    .filter((cols) => cols.length >= 16);
};

/** The ±1px jitter bucket for the animated glow (288 <-> 289). */
const jitterBucket = (key: string) =>
  key.replace(/^1:image:710x28[89]:gray/, "1:image:710x28*:gray");

/**
 * The D174 instrument: the SORTED structural census. The emission order
 * (object allocation) differs between renders with identical content;
 * the object/ID + size/ratio columns are content-derived — both are
 * normalized OUT of the key. `exact` keeps the raw dimensions (the
 * static-set pins); the jitter bucket folds the animated glow's ±1px.
 */
const imageKey = (file: string, exact = true) =>
  imageRows(file)
    .map((c) => {
      const key = `${c[0]}:${c[2]}:${c[3]}x${c[4]}:${c[5]}/${c[6]}c/${c[7]}bpc:${c[8]}:${c[9]}:${c[12]}ppi`;
      return exact ? key : jitterBucket(key);
    })
    .sort();

/** The D175 instruments (the S49 parsers, unchanged). */
const fontCensus = (file: string) => {
  const out = execFileSync("pdffonts", [file], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const lines = out.split("\n").slice(2).filter((l) => l.trim());
  const census: Record<string, { count: number; types: Record<string, number>; encodings: Record<string, number> }> = {};
  for (const line of lines) {
    const cols = line.trim().split(/\s{2,}/);
    if (cols.length < 6) continue;
    const [name, type, encoding] = cols;
    const family = name.replace(/^[A-Z]{6}\+/, "");
    const e = (census[family] ??= { count: 0, types: {}, encodings: {} });
    e.count += 1;
    e.types[type] = (e.types[type] ?? 0) + 1;
    e.encodings[encoding] = (e.encodings[encoding] ?? 0) + 1;
  }
  return census;
};

const metaCensus = (file: string) => {
  const out = execFileSync("pdfinfo", [file], { encoding: "utf8", maxBuffer: 1024 * 1024 });
  const meta: Record<string, string> = {};
  for (const line of out.split("\n")) {
    const m = line.match(/^([A-Za-z ]+):\s+(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    if (key === "CreationDate" || key === "ModDate" || key === "File size") continue;
    meta[key] = m[2].trim();
  }
  return meta;
};

const linkCensus = (file: string) => {
  const xml = execFileSync("pdftohtml", ["-xml", "-stdout", file], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const census: Record<string, number> = {};
  for (const m of xml.matchAll(/<a href="([^"]*)"/g)) {
    let href = m[1];
    if (href.includes("#")) {
      href = "#" + href.split("#")[1];
    } else {
      href = href.replace(/^https?:\/\/[^/]+/, "");
    }
    census[href] = (census[href] ?? 0) + 1;
  }
  return census;
};

const textWords = (file: string) => {
  const out = execFileSync("pdftotext", [file, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.trim().split(/\s+/).filter(Boolean).length;
};

test.describe("the image layer (Session 50 — D174, the twenty-fifth surface)", () => {
  test("the landing's 13-image census (the exact sorted structural keys; the animated glow's ±1px bucket)", async ({ page }) => {
    await dwell(page, "/");
    const key = imageKey(await renderPdf(page, "landing"), false);
    expect(key.length).toBe(13);
    expect(key).toEqual([
      "1:image:1047x105:rgb/3c/8bpc:image:no:300ppi",
      "1:image:1047x105:rgb/3c/8bpc:image:no:300ppi",
      "1:image:1165x103:rgb/3c/8bpc:image:no:300ppi",
      "1:image:1920x1080:icc/3c/8bpc:image:no:92ppi",
      "1:image:2025x534:rgb/3c/8bpc:image:no:300ppi",
      "1:image:626x204:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:710x28*:gray/1c/8bpc:jpeg:no:300ppi",
      "1:smask:1047x105:gray/1c/8bpc:image:no:300ppi",
      "1:smask:1047x105:gray/1c/8bpc:image:no:300ppi",
      "1:smask:1165x103:gray/1c/8bpc:image:no:300ppi",
      "1:smask:2025x534:gray/1c/8bpc:image:no:300ppi",
      "4:image:541x160:gray/1c/8bpc:jpeg:no:300ppi",
      "4:image:625x245:gray/1c/8bpc:jpeg:no:300ppi",
    ]);
  });

  test("the /login card's 6-image census", async ({ page }) => {
    await dwell(page, "/login");
    const key = imageKey(await renderPdf(page, "login"));
    expect(key).toEqual([
      "1:image:1168x168:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:1765x2696:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:329x329:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:413x413:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:754x676:rgb/3c/8bpc:image:no:300ppi",
      "1:smask:754x676:gray/1c/8bpc:image:no:300ppi",
    ]);
  });

  test("the empty-set parity: the content routes + /demo + /thank-you + the 404 carry ZERO image XObjects", async ({ page }) => {
    for (const route of [
      "/faq",
      "/privacy",
      "/terms",
      "/refund-policy",
      "/accessibility",
      "/thank-you",
      "/demo",
      "/session50-bogus-404",
    ]) {
      await dwell(page, route);
      const rows = imageRows(await renderPdf(page, route.replace(/\//g, "_")));
      expect(rows.length, `image census on ${route}`).toBe(0);
    }
  });

  test("the video-frame contract: the one full-viewport raster (1920x1080, icc, 92ppi — the hero video's painted frame)", async ({ page }) => {
    await dwell(page, "/");
    const rows = imageRows(await renderPdf(page, "landing-video"));
    const videos = rows.filter((c) => c[3] === "1920" && c[4] === "1080");
    expect(videos.length).toBe(1);
    const [, , type, , , color, comp, bpc, enc, interp, , , xppi, yppi] = videos[0];
    expect(type).toBe("image");
    expect(color).toBe("icc");
    expect(comp).toBe("3");
    expect(bpc).toBe("8");
    expect(enc).toBe("image"); // flate — the rasterized frame
    expect(interp).toBe("no");
    expect(xppi).toBe("92");
    expect(yppi).toBe("92");
  });

  test("the rasterization-law floor: the gradient-text raster + the CTA pair + the alpha-masked pills + the glows", async ({ page }) => {
    await dwell(page, "/");
    const key = imageKey(await renderPdf(page, "landing-floor"));
    // the H1 GRADIENT TEXT (background-clip: text) raster + its soft mask
    expect(key).toContain("1:image:2025x534:rgb/3c/8bpc:image:no:300ppi");
    expect(key).toContain("1:smask:2025x534:gray/1c/8bpc:image:no:300ppi");
    // the CTA gradient-bordered pill — painted TWICE (the border shimmer
    // overlay re-rasterizes the same box)
    expect(key.filter((k) => k === "1:image:1047x105:rgb/3c/8bpc:image:no:300ppi").length).toBe(2);
    // the badge pill + its mask
    expect(key).toContain("1:image:1165x103:rgb/3c/8bpc:image:no:300ppi");
    expect(key).toContain("1:smask:1165x103:gray/1c/8bpc:image:no:300ppi");
    // the blurred glows — jpeg-encoded (smooth, opaque content)
    expect(key.filter((k) => k.endsWith("jpeg:no:300ppi")).length).toBe(4);
  });

  test("the order-invariance + determinism law: two fresh renders produce the identical sorted key (the animated glow's ±1px bucket)", async ({ page }) => {
    await dwell(page, "/");
    const first = imageKey(await renderPdf(page, "landing-det1"), false);
    await dwell(page, "/");
    const second = imageKey(await renderPdf(page, "landing-det2"), false);
    expect(second).toEqual(first);
  });
});

test.describe("the /login alternates' print story (Session 50 — D175, the 24th surface's route extensions)", () => {
  const enterSignup = async (page: import("@playwright/test").Page) => {
    await page.getByRole("button", { name: /Need an account\?/ }).click();
    await page.getByRole("heading", { name: "Create your account" }).waitFor();
  };
  const enterForgot = async (page: import("@playwright/test").Page) => {
    await page.getByRole("button", { name: /Forgot password\?/ }).click();
    await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  };

  test("the alternates' font censuses: the default state's system-stack census (DejaVu 2x + Bold 1x)", async ({ page }) => {
    await dwell(page, "/login");
    await enterSignup(page);
    await page.waitForTimeout(400);
    const signup = fontCensus(await renderPdf(page, "alt-signup"));
    await dwell(page, "/login");
    await enterForgot(page);
    await page.waitForTimeout(400);
    const forgot = fontCensus(await renderPdf(page, "alt-forgot"));
    for (const [label, census] of [["sign-up", signup], ["forgot", forgot]] as const) {
      const counts = Object.fromEntries(Object.entries(census).map(([f, e]) => [f, e.count]));
      expect(counts, `font census on /login ${label}`).toEqual({ DejaVuSans: 2, "DejaVuSans-Bold": 1 });
      expect(census.DejaVuSans.types).toEqual({ "CID TrueType": 2 });
      expect(census.DejaVuSans.encodings).toEqual({ "Identity-H": 2 });
    }
  });

  test("the alternates' metadata + link empty-sets + print text (19/25 words)", async ({ page }) => {
    await dwell(page, "/login");
    await enterSignup(page);
    await page.waitForTimeout(400);
    const signupPdf = await renderPdf(page, "alt-signup-meta");
    await dwell(page, "/login");
    await enterForgot(page);
    await page.waitForTimeout(400);
    const forgotPdf = await renderPdf(page, "alt-forgot-meta");
    for (const [label, file, words] of [
      ["sign-up", signupPdf, 19],
      ["forgot", forgotPdf, 25],
    ] as const) {
      const meta = metaCensus(file);
      expect(meta.Title, `Title on /login ${label}`).toBe("SAAS Company");
      expect(meta.Pages, `Pages on /login ${label}`).toBe("1");
      expect(meta.Creator).toBe("Chromium");
      expect(meta.Producer).toBe("Skia/PDF m153");
      expect(meta["PDF version"]).toBe("1.4");
      expect(meta.Form).toBe("none");
      expect(meta.JavaScript).toBe("no");
      expect(meta["Page size"]).toBe("595.92 x 842.88 pts (A4)");
      // the alternates carry buttons, not anchors (the D169 law)
      expect(linkCensus(file), `link census on /login ${label}`).toEqual({});
      expect(textWords(file), `print text on /login ${label}`).toBe(words);
    }
  });

  test("the alternates' image censuses + the state-tracked raster heights (2696 default / 1833 sign-up / 1533 forgot)", async ({ page }) => {
    await dwell(page, "/login");
    const deflt = imageKey(await renderPdf(page, "alt-default"));
    await dwell(page, "/login");
    await enterSignup(page);
    await page.waitForTimeout(400);
    const signup = imageKey(await renderPdf(page, "alt-signup-img"));
    await dwell(page, "/login");
    await enterForgot(page);
    await page.waitForTimeout(400);
    const forgot = imageKey(await renderPdf(page, "alt-forgot-img"));

    expect(signup).toEqual([
      "1:image:1168x156:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:1765x1833:gray/1c/8bpc:jpeg:no:300ppi",
    ]);
    expect(forgot).toEqual([
      "1:image:1168x156:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:1765x1533:gray/1c/8bpc:jpeg:no:300ppi",
    ]);
    // THE STATE-TRACKED RASTER RECORD: the tall card-background raster
    // re-rasterizes per state at the card's rendered height — the
    // default's 2696 shrinks to 1833 (sign-up) and 1533 (forgot); the
    // wide title-area raster 168 -> 156 in both alternates.
    expect(deflt).toContain("1:image:1765x2696:gray/1c/8bpc:jpeg:no:300ppi");
    expect(deflt).toContain("1:image:1168x168:gray/1c/8bpc:jpeg:no:300ppi");
    expect(signup).not.toContain("1:image:1765x2696:gray/1c/8bpc:jpeg:no:300ppi");
    expect(forgot).not.toContain("1:image:1765x2696:gray/1c/8bpc:jpeg:no:300ppi");
    // the alternates drop the default state's card-content rasters (the
    // logo chip, the Google button — 6 images -> 2)
    expect(deflt.length).toBe(6);
  });
});
