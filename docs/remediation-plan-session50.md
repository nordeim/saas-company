# Remediation Plan — Session 50

The worklog S49 candidates (the reference-regression watch; the 24th
surface's ROUTE EXTENSIONS — the font census + metadata on the /login
alternates + the sign-up/forgot states, the dashboard's authenticated
print story; or the twenty-fifth surface — the PDF's XObject/image
layer, the annotation/appearance-stream layer beyond links, or the
print-time video frame contract), answered against the measured
codebase — with the best-judgment scope: **the image layer taken as the
25th surface's core (the print-pipeline RASTERIZATION census — which
page content Chromium embeds as bitmap XObjects at print), the /login
alternates' print story as the 24th surface's measured-and-registered
route extension (both delivered in the same pass), and the mobile-nav +
login standing records re-verified for the sixth consecutive session.**
The baseline is the Session-49 tree at `19174ca` (gate 797 = 252 unit +
125 smoke + 420 e2e; the drift battery TWENTY-FOUR surfaces, 50 checks,
zero drift — `docs/session_107.md`).

## The recon (research/recon-s50.mjs, five phases +
## research/stability-s50.mjs + the VLM attribution probe) — all
## candidates measured BEFORE the contracts were designed

- **R1 — the reference-regression watch (BOTH sides).** The working
  eight re-probed at exact word parity (/, /faq, /privacy, /terms,
  /refund-policy, /accessibility, /thank-you, /login at
  739/101/335/390/285/566/36/24 — every value byte-identical to the
  S45-S49 record); the soft-404 statuses at the registered family
  (/pricing live 200 soft-404 + clone 404; /dashboard live 200 soft-404
  + clone 307 login-gate; /checkout live 200 soft-404 + clone 404;
  /demo live 200 soft-404 + clone 200 working); the sitemaps at the
  registered sets (live 7, clone 8 — the strict superset). **NO
  RECOVERY, NO NEW REGRESSION.**
