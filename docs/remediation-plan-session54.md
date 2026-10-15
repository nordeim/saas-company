# Remediation Plan — Session 54

The worklog S53 candidates (the reference-regression watch, the TENTH;
the 28th surface's ROUTE EXTENSIONS — the alternates' RESOURCE
censuses, the dashboard's authenticated resource census at further
depth; or the twenty-ninth surface — the PDF's COLOR-SPACE layer [the
ICC profile streams + the alternate color spaces], the font
SUBSET-table layer [the CIDToGIDMap + the Widths arrays], or the
page-content INHERITANCE layer [the /Resources inheritance through the
page tree]), answered against the measured codebase — with the
best-judgment scope: **ALL candidates probed on the raw shape FIRST**
(the lesson-88 discipline), two measured EMPTY/FLAT and registered as
LAWS, one measured RICH and became THE TWENTY-NINTH SURFACE — plus the
28th surface's route extensions delivered and the standing watch
re-verified for the TENTH consecutive session. **NO BUILD-WORTHY GAP
FOUND** — a REGISTRATION session (the S45/S48/S49/S50/S52/S53
pattern: pin, no build). The baseline is the Session-53 tree at
`193f02c` (the corrected honest gate: 833 = 252 unit + 125 smoke + 456
e2e — the S53-committed badge read 837, an arithmetic slip this
session corrects; the drift battery twenty-eight surfaces, 243
checks, zero drift — `docs/session_115.md`).

## The surface selection (research/recon-s54-probe*.mjs — the raw-shape
## probes on the surviving S53 artifacts, BEFORE any census was
## designed)

- **P1 — the COLOR-SPACE candidate: measured EMPTY-SET on both sides.
  ** Zero ICC-flagged streams, zero named /ColorSpace table entries,
  zero /Default* graphics-state overrides — on every probed route
  (/login, /faq, the dashboard), both sides. All color flows through
  device-space operators (the D177 color families) + pattern fills.
  Registered as a LAW (the D170 empty-set pattern at the color layer),
  not a surface — an empty-set finding is a RESULT, not a failure.
- **P2 — the page-tree INHERITANCE candidate: measured FLAT on both
  sides.** Every intermediate /Pages node carries ZERO inheritable
  attributes (/Resources, /MediaBox, /CropBox, /Rotate, /Group —
  carriesResources/carriesMediaBox/carriesGroup all false on every
  probed route). This proves the D184 per-page census COMPLETE by
  construction — no inherited resources were ever missed. Registered
  as a LAW.
- **P3 — the font SUBSET-TABLE candidate: measured RICH.** The Type3
  fonts carry full /Widths advance arrays (lengths 49-254, identical
  first/last values across sides); /login instead carries the
  Type0/CIDFontType2 DejaVu family (no /Widths — the CID descendant
  tables). Folded INTO the 29th surface.
- **P4 — THE DECISIVE DISCOVERY**: the D184 name tables' TARGETS —
  the ExtGState dicts (rich key shapes, SMask census, /BM /ca /CA /LW
  values), the Pattern streams (tiling: XStep/YStep/BBox; shading:
  /Coords/Function endpoints) — are a genuinely unmeasured INTERIOR
  layer. THE TWENTY-NINTH SURFACE: the RESOURCE-TARGET INTERIOR layer.

## The findings (F1-F7)

