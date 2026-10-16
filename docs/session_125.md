# Session 125 (the Session-58 remediation cycle) — 2026-10-16

A CONTINUITY session — the workspace survived the inter-session
boundary again (the tree clean at `837df23`, a fast-forward pull
adding only the operator's raw S57 transcript `docs/session_124.md`;
node_modules, the Chromium v1243 binaries, `.env`, the canonical dev
DB 1/6/2, and the paramiko + ssh-shim infrastructure all intact — no
rebuild needed). The baseline verified: unit 252/252, the session57
spec 10/10, the full e2e `--list` 482 in 66 files (pre-S58),
lint/typecheck clean. **THE FIRST src/-CHANGE PARITY SESSION SINCE
S54** — the session's line-level census surfaced a REAL computed-style
divergence on the login alternates (the leaked heading tracking),
fixed through the full TDD discipline and converged into the standing
records.

F0 — THE FOURTEENTH STANDING WATCH (research/recon-s58-ph1.mjs on
:3400 against db/recon58.db, the canonical checksum e7f6c011
re-derived): **15/15 GREEN — ALL RECORDS HOLD**. The working eight at
BYTE-IDENTICAL word parity (739/24/101/36/335/390/566/285), the 404
route 16=16, the sitemaps clone 8 / live 7, the soft-404 family at
the registered statuses, the D160 mobile-nav record EXACT (the clone
all-three-y open the 390x397 panel, 7 rows; the live toaster-blocked
y21/y28 + y35-only; NO Tailwind v4 bug), the live login records
holding, the clone login → the working dashboard (233 words, h1
"Dashboard"). Re-verified POST-FIX after the h2 pin: 15/15 again.

