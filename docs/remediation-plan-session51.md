# Remediation Plan — Session 51

The worklog S50 candidates (the reference-regression watch; the 25th
surface's ROUTE EXTENSIONS — the /login alternates' error + reset-success
states, the dashboard's authenticated print story; or the twenty-sixth
surface — the PDF's vector/scratch layer, the print-time animation frame
contract, or the accessibility-tree layer at print), answered against the
measured codebase — with the best-judgment scope: **ALL THREE candidates
delivered in one pass** — the vector/scratch layer as the 26th surface's
core (the content-stream operator census through qpdf --json), the /login
alternates' error + reset-success print story as the 25th surface's route
extensions (which exposed THE FIRST CLONE-GAP BUILD SINCE SESSION 47: the
reset-success view's missing MAIL-ICON BADGE), and the dashboard's
authenticated print story as the clone-side registration — plus the
mobile-nav + login standing records re-verified for the seventh
consecutive session. The baseline is the Session-50 tree at `5b9536f`
(gate 806 = 252 unit + 125 smoke + 429 e2e; the drift battery twenty-five
surfaces, 66 checks, zero drift — `docs/session_109.md`).

## The recon (research/recon-s51.mjs, five phases + the prototype
## instruments — all candidates measured BEFORE the contracts were
## designed)

- **R1 — the reference-regression watch (BOTH sides).** The working
  eight re-probed at exact word parity (739/101/335/390/285/566/36/24 —
  every value byte-identical to the S45-S50 record); the soft-404
  statuses at the registered family (/pricing live 200 soft-404 + clone
  404; /dashboard live 200 soft-404 + clone 307 login-gate; /checkout
  live 200 soft-404 + clone 404; /demo both 200 working); the sitemaps
  at the registered sets (live 7, clone 8 — the strict superset).
  **NO RECOVERY, NO NEW REGRESSION.**
- **R2 — the 25th surface's ROUTE EXTENSIONS: the /login ERROR +
  RESET-SUCCESS states' print story — ONE AT FULL PARITY, ONE CARRYING
  THE REAL GAP.**
  - The ERROR state (a real wrong-password submit → the red alert
    banner): **FULL PARITY** — fonts DejaVuSans 2× + Bold 1× (the
    system-stack census), metadata identical (Title "SAAS Company",
    Pages 1, the standard family), the link census the empty set, the
    print text 30 = 30 words, and the image census 6 = 6 byte-identical
    — with the STATE-TRACKED RASTER record extended: the error banner
    grows the card to the 1765x2927 raster (vs the default's 2696) on
    BOTH sides exactly.
  - The RESET-SUCCESS state (the forgot flow → "Check your email" +
    the green alert): words 31 = 31, fonts identical, metadata
    identical, links the empty set — but the IMAGE census reads
    **1765x1359 (clone) vs 1765x1609 (live)**: a 250pt/3.125 = **80
    CSS px card-height delta**. ROOT-CAUSED through the DOM deep-walk:
    **the live's reset-success view carries a MAIL-ICON BADGE the
    clone is missing** — `div.mx-auto.w-14.h-14.sm:w-16.sm:h-16
    .bg-slate-100.rounded-full.flex.items-center.justify-center`
    (64×64 at ≥sm, bg rgb(241,245,249), radius 9999px) wrapping the
    lucide **Mail** icon (`h-7 w-7 sm:h-8 sm:w-8 text-slate-700`,
    32×32 at ≥sm, stroke-width 2, color rgb(51,65,85)) — sitting above
    the heading block with the space-y-3/sm:space-y-4 gap (16px at
    ≥sm). 64 + 16 = the exact 80px delta. The wrapper structure also
    differs: the live wraps `w-full > .space-y-4.sm:space-y-6` (two
    levels) where the clone shipped one `w-full.space-y-4` level.
    **THE S51 BUILD** (the first clone-gap build since the S47
    entrances): add the badge + match the structure; the print-story
    convergence predicted (the raster 1359 → 1609, the card 318 →
    398).
- **R3 — THE TWENTY-SIXTH SURFACE (the PDF VECTOR/SCRATCH layer — the
  content-stream operator census): STRUCTURAL PARITY WITH THE DELTA
  FAMILIES ROOT-CAUSED.** The instrument: `qpdf --json
  --json-stream-data=inline` (one call, every stream + dict as JSON —
  the qdf text-parse prototype proved FRAGILE against binary streams
  carrying false "N 0 obj" byte sequences; the JSON path is the robust
  one; qpdf 12.2.0 joins the poppler family as the gate's second
  external binary prerequisite). The census: per-page content-stream
  operator counts by FAMILY (path m/l/c/v/y/re/h; paint S/s/f/F/f*/
  B/B*/b/b*/n; clip W/W*; gs q/Q/gs; xform cm; xobj Do; shading sh;
  color rg/RG/g/G/k/K/sc/scn/SC/SCN/cs/CS; text BT/ET/Tf/Td/TD/Tm/
  T*/Tj/TJ/Ts/Tz/Tw/Tc) + the FORM XObjects' {BBox, op-count} censuses
  SORTED (the per-render name allocation normalized out). The
  measurements:
  - **THE FORM XOBJECTS AT STRUCTURAL PARITY ON EVERY SHARED ROUTE**:
    the form COUNTS identical (/faq 12/12, /privacy 7/7, /terms 7/7,
    /refund-policy 7/7, /accessibility 10/10, /thank-you 0/0, /login
    7/7, the 404 0/0) and the per-form {BBox, ops} censuses
    byte-identical where compared in depth (/faq 12/12; /login 6-of-7
    — the image-placement forms + the chip — with the CARD form's
    registered text-segmentation delta: BT/Tf/Tm/ET 15 vs 16, Td 27 vs
    26 — the same words split into different text blocks).
  - **THE PAGE-CONTENT FAMILIES**: the STRUCTURAL families at near
    parity with small deterministic deltas on the legal routes (e.g.
    /privacy p2 path 386/383, paint 50/47) — ROOT-CAUSED through the
    token-level sequence diff as the EMISSION-STRUCTURE family (the
    background-rect segmentation order + the glyph-run splitting —
    the D125 library-structure law at the print-operator layer; both
    sides' censuses STABLE across re-renders — the deltas are
    deterministic facts, not noise).
  - **THE STATE-TRACKING FAMILIES (color + text) with systematic
    deltas on every route** — ROOT-CAUSED through THE COLOR-VALUE
    CENSUS (the decisive adjudication): the distinct color-VALUE sets
    are IDENTICAL on both sides (/faq 8/8, /privacy 4/4, /login 26/26
    — the same palettes at print); the count deltas are (a) WHITE
    re-establishment frequency (the clone's paint sequence
    re-establishes rgb(1,1,1) more often — e.g. /faq 61 vs 51 — the
    paint-order family) and (b) the ≤0.5/255 SERIALIZATION family
    (clone `.6392,.6392,.6392` vs live `.64,.64,.64`; `.8353,0,1` vs
    `.8333,0,1`; `.9569,.9569,.9608` vs `.957,.957,.961` — the live's
    lab()/oklab-computed values carry the fractional endpoints where
    the clone's pinned @theme hex values land on exact integers —
    the D134/D138 record at the print-operator layer).
  - **The TEXT-RUN SEGMENTATION family**: BT/Tf/Tm/ET counts differ
    by small deterministic deltas on both directions (the /login card
    15 vs 16 live-ward; /faq p2 6 vs 4 clone-ward) with the WORDS
    identical (the D163 layer) and the FONTS identical (the D171
    layer) — the same text split into different glyph-run blocks, the
    library-structure family.
  - **THE /DEMO SUPERerset** (the registered family at the vector
    layer): the clone's working page (683 paths, 823 text ops, 8
    XObjects, 12 forms) vs the live's 16-word SPA shell (113 paths,
    182 text ops, 0 XObjects, 0 forms).
  - **THE LANDING's frame-dependence REGISTERED**: the landing's form
    census varies run-to-run on BOTH sides (the animated forms — the
    pulsing glow's mid-animation scale changes the curve
    decomposition — the S38 loop-value range law at the VECTOR layer;
    the S50 ±1px raster-jitter sibling). The landing's PAGE-content
    families are clone-stable; the paired landing comparison carries
    the state-tracking deltas + the animated-form bucket. NOT PINNED
    at the form level on the landing — the stable routes carry the
    exact pins.
