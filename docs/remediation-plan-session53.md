# Remediation Plan — Session 53

The worklog S52 candidates (the reference-regression watch; the 27th
surface's ROUTE EXTENSIONS — the alternates' structural censuses, the
dashboard's authenticated structural census at depth; or the
twenty-eighth surface — the PDF's XObject RESOURCE layer, the
print-time color-space layer, or the font subset-table layer), answered
against the measured codebase — with the best-judgment scope: **ALL
THREE candidates delivered in one pass** — the PDF's per-page RESOURCE
name-table layer (the /XObject /Font /ExtGState /Pattern... name sets
per page) as the twenty-eighth surface's core, the /login alternates'
structural censuses + the dashboard's authenticated structural census
at depth as the 27th surface's route extensions, and the standing
reference-regression watch re-verified for the NINTH consecutive
session. **NO BUILD-WORTHY GAP FOUND** — this is a REGISTRATION session
(the S45/S48/S49/S50/S52 pattern: pin, no build). The baseline is the
Session-52 tree at `f74b8ee` (gate 826 = 252 unit + 125 smoke + 449
e2e; the drift battery twenty-seven surfaces, 195 checks, zero drift —
`docs/session_114.md`).

## The recon (research/recon-s53.mjs + recon-s53b + the probe-shape +
## ph4-debug instruments — all candidates measured BEFORE the contracts
## were designed; the clone on :3400 against the scratch recon53.db,
## each phase a self-contained boot-work-kill unit)

- **R1 — the reference-regression watch (BOTH sides): ZERO DRIFT, the
  NINTH consecutive session.** The working eight re-probed at exact
  word parity (739/24/101/36/335/390/566/285 — landing/login/faq/
  thank-you/privacy/terms/accessibility/refund-policy, every value
  byte-identical to the S45-S52 record); the sitemaps at the registered
  sets (live 7, clone 8 — the /demo superset entry).
