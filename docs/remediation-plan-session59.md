# Remediation Plan — Session 59

The worklog S58 candidates (the FIFTEENTH standing watch; the 33rd
surface's route extensions — the second-interpolation-input
cross-check, the error-state's banner line records; or the
THIRTY-FOURTH surface — the /Kids page-tree VALUE layer, the
pdftohtml -xml per-word bounding-box layer, the remaining
/DecodeParms-family keys), answered against the measured codebase —
with the best-judgment scope: the trio probed on the raw shape FIRST
(the lesson-88 discipline), the /Kids page-tree VALUE layer measured
IDENTICAL on every deterministic route (the S54 flatness law's
value-level complement — REGISTERED AS A LAW), the /DecodeParms
family measured the EMPTY-SET LAW (zero decode parms on every stream,
both sides, every route), and the pdftohtml -xml per-word layer
measured RICH — every word's (x, y, w, h, font) at EXACT parity on
every deterministic route but the FONTSPEC COLORS exposing TWO new
value families. **THE THIRTY-FOURTH SURFACE selected: the PDF
COLOR-FILL VALUE layer** — and the surface's census decoded the
families to a REAL token-level root cause, fixed through the full TDD
discipline (RED → BUILD → GREEN): **THE SECOND src/-CHANGE PARITY
SESSION IN TWO SESSIONS** (after 23 clean sessions).

## The environment (the CONTINUITY session — no rebuild needed)