- **R4 — the mobile-nav D160 record re-verified for the SEVENTH
  consecutive session (the operator's standing focus).** The honest
  instrument per gotchas 56a/58b (the hit-target map + the ROW-CONTRACT
  detector + the hydration-timing law): the clone's burger (24×24 at
  y16, 390) opens at ALL THREE probe points (y21/y28/y35); the live's
  y21/y28 STILL hit the dormant react-hot-toast containers (the
  hit-target map records the exact `fixed top-0 z-[100]` div) and only
  y35 opens — the registered superset over the reference's degraded
  affordance, unchanged since S46.
- **R5 — the live login -> /dashboard SPA-404 record re-verified
  (seventh consecutive session)** AND **the dashboard's authenticated
  print story REGISTERED (the clone-side contract)**: the operator
  login lands at `/` (739 words); `/dashboard` renders the 16-word SPA
  404 (h1 "404"). The CLONE's authenticated dashboard rendered to PDF:
  **292 words, 2 pages, the font census VendSans-Light 9× (the
  dark-route webfont family — the D171 census at the authed route),
  ZERO image XObjects (the all-vector dashboard — the D174 empty-set
  law extended to the authed route), ZERO link annotations (the
  dashboard's actions are buttons, not anchors — the D169 law
  extended), 34 form XObjects** (the icons, the chart bars, the
  skeletons — the vector layer at the authed route).

