# Session 127 (the Session-59 remediation cycle) — 2026-10-16

A CONTINUITY session — the workspace survived the inter-session
boundary again (the tree clean at `d18f9f1`, a fast-forward pull
adding only the operator's raw S58 transcript `docs/session_126.md`;
node_modules, the Chromium v1243 binaries, `.env`, the canonical dev
DB 1/6/2, and the paramiko + ssh-shim infrastructure all intact — no
rebuild needed). The baseline verified: unit 252/252, the full e2e
`--list` 493 in 67 files, lint/typecheck clean, the standalone build
current from the S58 h2-fix rebuild. This session is **Session 59**
(session_125 the polished S58 log, session_126 the raw transcript).

## The surface selection (the lesson-88 raw-shape discipline)

The S58 worklog's THIRTY-FOURTH-surface trio probed on the cached
renders FIRST:

- **The /Kids page-tree VALUE layer — a LAW.** Every deterministic
  route IDENTICAL (pages, the flat depth-1 tree, kids-per-node, the
  distinct-resources count, the mediaBox, rotate, the pageKeys, the
  inheritable keys): root 8/8, faq 2/2, accessibility 3/3… The S54
  flatness law's value-level complement — registered, not a new
  surface. /demo the registered 2v1 superset.
- **The /DecodeParms family — the EMPTY-SET LAW.** Zero decode parms
  on every stream, both sides, every route.
- **The pdftohtml -xml per-word layer — RICH.** Every word's (x, y,
  w, h, font) at EXACT parity on every deterministic route… but the
  FONTSPEC COLORS exposed two NEW value families: the violet
  `#d500ff` v `#d400ff` (root + faq — the hero badge, the Apply CTA,
  the faq h1) and the near-black `#09090a` v `#08080a` (alt-error —
  the typed input text). Each a ±1/255-channel delta at identical
  positions and sizes.

**THE THIRTY-FOURTH SURFACE selected: the PDF COLOR-FILL VALUE
layer** — and the session's real work began at the fill operators.

## The root cause — THE TOKEN-SYNTAX DIVERGENCE (D205/D206)

