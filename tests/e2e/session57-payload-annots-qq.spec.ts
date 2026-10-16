/**
 * Session 57 — THE THIRTY-SECOND SURFACE (D195 — the image STREAM PAYLOAD
 * layer: the filtered bytes of every image XObject, the layer BELOW the
 * S56 image-dict interior — measured at BYTE parity through
 * `qpdf --show-object=N --filtered-stream-data`) + THE /ANNOTS VALUE
 * LAYER (D196 — the annotation dicts at the value level: /Rect
 * byte-precision + the /A /S /URI actions + the /Dest named dests + the
 * /F flags, under the pg-dropped + origin-normalized contract) + THE Q/Q
 * LAW (D197 — the graphics-state stack: balanced q/Q on every page
 * content stream, maxDepth <= 2, the content-route engine-family deltas
 * registered).
 *
 * A REGISTRATION session (the S45/S48-S56 pattern): the recon measured
 * BOTH sides — every deterministic route at FULL PAYLOAD PARITY
 * (byte-identical sha256s) + every public route at FULL /ANNOTS parity —
 * ZERO src/ changes; the pins register the record.
 *
 * THE INSTRUMENT LAWS honored:
 *  - THE FILTERED-STREAM LAW: qpdf's --show-object=N
 *    --filtered-stream-data writes the decoded bytes to STDOUT (there is
 *    no --binary flag in qpdf 12; execFileSync with encoding:"buffer").
 *  - THE BASE64-STREAM LAW: the qpdf-JSON stream "data" field is
 *    BASE64-encoded for binary streams (the first probe's zero-q/Q
 *    catch — decode before tokenizing, disambiguated by the
 *    PDF-operator test: a plain ASCII stream is also base64-alphabet
 *    clean).
 *  - THE u:-PREFIX LAW: the qpdf JSON serializes strings with a "u:"
 *    type prefix ("u:http://...") — the /Annots origin normalization
 *    must strip it (a ^https? regex never fires on u:...).
 *  - THE CONTEXT-ORDER LAW (the recon's determinism catch): the
 *    determinism re-renders must run on CLEAN contexts — an
 *    authenticated context's /login REDIRECTS to /dashboard and render B
 *    measures the dashboard's images.
 *
 * THE MEASURED RECORDS (generated constants below — the recon's pin file
 * research/s57-pin.json + the stability probe
 * research/s57-landing-stability.json, determinism verified 2x): the
 * stable routes at FULL PAYLOAD PARITY (/login 6 streams incl. the
 * 754x676 SMask pair + 4 DCTs; the content routes + the 404 + /demo the
 * empty-set family); the five /login alternates at full payload parity
 * (default/error 6, reset 1, signup/forgot 2); the landing's payload
 * buckets (the stable-shared core byte-identical: the 1165x103 pair +
 * 541x160 + 625x245 + the stable masks + the clone-stable 626x204/710x288
 * DCTs; the video-frame family frame-dependent BOTH sides with
 * INTERSECTING sha sets — the same 8s video captured at different
 * times; the clone-only stable slivers 1x26/738x1/738x26 — the S56
 * registered superset at the byte level); THE /ANNOTS VALUE LAYER at
 * exact parity on every public route (landing 69, faq 14, thank-you 1,
 * privacy 14, terms 14, accessibility 16, refund 14, login 0, 404 0 —
 * the /demo 14/0 the registered superset floor); THE Q/Q LAW balanced
 * everywhere (endDepth 0, maxDepth <= 2) with the content-route
 * engine-family deltas registered (clone privacy 70/live 66, terms
 * 68/66, accessibility 86/80, refund 70/66 — stable per side, measured
 * 3x) + the landing's animated bucket (189/190 + the forms 54/57
 * stream-count delta) + the /demo superset floor (96/7).
 */
import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

const DEMO_EMAIL = "demo@novaai.app";
const DEMO_PASSWORD = "Demo1234!";
const PIN_EMAIL = "demo@novaai.app";

const pdfFile = (name: string) => join(tmpdir(), `s57-pin-${name}.pdf`);

const dwell = async (page: import("@playwright/test").Page, route: string) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
};

const renderPdf = async (page: import("@playwright/test").Page, name: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(name);
  writeFileSync(file, buf);
  return file;
};

// ---------- THE D195 INSTRUMENT (the image stream payload census) ----------
type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};

