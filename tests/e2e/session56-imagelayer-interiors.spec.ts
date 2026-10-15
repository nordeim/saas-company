/**
 * Session 56 — THE THIRTY-FIRST SURFACE (D193 — the image XObject
 * INTERIOR layer: the object-level census through qpdf, measuring BELOW
 * the page-placement layer pdfimages walks) + THE FOUR LAWS (D194 — the
 * /Decode EMPTY-SET + the /DecodeParms EMPTY-SET + the inline-image
 * BI/ID/EI EMPTY-SET + the /demo print-gradient EMPTY-SET) + THE
 * RE-VERIFICATIONS (the /Info VALUE layer — the S49 record re-derived;
 * the dashboard's function fingerprint — the S55 record holding).
 *
 * A REGISTRATION session (the S45/S48-S55 pattern): the recon measured
 * BOTH sides — the stable seven + the five alternates + the 404 + /demo
 * at FULL OBJECT-LEVEL IMAGE-INTERIOR PARITY on the first honest fresh
 * measurement — ZERO src/ changes; the pins register the record.
 *
 * THE INSTRUMENT LAWS honored:
 *  - THE OBJECT-LEVEL CENSUS LAW (the S54 typeless-object law at the
 *    image layer): pdfimages -list walks PAGE-LEVEL resources ONLY —
 *    the images referenced from FORM XObjects' nested /Resources (the
 *    animated mockup's raster slivers) and the /SMask TARGET images are
 *    INVISIBLE to it. The complete census is object-level through
 *    qpdf --json (the S50 13-key page census and this 16-18-key object
 *    census are BOTH true — different layers, both pinned).
 *  - THE ICC SHAPE LAW (the S54 refinement, the lesson-88 family's
 *    EIGHTH sighting): Skia's ICC profile streams carry NO /Subtype —
 *    just /N + /Length (+ /Alternate). A detector keyed on
 *    /Subtype === /ICCBased measures EMPTY on exactly the document
 *    carrying one profile (the landing's video poster). Shape-based
 *    detection: /N + stream data + the key universe + referenced from
 *    an image's [/ICCBased n 0 R] array.
 *  - THE ANIMATED-FORM-NESTED SUPERSET (the D125 library-structure
 *    family at the form-nested image layer): the landing's clone emits
 *    16-18 object-level images vs the live's stable 13 — the clone's
 *    CSS-keyframe animated elements rasterize as form-nested image
 *    slivers at print time (1x26, 738x1, 738x26 stable; the 201x1 pair
 *    frame-dependent 2-of-3) where the live's framer-inline elements
 *    stay vector. The PAGE-PLACED census stays at parity (S50 pin
 *    13/13 green) — the superset is engine structure, REGISTERED not
 *    "fixed".
 *
 * THE MEASURED RECORDS (generated constants below — the recon's pin
 * file research/s56-pin.json, determinism verified 2x): the stable
 * seven at FULL IMAGE-INTERIOR PARITY (/login 6 images incl. the
 * 754x676 RGB -> Gray SMask pair; the six content routes + the 404 +
 * /demo the EMPTY-SET family); the landing's shared 13-key core (with
 * the 710x28x ±1px jitter bucket) + the registered superset + the
 * BYTE-IDENTICAL 716-byte N=3 ICC profile (the FIRST honest ICC
 * measurement — both sides, sha 7f19707f9846243d); the alternates:
 * default/error 6 images + the SMask pair, reset 1, signup/forgot 2 —
 * all five states identical across sides; the dashboard's authenticated
 * interior (4 images + the 1904x551 SMask pair) + fn 4/0 + the info
 * family values; THE FOUR LAWS all-zero on every public route; the
 * /Info VALUE layer at exact parity (Producer "u:Skia/PDF m153" +
 * Creator "u:Chromium" + the per-route Titles).
 */
import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

const DEMO_EMAIL = "demo@novaai.app";
const DEMO_PASSWORD = "Demo1234!";

const pdfFile = (name: string) => join(tmpdir(), `s56-pin-${name}.pdf`);

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

// ---------- THE D193 INSTRUMENT (the object-level image interior) ----------
type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};
type ImgEntry = {
  w: string; h: string; cs: string; filter: string;
  smask: { w: string; h: string; cs: string } | null; maskRef: string | null;
  hasIcc: boolean; hasSmask: boolean;
};
type IccEntry = { n: string; len: number; sha: string; obj: string };