- The workspace survived the inter-session boundary: the tree clean at
  `d18f9f1` (a fast-forward pull adding only `docs/session_126.md` —
  the operator's raw S58 transcript), node_modules intact, the
  Playwright Chromium v1243 binaries present, `.env` correct
  (`DATABASE_URL="file:../db/custom.db"`), the dev DB canonical at
  1/6/2 (md5 048f12c5), paramiko 5.0.0 (both interpreters — the
  S58-push continuation installed the venv copy) + the
  `/home/z/my-project/bin/ssh` shim in place. The baseline verified:
  unit 252/252, the full e2e `--list` 493 in 67 files (pre-S59),
  lint/typecheck clean, the standalone build current (the S58 h2-fix
  rebuild).

## F1 — THE FIFTEENTH STANDING WATCH: 15/15 GREEN, ALL RECORDS HOLD

The port of `research/recon-s58-ph1.mjs` (sed, per gotcha 67 — expand
the file, never re-type) against a fresh `db/recon59.db`: the working
eight at byte-identical word parity (739/24/101/36/335/390/566/285),
the 404 16=16, the sitemaps 8/7, the soft-404 family at the registered
statuses, the D160 mobile-nav record EXACT on both sides (the clone's
burger open at ALL THREE y-points — 390x397, 7 rows; the live's
toaster-blocked y21/y28 + y35-only — **NO Tailwind v4 bug**), the
live login records, the clone login → the working dashboard (233
words). The watch's own label carried forward (the FIFTEENTH).

## F2 — THE SURFACE SELECTION (the raw-shape discipline)

- **P1 — the /Kids page-tree VALUE layer: a LAW.** Every deterministic
  route IDENTICAL (pages/tree-nodes/depth-1-flat/kids-per-node/
  distinct-resources/mediaBox/rotate/pageKeys/inherit-keys all equal:
  root 8/8 pages, faq 2/2, accessibility 3/3…); /demo the registered
  2v1 superset (the clone's /Annots-bearing pageKeys). The S54
  flatness law's value-level complement — the page tree carries no
  new comparable surface.
- **P3 — the /DecodeParms family: the EMPTY-SET LAW.** Zero decode
  parms on every stream, both sides, every route (the 4/4/1/2/2
  filtered streams carry none).
- **P2 — the pdftohtml -xml per-word layer: RICH.** The word
  positions/sizes/fonts at EXACT parity on every deterministic route,
  but the FONTSPEC COLORS exposed the violet `#d500ff` v `#d400ff`
  (root + faq: the badge, the Apply CTA, the faq h1) and the
  near-black `#09090a` v `#08080a` (alt-error: the typed input text)
  — each a ±1/255-channel delta at IDENTICAL positions/sizes.

## F3 — THE ROOT CAUSE (the token-syntax divergence, D205/D206)

The PDF fill operators narrowed it: the clone writes `.8353 0 1 rg`
(= #d500ff = 213/255 exactly) where the live writes `.8333 0 1 rg`
(= 212.5/255 = the hsl float). **The live's palette ships
hsl-COMPONENT tokens** (`--violet: 290 100% 50%` consumed as
`hsl(var(--violet))`; its full 35-token SPA set + the login bundle's
own 212-token landscape fetched and reconciled) **whose runtime
conversion carries FLOAT precision** — hsl(290 100% 50%) converts to
R = X = 5/6 = .8333, and the CSSOM's `rgb(213, 0, 255)` serialization
(212.5 rounds up) **masked the half-LSB delta at every DOM layer**
(the computed-style probes measure EQUAL on both sides — verified on
the badge, the inputs, the banners). Only the print pipeline's float
operators reveal it. The comprehensive fill census (every stream,
every route, both sides — 21 differing value-pairs of 42 distinct
fills) decoded SIX families: the violet (17 fills), the
muted-foreground gray `.6392` v `.64` (5 — hsl(0 0% 64%)), the login
near-white `.9569…` v `.957…` (3 — hsl(240 4.8% 95.9%) = the login
bundle's own zinc-100 spec), the near-black `.0353…` v `.0351…` (2 —
hsl(240 10% 3.9%)), the red-50 `.9967…` v `.9961…` (1 — **REVERSED:
the clone's v4-OKLCH leak v the live's v3 hex**), the green-50
`.9413…` v `.9412…` (1 — the same, the direction flipped).

## F4 — THE TDD FIX (RED → BUILD → GREEN, 7/7 × 3)

- **RED**: `tests/e2e/session59-colorfill-laws.spec.ts` pinning the
  CONVERGED truth (the fill values, the source tokens, the emission
  laws, the guards) — 5 failed / 2 passed (the guards correctly
  pinning the already-correct state).
- **BUILD (the first attempt — the lightningcss catch)**: the literal
  `--color-violet: hsl(290 100% 50%)` was RESOLVED BACK TO `#d500ff`
  IN THE BUILT CSS — lightningcss quantizes any literal hsl() to
  8-bit hex at compile time. **THE VAR-INDIRECTION LAW**: the mirror
  must keep the live's own indirection — `--violet: 290 100% 50%;`
  (raw components — not a color value, invisible to the compiler) +
  `--color-violet: hsl(var(--violet));` (opaque var(), the browser
  resolves the float at runtime). Verified in the BUILT css:
  `hsl(var(--violet))` surviving unresolved ×23; the component var
  lands in :root (the live's variable landscape).
- **BUILD (the full set)**: `--muted-foreground: 0 0% 64%` +
  `--color-muted-foreground: hsl(var(--muted-foreground))`; the
  login-local `hsl(240 10% 3.9%)` (the body color +
  `--color-foreground` + `--color-card-foreground` — the inline
  `<style>` bypasses lightningcss) + `hsl(240 4.8% 95.9%)` (the light
  `--color-muted`); `--color-red-50: #fef2f2` +
  `--color-green-50: #f0fdf4` (**the s9 palette pins' two missed
  50-steps** — the error/success banners' oklch leaks); the inert
  card/border/input/muted tokens converged (every one unconsumed
  un-overridden; every conversion 8-bit-transparent).
- **GREEN**: 7/7, stable across THREE runs. The in-flight catches
  each root-caused as the instrument: the PDF's LEADING-DOT fill keys
  (`.8333` not `0.8333`); the v4 EMISSION-PATH law (the /70 modifier
  emits `color-mix(in oklab, …)` so the computed style always
  serializes oklab — the SURFACE truth is the fill values, the base
  color + the alpha gs); the near-black family living in the
  TYPED-input renders (the empty login dwell types nothing).
- **THE NOT-FIX GUARDS (D212)**: the reconciliation instrument itself
  first fell into the :root-vs-.dark trap (the last-definition regex
  reading the inert `.dark` block: `--primary: 290 100% 50%` v the
  rendering `:root` 267°) and flagged the CORRECT mirrors as REAL
  divergences — the block-aware extraction + the DOM glow-stops probe
  (`rgba(134,36,255,.2)` IDENTICAL on both sides — `.dark` never
  mounts, html/body class empty) adjudicated, and the guards now PIN
  `--color-primary: #8624ff`, `--color-destructive: #ef4444`,
  `--color-ring: hsl(240 10% 3.9%)` so the trap cannot recur.

## F5 — THE POST-FIX CONVERGENCE + THE BATTERY AT ELEVEN PHASES

The clone re-render (`render-s59.mjs`, the same inputs as the live
cache per gotcha 68): the six families CONVERGED (`.8333,0,1` 17v17;
the gray/near-white/near-black/red-50/green-50 all gone from the diff
table) — **the login route + all five alternates + the 404 at FULL
fill-census parity**. The remaining diffs: the count-only 0/1-fill
re-blocking families, the /demo superset, and ONE pre-existing
clone-only root fill (`.1059,.2902,1` — the animation-band structure
layer). The battery rebuilt (the S58's 103 checks carried + PHASE 11,
the 17-check color-fill column) at **120/120 GREEN ZERO DRIFT**; the
root checks presence-level per THE ANIMATION-BAND RENDER LAW (a fresh
render caught the mock unpainted — fill counts 92/103 v a prior
render's 230/407; the scroll-through experiment broke one-side-only
  comparability and was reverted; the deterministic-route summed
  census pinned instead: 18 families at FULL value parity, only the
  1,1,1 re-blocking family exempt).

## F6 — THE FULL GATE: 870 → 877 (252 + 125 + 500)

lint ✓ typecheck ✓ unit 252/252 ✓ smoke 125/125 ✓; e2e **500/500**
in 68 files (the session59 suite's +7; the file-set diff against the
global `--list` EMPTY; the runner built per gotcha 66c — the S58 list
untouched, the session59 spec APPENDED). The gate's two in-flight
findings, both root-caused: (a) the chunk-11 font-stack flake (the
S58-registered environment family — clean on the direct re-run after
the orphan sweep); (b) **the S57 dashboard payload pin** — the
1904x551 chart raster's sha shifted with the violet's half-LSB
convergence (25bdc4e3 → f2537a3e, deterministic across renders) —
THE STALE-PIN CONVERGENCE LAW's second sighting, re-pinned with the
provenance recorded.

## F7 — THE SCREENSHOTS + VLM

21/21 re-captured (the ported capture driver on :3500 against
`db/capture59.db` — a fresh copy of the canonical dev DB; the dev DB
canonical before AND after — 1/6/2, zero mutations, md5-verified).
**VLM 8/8 ON THE FIRST PASS — ZERO ADJUDICATIONS (the second
consecutive clean session)**: the hero h1, the Free/Pro/Enterprise
tiers with Pro most-popular, the login copy, the dashboard's 6
workflows, the mobile menu's 7 rows, the FAQ's 5 questions, the demo
form, the 404 shell.

## F8 — THE DOCUMENTATION

PAD (the S59 revision block + the ledger D205–D212 + the 7.1 counts
68 specs/500), AGENTS (the counts + gotcha 69 — the var-indirection,
the leading-dot fill keys, the animation-band render law, the
:root-vs-.dark trap), CLAUDE (the session-59 context), README (the
877 badge + the session59 suite row + the counts), SKILL v2.58.0
(lesson 98 + the §12 range), this plan, the session log 127, the
worklog.

## The pushed-hash record (the closing discipline)

- The remediation commit **a43d67c** (24 files: the session59 spec +
  the src/ token fixes [globals.css + login-card.tsx] + the S57
  dashboard-raster re-pin + the docs alignment + the 11 refreshed
  screenshots + scripts/run-e2e-chunks-s59.sh + the session log 127 +
  this plan + the worklog) — **PUSHED AND WRAPPER-VERIFIED**: the push
  ran `acfb319..a43d67c HEAD -> main` through the wrapper v3.1 (the
  paramiko shim on PATH — `/home/z/my-project/bin/ssh`), and the
  wrapper's own verification gate returned **remote refs/heads/main @
  a43d67c == local HEAD** with exit 0, the remote-tracking ref synced
  (git status agreeing, no "ahead" residue).
- The operator key's fingerprint was verified through paramiko's own
  key parse BEFORE the push and matched the S1-S57 record exactly
  (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU); the wrapper's
  temp key copy shredded after the run; the operator's key file
  destroyed after the final closing push.
- Zero zombies at close (the port-sweep discipline held through every
  probe/render/battery/capture/e2e run — :3000/:3100/:3400/:3401/:3500
  all swept clean and re-verified at the closing commit); the scratch
  DBs removed (recon59/capture59 + the S58 leftovers); the tree clean
  before the closing commit; no new branches.

## The S60 candidates

- The SIXTEENTH standing watch (the records now include the
  color-fill column's presence-level families).
- The 34th surface's route extensions: the second-interpolation-input
  cross-check for the fill families (the pin-your-own-input law at
  the color layer — the typed text's fill under a different email
  length); the banner fills under the animation-band bucketing; the
  remaining `outline-color:#d500ff` + box-shadow literal-violet rules
  (the 3 literal uses outside the token system — whether the live's
  equivalents carry the float too).
- Or the THIRTY-FIFTH surface: the /Shading PATTERN-interior value
  layer (the gradient stops' exact float triples at the pattern-dict
  level — the D205 family's shading counterpart); the /Function
  C0/C1 endpoint values under the token-syntax convergence (the
  violet gradients' endpoint floats — the first candidate the
  var-indirection law makes measurable); or the pdftohtml -xml
  READING-ORDER layer (the column-assignment + the per-word font
  family census at the word level).
