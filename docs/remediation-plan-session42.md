# Remediation Plan — Session 42

The worklog S41 candidates (the reference-regression watch on the live's
four soft-404 routes, the responsive surface's ROUTE EXTENSION to /faq +
the legal routes, and the PRINT media surface as the battery's
seventeenth surface), answered against the measured codebase. The
baseline is the Session-41 tree (gate 707 = 247 unit + 124 smoke + 336
e2e; the drift battery 16 surfaces, 36 checks across two phases, zero
drift — `docs/session_83.md`).

## The re-scoping recon (research/recon-s42.mjs + recon2-s42.mjs + the adj-s42 adjudication probes)

All three candidate surfaces measured BEFORE the contracts were
designed:

- **The reference-regression watch (R1).** The live's 12 routes
  re-probed in full: the soft-404 set is UNCHANGED at four routes —
  `/pricing`, `/demo`, `/dashboard`, `/checkout` (HTTP 200, "Page Not
  Found", 16 words) — and the working eight re-verified at exact word
  parity (`/` 739w, `/login` 24w with the form present, `/faq` 101w,
  `/thank-you` 36w, `/privacy` 335w, `/terms` 390w, `/accessibility`
  566w, `/refund-policy` 285w — every value byte-identical to the S41
  record). The live's sitemap is unchanged (7 URLs incl. `/thank-you`,
  no `/login`, no `/pricing`). **NO RECOVERY, NO NEW REGRESSION: D146
  stands.**
- **The print media surface (R2 — the seventeenth surface).** Measured
  at THREE layers, both sides, on `/`, `/faq`, `/privacy` (+ the PDF
  layer on every public route):
  (a) the CSSOM layer — ZERO `@media print` rules in any stylesheet on
  either side (any probed route); (b) the document layer — ZERO
  `<link>`/`<style>` elements carrying a `media` attribute on either
  side, and every adopted stylesheet's `media.mediaText` is the screen
  default; (c) the computed layer — under `page.emulateMedia({ media:
  "print" })` the key elements (body, nav, h1, footer, first section,
  video, input) show ZERO style deltas screen-vs-print on either side;
  and (d) the RENDER layer — the actual print pipeline
  (`page.pdf({ format: "A4", printBackground: true })`): the page
  counts are IDENTICAL across sides on 7 of 8 public routes (landing
  8/8, `/login` 1/1, `/faq` 2/2, `/privacy` 2/2, `/terms` 2/2,
  `/accessibility` 3/3, `/refund-policy` 2/2) — the only delta
  `/demo` at clone-2 vs live-1, fully explained by the REGISTERED
  working-superset route (the live soft-404s `/demo` at 16 words; the
  clone renders the demo-request surface — D73/D146). **The print
  surface is the EMPTY-SET contract at exact parity: neither side
  ships any print styling, and the print render matches.** The
  adjudication (adj-s42 A1) was required: the first CSSOM scan only
  covered `CSSMediaRule` — a `<link media="print">` sheet's top-level
  rules are NOT media rules, so the document-layer scan closes the
  blind spot. **No fix, no superset addition: print restyling would be
  a VISIBLE deviation from the reference's printed output — the
  registered superset families are functional features and
  invisible-at-rest a11y, never output changes. The contract is
  parity, documented.**
- **The responsive route extension (R3 — the fifteenth surface's route
  growth).** /faq + all four legal routes at the four widths
  (390/768/1024/1440), paired clone-vs-live, DWELL-loaded per the
  gotcha-52e law: **EXACT PARITY on every field of every combo** — nav
  height 56px @390 / 72px @≥768 both sides; the burger (the SHARED
  `md:hidden` selector — gotcha 47: the live's burger carries no
  aria-controls, so the first recon's aria-controls-keyed read showed
  the live's burger "absent" — a measurement artifact, re-measured
  identical) visible at 390 / hidden at ≥768 both sides; nav links 1
  (the logo) at 390 / 7 at ≥768 both sides; ZERO horizontal overflow
  at every width on every route both sides; document heights
  byte-identical per width per route: /faq 1641/1309/1285/1285,
  /privacy 2205/1461/1359/1359, /terms 2383/1503/1479/1479,
  /accessibility 3747/2471/2421/2421, /refund-policy
  1955/1315/1291/1291; /privacy's h1 at top 128px at every width both
  sides. **ZERO unregistered deltas — the fifteenth surface's route
  extension is green at parity.**

## The ToDo list (TDD)

