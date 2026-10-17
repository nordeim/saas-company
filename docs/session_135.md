# Session 135 — the S63 raw transcript

Workspace refreshed: fast-forward `git pull` `f9a58ed..09d9a23` — the
operator's `update session log` commit creating `docs/session_134.md`
(115 lines, the S62 polished closing log), closing the S62 chain
exactly as the pattern predicts. **Current session = S63** (producing
`session_135.md` + `remediation-plan-session63.md`; `session_136.md`
the operator's later closing log). Environment verified — the
SECOND-consecutive warm workspace: `.env` correct, the dev DB canonical
(md5 `e22829c2c39d151da61a8103a136cd64`), Playwright 1.63.0,
paramiko 5.0.0 + the ssh shim, all ports free, tree clean at
`09d9a23`. session_134 absorbed (the operator's polished S62 log —
mirrors my own execution record exactly). Core doc markers verified
(AGENTS 894/Session-62 prefix, PAD D218 + 71 specs/517, README 894
badge, SKILL v2.61.0, sitemap+robots under src/app/, vitest +
playwright configs, `.env.example`).

F1 THE BASELINE: lint ✓ typecheck ✓ unit 252/252 ✓ build ✓ smoke
125/125 ✓ — then e2e chunk 1: **52/53, ONE FAILURE**
(brand-parity.spec.ts:231, the login card-spacing pin: gap read 0
expected 10). Reproduced standalone (not a chunk-context flake);
passed grep-isolated — a warm-context timing race. The gap-over-time
probe (fresh contexts, 5 passes): passes 4-5 showed `cardH=0.0,
lblH=0.0` for the first ~120-220ms with `transform:none, anims=0,
mt=0px` — all-zero bounding rects. The discriminator probe: during
the transient the full DOM is present (`mainLen=13890, cardKids=2,
text=[Email], sheets=2, rs=complete`), display/visibility normal —
yet rect AND offsetHeight read ZERO, flipping to 16/746 at
t+210-244ms. **ROOT CAUSE: the /login STREAMING WINDOW** — /login is
an async server component (the real-auth session read) under
Suspense; React streams the card inside a HIDDEN container and
completes the boundary only after the session query resolves. The
raw-rect measurement raced the window. **GOTCHA 73 registered.** The
fix (TEST-ONLY, the D135 law, pins unchanged): the poll form on the
settled gap. GREEN 26/26 ×3 + lint/typecheck.

Resuming the baseline: chunk 4 failed (palette-parity.spec.ts:179,
the focused email ring) — the SAME family: `locator.focus()` waits
only for ATTACHMENT, a focus inside the hidden window is a silent
no-op, the fixed 200ms offset marginal. Standalone re-run: the
sibling test 143 failed instead (the bounded Tab-walk exhausted
inside the window — blind Tab presses silently lost; the poll timed
out at 10s). Family audit: session43/session41/mobile-navigation
target static routes or actionability-checked interactions — immune;
only the /login focus pair exposed. Both fixed with the D135
re-attempt-in-poll form (the focus re-attempted / one Tab per
iteration inside the poll). GREEN 14/14 ×3. **BASELINE COMPLETE —
full gate 894 GREEN** (e2e 517/517 in 71 files through the s62
runner, batches + resume; zero further flakes).

F2 THE AUDIT: f9a58ed (2 docs files — the S62 closing) + 09d9a23
(1 doc — the operator's log) — docs-only, zero src/ since S60;
npm-audit = the documented F10 braces residual (the override
applied; the "fix" a breaking eslint-config-next downgrade). CLEAN.

F3 THE NINETEENTH STANDING WATCH (watch-s63.mjs — the S62 watch
ported + THE TRANSFER-MODE COLUMN, the S63 extension: /login + /faq
+ the landing printed per side, the D218 constants through qpdf).
LIVE: 20/21 — the new column PERFECT (login 9×/Normal, faq 12×
/Normal, THE /SCREEN LAW: exactly one /Screen `/BM,/ca@ca255` + 21×
/Normal + the empty xfer); the ONE RED was the D131 trio — the live
now serializes its computed borderColor SPACED (`rgb(229, 231,
235)`) with the color/width unchanged; the comparison made
serialization-tolerant (the clone's committed specs pin the spaced
form — both sides agree on the material fact). LIVE re-run: **ALL
RECORDS HOLD 21/21**. CLONE: first run crashed at F6 (login flow
timeout — the fresh `db/recon63.db` was never schema-pushed/seeded);
pushed + seeded 1/6/2 (checksum `e7f6c011`); re-run: **ALL RECORDS
HOLD 21/21** incl. the transfer-mode column (the landing's
bmBearing 22v23 delta correctly inside the registered animation-band
family, not pinned).

F4 THE D160 MOBILE-NAV RECORD (mobilenav-s63.mjs, the S62 probe
ported verbatim per gotcha 67): **EXACT — NO TAILWIND v4 BUG** — the
clone's burger clickable at all three y-points, every click opening
the canonical 7 rows × 44px; the live's toaster-blocked at y21/y28,
the y35 sliver opening nothing (the registered degraded-affordance
family, unchanged).

F5 THE THIRTY-EIGHTH SURFACE (the animation-band value layer under a
pinned-frame contract). Phase 1 — the animation inventory discovery
(anim-inventory-s63.mjs + anim-context-s63.mjs, both sides): the
families align (logo/flogo ×4, gradientShift 6000, border-shimmer
5000 ×2 on the hero AI-chip rect at the identical box, pulse ×2,
organic-gradient 14000 on the h1 + 6000 on the span, the skeleton
family at identical durations/delays/keyframe values — the live via
WAAPI, the clone via CSS). The first inventory view was tail-
truncated (32 v 24 total). Unmatched: the clone's scroll-dot@1500
(the S39 bundle-read superset) + mockup-dot×5@2000. Phase 2 — the
mockup DOM census (mockup-census-s63.mjs): **IDENTICAL both sides**
(56 elements, 24 shape keys, the same 7 dots at the same positions)
— the clone ANIMATES 5 of the 7 dots where the live's read
`anim=none`. Phase 3 — the rAF-proof sampling (dot-static-verify +
glow-audit): **the live's 5 dots DO animate** (the same scale
1→1.2 matrices) and the live's ambient/glow DO animate transforms
(the ambient scale to ~1.04+, the glow translateY to -8px+) — driven
by the rAF bundle, INVISIBLE to getAnimations() (the registry sees
only the WAAPI opacity half — the S39 bundle-read wall root-caused).
No invention, no loss. Phase 4 — THE PINNED-FRAME PRINT CONTRACT
(pinned-print-s63.mjs): pause every Web-Animations-API animation at
currentTime T, print, census through qpdf — **each side's pinned
layer BYTE-IDENTICAL across prints** (T=1700 AND T=1000, both
sides; the rAF families contribute no gs entries — scale-only).
Across sides at T=1700: the full-stroke family (5 shapes) EQUAL, 14
of 16 alpha slots EQUAL at identical multiplicities, THE /SCREEN
LAW both sides — with **TWO T-INVARIANT STRUCTURAL DELTAS** (the
live's /SMask 13v11 — the S62-recorded count now proven frame-
INDEPENDENT; the clone's extra @51 slot 1v2) and the phase slots as
deterministic T-functions (@230 present at 1700, absent at 1000;
the live's @128 +1 at 1000). **NO src/ fix required.**

F6 THE TDD PINS: `tests/e2e/session63-pinnedframe-laws.spec.ts` (+4)
— D219a the pinned determinism; D219b the pinned constants at T=1700
(33/22/SMask 11/{21 Normal + 1 Screen}/the exact multiset); D219c
the pinned constants at T=1000 + the T-invariants (SMask 11 + @51×2
persist; @230 absent); D219d the ambient/glow full-choreography
guard (opacity 0.3→0.5→0.3 + scale(1)→(1.15)→(1) + translateY
0→-12px→0) + the 32-animation at-rest census. Three in-flight
pin-calibration catches (the /Screen @255 double-count; the
under-glow's below-the-fold pick — pick by the animation; the
DOM-lib base-type casts). **GREEN 4/4 ×3**; lint + typecheck clean.

F7 THE FULL GATE: the s63 runner (the s62 list verbatim + the
session63 spec appended; the file-set diff EMPTY 72/72 — after
fixing the reconciliation parser's space-separated-chunk miss) —
**e2e 521/521 in 72 files, all 23 chunks GREEN, zero flakes**.
Session gate: **894 → 898 = 252 + 125 + 521**.

F8 THE SCREENSHOTS + VLM: 21/21 re-captured (capture63.db — the dev
DB canonical before AND after, zero mutations; the port swept) +
**VLM 8/8 — ZERO ADJUDICATIONS (the sixth consecutive)**.

F9 THE DOCUMENTATION: PAD (the S63 block + the D219 ledger row + the
7.1 counts 72 specs/521), AGENTS (the counts + the Session-63 gate
prefix + gotcha 73), CLAUDE (the session-63 context), README (the
898 badge + the session63 suite row), SKILL v2.62.0 (lesson 102),
the remediation plan session63, this session log 135, the worklog —
all through the persisted surgical edit script
(research/doc-edits-s63.py, 13 verified replacements).
