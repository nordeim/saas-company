# Remediation Plan — Session 52

The worklog S51 candidates (the reference-regression watch; the 26th
surface's ROUTE EXTENSIONS — the /login alternates' error/reset states'
vector censuses post-build, the dashboard's authenticated vector census at
depth; or the twenty-seventh surface — the print-time animation frame
contract, the accessibility-tree layer at print, or the PDF's structural
tree), answered against the measured codebase — with the best-judgment
scope: **ALL THREE candidates delivered in one pass** — the PDF STRUCTURAL
layer (the catalog/outlines/tagged-ness census) as the twenty-seventh
surface's core, the /login alternates' post-build vector censuses as the
26th surface's route extensions (the S51 badge build's convergence VERIFIED
at the operator layer, with the card form's text-family delta ROOT-CAUSED
at the glyph level), and the dashboard's authenticated vector census
registered at depth — plus the mobile-nav + live-login standing records
re-verified for the EIGHTH consecutive session. **NO BUILD-WORTHY GAP
FOUND** — this is a REGISTRATION session (the S45/S48/S49/S50 pattern:
pin, no build). The baseline is the Session-51 tree at `52237ea` (gate
817 = 252 unit + 125 smoke + 440 e2e; the drift battery twenty-six
surfaces, 113 checks, zero drift — `docs/session_112.md`).

## The recon (research/recon-s52.mjs + recon-s52b/c/d + rootcause + the
## stability probes — all candidates measured BEFORE the contracts were
## designed; the clone on :3400 against the scratch recon52.db)

- **R1 — the reference-regression watch (BOTH sides): ZERO DRIFT, the
  EIGHTH consecutive session.** The working eight re-probed at exact word
  parity (739/24/101/36/335/390/566/285 — landing/login/faq/thank-you/
  privacy/terms/accessibility/refund-policy, every value byte-identical
  to the S45-S51 record); the soft-404 statuses at the registered family
  (the live 16 words on /pricing /demo /dashboard /checkout; the clone's
  superset answers unchanged — /demo the 83-word working page, /dashboard
  the 24-word login-gate redirect); the sitemaps at the registered sets
  (live 7, clone 8). **NEW STANDING DATUM: the 404 ROUTE at DOM word
  parity 16 = 16** (a nonexistent route renders both sides' 404 shells
  with the identical interpolated copy "The page … could not be found in
  this application." + the Go Home button — the contract behind the
  standing D168 print-text record).
