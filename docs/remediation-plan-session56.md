# Remediation Plan — Session 56

The worklog S55 candidates (the reference-regression watch, the
TWELFTH; the 30th surface's route extensions — the dashboard's
function layer under live data, the /demo mockup gradients at print
time; or the thirty-first surface — the /Decode arrays, the /Info-dict
VALUE layer, or the inline-image BI/ID/EI family), answered against
the measured codebase — with the best-judgment scope: **ALL FIVE
candidates probed on the raw shape FIRST** (the lesson-88 discipline),
four measuring empty/already-pinned/thin — and the fifth's P1 sweep
(/Decode) surfacing an ICCBased colorspace on the landing's video
poster that the S54 color-space law (the page-resource layer) never
measured. The follow-up probe (recon-s56-ph2b) measured the
image-INTERIOR layer RICH: **THE THIRTY-FIRST SURFACE** selected.
**NO BUILD-WORTHY GAP FOUND** — a REGISTRATION session (the
S45/S48-S55 pattern: pin, no build; ZERO src/ changes). The baseline
is the Session-55 tree at `3eb288a` + the closing pushes (`9f813d9` +
`261f817`); the honest gate 843 = 252 unit + 125 smoke + 466 e2e
(`docs/session_119.md`).

## The environment rebuild (the fresh-clone precedent — the S53/S55
## pattern, re-run after the sandbox reset)

- The workspace re-cloned; `npm install`, `prisma generate`,
  `db:push` + `db:seed` (the canonical dev DB 1/6/2, checksum
  e7f6c011 — the gotcha-1 exported-`DATABASE_URL` trap hit and
  cleared: the shell re-injects the OUTER workspace's absolute path
  on EVERY command, so each DB/server command pins
  `DATABASE_URL="file:../db/custom.db"` explicitly); the Playwright
  Chromium binaries re-installed (the cache held v1200 but the repo's
  Playwright 1.63.0 needs v1243 — the session55 spec's first re-run
  failed 5/5 on the missing executable, an ENVIRONMENT failure
  root-caused before any code conclusion); paramiko 5.0.0 +
  the `/home/z/bin/ssh` shim re-deployed on the venv python; qpdf
  12.2.0 + the poppler suite verified present.
- `.env` re-created from `.env.example` (DATABASE_URL
  "file:../db/custom.db" — the db/ folder at the repo root, the
  documented contract).
- The baseline verified: unit 252/252, smoke 125/125, the session55
  spec 5/5, the full e2e `--list` 466 in 64 files — the S55 gate
  intact.

## The surface selection (research/recon-s56-ph2-probe.mjs +
## recon-s56-ph2b-probe.mjs — the raw-shape probes on FRESH renders,
## BEFORE any census was designed)

- **P1 — the /Decode candidate: measured EMPTY-SET on both sides**
  (0 images with /Decode across every route — the landing 16/15,
  /login 6/6, the dashboard 4). → REGISTERED AS A LAW (D194a).
- **P2 — the /Info-dict VALUE candidate: measured IDENTICAL but
  already pinned** (Producer "u:Skia/PDF m153" + Creator "u:Chromium"
  + the per-route Titles — the S49 PDF-metadata record; the probe
  re-derived it at parity). → A RE-VERIFICATION, not a new surface.
- **P3 — the BI/ID/EI inline-image candidate: measured EMPTY-SET on
  both sides** (0 inline-image operators in any content stream — all
  images XObject-referenced). → REGISTERED AS A LAW (D194c).
- **P4 — the dashboard function-depth candidate: measured THIN** (4
  exponential functions + 0 standalone — the S55 fingerprint
  unchanged under the seeded data; no stitching chains on the
  dashboard). → A RE-VERIFICATION.
- **P5 — the /demo print-gradient candidate: measured EMPTY-SET**
  (0 shading + 0 tiling patterns on the clone's working page AND the
  live's 16-word shell — the mockup's animated gradients never paint
  at print time). → REGISTERED AS A LAW (D194d).
