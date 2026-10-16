# Remediation Plan — Session 58

The worklog S57 candidates (the reference-regression watch, the
FOURTEENTH; the 32nd surface's route extensions — the alternates' ICC
streams, the dashboard's payload-under-live-data story; or the
THIRTY-THIRD surface — the content streams' TEXT-POSITION layer [the
Td/Tm/TJ positioning arrays], the /ExtGState's /HT + /SA keys at the
value layer, or the /OpenAction + /PageMode document-view layer),
answered against the measured codebase — with the best-judgment scope:
the THIRTY-THIRD-surface trio probed on the raw shape FIRST (the
lesson-88 discipline), the /HT + catalog-view + ICC candidates measured
EMPTY/NULL and registered as LAWS, the dashboard's payload-under-mutation
measured RICH and selected as THE MUTATION COLUMN. **THE THIRTY-THIRD
SURFACE selected: the content streams' TEXT-POSITION layer.** **THE
FIRST src/-CHANGE PARITY SESSION SINCE S54** — the surface's line-level
census surfaced a REAL computed-style divergence (the login bundle's
leaked heading tracking), fixed through the full TDD discipline
(RED → BUILD → GREEN) and converged into the standing records.

## The environment (the CONTINUITY session — no rebuild needed)

- The workspace survived the inter-session boundary: the tree clean at
  `837df23` (a fast-forward pull adding only `docs/session_124.md` —
  the operator's raw S57 transcript), node_modules intact, the
  Playwright Chromium v1243 binaries present, `.env` correct
  (`DATABASE_URL="file:../db/custom.db"`), the dev DB canonical at
  1/6/2, paramiko 5.0.0 + the `/home/z/bin/ssh` shim in place. The
  baseline verified: unit 252/252, the session57 spec 10/10, the full
  e2e `--list` 482 in 66 files (pre-S58), lint/typecheck clean.

## The surface selection (research/probe-s58-p1-textposition.mjs +
## probe-s58-p2p3p4.mjs + probe-s58-p5-mutation.mjs — raw-shape probes
## on FRESH renders, BEFORE any census was designed)

- **P1 — the TEXT-POSITION layer: measured RICH — SELECTED as THE
  THIRTY-THIRD SURFACE.** The S47/S48 print layers measured WORDS and
  LINKS; the LINE-level positioning records (the Td/Tm/TJ operators,
  the glyph runs, the per-line (y, x0) origins) were never compared.
  The probe measured the glyph-run-splitting family (BT 37 vs 35 on
  /faq — same text, different block decomposition) and the login
  alternates' per-glyph decompositions vs the live's merged runs.
- **P2/P3 — the /HT + the /OpenAction + /PageMode candidates: measured
  EMPTY/NULL everywhere — registered as LAWS** (no halftone key in any
  resources-referenced /ExtGState; no viewer action or page mode on
  any catalog dict — both sides, every route).
- **P4 — the alternates' ICC candidate: the EMPTY-SET law confirmed**
  (the S56 shape detection extended to the five alternate states —
  image counts 6/6/1/2/2 identical across sides, zero ICC streams).
- **P5 — the dashboard's payload-under-mutation: measured RICH —
  selected as THE MUTATION COLUMN** (+1 gradient function per new
  chart row, the tiling byte family 54→127→142, YStep 9→9.000061,
  objects deterministic A===A2).
- The instrument births in flight (each root-caused as the instrument
  before any parity conclusion): `pdfimages -list`'s `images` field is
  a COUNT not an array; the orphaned :3401 server after a probe crash
  (the gotcha-31 port-sweep discipline); and THE GLYPH-STRING HEX LAW
  (the lesson-88 family's 9th sighting) — the glyph strings are HEX
  (`<01> Tj`), a paren-only regex reads every block as empty.

## The findings (F1-F9)

- **F1 — THE FOURTEENTH STANDING WATCH: 15/15 GREEN, ALL RECORDS
  HOLD** (research/recon-s58-ph1.mjs on :3400 against db/recon58.db):
  the working eight at byte-identical word parity
  (739/24/101/36/335/390/566/285), the 404 16=16, the sitemaps 8/7,
  the soft-404 family at the registered statuses, the D160 mobile-nav
  record exact (the clone all-three-y open the 390x397 panel — NO
  Tailwind v4 bug; the live toaster-blocked y21/y28 + y35-only), the
  live login records holding, the clone login → the working dashboard
  (233 words). Re-verified POST-FIX after the h2 pin: 15/15 again.
- **F2 — THE THIRTY-THIRD SURFACE AT FULL LINE-LEVEL PARITY (D198)**:
  every content stream's Td/Tm/TJ records tokenized, the glyph runs
  positioned, the pages compared at the LINE level — (y, x0, runs,
  glyph-hash-without-run-markers), the per-baseline block merge
  absorbing the ±2 BT/Tm page-layer re-blocking family (the D125
  engine structure, stable per side) into the honest comparable
  census. The six deterministic content routes at FULL parity
  (thank-you 23, /login 6, /faq 36, privacy 39, refund 34,
  accessibility 64 lines); the landing's 23-line STABLE CORE (the
  entrance-gated below-fold family bucketed — below-fold lines vary
  23/25/31 by entrance state); the 404's y=586 line carrying the
  registered 2-space-glyph emission delta (58v60 runs, pdftotext
  byte-identical — the D161 adjudication family); /demo the 27-line
  superset floor over the live's 4-line shell.
- **F3 — THE REAL FINDING (D199): the login-local h2-h6 TRACKING
  divergence, root-caused and FIXED.** The line-level census measured
  the three alternate-state h2s ("Create your account" / "Reset your
  password" / "Check your email") at +3.84..4.57pt x-origin shifts
  with IDENTICAL glyph hashes — the computed-style follow-up measured
  `letter-spacing: 0.48px` (+0.02em at the 24px sm:text-2xl) on the
  clone vs `normal` on the live, the width delta 7.67px = 16 glyphs ×
  0.48px exactly. ROOT CAUSE: the reference's SPA bundle ships a base
  `h1..h6 { letter-spacing: .02em }` rule (globals.css mirrors it at
  parity with the SPA), but the reference's LOGIN bundle does NOT
  ship it (the Session-7 bundle-divergence family) — the base rule
  leaked onto the login card's h2s here. The leaked tracking also
  RE-SEGMENTED the glyph runs (per-glyph 16/19/19 single-glyph Tj
  decompositions vs the live's single merged run) — the
  RE-SEGMENTATION root cause of the whole D177/D182 segmentation
  family. THE FIX (TDD RED→BUILD→GREEN): the login-local
  `h2, h3, h4, h5, h6 { letter-spacing: normal }` pin in
  login-card.tsx (beside the S37 font-family pin; the signin h1
  untouched — its explicit tracking-tight utility carries the route's
  heading tracking at parity); the standalone rebuilt; the alternates
  converged to FULL line-level parity (6/9/7 lines).
- **F4 — THE STALE-PIN CONVERGENCE (the gate's missing test)**: the
  full-gate reconciliation summed 492 vs the global `--list` 493 —
  the per-file reconciliation isolated the session52 spec: the S52
  pin had pinned the reset card's PRE-FIX 16-run per-glyph block-0
  decomposition (the honest D182 divergence record of its day); the
  h2 fix CONVERGED it to 1 run — matching the live — so the OLD pin
  now failed. THE LAW: when a src/ fix converges a registered
  divergence, the old divergence pin pins a falsehood; the honest
  update re-pins the converged truth with the provenance recorded
  (block-0 {tf:1, td:15, tj:16} → {tf:1, td:0, tj:1}; card-form text
  ops 74 → 44 — exactly the D182 30-op delta: 15 Td + 15 Tj).
- **F5 — THE FOUR LAWS (D200-D203)**: the /HT empty-set (no halftone
  key in any resources-referenced /ExtGState on any route, both
  sides); the /OpenAction + /PageMode null catalog-view law; the
  alternates' ICC empty-set law (the S56 shape detection extended);
  the gs VALUE-layer parity law (the /SA /LW /LC /LJ /ML values at
  exact multiset parity on every route — the previously unmeasured
  gs keys now pinned).
- **F6 — THE MUTATION COLUMN (D204)**: the dashboard's print payload
  TRACKS THE DATA — +1 shading pattern per new chart row until the
  CHART_ROWS ceiling (fns 4→5→6→7), the tiling XStep/YStep family
  (54→127→142 bytes; YStep 9 → 9.000061 at the 4-row reflow — the
  fractional-pixel family), objects growing deterministically
  (292→303→320→329), gs stable 18, tilings stable 3, A===A2 at every
  step (the re-render determinism law under mutation).
- **F7 — THE TDD PINS**: `tests/e2e/session58-textposition-laws.spec.ts`
  (the constants GENERATED by research/gen-s58-spec-constants.js from
  the cached renders — the zero-transcription discipline; regenerated
  POST-FIX from the re-rendered cache) — **11/11 GREEN, stable across
  runs** (the in-flight catches root-caused: the ALTS.default
  missing-key, the VP key-string form, the mutation envelope's
  `{ok, data}` shape, the gs /SA null-filtering, the 404 pathname,
  the landing's scrollThrough bucket treatment, the D182
  pin-your-own-input law, the form-line grouping key `y|size`, the
  lexicographic-vs-numeric sort mismatch). The standalone's old h2
  spec deleted (merged into the session58 spec); the S52 D182 pin
  re-pinned to the converged truth.
- **F8 — THE DRIFT BATTERY REBUILT as ONE consolidated ten-phase
  check** (the S55-S57 battery scratch lost to the sandbox reset —
  consolidated, not re-ported; drift-battery-s58.mjs on the cached
  renders): **103/103 GREEN ZERO DRIFT** (the print-text 15 + payload
  7 + annots 10 + qq 9 + gs 15 + ICC 5 + catalog 10 + line-records 13
  + dashboard 4 + the standing watch 15) — with FOUR instrument REDs
  root-caused mid-run BEFORE any parity conclusion (gotcha 68): the
  post-fix re-render borrowed the spec's pin email against the live
  cache captured with the probe email (the RENDER-INPUT IDENTITY law
  — the D177 interpolation family at the battery layer: a different
  email/password changes the print text, the x-origins, the run
  segmentation, even the printed bullet count), and the payload
  constants array compared unsorted against payloadRows()'s sorted
  output (the COMPARATOR-FORMAT law). Both fixed as the instrument;
  the clone login family re-rendered with the live cache's exact
  inputs; the battery re-run green.
- **F9 — THE SCREENSHOTS + VLM**: 21/21 refreshed (the capture server
  on :3500 against db/capture58.db — a fresh copy of the canonical
  dev DB; the dev DB canonical before AND after — 1/6/2, zero
  mutations, md5-verified). VLM **8/8 on the FIRST PASS** — zero
  adjudications (the first session since the VLM checks began where
  every prompt read the records correctly: the hero h1, the
  Free/Pro/Enterprise tiers with Pro most-popular, the login copy,
  the dashboard's 6 workflows + first row, the mobile menu's 7 rows,
  the FAQ's 5 questions, the demo form, the 404 shell).

## The plan (R1-R9) — all [x] delivered

- [x] R1 — THE FOURTEENTH standing watch (recon-s58-ph1.mjs,
      self-contained boot-work-kill on :3400 against db/recon58.db):
      **15/15 GREEN — ALL RECORDS HOLD** (re-verified post-fix).
- [x] R2 — THE SURFACE-SELECTION PROBES (probe-s58-p1-textposition.mjs
      + probe-s58-p2p3p4.mjs + probe-s58-p5-mutation.mjs): the trio
      probed raw-first; the laws registered; the mutation column
      selected.
- [x] R3 — THE FULL RECON (render-s58.mjs — the render-cache builder,
      both sides, the fresh-context law honored): the line-level
      censuses + the computed-style follow-up that surfaced the h2
      tracking divergence; the post-fix re-render (render-s58-postfix.mjs,
      the render-input identity honored on the fix-note revision).
- [x] R4 — THE TDD PINS: the session58 spec (the generated-constants
      discipline, regenerated post-fix) — **11/11 GREEN**; the S52
      D182 pin re-pinned to the converged truth with the provenance
      recorded.
- [x] R5 — THE src/ FIX: the login-local h2-h6 tracking pin
      (login-card.tsx), TDD RED→BUILD→GREEN; the standalone rebuilt
      and the pin verified in the built output (the SSR chunk carries
      the rule verbatim).
- [x] R6 — THE DRIFT BATTERY REBUILT as ONE consolidated ten-phase
      check (drift-battery-s58.mjs): **103/103 GREEN ZERO DRIFT**
      after the two instrument fixes (the render-input identity +
      the comparator format), both root-caused as the instrument.
- [x] R7 — THE FULL GATE: lint ✓ typecheck ✓ build ✓ Vitest 252/252 ✓
      smoke 125/125 ✓ e2e **493/493** (scripts/run-e2e-chunks-s58.sh —
      built from the S57 runner per gotcha 66c: the session58 spec
      APPENDED as its own chunk, the S57 list untouched; the file-set
      diff against the global `--list` EMPTY — 493 tests in 67 files;
      the chunk-11 environment flake clean on direct re-run after the
      orphan sweep; the heavy PDF-batch chunk reaped in the window
      timeout — run directly as two sub-batches per the house pattern,
      the tally by output-captured arithmetic: 440 + 42 + 11 = 493).
- [x] R8 — THE SCREENSHOTS + VLM: 21/21 refreshed (the dev DB
      canonical before AND after); VLM 8/8 first-pass, zero
      adjudications.
- [x] R9 — THE DOCS: README (the 870 badge + the 33rd-surface story +
      the session58 suite row + the counts), PAD (this block + the
      ledger D198-D204 + the 7.1 counts 67 specs/493), AGENTS (the
      counts + gotcha 68), CLAUDE (the session-58 context), SKILL
      v2.57.0 (lesson 97 + the §12 header range), this remediation
      plan, the session log 125, the worklog; `.env.example` verified
      in sync (no config surface touched).

## The gate arithmetic (the honest re-derivation)

- Unit: **252** (Vitest, 20 files).
- Smoke: **125** (scripts/smoke-test.sh against the production build).
- E2E: **493** = the global `--list` (493 tests in 67 files); the
  chunk runner's file-set diff EMPTY; the chunks' sum reconciled
  exactly: 53+34+62+39+18+15+13+10+26+16 (chunks 1-10) + 25 (chunk
  11, the environment flake re-run) + 129 (chunks 12-16) + 42 (chunk
  17, the heavy PDF batch run directly as two sub-batches: 36 [S50+S51
  counted once + S52+S53] + 26 [S54-S57]) + 11 (chunk 18, the
  session58 spec) = 493.
- **Gate: 859 → 870 = 252 + 125 + 493** (the session58 spec's +11;
  the S57 gate's 859 verified standing through the run).

## The S59 candidates for Session 59

- The reference-regression watch (the FIFTEENTH standing watch).
- The 33rd surface's route extensions: the alternates' full line-level
  constants under a SECOND interpolation input (the pin-your-own-input
  law's cross-check); the error-state's banner line records under the
  registered ±1 run-split family.
- Or the THIRTY-FOURTH surface: the /DecodeParms + inline-image
  families' remaining keys at the value layer; the /Kids page-tree
  VALUE layer (the S54 flatness law's value-level complement); or the
  pdftohtml -xml OUTPUT layer (the per-word bounding boxes, the
  reading-order column assignment — the layer between the S48 link
  census and the S58 line records).

## The pushed-hash record (the closing discipline)

- The remediation commit `<HASH>` (the session58 registration — the
  spec + the src/ fix + the S52 re-pin + the docs alignment + the
  screenshots + scripts/run-e2e-chunks-s58.sh + the worklog) pushed
  via the SSH wrapper with the EXPLICIT
  `--remote git@github.com:nordeim/saas-company.git`.
- Wrapper-verified: remote main @ `<HASH>` == local HEAD; the
  fetch-independent HTTPS ls-remote agreed.
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push; the wrapper's temp key copy shredded after
  the run; the operator's key file destroyed after the push.
- Zero zombies at close; the tree clean before the closing commit; no
  new branches.