const qpdfJson = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".s56.json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(readFileSync(jsonFile, "utf8")) as {
    qpdf: [unknown, Record<string, QpdfObj>];
  };
};
const dictOf = (o: QpdfObj | undefined | null) => o?.value ?? o?.stream?.dict ?? null;
const val = (v: unknown) => (v as { value?: unknown } | undefined)?.value ?? v;
const refNum = (r: unknown) =>
  typeof r === "string" ? (r.match(/^(\d+) \d+ R$/) || [])[1] : undefined;
const sortedJson = <T,>(arr: T[]) =>
  [...arr].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

/** THE THIRTY-FIRST SURFACE — the image XObject interior census at the
 *  OBJECT level: every image's dims/colorspace/filter + its resolved
 *  /SMask target + the ICC profile streams (SHAPE-BASED detection — the
 *  S54 refinement: Skia's profiles carry NO /Subtype). */
const imageInterior = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  const icc: IccEntry[] = [];
  const images: ImgEntry[] = [];
  for (const [key, o] of Object.entries(objs)) {
    const d = dictOf(o);
    if (!d) continue;
    const objNum = key.replace("obj:", "").replace(" 0 R", "");
    // the ICC profile streams — SHAPE-BASED (the key universe + stream
    // data; the /Subtype-keyed detector is BLIND to Skia's shape)
    if (
      d["/N"] !== undefined &&
      o?.stream?.data &&
      Object.keys(d).every((k) => ["/N", "/Length", "/Alternate"].includes(k))
    ) {
      const data = String(o.stream.data);
      icc.push({
        n: JSON.stringify(val(d["/N"])),
        len: data.length,
        sha: createHash("sha256").update(data).digest("hex").slice(0, 16),
        obj: objNum,
      });
    }
    if (d["/Subtype"] !== "/Image") continue;
    const csRaw = val(d["/ColorSpace"]);
    let cs = JSON.stringify(csRaw);
    if (Array.isArray(csRaw) && csRaw[0] === "/ICCBased") cs = "/ICCBased";
    let smask: ImgEntry["smask"] = null;
    const smaskRef = refNum(val(d["/SMask"]));
    if (smaskRef) {
      const sd = dictOf(objs[`obj:${smaskRef} 0 R`]);
      smask = {
        w: JSON.stringify(val(sd?.["/Width"])),
        h: JSON.stringify(val(sd?.["/Height"])),
        cs: JSON.stringify(val(sd?.["/ColorSpace"])),
      };
    }
    images.push({
      w: JSON.stringify(val(d["/Width"])),
      h: JSON.stringify(val(d["/Height"])),
      cs, filter: JSON.stringify(val(d["/Filter"]) ?? null),
      smask,
      maskRef: refNum(val(d["/Mask"])) ?? null,
      hasIcc: Array.isArray(csRaw) && csRaw[0] === "/ICCBased",
      hasSmask: smaskRef != null,
    });
  }
  const smaskPairs = images
    .filter((i) => i.smask)
    .map((i) => ({ img: `${i.w}x${i.h}:${i.cs}`, mask: `${i.smask!.w}x${i.smask!.h}:${i.smask!.cs}` }));
  return {
    imageCount: images.length,
    icc: sortedJson(icc),
    images: sortedJson(images),
    smaskPairs: sortedJson(smaskPairs),
  };
};

/** THE D194 INSTRUMENT — the four laws: /Decode + /DecodeParms on
 *  images, the BI/ID/EI inline-image operators in every stream, and the
 *  /demo print-gradient empty-set (shading/tiling pattern counts). */
const lawsCensus = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  let decode = 0, decodeParms = 0, biOps = 0, shading = 0, tiling = 0;
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d) continue;
    if (d["/Subtype"] === "/Image") {
      if (d["/Decode"] !== undefined) decode++;
      if (d["/DecodeParms"] !== undefined) decodeParms++;
    }
    if (d["/PatternType"] === 2) shading++;
    if (d["/PatternType"] === 1) tiling++;
    const s = o?.stream?.data;
    if (typeof s === "string") {
      const m = String(s).match(/(^|\s)BI(\s|$)/g);
      if (m) biOps += m.length;
    }
  }
  return { decode, decodeParms, biOps, shading, tiling };
};

/** THE RE-VERIFICATION — the /Info VALUE layer (the S49 record). */
const infoValues = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (d && d["/Producer"] !== undefined) {
      return {
        Producer: String(val(d["/Producer"])),
        Creator: String(val(d["/Creator"])),
        Title: String(val(d["/Title"])),
      };
    }
  }
  return null;
};