- **R2 — the 27th surface's ROUTE EXTENSIONS: the /login alternates'
  STRUCTURAL censuses at FULL PARITY on their first measurement + the
  dashboard's authenticated structural census AT DEPTH registered.**
  The five /login states' catalog keys + object counts IDENTICAL
  across sides: default {/Pages,/Type,/ViewerPreferences} at **51/51**,
  error at **52/52** (the banner's +1 object), reset at **34/34** (the
  success card's smaller tree), signup at **38/38**, forgot at
  **38/38** — the per-state object-allocation fingerprint identical on
  both sides, all untagged/outline-free/Lang-free (the D181 empty-set
  contract extending to every alternate). The dashboard's structural
  census AT DEPTH (the clone-side registration; the live has no
  dashboard): 292 objects, the same empty-set contract, the SAME
  /ViewerPreferences {/DisplayDocTitle: true}, the top-level views
  identical to the public routes (outlines [], acroform false, encrypt
  capabilities present, pagelabels []) — the authenticated structural
  layer carrying the public contract unchanged.
- **R3 — THE TWENTY-EIGHTH SURFACE (the PDF's per-page RESOURCE
  name-table layer): FULL PARITY on the stable routes at BYTE-IDENTICAL
  NAME TABLES on its first honest measurement.** The instrument:
  `qpdf --json --json-stream-data=inline` (the D180/D183 laws) read at
  the RESOURCE granularity — every /Type /Page's /Resources name
  tables censused per category (/XObject, /Font, /ExtGState,
  /ColorSpace, /Pattern, /Shading, /Properties), the traversal
  RESOLVING the page tree from the catalog's /Pages through the
  string-form refs ("N 0 R" — the shape dumped raw BEFORE the census
  was trusted, the lesson-88 discipline held at the sixth instrument
  this year). The measurements:
  - **THE STABLE SEVEN AT BYTE-IDENTICAL NAME TABLES**: /login
    (XObject {/X35}, ExtGState {/G3}, Pattern {/P4} — the fonts living
    in the card form's OWN resource dict, not the page's), /faq
    (XObjects 12 names, Fonts 7, GStates 8 at per-page 3/9 + 3/7 +
    5/6), /privacy (7/7/10), /terms (7/7/10), /refund-policy (7/7/10),
    /accessibility (10/8/9 across 3 pages), /thank-you (the empty
    XObject set — the D174 law — with Fonts 4 / GStates 4) — every
    name set IDENTICAL across sides. The names encode the referenced
    OBJECT NUMBERS (/X12 → obj 12), so the byte-identical name tables
    are the D181 object-count parity now proven at the
    name-allocation layer: the two print pipelines allocate the SAME
    object numbers to the SAME resources.
  - **THE LANDING: count-level parity with the name-level animated
    family.** The union COUNTS match (XObject 34/34, Font 7/7,
    ExtGState 11/11, per-page multisets identical) but the NAMES drift
    (the clone /X101... vs the live /X103...) and the Pattern union
    differs (clone 5, live 7) — the registered D181 landing bucket
    (523/530 objects) propagating to the name-allocation layer; the
    S38 range law at the resource-name granularity. Registered as the
    count-parity + name-bucket contract.
  - **/demo the REGISTERED SUPERSET at the resource layer** (the
    clone's 2 working pages: XObjects 12 names per-page 4/8, Fonts 7,
    GStates 9 vs the live's 1-page 16-word shell: ZERO XObjects,
    Fonts 5, GStates 3).
  - **THE DASHBOARD'S AUTHENTICATED RESOURCE FINGERPRINT registered**
    (the clone-side contract): 2 pages carrying XObjects 13/17 (union
    30), Fonts 5/7 (union 7), GStates 6/9 (union 10), **Patterns 6**
    — the charts' pattern fills surfacing at the resource layer.
  - **DETERMINISM verified 2×** (/faq + /login re-rendered with
    byte-identical censuses).
- **R4 — the mobile-nav D160 record re-verified for the NINTH
  consecutive session (the operator's standing focus).** The hit-target
  map + the gotcha-4-aware panel detector: the clone's burger opens at
  ALL THREE probe points (y21/y28/y35 → the 390×397 panel, 6 links);
  the live's y21/y28 STILL hit the dormant react-hot-toast container
  (the exact `fixed top-0 z-[100]` DIV) and only y35 opens. **No
  Tailwind v4 bug** — the panel's `bg-black/95` serializes
  `oklab(0 0 0 / 0.95)` on the clone and `rgba(0, 0, 0, 0.95)` on the
  live, rendering-identical. The agent-browser functional pass
  confirmed the flow end-to-end (the login → dashboard with the
  workspace stats 5 active / 7,120 runs / 160h / 99.5%; the AI
  composer; the pause/resume/delete controls; the mobile menu opening
  with all registered links; zero console errors).
- **R5 — the live login -> /dashboard SPA-404 record re-verified
  (NINTH consecutive session).** The operator login lands at `/`
  (739 words — the landing); `/dashboard` renders the 16-word SPA 404
  (h1 "404"). The live has NO dashboard; the clone's working dashboard
  is the registered functional superset.

## The findings ledger (this session's D-entries)

- **D184 — the PDF's per-page RESOURCE name-table layer (the
  TWENTY-EIGHTH SURFACE).** The stable seven at byte-identical name
  tables (the D181 object-count parity proven at the name-allocation
  layer); the landing's count-parity + name-bucket (the animated
  family); the /demo superset; the dashboard's authenticated resource
  fingerprint; registered + pinned.
- **D185 — the 27th surface's ROUTE EXTENSIONS.** The five /login
  alternates' structural censuses at full parity (51/52/34/38/38 — the
  per-state object-allocation fingerprint); the dashboard's
  authenticated structural census at depth (the public contract
  unchanged under auth); registered + pinned.
