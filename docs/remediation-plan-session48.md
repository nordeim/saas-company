# Remediation Plan — Session 48

The worklog S47 candidates (the reference-regression watch, the
twenty-second surface's ROUTE EXTENSIONS — the print-text on the
remaining routes and the entrance census on /login + /demo — or the
twenty-third surface: the print-to-PDF LINK layer, the font-embedding
layer, or the viewport-orientation surface), answered against the
measured codebase — PLUS the session's own headline: a BUILD-PIPELINE
FONT DRIFT that broke the production build on the pulled tree. The
baseline is the Session-47 tree (gate 777 = 252 unit + 125 smoke +
400 e2e; the drift battery TWENTY-TWO surfaces, 17 checks, zero drift
on the first run — `docs/session_102.md`).

## The recon (research/recon-s48.mjs, six phases + adj-s48a/b) — all
## candidates measured BEFORE the contracts were designed

- **F0 — THE BUILD-PIPELINE FONT DRIFT (the session's headline, found
  at the baseline gate).** The pulled tree FAILED `npm run build` with
  16 Turbopack module-not-found errors, every one at
  `[next]/internal/font/google/playfair_display_55235e5f.module.css`:
  `Can't resolve '@vercel/turbopack-next/internal/font/google/font'` /
  `next/font/google queries have exactly one entry`. ROOT CAUSE (an
  EXTERNAL drift under a pinned toolchain): Google's css2 endpoint NOW
  dedupes every requested wght of Playfair Display to the SAME
  variable-font gstatic URL (measured 2026-10-13: the 400/500/600/700
  @font-face blocks all reference one woff2), so `weight:
  ["400","500","600","700"]` produces four @font-face src lines sharing
  one URL query — and Next 16.4.0's Turbopack
  NextFontGoogleFontFileReplacer asserts exactly one import-map entry
  per query. The S46/S47 builds passed because Google's CSS serving
  differed then (the moving-target law, gotcha 7 — now at the BUILD
  pipeline layer). THE FIX: `weight: "variable"` (the semantically
  correct selection for a variable font; the range request returns ONE
  @font-face per subset covering every weight). RENDERING UNCHANGED,
  verified three ways: the family still registers as `Playfair Display`
  (the built CSS: `font-family:Playfair Display;font-weight:400 900`),
  the wordmarks' 500/700 weights resolve through the same variable file,
  and the typography-parity suite + the full 777 gate pass on the fixed
  tree. DM Serif Display is unaffected (static 400; distinct
  normal/italic URLs). The discrete-weight form `weight: "400 700"` is
  REJECTED by Turbopack's own validator ("Unknown weight 400 700…
  Available weights: … variable") — "variable" is the accepted token.
- **R1 — the reference-regression watch (BOTH sides).** The working
  eight re-probed at exact word parity (739/101/335/390/566/285/36/24
  — every value byte-identical to the S45/S46/S47 record); the soft-404
  statuses at the registered family (/pricing live 200 soft-404 +
  clone 404; /dashboard live 200 soft-404 + clone 307 login-gate;
  /checkout live 200 soft-404 + clone 404; /demo live 200 soft-404 +
  clone 200 working); the sitemaps at the registered sets (live 7,
  clone 8 — the strict superset). **NO RECOVERY, NO NEW REGRESSION.**