## The findings ledger (this session's D-entries)

- **D177 — the PDF VECTOR/SCRATCH LAYER (the TWENTY-SIXTH SURFACE).**
  Measured at structural parity with the delta families root-caused;
  registered + pinned (the stable routes' form censuses byte-identical,
  the page-content families, the color-value adjudication law, the
  /demo superset floor, the landing's frame-dependence record).
- **D178 — the /login alternates' ERROR + RESET-SUCCESS print story +
  THE MAIL-BADGE BUILD.** The error state at full parity (the 2927
  state-tracked raster); the reset state's missing mail-icon badge
  BUILT (the first clone-gap build since S47) with the print-story
  convergence (the 1609 raster, the 398 card).
- **D179 — the dashboard's authenticated print story.** The clone-side
  registration (the live has no dashboard to compare — the SPA-404
  record): 292 words / 2 pages / VendSans-Light 9× / the empty image
  set / the empty link set / 34 forms.
- **D180 — the binary-stream parser law + the qpdf-json instrument.**
  The qdf text-parse prototype's false-object-boundary trap (a binary
  font stream carrying the literal "N 0 obj" byte sequence truncates
  every preceding object's region — the lesson-88 empty-census family's
  FOURTH sighting, caught by the raw-output discipline before any
  census was trusted) and the robust answer: qpdf --json
  --json-stream-data=inline (the streams arrive length-bounded by
  construction, no text heuristics).

## The plan (TDD where a contract changes; registration where parity
## already holds — the S45/S48/S49/S50 pattern)