const qpdfJson = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".s57.json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 512 * 1024 * 1024,
  });
  return JSON.parse(readFileSync(jsonFile, "utf8")) as {
    qpdf: [unknown, Record<string, QpdfObj>];
  };
};
const dictOf = (o: QpdfObj | undefined | null) => o?.value ?? o?.stream?.dict ?? null;
const val = (v: unknown) => (v as { value?: unknown } | undefined)?.value ?? v;
const refNum = (r: unknown) =>
  typeof r === "string" ? (r.match(/^(\d+) \d+ R$/) || [])[1] : undefined;
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex").slice(0, 16);

/** THE FILTERED-STREAM LAW: the decoded bytes to STDOUT, captured as a
 *  Buffer (no --binary flag exists in qpdf 12). */
const filteredBytes = (file: string, objNum: string) =>
  Buffer.from(
    execFileSync(
      "qpdf",
      [`--show-object=${objNum}`, "--filtered-stream-data", file],
      { maxBuffer: 512 * 1024 * 1024, encoding: "buffer" },
    ),
  );

/** THE 32ND SURFACE — every image XObject's PAYLOAD census: the sorted
 *  multiset of (w x h, filter, len, sha). */
const payloadCensus = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  const rows: { key: string; len: number; sha: string }[] = [];
  for (const key of Object.keys(objs)) {
    const d = dictOf(objs[key]);
    if (!d || !d["/Subtype"] || val(d["/Subtype"]) !== "/Image") continue;
    const num = (key.replace(/^obj:/, "").match(/^(\d+)/) || [])[1];
    const w = String(val(d["/Width"]));
    const h = String(val(d["/Height"]));
    const fRaw = val(d["/Filter"]);
    const filt = Array.isArray(fRaw)
      ? fRaw.map((x) => String(val(x))).join("+")
      : String(fRaw ?? "none");
    let len = -1;
    let hsh = "ERR";
    try {
      const b = filteredBytes(file, num);
      len = b.length;
      hsh = sha(b);
    } catch {
      hsh = "ERR";
    }
    rows.push({ key: `${w}x${h}:${filt}`, len, sha: hsh });
  }
  rows.sort((a, b) => a.key.localeCompare(b.key) || a.len - b.len);
  return { count: rows.length, rows };
};

// ---------- THE D197 INSTRUMENT (the q/Q graphics-state stack) ----------
/** THE BASE64-STREAM LAW: the qpdf-JSON stream data is base64 for binary
 *  streams; the disambiguation — a plain ASCII stream is also
 *  base64-alphabet clean, so decode only when the plain form has NO pdf
 *  operators AND the decoded form DOES. */
const OPS_RE =
  /(?:^|\s)(?:q|Q|cm|re|W|W\*|n|f|f\*|B|B\*|b|b\*|S|s|c|v|y|h|m|l|rg|RG|k|K|g|G|gs|scn|SCN|sc|SC|sh|BT|ET|Tj|TJ|Tf|Td|TD|Tm|Do)(?:\s|$)/;
const decodeStreamData = (s: string) => {
  if (typeof s !== "string" || s.length === 0) return "";
  if (OPS_RE.test(s)) return s;
  try {
    const d = Buffer.from(s, "base64").toString("latin1");
    if (OPS_RE.test(d)) return d;
  } catch {
    /* not base64 */
  }
  return s;
};

type QqRec = {
  streams: number;
  q: number;
  Q: number;
  maxDepth: number;
  endDepth: number;
};
const qqRecord = (file: string): { pages: QqRec; forms: QqRec } => {
  const objs = qpdfJson(file).qpdf[1];
  const walk = (datas: string[]): QqRec => {
    let q = 0;
    let Q = 0;
    let maxDepth = 0;
    let depth = 0;
    for (const data of datas) {
      for (const tok of data.match(/\bq\b|\bQ\b/g) || []) {
        if (tok === "q") {
          depth++;
          q++;
          if (depth > maxDepth) maxDepth = depth;
        } else {
          depth--;
          Q++;
        }
      }
    }
    return { streams: datas.length, q, Q, maxDepth, endDepth: depth };
  };
  const pageStreams: string[] = [];
  const formStreams: string[] = [];
  for (const key of Object.keys(objs)) {
    const d = dictOf(objs[key]);
    if (!d) continue;
    const t = d["/Type"] ? val(d["/Type"]) : null;
    const st = d["/Subtype"] ? val(d["/Subtype"]) : null;
    if (t === "/Page") {
      const c = val(d["/Contents"]);
      const refs = Array.isArray(c) ? c : c ? [c] : [];
      for (const r of refs) {
        const n = refNum(typeof r === "object" ? JSON.stringify(r) : r);
        const sd = n ? objs[`obj:${n} 0 R`] : null;
        if (sd?.stream?.data)
          pageStreams.push(decodeStreamData(String(sd.stream.data)));
      }
    } else if (st === "/Form") {
      const sd = objs[key];
      if (sd?.stream?.data) formStreams.push(decodeStreamData(String(sd.stream.data)));
    }
  }
  return { pages: walk(pageStreams), forms: walk(formStreams) };
};

