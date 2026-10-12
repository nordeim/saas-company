# Remediation Plan — Session 47

The worklog S46 candidates (the reference-regression watch, the twenty-first
surface's ROUTE EXTENSIONS, or the twenty-second surface — the print-to-PDF
text layer, the focus-visible ring, or the forced-colors surfaces), answered
against the measured codebase. The baseline is the Session-46 tree (gate
764 = 248 unit + 125 smoke + 391 e2e; the drift battery TWENTY-ONE surfaces,
28 checks across two phases, zero drift — `docs/session_99.md`).

## The recon (research/recon-s47.mjs) + the adjudication probes (adj-s47a–h)

All candidate surfaces measured BEFORE the contracts were designed:

- **R1 — the reference-regression watch (BOTH sides — the gotcha-53 law).**
  The working eight re-probed at exact word parity (739/24/101/36/335/
  390/566/285 — every value byte-identical to the S45/S46 record); the
  statuses at the registered family; the sitemaps at the registered sets
  (the live 7, the clone 8 — the strict superset). **NO RECOVERY, NO NEW
  REGRESSION.** The live login -> /dashboard re-probed (R4): the sign-in
  lands at `/`, /dashboard renders the SPA 404 (16 words, h1 "404") — the
  registered soft-404 record holds through the authenticated path (the
  third consecutive session).
