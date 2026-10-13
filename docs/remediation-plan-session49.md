# Remediation Plan — Session 49

The worklog S48 candidates (the reference-regression watch; the
23rd surface's ROUTE EXTENSIONS — the link censuses pinned beyond the
floors on the remaining routes and the named-destination layer at the
annotation granularity; or the twenty-fourth surface: the font-EMBEDDING
layer, the PDF metadata layer, or the selection/clipboard behavior
under print emulation), answered against the measured codebase — with
the best-judgment scope: **the font-EMBEDDING layer taken as the 24th
surface's core, the PDF metadata layer as its measured-and-registered
sibling, and BOTH 23rd-surface route extensions delivered in the same
pass.** The baseline is the Session-48 tree at `06e968e` (gate 788 =
252 unit + 125 smoke + 411 e2e; the drift battery TWENTY-THREE
surfaces, 30 checks, zero drift — `docs/session_105.md`).

## The recon (research/recon-s49.mjs, five phases + the stability
## probe + named-dests-s49.py) — all candidates measured BEFORE the
## contracts were designed

- **R1 — the reference-regression watch (BOTH sides).** The working
  eight re-probed at exact word parity (739/101/335/390/566/285/36/24
  — every value byte-identical to the S45-S48 record); the soft-404
  statuses at the registered family (/pricing live 200 soft-404 +
  clone 404; /dashboard live 200 soft-404 + clone 307 login-gate;
  /checkout live 200 soft-404 + clone 404; /demo live 200 soft-404 +
  clone 200 working); the sitemaps at the registered sets (live 7,
  clone 8 — the strict superset). **NO RECOVERY, NO NEW REGRESSION.**