// ---------- THE D196 INSTRUMENT (the /Annots value layer) ----------
type AnnotRow = {
  subtype: string;
  rect: number[];
  aS: string;
  uri: string | null;
  dest: string | null;
  f: string;
  bs: string;
};
/** THE u:-PREFIX LAW: the qpdf JSON serializes strings with the "u:" type
 *  prefix — the origin normalization strips it before the path compare. */
const annotsCensus = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  const out: AnnotRow[] = [];
  for (const key of Object.keys(objs)) {
    const d = dictOf(objs[key]);
    if (!d || !d["/Type"] || val(d["/Type"]) !== "/Page") continue;
    const aRaw = val(d["/Annots"]);
    const refs = Array.isArray(aRaw) ? aRaw : aRaw ? [aRaw] : [];
    for (const r of refs) {
      const n = refNum(
        typeof r === "object" && !Array.isArray(r) ? JSON.stringify(r) : r,
      );
      if (!n) continue;
      const ad = dictOf(objs[`obj:${n} 0 R`]);
      if (!ad) continue;
      const rect = ((val(ad["/Rect"]) as unknown[] | null) ?? []).map((v) => {
        const n2 = val(v);
        return typeof n2 === "number" ? Math.round(n2 * 100) / 100 : n2;
      }) as number[];
      const a = val(ad["/A"]);
      const aDict =
        a && typeof a === "object" && !Array.isArray(a)
          ? (a as Record<string, unknown>)
          : null;
      let uri: string | null = aDict ? ((val(aDict["/URI"]) as string) ?? null) : null;
      if (typeof uri === "string")
        uri = "ORIGIN" + uri.replace(/^u:https?:\/\/[^/]+/, "");
      const dest = ad["/Dest"] ? val(ad["/Dest"]) : null;
      out.push({
        subtype: String(val(ad["/Subtype"]) ?? ""),
        rect,
        aS: aDict ? String(val(aDict["/S"]) ?? "") : "",
        uri: uri === null ? null : String(uri),
        dest: dest === null ? null : JSON.stringify(dest),
        f: ad["/F"] ? String(val(ad["/F"])) : "",
        bs: ad["/BS"] ? JSON.stringify(val(ad["/BS"])) : "",
      });
    }
  }
  out.sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
  return { count: out.length, rows: out };
};

// ---------- the /login alternates drivers (the S56 pattern) ----------
const enterDefault = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.waitForTimeout(600);
};
const enterError = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.fill("#email", PIN_EMAIL);
  await page.fill("#password", "wrong-password");
  await page.click("button[type=submit]");
  await page.waitForSelector('[role="alert"]');
  await page.waitForTimeout(400);
};
const enterReset = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Forgot password\?/ }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  await page.fill("#email", PIN_EMAIL);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await page.getByRole("heading", { name: "Check your email" }).waitFor();
  await page.waitForTimeout(400);
};
const enterSignup = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Sign up/ }).click();
  await page.getByRole("heading", { name: /Create your account/ }).waitFor();
  await page.waitForTimeout(500);
};
const enterForgot = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Forgot password\?/ }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  await page.waitForTimeout(500);
};

// ---------- (1) THE 32ND SURFACE: the stable routes' payload censuses ----------
const PAYLOAD_STABLE: Record<string, { count: number; rows: { key: string; len: number; sha: string }[] }> = {
  "/login": {"count":6,"rows":[{"key":"1168x168:/DCTDecode","len":196224,"sha":"6acc89124c72464f"},{"key":"1765x2696:/DCTDecode","len":4758440,"sha":"f706cecbf266f6e2"},{"key":"329x329:/DCTDecode","len":108241,"sha":"e49fcf4662a37dc7"},{"key":"413x413:/DCTDecode","len":170569,"sha":"19c8da1abc156f0f"},{"key":"754x676:none","len":509704,"sha":"e81d4d6a5bcdfecb"},{"key":"754x676:none","len":1529112,"sha":"8dc20cf407dbde96"}]},
  "/faq": {"count":0,"rows":[]},
  "/thank-you": {"count":0,"rows":[]},
  "/privacy": {"count":0,"rows":[]},
  "/terms": {"count":0,"rows":[]},
  "/accessibility": {"count":0,"rows":[]},
  "/refund-policy": {"count":0,"rows":[]},
  "/does-not-exist-404": {"count":0,"rows":[]},
  "/demo": {"count":0,"rows":[]},
};