- [x] R1 — the route-watch record: NO RECOVERY, NO NEW REGRESSION (the
      soft-404 four unchanged, the working eight at exact word parity,
      the sitemap unchanged); D146 stands
- [x] R2 — the SEVENTEENTH surface measured GREEN at parity (the
      four-layer print contract: the CSSOM rule scan, the document
      media-attribute scan, the print-emulation computed scan, the PDF
      page-count render — the empty-set contract with the /demo
      registered-superset explanation)
- [x] R2a — `tests/e2e/session42-print-responsive.spec.ts`: the
      clone-side pins — the print empty-set (zero `@media print` rules
      + zero media-attributed link/style elements on the probed
      routes), the print-emulation computed contract (no deltas on
      body/nav/h1/footer under print media), the PDF page-count
      contract (landing 8, /login 1, /faq 2, /privacy 2,
      /accessibility 3), the /faq + /privacy responsive extension
      pins (nav height, link count, zero overflow, the docH anchors
      ±32px), the legal-route docH sweep, and the burger md:hidden
      flip on the legal routes — the registry-pins pattern, GREEN on
      arrival expected (the parity session's S39/S40/S41 precedent)
- [x] R2b — the battery's seventeenth-surface phase + the
      responsive-extension phase + the route-watch phase
      (research/drift-battery-s42.mjs): the paired print-surface reads
      (CSSOM + document + PDF layers) + the paired five-route
      responsive reads at the four widths + the standing route-watch
      registry — GREEN, ZERO DRIFT expected
- [x] The full gate re-run on the clean build — expect **714 checks
      ALL GREEN** (247 unit + 124 smoke + 343 e2e = the 707 standing +
      the 7 session42 pins; lint/typecheck/build clean)
- [x] The 20 screenshots refreshed under docs/screenshots/ (DB
      canonical before AND after — 6 rows / 5 active / 7,120 runs; the
      REGEX route-abort discipline per the S41 capture-mutation trap)
      + the VLM standing five — 5/5 PASS expected
- [x] The docs alignment: PAD (the revision block, §7 counts, §7.2 the
      session42 suite, §11), AGENTS (the counts + the seventeenth
      surface + the route-extension record), CLAUDE (the session-42
      context), README (the 714 badge + the S42 rows), SKILL v2.41.0
      (lesson 81: the print-surface empty-set law — scan the document
      layer, not just the CSSOM; a superset is never a visible output
      change), .env.example verified in sync (code-only session), the
      remediation plan session42 (this file, ticked), the session logs
      (docs/session_86.md curated + docs/session_87.md raw), the
      worklog
- [x] The commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding)

## The pushed-hash record (the closing discipline)

- Remediation commit **105dab5** pushed via the SSH wrapper with the
  EXPLICIT `--remote git@github.com:nordeim/saas-company.git` (the S31
  trap: the wrapper's DEFAULT remote is the runbook's example repo —
  the explicit flag held from the first dry-run).
- Wrapper-verified: remote main @ 105dab5 == local HEAD; the
  fetch-independent HTTPS ls-remote agreed
  (105dab56a69c39eafd7ec6a7a77d7246a0a4764a).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1-S41 record); both the wrapper's temp key copy and
  the operator's key file shredded after use.
- Zero zombies at close; the tree clean; no new branches.

## The measurement-law notes (this session's adjudications)

- **The blind-spot scan law (adj-s42 A1).** A CSSOM scan for
  `CSSMediaRule` with a print condition is NOT a complete print-rule
  inventory: a `<link rel="stylesheet" media="print">` loads a sheet
  whose TOP-LEVEL rules are ordinary (they apply only under print) —
  the document layer (every link/style element's `media` attribute +
  every adopted sheet's `media.mediaText`) must be scanned alongside
  the rule layer. Both layers read empty on both sides; the surface's
  contract needs both.
- **The shared-selector law (adj-s42 A2, gotcha 47 re-applied).** The
  live's burger carries NO `aria-controls` (the bare button) — any
  recon that keys the burger by the clone's a11y attributes reads the
  live's burger as ABSENT (a false drift). The shared selector is the
  nav's `md:hidden` button (the class-based contract both sides
  carry).
- **The PDF page-count contract.** `page.pdf()` at A4/printBackground
  exercises the real print pipeline (media print + the print layout);
  identical page counts across sides on route-matching pages is the
  render-level parity evidence for an empty-rule surface (a sheet with
  no print rules still PRINTS — the page count is what the user sees).