- **F1 — THE ALPHA-GRID LAW (D187, root-caused in flight)**: the
  first gs-interior census read DRIFT on EVERY route despite matching
  counts. The diff root-caused the family: the two pipelines
  serialize /ca /CA alphas DIFFERENTLY (clone 13/255 = 0.051,
  26/255 = 0.102, 64/255 = 0.251 on /login vs the live's raw
  0.05/0.1/0.25 — and the DIRECTION REVERSES on /faq, /thank-you,
  /accessibility where the live carries 5/255 = 0.0196, 128/255 =
  0.502, 179/255 = 0.702 against the clone's raw 0.02/0.5/0.7) —
  but every measured pair converges on the SAME Math.round(a*255)
  grid point (12.75->13, 5.1->5, 127.5->128, 25.5->26, 38.25->38,
  178.5->179): the 8-BIT COMPOSITE GRID, rendering-identical by
  construction. The D134 oklab family's SIXTH sighting, at the alpha
  layer. The census maps ca/CA through the grid; everything else
  stays byte-exact. THE STABLE SEVEN AT ALPHA-GRID PARITY — all
  seven verified EQ after the fix.
- **F2 — THE TYPELESS-OBJECT TRAP (D187's instrument correction)**:
  the first gs census found only 5 of /login's 14 ExtGStates — the
  /Type /ExtGState filter misses the TYPELESS entries (/Type is
  OPTIONAL per PDF 32000-1 Table 59; Skia omits it on 9 of 14) and
  most are referenced from FORM XObjects' NESTED /Resources, not the
  page name table. The fix: shape-based detection through the
  Table-59 key universe (all keys in the universe + at least one
  characteristic key), at the OBJECT level — the only complete
  census.
- **F3 — THE PIN-GENERATION SHAPE FIX**: the recon's interior pins
  silently DROPPED the font entries (fontWidthsCensus returns
  {count, fonts}, not {count, entries} — JSON.stringify drops
  undefined keys); caught by the pin-file review before any spec was
  written; the checks themselves were correct (they compared whole
  objects), only the pin payload was lossy. Re-generated with fonts
  included, determinism re-verified 2x.
- **F4 — THE SILENT-SKIP CATCH (D189, gotcha 64)**: the e2e chunk
  runner's tally read 301 through 11 chunks where the S53 record
  expects 311 — the reconciliation against `--list` per chunk
  exposed CHUNK 10 at 6 tests vs the recorded 16: the S53-committed
  runner's `session38-logo-petels` typo (the file is
  `session38-logo-petals.spec.ts`) SILENTLY SKIPPED the logo-petals
  spec's 10 tests — playwright path filters drop non-existent files
  WITHOUT error, and every chunk the runner did run passed green, so
  the tally summed "green" while short. FIXED in both runners; the
  corrected chunk 10 re-run 16/16; the full suite --list = 461 in
  63 files, every chunk reconciled at its list count.
- **F5 — THE S53 GATE-COUNT CORRECTION (D189)**: the S53 badge
  recorded 837 while its own decomposition (252 + 125 + 456) sums
  to 833 — a +4 arithmetic slip (the S51/S52 totals 817/826 were
  both pure sums). The honest S54 gate: **833 -> 838 = 252 unit +
  125 smoke + 461 e2e**; every badge now re-derived from the layer
  counts, never incremented from the previous badge. Corrected in
  README/AGENTS/CLAUDE/PAD + this plan.
- **F6 — THE PAD LEDGER DOC GAP**: the S53 session's ledger rows
  D184-D186 were never added to the PAD ledger table (only the
  revision block carried them). This session adds D184-D189 —
  closing the S53 doc gap and registering the S54 rows in one pass.
- **F7 — ZERO PARITY DRIFT at the 29th surface**: the stable seven
  at FULL INTERIOR PARITY on the first honest fresh measurement
  (gs at the alpha grid + patterns + font subset-metrics, all
  byte-identical); the alternates' name tables + interiors at
  parity on all five states; the landing's animated buckets in
  range; /demo the superset floor; the dashboard fingerprint
  registered. NO BUILD REQUIRED.

## The plan (R1-R8) — all [x] delivered

- [x] R1 — the standing watch, TENTH session (the recon ph1: the
      working eight at byte-identical word parity 739/24/101/36/
      335/390/566/285; the sitemaps 8/7; the soft-404 16=16; the
      D160 mobile-nav record — clone y21/y28/y35 all open the
      390x397 panel with 6 links, live toaster-blocked y21/y28 +
      y35-only; the live login landing at / with 739 words + the
      /dashboard 16-word SPA-404 with the h1 "404"; the clone login
      -> the working dashboard) — ph1 **31/31 GREEN**.
- [x] R2 — THE 29TH SURFACE registered (the recon ph2: the
      target-interior sweep — stable seven + landing + /demo both
      sides fresh-rendered, the dashboard in its own context; the
      five censuses [gs-at-alpha-grid, patterns, font-widths,
      color-space-empty-set, page-tree-flatness]; the generated pin
      constants, determinism verified 2x) — ph2 **45/45 GREEN**.
- [x] R3 — the 28th surface's ROUTE EXTENSIONS (the recon ph3: the
      five /login states' name tables + interiors on fresh renders,
      both sides) — ph3 **25/25 GREEN**. The full recon: **101/101**.
- [x] R4 — the TDD pins: `tests/e2e/session54-interiorlayer-laws.spec.ts`
      (the generated constants — research/gen-s54-spec-constants.js
      reads the recon's pin file and emits the EXPECT blocks; zero
      pin-transcription catches) — **5/5 GREEN on the first run,
      stable across THREE runs**.
- [x] R5 — the battery EXTENDED: drift-battery-s54.mjs/-s54b.mjs (the
      S53 columns + the INTERIOR + LAWS + ALTERNATES-INTERIOR/
      RESOURCE columns; ph5 grown 82 -> 162) — **323/323 GREEN ZERO
      DRIFT across six phases** (20 + 39 + 19 + 70 + 162 + 13), up
      from 243, the battery now running TWENTY-NINE surfaces.
- [x] R6 — the FULL GATE: lint ✓ typecheck ✓ build ✓ + **838 = 252
      unit + 125 smoke + 461 e2e** (the chunk runner FIXED — the
      petals typo corrected in both s53/s54 runners; every chunk
      reconciled against --list at its true count; the honest tally
      recorded in research/e2e-tally-s54.txt).
- [x] R7 — the screenshots + VLM: 21/21 captured (the capture server
      on :3500 against db/capture54.db; the dev DB canonical before
      AND after — 1/6/7,120/2/0, zero mutations); the VLM standing
      checks **8/8 on the FIRST PASS** (zero adjudication needed).
- [x] R8 — the docs alignment: README (the 838 badge + the
      29th-surface story + the session54 suite row + the counts +
      the S53-correction note), PAD (the S54 revision block + the
      ledger D184-D189 [the S53 rows D184-D186 added to the table,
      closing their doc gap] + the 7.1 counts 63 specs/461), AGENTS
      (the counts + gotcha 64 — the silent-skip + commit-artifact-
      drift + gate-arithmetic + alpha-grid + typeless-object +
      empty-candidate laws), CLAUDE (the session-54 context), SKILL
      v2.53.0 (lesson 93), `.env.example` verified in sync (no
      config surface touched), this plan, the session log 117, the
      worklog.

## The S54 candidates for Session 55

- The reference-regression watch continues (the ELEVENTH).
- The 29th surface's ROUTE EXTENSIONS: the alternates' INTERIOR
  censuses at further depth (the /SMask G-stream interiors — the
  luminosity-mask Form XObjects' own resource chains), or the
  dashboard's authenticated interior at further depth (the tiling
  patterns' OWN nested /Resources — the recursive census).
- Or the THIRTIETH surface: the /Function layer (the stitching
  functions' /Bounds /Encode arrays + the exponential functions'
  /N /Domain — the gradient math at the function-dict granularity),
  the /Metadata XMP layer (the streams' XML payloads), or the
  /MarkInfo-adjacent /PieceInfo layer (the private application
  data — likely another empty-set).