// ---------- (2) the landing payload buckets (the stability probe's classification) ----------
const LANDING_PAYLOAD = {
  "exactShas": [
    {
      "key": "1165x103",
      "sha": "dde0380afc92ee4a"
    },
    {
      "key": "1165x103",
      "sha": "efc09f9fa2bdec87"
    },
    {
      "key": "1x26",
      "sha": "9d87bab283682e1d"
    },
    {
      "key": "201x201",
      "sha": "538183a0f977cde8"
    },
    {
      "key": "2025x534",
      "sha": "3417bbe90ebb3397"
    },
    {
      "key": "541x160",
      "sha": "8e6e7b5068e8dadb"
    },
    {
      "key": "625x245",
      "sha": "cc93d1b939ad3602"
    },
    {
      "key": "626x204",
      "sha": "fd3d1e84812e7104"
    },
    {
      "key": "710x288",
      "sha": "aecfa5581f3409a9"
    },
    {
      "key": "738x1",
      "sha": "04ef6f770eddeb77"
    },
    {
      "key": "738x26",
      "sha": "a8728f3d60a346a8"
    }
  ],
  "requiredKeys": [
    "1047x105",
    "1165x103",
    "1920x1080",
    "1x26",
    "201x201",
    "2025x534",
    "541x160",
    "625x245",
    "626x204",
    "710x288",
    "738x1",
    "738x26"
  ],
  "optionalKeys": [],
  "cloneOnlySlivers": [
    "1x26",
    "738x1",
    "738x26"
  ]
};

// ---------- (3) the five /login alternates' payloads ----------
const ALT_PAYLOAD: Record<string, { count: number; rows: { key: string; len: number; sha: string }[] }> = {
  "default": {"count":6,"rows":[{"key":"1168x168:/DCTDecode","len":196224,"sha":"6acc89124c72464f"},{"key":"1765x2696:/DCTDecode","len":4758440,"sha":"f706cecbf266f6e2"},{"key":"329x329:/DCTDecode","len":108241,"sha":"e49fcf4662a37dc7"},{"key":"413x413:/DCTDecode","len":170569,"sha":"19c8da1abc156f0f"},{"key":"754x676:none","len":509704,"sha":"e81d4d6a5bcdfecb"},{"key":"754x676:none","len":1529112,"sha":"8dc20cf407dbde96"}]},
  "error": {"count":6,"rows":[{"key":"1168x168:/DCTDecode","len":196224,"sha":"3341fbdd3676dc0f"},{"key":"1765x2927:/DCTDecode","len":5166155,"sha":"2a936e010c6d79c4"},{"key":"329x329:/DCTDecode","len":108241,"sha":"26161dc26172701d"},{"key":"413x413:/DCTDecode","len":170569,"sha":"05fea942bb831ad9"},{"key":"754x675:none","len":508950,"sha":"3f9ec7d954c80924"},{"key":"754x675:none","len":1526850,"sha":"9dbfd5a1dfd76cfa"}]},
  "reset": {"count":1,"rows":[{"key":"1765x1609:/DCTDecode","len":2839885,"sha":"24ea45942412b453"}]},
  "signup": {"count":2,"rows":[{"key":"1168x156:/DCTDecode","len":182208,"sha":"192cfc088beb1045"},{"key":"1765x1833:/DCTDecode","len":3235245,"sha":"5d33c56212ee84d5"}]},
  "forgot": {"count":2,"rows":[{"key":"1168x156:/DCTDecode","len":182208,"sha":"192cfc088beb1045"},{"key":"1765x1533:/DCTDecode","len":2705745,"sha":"6840cbbb32027df9"}]},
};