- **D186 — the instrument laws.** (a) THE REAPER LAW: the sandbox
  kills ALL server children at command end — even `setsid nohup`
  detachments die; the recon restructured as self-contained
  boot-work-kill phase units (one server life per measurement batch).
  (b) THE OKLAB-SERIALIZATION SHAPE LAW: Tailwind v4's computed
  `bg-black/95` serializes `oklab(0 0 0 / 0.95)` — INTEGER zero
  components, not the guessed `0.xxx` shape; a detector regex written
  from the assumed shape matches nothing while the panel renders fine
  (the lesson-88 family at the CSS layer — the debug probe's raw dump
  caught it). (c) THE HYDRATION DWELL: the standalone build's burger
  needs ~1500ms before coordinate clicks are wired (the 56a/58b law
  at the recon granularity).

## The plan (TDD where a contract changes; registration where parity
## already holds — the S45/S48/S49/S50/S52 registration pattern)

- **F1 — the session53 spec** (`tests/e2e/session53-resourcelayer-
  alternates.spec.ts`), ALL registration pins (no RED build expected —
  the tree already satisfies them; the first run IS the verification):
  - **THE RESOURCE-LAYER PINS (the D184 registration)**: the stable
    seven's per-category union name sets (byte-identical — /login's
    {/X35}/{/G3}/{/P4}, /faq's 12/7/8, /privacy's 7/7/10, /terms's
    7/7/10, /refund-policy's 7/7/10, /accessibility's 10/8/9,
    /thank-you's empty-XObject + 4/4) with the per-page count
    multisets; the landing's count-parity registration (union counts
    34/7/11 + the per-page multisets, the Pattern union bucketed 5-8
    for the animated family); the /demo superset floor (12 XObjects
    vs the live's zero); the dashboard's authenticated fingerprint
    (30/7/10/6 across 2 pages); determinism (the instrument re-run
    discipline).
  - **THE ALTERNATES' STRUCTURAL PINS (the D185 registration)**: the
    five /login states' catalog keys + object counts (51/52/34/38/38
    — the per-state fingerprint), the empty-set contract on every
    alternate, and the dashboard's authenticated structural depth
    (292 objects, the identical ViewerPreferences + top-level views).
  - The instrument: qpdf --json at the resource granularity (same
    binary as D177-D183 — no python in the test layer), the page-tree
    traversal resolving the string-form refs from the catalog.
- **F2 — the battery rebuild** (`research/drift-battery-s53.mjs`):
  the RESOURCE column (the paired name-table comparisons on every
  route) + the ALTERNATES-STRUCTURAL column (the five states' paired
  structural censuses) joining the standing columns (route watch,
  print-text, links, entrances, fonts, metadata, images, vector,
  alternates, structural, the mobile-nav record). Expected ~235
  checks, zero drift.
- **F3 — the full gate.** Lint → typecheck → unit 252 → clean build →
  smoke 125 → e2e (the standing 449 + the session53 pins) — expected
  826 -> ~837. ZERO src/ changes this session (the registration
  pattern).