- **R2 — the 26th surface's ROUTE EXTENSIONS: the /login alternates'
  POST-BUILD vector censuses — THE S51 BADGE BUILD CONVERGED, the
  text-family delta ROOT-CAUSED AT THE GLYPH LEVEL.**
  - The RESET-SUCCESS state: **the convergence VERIFIED at the operator
    layer** — words 31 = 31, pages 1 = 1, fonts identical (DejaVuSans 2×
    + Bold 1×), the state-tracked raster **1765x1609 = 1765x1609** (the
    badge build's print story holding), the page-content families
    byte-identical, the color-VALUE sets identical (the 1/32-quantized
    census: RG(0,0,0)/RG(32,32,32)/rg(0,0,0)/rg(32,32,32) both sides).
    The card form's TEXT-family delta (clone 76 vs live 46 — 30 ops)
    **ROOT-CAUSED through the glyph-run extraction**: BOTH sides carry
    EXACTLY 6 BT blocks, blocks 1-5 byte-identical in op counts AND
    glyph strings; the single delta is block 0 — **the same 16 glyphs in
    the same order** (`0026 004B 0048 0046 004E 0003 005C 0052 0058
    0055 0003 0048 0050 0044 004C 004F` = "Check your email", 5+space+
    4+space+5) where **the clone emits 16 single-glyph Tj ops with 15 Td
    repositions and the live emits ONE combined Tj with 0 Td** — 15 Tj +
    15 Td = EXACTLY the 30-op delta. The registered D177 text-run
    segmentation family (the same words split into different glyph-run
    blocks — the D125 library-structure law), now proven at the glyph
    level; registration, NOT a build (never chase library-structure
    segmentation parity).
  - The ERROR state: **FULL PARITY** — words 30 = 30, fonts identical,
    the image census 6 = 6 byte-identical (the 2927 state-tracked
    raster), the page families + color-value sets identical, the form
    count 7 = 7 with the card form's registered text-segmentation family
    (clone 136 vs live 139 — the banner's words split one run apart, the
    D178 record unchanged).
- **R3 — THE TWENTY-SEVENTH SURFACE (the PDF STRUCTURAL layer — the
  catalog/outlines/tagged-ness census): FULL PARITY ON ITS FIRST HONEST
  MEASUREMENT.** The instrument: `qpdf --json --json-stream-data=inline`
  (the D180 law) read at the STRUCTURAL layer — the document catalog
  located by `/Type /Catalog` (the qpdf-12.2 JSON shape: the objects
  under `qpdf[1]["obj:N 0 R"]`, plain objects wrapped in `.value`,
  streams in `.stream.{data,dict}`, plus the TOP-LEVEL convenience views
  `outlines`/`acroform`/`encrypt`/`pagelabels`). The census per route:
  the catalog's sorted KEY set, the structural markers (/MarkInfo,
  /StructTreeRoot, /Outlines, /Lang), /ViewerPreferences, the top-level
  views, and the total object count. The measurements:
  - **THE CATALOG KEYS IDENTICAL ON EVERY ROUTE**: `{/Pages, /Type,
    /ViewerPreferences}` on the anchor-free routes (login, thank-you,
    demo) and `{/Dests, /Pages, /Type, /ViewerPreferences}` on the
    anchor-bearing routes (landing, faq, privacy, terms, refund-policy,
    accessibility) — the /Dests presence exactly tracking the D169
    link-census record (the named-destination tables).
  - **THE TAGGED/OUTLINE EMPTY-SET CONTRACT**: BOTH sides produce
    UNTAGGED, OUTLINE-FREE PDFs on every route — /MarkInfo absent,
    /StructTreeRoot absent, /Outlines absent, /Lang absent (Chromium's
    print pipeline emits neither tagged-PDF structure trees nor
    bookmarks; the empty-set parity pattern of D170 at the structural
    layer).
  - **/ViewerPreferences IDENTICAL**: `{/DisplayDocTitle: true,
    /Type: /ViewerPreferences}` both sides, every route.
  - **THE TOP-LEVEL VIEWS IDENTICAL**: outlines `[]`, acroform
    `{fields: [], hasacroform: false, needappearances: false}`, encrypt
    the full capabilities dict, pagelabels `[]` — both sides, every
    route.
  - **THE OBJECT COUNTS**: deterministic across renders (verified
    2× per route) and near-identical across sides on the stable routes —
    login 51/51, faq 241/241, privacy 234/234, terms 242/242,
    refund-policy 239/239, accessibility 315/315, thank-you 101/101;
    the landing 523/530 (the animated-form family — clone-side
    DETERMINISTIC at 523, the live's 530 its own frame state; the S38
    range law at the object-allocation layer); **/demo the REGISTERED
    SUPERSET at the structural layer** (clone 260 vs the live's 73 —
    the working page vs the 16-word SPA shell).
  - **THE INSTRUMENT LESSON (the lesson-88 family's FIFTH sighting,
    caught by the raw-output discipline BEFORE any census was
    trusted)**: the first structuralCensus prototype read the qpdf JSON
    through a v11-shaped guess (`qpdf[0].trailer./Root`) that matched
    NOTHING — every route "matched" at empty-equals-empty (the exact
    false-parity pattern of the S49 pdffonts column trap and the S50
    leading-space row filter). The honest fix: dump the raw JSON shape
    first, locate the catalog by its `/Type` — never trust a traversal
    that has not been shown a non-empty input.