The clone writes `.8353 0 1 rg` where the live writes `.8333 0 1 rg`
— the same color at every layer the eye and the CSSOM can see, half
an LSB apart in the float layer. The live's palette ships
**hsl-COMPONENT tokens** (`--violet: 290 100% 50%`, consumed as
`hsl(var(--violet))`) whose runtime conversion carries **float
precision** — hsl(290 100% 50%) converts to R = 5/6 = .8333 =
212.5/255, and the CSSOM's `rgb(213, 0, 255)` serialization rounds
the .5 up on BOTH sides, **masking the delta at every DOM layer**
(the computed-style probes measure EQUAL — verified on the badge, the
inputs, the banners). Only the print pipeline's float operators
reveal it. The clone's mirrors had been rounded to 8-bit hex
(#d500ff = 213/255 = .8353) by the sessions that built the @theme
from the computed-style record.

The full token reconciliation (the live's 35-token SPA set + the
login bundle's own 212-token landscape, both fetched and
block-parsed) plus the comprehensive fill census (every stream, every
route, both sides — 21 differing value-pairs of 42 distinct fills)
decoded **SIX families**: the violet (17 fills), the
muted-foreground gray (`.6392` v `.64` — the live's hsl(0 0% 64%)),
the login near-white (`.9569…` v `.957…` — the login bundle's own
hsl(240 4.8% 95.9%) zinc-100 spec), the login near-black
(`.0353…` v `.0351…` — hsl(240 10% 3.9%)), and — REVERSED, the
clone leaking — **the red-50 and green-50 OKLCH leaks**: the
error/success banners' `bg-red-50/70` + `bg-green-50/70` computed
v4's oklch defaults (oklab(0.971 0.0124 0.0039 / .7)) where the live
ships the v3 hex rgba(254,242,242,.7) — the Session-9 palette pins
had covered red/green-200..700 but MISSED the 50 steps.

## The TDD fix (RED → BUILD → GREEN, 7/7 × 3)

The RED spec pinned the converged truth; the first BUILD attempt
uncovered the session's build-layer discovery: **THE
VAR-INDIRECTION LAW** — lightningcss (the v4 build) resolves any
LITERAL `hsl()` in @theme back to 8-bit hex at compile time (the
built css carried `#d500ff` again, silently). The mirror must keep
the live's own indirection: `--violet: 290 100% 50%` (raw
components — not a color value, invisible to the compiler) +
`--color-violet: hsl(var(--violet))` (the var() is opaque; the
browser resolves the float at runtime; the component var also lands
in :root, matching the live's variable landscape). Verified in the
BUILT css: `hsl(var(--violet))` surviving unresolved ×23.

The full fix set: the muted-foreground indirection (hsl(0 0% 64%));
the login-local hsl specs (`hsl(240 10% 3.9%)` for the body color +
`--color-foreground` + `--color-card-foreground`; `hsl(240 4.8%
95.9%)` for the light `--color-muted` — the inline `<style>` bypasses
lightningcss so the literals survive); `--color-red-50: #fef2f2` +
`--color-green-50: #f0fdf4` (the two missed 50-step pins); and the
inert card/border/input/muted tokens converged (each verified
unconsumed un-overridden; each conversion 8-bit-transparent).
GREEN 7/7, stable across three runs — with the in-flight catches
each root-caused as the instrument: the PDF's LEADING-DOT fill keys;
the v4 EMISSION-PATH law (the /70 modifier emits color-mix(in
oklab, …) so the computed style always serializes oklab — the
SURFACE truth is the fill values); the near-black family living in
the TYPED-input renders.

**THE :root-vs-.dark ADJUDICATION (D212)**: the reconciliation
instrument itself first fell into the trap — the last-definition
token regex read the live's inert `.dark` block (`--primary: 290
100% 50%`) as the truth and flagged the CORRECT clone mirrors
(#8624ff, #ef4444) as REAL divergences. The block-aware extraction
+ the DOM glow-stops probe (rgba(134,36,255,.2) IDENTICAL on both
sides; `.dark` never mounts — html/body class empty) adjudicated,
and the NOT-FIX guards now pin the three values so the trap cannot
recur.

## The convergence + the battery at ELEVEN phases (120/120)

The clone re-render (the live cache's exact inputs per gotcha 68):
the six families CONVERGED — `.8333,0,1` at 17v17, the gray, the
near-white, the near-black, the red-50, and the green-50 all gone
from the diff table — **the login route + all five alternates + the
404 at FULL fill-census parity**. The remaining diffs are the
count-only re-blocking families, the /demo superset, and one
pre-existing clone-only root fill (the animation-band structure
layer).

The battery rebuilt at ELEVEN phases — the S58's 103 checks carried
+ PHASE 11 (the 17-check color-fill column) — at **120/120 GREEN
ZERO DRIFT**. The root checks are presence-level per THE
ANIMATION-BAND RENDER LAW: a fresh render caught the mock section
unpainted (fill counts 92/103 v a prior render's 230/407), and the
scroll-through experiment broke one-side-only comparability (the
cached live renders are same-dwell states) — the
deterministic-route summed census pinned instead: **18 families at
FULL value parity**, only the 1,1,1 re-blocking family exempt.

## The gate: 870 → 877 (252 + 125 + 500)

lint ✓ typecheck ✓ unit 252/252 ✓ smoke 125/125 ✓; e2e **500/500**
in 68 files (the session59 suite's +7; the file-set diff against the
global --list EMPTY; the runner built per gotcha 66c — the session59
spec APPENDED as its own chunk). Two in-flight gate findings, both
root-caused: the chunk-11 font-stack flake (the S58-registered
environment family — clean on the direct re-run after the orphan
sweep) and **the S57 dashboard payload pin** — the 1904x551 chart
raster's sha shifted with the violet's half-LSB convergence
(25bdc4e3 → f2537a3e, deterministic): a color fix REACHES the
rasters, and the old divergence pin was re-pinned with the
provenance recorded — THE STALE-PIN CONVERGENCE LAW's second
sighting.

## The screenshots + VLM

21/21 re-captured (the ported capture driver on :3500 against
`db/capture59.db`; the dev DB canonical before AND after — 1/6/2,
zero mutations, md5-verified). **VLM 8/8 ON THE FIRST PASS — ZERO
ADJUDICATIONS, the second consecutive clean session**: the hero h1,
the Free/Pro/Enterprise tiers with Pro most-popular, the login copy,
the dashboard's 6 workflows, the mobile menu's 7 rows, the FAQ's 5
questions, the demo form, the 404 shell.

## The documentation

PAD (the S59 revision block + the ledger D205–D212 + the 7.1 counts
68 specs/500), AGENTS (the counts + gotcha 69), CLAUDE (the
session-59 context), README (the 877 badge + the session59 suite
row), SKILL v2.58.0 (lesson 98), the remediation plan session59,
this log, the worklog.

## The S60 candidates

The SIXTEENTH standing watch; the 34th surface's route extensions
(the second-interpolation-input cross-check at the color layer; the
3 remaining literal-#d500ff outline/shadow rules); or the
THIRTY-FIFTH surface (the /Shading pattern-interior value layer —
the first candidate the var-indirection law makes measurable; the
pdftohtml -xml reading-order layer).