/** THE RE-VERIFICATION — the function fingerprint (the S55 record). */
const fnFingerprint = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  let through = 0, standalone = 0;
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d) continue;
    if (d["/PatternType"] === 2) {
      const sh = val(d["/Shading"]) as Record<string, unknown> | null;
      if (sh && typeof sh === "object" && sh["/Function"] != null) through++;
    }
    if (d["/FunctionType"] != null) standalone++;
  }
  return { through, standalone };
};

// ---------- the /login state drivers (the S50-S56 pattern) ----------
const PIN_EMAIL = "s56-pin@test.local";
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

// ---------- THE GENERATED CONSTANTS (research/gen-s56-spec-constants.js —
// ---------- the zero-transcription discipline; source: research/s56-pin.json)
const STABLE: Record<string, { imageCount: number; icc: unknown[]; images: unknown[]; smaskPairs: unknown[] }> = {
  "/login": {
    "imageCount": 6,
    "icc": [],
    "images": [
      {
        "w": "1168",
        "h": "168",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "1765",
        "h": "2696",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "329",
        "h": "329",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "413",
        "h": "413",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "754",
        "h": "676",
        "cs": "\"/DeviceGray\"",
        "filter": "null",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "754",
        "h": "676",
        "cs": "\"/DeviceRGB\"",
        "filter": "null",
        "smask": {
          "w": "754",
          "h": "676",
          "cs": "\"/DeviceGray\""
        },
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": true
      }
    ],
    "smaskPairs": [
      {
        "img": "754x676:\"/DeviceRGB\"",
        "mask": "754x676:\"/DeviceGray\""
      }
    ]
  },
  "/faq": {
    "imageCount": 0,
    "icc": [],
    "images": [],
    "smaskPairs": []
  },
  "/privacy": {
    "imageCount": 0,
    "icc": [],
    "images": [],
    "smaskPairs": []
  },
  "/terms": {
    "imageCount": 0,
    "icc": [],
    "images": [],
    "smaskPairs": []
  },
  "/refund": {
    "imageCount": 0,
    "icc": [],
    "images": [],
    "smaskPairs": []
  },
  "/access": {
    "imageCount": 0,
    "icc": [],
    "images": [],
    "smaskPairs": []
  },
  "/thankyou": {
    "imageCount": 0,
    "icc": [],
    "images": [],
    "smaskPairs": []
  },
  "/does-not-exist-404": {
    "imageCount": 0,
    "icc": [],
    "images": [],
    "smaskPairs": []
  },
  "/demo": {
    "imageCount": 0,
    "icc": [],
    "images": [],
    "smaskPairs": []
  }
};

const LANDING_CORE = {
  "liveCoreCount": 13,
  "liveCore": [
    "1047x105:\"/DeviceGray\"",
    "1047x105:\"/DeviceRGB\"+smask",
    "1165x103:\"/DeviceGray\"",
    "1165x103:\"/DeviceRGB\"+smask",
    "1920x1080:/ICCBased",
    "201x201:\"/DeviceGray\"",
    "201x201:\"/DeviceRGB\"+smask",
    "2025x534:\"/DeviceGray\"",
    "2025x534:\"/DeviceRGB\"+smask",
    "541x160:\"/DeviceGray\"",
    "625x245:\"/DeviceGray\"",
    "626x204:\"/DeviceGray\"",
    "710x28*:\"/DeviceGray\""
  ],
  "cloneSupersetStable": [
    "1x26:\"/DeviceRGB\"",
    "738x1:\"/DeviceRGB\"",
    "738x26:\"/DeviceRGB\""
  ],
  "cloneSupersetFrameDependent": [
    "201x1:\"/DeviceGray\"",
    "201x1:\"/DeviceRGB\"+smask"
  ],
  "cloneCountFloor": 16,
  "icc": [
    {
      "n": "3",
      "len": 716,
      "sha": "7f19707f9846243d",
      "obj": "5"
    }
  ]
};