- **R4 — the mobile-nav D160 record re-verified for the EIGHTH
  consecutive session (the operator's standing focus).** The honest
  instrument per gotchas 56a/58b (the hit-target map + the ROW-CONTRACT
  detector + the hydration-timing law, the burger's measured center
  x=354 on both sides): the clone's burger (24×24, aria-label "Open
  Menu" — the a11y superset) opens at ALL THREE probe points
  (y21/y28/y35 — the 390×397 panel, 6 links: Features | How It Works |
  Pricing | Testimonials | FAQ | Get Started); the live's y21/y28 STILL
  hit the dormant react-hot-toast container (the hit-target map records
  the exact `fixed top-0 z-[100]` div) and only y35 opens — the
  registered superset over the reference's degraded affordance,
  unchanged since S46. **No Tailwind v4 bug**: the panel's computed
  `bg-black/95` serializes through oklab() on the clone (v4) and rgba()
  on the live (v3) — rendering-identical, the gotcha-4 law re-verified
  by the panel detector that accepts both spellings (the standing
  spec's own regex).
- **R5 — the live login -> /dashboard SPA-404 record re-verified
  (EIGHTH consecutive session) AND the dashboard's authenticated vector
  census REGISTERED AT DEPTH (the clone-side contract).** The operator
  login (the reference account) lands at `/` (739 words — the landing);
  `/dashboard` renders the 16-word SPA 404 (h1 "404" + "Go Home"). The
  CLONE's authenticated dashboard: 292 words, 2 pages, VendSans-Light
  9×, ZERO image XObjects, ZERO link annotations, **34 form XObjects**
  (the D179 record re-verified), and the catalog at the structural
  layer = the same empty-set contract ({/Pages, /Type,
  /ViewerPreferences}, untagged, outline-free). The reference
  dashboard image (`docs/saas-company-dashboard.png`) is the CLONE'S
  OWN dashboard (the seeded NovaAI workspace — 5 active / 7,120 runs /
  160h; the image's "99.2% AVG SUCCESS RATE" predates the deliberate
  D108 stat-honesty fix that renamed the label to "Success rate" and
  the value to the run-weighted 99.5% — the live has no dashboard to
  mirror, so the clone's honest stat IS the contract; the agent-browser
  pass confirmed the full login -> dashboard flow live on :3400).

## The findings ledger (this session's D-entries)

- **D181 — the PDF STRUCTURAL layer (the TWENTY-SEVENTH SURFACE).**
  Measured at FULL parity on its first honest measurement: the catalog
  key sets, the tagged/outline empty-set contract, /ViewerPreferences,
  the top-level views, and the object counts (the stable routes
  exact; the landing's animated family; the /demo superset floor);
  registered + pinned.
- **D182 — the /login alternates' POST-BUILD CONVERGENCE at the
  operator layer + the glyph-level segmentation proof.** The S51 badge
  build verified holding (the 1609 raster, words 31, the 6-block
  census with blocks 1-5 byte-identical); the reset card form's 30-op
  text delta root-caused to the same 16 glyphs split per-glyph (clone)
  vs one run (live) — the registered D177 family at glyph granularity;
  the error state's 136/139 record unchanged.
- **D183 — the qpdf-12.2 JSON-shape law + the lesson-88 FIFTH
  sighting.** The structural traversal must locate the catalog by
  `/Type /Catalog` under `qpdf[1]` with plain objects in `.value` —
  a guessed traversal silently returns empty-equals-empty false parity
  (the raw-output discipline: show the traversal a non-empty input
  before trusting its census).

## The plan (TDD where a contract changes; registration where parity
## already holds — the S45/S48/S49/S50/S51 registration pattern)

- **F1 — the session52 spec** (`tests/e2e/session52-structurallayer-
  convergence.spec.ts`), ALL registration pins (no RED build expected —
  the tree already satisfies them; the first run IS the verification):
  - **THE STRUCTURAL-LAYER PINS (the D181 registration)**: the catalog
    key sets per route (the anchor-bearing vs anchor-free families),
    the tagged/outline empty-set contract (/MarkInfo + /StructTreeRoot
    + /Outlines + /Lang all absent, every route), the /ViewerPreferences
    exact dict, the top-level views (outlines [], acroform
    hasacroform false, encrypt capabilities present, pagelabels []),
    the object-count registrations (login 51, faq 241, privacy 234,
    terms 242, refund-policy 239, accessibility 315, thank-you 101,
    the landing 523 — all verified deterministic 2×; the /demo
    superset floor), and the dashboard's authenticated structural
    contract.
  - **THE ALTERNATES' POST-BUILD CONVERGENCE PINS (the D182
    registration)**: the reset state's card-form 6-block census (the
    block-0 per-glyph decomposition 16 Tj + 15 Td + the 16-glyph
    sequence; blocks 1-5 the registered op counts), the reset state's
    full parity fields (the 1609 raster, words 31, fonts, color-value
    sets), and the error state's card-form text 136 with the 7-form
    census.
  - **THE 404-ROUTE DOM DATUM PIN (the new standing datum)**: a
    nonexistent route renders 16 DOM words + the h1 "404" / h2 "Page
    Not Found" / Go Home contract (the live's SPA-404 mirrored — the
    record behind D168 at the DOM layer).
  - The instrument: qpdf --json at the structural layer (same binary
    as D177/D180 — no python in the test layer).
- **F2 — the battery rebuild** (`research/drift-battery-s52.mjs`): the
  STRUCTURAL column (the paired catalog + empty-set + object-count
  comparisons on every route) + the ALTERNATES-CONVERGENCE column (the
  reset state's post-build operator-layer parity + the glyph-sequence
  comparison) joining the standing columns (route watch, print-text,
  links, entrances, fonts, metadata, images, vector, alternates, the
  mobile-nav record). Expected ~135 checks, zero drift.