- **R2 — the print-text ROUTE EXTENSIONS (the 22nd surface's growth).**
  Four more routes at EXACT PDF word parity: /terms 400 = 400,
  /accessibility 584 = 584, /refund-policy 295 = 295, and the 404
  (a bogus path) 16 = 16. /demo: the clone 101 vs the live's 16-word
  SPA-shell 404 — the registered working-superset route (never fix
  toward the shell). The print-text layer now covers ALL public routes.
- **R3 — the TWENTY-THIRD SURFACE (the print-to-PDF LINK layer) — AT
  FULL PARITY ON ITS FIRST MEASUREMENT.** Two instruments agree
  (pymupdf `get_links()` in the recon; poppler `pdftohtml -xml` for the
  e2e-embeddable pin — the same poppler family as the S47 pdftotext
  precedent, no python dependency in the test layer):
  - The URI census (origins stripped): byte-identical sets AND
    multiplicities on 9 of 10 probed routes — the landing `{/: 8,
    /faq: 9, /privacy: 1, /terms: 1, /accessibility: 1, /refund-policy:
    1}` + 48 internal named destinations (`pricing`×18, `features`×9,
    `how-it-works`×8, `testimonials`×8, unnamed×5); /faq, /privacy,
    /terms, /refund-policy at 14 links each (the nav + footer set);
    /accessibility 16; /thank-you exactly ONE link (→ /); /login and
    the 404 at the EMPTY SET (zero link annotations — the login
    bundle's bare card carries buttons, not anchors).
  - The pdftohtml census (text-run level, `<a href>` elements):
    byte-identical across sides on every probed route (e.g. the landing
    `#5×24, #6×19, /faq×12, #4×11, #7×9, #1×6, /refund-policy×2,
    /terms×1, /privacy×1, /accessibility×1, /×1`).
  - The page counts paired (8/1/2/2/2/3/2/2/1 — the S42 records hold).
  - /demo: the clone's 14 links vs the live's ZERO — the live's
    SPA-404 shell carries no anchors; the registered superset family.
- **R4 — the mobile-nav D160 re-verification (the operator's standing
  focus): THE RECORD HOLDS EXACTLY** (the fourth consecutive session).
  The clone's burger opens at EVERY point (y20/y28/y36 all open, the
  identical panel contract — the bg-black/95 blur panel, 6 anchor rows
  at 44px + the Log In row). The live's burger: y20 BLOCKED, y28
  BLOCKED (the two dormant react-hot-toast containers, `fixed top-0
  z-[100]`, still sitting over the icon — the overlay census
  re-measured), y36 OPENS. TWO INSTRUMENTATION LAWS learned in flight:
  (a) an aria-keyed panel detector is BLIND on the live (its burger
  carries no aria-expanded — the S41 a11y-trio superset record); the
  honest instrument is the ROW-CONTRACT detector (the bg-black/95 +
  backdrop-blur container passing the rendered-ness BOX check); (b) the
  live's SPA attaches the burger's click handler at HYDRATION — a
  click at domcontentloaded+700ms silently no-ops; networkidle + a
  1s dwell is the minimum honest wait (adj-s48b's proof).
- **R5 — the entrance census on /login + /demo: the EMPTY SET on BOTH
  sides** (zero inline opacity-0/translateY carriers on either route,
  either side) — parity at the empty set (the S42 pattern), no build.
- **R6 — the live's authenticated /dashboard: the SPA-404 record
  holds** (the operator login lands at `/`; /dashboard renders the
  16-word SPA 404, h1 "404" — the fourth consecutive session).
- **The Phase-4 standing verification: ALL GREEN** (robots, the sitemap
  at 8 URLs with /login excluded, og-image.png 200 image/png 85,730B,
  the JSON-LD blocks — WebSite + Organization + SoftwareApplication on
  /, FAQPage + BreadcrumbList on /faq — canonical + twitter:url, the
  four security headers, the .env/.env.example key-set identical,
  DATABASE_URL="file:../db/custom.db").

## The adjudicated session scope

A **BUILD-FIX + MEASUREMENT + VERSIONING session** (the S42/S46
pattern, plus the font fix): the twenty-third surface measured at full
parity on its first run (no clone gap to build), the print-text layer
extended to full route coverage at parity, and the session's one build
(the font fix) already landed at the baseline gate. The scope:

1. **THE FONT-BUILD REGRESSION PIN:** the built CSS's Playfair
   @font-face contract (the family + the `400 900` weight range + the
   woff2 src) — so a future regression to discrete weights (or a
   silent Google-side change that re-breaks the build) surfaces as a
   RED test, not a broken pipeline.
2. **THE PRINT-TEXT EXTENSION PINS:** the four new routes' exact PDF
   word counts (400/584/295/16) + the /demo superset floor.
3. **THE TWENTY-THIRD SURFACE (the PDF LINK layer):** pinned with the
   poppler instrument — the per-route link censuses (the URI sets +
   the internal-anchor sets, both at measured parity), the /thank-you
   single-link contract, the /login + 404 empty sets, the /demo
   superset.
4. **THE ENTRANCE EMPTY-SET on /login + /demo** (the 22nd surface's
   route growth closed).
5. **The standing verifications:** the battery (both sides' truth,
   gaining the link-layer column), the screenshots, the docs
   alignment.

New ledger records **D167–D170** (below). No registry growth (no new
head tags or DOM attributes — the link layer lives in the PDF pipeline
and the PAD's deviations ledger).

- **D167 — the build-pipeline font drift:** Google's css2 weight-dedupe
  + the Turbopack 16.4.0 exactly-one-entry assertion broke the
  production build on a code-untouched tree; fixed with
  `weight: "variable"`; the rendering contract unchanged (verified at
  the gate + the typography suite).
- **D168 — the print-text route extensions:** /terms 400, /accessibility
  584, /refund-policy 295, the 404 16 — all exact; /demo 101 the
  working superset; the 22nd surface now covers every public route.
- **D169 — the PDF LINK layer (the 23rd surface):** the URI + internal
  anchor censuses at byte parity on 9/10 routes (the landing's 69
  annotations incl. the 48 named destinations; the content routes'
  nav+footer sets; /thank-you's single link; the /login + 404 empty
  sets); /demo the documented superset; the page counts paired.
- **D170 — the /login + /demo entrance empty-set + the D160 fourth
  re-verification + the two instrumentation laws** (the aria-blind
  detector; the hydration-timing click law).

## The ToDo list (TDD — the spec pins the CLONE side; the battery
## asserts both sides' truth)

- [x] F1 — `tests/e2e/session48-pdflinks-buildfix.spec.ts`:
      (a) THE FONT PIN — the built stylesheet's Playfair @font-face
      carries `font-family:Playfair Display` with `font-weight:400 900`
      and a woff2 src (the variable registration — the build-fix
      regression pin; read from the served CSS chunk, never a build
      artifact path);
      (b) THE PRINT-TEXT EXTENSIONS — /terms 400, /accessibility 584,
      /refund-policy 295, the bogus-path 404 16 (pdftotext, the S47
      helper), /demo ≥ 95 (the superset floor, never the live's 16);
      (c) THE LINK-LAYER PINS — the pdftohtml census per route:
      /thank-you exactly `/`×1; /login + the 404 the empty set; /faq
      the nav+footer set (contains /faq×4, /refund-policy×4, /terms,
      /privacy, /accessibility, + internal anchors); the landing the
      full measured census (the URI set + the internal #page anchors);
      /demo ≥ 10 links (the superset floor);
      (d) THE ENTRANCE EMPTY-SET — zero inline motion carriers on
      /login + /demo;
      (e) THE PAGE-COUNT pairing — the landing 8, /login 1, /faq 2
      (the S42 records re-verified through the link instrument).
- [x] F2 — `research/drift-battery-s48.mjs`: the S47 battery + the
      LINK-LAYER column (paired: the pdftohtml censuses on the five
      core routes, origin/file-prefix normalized, both sides) — GREEN,
      ZERO DRIFT expected.
- [x] F3 — the full gate re-run on the clean build — **777 + N checks
      ALL GREEN** (252 unit + 125 smoke + [400 + N] e2e; lint/typecheck/
      build clean, the instrumentation.ts warning the known standing
      one).
- [x] F4 — the screenshot refresh (the standing 21; DB canonical before
      AND after; the gotcha-44 scroll-through pass; the S46/S47
      route-abort + PATCH-fulfillment disciplines) + the VLM standing
      checks — PASS expected.
- [x] F5 — the docs alignment: PAD (the revision block, the ledger
      D167–D170, section 7 counts, the gate line), AGENTS (the counts
      + gotcha 58 — the build-pipeline drift law: an EXTERNAL supplier
      can break a pinned toolchain with zero local changes; diagnose
      through the supplier's CURRENT responses, fix at the CORRECT
      semantic layer (the variable-font selection), and pin the
      rendered contract so the next drift surfaces RED + the two
      mobile-nav instrumentation laws), CLAUDE (the session-48
      context), README (the badge + the font-drift story + the rows),
      SKILL v2.47.0 (lesson 87: the build-pipeline drift + the
      variable-weight fix + the link-layer instrument), .env.example
      verified in sync (no config surface touched), the remediation
      plan session48 (this file, ticked), the session logs
      (session_104 curated + session_105 raw per the house numbering),
      the worklog.
- [x] F6 — the commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding).

## The measured record (the session's adjudications, beyond the plan)

- **The baseline gate on the PULLED tree was RED at the build step**
  (the font drift) — the first session since the toolchain pinning
  whose baseline needed a fix before the gate could run. Lint,
  typecheck, and the 252 unit checks passed pristine; the build/smoke/
  e2e layers ran on the fixed tree: **777/777 ALL GREEN** (252 + 125 +
  400, the e2e in nine chunks).
- **The font fix's rendering proof:** the built CSS carries
  `@font-face{font-family:Playfair Display;font-style:normal;
  font-weight:400 900;font-display:swap;src:url(../media/…-s.….
  woff2)format("woff2");unicode-range:…}` ×4 subsets + the DM Serif
  faces unchanged (4 + fallback) + the Vend Sans pair — 12 @font-face
  total; the preload links present; the typography-parity wordmark
  suite green (the computed families unchanged).
- **The 23rd surface needed NO build** — the first surface since the
  battery's S38 loop column to measure at full parity on its first
  run (the S45 pattern: registration, not remediation).
- **The two mobile-nav instrumentation laws** (recorded in D170):
  the aria-keyed detector's live-blindness, and the hydration-timing
  click law (networkidle + dwell before ANY live-side interaction
  probe).
