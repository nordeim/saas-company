# Remediation Plan — Session 63

The worklog S62 candidates (the NINETEENTH standing watch with the
37th surface's transfer-mode column; the 38th surface — the
animation-band VALUE layer under a pinned-frame contract as the
recorded first candidate, or the remaining css-text mirror families,
or the /SMask-in-gs interior extension), answered against the
measured codebase — with the best-judgment scope: the watch (now
carrying the transfer-mode column) + the D160 mobile-nav
re-verification (the kickoff's explicit watch item) + **THE
THIRTY-EIGHTH SURFACE measured under the pinned-frame print
contract** — at measured parity with two T-invariant structural
deltas registered, requiring NO src/ fix; plus the session's
unscheduled deliverable — GOTCHA 73 (the /login streaming window)
with its three root-caused baseline failures and two TEST-ONLY
spec hardenings (the D135 re-attempt law).

## The environment (the second-consecutive warm workspace)

The workspace survived the inter-session boundary again: the repo a
fast-forward `git pull` to `09d9a23` — the remote had moved ONE
commit past S62's `f9a58ed`, the operator's own `update session log`
push creating `docs/session_134.md` (the S62 polished closing log,
closing the S62 chain exactly as S59–S61 were closed). node_modules,
the Chromium v1243 binaries, `.env`, the canonical dev DB (md5
`e22829c2c39d151da61a8103a136cd64`, verified before AND after every
server-touching phase), paramiko 5.0.0 + the ssh shim: all carried
over intact, zero rebuild.

## F1 — THE BASELINE (three failures, one root cause)

lint ✓ typecheck ✓ unit 252/252 ✓ build ✓ smoke 125/125 ✓ e2e
through the committed s62 chunk runner — **three in-flight failures,
all root-caused to ONE newly-isolated instrument law** (gotcha 73,
the /login STREAMING WINDOW):

- **brand-parity.spec.ts:231** (login card spacing): the raw-rect
  measurement at goto-return read gap 0 / cardH 0 — the probe
  timeline showed the full DOM present (`mainLen=13890`,
  `cardKids=2`, `text=[Email]`, `sheets=2`, `rs=complete`) with
  display/visibility normal, yet EVERY rect and offsetHeight ZERO
  for the first ~110-240ms, converging 0 → 16/746 at t+210-244ms.
- **palette-parity.spec.ts:143** (the keyboard-focused Sign in ring):
  the bounded Tab-walk exhausted INSIDE the window (nothing streamed
  there is focusable — blind Tab presses silently lost), the poll
  timing out at 10s.
- **palette-parity.spec.ts:179** (the focused email ring):
  `locator.focus()` waits only for ATTACHMENT — a focus attempt
  inside the window is a silent no-op, and the fixed 200ms offset
  landed marginal of the boundary completion.

THE MECHANISM (measured in vivo): /login is an async server
component (the real-auth gate — a live session read) under Suspense;
React streams the card markup inside a HIDDEN container and
completes the boundary only after the session query resolves. THE
FIX (test-only, the D135 re-attempt law, the pins unchanged): the
rect test polls the settled gap; the focus test re-attempts the
focus inside the poll; the Tab-walk re-attempts one Tab per poll
iteration. Computed-STYLE reads proved window-immune (colors and
borders never failed — only layout-dependent reads and focus
interactions can race). GREEN ×3 in the exact failing contexts.
Re-baselined: **e2e 517/517 in 71 files** (the baseline completed
after the hardenings), the audit clean (f9a58ed + 09d9a23 docs-only,
zero src/ since S60; npm-audit = the documented F10 braces residual).

## F2 — THE NINETEENTH STANDING WATCH: ALL RECORDS HOLD (with the transfer-mode column)

The fresh two-sided capture (the live at `saas-company.base44.app` +
the clone standalone on :3400 against the scratch `db/recon63.db`,
schema-pushed + seeded 1/6/2 at checksum `e7f6c011` — the fresh-DB
setup the S63 helper needed):

- **The working eight at byte-identical word parity** — / 739,
  /login 24, /faq 101, /thank-you 36, /privacy 335, /terms 390,
  /accessibility 566, /refund-policy 285 — every route fresh on BOTH
  sides. **The 404 16=16; the sitemaps 8/7**; the soft-404 family at
  the registered raw statuses; **the clone login → the working
  dashboard (233 words)**.
- **THE D131 TRIO (the S63 instrument catch)**: the live's computed
  borderColor now serializes SPACED (`rgb(229, 231, 235)`) — the
  color and width unchanged from the S61/S62 record; the watch's
  comparison made serialization-tolerant (the clone's committed specs
  pin the spaced form throughout, so both sides agree on the material
  fact).
- **THE READING-ORDER COLUMN** (S62): GREEN both sides — login 11 /
  faq 33 / thank-you 3 with the exact font censuses.
- **THE TRANSFER-MODE COLUMN (the S63 extension)**: the watch now
  prints /login + /faq + the landing per side and censuses the D218
  layer through qpdf — login 9× /Normal, faq 12× /Normal, THE
  /SCREEN LAW on the landing (exactly one /Screen of shape
  `/BM,/ca@ca255`, every other BM value /Normal, the transfer-function
  family empty) — GREEN on BOTH sides (the landing's bmBearing count
  delta 22v23 correctly inside the registered animation-band family,
  not pinned).

## F3 — THE D160 MOBILE-NAV RECORD: EXACT, NO TAILWIND v4 BUG (the kickoff's watch item)

Two-sided at 390×844: **the clone's burger clickable at ALL THREE
y-points** (the hit resolving to the burger's own svg path), every
click OPENS the canonical **7 rows × 44px** (Features, How It Works,
Pricing, Testimonials, FAQ, Log In, Get Started). **The live's burger
toaster-blocked** at y21/y28 (`div.fixed.top-0.z-[100]`), the y35
sliver reaching the burger but opening nothing — the registered
degraded-affordance family, unchanged.

## F4 — THE THIRTY-EIGHTH SURFACE: the animation-band value layer under the pinned-frame contract (D219)

The recorded first S63 candidate, measured on its first two-sided
pinned capture. **THE INSTRUMENT**: pause every Web-Animations-API
animation at a deterministic currentTime (T=1700 — mid-effect for
every duration in the family: 2000/3000/4000/5000/6000/14000ms, past
every delay ≤1000; and T=1000 as the second frame), then print.

- **(A) THE PINNED DETERMINISM LAW** — each side's pinned
  transfer-mode layer is **BYTE-IDENTICAL across prints** (two prints
  per side, per frame): the S62 "animation band" was pure CSS/WAAPI
  opacity-phase randomness; the rAF-driven families (the mockup
  dots' scale, the scroll-dot) contribute no gs entries — scale-only
  geometry never enters the alpha/blend layer.
- **(B) THE PINNED PARITY at T=1700** — the full-stroke family (5
  shapes) EQUAL, **14 of 16 alpha slots EQUAL at identical
  multiplicities**, THE /SCREEN LAW holds both sides — with **TWO
  T-INVARIANT STRUCTURAL DELTAS registered**: the live's /SMask pair
  (13 v 11 — the S62-recorded 13v11 now proven frame-INDEPENDENT, a
  constant engine family, not animation band) and the clone's extra
  @51 slot (1 v 2). At T=1000 the phase slots shift (@230 absent both
  sides; the live's @128 +1) — the phase slots are deterministic
  functions of the pinned frame.
- **(C) THE ENGINE CENSUS (the S63 discovery)** — the live drives
  its loop family through **WAAPI (opacity) + rAF (transform)**: the
  ambient's scale pulse (1↔1.15), the under-glow's translateY rise
  (0↔-12px), the five mockup dots' scale — all invisible to
  `getAnimations()` on the live (the S39 bundle-read wall, now
  root-caused: the registry sees only the WAAPI half). The clone
  consolidates the SAME choreography into CSS keyframes — measured
  equal in range and sync by the rAF-proof transform sampling; the
  mockup section's DOM census identical both sides (56 elements, 24
  shape keys, the same 7 dots). **No invention, no loss — NO src/
  fix required.**

## F5 — THE TDD PINS (the session63 suite, no src/ fix to drive RED)

`tests/e2e/session63-pinnedframe-laws.spec.ts` — 4 tests pinning the
clone side: D219a THE PINNED DETERMINISM LAW (print ×2 under the pin
→ byte-identical censuses + the empty-set re-check); D219b the pinned
census constants at T=1700 (33 gs / 22 BM-bearing / SMask 11 / the
BM census {21 /Normal + 1 /Screen} / the exact alpha multiset with
the @51 ×2 structural slot); D219c the pinned census at T=1000 (32 /
21 / SMask 11 T-invariant / the @51 ×2 T-invariant / the @230 phase
slot absent); D219d the ambient/glow full-choreography guard (opacity
0.3→0.5→0.3 + scale(1)→scale(1.15)→scale(1) + translateY 0→-12px→0 —
the live's WAAPI+rAF halves mirrored in CSS, pinned exactly so
neither an invention-removal nor a choreography loss regresses
silently) + the 32-animation at-rest census (the CSS consolidation
inventory at the measured counts). GREEN 4/4 stable across THREE
runs; lint + typecheck clean. Three in-flight pin-calibration
catches (all instrument-side): the /Screen entry's own @255 slot
double-counted in the first multiset form (the Normal-only multiset
excludes it); the under-glow's y-position pick (below the fold —
pick by the animation, not the viewport window); the DOM-lib
`Animation`/`AnimationEffect` base types not declaring
`animationName`/`target`/`getKeyframes` (the defensive casts).

## F6 — THE FULL GATE: 894 → 898 (252 + 125 + 521)

lint ✓ typecheck ✓ unit 252/252 ✓ build ✓ (unchanged src/) smoke
125/125 ✓ e2e **521/521** in **72 files** through the new
`scripts/run-e2e-chunks-s63.sh` (the s62 list verbatim + the session63
spec appended as its own chunk per gotcha 66c/67; the file-set diff
against the global `--list` EMPTY, 72/72). **ZERO flakes across all
23 chunks** in the final gate.

## F7 — THE SCREENSHOTS + THE VLM

21/21 re-captured (the capture driver on :3500 against
`db/capture63.db` — the dev DB canonical before AND after, md5
`e22829c2c39d151da61a8103a136cd64`, zero mutations; the port swept
incl. the next-server CHILD process). **VLM 8/8 — ZERO ADJUDICATIONS
(the sixth consecutive)**: the hero h1, the Free/Pro/Enterprise tiers
with Pro most-popular, the login copy, the dashboard's metrics, the
mobile menu's 7-row set, the FAQ's 5 questions, the demo form, the
404 shell.

## F8 — THE DOCUMENTATION

PAD (the S63 revision block + the D219 ledger row + the 7.1 counts 72
specs/521), AGENTS (the counts + the Session-63 gate prefix + gotcha
73), CLAUDE (the session-63 context), README (the 898 badge + the
session63 suite row), SKILL v2.62.0 (lesson 102), the remediation
plan (this file), the session log 135, the worklog.

## The S64 candidates

- The TWENTIETH standing watch (the records now include the 38th
  surface's pinned-frame column — the pinned constants at T=1700).
- The 39th surface: the /SMask-in-gs INTERIOR decomposition (the
  13v11 pair — now proven a T-invariant structural family, the
  element-level attribution of the live's two extra SMask entries +
  the clone's extra @51 slot under the pinned-frame instrument); or
  the animation KEYFRAME-VALUE layer of the remaining families (the
  border-shimmer rect's non-opacity properties; the
  organic-gradient's gradient-stop phase values under the pin); or
  the css-text mirror families.

## The pushed-hash record (the closing discipline)

- The remediation commit **d9b2add** (22 files, 982 insertions: the
  session63 spec +4 + the s63 chunk runner + the two TEST-ONLY spec
  hardenings [the gotcha-73 streaming-window fixes — brand-parity +
  palette-parity, the pins unchanged] + the docs alignment
  [PAD/AGENTS/CLAUDE/README/SKILL v2.62.0] + the 11 refreshed
  screenshots [10 byte-identical on re-capture — the determinism
  signal] + the session log 135 + this plan + the worklog) —
  **PUSHED AND WRAPPER-VERIFIED**: the push ran
  `09d9a23..d9b2add HEAD -> main` through the wrapper v3.1 (the
  paramiko 5.0.0 shim at `/home/z/my-project/bin/ssh` — the SECOND
  warm workspace in a row, zero re-extraction), and the wrapper's own
  verification gate returned **remote refs/heads/main @ d9b2add ==
  local HEAD** with exit 0, the remote-tracking ref synced (git
  status agreeing, no "ahead" residue).
- The operator key's fingerprint was verified through paramiko's own
  key parse BEFORE the push and matched the S1-S62 record exactly
  (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU); the
  wrapper's temp key copy shredded per its lifecycle; the operator's
  key file destroyed after the final closing push (the closing
  discipline).
- Zero zombies at close (the port sweep :3000/:3100/:3200/:3400/:3500
  — swept and re-verified at the closing commit); the scratch DBs
  removed (recon63/capture63); the tree clean before the closing
  commit; no new branches.