- **R2 — the 23rd surface's ROUTE EXTENSIONS: the four unpinned
  content-route link censuses — FULL PARITY.** The pdftohtml censuses
  (origins stripped, internal anchors normalized to #page targets)
  byte-identical in set AND multiplicity, page counts paired:
  /terms 2/2 pages `{/faq:7, #1:6, /privacy:1, /terms:1,
  /accessibility:1, /refund-policy:2}`; /privacy 2/2 `{/privacy:1,
  #1:7, /faq:5, /terms:1, /accessibility:3, /refund-policy:2}`;
  /accessibility 3/3 `{/faq:5, #1:5, /privacy:1, /terms:1,
  /accessibility:1, /refund-policy:4}`; /refund-policy 2/2 `{/faq:4,
  #1:5, /privacy:1, /terms:1, /accessibility:1, /refund-policy:4}`.
  The landing's 87-anchor census re-verified byte-identical
  ({#5:24, #6:19, /faq:12, #4:11, #7:9, #1:6, /refund-policy:2,
  /terms:1, /privacy:1, /accessibility:1, /:1}).
- **R3 — the named-destination layer at annotation + table
  granularity — PARITY on all five probed routes.** The link-NAME
  census (pymupdf, the recon cross-validation instrument): the landing
  `{pricing:18, features:9, how-it-works:8, testimonials:8,
  <unnamed>:5}` byte-identical across sides; the four content routes
  `{<unnamed>:5}` each. The document-level destination TABLE
  (poppler's `pdfinfo -dests` — the e2e-embeddable instrument): the
  landing `{p1:"", p4:"features", p5:"how-it-works", p6:"pricing",
  p7:"testimonials"}` identical across sides; the content routes the
  single unnamed p1 destination each. The 48-link name census stays a
  RECON-recorded measurement (python banned from the test layer); the
  spec pins the poppler dest-table projection.
- **R4 — THE TWENTY-FOURTH SURFACE (the font-EMBEDDING layer) — AT
  FULL PARITY ON ITS FIRST MEASUREMENT (the S45/S48 registration
  pattern: pin, no build).** The instrument: poppler's `pdffonts` over
  the SAME fresh paired renders (never stale PDFs across instrument
  versions). Normalization: the subset prefix (`^[A-Z]{6}+`) is a
  per-render Skia artifact — stripped; the object-ID column dropped.
  The censuses (family × subset count × type × encoding) byte-identical
  on 9/10 probed routes: the landing `VendSans-Light 10× Type
  3/Custom`; /faq, /privacy, /terms, /refund-policy `7×` each;
  /accessibility `8×`; /thank-you `4×`; the 404 `5×`; /login
  `DejaVuSans 2× + DejaVuSans-Bold 1× CID TrueType/Identity-H` (the
  login card's system-ui stack falling back to the headless
  environment's DejaVu — IDENTICAL on both sides, the computed-family
  parity independently confirmed at the print layer). /demo: the
  clone's `7×` vs the live's `5×` — the REGISTERED working superset
  (the same family; more content painted, more subsets). The embedding
  contract holds everywhere: `emb=yes sub=yes uni=yes` for EVERY face
  on EVERY route on BOTH sides. The webfont/system-font type split is
  stable and lawful: @font-face webfonts (Vend Sans) embed as Type 3 /
  Custom; system-stack fonts (DejaVu) as CID TrueType / Identity-H.
  STABILITY PROVEN three ways: the S48 stale renders, the S49 fresh
  renders, and a dedicated re-render probe (research/stability-s49.mjs)
  all agree exactly (10/7/2+1 on the probed routes) — the subset
  counts are deterministic under the pinned Chromium and safe to pin.
  No Playfair/DM Serif faces appear in ANY route's PDF — the wordmarks
  are below-fold un-revealed entrances at print time (the S47
  convergence record), so no serif face is painted; the font-embedding
  census independently re-confirms that record.
- **R5 — the PDF METADATA layer (the 24th surface's measured
  sibling) — PARITY on 9/10 routes with `CreationDate`/`ModDate`
  (per-render timestamps) and `File size` (a derived byte count, not an
  information-dictionary property) normalized out.** Identical:
  `Title: SAAS Company` (the print-time document title = the page's
  `<title>` — the head-parity surface independently re-confirmed at
  the metadata layer), `Creator: Chromium`, `Producer: Skia/PDF m153`,
  `Pages` (the S42 records re-confirmed), `Tagged: no`, `Form: none`,
  `JavaScript: no`, `Encrypted: no`, `PDF version: 1.4`, `Page size:
  595.92 x 842.88 pts (A4)`, `Page rot: 0`, `Optimized: no`, the
  Custom Metadata/Metadata Stream/UserProperties/Suspects flags. /demo:
  the registered superset (Title `Book a Demo | SAAS Company` vs the
  shell's `SAAS Company`; Pages 2/1).
- **R6 — the mobile-nav D160 record re-verified for the FIFTH
  consecutive session (the operator's standing focus).** The honest
  instrument per gotcha 58b (the ROW-CONTRACT detector + the
  hydration-timing law): the clone's burger (y16-40 at 390) opens at
  ALL THREE probe points (y21/y28/y35 → the 397px panel, 6 anchor
  rows); the live's y21/y28 STILL hit the dormant react-hot-toast
  containers (`fixed top-0 z-[100]`) and only y35 opens — the
  registered superset over the reference's degraded affordance,
  unchanged since S46. The panel contract identical (bg-black/95,
  397px, 6 links).
- **R7 — the live login -> /dashboard SPA-404 record re-verified
  (fifth consecutive session).** The operator login lands at `/`;
  `/dashboard` renders the 16-word SPA 404 (h1 "404").
- **One instrumentation law learned in flight (the parser column
  trap):** pdffonts' TYPE column can carry a space (`CID TrueType`) —
  a per-column `\S+` regex silently returns an EMPTY census (the
  first ph3 parse did exactly that, and an empty-equals-empty
  comparison reads as false PARITY). The honest column split is on
  2+ spaces (`\s{2,}`) with the `yes yes yes` flag triplet and the
  trailing `obj gen` pair handled as units. Recorded for the spec's
  instrument and SKILL lesson 88.

## The findings ledger (this session's D-entries)

- **D171 — the font-EMBEDDING layer (the TWENTY-FOURTH SURFACE).**
  Measured at full parity on its first run; registered + pinned. The
  per-route family×count×type×encoding censuses, the emb/sub/uni
  contract, the /demo superset, and the webfont/system type split.
- **D172 — the PDF METADATA layer.** The 24th surface's sibling:
  Title/Creator/Producer/Pages + the document flags, dates + file
  size normalized by construction. At parity; registered + pinned.
- **D173 — the 23rd surface's route extensions + the named-destination
  tables.** The four content-route link censuses and the poppler
  dest-table layer at parity; registered + pinned.

## The plan (TDD where a contract changes; registration where parity
## already holds — the S45/S48 pattern)

- **F1 — the session49 spec** (`tests/e2e/session49-fontembedding-
  metadata.spec.ts`): the D171 pins (the per-route font censuses with
  the exact deterministic counts; the type/encoding classes; the
  emb/sub/uni contract; the /demo superset floor), the D172 pins (the
  per-route metadata censuses with the normalization BY CONSTRUCTION —
  the parse drops CreationDate/ModDate/File size; the /demo superset
  record), the D173 pins (the four content-route link censuses; the
  landing + content-route dest tables via `pdfinfo -dests`). The
  instrument: pdffonts/pdfinfo/pdftohtml — poppler-only, no python in
  the test layer. The parser built on the 2+-space column law (the
  in-flight lesson). RED first where feasible (a deliberate
  census-shape mutation check), then GREEN against the measured
  records.
- **F2 — the battery rebuild** (`research/drift-battery-s49.mjs`):
  the FONT-EMBEDDING column joins the adjudication layers — the
  paired clone-vs-live font census per route (family×count×type×
  encoding, subset prefixes stripped) + the metadata paired comparison
  (normalized) + the standing columns (route watch, print-text, link
  layer, entrance, the mobile-nav record). Expected ~34 checks, zero
  drift.
- **F3 — the full gate.** Lint → typecheck → unit 252 → clean build →
  smoke 125 → e2e (the standing 411 + the session49 pins) — expected
  788 -> ~799. No src/ changes this session (a pure registration +
  versioning pass).
- **F4 — the screenshots** (the standing 21, the gotcha-44 scroll-
  through pass, the DB canonical before AND after — the two-pattern
  PATCH interception per lesson 87) + the VLM standing checks (8/8).
- **F5 — the docs alignment.** PAD (the S49 revision block, the ledger
  D171-D173, the §7 counts, the gate line), AGENTS (the counts + the
  parser column law if it earns a gotcha), CLAUDE (the session-49
  context), README (the gate badge + the 24th-surface row), SKILL
  v2.48.0 (lesson 88: the empty-census parser trap + the font-embedding
  instrument + the stability-prove-before-pin discipline), .env.example
  verified in sync (no config surface touched), this plan ticked, the
  session logs 106 + 107, the worklog.
- **F6 — the commit + the wrapper push** (the explicit `--remote`
  discipline; the fingerprint verified; the key shredded after).

## Execution status

- [x] R1-R7 recon complete (research/recon49-results.json +
      recon49-nameddests.json; this file's records)
- [x] F1 the session49 spec
- [x] F2 the battery rebuild with the FONT-EMBEDDING column
- [x] F3 the full gate
- [x] F4 the screenshots + the VLM standing checks
- [x] F5 the docs alignment
- [x] F6 the commit + the wrapper push — done (297d9b5, wrapper-verified; the record below)

## The pushed-hash record (the closing discipline)

- Remediation commit **297d9b5** pushed via the SSH wrapper with the
  EXPLICIT `--remote git@github.com:nordeim/saas-company.git` (the
  S31 trap: the wrapper's DEFAULT remote is the runbook's example
  repo — the explicit flag held from the first dry-run, which
  confirmed the fast-forward `06e968e..297d9b5` against the correct
  remote).
- Wrapper-verified: remote main @ 297d9b5 == local HEAD; the
  fetch-independent HTTPS ls-remote agreed
  (297d9b5956f95f004d6ec55f8113ee9b54f69b75).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1-S48 record); the operator's key file shredded
  after use (the wrapper's own temp copy shredded at its teardown).
- The paramiko ssh shim survived at /home/z/bin/ssh (python3.13 +
  paramiko 5.0.0 — the Appendix A implementation); the wrapper needed
  /home/z/bin on PATH (exported for the run).
- Zero zombies at close (the port-sweep discipline held through every
  recon/battery/capture/adjudication run — one zombie listener after
  the stability probe swept clean by the second pass); the tree
  clean; no new branches.