- **F1 — the session51 spec** (`tests/e2e/session51-vectorlayer-reset-
  badge.spec.ts`), TDD for the build + registration for the surface:
  - **THE BADGE PINS (RED FIRST — the build's contract)**: the
    reset-success view carries the badge (the div's verbatim class
    string `mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100
    rounded-full flex items-center justify-center` + the Mail svg's
    `h-7 w-7 sm:h-8 sm:w-8 text-slate-700`), the geometry (64×64 at
    1280, bg rgb(241,245,249), radius 9999px, the svg 32×32 with
    stroke-width 2 + color rgb(51,65,85)), the card height 398, and
    the print-story convergence (the reset state's image census
    [1765x1609] + words 31 + fonts + links + metadata).
  - **THE ERROR-STATE PINS (the D178 parity registration)**: the
    fonts/metadata/link-empty-set/words-30/image-census-6 pins with
    the 2927 state-tracked raster.
  - **THE VECTOR-LAYER PINS (the D177 registration)**: the /faq 12-form
    census (byte-identical {BBox, ops} across sides), the /login 7-form
    census (the 6 identical + the card's registered segmentation
    delta), the /login page-content family census (byte-identical:
    path 3, paint 3, clip 1, gs 11, xform 4, xobj 1), the
    color-value census law (the /faq document-wide value sets
    identical modulo the registered families), the /demo superset
    floor, the dashboard print contract (the D179 registration).
  - The instrument: qpdf --json (joining the poppler family — no
    python in the test layer).
- **F2 — the battery rebuild** (`research/drift-battery-s51.mjs`): the
  VECTOR column (the paired form + page-content censuses) + the
  ALTERNATES-EXT column (the error/reset print stories) joining the
  standing columns (route watch, print-text, links, entrances, fonts,
  metadata, images, alternates, the mobile-nav record). Expected ~78
  checks, zero drift.
- **F3 — the full gate.** Lint → typecheck → unit 252 → clean build →
  smoke 125 → e2e (the standing 429 + the session51 pins) — expected
  806 -> ~818. ONE src/ change this session (the login-card badge —
  the first since S47).
- **F4 — the screenshots** (the standing 21, the gotcha-44 scroll-
  through pass, the DB canonical before AND after, the two-pattern
  PATCH interception, the FAQ click's DOM proof) + the VLM standing
  checks (8/8).
- **F5 — the docs alignment.** PAD (the S51 revision block, the ledger
  D177-D180, the §7 counts), AGENTS (the counts + the gotcha 61 — the
  binary-stream parser law; qpdf joins the prerequisites), CLAUDE (the
  session-51 context), README (the gate badge + the 26th-surface story
  + the badge-build story + the session51 suite row), SKILL v2.50.0
  (lesson 90: the vector-layer instrument + the color-value
  adjudication + the binary-stream law), .env.example verified in
  sync (no config surface touched), this plan ticked, the session logs
  110 + 111, the worklog.
- **F6 — the commit + the wrapper push** (the explicit `--remote`
  discipline; the fingerprint verified; the key shredded after).

## Execution status

- [x] R1-R5 recon complete (research/recon51-results.json; this file's
      records; the prototype instruments under research/)
- [x] F1 the session51 spec — the badge pins RED (3 failing on the
      pre-build tree), the build GREEN (11/11: the badge + the reset
      convergence + the error parity + the vector registrations + the
      dashboard contract); the DM Serif italic-cut fix added in flight
      (the battery's landing font census catch) with the session48 pin
      re-versioned (the italic-absence guard)
- [x] F2 the battery rebuild with the VECTOR + ALTERNATES-EXT columns —
      113/113 ZERO DRIFT (three instrumentation laws encoded in flight:
      the mixed-build zombie from rebuilding under a live server [the
      gotcha-46 family — swept + re-booted], the 1/32 color quantization
      [the 1/64 rounding boundary], the entrance-frame raster bucket
      [the live's own run-to-run variance 1481/1494 + the ppi])
- [x] F3 the full gate — 817/817 (252 unit + 125 smoke + 440 e2e in
      nine chunks)
- [x] F4 the screenshots (21/21, the DB canonical before AND after —
      1/6/7,120/2/0, zero mutations; one capture fix in flight: the
      gotcha-28 re-sign-in block replaced with the direct /dashboard
      navigation) + the VLM standing checks 8/8 (the one first-pass
      flag adjudicated by evidence: the 4px slate gradient top bar
      below the VLM's full-shot visibility, proven present by the DOM
      computed style + the 40x6 pixel-clip VLM read)
- [x] F5 the docs alignment (16 edits: PAD's S51 revision block + the
      ledger D177-D180 + the 7.1 counts 60 specs/440; AGENTS' counts +
      gotcha 61; CLAUDE's session-51 context; README's 817 badge + the
      26th-surface story + the badge-build story + the session51 suite
      row; SKILL v2.50.0 lesson 90; .env.example verified in sync — no
      config surface touched)
- [x] F6 the commit + the wrapper push — done (see the record below)

## The pushed-hash record (the closing discipline)

- Remediation commit **a28a5fc** (the full hash a28a5fcbc6ca311e8bbce8ca6f3da09567e0b20a)
  pushed via the SSH wrapper with the EXPLICIT `--remote
  git@github.com:nordeim/saas-company.git` (the S31 trap: the wrapper's
  DEFAULT remote is the runbook's example repo — the explicit flag held
  from the first dry-run, which confirmed the fast-forward
  `5b9536f..a28a5fc` against the correct remote).
- Wrapper-verified: remote main @ a28a5fc == local HEAD; the
  fetch-independent HTTPS ls-remote agreed
  (a28a5fcbc6ca311e8bbce8ca6f3da09567e0b20a).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1-S50 record); the operator's key file shredded
  after use (the wrapper's own temp copy shredded at its teardown).
- The paramiko ssh shim re-deployed on the reset sandbox
  (/home/z/bin/ssh, shebang /usr/bin/python3 — the system python
  owning the paramiko 5.0.0 install; the venv python on PATH lacks
  it); the wrapper needed /home/z/bin on PATH (exported for the run).
- Zero zombies at close (the port-sweep discipline held through every
  recon/battery/capture/adjudication run — :3400 and :3500 swept
  clean, including one next-server child that survived its parent);
  the tree clean; no new branches.