- **F4 — the screenshots** (the standing 21, the gotcha-44
  scroll-through pass, the DB canonical before AND after, the
  two-pattern PATCH interception, the FAQ click's DOM proof, the
  reset badge's waitFor proof) + the VLM standing checks (8/8).
- **F5 — the docs alignment.** PAD (the S53 revision block, the
  ledger D184-D186, the §7 counts), AGENTS (the counts + the gotcha
  63 — the reaper law + the oklab-serialization shape law + the
  hydration dwell), CLAUDE (the session-53 context), README (the gate
  badge + the 28th-surface story + the session53 suite row), SKILL
  (lesson 92: the resource-layer instrument + the serialization-shape
  law + the reaper law), .env.example verified in sync (no config
  surface touched), this plan ticked, the session log 115, the
  worklog.
- **F6 — the commit + the wrapper push** (the explicit `--remote`
  discipline; the fingerprint verified; the key shredded after).

## Execution status

- [x] R1-R5 recon complete (research/recon-s53-state.json — 9 phase
      records; the probe-shape + ph4-debug instruments under
      research/)
- [x] F1 the session53 spec — 7/7 GREEN on the first run (the
      generated-constants discipline: no pin-transcription catches),
      stable across THREE runs (the post-restart re-verification
      included)
- [x] F2 the battery rebuild — research/battery-s53-lib.mjs +
      drift-battery-s53.mjs + drift-battery-s53b.mjs (six phases, the
      run-battery-s53.sh wrapper): **243/243 GREEN ZERO DRIFT** (up
      from the S52's 195) with THREE instrumentation corrections in
      flight, each root-caused before re-pinning: (a) the landing
      print content flags re-pinned to the CURRENT copy (the h1
      "Automate your workflows" + "Book a Demo" — the S47
      wordmark/Stop-Managing flags belong to the OFFLINE story; the
      moving-target law), (b) THE CONTEXT-ORDER LAW: an authenticated
      context redirects /login to /dashboard and poisons every public
      measurement after it — the alternates now run on the CLEAN
      context, the authenticated dashboard in its OWN context LAST,
      (c) the post-login settle wait (measuring mid-navigation reads
      0 words — the waitForFunction non-empty guard)
- [x] F3 the full gate — **826 -> 837** = lint ✓ + typecheck ✓ +
      unit 252/252 ✓ + clean build ✓ + smoke 125/125 ✓ + e2e 456/456
      ✓ (the standing 449 + the session53 spec's 7; the e2e in chunks
      with the per-chunk list-count reconciliation — the timeout-killed
      first invocation's 301-through-11-chunks tally root-caused as an
      extraction artifact, the honest re-run proving every chunk at its
      --list count: 53/34/62/39/18/15/13/10/26/16/25 + 54/19/16/20/20/16
      = 311 + 145 = 456). ZERO src/ changes this session (the
      registration pattern).
- [x] F4 the screenshots + the VLM standing checks — 21/21 captured
      (the capture server on :3500 against db/capture53.db; the
      gotcha-44 scroll-through; the two-pattern PATCH interception;
      the FAQ click's DOM proof; the reset badge's waitFor proof; the
      working burger point y35), the dev DB canonical before AND
      after (1/6/7,120/2/0, zero mutations). TWO capture fixes in
      flight, each root-caused: the section headings located by their
      ACTUAL copy (the section file names are not the headings), and
      the error-boundary capture's SSR-BYPASS (a full-page goto takes
      the server-render path — the browser route interception never
      sees the request; fixed to the spec's pause-click refresh
      pattern). The VLM standing checks **8/8** — the two first-pass
      flags ADJUDICATED BY EVIDENCE (the hero prompt's own
      h1/sub-headline enumeration error [the VLM's own description
      proving every element present] + the error-boundary capture's
      SSR-bypass [root-caused through the spec and fixed]).
- [x] F5 the docs alignment — README (the 837 badge + the
      28th-surface story + the session53 suite row + the 456 counts +
      the verification block), PAD (the S53 revision block, the
      ledger D184-D186, the 7.1 counts 62 specs/456), AGENTS (the
      counts + gotcha 63 — the reaper + context-order + SSR-bypass +
      settle + tally-extraction laws), CLAUDE (the session-53
      context), SKILL v2.52.0 (lesson 92: the resource-layer
      instrument + the serialization-shape law + the measurement-
      order laws), .env.example verified in sync (no config surface
      touched), this plan ticked, the session log 115, the worklog.
- [ ] F6 the commit + the wrapper push (in progress at close —
      the explicit `--remote` discipline; the fingerprint verified;
      the key shredded after; the pushed hash recorded below)

## The pushed-hash record (the closing discipline)

- (to be recorded at close)