- **R2a — the FOCUS-VISIBLE RING surface (the 22nd-surface candidate #1).**
  The RENDERED ring contract is IDENTICAL across sides: the first Tab stop
  on / carries `outline: 1px auto rgba(213, 0, 255, 0.5)` (the violet/50
  UA-default ring — the S5 record) and /login's Google button
  `rgb(16, 16, 16)` — both sides, both routes. The RULE-census delta (the
  live ships 8 focus-visible + 15 focus rules on the dark bundle and
  139/126 on its login bundle; the clone zero at the top-level census) is
  the library-structure layer (the live's shadcn focus-visible utilities +
  the census being layer-blind to the clone's @layer-nested rules) — the
  D125 law at the rule layer. **ADJUDICATED: rendered parity; registered,
  no build.**
- **R2b — the FORCED-COLORS surface (the 22nd-surface candidate #2).**
  EXACT parity at the empty-set: ZERO `forced-color-adjust` rules in any
  stylesheet on EITHER side (probe B1, the corrected emulateMedia enum);
  the system-color substitution behavior identical (the h1 flips to
  `rgb(0, 0, 0)` with a transparent background on both sides, on both
  probed routes); the document height STABLE under emulation on both
  sides (7318 -> 7318 on /, 778 -> 778 on /login — no reflow). Neither
  Tailwind v3 (the live) nor v4 (the clone) ships forced-colors
  adjustments; the browser's own substitution is the whole contract.
  **REGISTERED as the parity empty-set (the S42 print-empty-set pattern);
  pinned, no build.**
- **R2c — the PRINT-TO-PDF TEXT layer (the 22nd-surface candidate #3 —
  THE SESSION'S HEADLINE).** With the proper extractor (pdftotext — the
  naive stream regex is blind to Chromium's CID-subset encodings): FOUR of
  five probed routes at EXACT word parity (/login 26 = 26, /faq 104 =
  104, /privacy 344 = 344, /thank-you 36 = 36, the head strings
  identical). The LANDING diverged: clone 291 vs live 251 — a 40-token
  multiset delta. **The root cause (probes D/E/F/G/H — five instruments:
  the opacity timeline, the DOM chain, the carrier census, the scroll
  settle, the frame sampler): TWO ENTRANCE-LAYER CLONE GAPS the print
  pipeline exposed** (print paints only settled content; un-revealed
  below-fold framer elements stay opacity-0 and vanish from the PDF):
  - **GAP 1 — the logo-cloud WORDMARK ENTRANCES.** The live wraps EACH of
    the 8 wordmark carriers (`div.text-white/60 hover:text-white/90
    transition-all …`) as a framer motion element with initial
    `style="opacity: 0"` — an OPACITY-ONLY fade (NO transform), revealed
    per-element on scroll-into-view: measured starts 490 -> 890ms
    (a ~50ms stagger), durations ~400ms (the frame sampler, probe H).
    The clone ships the wordmarks STATIC. The S8 F1-EXTRA record ("the
    live's wordmark cloud is NOT a motion element") measured the
    CONTAINER — which IS static, then and now — but the per-wordmark
    carriers were never surveyed (or the live redeployed — the
    moving-target law, gotcha 7; either way TODAY's live is the truth).
  - **GAP 2 — the CTA WHOLE-BLOCK ENTRANCE.** The live wraps the ENTIRE
    CTA content block (the badge pill + the h2 + the copy + the pills)
    in ONE unclassed motion div with initial `opacity: 0; transform:
    translateY(30px)` — measured duration ~800ms, easeOut (the sampler:
    opacity 0.054 at start, 0.97 at +666ms, the y travel 30 -> 0). The
    clone animates ONLY the badge (the S8 F1-EXTRA build — "the live
    animates ONLY the badge pill" is WRONG for today's live; the
    print-text delta proves the h2/copy/pills sit inside the opacity-0
    wrapper: their tokens are missing from the live's PDF).
  - **THE PARITY-CONVERGENCE PREDICTION:** after the build, the clone's
    landing PDF converges to the live's (291 -> 251 — the below-fold
    un-revealed text unpainted on BOTH sides); every other below-fold
    section was already Reveal-wrapped (the S8 build) and already
    matched.
- **R3 — the 21st surface's ROUTE EXTENSIONS.** The OFFLINE render on
  the content routes: the clone renders /faq 87 words (the full FAQ copy)
  vs the live's 127-word SPA shell; /privacy 321 vs 127; /login 23 words
  + the h1 vs the live's 137-word shell — the D159 superset extended to
  the content routes. **The /faq word-count artifact adjudicated (probe
  A):** the offline render measures 87 vs the styled 101 NOT because
  content is missing but because the aborted STYLESHEET leaves the nav
  links and footer columns UNSTYLED — adjacent inline elements concatenate
  in innerText ("FeaturesHow", "WorksPricingTestimonialsFAQ" — the
  gotcha-26 signature, expected under total request block; the WORDS are
  all present). The pin floors at 80, not 101. The CLIPBOARD census on
  /login + /demo: exact parity (oncopy/oncut/onpaste null, user-select
  auto, zero `.select-none` carriers — both sides, both routes).
- **R4 — the mobile-nav D160 re-verification (the operator's explicit
  focus).** The fixed row-contract detector (probe B3 — the recon's
  first detector broke on the clone's oklab() bg serialization, gotcha 4
  at the instrument layer): the LIVE's burger at 390 y20 BLOCKED / y28
  BLOCKED / y36 OPENS (the dormant-toast record unchanged — the reference
  watch: NO CHANGE); the CLONE's burger opens at EVERY point (y20/y28/
  y36 all open, the identical 9-row panel contract when open). The
  Tailwind v4 watch: no new v4 defects (the menu's geometry, classes,
  and clickability all at the registered contract).

## The adjudicated session scope

A **BUILD + MEASUREMENT + VERSIONING session** — the first clone-GAP build
since S43 (S42–S46 were measurement/registration cycles): the print-text
surface (the 22nd surface) exposed two real entrance-layer gaps. The scope:

1. **THE ENTRANCE BUILD (the clone gaps):** extend `Reveal` with an
   opacity-only mode (`y={null}` — no transform at any phase), then wrap
   the 8 logo-cloud wordmark carriers as per-element entrances (structural
   parity: the motion div IS the classed carrier — `duration 400,
   delay (i+1)*50ms`) and restructure the CTA to the whole-block entrance
   (ONE unclassed Reveal, `y=30, duration 800`, wrapping badge + h2 +
   copy + pills — replacing the badge-only Reveal).
2. **THE PRINT-TO-PDF TEXT layer (the 22nd surface):** pinned — the four
   content routes' exact PDF word counts (26/104/344/36), the landing's
   post-build convergence (~251 — measured after the build), the pdftotext
   extractor through `child_process` (the e2e environment ships poppler).
3. **The forced-colors empty-set:** pinned (zero rules + the geometry
   stability + the substitution flip).
4. **The 21st surface's route extensions:** pinned (the offline floors on
   /faq + /privacy + /login; the clipboard census on /login + /demo).
5. **The standing verifications:** the route-watch, the battery (both
   sides' truth), the screenshots, the VLM, the docs alignment.

New ledger records **D161–D166** (see the plan rows). No registry growth
(none of the new records is a head tag or a DOM attribute — the entrance
contract lives in the components + the PAD's deviations ledger).

- **D161 — the focus-visible ring rendered parity**: the first-stop ring
  identical across sides (violet/50 on /, rgb(16,16,16) on /login); the
  rule-census delta the library-structure layer (D125 at the rule layer).
- **D162 — the forced-colors empty-set**: zero forced-color-adjust rules
  both sides; identical system-color substitution; stable geometry under
  emulation — the S42 print-empty-set pattern at the forced-colors layer.
- **D163 — the print-to-PDF text layer**: the four content routes at
  EXACT word parity (26/104/344/36); the landing converges post-build
  (~251 both sides) — the S42 page-count surface deepened to the text
  layer.
- **D164 — the logo-cloud wordmark entrances**: the live's 8 per-wordmark
  opacity-only fades (~400ms, ~50ms stagger) — the clone gap CLOSED; the
  S8 F1-EXTRA container record still true (the container static).
- **D165 — the CTA whole-block entrance**: the live's ONE motion div
  (y=30, ~800ms) wrapping badge + h2 + copy + pills — the clone gap
  CLOSED; the S8 badge-only record superseded (the live redeployed or
  was mis-scoped — today's live is the truth, gotcha 7).
- **D166 — the offline route extension + the /faq concatenation
  artifact**: the D159 superset extended to the content routes (87/321/23
  words vs the live's 127/127/137 shells); the 87-vs-101 styled delta is
  the CSS-abort concatenation, not missing content.

## The ToDo list (TDD — the spec pins the CLONE side; the battery asserts
both sides' truth)

- [x] F1 — `src/lib/motion.ts` + `src/components/site/reveal.tsx`: the
      opacity-only entrance mode (`y={null}`): `revealState()` gains the
      y-null branch (no transform in any phase; the settled write
      `opacity: 1` ONLY — the live's settled wordmarks carry
      `style="opacity: 1;"` with NO transform residue); `Reveal` accepts
      `y: number | null`. Unit tests RED first (the y-null state curve +
      the settled style), then the build — GREEN, 248 -> 252 unit.
- [x] F2 — `src/components/sections/logo-cloud.tsx`: the 8 carriers
      become `<Reveal className="<the verbatim carrier classes>"
      y={null} duration={400} delay={(i+1)*50}>` (the motion div IS the
      classed carrier — the live's exact structure; the container stays
      static; the Gasparyan image carrier included — the live's 9th
      motion carrier measured at start 890ms). The S8 container pin
      untouched.
- [x] F3 — `src/components/sections/cta.tsx`: replace the badge-only
      Reveal with ONE whole-block Reveal (`y={30} duration={800}`,
      unclassed — wrapping the badge + h2 + copy + pills). The h2 keeps
      its `--tw-leading` pin; its own style stays motion-free (the S8
      pin's letter holds; its INTENT re-versioned — the motion moved to
      the wrapper). Update the motion-parity spec's CTA test to today's
      truth (the h2's PARENT carries `opacity: 1; transform: none;`
      settled; the badge's own style stays null).
- [x] F4 — `tests/e2e/session47-print-text-entrances.spec.ts`:
      (a) the ENTRANCE pins — the 8 wordmark carriers each carry the
      inline opacity contract (opacity-only: NO transform key at rest
      below fold), the stagger/duration contract (the delays 50..400),
      the settled states after scroll (`opacity: 1`, no transform
      residue), the container still static; the CTA block wrapper (y=30
      initial, the settled `opacity: 1; transform: none;`, ONE wrapper
      carrying badge+h2+copy+pills);
      (b) the PRINT-TEXT pins — the PDF word counts via pdftotext
      (/login 26, /faq 104, /privacy 344, /thank-you 36) + the landing's
      post-build convergence value (measured after F1-F3, pinned at the
      measurement);
      (c) the FORCED-COLORS pins — zero forced-color-adjust rules in the
      CSSOM, the doc-height stability under `forcedColors: "active"`,
      the h1 color substitution flip;
      (d) the ROUTE-EXTENSION pins — the offline render floors (/faq
      >= 80, /privacy >= 300, /login >= 20 + the h1), the clipboard
      census on /login + /demo (null/auto/zero-carriers).
- [x] F5 — `research/drift-battery-s47.mjs`: the print-text phase (paired:
      the four content routes' exact counts + the landing's convergence,
      both sides), the entrance-structure phase (paired: the settled
      carrier census after scroll — 9 motion carriers on the cloud + 1
      on the CTA, both sides), the forced-colors phase (paired
      empty-set), the standing route-watch — GREEN, ZERO DRIFT expected
- [x] F6 — the full gate re-run on the clean build — **764 + N checks
      ALL GREEN** (252 unit + 125 smoke + [391 + N] e2e; lint/typecheck/
      build clean, the instrumentation.ts warning the known standing one)
- [x] F7 — the screenshot refresh (the standing 21; DB canonical before
      AND after; the REGEX route-abort discipline + the PATCH
      route-fulfillment from S46) + the VLM standing checks — PASS
      expected
- [x] F8 — the docs alignment: PAD (the revision block, the ledger
      D161–D166, section 7 counts, the gate line), AGENTS (the counts +
      gotcha 57 — the print-pipeline exposure law: an un-revealed
      entrance is INVISIBLE to every dwell-loaded surface AND to the
      print pipeline; only a no-scroll print/paint probe sees the
      un-revealed set + the S8-record re-verification law), CLAUDE (the
      session-47 context), README (the badge + the entrance-gap story +
      the rows), SKILL v2.46.0 (lesson 86: the print-text instrument —
      pdftotext as the print-pipeline truth-teller for entrance
      coverage), .env.example verified in sync, the remediation plan
      session47 (this file, ticked), the session logs (session_101
      curated + session_102 raw per the house numbering), the worklog
- [x] F9 — the commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding)

## The measured record (the session's adjudications, beyond the plan)

- **THE PARITY-CONVERGENCE CONFIRMED EXACTLY.** The build's landing PDF
  moved 291 -> 251 = the live's 251 — the 40-token delta collapsed to
  ZERO, exactly as the pre-build prediction stated (the strongest
  confirmation the clone now reproduces the reference's entrance
  mechanism, not merely the arithmetic). The paired battery's PH1a
  asserts both sides at 251/26/104/344/36.
- **The entrance structure at byte parity.** The settled carriers read
  `opacity: 1;` (opacity-only, no transform residue — the live's exact
  inline write) and the CTA wrapper `opacity: 1; transform: none;` —
  both byte-identical to the live's settled framer residue. At rest the
  carriers carry `opacity:0` with NO transform key (React's style
  serialization differs from framer's by whitespace only; the computed
  values identical).
- **The two pin-authoring catches in flight.** (a) The settled
  wordmark style pins as `opacity: 1;` WITH the trailing semicolon (the
  browser's imperative-style serialization — the first draft's
  semicolon-less pin was a transcription error caught by the first RED
  run). (b) The forced-colors h1 background is `rgba(255, 255, 255, 0)`
  — TRANSPARENT WHITE — not the transparent black the first draft
  assumed; the pin now reads the measured value.
- **The stagger model.** The measured starts (490/545/623/623/703/751/
  820/890ms) fit the (i+1)*50ms delay model within the timer-clamping
  inflation (~10%, gotcha 52b); the 9th carrier (the Gasparyan image)
  fades in last, matching the live's measured 890ms start.
- **The battery's first-run cleanliness.** 17/17 GREEN ZERO DRIFT on
  the FIRST run — no instrumentation adjudications needed (the S45
  pattern, not the S46 one).
- **The VLM transient.** The first VLM run read 7/8 — one response
  came back as an HTML document (the CLI's transient output-mixing, the
  S46-recorded quirk); two consecutive re-runs both read 8/8 with ZERO
  flags.
- **The capture script's scroll-through addition.** The standing
  21-shot capture script gained the gotcha-44 SCROLL-THROUGH pass
  before the fullPage landing shot — REQUIRED by the new entrances
  (the wordmarks + CTA start at opacity 0 and would otherwise render
  as blank bands in the stitched full capture).
- **The motion-parity CTA pin re-versioned.** The S8 test's LETTER
  (the h2's own style carries no motion; the badge's own style null;
  the wrapper's settled residue) survived the restructure unchanged —
  only its NAME and INTENT updated (the wrapper now carries the whole
  block; the new assertions pin the 4-children + pill + copy scope).
- **The gate: 764 -> 777** (252 unit + 125 smoke + 400 e2e — the
  session47 suite +9: 2 wordmark entrance + 2 CTA + 2 print-text + 1
  forced-colors + 2 route-extension pins; the motion unit pins +4).

## The pushed-hash record (the closing discipline)

- Remediation commit **8e65f42** pushed via the SSH wrapper with the
  EXPLICIT `--remote git@github.com:nordeim/saas-company.git` (the S31
  trap: the wrapper's DEFAULT remote is the runbook's example repo — the
  explicit flag held from the first dry-run).
- Wrapper-verified: remote main @ 8e65f42 == local HEAD; the
  fetch-independent HTTPS ls-remote agreed
  (8e65f420af8d9fa99c1384facace9d690870e010).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1-S46 record); the operator's key file shredded after
  use (the wrapper's own temp copy shredded at its teardown).
- Zero zombies at close (the port-sweep discipline held through every
  recon/adj/battery/capture/verify run; the ports swept clean at the
  end); the tree clean; no new branches.