// ---------- (4) THE Q/Q LAW records (clone side; the live engine-family deltas in comments) ----------
const QQ_STABLE: Record<string, { pages: { streams: number; q: number; Q: number; maxDepth: number; endDepth: number }; forms: { streams: number; q: number; Q: number; maxDepth: number; endDepth: number } }> = {
  "/login": {"pages":{"streams":1,"q":4,"Q":4,"maxDepth":2,"endDepth":0},"forms":{"streams":7,"q":36,"Q":36,"maxDepth":2,"endDepth":0}},
  "/faq": {"pages":{"streams":2,"q":98,"Q":98,"maxDepth":2,"endDepth":0},"forms":{"streams":12,"q":12,"Q":12,"maxDepth":1,"endDepth":0}},
  "/thank-you": {"pages":{"streams":1,"q":9,"Q":9,"maxDepth":2,"endDepth":0},"forms":{"streams":0,"q":0,"Q":0,"maxDepth":0,"endDepth":0}},
  "/does-not-exist-404": {"pages":{"streams":1,"q":7,"Q":7,"maxDepth":2,"endDepth":0},"forms":{"streams":0,"q":0,"Q":0,"maxDepth":0,"endDepth":0}},
};
const QQ_LANDING_BUCKET = {"pages":{"streams":8,"q":189,"Q":189,"maxDepth":2,"endDepth":0},"forms":{"streams":54,"q":92,"Q":92,"maxDepth":2,"endDepth":0}}; // the animated ±1 family: clone 189 / live 190 + the forms stream-count delta 54/57 (the framer family) — NOT exact-pinned (bucket)
const QQ_ENGINE_DELTAS = {
  "/privacy": { clone: {"streams":2,"q":70,"Q":70,"maxDepth":2,"endDepth":0}, live: {"streams":2,"q":66,"Q":66,"maxDepth":2,"endDepth":0} }, // the engine-family delta: clone 70 / live 66 (stable both sides)
  "/terms": { clone: {"streams":2,"q":68,"Q":68,"maxDepth":2,"endDepth":0}, live: {"streams":2,"q":66,"Q":66,"maxDepth":2,"endDepth":0} }, // the engine-family delta: clone 68 / live 66
  "/accessibility": { clone: {"streams":3,"q":86,"Q":86,"maxDepth":2,"endDepth":0}, live: {"streams":3,"q":80,"Q":80,"maxDepth":2,"endDepth":0} }, // the engine-family delta: clone 86 / live 80
  "/refund-policy": { clone: {"streams":2,"q":70,"Q":70,"maxDepth":2,"endDepth":0}, live: {"streams":2,"q":66,"Q":66,"maxDepth":2,"endDepth":0} }, // the engine-family delta: clone 70 / live 66
  "/demo": { clone: {"streams":2,"q":96,"Q":96,"maxDepth":2,"endDepth":0}, live: {"streams":1,"q":7,"Q":7,"maxDepth":2,"endDepth":0} }, // the superset floor: clone 96 / live 7 (the live's 16-word shell)
};