- **R2 — THE TWENTY-FIFTH SURFACE (the PDF XObject/IMAGE layer) — AT
  FULL PARITY ON ITS FIRST HONEST MEASUREMENT (the S45/S48/S49
  registration pattern: pin, no build).** The instrument: poppler's
  `pdfimages -list` over the SAME fresh paired renders. The census
  (page × type × dimensions × color × comp × bpc × enc × interp × ppi,
  SORTED — the emission order is a per-render object-allocation
  artifact that differs between sides with identical content; the
  object/ID columns and the size/ratio columns normalized OUT — the
  video frame's byte size is decode-timestamp-dependent):
  - The landing: **13 image XObjects, byte-identical censuses across
    sides** — the hero VIDEO frame (`1920x1080 icc 3c 8bpc image 92ppi`
    — the one full-viewport raster), the H1 GRADIENT TEXT raster
    (`2025x534 rgb + smask` — `background-clip: text` gradients
    rasterize at print; VLM-attributed: "Automated Workflows, Powered
    by AI" in its white-to-violet gradient), the CTA pill pair
    (`1047x105 rgb + smask` ×2 — the gradient-bordered button), the
    badge pill (`1165x103 rgb + smask`), and the blurred GLOWS
    (`626x204` + `710x288` gray jpeg on p1; `541x160` + `625x245` gray
    jpeg on p4 — the decorative shadow/glow layers, jpeg-encoded
    because their content is smooth and opaque).
  - /login: **6 image XObjects, byte-identical** (`1168x168`,
    `1765x2696`, `329x329`, `413x413` gray jpegs + `754x676 rgb +
    smask` — the login card's own glows and chrome rasters).
  - EVERY OTHER ROUTE the EMPTY SET on both sides (/faq, /privacy,
    /terms, /refund-policy, /accessibility, /thank-you, /demo, the 404
    — zero image XObjects: their graphics are CSS/SVG VECTORS, and the
    print pipeline keeps them vector). The empty-set contract at exact
    parity — the same S42 law: neither side ships bitmap content on
    the content routes.
  - THE RASTERIZATION LAW (the surface's mechanism, VLM-attributed):
    Chromium's print pipeline embeds as image XObjects exactly the
    content it cannot express vectorially — video frames, gradient
    text (`background-clip: text`), gradient-bordered/alpha-composited
    pills, and blurred glows/shadows — while regular text (the font
    layer, D171), SVG icons, and CSS shapes stay vector. Both sides
    produce the IDENTICAL structural census because the clone
    reproduces the same effects at the same geometry.
  - STABILITY PROVEN: the census keys re-rendered fresh — 13/6/0 exact
    on the probed routes, identical across renders. SAFE TO PIN.
- **R3 — the 24th surface's ROUTE EXTENSIONS: the /login ALTERNATES'
  print story — FULL PARITY.** The sign-up and forgot states (entered
  by the real button clicks, the S5 measured states) rendered to PDF
  paired clone-vs-live: the FONT censuses byte-identical (DejaVuSans
  2× + DejaVuSans-Bold 1× CID TrueType/Identity-H — the SAME
  system-stack census as the default state); the METADATA identical
  (Title "SAAS Company", Pages 1, the standard family — dates + file
  size normalized by construction); the LINK censuses both EMPTY SETS
  (the alternates carry buttons, not anchors — the D169 law extended
  to the states); the PRINT TEXT exact (sign-up 19 = 19, forgot 25 =
  25 words). The IMAGE censuses (the stability probe's extension):
  sign-up 2 (`1168x156` + `1765x1833`), forgot 2 (`1168x156` +
  `1765x1533`) — byte-identical across sides, and the tall raster's
  HEIGHT TRACKS THE CARD'S CONTENT (2696 default / 1833 sign-up / 1533
  forgot — the state-tracked raster record: the login background
  raster re-rasterizes per state at the card's rendered height).
- **R4 — the mobile-nav D160 record re-verified for the SIXTH
  consecutive session (the operator's standing focus).** The honest
  instrument per gotchas 56a/58b (the hit-target map + the ROW-CONTRACT
  detector + the hydration-timing law): the clone's burger (342,16,
  24×24 at 390) opens at ALL THREE probe points (y22/y28/y36 → the
  390×397 panel, 6 anchor rows, Escape closes between probes); the
  live's y22/y28 STILL hit the dormant react-hot-toast containers (the
  hit-target map records the exact `fixed top-0 z-[100]` div) and only
  y36 opens — the registered superset over the reference's degraded
  affordance, unchanged since S46. The panel contract identical
  (390×397, 6 links).
- **R5 — the live login -> /dashboard SPA-404 record re-verified
  (sixth consecutive session).** The operator login lands at `/`
  (739 words); `/dashboard` renders the 16-word SPA 404 (h1 "404").
- **ONE INSTRUMENTATION LAW CAUGHT LIVE (the lesson-88 family, new
  instrument):** `pdfimages -list`'s data rows are right-aligned with
  LEADING SPACES — a `!line.startsWith(" ")` filter silently returns
  an EMPTY census, and an empty-equals-empty comparison reads as false
  PARITY. The first PH3 parse did exactly that (reporting "0 images on
  every route"); the raw-output verification discipline (always print
  the instrument's own output before trusting a parse) caught it —
  the landing actually carries 13. The honest filter: drop the header
  and the dashed rule, keep every other line, split on whitespace
  runs. Recorded for the spec's instrument and SKILL lesson 89.

## The findings ledger (this session's D-entries)

- **D174 — the PDF XObject/IMAGE layer (the TWENTY-FIFTH SURFACE).**
  Measured at full parity on its first honest run; registered + pinned.
  The per-route sorted structural censuses (landing 13, /login 6, the
  alternates 2+2, every other route the empty set), the
  rasterization-law mechanism, the video-frame contract, and the
  order-invariance + size-normalization contract.
- **D175 — the 24th surface's route extensions: the /login alternates'
  print story.** The fonts/metadata/links/print-text/image censuses of
  the sign-up + forgot states at parity; the state-tracked raster
  heights record. Registered + pinned.
- **D176 — the leading-space row-filter law.** The lesson-88
  empty-census trap's third sighting (pdffonts' "CID TrueType" column
  in S49, the capture dead-click in S49, now pdfimages' right-aligned
  rows): every tabular instrument's parser must be validated against
  the instrument's RAW output before any empty reading is trusted.

## The plan (TDD where a contract changes; registration where parity
## already holds — the S45/S48/S49 pattern)

- **F1 — the session50 spec** (`tests/e2e/session50-imagelayer-
  alternates.spec.ts`): the D174 pins (the per-route image censuses
  with the exact sorted keys; the landing's 13-image contract incl.
  the video frame + the gradient-text raster + the CTA pair + the
  glows; the /login 6-image contract; the empty-set parity on the
  content routes + /demo + /thank-you + the 404; the
  order-invariance law — the census compared sorted), the D175 pins
  (the alternates' font census, metadata census, link empty-sets,
  print text 19/25, image censuses with the state-tracked heights).
  The instrument: pdfimages/pdfinfo/pdftotext — poppler-only, no
  python in the test layer. The parser built on the leading-space law
  (the in-flight lesson). RED first where feasible (a deliberate
  census-shape mutation check), then GREEN against the measured
  records.
- **F2 — the battery rebuild** (`research/drift-battery-s50.mjs`): the
  IMAGE column joins the adjudication layers — the paired clone-vs-live
  image census per route (sorted structural keys) + the ALTERNATES
  column (the sign-up/forgot print story paired) + the standing
  columns (route watch, print-text, link layer, entrance,
  font-embedding, metadata, the mobile-nav record). Expected ~56
  checks, zero drift.
- **F3 — the full gate.** Lint → typecheck → unit 252 → clean build →
  smoke 125 → e2e (the standing 420 + the session50 pins) — expected
  797 -> ~806. No src/ changes this session (a pure registration +
  versioning pass).
- **F4 — the screenshots** (the standing 21, the gotcha-44 scroll-
  through pass, the DB canonical before AND after — the two-pattern
  PATCH interception per lesson 87, the FAQ click's DOM proof per
  gotcha 59) + the VLM standing checks (8/8).
- **F5 — the docs alignment.** PAD (the S50 revision block, the ledger
  D174-D176, the §7 counts, the gate line), AGENTS (the counts + the
  leading-space law if it earns a gotcha), CLAUDE (the session-50
  context), README (the gate badge + the 25th-surface row), SKILL
  v2.49.0 (lesson 89: the leading-space row-filter law + the
  image-layer instrument + the rasterization-law mechanism),
  .env.example verified in sync (no config surface touched), this plan
  ticked, the session logs 108 + 109, the worklog.
- **F6 — the commit + the wrapper push** (the explicit `--remote`
  discipline; the fingerprint verified; the key shredded after).

## Execution status

- [x] R1-R5 recon complete (research/recon50-results.json +
      research/recon50-stability.json; this file's records)
- [x] F1 the session50 spec — 9/9 GREEN on the first run
- [x] F2 the battery rebuild with the IMAGE + ALTERNATES columns —
      66/66 ZERO DRIFT (three runs: the embedded-filename link-law
      fix + the ±1px jitter comparison in flight)
- [x] F3 the full gate — 806/806 (252 unit + 125 smoke + 429 e2e)
- [x] F4 the screenshots + the VLM standing checks
- [x] F5 the docs alignment
- [ ] F6 the commit + the wrapper push