- **F3 — the full gate.** Lint → typecheck → unit 252 → clean build →
  smoke 125 → e2e (the standing 440 + the session52 pins) — expected
  817 -> ~828. ZERO src/ changes this session (the registration
  pattern).
- **F4 — the screenshots** (the standing 21, the gotcha-44 scroll-
  through pass, the DB canonical before AND after, the two-pattern
  PATCH interception, the FAQ click's DOM proof, the reset badge's
  waitFor proof) + the VLM standing checks (8/8).
- **F5 — the docs alignment.** PAD (the S52 revision block, the ledger
  D181-D183, the §7 counts), AGENTS (the counts + the gotcha 62 — the
  qpdf-JSON shape law + the lesson-88 fifth sighting), CLAUDE (the
  session-52 context), README (the gate badge + the 27th-surface story
  + the session52 suite row), SKILL v2.51.0 (lesson 91: the structural
  layer instrument + the glyph-level segmentation adjudication + the
  JSON-shape law), .env.example verified in sync (no config surface
  touched), this plan ticked, the session log 113, the worklog.
- **F6 — the commit + the wrapper push** (the explicit `--remote`
  discipline; the fingerprint verified; the key shredded after).

## Execution status

- [x] R1-R5 recon complete (research/recon-s52-state.json — 9 phase
      records; this file's records; the instrument + rootcause +
      stability probes under research/)
- [x] F1 the session52 spec — 9/9 GREEN (three pin-transcription catches in flight: the email-length family 76->74/136->134, the /demo /Dests transcription error, the landing's 523/525 animated-form bucket — each root-caused before re-pinning; stable across two runs)
- [x] F2 the battery rebuild — 195/195 ZERO DRIFT across five phases (up from 113; the STRUCTURAL + ALTERNATES-CONVERGENCE columns; the scrolled-landing records registered: print 670 / anchors 105 / images 29, all both-sides-equal; five instrumentation corrections in flight: the order-insensitive check, the 400ms scroll dwell, the stale-page render bug, the no-scroll vs scrolled record split, the reset card's root-caused 30-op band)
- [x] F3 the full gate — 826/826 (252 unit + 125 smoke + 449 e2e in four batches)
- [x] F4 the screenshots (21/21, the dev DB canonical before AND after — 1/6/7,120/2/0, zero mutations; the capture on :3500 against db/capture52.db) + the VLM standing checks 8/8 (the two first-pass flags ADJUDICATED BY EVIDENCE — both the prompts' own enumeration errors: the reset card's text-style back button + the mobile menu's Log In button row, both proven present by the evidence probes)
- [x] F5 the docs alignment (PAD: the S52 revision block + the ledger D181-D183 + the 7.1 counts 61 specs/449; AGENTS: the counts + gotcha 62; CLAUDE: the session-52 context; README: the 826 badge + the 27th-surface story + the session52 suite row; SKILL v2.51.0 lesson 91; .env.example verified in sync — no config surface touched)
- [x] F6 the commit + the wrapper push — done (see the record below)

## The pushed-hash record (the closing discipline)

- Remediation commit **6c36a7f** (the full hash
  6c36a7f560e0b738307d429a109062b58936f4e3, 29 files: the session52
  registration — tests/e2e/session52-structurallayer-convergence.spec.ts
  [9 pins] + docs/remediation-plan-session52.md + docs/session_113.md +
  the 21 refreshed screenshots + the docs alignment across PAD/AGENTS/
  CLAUDE/README/SKILL v2.51.0 + the worklog) pushed via the SSH wrapper
  with the EXPLICIT `--remote git@github.com:nordeim/saas-company.git`
  (the S31 trap held from the first dry-run — the dry-run confirming
  the fast-forward `52237ea..6c36a7f` against the correct remote).
- Wrapper-verified: remote main @ 6c36a7f == local HEAD; the
  fetch-independent HTTPS ls-remote agreed
  (6c36a7f560e0b738307d429a109062b58936f4e3).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1-S51 record); the operator's key file shredded after
  use (the wrapper's own temp copy shredded at its teardown).
- The paramiko ssh shim re-deployed on the reset sandbox
  (/home/z/bin/ssh, shebang /home/z/.venv/bin/python3 — the venv python
  owning the paramiko 5.0.0 install; PATH exported for the runs).
- Zero zombies at close (the port-sweep discipline held through every
  recon/battery/capture/adjudication run — :3400 + :3500 swept clean);
  the tree clean; no new branches.