const ALT_STATES: Record<string, { imageCount: number; icc: unknown[]; images: unknown[]; smaskPairs: unknown[] }> = {
  "default": {
    "imageCount": 6,
    "icc": [],
    "images": [
      {
        "w": "1168",
        "h": "168",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "1765",
        "h": "2696",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "329",
        "h": "329",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "413",
        "h": "413",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "754",
        "h": "676",
        "cs": "\"/DeviceGray\"",
        "filter": "null",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "754",
        "h": "676",
        "cs": "\"/DeviceRGB\"",
        "filter": "null",
        "smask": {
          "w": "754",
          "h": "676",
          "cs": "\"/DeviceGray\""
        },
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": true
      }
    ],
    "smaskPairs": [
      {
        "img": "754x676:\"/DeviceRGB\"",
        "mask": "754x676:\"/DeviceGray\""
      }
    ]
  },
  "error": {
    "imageCount": 6,
    "icc": [],
    "images": [
      {
        "w": "1168",
        "h": "168",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "1765",
        "h": "2927",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "329",
        "h": "329",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "413",
        "h": "413",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "754",
        "h": "675",
        "cs": "\"/DeviceGray\"",
        "filter": "null",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "754",
        "h": "675",
        "cs": "\"/DeviceRGB\"",
        "filter": "null",
        "smask": {
          "w": "754",
          "h": "675",
          "cs": "\"/DeviceGray\""
        },
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": true
      }
    ],
    "smaskPairs": [
      {
        "img": "754x675:\"/DeviceRGB\"",
        "mask": "754x675:\"/DeviceGray\""
      }
    ]
  },
  "reset": {
    "imageCount": 1,
    "icc": [],
    "images": [
      {
        "w": "1765",
        "h": "1609",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      }
    ],
    "smaskPairs": []
  },
  "signup": {
    "imageCount": 2,
    "icc": [],
    "images": [
      {
        "w": "1168",
        "h": "156",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "1765",
        "h": "1833",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      }
    ],
    "smaskPairs": []
  },
  "forgot": {
    "imageCount": 2,
    "icc": [],
    "images": [
      {
        "w": "1168",
        "h": "156",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "1765",
        "h": "1533",
        "cs": "\"/DeviceGray\"",
        "filter": "\"/DCTDecode\"",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      }
    ],
    "smaskPairs": []
  }
};

const DASHBOARD = {
  "interior": {
    "imageCount": 4,
    "icc": [],
    "images": [
      {
        "w": "1904",
        "h": "551",
        "cs": "\"/DeviceGray\"",
        "filter": "null",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "1904",
        "h": "551",
        "cs": "\"/DeviceRGB\"",
        "filter": "null",
        "smask": {
          "w": "1904",
          "h": "551",
          "cs": "\"/DeviceGray\""
        },
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": true
      },
      {
        "w": "24",
        "h": "7",
        "cs": "\"/DeviceRGB\"",
        "filter": "null",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      },
      {
        "w": "323",
        "h": "7",
        "cs": "\"/DeviceRGB\"",
        "filter": "null",
        "smask": null,
        "maskRef": null,
        "hasIcc": false,
        "hasSmask": false
      }
    ],
    "smaskPairs": [
      {
        "img": "1904x551:\"/DeviceRGB\"",
        "mask": "1904x551:\"/DeviceGray\""
      }
    ]
  },
  "fn": {
    "through": 4,
    "standalone": 0
  },
  "info": {
    "Producer": "u:Skia/PDF m153",
    "Creator": "u:Chromium",
    "Title": "u:Dashboard | SAAS Company"
  }
};

const LAWS_ALL_ZERO: Record<string, { decode: number; decodeParms: number; biOps: number; shading: number; tiling: number }> = {
  "landing": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 10,
    "tiling": 6
  },
  "login": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 3,
    "tiling": 0
  },
  "faq": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 0,
    "tiling": 0
  },
  "privacy": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 0,
    "tiling": 0
  },
  "terms": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 0,
    "tiling": 0
  },
  "refund": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 0,
    "tiling": 0
  },
  "access": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 0,
    "tiling": 0
  },
  "thankyou": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 0,
    "tiling": 0
  },
  "r404": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 0,
    "tiling": 0
  },
  "demo": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 0,
    "tiling": 0
  },
  "alt-default": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 3,
    "tiling": 0
  },
  "alt-error": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 3,
    "tiling": 0
  },
  "alt-reset": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 2,
    "tiling": 0
  },
  "alt-signup": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 2,
    "tiling": 0
  },
  "alt-forgot": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 2,
    "tiling": 0
  },
  "dashboard": {
    "decode": 0,
    "decodeParms": 0,
    "biOps": 0,
    "shading": 4,
    "tiling": 3
  }
};