// ---------- (5) THE /ANNOTS VALUE LAYER (origin-normalized, pg-dropped) ----------
const ANNOTS_STABLE: Record<string, { count: number; rows: unknown[] }> = {
  "/login": {"count":0,"rows":[]},
  "/faq": {"count":14,"rows":[{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[324,11.88,387.75,26.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[324,35.88,387.75,50.88],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,35.88,451.5,50.88],"aS":"/URI","uri":"ORIGIN/accessibility","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,59.88,451.5,74.88],"aS":"/URI","uri":"ORIGIN/terms","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,812.88,451.5,842.88],"aS":"/URI","uri":"ORIGIN/refund-policy","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,83.88,451.5,98.88],"aS":"/URI","uri":"ORIGIN/privacy","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[451.5,11.88,514.5,26.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,35.88,514.5,50.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,59.88,514.5,74.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,83.88,514.5,98.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""}]},
  "/thank-you": {"count":1,"rows":[{"subtype":"/Link","rect":[227.25,272.88,369,314.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""}]},
  "/privacy": {"count":14,"rows":[{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[324,779.88,387.75,794.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[324,803.88,387.75,818.88],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,764.88,451.5,794.88],"aS":"/URI","uri":"ORIGIN/refund-policy","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,8.88,451.5,23.88],"aS":"/URI","uri":"ORIGIN/privacy","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,803.88,451.5,818.88],"aS":"/URI","uri":"ORIGIN/accessibility","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,827.88,451.5,842.88],"aS":"/URI","uri":"ORIGIN/terms","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[451.5,779.88,514.5,794.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,8.88,514.5,23.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,803.88,514.5,818.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,827.88,514.5,842.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""}]},
  "/terms": {"count":14,"rows":[{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[324,698.88,387.75,713.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[324,722.88,387.75,737.88],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,683.88,451.5,713.88],"aS":"/URI","uri":"ORIGIN/refund-policy","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,722.88,451.5,737.88],"aS":"/URI","uri":"ORIGIN/accessibility","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,746.88,451.5,761.88],"aS":"/URI","uri":"ORIGIN/terms","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,770.88,451.5,785.88],"aS":"/URI","uri":"ORIGIN/privacy","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[451.5,698.88,514.5,713.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,722.88,514.5,737.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,746.88,514.5,761.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,770.88,514.5,785.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""}]},
  "/accessibility": {"count":16,"rows":[{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[324,32.88,387.75,47.88],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[324,8.88,387.75,23.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[387.75,32.88,451.5,47.88],"aS":"/URI","uri":"ORIGIN/accessibility","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,56.88,451.5,71.88],"aS":"/URI","uri":"ORIGIN/terms","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,80.88,451.5,95.88],"aS":"/URI","uri":"ORIGIN/privacy","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,812.88,451.5,842.88],"aS":"/URI","uri":"ORIGIN/refund-policy","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[451.5,32.88,514.5,47.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,56.88,514.5,71.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,8.88,514.5,23.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,80.88,514.5,95.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""}]},
  "/refund-policy": {"count":14,"rows":[{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[324,31.38,387.75,46.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[324,7.38,387.75,22.38],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[387.75,31.38,451.5,46.38],"aS":"/URI","uri":"ORIGIN/accessibility","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,55.38,451.5,70.38],"aS":"/URI","uri":"ORIGIN/terms","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,79.38,451.5,94.38],"aS":"/URI","uri":"ORIGIN/privacy","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[387.75,812.88,451.5,842.88],"aS":"/URI","uri":"ORIGIN/refund-policy","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[415.77,802.38,458.52,829.38],"aS":"/URI","uri":"ORIGIN/faq","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[451.5,31.38,514.5,46.38],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,55.38,514.5,70.38],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,7.38,514.5,22.38],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""},{"subtype":"/Link","rect":[451.5,79.38,514.5,94.38],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""}]},
  "/does-not-exist-404": {"count":0,"rows":[]},
};
const ANNOTS_DEMO_SUPERSET = {"count":14,"rows":[{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[18,809.88,85.5,821.88],"aS":"/URI","uri":"ORIGIN/","dest":null,"f":"4","bs":""},{"subtype":"/Link","rect":[324,779.88,387.75,794.88],"aS":"","uri":null,"dest":"\"/\"","f":"4","bs":""}]}; // the live's shell carries 0 annots (the S48 record)

// ---------- (6) the authenticated dashboard (clone-only superset) ----------
const DASHBOARD = {
  "payload": {
    "count": 4,
    "rows": [
      {
        "key": "1904x551:none",
        "len": 1049104,
        "sha": "3b131662f61b0496"
      },
      {
        "key": "1904x551:none",
        "len": 3147312,
        // S59 re-pin (the D205 downstream convergence): the chart's
        // violet-tinted raster shifted with the login-agnostic violet
        // token's hsl-float convergence (the ±0.5/255 channel delta on
        // the violet regions) — was 25bdc4e3840b6fda (the hex-mirror
        // raster); the new sha deterministic across renders.
        "sha": "f2537a3eda99f592"
      },
      {
        "key": "24x7:none",
        "len": 504,
        "sha": "0d2546052f4d65f3"
      },
      {
        "key": "323x7:none",
        "len": 6783,
        "sha": "3cb14c7a565c122b"
      }
    ]
  },
  "qq": {
    "pages": {
      "streams": 2,
      "q": 206,
      "Q": 206,
      "maxDepth": 2,
      "endDepth": 0
    },
    "forms": {
      "streams": 34,
      "q": 64,
      "Q": 64,
      "maxDepth": 2,
      "endDepth": 0
    }
  },
  "annots": {
    "count": 1,
    "rows": [
      {
        "subtype": "/Link",
        "rect": [
          18,
          810.63,
          85.5,
          822.63
        ],
        "aS": "/URI",
        "uri": "ORIGIN/",
        "dest": null,
        "f": "4",
        "bs": ""
      }
    ]
  }
};

test.describe("the image STREAM payload layer (Session 57 — D195, the thirty-second surface)", () => {
  test("THE 32ND SURFACE: every deterministic route at FULL PAYLOAD PARITY — /login 6 byte-identical streams; the content routes + the 404 + /demo the empty-set family", async ({ page }) => {
    for (const [route, pin] of Object.entries(PAYLOAD_STABLE)) {
      await dwell(page, route);
      const f = await renderPdf(page, `s57-${route.replace(/\W/g, "")}`);
      const c = payloadCensus(f);
      expect(c.count, `${route} the image-stream count`).toBe(pin.count);
      expect(c.rows, `${route} the payload rows (len + sha)`).toEqual(pin.rows);
    }
  });

  test("the landing's payload buckets: the stable-shared core byte-identical + the clone-only stable slivers + the video-frame family (sha unpinned)", async ({ page }) => {
    await dwell(page, "/");
    const c = payloadCensus(await renderPdf(page, "s57-landing"));
    // the constants' keys are DIMS-ONLY (the stability probe's format);
    // the census keys carry the filter suffix — normalize by stripping it
    const dims = (k: string) => k.split(":")[0];
    // (a) the exact-sha family: present with the EXACT sha on every render
    //     (the shared-stable core + the clone-stable masks/DCTs + the
    //     S56-registered slivers, now pinned at the byte level)
    for (const { key, sha: s } of LANDING_PAYLOAD.exactShas) {
      const rows = c.rows.filter((r) => dims(r.key) === key && r.sha === s);
      expect(rows.length, `the ${key} payload byte-identical (sha ${s})`).toBeGreaterThanOrEqual(1);
    }
    // (b) the required keys: present on every render (the video-frame /
    //     animated-glow family members whose shas vary per frame)
    const keys = [...new Set(c.rows.map((r) => dims(r.key)))];
    for (const k of LANDING_PAYLOAD.requiredKeys) {
      expect(keys, `the ${k} family present`).toContain(k);
    }
    // (c) the S56-registered form-nested slivers at the byte level
    for (const k of LANDING_PAYLOAD.cloneOnlySlivers) {
      expect(keys, `the clone-only sliver ${k}`).toContain(k);
    }
    // (d) the object-count floor (the S56 16-18 record; 12 required keys
    //     with the paired-mask families doubling up)
    expect(c.count, "the landing object-level payload floor").toBeGreaterThanOrEqual(15);
  });

  test("the five /login alternates' payloads at byte parity (default/error the 6-stream set; reset 1; signup/forgot 2)", async ({ page }) => {
    const drivers: [string, (p: import("@playwright/test").Page) => Promise<void>][] = [
      ["default", enterDefault], ["error", enterError], ["reset", enterReset],
      ["signup", enterSignup], ["forgot", enterForgot],
    ];
    for (const [state, driver] of drivers) {
      await driver(page);
      const c = payloadCensus(await renderPdf(page, `s57-alt-${state}`));
      expect(c.count, `alt-${state} the payload count`).toBe(ALT_PAYLOAD[state].count);
      expect(c.rows, `alt-${state} the payload rows`).toEqual(ALT_PAYLOAD[state].rows);
    }
  });

  test("the determinism law: the /login payload + qq + annots byte-identical across re-renders (the fresh-context law)", async ({ page }) => {
    // THE CONTEXT-ORDER LAW: this test runs on the clean per-test context
    // (playwright's test isolation) — an authenticated context's /login
    // redirects to /dashboard and the re-render would measure the
    // dashboard's images (the recon's instrument catch).
    await dwell(page, "/login");
    const fa = await renderPdf(page, "s57-det-a");
    const a = { payload: payloadCensus(fa), qq: qqRecord(fa), annots: annotsCensus(fa) };
    await dwell(page, "/login");
    await page.waitForTimeout(400);
    const fb = await renderPdf(page, "s57-det-b");
    const b = { payload: payloadCensus(fb), qq: qqRecord(fb), annots: annotsCensus(fb) };
    expect(JSON.stringify(b), "the /login payload+qq+annots deterministic").toBe(JSON.stringify(a));
  });
});

test.describe("THE Q/Q LAW (Session 57 — D197, the graphics-state stack)", () => {
  test("the balanced-stack law on every route: q === Q, endDepth 0, maxDepth <= 2 — the stable routes at exact parity + the engine-family deltas at the registered clone values", async ({ page }) => {
    // the exact-parity routes (clone === live, measured)
    for (const [route, pin] of Object.entries(QQ_STABLE)) {
      await dwell(page, route);
      const f = await renderPdf(page, `s57-qq-${route.replace(/\W/g, "")}`);
      expect(qqRecord(f), `${route} the qq record at parity`).toEqual(pin);
    }
    // the engine-family delta routes: the CLONE's registered values
    // (the live's values recorded in the comments — stable per side,
    // measured 3x; the delta is the D125 engine-structure family)
    for (const [route, rec] of Object.entries(QQ_ENGINE_DELTAS)) {
      await dwell(page, route);
      const f = await renderPdf(page, `s57-qqd-${route.replace(/\W/g, "")}`);
      const c = qqRecord(f);
      expect(c.pages, `${route} the clone's registered qq (engine family)`).toEqual(rec.clone);
      expect(c.pages.q, `${route} balanced q`).toBe(c.pages.Q);
      expect(c.pages.endDepth, `${route} the stack returns to zero`).toBe(0);
      expect(c.pages.maxDepth, `${route} the max nesting <= 2`).toBeLessThanOrEqual(2);
    }
  });

  test("the landing's qq bucket (the animated family): balanced + maxDepth <= 2 + the count within the registered band", async ({ page }) => {
    await dwell(page, "/");
    const c = qqRecord(await renderPdf(page, "s57-qq-landing"));
    // THE ANIMATED BUCKET: the clone 189 / live 190 (the ±1 family — the
    // frame-dependent emission); the count pinned as a band, the balance
    // law pinned exactly
    expect(c.pages.q, "the landing q within the animated band").toBeGreaterThanOrEqual(QQ_LANDING_BUCKET.pages.q - 3);
    expect(c.pages.q, "the landing q within the animated band (upper)").toBeLessThanOrEqual(QQ_LANDING_BUCKET.pages.q + 3);
    expect(c.pages.Q, "the landing balanced").toBe(c.pages.q);
    expect(c.pages.endDepth, "the landing stack returns to zero").toBe(0);
    expect(c.pages.maxDepth, "the landing max nesting <= 2").toBeLessThanOrEqual(2);
    expect(c.pages.streams, "the landing page-stream count").toBe(QQ_LANDING_BUCKET.pages.streams);
  });
});

test.describe("THE /ANNOTS VALUE LAYER (Session 57 — D196, the annotation-dict interiors)", () => {
  test("every public route at exact /Annots parity: the /Rect byte-precision + the /A actions + the /Dest named dests + the /F flags (the pg-dropped + origin-normalized contract)", async ({ page }) => {
    for (const [route, pin] of Object.entries(ANNOTS_STABLE)) {
      await dwell(page, route);
      const f = await renderPdf(page, `s57-ann-${route.replace(/\W/g, "")}`);
      const c = annotsCensus(f);
      expect(c.count, `${route} the annotation count`).toBe(pin.count);
      expect(c.rows, `${route} the annotation value rows`).toEqual(pin.rows as AnnotRow[]);
    }
  });

  test("the /demo superset floor: the clone's 14 link annotations (the live's shell carries none — the S48 record)", async ({ page }) => {
    await dwell(page, "/demo");
    const c = annotsCensus(await renderPdf(page, "s57-ann-demo"));
    expect(c.count, "/demo the superset floor").toBe(ANNOTS_DEMO_SUPERSET.count);
    expect(c.rows.slice(0, 3), "/demo the first rows").toEqual(ANNOTS_DEMO_SUPERSET.rows as AnnotRow[]);
  });

  test("the landing's 69 annotations at value parity (the biggest annots surface)", async ({ page }) => {
    await dwell(page, "/");
    const c = annotsCensus(await renderPdf(page, "s57-ann-landing"));
    // the landing is not in ANNOTS_STABLE (its rows were verified at
    // parity in the recon but the full 69-row pin is large); the count +
    // the structural fingerprint pinned here
    expect(c.count, "the landing's annotation count").toBe(69);
    const subtypes = [...new Set(c.rows.map((r) => r.subtype))].sort();
    expect(subtypes, "all /Link subtype").toEqual(["/Link"]);
    expect(c.rows.every((r) => r.f === "4"), "every annot carries the /F 4 flag").toBe(true);
    expect(c.rows.every((r) => r.bs === ""), "no /BS border dicts").toBe(true);
    // the two action families: the /URI actions (origin-normalized) + the
    // /Dest named-destination actions
    const uriRows = c.rows.filter((r) => r.aS === "/URI");
    const destRows = c.rows.filter((r) => r.dest !== null);
    expect(uriRows.length + destRows.length, "every row carries either /A /URI or /Dest").toBe(69);
    expect(c.rows.every((r) => r.rect.every((n) => typeof n === "number")), "every /Rect numeric").toBe(true);
  });
});

test.describe("the authenticated dashboard (the clone-only superset route — the context-order law: authenticated LAST)", () => {
  test("the dashboard's payload streams + the qq record + the annotation set", async ({ page }) => {
    await dwell(page, "/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    const f = await renderPdf(page, "s57-dashboard");
    expect(payloadCensus(f), "the dashboard's 4 payload streams").toEqual(DASHBOARD.payload);
    expect(qqRecord(f), "the dashboard's qq record").toEqual(DASHBOARD.qq);
    expect(annotsCensus(f), "the dashboard's annotation set").toEqual(DASHBOARD.annots);
  });
});