- **THE DECISIVE FINDING (the P1 sweep's ICC surprise)**: the
  landing's obj4 (the 1920x1080 video poster) carries
  `[/ICCBased 5 0 R]` on BOTH sides — an ICC profile stream the S54
  color-space law (the PAGE-RESOURCE layer) never measured. The
  follow-up probe (ph2b) measured the image-INTERIOR layer: the ICC
  stream (716 bytes, N=3) **BYTE-IDENTICAL across sides** + the
  image /SMask relationships (the RGB→Gray mask pairs) + the
  /DecodeParms empty-set. → **THE THIRTY-FIRST SURFACE (D193)**.

## The findings (F1-F8)

- **F1 — THE THIRTY-FIRST SURFACE AT FULL PARITY (D193)**: the image
  XObject INTERIOR layer at the OBJECT level (the layer BELOW the
  page-placement census `pdfimages -list` walks — form-nested images
  and /SMask TARGET images invisible to poppler): the stable seven +
  the five /login alternates + the 404 + /demo at FULL OBJECT-LEVEL
  IMAGE-INTERIOR PARITY on the first honest fresh measurement
  (/login 6 images with the 754x676 RGB→Gray SMask pair identical
  across sides, the same object linkage; the alternates default/
  error 6 + the pair, reset 1, signup/forgot 2; the content routes
  the empty-set family), determinism verified 2x.
- **F2 — THE ICC SHAPE LAW (D193's instrument core, the lesson-88
  family's EIGHTH sighting)**: Skia's ICC profile streams carry NO
  /Subtype — just /N + /Length (+ /Alternate) — so the S54
  color-space detector (keyed on /Subtype === /ICCBased) was
  shape-blind at the image layer: it measured "zero ICC streams"
  while the landing carried one on both sides. The S54 law REFINED,
  not contradicted: zero NAMED page-resource /ColorSpace entries
  holds at its own layer; the image-embedded ICC layer sits below
  it. The FIRST honest ICC measurement: the landing's video poster
  profile, 716 bytes, N=3, **byte-identical across sides** (sha
  7f19707f9846243d).
- **F3 — THE LANDING'S FORM-NESTED SUPERSET REGISTERED**: at the
  object level the clone emits 16-18 images vs the live's stable 13
  (the 1x26 + 738x1 + 738x26 RGB slivers on every render; the 201x1
  pair frame-dependent 2-of-3 renders; the 710x28x ±1px jitter both
  sides) — the clone's CSS-keyframe animated elements rasterize as
  image slivers inside FORM XObjects at print time where the live's
  framer-inline elements stay vector. The D125 engine-structure
  family, REGISTERED not "fixed": the page-PLACED census stays at
  13/13 parity (the S50 pin green — both layers true, different
  censuses).
- **F4 — THE FOUR LAWS (D194)**: the /Decode EMPTY-SET + the
  /DecodeParms EMPTY-SET + the inline-image BI/ID/EI EMPTY-SET
  (every public route, both sides — all 31 measured renders zero)
  + the /demo print-gradient EMPTY-SET.
- **F5 — THE RE-VERIFICATIONS**: the /Info VALUE layer (the S49
  record re-derived at parity — Producer/Creator/Title identical on
  all eight info-pinned routes) + the dashboard's function
  fingerprint (the S55 record holding: 4 exponential + 0 standalone;
  the authenticated interior: 4 images + the 1904x551 SMask pair +
  the "Dashboard | SAAS Company" Title).
- **F6 — THE TWELFTH STANDING WATCH: ALL RECORDS HOLD** (the recon
  ph1, 14/14 GREEN): the working eight at byte-identical word parity
  (739/24/101/36/335/390/566/285), the 404 route 16=16, the sitemaps
  8/7, the soft-404 family at the registered statuses, the D160
  mobile-nav record exact (the clone all-three-y open the 390x397
  panel — NO Tailwind v4 bug; the live toaster-blocked y21/y28 +
  y35-only), the live login records holding (the operator
  credentials → / at 739 words; /dashboard the 16-word SPA-404 with
  h1 "404"), the clone login → the working dashboard (233 words, h1
  "Dashboard").
- **F7 — THE INSTRUMENT CATCHES (three, each root-caused before any
  code conclusion)**: (a) the ph1 status probe read 200 for the
  clone's /dashboard because `page.goto` FOLLOWS the 307 — the
  soft-404 family measures at the WIRE with `redirect: "manual"`;
  (b) the live burger probe selected `nav button`'s FIRST match —
  the invisible desktop Log In at 0x0 — the honest selector is the
  VISIBLE nav button (the D160 law); (c) the determinism test's
  render A ran on a blank page (the missing initial dwell — an
  empty census, not a nondeterminism).
- **F8 — THE SILENT-SKIP RECURRENCE (gotcha 66c, caught in
  flight)**: the S56 chunk runner was copied from the S55 runner
  with a sed that REPLACED `session55-functionlayer-laws` with the
  new spec — silently dropping the session55 spec's 5 tests (the
  tally summed 467 while `--list` said 472; caught at the
  reconciliation, the runner fixed to ADD the new spec, the spec
  re-run 5/5). The gotcha-64 law's own corollary: chunk runners are
  versioned artifacts — ADD the new session's spec, never REPLACE.

## The plan (R1-R8) — all [x] delivered

- [x] R1 — THE TWELFTH standing watch (research/recon-s56-ph1.mjs,
      self-contained boot-work-kill on :3400 against db/recon56.db):
      **14/14 GREEN** (the three instrument catches in flight, each
      root-caused as the instrument, not the code).
- [x] R2 — THE SURFACE-SELECTION PROBES (recon-s56-ph2-probe.mjs +
      recon-s56-ph2b-probe.mjs + probe-landing-stability-s56.mjs):
      all five candidates probed raw-first + the image-interior
      layer measured at depth + the landing's 3x3 render stability
      (the live stable 13 + the jitter; the clone 16-18 with the
      201x1 pair frame-dependent) — the decisive evidence for the
      surface selection above.
- [x] R3 — THE FULL RECON (recon-s56.mjs — one boot-work-kill unit,
      the fresh db/recon56.db): the stable seven + landing + /demo +
      the dashboard + the five alternates, BOTH sides — the stable
      seven + alternates ALL EQ, the four laws all-zero on 31
      renders, the /Info values EQ on all eight, determinism 2x,
      the pin file written (research/s56-pin.json).
- [x] R4 — THE TDD PINS: `tests/e2e/session56-imagelayer-interiors.spec.ts`
      (the constants GENERATED by research/gen-s56-spec-constants.js
      from the recon's pin file + the stability probe — the
      zero-transcription discipline; one in-flight instrument catch:
      F7c) — **6/6 GREEN, stable across THREE runs**.
- [x] R5 — THE BATTERY REBUILT (drift-battery-s56.mjs + -s56b.mjs —
      the S53/S55 fresh-clone precedent, the instruments ported from
      the committed specs; part B running on part A's CACHED renders):
      **201/201 GREEN ZERO DRIFT** across six phases (the standing
      watch 16 + the poppler print layers 40 + the structural/
      resource layers 27 + the interior layers 33 + the S55 columns
      30 + the S56 columns 48 + the dashboard 3) — the battery now
      running THIRTY-ONE surfaces.
- [x] R6 — THE FULL GATE: lint ✓ typecheck ✓ build ✓ Vitest 252/252
      ✓ smoke 125/125 ✓ e2e **472/472** (scripts/run-e2e-chunks-s56.sh
      — the S55 runner copied WITH the silent-skip recurrence caught
      + fixed in flight [F8]; every chunk reconciled at --list: 472
      tests in 65 files — the honest tally).
- [x] R7 — THE SCREENSHOTS + VLM: 21/21 captured (the capture
      server on :3500 against db/capture56.db; the dev DB canonical
      before AND after — 1/6/2, zero mutations; the mobile-burger
      capture fixed to the VISIBLE nav button — the D160 law); the
      VLM standing checks 5/8 first-pass + **3 ADJUDICATED BY
      EVIDENCE** (all three the prompt's own enumeration errors: the
      login copy "Welcome to SAAS Company" not "Welcome back", the
      tiers Free/Pro/Enterprise not "Basic", the hero's below-fold
      logo strip — the word-parity record byte-identical across
      sides outranks the prompt).
- [x] R8 — THE DOCS ALIGNMENT: README (the 849 badge + the
      31st-surface story + the session56 suite row + the counts),
      PAD (the S56 revision block + the ledger D193/D194 + the 7.1
      counts 65 specs/472), AGENTS (the counts + gotcha 66 — the
      object-level census law + the ICC shape law + the silent-skip
      recurrence), CLAUDE (the session-56 context), SKILL v2.55.0
      (lesson 95 + the §12 header range corrected), `.env.example`
      verified in sync (no config surface touched), this plan, the
      session log 121, the worklog.

## The gate arithmetic (the honest re-derivation — gotcha 64c)

- 252 unit + 125 smoke + 472 e2e = **849** (the S55 gate 843 + the
  session56 spec's 6 e2e). Re-derived from the layer counts, never
  incremented.

## The S57 candidates for Session 57

- The reference-regression watch continues (the THIRTEENTH).
- The 31st surface's route extensions: the /login alternates' ICC +
  SMask-pair records under the error-state's banner (+1 object
  family), or the 404's + /thank-you's print-image floors.
- Or the THIRTY-SECOND surface: the image XObjects' STREAM interiors
  (the DCT vs the raw Flate payloads at the byte level — the
  stream-length + the sha census), the content streams' graphics-state
  stack depth (the q/Q operator pairing), or the /Annots-dict
  interiors (the link annotations' /A action dicts at the value
  layer).

## The pushed-hash record (the closing discipline)

- The remediation commit **<PUSHED_HASH>** pushed via the SSH wrapper
  with the EXPLICIT --remote git@github.com:nordeim/saas-company.git;
  wrapper-verified (remote main @ <PUSHED_HASH> == local HEAD); the
  fetch-independent HTTPS ls-remote cross-check agreed.
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push; the wrapper's temp key copy shredded after
  each run; the operator's key file destroyed after the closing push.
- Zero zombies at close (the port-sweep discipline held through every
  recon/battery/capture/e2e run — :3400/:3401/:3402/:3403/:3500/:3100
  swept clean; two in-flight orphans from crashed scripts swept by
  port→PID before they could poison a later run); the tree clean
  before the closing commit; no new branches.