const INFO_VALUES: Record<string, { Producer: string; Creator: string; Title: string }> = {
  "landing": {
    "Producer": "u:Skia/PDF m153",
    "Creator": "u:Chromium",
    "Title": "u:SAAS Company"
  },
  "login": {
    "Producer": "u:Skia/PDF m153",
    "Creator": "u:Chromium",
    "Title": "u:SAAS Company"
  },
  "faq": {
    "Producer": "u:Skia/PDF m153",
    "Creator": "u:Chromium",
    "Title": "u:FAQ | SAAS Company"
  },
  "privacy": {
    "Producer": "u:Skia/PDF m153",
    "Creator": "u:Chromium",
    "Title": "u:Privacy | SAAS Company"
  },
  "terms": {
    "Producer": "u:Skia/PDF m153",
    "Creator": "u:Chromium",
    "Title": "u:Terms | SAAS Company"
  },
  "refund": {
    "Producer": "u:Skia/PDF m153",
    "Creator": "u:Chromium",
    "Title": "u:Refund Policy | SAAS Company"
  },
  "access": {
    "Producer": "u:Skia/PDF m153",
    "Creator": "u:Chromium",
    "Title": "u:Accessibility | SAAS Company"
  },
  "thankyou": {
    "Producer": "u:Skia/PDF m153",
    "Creator": "u:Chromium",
    "Title": "u:Thank You | SAAS Company"
  }
};

const FN_FINGERPRINT = {
  "loginClone": {
    "through": 3,
    "standalone": 0
  },
  "loginLive": {
    "through": 3,
    "standalone": 0
  },
  "landingClone": {
    "through": 10,
    "standalone": 5
  },
  "landingLive": {
    "through": 14,
    "standalone": 7
  }
};