F1 — THE SURFACE SELECTION (research/probe-s58-p1-textposition.mjs +
probe-s58-p2p3p4.mjs + probe-s58-p5-mutation.mjs, the lesson-88
discipline — the S57 worklog's THIRTY-THIRD-surface trio probed on
the raw shape FIRST): (a) the content streams' TEXT-POSITION layer
measured RICH (BT 37 vs 35 on /faq — same text, different block
decomposition: the glyph-run-splitting family) — SELECTED as THE
THIRTY-THIRD SURFACE; (b) the /HT candidate EMPTY-SET everywhere
(registered as a LAW); (c) the /OpenAction + /PageMode candidates
NULL everywhere (registered as a LAW); (d) the alternates' ICC
candidate the EMPTY-SET law confirmed (image counts 6/6/1/2/2 both
sides); (e) the dashboard's payload-under-mutation measured RICH (+1
gradient fn per chart row, tilings 54→127→142 bytes, YStep
9→9.000061, objects deterministic A===A2) — selected as THE MUTATION
COLUMN. THREE INSTRUMENT BIRTHS in flight, each root-caused as the
instrument: `pdfimages -list`'s `images` field is a COUNT not an
array; the orphaned :3401 server after a probe crash (the gotcha-31
port-sweep discipline); and THE GLYPH-STRING HEX LAW (the lesson-88
family's NINTH sighting) — the glyph strings are HEX (`<01> Tj`), a
paren-only regex reads every block as empty; the parser fixed in both
scripts.

F2 — THE THIRTY-THIRD SURFACE AT FULL LINE-LEVEL PARITY (D198): every
content stream's Td/Tm/TJ positioning records tokenized, the glyph
runs positioned, the pages compared at the LINE level — (y, x0, runs,
glyph-hash-without-run-markers), the per-baseline block merge
absorbing the ±2 BT/Tm page-layer re-blocking family (the D125 engine
structure, stable per side) into the honest comparable census. The
six deterministic content routes at FULL parity (thank-you 23, /login
6, /faq 36, privacy 39, refund 34, accessibility 64 lines — every
(y, x0, runs, glyphs) equal); the landing's 23-line STABLE CORE (the
entrance-gated below-fold family bucketed — below-fold lines vary
23/25/31 by entrance animation state); the default/error pair's two
registered ±1 run-split lines (y=701: 7v6 runs, y=348: 1v2 — same
glyph hashes, the D177 segmentation family); the 404's y=586 line
carrying the registered 2-space-glyph emission delta (58v60 runs, the
live emits B7 spaces at the quote boundaries — pdftotext
byte-identical, the D161 adjudication family); /demo the 27-line
superset floor over the live's 4-line shell. The ±2 BT/Tm page-layer
delta ROOT-CAUSED as glyph-run RE-SEGMENTATION (the same 32-glyph
line = ONE BT block on the live vs THREE on the clone at x=24/35/64
— the same family as the login alternates' decompositions).

F3 — THE REAL FINDING (D199): the login-local h2-h6 TRACKING
divergence, root-caused and FIXED. The line-level census measured the
three alternate-state h2s ("Create your account" / "Reset your
password" / "Check your email") at +3.84..4.57pt x-origin shifts with
IDENTICAL glyph hashes; the computed-style follow-up measured
`letter-spacing: 0.48px` (+0.02em at the 24px sm:text-2xl) on the
clone vs `normal` on the live — the width delta 7.67px = 16 glyphs ×
0.48px exactly. ROOT CAUSE: the reference's SPA bundle ships a base
`h1..h6 { letter-spacing: .02em }` rule (globals.css mirrors it at
parity with the SPA), but the reference's LOGIN bundle does NOT ship
it (the Session-7 bundle-divergence family) — the base rule leaked
onto the login card's h2s here. Scope: ONLY the login card's three
alternate-state h2s; all public routes at parity (the landing's h2s
carry explicit tracking classes). The leaked tracking also
RE-SEGMENTED the glyph runs (per-glyph 16/19/19 single-glyph Tj
decompositions vs the live's single merged run) — the RE-SEGMENTATION
root cause of the whole D177/D182 segmentation family. THE FIX (TDD
RED→BUILD→GREEN): the login-local `h2, h3, h4, h5, h6 {
letter-spacing: normal }` pin in login-card.tsx (beside the S37
font-family pin; the signin h1 untouched — its explicit
tracking-tight utility carries the route's heading tracking at
parity); the standalone rebuilt; the pin verified in the built output
(the SSR chunk carries the rule verbatim); the alternates converged
to FULL line-level parity (6/9/7 lines).

F4 — THE STALE-PIN CONVERGENCE (the gate's missing test): the
full-gate reconciliation summed 492 vs the global `--list` 493 — the
per-file reconciliation isolated the session52 spec: the S52 pin had
pinned the reset card's PRE-FIX 16-run per-glyph block-0
decomposition (the honest D182 divergence record of its day); the h2
fix CONVERGED it to 1 run — matching the live — so the OLD pin now
failed. THE LAW: when a src/ fix converges a registered divergence,
the old divergence pin pins a falsehood; the honest update re-pins
the converged truth with the provenance recorded (block-0
{tf:1, td:15, tj:16} → {tf:1, td:0, tj:1}; card-form text ops 74 →
44 — exactly the D182 30-op delta: 15 Td + 15 Tj). The updated S52
spec re-run: **9/9 GREEN**.

F5 — THE FOUR LAWS (D200-D203) + THE MUTATION COLUMN (D204): the /HT
empty-set (no halftone key in any resources-referenced /ExtGState on
any route, both sides); the /OpenAction + /PageMode null catalog-view
law (the document-view layer); the alternates' ICC empty-set law (the
S56 shape detection extended — image counts 6/6/1/2/2 identical
across sides); the gs VALUE-layer parity law (the /SA /LW /LC /LJ /ML
values at exact multiset parity on every route — the previously
unmeasured gs keys now pinned, the /SA null-filtering caught in
flight). THE MUTATION COLUMN: the dashboard's print payload TRACKS
THE DATA — +1 shading pattern per new chart row until the CHART_ROWS
ceiling (fns 4→5→6→7), the tiling XStep/YStep family (54→127→142
bytes; YStep 9 → 9.000061 at the 4-row reflow — the fractional-pixel
family), objects growing deterministically (292→303→320→329), gs
stable 18, tilings stable 3, A===A2 at every step.

F6 — THE TDD PINS: tests/e2e/session58-textposition-laws.spec.ts (the
constants GENERATED by research/gen-s58-spec-constants.js from the
cached renders — the zero-transcription discipline; regenerated
POST-FIX from the re-rendered cache): **11/11 GREEN**, stable across
runs. The in-flight pin-shape catches, each root-caused before the
constants were trusted: the ALTS.default missing key; the VP
key-string form; the mutation envelope's `{ok, data}` shape (the id
at res.data.id); the gs /SA null-filtering; the 404 pathname; the
landing's scrollThrough bucket treatment (the stable core 23 lines —
the entrance-animation family makes below-fold lines vary 23/25/31);
the D182 pin-your-own-input law (the recon email ≠ the spec email);
the form-line grouping key `y|size` not `y`; the constants'
lexicographic sort vs the numeric order (toEqual is order-sensitive).
The standalone's old h2 spec deleted (its content merged into the
session58 spec's D199 pin).

F7 — THE DRIFT BATTERY REBUILT as ONE consolidated ten-phase check
(the S55-S57 battery scratch lost to the sandbox reset — consolidated,
not re-ported; research/drift-battery-s58.mjs on the cached renders):
**103/103 GREEN ZERO DRIFT** (the print-text 15 + payload 7 + annots
10 + qq 9 + gs 15 + ICC 5 + catalog 10 + line-records 13 + dashboard
4 + the standing watch 15) — with FOUR instrument REDs root-caused
mid-run BEFORE any parity conclusion (gotcha 68): (i)+(ii) the
post-fix re-render had borrowed the spec's pin email
(`s52-pin@test.local`) against a live cache captured with the probe
email (`probe-s58@test.local`) — the RENDER-INPUT IDENTITY law (the
D177 interpolation family at the battery layer: a different
email/password changes the print text, the x-origins, the run
segmentation, even the printed bullet count — the alt-error diff
showed the email line AND 14-vs-24 password bullets); (iii) the P8
alt-reset form-line RED was the SAME input mismatch (the interpolated
y=209 line: x0 149.34 vs 138.63, runs 1 vs 2 — converged at identical
inputs); (iv) the P2 payload-constants RED was the COMPARATOR-FORMAT
law (payloadRows() returns sorted; the hand-written constants array
was not — clone===live was GREEN throughout, only the constants
comparison RED). Both fixed as the instrument; the clone login family
re-rendered with the live cache's exact inputs; the battery re-run
green.

F8 — THE FULL GATE: lint ✓ typecheck ✓ build ✓ (the standalone
rebuilt after the src/ fix) Vitest **252/252** ✓ smoke **125/125** ✓
e2e **493/493** (scripts/run-e2e-chunks-s58.sh — built from the S57
runner per gotcha 66c: the session58 spec APPENDED as its own chunk,
the S57 list untouched; the file-set diff against the global `--list`
EMPTY — 493 tests in 67 files). The gate's flakes root-caused: the
chunk-11 font-stack `entries.length=0` environment family (the known
S58-session flake — clean 25/25 on direct re-run after the orphan
sweep); the heavy PDF-batch chunk reaped in the command-window timeout
— run directly as two sub-batches per the house pattern (one
playwright invocation each, 36 + 26 passed; the S50+S51 overlap
arithmetic separated: 36 - 20 = 16 for S52+S53), the tally by
output-captured arithmetic: 440 (chunks 1-16) + 42 (chunk 17) + 11
(chunk 18) = **493**. **Gate: 859 → 870 = 252 + 125 + 493** (the
session58 suite's +11).

F9 — THE SCREENSHOTS + VLM: 21/21 refreshed (the capture server on
:3500 against db/capture58.db — a fresh copy of the canonical dev DB;
the dev DB canonical before AND after — 1/6/2, zero mutations,
md5-verified 048f12c5 → 048f12c5; the capture driver rebuilt from the
spec flows: the resilience banner through the PATCH-abort + Pause,
the error boundary through the BROKEN_ROW route fulfillment, the
mobile menu through the VISIBLE burger button — the S56 catch
honored). VLM **8/8 on the FIRST PASS — ZERO ADJUDICATIONS** (the
first session since the VLM checks began where every prompt read the
records correctly: the hero h1 "Automated Workflows, Powered by AI";
the Free/Pro/Enterprise tiers with Pro most-popular; the login copy
"Welcome to SAAS Company"; the dashboard's 6 workflows + "Onboarding
email orchestration" first; the mobile menu's 7 rows; the FAQ's 5
questions; the demo "Book a Demo" + 4 fields; the 404's 404 / Page
Not Found / Go Home).

DOCUMENTED: README (the 870 badge + the 33rd-surface story + the
session58 suite row + the counts), PAD (the S58 revision block + the
ledger D198-D204 + the 7.1 counts 67 specs/493), AGENTS (the counts +
gotcha 68 — the render-input identity + the comparator-format + the
glyph-hex + the stale-pin convergence), CLAUDE (the session-58
context), SKILL v2.57.0 (lesson 97 + the §12 header range), the
remediation plan session58, this session log, the worklog;
`.env.example` verified in sync (no config surface touched).

The S59 candidates: the FIFTEENTH standing watch; the 33rd surface's
route extensions (the alternates' full line-level constants under a
second interpolation input — the pin-your-own-input law's
cross-check; the error-state's banner line records under the
registered ±1 run-split family); or the THIRTY-FOURTH surface (the
/Kids page-tree VALUE layer, the pdftohtml -xml per-word bounding-box
layer, or the remaining /DecodeParms-family keys at the value layer).