test.describe("the image XObject interior layer (Session 56 — D193, the thirty-first surface)", () => {
  test("the stable routes at OBJECT-LEVEL image-interior parity: /login 6 images + the SMask pair; the content routes + the 404 + /demo the empty-set family", async ({ page }) => {
    for (const [route, pin] of Object.entries(STABLE)) {
      await dwell(page, route);
      const f = await renderPdf(page, `s56-${route.replace(/\W/g, "")}`);
      const c = imageInterior(f);
      expect(c.imageCount, `${route} the object-level image count`).toBe(pin.imageCount);
      expect(c.icc, `${route} the ICC empty-set family`).toEqual(pin.icc);
      expect(c.images, `${route} the image interiors`).toEqual(pin.images);
      expect(c.smaskPairs, `${route} the SMask pairs`).toEqual(pin.smaskPairs);
    }
  });

  test("the landing: the shared 13-key core (the jitter bucket) + the registered form-nested superset + the BYTE-IDENTICAL ICC profile", async ({ page }) => {
    await dwell(page, "/");
    const c = imageInterior(await renderPdf(page, "s56-landing"));
    const jitter = (k: string) => k.replace(/^710x28[89]:/, "710x28*:");
    const keys = [...new Set(c.images.map((i) => jitter(`${i.w}x${i.h}:${i.cs}${i.hasSmask ? "+smask" : ""}`)))].sort();
    // (a) the live's stable 13-key core is a SUBSET of the clone's census
    //     (the shared family — the video poster, the logo-cloud DCT
    //     grays, the gradient-text/stripe SMask pairs, the glow jitter)
    for (const k of LANDING_CORE.liveCore) {
      expect(keys, `the shared core key ${k} present`).toContain(k);
    }
    // (b) the registered form-nested superset: the 3 stable slivers on
    //     EVERY render; the 201x1 pair frame-dependent (the floor 16)
    for (const k of LANDING_CORE.cloneSupersetStable) {
      expect(keys, `the stable superset key ${k} present`).toContain(k);
    }
    expect(c.imageCount, "the clone's object-level count >= the 16 floor").toBeGreaterThanOrEqual(LANDING_CORE.cloneCountFloor);
    // (c) THE FIRST HONEST ICC MEASUREMENT: the byte-identical 716-byte
    //     N=3 profile (both sides measured; the sha over the qpdf inline
    //     stream data — the same instrument both sides)
    expect(c.icc, "the landing's ICC profile — byte-identical across sides").toEqual(LANDING_CORE.icc);
    expect(c.icc.length, "exactly one ICC profile").toBe(1);
    expect(c.icc[0].len, "the 716-byte profile").toBe(716);
    expect(c.icc[0].n, "the N=3 component count").toBe("3");
  });

  test("THE FOUR LAWS: the /Decode + /DecodeParms + BI/ID/EI EMPTY-SETS on every public route + the /demo print-gradient EMPTY-SET + the /Info VALUE re-verification (the S49 record)", async ({ page }) => {
    const LAWS_ROUTES = ["/", "/login", "/faq", "/privacy", "/terms", "/refund-policy", "/accessibility", "/thank-you", "/demo", "/does-not-exist-404"];
    for (const route of LAWS_ROUTES) {
      await dwell(page, route);
      const f = await renderPdf(page, `s56-laws-${route.replace(/\W/g, "")}`);
      const l = lawsCensus(f);
      expect(l.decode, `${route} the /Decode empty-set`).toBe(0);
      expect(l.decodeParms, `${route} the /DecodeParms empty-set`).toBe(0);
      expect(l.biOps, `${route} the BI/ID/EI inline-image empty-set`).toBe(0);
      if (route === "/demo") {
        // the /demo print-gradient EMPTY-SET (the mockup's animated
        // gradients never paint at print time — the P5 probe)
        expect(l.shading, "/demo the shading-pattern empty-set").toBe(0);
        expect(l.tiling, "/demo the tiling-pattern empty-set").toBe(0);
      }
      // the /Info VALUE re-verification on the eight info-pinned routes
      const infoKey = route === "/" ? "landing" : route.replace(/^\//, "").replace(/-policy|-you/, (m) => m === "-policy" ? "" : "");
      const expectedInfo = INFO_VALUES[infoKey === "refund" ? "refund" : infoKey === "thankyou" ? "thankyou" : infoKey];
      if (expectedInfo) {
        expect(infoValues(f), `${route} the /Info values (the S49 record)`).toEqual(expectedInfo);
      }
    }
  });

  test("the five /login alternates' image interiors (default/error the full 6-image + SMask-pair set; reset 1; signup/forgot 2)", async ({ page }) => {
    const drivers: [string, (p: import("@playwright/test").Page) => Promise<void>][] = [
      ["default", enterDefault], ["error", enterError], ["reset", enterReset],
      ["signup", enterSignup], ["forgot", enterForgot],
    ];
    for (const [state, driver] of drivers) {
      await driver(page);
      const c = imageInterior(await renderPdf(page, `s56-alt-${state}`));
      expect(c.imageCount, `alt-${state} the image count`).toBe(ALT_STATES[state].imageCount);
      expect(c.icc, `alt-${state} the ICC empty-set`).toEqual(ALT_STATES[state].icc);
      expect(c.images, `alt-${state} the image interiors`).toEqual(ALT_STATES[state].images);
      expect(c.smaskPairs, `alt-${state} the SMask pairs`).toEqual(ALT_STATES[state].smaskPairs);
    }
  });

  test("the determinism law: the /login image interior byte-identical across re-renders (the D181 discipline)", async ({ page }) => {
    await dwell(page, "/login");
    const a = imageInterior(await renderPdf(page, "s56-det-a"));
    await dwell(page, "/login");
    await page.waitForTimeout(400);
    const b = imageInterior(await renderPdf(page, "s56-det-b"));
    expect(JSON.stringify(b), "the /login interior deterministic across re-renders").toBe(JSON.stringify(a));
  });

  test("the dashboard's authenticated interior + the fn fingerprint (the S55 record) + the info family values — the authenticated context LAST (the context-order law)", async ({ page }) => {
    await dwell(page, "/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    const dashFile = await renderPdf(page, "s56-dash");
    const c = imageInterior(dashFile);
    expect(c.imageCount, "dashboard the object-level image count").toBe(DASHBOARD.interior.imageCount);
    expect(c.images, "dashboard the image interiors (the 1904x551 SMask pair + the chart stripes)").toEqual(DASHBOARD.interior.images);
    expect(c.smaskPairs, "dashboard the SMask pairs").toEqual(DASHBOARD.interior.smaskPairs);
    expect(c.icc, "dashboard the ICC empty-set").toEqual(DASHBOARD.interior.icc);
    // the S55 function fingerprint holding (4 brand-gradient exponentials,
    // zero standalone)
    expect(fnFingerprint(dashFile), "dashboard the fn fingerprint (the S55 record)").toEqual(DASHBOARD.fn);
    // the info family values (the authenticated route carries the public
    // contract + its own Title)
    expect(infoValues(dashFile), "dashboard the /Info values").toEqual(DASHBOARD.info);
  });
});
