# CLAUDE.md — SAAS Company (NovaAI)

> Project-specific conventions for AI coding agents working in this
> repository. Companion documents: `README.md` (user-facing), `AGENTS.md`
> (operator quick reference), `Project_Architecture_Document.md` (the
> engineering source of truth).

## Core Identity & Purpose

This repository is a **production-grade, self-hosted clone of the reference
SaaS marketing site** `https://saas-company.base44.app/` (the "NovaAI"
product page) — rebuilt as a single deployable Next.js 16 application —
**plus a functional superset**: the marketing site's dead demo links are
replaced by real features (authentication, a persisted workflow dashboard
with an AI composer, newsletter/demo capture, SEO surfaces).

Visual parity is a first-class requirement: the dark canvas, the Vend Sans
type system (Google Fonts' actual variable font, wght 300-700 — Session 5
forensics), the magenta/electric-blue brand palette, the
animated hero (looping video, shimmer badge, gradient heading), the mobile
burger dropdown, and the copy are all measured from the live reference. When
the reference and generic best practice conflict, the reference wins; when
parity and a functional superset conflict, document the deviation (see the
PAD's deviations table) rather than silently picking a side.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the relevant page/component/route and its tests in full before writing. Identify which contract (db-path, validation, auth session, UI parity) governs the change.
2. **PLAN** — State the smallest correct path; name the files touched and the specs that must be updated alongside.
3. **VALIDATE** — Confirm scope for anything touching auth, sessions, or the ticket vocabulary before coding.
4. **IMPLEMENT** — Modular, typed, test-backed increments. Domain rules go in `src/lib/` seams; UI consumes them.
5. **VERIFY** — Run the full gate; for visual changes, capture a screenshot and compare against `docs/screenshots/` and the reference captures.
6. **DELIVER** — Report what was verified, what was not, and any deferred debt. Never claim "works" without executed evidence.

## The Stack (versions from package-lock.json)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | `output: "standalone"`, `outputFileTracingRoot` pinned |
| Runtime | React 19 + TypeScript 5 (strict, `noImplicitAny: false`) | |
| Styling | Tailwind CSS 4 (CSS-first) | tokens in `src/app/globals.css` `@theme`; NO config file |
| Data | Prisma 6 + SQLite | `db/custom.db` at repo root; `db push`, no migrations |
| Auth | Node crypto (scrypt + HMAC-SHA256 cookies) | zero external auth services |
| AI | z-ai-web-dev-sdk (server-side only) | deterministic fallback in `src/lib/workflow.ts` |
| Tests | Vitest 5 (unit) + Playwright 1.63 (E2E) + bash/curl smoke (125) | 252 unit + 573 browser checks |
| Fonts | Self-hosted Google "Vend Sans" (variable 300-700) + next/font (Playfair/DM Serif) | the exact gstatic bytes the live serves |

## Foundational Principles

### 1. Verify, then claim

Never state something "works" without executing it. The gate order (below)
is the definition of done. `next.config.ts` sets `ignoreBuildErrors: true`,
so **`npm run typecheck` is the only type gate** — never skip it because the
build passed.

### 2. The envelope is the API contract

Every route handler returns `ok(data)` or `fail(code, message, status)` from
`src/lib/api.ts`. Protected handlers start with
`const guard = await requireSession(); if (!guard.user) return guard.response;`.
The frontend treats `ok: false` as a user-visible error string, never an
exception.

### 3. Parity is measured, not remembered

Design tokens, section copy, and interaction structures were captured from
the live reference with computed-style extraction and VLM side-by-side
comparisons (the reference shots and comparison logs live outside the repo).
Changes to chrome (nav, hero, sections) must re-verify against the live
site — agent-browser at 1440/768/390 widths — before being called done.
Computed-style assertions that depend on color serialization should accept
both the rgba and oklab spellings (v4 serializes alpha colors through
oklab; rendering is identical).

### 4. Degrade, never fail

External dependencies (the AI SDK) sit behind sanitizers and deterministic
fallbacks. An environment without SDK access gets the template workflow —
never a 500.

### 5. Security rules (non-negotiable)

- Every input validated server-side (`src/lib/validation.ts`): trim, length
  caps, enum membership, email shape.
- Passwords: scrypt + per-user salt; sessions: HMAC-signed tokens,
  timing-safe comparisons, httpOnly cookies (`src/lib/auth.ts`).
- Auth + newsletter endpoints are rate-limited per IP
  (`src/lib/rate-limit.ts`, pure and unit-tested).
- LLM output is untrusted: `sanitizeGeneratedWorkflow` clamps before any
  DB write.
- No secrets in the repo: `.gitignore` rejects `.env`, `*.key`,
  `ssh-key.txt`; keys arrive out-of-band per the SSH-wrapper runbook.

## Implementation Standards

### File organization

```
src/
  app/                      # routes: /, /login, /faq, /privacy, /terms,
    # /accessibility, /refund-policy, /dashboard, not-found, sitemap, robots
    api/                    # health, auth/*, newsletter, demo, workflows/*
  components/
    site/                   # navbar (mobile menu), footer, logo, reveal, legal view
    sections/               # landing: hero, dashboard-preview, logo-cloud,
    # problem, features, how-it-works, pricing, testimonials, cta
    auth/ dashboard/        # (login card lives in app/login; dashboard-app here)
  lib/                      # domain: auth, api, db, db-path, rate-limit,
    # pricing, validation, workflow, legal-content, faq-content, utils
prisma/                     # schema.prisma + idempotent seed.ts
tests/unit/ (via src/lib/*.test.ts + tests/db-path.test.ts)  # Vitest
tests/e2e/                  # Playwright specs + global-setup
scripts/smoke-test.sh       # 38-check curl suite against the prod build
```

### Naming & conventions

- Components: `PascalCase.tsx` named exports; pages: default exports.
- Pure domain logic lives in `src/lib/*.ts` with a co-located `*.test.ts`.
- Interactive chrome is `"use client"`; pages that need the session are
  server components that `redirect()` before render.
- Statuses: workflows are `active | paused | draft` (validated in
  `src/lib/workflow.ts`); pricing periods are `monthly | annual`.

### Styling rules (Tailwind v4)

- Tokens ONLY in `@theme` (globals.css): brand `--color-primary: #8624ff`
  (the reference's `:root` 267° purple — NOT the unmounted `.dark` block's
  magenta), `--color-accent`/`--color-electric-blue: #0055ff`,
  `--color-violet: #d500ff`, surfaces, fonts. Full color values, never bare
  HSL triplets (the transparent trap). The reference uses the SAME face
  ("Vend Sans", the Display cut) for headings AND body.
- The reference's custom classes live in globals.css:
  `.workflows-gradient-text`, `.animated-gradient-text`,
  `.border-shimmer-*`, `.anim-logo-*`, `.get-started-shimmer`,
  `.skeleton-wave`, `.accordion-panel`, the marquee/float/pulse-glow
  animations. Reuse them; don't re-derive.
- Measured chrome geometry is pinned by the e2e specs (nav z-50, mobile
  44px rows, tablet pill `bg-white/10`) — treat spec failures there as
  parity regressions.

### Testing requirements

- New pure logic → unit spec in `src/lib/` (red → green).
- New endpoints → extend `scripts/smoke-test.sh` (envelope + validation +
  happy path) and, where UI-visible, the Playwright suite.
- E2E runs against the production standalone build on :3100 with its own
  `db/e2e.db` (global-setup pushes + seeds it). One worker — the specs share
  the seeded SQLite file.
- Bug fixes require a failing test before the fix (regression discipline).

## Pre-Push Checklist

- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] `npm run test` → 252/252 PASS
- [ ] `npm run build` compiles clean
- [ ] `./scripts/smoke-test.sh` → 125/125 PASS
- [ ] `npm run test:e2e` → 573/573 PASS (needs the build first)
- [ ] Schema changes regenerated (`npx prisma generate`) and reseeded
- [ ] No `.env`, keys, or `db/*.db` staged (`git status` review)
- [ ] Commit message follows `:art: feat:` / `:memo: docs:` / `:bug: fix:` on `main`

## Known Context

- **Session 76 (2026-10-21) remediation** — see
  `docs/remediation-plan-session76.md`: the FIFTY-FIRST-SURFACE cycle
  (the worklog S75 candidates answered: the THIRTY-SECOND standing watch
  now carrying the D231 CMap columns; the 51st surface measured as THE
  NESTED IMAGE-XObject PLACEMENT CONTEXTS — the D125/S56/S57-registered
  image family's unmeasured remainder). THE HEADLINE: **D232, THE
  PLACEMENT LAYER AT FULL VALUE PARITY ACROSS SIDES** — all nine of the
  live's placements have identical clone counterparts (target dims + the
  full 6-number cm transform; the live's 13/9 a strict subset of the
  clone's 18/13); the nine-image -1 numbering law (the S68 phase-slot
  contraction at the image layer); the animation-carrier law (the RGB
  member frame-dependent + its Gray alpha mate T-invariant in the three
  carrier pairs; the 1047x105 both-carry exception; the 1165x103 static
  pair); the 2^-24 petal-scale epsilon measured at the image layer (the
  D226 law's placement-context confirmation). The watch: the 32nd
  standing watch ALL RECORDS HOLD both sides (Phase A 6/6 + Phase B/C
  37/37 clone + 33/33 live — the eighth consecutive fully-green
  two-sided print watch, the D231 CMap columns green on their first
  carried run); the D160 mobile-nav record exact (NO Tailwind v4 bug,
  the thirteenth consecutive session); gate 946 -> 950 = 252 + 125 +
  573 in 85 files (the s76 runner; all 36 chunks green, zero failures
  — the sixth consecutive zero-flake gate); VLM 8/8 (one registered
  adjudication — the hero-CTA navbar-inclusive reading, the S72
  family); zero src/ changes (the sixteenth consecutive session); TWO
  honest pin-calibration catches registered (the 1165x103 static-pair
  over-generalization + the obj-99 carrier mislabel — both fixed to
  the measured truth).
  
- **Session 75 (2026-10-20) remediation** — see
  `docs/remediation-plan-session75.md`: the FIFTIETH-SURFACE cycle
  (the worklog S74 candidates answered: the THIRTY-FIRST standing
  watch now carrying the D230 descriptor columns; the 50th surface
  measured as THE /ToUnicode CMap INTERIORS — the D230-registered
  presence-only sibling). THE HEADLINE: **D231, THE CMap LAYER AT
  FULL BYTE PARITY ACROSS SIDES** — all 10 CMap streams
  sha-identical clone-v-live (position-paired), the fifth
  consecutive font-family layer at full byte parity (D228 glyph
  streams -> D229 widths -> D230 descriptors -> D231 CMaps). The
  ALL-TEN -1 numbering law (every CMap allocated after the vanishing
  ca230 phase-slot object); the uniform structure constants; the
  ligature law (font 62's <79> <00660066>); the 278-v-268
  width-mapping delta. NO src/ fix. The 31st standing watch ALL
  RECORDS HOLD both sides (Phase A 6/6 + Phase B/C the clone 24/24 +
  the live 24/24 — the seventh consecutive fully-green two-sided
  print watch, now with the D230 descriptor columns); the D160
  mobile-nav clone EXACT, NO TAILWIND v4 BUG (the TWELFTH
  consecutive session). Gate: 942 -> 946 = 252 + 125 + 569 in 84
  files (the s75 runner; all 35 chunks GREEN, zero failures — the
  fifth consecutive zero-flake gate). The S75 INSTRUMENT CATCH: the
  python-playwright 1.57/chromium-1200 pair DROPS the
  never-intersected opacity-0 sections from page.pdf (207 v 251
  words + 17 duplicate font subsets) — collect prints through the
  REPO's own playwright (v1.63.0/chromium v1243), never a foreign
  browser build.
- **Session 74 (2026-10-20) remediation** — see
  `docs/remediation-plan-session74.md`: the FORTY-NINTH-SURFACE cycle
  (the worklog S73 candidates answered: the THIRTIETH standing watch now
  carrying the D229 width+encoding columns; the 49th surface measured as
  THE /FontBBox + /FontDescriptor LAYER — the D229 walk's remaining
  unmeasured dict siblings at FULL VALUE PARITY ACROSS SIDES: all 10
  fonts' bounding boxes + descriptor values identical clone-v-live; the
  12-key font-dict shape on every font incl /CIDToGIDMap + /ToUnicode; the
  clone's last-four -1 numbering law at the descriptor layer; the
  weight-signature law [500,600,400,500,400,600,700,500,400,600] with the
  1:1 StemV {109,125,141,156} + XHeight {550,553,556,560} metric maps; the
  uniform constants Flags=4 + CapHeight=-700 + ItalicAngle=0 +
  FontStretch=/Normal + FontFamily='u:Vend Sans Light'; the A-J
  subset-identity family over ONE face. NO src/ fix. The 30th standing
  watch ALL RECORDS HOLD both sides NOW WITH THE D229 COLUMNS (the sixth
  consecutive fully-green two-sided print watch: Phase A 6/6 both sides
  with the working eight at word parity 739/101/24/335/390/566/285/36 +
  the 404 16=16 + the sitemaps 8/7 + the raw-status family + the D131/
  D133 pair + the clone dashboard 233 + the live's localStorage-token
  family; Phase B/C the clone 22/22 + the live 22/22 — the pinned
  constants, determinism x2, SMask kinds, shading, scn/Do/gs tokens,
  transfer routes, print words 251=251 + the D225-D229 columns carried).
  The D160 mobile-nav record exact (NO Tailwind v4 bug, the ELEVENTH
  consecutive session, zero instrument catches; the live's
  blocked-blocked-healed family holding). The ninth fresh-clone rebuild
  (the gotcha-70a pin applied proactively from the first DB command — no
  out-of-repo artifact this run). Gate: 938 -> 942 = 252 + 125 + 565 in
  83 files (the s74 runner — the s73 list verbatim + the session74 spec
  appended; the file-set diff EMPTY 83/83; all 34 chunks, ZERO failures —
  the fourth consecutive zero-flake gate). 21 screenshots refreshed
  (capture74.db, the dev DB canonical md5 677a1b15 unchanged, zero
  mutations). VLM 8/8 with ONE registered adjudication (the hero-CTA
  question counted the navbar chrome — the S72-registered family; the
  programmatic census ONE hero CTA 'Book a Demo' at y497/w190 exact).

- **Session 73 (2026-10-20) remediation** — see
  `docs/remediation-plan-session73.md`: the FORTY-EIGHTH-SURFACE cycle
  (the worklog S72 candidates answered: the TWENTY-NINTH standing watch
  now carrying the D228 glyph-stream columns; the 48th surface measured
  as THE /Widths + /Encoding DIFFERENCES LAYER — the D228 walk's
  unmeasured sibling, the Type3 fonts' OBJECT-DICT tables at FULL
  VALUE PARITY ACROSS SIDES: all 10 fonts' /Widths arrays +
  /Encoding /Differences maps + /FirstChar//LastChar bounds
  value-identical clone-v-live; the (FirstChar-LastChar:Widths.len)
  signature [0-185:186, 0-183:184, 0-253:254, 0-203:204, 0-241:242,
  0-183:184, 0-185:186, 0-198:199, 0-241:242, 0-48:49]; 1930 width
  slots + 1940 diff tokens + the 69-name vocabulary; the clone's
  last-four -1 numbering law at the font-dict layer; the live's font
  numbering on per-load baselines this run (@1700 104/141/142/205 v
  @1000 102/139/140/203 — the run-jitter family); the /g0 filler law
  (1662/1930); the nonzero-width census EXACTLY 278 (= the glyph
  streams) with the D228c set-width pair 203x6 + 204x3 ECHOED at the
  width layer; the minimal [/Type,/Differences] Encoding shape. NO
  src/ fix. The 29th standing watch ALL RECORDS HOLD both sides NOW
  WITH THE D228 GLYPH-STREAM COLUMNS (the fifth consecutive fully-green
  two-sided print watch; the live's D227 dedup pair at 181/187 this
  run — within the run-jitter family). The D160 mobile-nav record
  exact (NO Tailwind v4 bug, the TENTH consecutive session, zero
  instrument catches). The eighth fresh-clone rebuild (the gotcha-70a
  seed pin caught live on the first DB command and re-pinned in-repo).
  Gate: 934 -> 938 = 252 + 125 + 561 in 82 files (the s73 runner; the
  file-set diff EMPTY 82/82; all 33 chunks, ZERO failures — the third
  consecutive zero-flake gate; the F1 baseline's chunk-overlap tally
  contamination caught + reconciled by direct re-measurement 566-9=557).
  21 screenshots refreshed (capture73.db, the dev DB canonical md5
  99cea6ba unchanged, zero mutations). VLM 8/8 zero adjudications (the
  sixth consecutive clean pass — the hero question scoped from the
  start).

- **Session 72 (2026-10-20) remediation** — see
  `docs/remediation-plan-session72.md`: the FORTY-SEVENTH-SURFACE cycle
  (the worklog S71 candidates, answered by the recon's measurements).
  **THE HEADLINE: THE /CharProcs GLYPH-STREAM INTERIORS under the
  pinned-frame contract (D228)** — the Type3 fonts' per-glyph painting
  programs (the corrected premise of the S71 font-subset candidate:
  no /FontFile exists on either side — all 10 fonts Type3), both
  sides, T=1700 + T=1000, measured at FULL BYTE PARITY ACROSS SIDES:
  (a) the site census — 10 fonts, the glyph-count signature
  [22,9,56,29,52,25,26,15,29,15], 278 streams / 163 distinct bodies /
  228846 bytes, the 76 shared-body dedup families; (b) the
  T-invariance + the font-numbering law — every glyph body
  byte-identical across frames both sides; the clone's LAST FOUR
  fonts at exactly -1 @T=1000 (the S68 phase-slot law at the font
  layer), the live frame-stable; (c) THE CROSS-SIDE FULL-BYTE PARITY
  — all 163 distinct bodies + all 278 per-glyph streams
  byte-identical ACROSS SIDES (the deepest parity yet measured);
  (d) the glyph program structure — the operator census identical
  cross-side, the d1-only head form, the 17-byte set-width-pair
  minimal family. TWO HONEST S72 CORRECTIONS: the live's fn4 "+2
  renumbering law" (S71) re-attributed to RUN-TO-RUN emission jitter
  (frame-stable within a print pair; the +2 family measured across
  loads); the live's logo tile a RUN-DEPENDENT family {59,145,149}
  (the two-placement epsilon form sighted, its own T-phase
  2^-31@1700/2^-24@1000). The 28th standing watch all records hold
  both sides (Phase A 13/13 + B/C 18/18+18/18 — the fourth
  consecutive fully-green two-sided print watch); the mobile-nav
  record exact (NO Tailwind v4 bug, the ninth consecutive session).
  Gate 930 -> 934 = 252 + 125 + 557 in 81 files (the s72 runner).
- **Session 71 (2026-10-19) remediation** — see
  `docs/remediation-plan-session71.md`: the FORTY-SIXTH-SURFACE cycle
  (the worklog S70 candidates, answered by the recon's measurements).
  **THE HEADLINE: THE TYPE-4 FUNCTION-STREAM INTERIORS under the
  pinned-frame contract (D227)** — the {pop dup ...} postfix color
  programs, the deepest layer of the shading tree, both sides, T=1700
  + T=1000. (a) THE SITE CENSUS — the clone 5 = the shared trio
  (8/14/46) + the animated pair (148/168); the live 7 = the trio +
  its pair (141/161) + the live-only DEDUP pair (179/185 sharing one
  body — the hero-band family); (b) THE FULL-BYTE T-INVARIANCE —
  zero name-renumbering at this layer, the trio HELD at 8/14/46, the
  clone's pair at -1 (the S68 attribution), the live's at +2 (the
  asymmetry's newest member); (c) THE CROSS-SIDE TRIO — obj 8/14/46
  byte-identical ACROSS SIDES at the SAME object numbers; (d) THE
  ANIMATED PAIR + THE EPSILON CARRIERS — the D222 family at the body
  layer (the clone's epsilon strings v the live's shorter rounded
  mirrors), a/b print-deterministic, T-invariant — NO src/ fix. TWO
  CANDIDATE-PREMISE CORRECTIONS (the richness probe): the nested-/X#
  targets are IMAGE XObjects (not forms); zero /FontFile on either
  side (all 10 fonts Type3 with /CharProcs glyph streams). THE WATCH:
  the 27th standing watch all records hold both sides (the third
  consecutive fully-green two-sided print watch, now with the D226
  tiling-interior columns). MOBILE NAV: the clone EXACT, NO Tailwind
  v4 bug (the eighth consecutive session; zero instrument catches —
  the side-aware honest forms by construction). GATE: 926 -> 930 =
  252 + 125 + 553 in 80 files (the s71 runner, all 31 chunks, ZERO
  failures — the cleanest gate in sessions). VLM 8/8 zero
  adjudications (the fifth consecutive clean pass).

- **Session 70 (2026-10-19) remediation** — see
  `docs/remediation-plan-session70.md`: the FORTY-FIFTH-SURFACE cycle
  (the worklog S69 candidates, answered by the recon's measurements).
  **THE HEADLINE: the TILING-PATTERN STREAM INTERIORS under the
  pinned-frame contract (D226)** — the /P# painting streams' own
  interiors (the S69 G-stream walk's sibling, one level into the
  pattern tree), both sides, T=1700 + T=1000. (a) THE SITE CENSUS —
  the clone 6 = 4 tiling-painting + 2 q/Q form-placing, the page-wide
  trio sharing ONE normalized identity, the shimmer strip the ONE
  /Matrix carrier; (b) THE HELD PAIR + THE RENUMBERING-BY-FOUR — obj
  13/19 byte-identical at both frames; 101/147/153/173 -> -1 with
  name-only deltas (the S68 phase-slot attribution); (c) THE
  LOGO-TILE DECOMPOSITION + THE 2^-24/2^-25 EPSILON LAW — the
  clone's TWO Do placements v the live's ONE (the D125 family), the
  epsilon-scale second placement's cm the DETERMINISTIC T-dependent
  carrier (2^-24 @1700 v 2^-25 @1000 — the petal-scale float
  residue); (d) THE SHIMMER-STRIP INTERIOR — the five-part
  structure, T-invariant by value. The live's 7 tilings ALL
  frame-stable at held numbers (the renumbering asymmetry). The 26th
  standing watch ALL RECORDS HOLD both sides NOW WITH THE D225
  G-STREAM COLUMNS (the second consecutive fully-green two-sided
  print watch). The D160 mobile-nav record — the clone EXACT, NO
  Tailwind v4 bug (the seventh consecutive session); the live's
  blocked-blocked-healed family holding through the honest
  row-visibility adjudication (the live has NO #mobile-menu id /
  aria-expanded / data-state — its open-state invisible to the aria
  contract; the instrument's blindness catch, the honest form the
  row-visibility census). Gate 922 -> 926 = 252 + 125 + 549 in 79
  files (the s70 runner; one registered chunk-11 timing flake green
  on retry). VLM 8/8 zero adjudications (the fourth consecutive
  clean pass). 21 screenshots refreshed (the dev DB canonical, zero
  mutations). ZERO src/ changes (the tenth consecutive session).

- **Session 69 (2026-10-19) remediation** — see
  `docs/remediation-plan-session69.md`: the FORTY-FOURTH-SURFACE cycle
  (the worklog S68 candidates, answered by the recon's measurements).
  **THE HEADLINE: the /SMask G-STREAM INTERIORS under the pinned-frame
  contract (D225)** — the S64 dict census extended INTO the /G painting
  streams, both sides, T=1700 + T=1000. (a) THE SITE CENSUS — the clone
  10 = 8 /Luminosity + 2 /Alpha, four operator families (incl. the
  BARE-DO placement — obj:48's Do with no q/Q wrapper, its own shape);
  (b) THE ALIGNED SIX — obj 12/18/26/30/47/48 byte-identical across
  frames at held numbers; (c) THE RENUMBERING-BY-ONE LAW — the four
  shifted masks move by exactly -1, ATTRIBUTED to the S68 ca230
  phase-slot contraction (gs 33->32); (d) THE /Alpha PAIR — obj:47 the
  /TR-bearing re-fill + obj:48 the bare-Do painting /X43, byte-stable,
  the phase dependence one level deeper (the S67 law). The live's 12 =
  10 + the hero-band pair [0,62,596,587] (the D220 family at the
  interior layer); the /Properties sibling probe an EMPTY SET both
  sides (the name-table census closed). The 25th standing watch ALL
  RECORDS HOLD (the first fully-green two-sided print watch since
  S65); the D160 mobile-nav record — the clone EXACT (NO Tailwind v4
  bug, the sixth consecutive session; the live's toaster-blocked
  y21/y28 + the y35 opening). Gate 918 -> 922 = 252 + 125 + 545 in 78
  files; zero src/ changes (the ninth consecutive session).

- **Session 68 (2026-10-19) remediation** — see
  `docs/remediation-plan-session68.md`: the FORTY-THIRD-SURFACE cycle
  (the worklog S67 candidates, answered by the recon's measurements).
  **THE HEADLINE: the content-stream `gs` EXTGSTATE-INVOCATION LAYER
  (D224)** — the third name-table sibling (S66 /Pattern + S67 /XObject,
  now /ExtGState): every `<name> gs` site in every page + form + tiling
  stream, the names resolved BY VALUE through each OWNER's
  /Resources//ExtGState table. (a) THE SITE CENSUS — the clone 132 sites
  = 124 form + 8 tiling, ZERO page-stream, ZERO unresolved, at BOTH
  frames; the live 131→130 (123 form stable; one tiling invocation
  print-jitter-unstable). (b) THE VALUE CENSUS — 18 identities; the
  invocation layer runs at ~4x the object census (132 v 33 — ONE /None
  object invoked SIX times, the S64 @51 dedup family measured at the
  invocation layer). (c) THE PHASE-SLOT LAW — the animated 1169x149
  phase form carries DIFFERENT gs invocations per pinned frame (ca230
  present @T=1700 absent @T=1000; ca128 gained @T=1000) — BOTH deltas
  attributed by container to the same form, measured IDENTICALLY on
  both sides (the S67 shared-phase-form family extended to the gs
  layer). (d) THE T-INVARIANCE — 16 of 18 values T-invariant, the
  totals 132=132. CROSS-SIDE: 16 of 18 values at IDENTICAL
  multiplicities — the two deltas attributed (the clone's ca255 +3 =
  the CSS-rasterized shimmer tiling's 2 + the mockup form's +1; the
  live's /Luminosity +2 = the D220 hero-band pair). NO src/ fix.
  ALSO: the TWENTY-FOURTH standing watch (Phase A 13/13 both sides;
  Phase B/C the clone 18/18 with the live Do-count REDs ADJUDICATED —
  the live's len603 sliver is EMISSION-UNSTABLE ACROSS PRINTS, and the
  S67 D223 ledger row's live count pair was one print pair recorded as
  if a law — the honest record: the live 20-21 Do sites per print, 19
  form STABLE); the D160 mobile-nav record GREEN again (NO Tailwind v4
  bug); the session68 suite +4 (GREEN x4; one pin-calibration — the
  value-identity spelling). Gate: **918 checks** (252 unit + 125 smoke
  + 541 e2e in 77 files, all 28 chunks, zero failures); zero src/
  changes (the eighth consecutive session).

- **Session 33 (2026-10-10) remediation** — see
  `docs/remediation-plan-session33.md`: a DOM-attribute parity +
  registry-versioning + concurrent-limiter-pinning cycle (the
  session_64 S33 candidates). **THE HEADLINE: the drift battery's NEW
  EIGHTH COLUMN — the DOM-attribute layer (the per-route body data-* +
  microdata SET) — caught THREE instrumentation-set deltas on its
  first run**, all ADJUDICATED with in-vivo probes at zero functional
  delta: the live's DORMANT `data-rht-toaster` (react-hot-toast's
  container on /login — 0 children at rest, the failed-login error
  surfaces the inline banner exactly like the clone — D124), the
  live's `data-radix-collection-item` (Radix's internal marker on the
  FAQ triggers — the ARIA contract measured at parity both sides,
  never simulate a library's internals — D125), and the clone's
  `data-nav-theme` (the navbar theme-swap hooks — gotcha 14, the
  behavior pinned GREEN — D126). **THE REGISTRY:** the adjudicated
  sets join the VERSIONED repo file `src/lib/head-superset.ts` (the
  five S32 head tags + the three S33 DOM entries with their sides),
  read by the battery through a tsx eval — an UNREGISTERED clone-only
  tag or DOM attribute (either side) surfaces as DRIFT; 15 unit pins
  hold the shape. **THE CONCURRENT-LIMITER pins:** the
  session33-concurrent-limiter trio pins the two-tab shape against the
  per-USER generate bucket (the shared exhaustion — 50
  counted-but-rejected attempts, then a concurrent pair both 429 +
  Retry-After; the degrade-not-fail contract under concurrency — both
  tabs' simultaneous UI composes create through the template draft;
  the two-tab convergence). ALSO: the microdata layer measured NONE
  on either side (the eighth column's other half); a ZOMBIE-SERVER
  false-drift caught mid-session (the process-renamed `next-server
  (v1…)` — gotcha 46: kill by PORT, never by argv). Gate: **602
  checks** (220 unit + 124 smoke + 258 e2e); the drift battery
  **117/117 GREEN** on all EIGHT surfaces (the registry reading
  \"registered\" per route).

- **Session 34 (2026-10-10) remediation** — see
  `docs/remediation-plan-session34.md`: a VALUE-level parity +
  real-SDK-output-path cycle (the session_66 S34 candidates).
  **THE HEADLINE: the drift battery's NEW NINTH SURFACE — the
  shared-attribute VALUE column (the measured VALUES of the shared
  data-*/microdata attributes, previously only the SET was measured) —
  caught the /faq carrier-count delta on its first run**: the live's
  Radix Accordion stamps `data-state` + `data-orientation` on EVERY
  accordion node (~3x the clone's carriers, all
  \"closed\"/\"vertical\" at rest) where the clone's custom accordion
  carries them on trigger + panel / container only — the VALUES at
  parity, the counts the D125 wrapper structure one layer deeper
  (D127). **THE REGISTRY'S VALUE LAYER:** `DOM_VALUE_RULES` +
  `isDocumentedDomValueRule` in `src/lib/head-superset.ts` — a
  registered (attr, route) pair downgrades the battery's comparison
  from the multiset to the distinct VALUE SET (a spelling drift still
  surfaces; the adjudicated carrier-count structure stays scoped).
  **(D128) the apple-touch-icon registration:** the rebuilt head-tag
  SET column (the semantic-head scope — the bundler's loading rels
  excluded) surfaced the clone's app-wide `rel:apple-touch-icon`
  against a live that injects it ONLY through its login bundle — the
  Session-7 F8 working-asset superset REGISTERED (seven non-login
  routes). **(D129) the composer's real-SDK output path:** the route's
  inline fence-strip/parse/sanitize chain extracted as the pure seam
  `parseLlmWorkflow()` (`src/lib/workflow.ts` — THROWS on non-JSON
  [JSON.parse's contract preserved for the route's catch], null on
  failed sanitization), pinned with 9 unit pins + 5 route-boundary
  pins under a mocked SDK (the fenced response into the envelope, the
  120/500 clamp under over-long output, prose/no-choices/{}
  each degrading to the template). ALSO: the mobile nav re-measured
  byte-identical 7 x 44px both sides (no Tailwind v4 bug — the live's
  burger carries NO aria-expanded, the shared selector is the
  md:hidden nav button); word parity 1.0000 x8. Gate: **623 checks**
  (241 unit + 124 smoke + 258 e2e); the drift battery **73/73 GREEN**
  on all NINE surfaces (the VALUE column reading \"values-only
  registered\" on /faq through the registry).

- **Session 42 (2026-10-12) remediation** — see
  `docs/remediation-plan-session42.md`: a print-surface +
  responsive-route-extension cycle (the worklog S41 candidates,
  answered by the recon's measurements). **THE HEADLINE: the drift
  battery's SEVENTEENTH SURFACE — the print media surface**, measured
  at FOUR layers paired clone-vs-live: the CSSOM rule scan (zero
  `@media print` rules in any stylesheet, either side), the DOCUMENT
  scan (zero media-attributed link/style elements — the blind-spot
  layer: a `<link media="print">` sheet's top-level rules are NOT
  CSSMediaRule, so the rule scan alone cannot see them), the COMPUTED
  scan (zero style deltas on the key elements under print emulation),
  and the RENDER layer (the real print pipeline via `page.pdf` A4:
  page counts IDENTICAL across sides on 7 of 8 public routes —
  landing 8/8, /login 1/1, /faq 2/2, /privacy 2/2, /terms 2/2,
  /accessibility 3/3, /refund-policy 2/2; the /demo delta clone-2 vs
  live-1 is the REGISTERED working-superset route — the live
  soft-404s it). **The empty-set contract at exact parity — neither
  side ships any print styling, and the print render matches.** The
  adjudicated decision: NO superset addition — print restyling would
  be a VISIBLE deviation from the reference's printed output; the
  registered superset families are functional features and
  invisible-at-rest a11y, never output changes. **The fifteenth
  surface's ROUTE EXTENSION: /faq + all four legal routes at the four
  widths — EXACT PARITY on every field** (nav 56/72, the burger via
  the SHARED `md:hidden` selector — gotcha 47 re-applied: the first
  recon's aria-controls-keyed read showed the live's burger
  "absent", a measurement artifact — links 1/7, zero overflow, docH
  byte-identical per width per route; /privacy's h1 at 128px every
  width). **The reference-regression watch: NO RECOVERY, NO NEW
  REGRESSION** (the soft-404 four unchanged, the working eight at
  exact word parity, the sitemap unchanged — the D141 policy sets).
  TDD: the session42-print-responsive suite **7/7 GREEN on arrival**.
  Gate: **707 -> 714 checks** (247 unit + 124 smoke + 336 -> 343 e2e
  — the session42 suite +7); the battery **67/67 GREEN, ZERO DRIFT**
  across three phases (print 14 + responsive 40 + route-watch 13);
  20 screenshots refreshed (DB canonical before AND after — the
  REGEX route-abort discipline held; the error-boundary capture
  fixed in flight: the first run missed the Pause click that drives
  the mutation's refresh() into the BROKEN_ROW, and the VLM standing
  check caught the healthy dashboard rendered where the boundary
  belonged); VLM 5/5 with ZERO flags + 2/2 supplementary (re-verified
  after the fix).

- **Session 47 (2026-10-12) remediation** — see
  `docs/remediation-plan-session47.md`: a BUILD + measurement +
  versioning cycle (the worklog S46 candidates — the
  twenty-second surface + the 21st's route extensions + the
  standing route-watch). **THE HEADLINE: the print-to-PDF text
  layer (the 22nd surface, D163) exposed TWO REAL ENTRANCE-LAYER
  CLONE GAPS — the first clone-gap build since S43.** Four of
  five probed routes at EXACT PDF-text parity (/login 26, /faq
  104, /privacy 344, /thank-you 36) but the landing read clone
  291 vs live 251 — the root cause: print paints only SETTLED
  content, and the live's below-fold framer entrances stay
  opacity-0 at print time. **GAP 1 (D164):** the live wraps EACH
  of the 8 logo-cloud wordmark carriers as a framer motion
  element with initial `opacity: 0` — an OPACITY-ONLY fade (no
  transform), ~50ms stagger, ~400ms duration — the clone shipped
  them static (the S8 F1-EXTRA record measured the CONTAINER,
  which is static; the per-wordmark carriers were never
  surveyed). **GAP 2 (D165):** the live wraps the ENTIRE CTA
  content block in ONE unclassed motion div (y=30, ~800ms) — the
  clone animated only the badge (the S8 badge-only record wrong
  for today's live, gotcha 7). THE BUILD: `Reveal` gained the
  OPACITY-ONLY mode (`y={null}` — no transform key at any phase;
  the settled write `opacity: 1` only), the 8 carriers became
  per-element entrances (the motion div IS the classed carrier),
  and the CTA restructured to the whole-block wrapper. **THE
  CONVERGENCE CONFIRMED: the clone's landing PDF moved 291 ->
  251 = the live's 251** (the un-revealed set unpainted on both
  sides). ALSO: the focus-visible ring at rendered parity (D161),
  the forced-colors empty-set (D162), the offline route extension
  (D166 — the /faq 87-vs-101 delta adjudicated as the CSS-abort
  concatenation artifact), the clipboard census on /login +
  /demo, and the D160 burger record re-verified (NO CHANGE on
  the live). TDD: the motion y-null pins RED first (4 unit),
  then the build; the session47 pins 9/9 (two pin-transcription
  catches in flight). Gate: **764 -> 777 = 252 unit + 125 smoke
  + 400 e2e**; the battery 17/17 GREEN ZERO DRIFT on the FIRST
  run; 21 screenshots (DB canonical, zero mutations — the
  capture script gaining the gotcha-44 scroll-through pass the
  new entrances require); VLM 8/8 ZERO flags. Gotcha 57 / lesson
  86: the print-pipeline exposure law + the record
  re-verification law + the print-text instrument.

- **Session 54 (2026-10-15) remediation** — see
  `docs/remediation-plan-session54.md`: a registration cycle (the
  worklog S53 candidates — the surface selection probed on the raw
  shape FIRST, the lesson-88 discipline; ZERO src/ changes).
  **THE TWENTY-NINTH SURFACE (D187) — the PDF RESOURCE-TARGET
  INTERIOR layer** (the D184 name tables' RESOLVED TARGETS censused
  at the dict level through qpdf --json): the ExtGState interiors
  (a sorted multiset at the ALPHA GRID — the D187 law: the two
  pipelines serialize /ca /CA alphas differently in BOTH directions
  per route, raw CSS decimals vs 8-bit-quantized N/255, but every
  measured pair converges on the same Math.round(a*255) composite
  grid point — the D134 oklab family's sixth sighting, at the alpha
  layer; the object-level census the only complete one: 9 of
  /login's 14 ExtGStates are TYPELESS — /Type optional per Table 59,
  most referenced from FORM XObjects' nested /Resources), the
  PATTERN interiors (tiling: PaintType/TilingType/XStep/YStep/BBox/
  streamLen; shading: ShadingType/ColorSpace/Coords/Extend/Function
  shape — /login's three card gradients byte-identical incl. the
  gradient endpoint values), and the FONT subset-metrics (the Type3
  /Widths advance arrays, lengths 49-254, byte-identical across
  sides) — the stable seven at FULL INTERIOR PARITY on the first
  honest fresh measurement, determinism verified 2x. **THE TWO LAWS
  (D188)**: the COLOR-SPACE EMPTY-SET (zero ICC streams, zero named
  /ColorSpace entries, zero /Default* overrides on every route, both
  sides — all color flows through device-space operators + pattern
  fills) and the PAGE-TREE FLATNESS (zero intermediate /Pages nodes,
  zero inheritable attributes — proving the D184 per-page census
  complete by construction). **THE 28TH SURFACE'S ROUTE EXTENSIONS
  (D188)**: the alternates' per-state name tables (default /X35,
  error /X36 — the banner's +1, reset /X18, signup /X22, forgot
  /X22; /G3 + /P4 on every state) + the five states' interiors at
  parity + the dashboard's authenticated interior fingerprint (gs
  18, tiling 3 — the chart stripes + the table texture, shading 4 —
  the brand-gradient family, fonts 9). The standing watch: zero
  drift; the D160 mobile-nav record + the live login SPA-404 record
  both re-verified for the TENTH consecutive session. The session54
  pins 5/5 GREEN on the first run (the generated-constants
  discipline; stable across three runs). Gate: **833 -> 838 = 252
  unit + 125 smoke + 461 e2e** — WITH THE S53 GATE-COUNT CORRECTION
  (the inherited 837 badge was an arithmetic slip: 252+125+456 =
  833; the badge now re-derived from the layer counts) AND THE
  SILENT-SKIP CATCH (the S53-committed chunk runner's
  session38-logo-petels typo silently skipped the logo-petals spec's
  10 tests — fixed in both runners, every chunk reconciled against
  --list); the battery EXTENDED at 323/323 ZERO DRIFT (up from 243;
  the INTERIOR + LAWS + ALTERNATES-INTERIOR/RESOURCE columns joining
  the standing set); 21 screenshots (DB canonical, zero mutations);
  VLM 8/8 on the first pass (zero adjudication). Gotcha 64 /
  lesson 93: the silent-skip law + the gate-arithmetic audit + the
  alpha-grid law + the typeless-object trap + the empty-candidate
  discipline.

- **Session 55 (2026-10-15) remediation** — see
  `docs/remediation-plan-session55.md`: a registration cycle (the
  worklog S54 candidates — ALL probed on the raw shape FIRST, the
  lesson-88 discipline; ZERO src/ changes; the battery REBUILT after
  the fresh-clone wipe — the S53 precedent). **THE THIRTIETH SURFACE
  (D190) — the PDF /Function layer** (the gradient math at the
  function-dict granularity): the exponential family (Domain/C0/C1/N
  — the endpoint VALUES byte-identical) + the stitching family
  (Domain/Bounds/Encode + the sub-function chains) — measured through
  the INLINE-STORAGE LAW (the lesson-88 family's SEVENTH sighting:
  on /login the functions live INSIDE the shading pattern dicts, an
  object-level probe measures EMPTY; the complete census resolves
  through PatternType 2 -> /Shading -> /Function plus the standalone
  objects — the landing stores 5-7 both ways). The stable seven at
  FULL FUNCTION PARITY on the first honest fresh measurement (/login
  the only gradient-bearing route: 2 exponential + 1 stitching with
  a 2-sub chain; the six content routes the EMPTY-SET law). **THE
  29TH SURFACE'S ROUTE EXTENSION (D191) — the /SMask G-stream
  interiors** (the luminosity-mask Form XObjects' OWN resource
  chains): the host ExtGState's /S /TR + the G-form's BBox/Subtype +
  the nested name tables (/G3 + the 5-member ProcSet + one image
  XObject each) + the 84-byte streams — 4/4 BYTE-IDENTICAL on
  /login (same object numbers), the recursion terminating at image
  masks (the terminus law). **THE THREE LAWS (D192)**: the
  /Metadata XMP EMPTY-SET (zero streams + zero catalog refs, every
  route, both sides), the /PieceInfo EMPTY-SET, and the tiling
  patterns' nested-Resources FLATNESS on the stable seven. The
  alternates: default/error the full 3-function + 4-G-stream set,
  reset 2+1, signup/forgot 2+2 — all five states identical across
  sides. The dashboard's authenticated function fingerprint: 4
  exponential functions of the brand-gradient family
  ([0.5255,0.1412,1] -> [0,0.3333,1]) + 3 nested-tiling patterns.
  The standing watch ELEVENTH consecutive re-verification (the
  working eight at byte-identical word parity 739/24/101/335/390/
  285/566/36, the sitemaps 8/7, the soft-404 16=16, the D160
  mobile-nav record exact — the clone all-three-y open, the live
  toaster-blocked y21/y28 + y35-only, NO Tailwind v4 bug; the live
  login records holding). TDD: the session55 pins 5/5 GREEN on the
  first run, stable across THREE runs (the generated-constants
  discipline — one pin-shape catch in flight: the ProcSet
  array-index enumeration artifact, fixed before assembly). Gate:
  **838 -> 843 = 252 unit + 125 smoke + 466 e2e** (every chunk
  reconciled at --list: 466 tests in 64 files). The battery REBUILT
  at **135/135 GREEN ZERO DRIFT** across five phases (the standing
  watch 18 + the poppler print layers 35 + the structural/resource
  layers 21 + the interior layer 35 + the S55 columns 26 — the
  battery now running THIRTY surfaces). 21 screenshots (DB
  canonical, zero mutations); VLM 7/8 first-pass + 1 ADJUDICATED BY
  EVIDENCE (the hero prompt's own enumeration error — the actual h1
  "Automated Workflows, Powered by AI" identical across sides).
  Gotcha 65 / lesson 94: the inline-storage law + the array-key
  enumeration artifact + the SMask recursion terminus.

- **Session 67 (2026-10-18) remediation** — see
  `docs/remediation-plan-session67.md`: the FRESH-CLONE REBUILD session
  (the fourth in seven: the workspace reset; npm ci, Chromium v1243,
  `.env`, the DB re-seeded 1/6/2, paramiko + the ssh shim). **THE
  FORTY-SECOND SURFACE (D223): the content-stream /XObject Do
  INVOCATION LAYER under the pinned-frame contract** — the /scn
  census's sibling: every `<name> Do` site in every page + form +
  tiling stream, resolved BY VALUE through each owner's
  /Resources//XObject table. The invocation-site census (24 sites =
  19 form + 5 tiling, zero page-stream, zero unresolved, one
  doubly-invoked value), the value census (11 forms + 13 images incl.
  the clone-only CSS-rasterized slivers), THE SHARED PHASE FORM (the
  animated pill len765 -> len635 across frames, identically on both
  sides — the first two-sided phase-dependent emission at the
  form-stream layer), and the T-invariance by value. The cross-side
  laws: the object-number ALIGNMENT across sides (obj:42-52, 5 of 6
  byte-identical), the trio's full value parity across the renumbering,
  and the near-twin's whole delta = ONE extra `1 1 1 RG 1 1 1 rg`
  color re-establishment (18 chars, zero visual difference). The
  TWENTY-THIRD standing watch all records hold (with the invocation
  columns); the D160 mobile-nav record: the clone EXACT (NO Tailwind
  v4 bug; two instrument-form catches — the menu-detection and
  burger-detection forms). The session67 suite +4 (GREEN x3; one
  pin-calibration — the phase-token sort normalization). Gate: 910
  -> 914 (252 + 125 + 537 in 76 files, the s67 runner, the file-set
  diff EMPTY, zero failures); VLM 8/8 (one probe-settled adjudication
  — ONE hero CTA); zero src/ changes again this session.

- **Session 66 (2026-10-18) remediation** — see
  `docs/remediation-plan-session66.md`: the FRESH-CLONE REBUILD session
  (the third in six: the workspace reset; npm ci, Chromium v1243,
  `.env`, the DB re-seeded 1/6/2, paramiko + the ssh shim). **THE
  FORTY-FIRST SURFACE (D222): the content-stream /scn PATTERN-INVOCATION
  LAYER under the pinned-frame contract** — the invocation-site census
  (every scn site lives in a FORM XObject, zero page-stream invocations,
  one invocation per pattern; the clone 7 = 3 tilings + 4 shadings, the
  live 8 = the same 3-tiling mirror minus the shimmer strip plus the
  hero-band mask-gradient pair), the shading-invocation value mirror
  (the 4 axial families carrying the D221b values verbatim at the fill
  sites — full cross-side parity), the tiling-invocation bbox census,
  and the name-renumbering-in-stream law (the invocation census
  T-invariant by value; the tiling streams differing across prints only
  in nested name tokens + the 1e-8 epsilon — the S65 object law now
  measured INSIDE the pattern streams). The TWENTY-SECOND standing watch
  all records hold both sides NOW WITH THE FUNCTION-INTERIOR COLUMNS;
  the D160 mobile-nav record: the clone EXACT (NO Tailwind v4 bug). The
  session66 suite +4 (GREEN x3; one honest-count calibration — the
  tiling-tree census covers the D221d six, of which exactly three carry
  scn sites). Gate: 906 -> 910 (252 + 125 + 533 in 75 files, the s66
  runner, the file-set diff EMPTY, zero failures); VLM 8/8 zero
  adjudications; zero src/ changes again this session.

- **Session 65 (2026-10-17) remediation** — see
  `docs/remediation-plan-session65.md`: the FRESH-CLONE rebuild
  session (the workspace reset; npm ci, Chromium v1243, `.env`,
  the DB re-seeded 1/6/2, paramiko + the ssh shim). **THE FORTIETH
  SURFACE (D221): the gradient-function value layer** — the
  function-interior T-invariance law (every shading function
  byte-identical across the pinned frames, compared by value — the
  gradient stop values are not the animation carrier, the phase
  lives in the alpha layer), the cross-side value convergence at
  engine float precision (deltas <= 1.2e-7 + the epsilon carriers),
  the axial stitch decomposition (2 exponentials + 4 stitched
  chains — the hero-text sheen symmetric pair), and the
  single-matrix law (the border-shimmer strip's static placement).
  The TWENTY-FIRST standing watch all records hold — now with the
  39th surface's interior columns; the D160 mobile-nav record: the
  clone EXACT (NO Tailwind v4 bug), the live's y35 healed affordance
  holding. The session65 suite +4 (GREEN x3). Gate 902 -> 906 (252
  + 125 + 529 in 74 files, the s65 runner, the file-set diff
  EMPTY, zero failures — the cleanest session yet); VLM 8/8 (one
  prompt-calibration catch); zero src/ changes again this session.

- **Session 64 (2026-10-17) remediation** — see
  `docs/remediation-plan-session64.md`: the FRESH-CLONE rebuild
  session (the first since S61 — the workspace reset, the full
  environment rebuilt: npm ci, Chromium v1243, `.env`, the DB
  re-seeded 1/6/2, paramiko + the ssh shim). **THE THIRTY-NINTH
  SURFACE (D220): the /SMask-in-gs interior decomposition** — the
  live's 13v11 /SMask pair attributed to the two organic-gradient
  hero text elements (gradient-through-gradient-mask chains over the
  hero band; the clone mask-free, 10 v 14 shading patterns), the
  @51 slot attributed to a pure gs-object dedup family, and THE /TR
  INTERIOR DISCOVERY (the shared /Alpha mask's funcType-4
  `{1 exch sub}` inversion — the first transfer function in either
  tree). The TWENTIETH standing watch all records hold (now with
  the pinned-frame column); the D160 mobile-nav record: the clone
  EXACT (NO Tailwind v4 bug), the live's y35 affordance HEALED
  since S63 (a live-site evolution registered). The session64 suite
  +4 (GREEN x3). Gate 898 -> 902 (252 + 125 + 525 in 73 files, the
  s64 runner, the file-set diff EMPTY); VLM 8/8 zero adjudications
  (the seventh consecutive); zero src/ changes again this session.

- **Session 63 (2026-10-17) remediation** — see
  `docs/remediation-plan-session63.md`: the second-consecutive
  warm-workspace session (the clone at `09d9a23` = remote main after
  the operator's session_134 push; the S62 environment carried over).
  THE NINETEENTH standing watch all records hold — now with the
  TRANSFER-MODE COLUMN (the /Screen law + the empty-set, GREEN both
  sides); the D160 mobile-nav record exact (NO Tailwind v4 bug); THE
  THIRTY-EIGHTH SURFACE (the animation-band value layer under a
  pinned-frame print contract) at measured parity — the pin tames the
  phase band (byte-identical within side), 17/19 shapes equal across
  sides at T=1700, two T-invariant structural deltas registered (the
  live's SMask 13v11 + the clone's @51 slot), the engine census (the
  live WAAPI(opacity)+rAF(transform) v the clone CSS-consolidated —
  the same choreography); GOTCHA 73 (the /login streaming window) +
  the two TEST-ONLY hardenings (brand-parity raw rects +
  palette-parity focus pairs — the D135 re-attempt law; zero src/
  changes again this session). The session63 suite +4 (GREEN x3).
  Gate 894 -> 898 = 252 + 125 + 521 in 72 files.
  Gotcha 73 / lesson 102: the streaming-window law + the pinned-frame
  contract + the engine-split census method.

- **Session 62 (2026-10-17) remediation** — see
  `docs/remediation-plan-session62.md`: the warm-workspace session (the
  clone at `1c98d5d` = remote main after the operator's own session_132
  closing-log push; the S61 environment carried over, dev DB
  md5-verified canonical). **THE EIGHTEENTH STANDING WATCH: all
  records hold, now with the READING-ORDER COLUMN** (the watch prints
  /login + /faq + /thank-you per side and compares the D217 word
  censuses — GREEN both sides; instrument catch: the print columns run
  in a FRESH CONTEXT, since an authenticated /login redirects to
  /dashboard — gotcha 72a). **THE D160 MOBILE-NAV RECORD EXACT — NO
  Tailwind v4 bug** (the kickoff's watch item, unchanged). **THE
  THIRTY-SEVENTH SURFACE (D218, law-quality): the /ExtGState-adjacent
  TRANSFER-MODE INTERIORS at FULL PARITY** — (a) the /BM VALUE census
  (/Normal everywhere + THE /SCREEN LAW: the landing's hero
  `mix-blend-mode` renders into print as the /Screen blend mode, ONE
  entry both sides, identical shape — the only non-Normal blend mode
  in either tree); (b) THE TRANSFER-FUNCTION EMPTY-SET LAW (the
  Table-59 family /TR /TR2 /HT /BG /BG2 /UCR /UCR2 /OP /op /OPM /RI
  /D /FL /AIS /TK /SP /Font — zero entries, every route, both sides);
  (c) the BM-BEARING SHAPE CENSUS at the D187 255-grid (the four legal
  routes' 0.7-v-0.702 pair converging at 179 — the banker's-rounding
  instrument catch, gotcha 72b, pinned by D218e: Python round(178.5) =
  178 [half-to-even] v JS Math.round(178.5) = 179 [half-away]; any
  grid re-implementation outside JS must use floor(v×255+0.5)). NO
  src/ fix required. The session62 suite +5 pins the clone side
  (GREEN ×3). Gate 889 → **894** (252 + 125 + 517 in 71 files, the
  s62 runner's file-set diff EMPTY, zero flakes); VLM 8/8 zero
  adjudications (the fifth consecutive).

- **Session 61 (2026-10-17) remediation** — see
  `docs/remediation-plan-session61.md`: the SECOND-consecutive
  FRESH-CLONE session (the clone at `5ebad7e`; node_modules/Chromium
  v1243/.env/DB 1/6/2 rebuilt; paramiko + the ssh shim re-extracted).
  **THE SEVENTEENTH STANDING WATCH: all records hold** (the working
  eight byte-identical both sides; the clone login → dashboard 233
  words; the D131 trio re-measured in vivo — the third element is ONE
  button, "Need an account? Sign up", the prefix match the honest
  selector). **THE D160 MOBILE-NAV RECORD EXACT — NO Tailwind v4 bug**
  (the kickoff's watch item: the clone's burger clickable at all three
  y-points + the 7×44px rows; the live's toaster-blocked). **THE
  THIRTY-SIXTH SURFACE (D217, law-quality): the pdftohtml -xml
  READING-ORDER layer at FULL PARITY** — 13 states measured two-sided
  with identical inputs, all three censuses EQUAL (the per-word font
  census / poppler's reading-order sequence / the column assignment);
  the 404 carrying only the REGISTERED 2-space-glyph family at one
  word; NO src/ fix required — the S58 line layer + the S49 font
  layer + the S61 word layer all converge. The session61 suite +6
  pins the clone side (GREEN ×4; the quote-sandwich + TestDetails
  catches registered as gotcha 71). Gate 883 → **889** (252 + 125 +
  512 in 70 files, the s61 runner's file-set diff EMPTY); VLM 8/8
  zero adjudications (the fourth consecutive).

- **Session 60 (2026-10-17) remediation** — see
  `docs/remediation-plan-session60.md`: the FRESH-CLONE session (the
  workspace reset — node_modules/Chromium/.env/DB all rebuilt; the
  first since S24) + the THREE-CANDIDATE pass. **THE SIXTEENTH
  STANDING WATCH: all records hold** (the working eight
  byte-identical both sides; the D160 mobile-nav record EXACT — NO
  Tailwind v4 bug; the D131 trio re-measured on the live in vivo).
  **THE 34TH SURFACE'S ROUTE EXTENSIONS**: the
  second-interpolation-input cross-check HOLDS (the 49-char email's
  typed fills identical both sides); the 3 remaining literal-violet
  rules measured — the live's `*` rule consumes
  `hsl(var(--ring) / .5)` (the float carrier) and its pulse-glow is
  opacity-ONLY. **THE THIRTY-FIFTH SURFACE (D215): the /Shading
  pattern-interior VALUE layer at FULL PARITY** — the S59 token
  convergence carried the shading layer (no fix). **THE
  LITERAL-RULE CONVERGENCE (D213/D214, TDD 6/6 ×3)**: the @theme
  `--ring: 290 100% 50%` component var + the * rule's outline half
  at the live's indirection (the D205 family's LAST member; the
  built css verified surviving; the computed layer UNCHANGED); the
  pulse-glow keyframe at the live's exact body (the two invented
  box-shadows REMOVED); the not-fix guards (the border half's token
  consumption + the login ring literal). **THE D135 HOVER-INSTRUMENT
  HARDENING** (the chunk-9 flake root-caused — the changed-then-stable
  poll + locator hover across the family; the original failing order
  26/26). **THE SANDBOX DATABASE_URL GOTCHA (gotcha 70)**: the
  sandbox pre-sets an out-of-repo absolute `DATABASE_URL` which the
  CLI precedence honors — pin per command in this environment. Gate
  877 → **883** (252 + 125 + 506 in 69 files); VLM 8/8 zero
  adjudications (the third consecutive).

- **Session 59 (2026-10-16) remediation** — see
  `docs/remediation-plan-session59.md`: the THIRTY-FOURTH-SURFACE
  session (the /Kids page-tree VALUE layer + the /DecodeParms
  family measured LAWS; the pdftohtml -xml fontspec colors measured
  RICH). **THE THIRTY-FOURTH SURFACE (D205) — the PDF COLOR-FILL
  VALUE layer**: every rg/scn fill in every stream censused at the
  PDF's 4-decimal granularity — six syntax/precision families
  decoded to THE TOKEN-SYNTAX DIVERGENCE (the live's hsl-component
  tokens carry float precision its hex mirrors quantized away; the
  CSSOM serialization masked the half-LSB delta at every DOM
  layer). **THE VAR-INDIRECTION LAW (D207)**: lightningcss resolves
  literal hsl() to hex at compile time — the mirror keeps the
  live's raw-components + hsl(var(...)) indirection (verified in
  the BUILT css). **THE RED/GREEN-50 OKLCH LEAKS (D209/D210)**: the
  two 50-step palette pins the s9 v3-hex pins missed (the
  error/success banners) — fixed. **THE LOGIN HSL-SPEC CONVERGENCE
  (D208)** + **THE :root-vs-.dark NOT-FIX GUARDS (D212)** (the
  .dark blocks never mount; the rendering primary #8624ff /
  destructive #ef4444 / login ring pinned). The dashboard's chart
  raster re-pinned (the D205 downstream — the stale-pin
  convergence's second sighting). Gate 870 → 877 (252 + 125 +
  500); the battery ELEVEN phases 120/120; VLM 8/8 first-pass zero
  adjudications (the second consecutive). Gotcha 69 / lesson 98:
  the var-indirection + leading-dot fill keys + animation-band
  render + :root-vs-.dark laws.

- **Session 58 (2026-10-16) remediation** — see
  `docs/remediation-plan-session58.md`: the FIRST src/-change parity
  session since S54 (the worklog S57 candidates — the
  THIRTY-THIRD-surface trio probed on the raw shape FIRST, the
  lesson-88 discipline; the /HT + catalog-view + ICC candidates
  measured empty/null and registered as laws; the dashboard's
  payload-under-mutation selected as the mutation column). **THE
  THIRTY-THIRD SURFACE (D198) — the content streams' TEXT-POSITION
  layer**: every Td/Tm/TJ positioning record tokenized, the glyph
  runs positioned, the pages compared at the LINE level — (y, x0,
  runs, glyph-hash) with the per-baseline block merge absorbing the
  ±2 BT/Tm re-blocking family — the six deterministic content routes
  at FULL LINE-LEVEL PARITY (23/6/36/39/34/64 lines), the landing's
  23-line stable core, the 404's registered 2-space-glyph delta
  (pdftotext byte-identical), /demo the 27-line superset floor.
  **THE LOGIN-LOCAL H2-H6 TRACKING FIX (D199 — TDD
  RED→BUILD→GREEN)**: the reference's SPA bundle ships a base
  `h1..h6 { letter-spacing: .02em }` rule its LOGIN bundle does NOT
  — the three alternate-state h2s computed +0.48px here vs normal
  on the live (measured at this layer: +3.84..4.57pt x-origin
  shifts, identical glyph hashes, per-glyph 16/19/19-run
  decompositions vs the live's single merged run — the
  RE-SEGMENTATION root cause of the D177/D182 family); the
  login-local `h2..h6 { letter-spacing: normal }` pin converged the
  alternates to FULL line parity AND the S52 D182 record to the
  merged truth (16-Tj+15-Td → 1 Tj; text 74 → 44 — the stale-pin
  convergence: the gate's missing test was the OLD divergence pin
  failing, re-pinned to the converged truth). **THE FOUR LAWS
  (D200-D203)** — the /HT empty-set + the /OpenAction+/PageMode
  null catalog-view + the alternates' ICC empty-set + the gs
  VALUE-layer parity (/SA /LW /LC /LJ /ML at exact multiset parity).
  **THE MUTATION COLUMN (D204)** — the dashboard's print payload
  tracks the data (+1 shading pattern per new chart row to the
  ceiling, objects 292→303→320→329 deterministically, gs 18 +
  tilings 3 stable, A===A2 at every step). **THE FOURTEENTH
  standing watch: all records hold.** Gate 859 → **870** (252 +
  125 + 493 — the session58 suite's +11; the chunk runner built
  from the S57 runner per gotcha 66c, the file-set diff EMPTY);
  the drift battery REBUILT as ONE consolidated ten-phase check at
  **103/103 GREEN ZERO DRIFT** with FOUR instrument REDs
  root-caused mid-run (gotcha 68 / lesson 97: the render-input
  identity — both sides' cached renders MUST be captured with
  IDENTICAL inputs, the D177 interpolation family at the battery
  layer; the comparator-format law — constants compared under the
  comparator's own sort; the glyph-string HEX law, the lesson-88
  family's 9th sighting; the stale-pin convergence law). 21
  screenshots refreshed (the dev DB canonical before AND after);
  VLM **8/8 on the FIRST PASS** — zero adjudications.

- **Session 57 (2026-10-16) remediation** — see
  `docs/remediation-plan-session57.md`: a registration cycle (the
  worklog S56 candidates — the THIRTY-SECOND-surface trio probed on
  the raw shape FIRST, the lesson-88 discipline; the route-extension
  candidates verified already-pinned; ZERO src/ changes). **THE
  THIRTY-SECOND SURFACE (D195) — the image STREAM PAYLOAD layer**: the
  filtered BYTES of every image XObject (`qpdf --show-object=N
  --filtered-stream-data` — the layer below the S56 image-dict
  interior) — every deterministic route at FULL BYTE PARITY on the
  first honest measurement (/login 6 streams incl. the 754x676 SMask
  pair + the DCT family, byte-identical sha256s across sides; the
  content routes + the 404 + /demo the empty-set family; all five
  /login alternates byte-identical); the landing's payload BUCKETS
  through the 3x-per-side stability probe (the stable-shared core
  byte-identical — the 1165x103 pair + the DCT family + the stable
  masks; the VIDEO-FRAME family frame-dependent on BOTH sides with
  INTERSECTING sha sets — the same 8s video captured at different
  times, incl. the 1920x1080 poster; the 201x1 pair frame-dependent
  on BOTH sides — the S56 record's clone-only reading corrected; the
  clone-only slivers 1x26/738x1/738x26 pinned at the byte level). **THE
  /ANNOTS VALUE LAYER (D196)**: every annotation dict at the value
  level — the /Rect byte-precision (136.77/802.38-class values
  identical to 2dp across sides), the /A /S /URI actions, the /Dest
  named dests, the /F=4 flags, the /BS empty — under the pg-dropped +
  origin-normalized contract at EXACT parity on every public route
  (landing 69, /faq 14, /thank-you 1, privacy/terms/refund 14,
  /accessibility 16, /login + 404 empty, /demo the 14/0 superset
  floor). **THE Q/Q LAW (D197)**: balanced q/Q on every page content
  stream (endDepth 0, maxDepth <= 2) with the content-route
  ENGINE-FAMILY deltas registered (clone privacy 70 / live 66, terms
  68/66, accessibility 86/80, refund 70/66 — stable per side,
  measured 3x; the landing's animated 189/190 band + the forms
  stream-count delta 54/57; /demo the 96/7 superset floor).
  **THE TRANSCRIPTION-INJECTION CATCH (gotcha 67)**: the new runner's
  file-set reconciliation diff showed a logo-petels "typo in the
  committed runners" — root-caused as the RECONCILIATION COMMAND'S OWN
  re-typed chunk list carrying the typo (the committed runners
  verified correct by hexdump + git-unmodified; the S56 gate's 849
  stands in full); the honest reconciliation expands the runner FILE
  ITSELF, never a re-typed copy. Gate 849 -> 859 = 252 +
  125 + 482 (the S57 suite's +10 e2e — normal growth); the
  battery at 234/234 across seven phases (the payload + qq + annots
  columns joining — THIRTY-TWO surfaces); the THIRTEENTH standing
  watch all records hold (the mobile-nav D160 exact — NO Tailwind v4
  bug). The instrument laws: the filtered-stream-to-STDOUT law, the
  base64-stream-data law (a plain-ASCII stream is also
  base64-alphabet-clean — disambiguate by the PDF-operator test), the
  u:-prefix origin-normalization law, the fresh-context determinism
  law (an authenticated /login redirects to /dashboard).
  Gotcha 67 / lesson 96: the transcription-injection law (the
  reconciliation instrument can inject exactly the defect it claims to
  find — expand the artifact's own file list, never a re-typed copy)
  + the file-set reconciliation + the 201x1 both-sides correction.

- **Session 56 (2026-10-15) remediation** — see
  `docs/remediation-plan-session56.md`: a registration cycle (the
  worklog S55 candidates — ALL FIVE probed on the raw shape FIRST, the
  lesson-88 discipline; ZERO src/ changes; the battery REBUILT after
  the fresh-clone wipe — the S53/S55 precedent). **THE THIRTY-FIRST
  SURFACE (D193) — the image XObject INTERIOR layer at the OBJECT
  level** (the layer BELOW the page-placement census pdfimages
  walks): every image's dims/colorspace/filter + its resolved /SMask
  target + the ICC profile streams through SHAPE-BASED detection —
  **THE ICC SHAPE LAW** (the lesson-88 family's EIGHTH sighting:
  Skia's profile streams carry NO /Subtype, so the S54 color-space
  detector was shape-blind at the image layer; the landing's video
  poster carries a 716-byte N=3 profile BYTE-IDENTICAL across sides —
  the FIRST honest ICC measurement; the S54 law REFINED, not
  contradicted: zero NAMED page-resource entries holds, the
  image-embedded ICC layer sits below it). The stable seven + the
  five alternates + the 404 + /demo at **FULL OBJECT-LEVEL
  IMAGE-INTERIOR PARITY** on the first honest fresh measurement
  (/login 6 images with the 754x676 RGB→Gray SMask pair identical
  across sides; the alternates 6/6/1/2/2; the content routes the
  empty-set family). **THE LANDING'S FORM-NESTED SUPERSET REGISTERED**
  (the clone's CSS-keyframe animated elements rasterize as image
  slivers inside FORM XObjects at print time — 16-18 object-level
  images vs the live's stable 13 + the 710x28x jitter — the D125
  engine-structure family; the page-PLACED census unchanged at 13/13,
  the S50 pin green). **THE FOUR LAWS (D194)**: the /Decode EMPTY-SET
  + the /DecodeParms EMPTY-SET + the inline-image BI/ID/EI EMPTY-SET
  (every public route, both sides, all 31 renders zero) + the /demo
  print-gradient EMPTY-SET. **THE RE-VERIFICATIONS**: the /Info VALUE
  layer (the S49 record re-derived — Producer "u:Skia/PDF m153" +
  Creator "u:Chromium" + the per-route Titles, identical across sides)
  + the dashboard's function fingerprint (the S55 record holding:
  4 exponential + 0 standalone). The standing watch TWELFTH
  consecutive re-verification (the working eight at byte-identical
  word parity 739/24/101/36/335/390/566/285, the sitemaps 8/7, the
  soft-404 family, the D160 mobile-nav record exact — the clone
  all-three-y open the 390x397 panel, the live toaster-blocked
  y21/y28 + y35-only, NO Tailwind v4 bug; the live login records
  holding). TDD: the session56 pins 6/6 GREEN (one in-flight
  instrument catch: the determinism test's missing initial dwell —
  render A measured a blank page, root-caused as the instrument, not
  the code), stable across THREE runs. Gate: **843 -> 849 = 252 unit
  + 125 smoke + 472 e2e** (every chunk reconciled at --list: 472
  tests in 65 files — WITH THE SILENT-SKIP RECURRENCE CATCH: the
  copied S55 chunk runner's sed REPLACED session55 with session56,
  dropping 5 tests; caught at the --list reconciliation, the runner
  fixed, the spec re-run 5/5 — gotcha 66c). The battery REBUILT at
  **201/201 GREEN ZERO DRIFT** across six phases (the standing watch
  16 + the poppler print layers 40 + the structural/resource layers
  27 + the interior layers 33 + the S55 columns 30 + the S56 columns
  48 + the dashboard 3 — the battery now running THIRTY-ONE
  surfaces). 21 screenshots (DB canonical, zero mutations); VLM 5/8
  first-pass + 3 ADJUDICATED BY EVIDENCE (all three the prompt's own
  enumeration errors — the login copy "Welcome to SAAS Company" not
  "Welcome back", the tiers Free/Pro/Enterprise not "Basic", the
  hero's below-fold logo strip). Gotcha 66 / lesson 95: the
  object-level image census law + the ICC shape law + the
  silent-skip recurrence.

- **Session 53 (2026-10-15) remediation** — see
  `docs/remediation-plan-session53.md`: a registration cycle (the
  worklog S52 candidates — ALL THREE delivered; ZERO src/ changes).
  **THE TWENTY-EIGHTH SURFACE (D184) — the PDF's per-page RESOURCE
  NAME-TABLE layer** (every /Type /Page's /XObject /Font /ExtGState
  /Pattern name sets, the page tree resolved from the catalog
  through the string-form refs) — the stable seven at BYTE-IDENTICAL
  NAME TABLES on the first honest measurement: the names encode the
  referenced object numbers, so the byte-parity is the D181
  object-count record now proven at the NAME-ALLOCATION layer (the
  two print pipelines allocate the SAME object numbers to the SAME
  resources); the landing at count-level parity with the name-level
  animated family registered (union counts + per-page multisets
  identical, the names drifting inside the registered bucket — the
  S38 range law at the resource-name granularity); /demo the
  registered superset at the resource layer (12 XObjects across 2
  working pages vs the live shell's zero); the dashboard's
  authenticated resource fingerprint (XObjects 13/17, Fonts 5/7,
  GStates 6/9, Patterns 6 — the charts' pattern fills surfacing at
  the resource layer). **THE 27TH SURFACE'S ROUTE EXTENSIONS
  (D185)**: the five /login alternates' structural censuses at full
  parity (the per-state object-allocation fingerprint 51/52/34/38/38
  identical across sides) + the dashboard's authenticated structural
  census at depth (292 objects, the public contract unchanged under
  auth). The standing watch: zero drift; the D160 mobile-nav record
  + the live login SPA-404 record both re-verified for the NINTH
  consecutive session. The session53 pins 7/7 GREEN on the first
  run (the generated-constants discipline — no pin-transcription
  catches; stable across three runs). Gate: **826 -> 837 = 252
  unit + 125 smoke + 456 e2e** (the timeout-killed chunk tally
  root-caused as an extraction artifact and reconciled against
  --list per chunk); the battery REBUILT at 243/243 ZERO DRIFT
  (up from 195; the RESOURCE + ALTERNATES-STRUCTURAL columns added
  — with three root-caused instrumentation corrections: the
  landing print content flags re-pinned to the current copy, the
  CONTEXT-ORDER law [an authenticated context poisons public
  /login measurements], the post-login settle wait); 21
  screenshots (DB canonical, zero mutations); VLM 8/8 (the two
  first-pass flags adjudicated by evidence — the hero prompt's own
  h1/sub-headline enumeration error + the error-boundary capture's
  SSR-bypass, root-caused through the spec and fixed to the
  pause-click refresh pattern). Gotcha 63 / lesson 92: the reaper
  law + the context-order law + the SSR-bypass law + the
  resource-layer instrument.

- **Session 52 (2026-10-14) remediation** — see
  `docs/remediation-plan-session52.md`: a registration cycle (the
  worklog S51 candidates — ALL THREE delivered; ZERO src/ changes).
  **THE TWENTY-SEVENTH SURFACE (D181) — the PDF STRUCTURAL layer**
  (the document catalog's key sets, the tagged/outline empty-set,
  /ViewerPreferences, the top-level outlines/acroform/encrypt/
  pagelabels views, the per-route object counts) at FULL PARITY on
  its first honest measurement — with the instrument lesson (D183):
  the qpdf-12.2 JSON shape (the catalog found BY ITS /Type under
  qpdf[1], plain objects in .value) after a guessed traversal read
  empty-equals-empty false parity (the lesson-88 family's FIFTH
  sighting, caught by the raw-output discipline). **THE ALTERNATES'
  POST-BUILD CONVERGENCE (D182)**: the S51 badge build verified
  holding (the 1609 raster, words 31, the 6-block census) and the
  card form's 30-op text delta ROOT-CAUSED AT THE GLYPH LEVEL (the
  same 16 glyphs — the clone's per-glyph 16 Tj + 15 Td vs the
  live's one run; the interpolation-dependence law: the typed
  email's length shifts the text count). The 404-route DOM datum
  registered (16 words both sides). The standing watch: zero drift;
  the D160 mobile-nav record + the live login SPA-404 record both
  re-verified for the EIGHTH consecutive session. The session52
  pins 9/9 GREEN (three pin-transcription catches in flight: the
  email-length family, the /demo /Dests transcription, the
  landing's 523/525 animated bucket). Gate: **817 -> 826 = 252
  unit + 125 smoke + 449 e2e**; the battery 195/195 ZERO DRIFT
  (the STRUCTURAL + ALTERNATES-CONVERGENCE columns added — up from
  113; the scrolled-landing records registered: print 670,
  anchors 105, images 29, all both-sides-equal); 21 screenshots
  (DB canonical, zero mutations); VLM 8/8 (the two first-pass
  flags adjudicated by evidence — both the prompts' own
  enumeration errors, the elements proven present by the evidence
  probes). Gotcha 62 / lesson 91: the qpdf-JSON shape law + the
  glyph-level segmentation adjudication.

- **Session 51 (2026-10-13) remediation** — see
  `docs/remediation-plan-session51.md`: a measurement + BUILD +
  registration cycle (the worklog S50 candidates — ALL THREE
  delivered: the twenty-sixth surface, the 25th surface's route
  extensions, and the dashboard's authenticated print story). **THE
  26TH SURFACE (D177): the PDF VECTOR/SCRATCH LAYER at STRUCTURAL
  PARITY** (the content-stream operator census through
  `qpdf --json --json-stream-data=inline`; the form XObjects' BBox +
  operator-family censuses — byte-identical on the stable routes —
  and the per-page content families, with the delta families
  ROOT-CAUSED: the color-VALUE census adjudication [the distinct
  quantized sets identical; the count deltas pure re-establishment
  frequency + the ≤0.5/255 lab() family], the text-run segmentation
  [the same words in different glyph-run blocks], and the
  emission-structure family [background-rect segmentation +
  glyph-run splitting — the D125 law at the operator layer]). **THE
  25TH SURFACE'S ROUTE EXTENSIONS (D178): the /login ERROR state at
  full parity on its first measurement (the 2927 state-tracked
  raster) AND the RESET-SUCCESS state's MISSING MAIL-ICON BADGE
  BUILT** — the FIRST CLONE-GAP BUILD SINCE S47 (the print story's
  state-tracked raster exposed the missing 80px: the live's
  slate-100 circle + the lucide Mail above the heading; the card
  318 -> 398, the raster 1359 -> 1609, converging exactly). **THE
  DM SERIF ITALIC-CUT FIX (D179)**: the live's css2 URL ships no
  ital axis — its italic wordmark is the browser's synthesized
  oblique over the regular file; the clone now loads the regular
  cut only (the print font census converged; the session48 pin
  re-versioned with the italic-absence guard). **THE DASHBOARD'S
  AUTHENTICATED PRINT STORY REGISTERED (D179)**: 292 words, 2
  pages, VendSans-Light 9x, the empty image set (the all-vector
  dashboard), the empty link set, 34 forms. **THE BINARY-STREAM
  PARSER LAW (D180)**: the qdf text-parse's false-object-boundary
  trap (the lesson-88 family's fourth sighting) + the qpdf-json
  instrument + the 1/32 color quantization + the entrance-frame
  raster bucket. The standing watch: zero drift; the D160
  mobile-nav record + the live login SPA-404 record both
  re-verified for the SEVENTH consecutive session. The session51
  pins 11/11 GREEN (the badge pins RED first, then the build).
  Gate: **806 -> 817 = 252 unit + 125 smoke + 440 e2e**; the
  battery 113/113 ZERO DRIFT (the VECTOR + ALTERNATES-EXT columns
  added); 21 screenshots (DB canonical, zero mutations); VLM 8/8
  (the one flag adjudicated by evidence: the 4px top bar below
  full-shot VLM visibility, proven by DOM + pixel-clip). Gotcha
  61 / lesson 90: the binary-stream parser law + the color-value
  adjudication + the entrance-frame bucket.

- **Session 50 (2026-10-13) remediation** — see
  `docs/remediation-plan-session50.md`: a registration + versioning
  cycle (the worklog S49 candidates — the twenty-fifth surface AND
  the 24th surface's route extensions, both delivered). **THE 25TH
  SURFACE (D174): the PDF XObject/IMAGE layer at FULL PARITY on its
  first honest measurement** (poppler's pdfimages over fresh paired
  renders; the sorted structural census — page/type/dimensions/
  colorspace/comp/bpc/enc/interp/ppi — with the per-render object
  order and the content-derived byte sizes normalized out; the
  landing 13 images [the hero VIDEO frame 1920x1080 icc 92ppi, the
  H1 GRADIENT-TEXT raster 2025x534 rgb+smask, the CTA pill pair, the
  badge pill, four blurred glows], /login 6, every content route the
  EMPTY SET; the ±1px animated-glow jitter bucketed; determinism
  proven across renders; the RASTERIZATION LAW VLM-attributed:
  video frames, background-clip:text gradients, alpha-composited
  pills, and blurred glows rasterize — everything else stays
  vector). **The 24th surface's route extensions (D175): the /login
  alternates' print story at parity** (fonts DejaVu 2+1, metadata,
  link empty-sets, print text 19/25, image censuses — with the
  STATE-TRACKED RASTER record: the card-background raster
  re-rasterizes per state at the card's height 2696/1833/1533). The
  standing watch: zero drift; the D160 mobile-nav record + the live
  login SPA-404 record both re-verified for the SIXTH consecutive
  session. ONE INSTRUMENT LAW: the leading-space row-filter trap
  (pdfimages' right-aligned data rows — gotcha 60, the lesson-88
  family's third sighting). The session50 pins 9/9 GREEN on the
  first run. Gate: **797 -> 806 = 252 unit + 125 smoke + 429 e2e**;
  the battery 66/66 ZERO DRIFT (the image-layer + alternates
  columns added); 21 screenshots (DB canonical, zero mutations);
  VLM 8/8.

- **Session 49 (2026-10-13) remediation** — see
  `docs/remediation-plan-session49.md`: a measurement + registration
  + versioning cycle (the worklog S48 candidates — the 23rd
  surface's route extensions AND the twenty-fourth surface, both
  delivered). **THE 24TH SURFACE (D171): the font-EMBEDDING layer
  at FULL PARITY on its first measurement** (poppler's pdffonts over
  fresh paired renders, subset prefixes stripped; the per-route
  family×count×type×encoding censuses byte-identical on 9/10
  routes; /demo the registered superset; emb/sub/uni yes/yes/yes
  everywhere; the counts deterministic across three independent
  render sessions — stability PROVEN before pinning). **The PDF
  METADATA layer (D172): parity** with the per-render noise
  (CreationDate/ModDate/File size) normalized out BY CONSTRUCTION.
  **The 23rd surface's route extensions (D173)**: the four
  content-route link censuses + the named-destination tables
  (pdfinfo -dests) at parity. The standing watch: zero drift; the
  D160 mobile-nav record + the live login SPA-404 record both
  re-verified for the fifth consecutive session. TWO INSTRUMENT
  LAWS: the pdffonts parser column trap (the TYPE column carries a
  space — "CID TrueType" — so a per-column \S+ regex silently
  returns an EMPTY census and empty-equals-empty reads as false
  parity; split on 2+ spaces) and the silently-dead
  capture-interaction law (the FAQ capture click's regex never
  matched a real question and the .catch() swallowed it — gotcha
  59). The session49 pins 9/9 GREEN on the first run. Gate:
  **788 -> 797 = 252 unit + 125 smoke + 420 e2e**; the battery
  50/50 ZERO DRIFT (the font-embedding + metadata column added);
  21 screenshots (DB canonical, zero mutations); VLM 8/8 (the two
  flags adjudicated by evidence: the 01 the prompt's own wrong
  headline quote, the 07 the capture bug — fixed + re-captured with
  DOM proof).

- **Session 48 (2026-10-13) remediation** — see
  `docs/remediation-plan-session48.md`: a BUILD-FIX + measurement +
  versioning cycle. **THE HEADLINE: a BUILD-PIPELINE FONT DRIFT
  (D167)** — the baseline gate RED on a code-untouched tree: Google's
  css2 now dedupes every Playfair Display wght to one variable-font
  URL, tripping Turbopack 16.4.0's exactly-one-entry assertion (16
  module-not-found errors). FIXED with `weight: "variable"`
  (rendering unchanged — the family at `font-weight:400 900`, the
  wordmarks' 500/700 through the same variable file; the fix
  regression-pinned against the served CSS). The 22nd surface's
  route extensions (D168): /terms 400 / /accessibility 584 /
  /refund-policy 295 / the 404 16 — all exact; /demo the registered
  superset. **THE 23RD SURFACE (D169): the PDF LINK layer at FULL
  PARITY on its first measurement** (the link censuses byte-identical
  in set and multiplicity — the landing's 87 anchors incl. the 48
  named destinations, /thank-you's single link, the /login + 404
  empty sets; the instrument poppler's pdftohtml, cross-validated
  against pymupdf). The /login + /demo entrance empty-set (D170) +
  the D160 fourth re-verification (two instrumentation laws: the
  aria-blind detector; the hydration-timing click). TDD: the build
  failure the RED, the weight fix the GREEN; the session48 pins
  11/11 on the first run. Gate: **777 -> 788 = 252 unit + 125 smoke
  + 411 e2e**; the battery 30/30 GREEN ZERO DRIFT (the link-layer
  column added); 21 screenshots (DB canonical, zero mutations — one
  capture fix: the PATCH interception needs its own
  /api/workflows/<id> pattern); VLM 8/8 (two flags adjudicated by
  evidence, the 02 shot re-framed clean). Gotcha 58 / lesson 87:
  the build-pipeline drift law + the mobile-nav instrumentation
  laws + the link-layer instrument.

- **Session 46 (2026-10-12) remediation** — see
  `docs/remediation-plan-session46.md`: a measurement +
  registration + versioning cycle (the worklog S45 candidates —
  the twenty-first surface + the mobile-nav clickability
  comparison [the operator's explicit focus] + the standing
  route-watch — answered by the recon; every measured delta a
  clone-superset or parity, NO clone gap to build against).
  **THE TWENTY-FIRST SURFACE (D157-D159): the clipboard/keyboard
  + drag-and-drop + offline-render family** — the clipboard
  empty-set at RENDERED parity (oncopy/oncut/onpaste null both
  sides, user-select auto both, zero ::selection rules both; the
  live's single `.select-none` css rule INERT — zero carriers on
  any probed route, the gotcha-6 family extended to the rule
  layer). The drag-and-drop native-overflow contract at parity
  (the testimonial strip structurally IDENTICAL — grab cursor,
  auto overflow, 8 cards, scrollWidth 3208 — and behaviorally
  identical: no JS drag-pan and no wheel-pan on either side; the
  grab cursor cosmetic on both). The offline render the
  REGISTERED PLATFORM SUPERSET (the clone's full 718-word SSR
  landing under total request block vs the live's 136-word SPA
  shell). **THE BURGER CLICKABILITY RECORD (D160 — the
  headline):** the live's burger at 390 is TWO-THIRDS UNCLICKABLE
  (two dormant react-hot-toast containers, `fixed top-0 z-[100]`,
  `pointer-events: auto`, a 32px band, cover the icon's upper
  2/3 — real clicks at y20/y28 hit the toaster; only the y36
  sliver opens; the JS click opens the identical 7x44px panel —
  the affordance, not the component, is degraded) while the
  CLONE's burger opens at EVERY point (the registered superset,
  on top of the S41 a11y trio). The live's /dashboard re-probed
  THROUGH THE REFERENCE LOGIN: lands at /, /dashboard renders
  the SPA 404 — the soft-404 record holds. TDD: the session46
  pins 8/8 GREEN on the first run (a pure versioning session —
  no registry growth, no src/ changes). Gate: **756 -> 764 =
  248 unit + 125 smoke + 391 e2e**; the battery 28/28 GREEN
  ZERO DRIFT (two in-flight instrumentation adjudications — the
  inner-wrapper class read, the sitemap origin strip); 21
  screenshots (DB canonical before and after — the
  PATCH-fulfillment fix for the error-boundary shot); VLM 8/8
  ZERO flags. Gotcha 56 / lesson 85: the dormant-overlay
  affordance law (measure clickability as a MAP —
  elementFromPoint + the multi-point click census) + the
  survey-script zombie-port law (kill by PORT before AND after
  every standalone boot — the renamed `next-server (v…)` child
  outlives the parent and silently serves stale state).

- **Session 45 (2026-10-12) remediation** — see
  `docs/remediation-plan-session45.md`: a measurement +
  registration + versioning cycle (the worklog S44 candidates —
  the twentieth surface + the nineteenth's route extension + the
  standing route-watch — answered by the recon; every measured
  delta a clone-superset or parity, NO clone gap to build
  against). **THE TWENTIETH SURFACE (D153-D156): the
  traversal/history + media-capability + audio/video family** —
  THE TRAVERSAL HEADLINE: the live's back/forward are
  cross-document full reloads (window mark lost, `back_forward`,
  scroll DUMPED to 0, no bfcache pageshow — its full-load
  route-changes [D152] cost a network reload per traversal)
  while the clone's are same-document popstates (mark survives,
  0 full loads, scroll restored EXACTLY 4620 -> 4620 through
  Lenis, forward returning /faq rendered) — the REGISTERED
  platform superset. The media empty-set (zero pointer/hover
  media rules either side; tap-highlight transparent;
  touch-action auto — the S42 print pattern). The hero-video
  contract (both 1920x1080 / 8s / autoplay+loop+playsInline /
  playing / muted-prop true / zero audio elements) with ONE
  registered superset: the clone's SSR `muted` ATTRIBUTE vs the
  live's property-only React quirk — the registry's FIFTH
  DOM-attr entry (the more robust first-paint autoplay
  contract). The route extension: the /login alternates census
  (6/5/3 counts identical across sides; the autocomplete set
  within the registered D148 family, the reason now naming the
  forgot state). TDD: the session45 pins 13/13 GREEN (the
  registry shape test RED first; two in-flight catches — the
  module-scope `page` reference, and the HEADLESS-SEEK-STALL
  law: a headless `currentTime` seek stalls forever IDENTICALLY
  on both sides, so the loop seam is unmeasurable headlessly —
  pin the loop attribute + the advancing clock). Gate: **743 ->
  756 = 248 unit + 125 smoke + 383 e2e**; the battery 33/33
  GREEN ZERO DRIFT across four phases; 21 screenshots (DB
  canonical before and after); VLM 8/8 with ZERO flags.

- **Session 44 (2026-10-12) remediation** — see
  `docs/remediation-plan-session44.md`: a case-canonicalization BUILD
  + nineteenth-surface + input-route-extension cycle (the worklog S43
  candidates, re-scoped by the adjudication's discovery).
  **THE HEADLINE (D149): the case-canonicalization PROXY** — the
  recon's /FAQ probe read the live's HTTP 200 and the battery's first
  draft ASSUMED a rendered SPA-404; the adj3 probe DISPROVED the
  assumption: the live serves THE FAQ PAGE ITSELF at /FAQ — its SPA
  router matches case-INSENSITIVELY for every working content route
  (/Faq, /FaQ, /THANK-YOU, /Privacy, /TERMS, /Accessibility,
  /Refund-Policy; only /LOGIN — the live's separate Base44 auth page —
  stays case-sensitive), and the clone 404'd every variant (the S43
  /thank-you family again). BUILT `src/proxy.ts` (Next 16's RENAMED
  middleware convention — `middleware.ts` is deprecated in 16; the
  modern name used from day one): any case variant of a known page
  route 308s to the lowercase canonical (query preserved; /api +
  /_next excluded by the matcher; unknown routes + static assets pass
  through to the honest 404; /LOGIN /DEMO /DASHBOARD variants redirect
  too — the live fails all three, the clone's superset). **THE
  NINETEENTH SURFACE (D150-D152): the URL-state + navigation-class +
  selection/view-transition contracts** — the hash-click parity (all
  four nav targets settle identically both sides); the fresh-load hash
  record (the live NEVER scrolls on a TRUE fresh load — its SPA shell
  lacks the anchor at parse time; only same-document hash CHANGES
  scroll, the about:blank discipline separating the classes — while
  the clone's SSR anchor scrolls: the registered functional superset,
  deep links to sections WORK); the query-param tolerance (canonical +
  og:url stay clean on both sides); the trailing-slash record (live
  200-at-both vs clone 308); the route-change class (the live
  FULL-LOADS its route links — footer /faq + Log In, its logo click
  same-document, its own inconsistency — vs the clone's client-side
  transitions everywhere: the platform superset, measured with the
  page load-event counter); the selection + view-transition empty-sets
  (zero ::selection rules, user-select all-auto, zero @view-transition
  rules/names — both sides). **THE ROUTE EXTENSION**: the eighteenth
  surface's /demo input census (22 pointer + 5 text + 0 other; the
  autocomplete trio; the caret white). TDD: the session44 pins 18/18
  GREEN (4 RED on the missing proxy first); three in-flight
  measurement-law catches (the NEGATIVE-ZERO law, the
  SETTLE-every-read law, the A3 inverted-probe bug — gotcha 54). Gate:
  **725 -> 743 checks** (248 unit + 125 smoke + 370 e2e); the battery
  **44/44 GREEN, ZERO DRIFT** across three phases (urlstate 26 +
  demo-input 3 + route-watch 15); 21 screenshots (DB canonical before
  and after); VLM 8/8 with ZERO flags.

- **Session 43 (2026-10-12) remediation** — see
  `docs/remediation-plan-session43.md`: a working-parity route
  build + eighteenth-surface + focus-route-extension cycle (the
  worklog S42 candidates answered by the recon's measurements,
  PLUS the route extension's discovery). **THE HEADLINE: the
  /thank-you working-parity route (D147) — the LAST route where
  the clone soft-404'd what the live serves working, CLOSED.**
  The focus-order route extension's paired walk exposed the
  structural delta (the clone's `button||Go Home` — the 404 CTA —
  vs the live's `a|/|Back to Home`), and the adj-s43 probes
  escalated it: the live serves a REAL 36-word payment-success
  interstitial there (bare-centered — no nav, no footer, no
  landmarks; the circle-check-big icon at green-500; the
  Back-to-Home anchor pill; the full head contract with the
  D117-truncated description the pageDescription seam reproduces
  byte-exactly; the JSON-LD trio incl. the BreadcrumbList [Home,
  Thank You]; in the live's own sitemap at weekly/0.8). **The A2
  probe DISPROVED the S14 rationale** (the live's newsletter form
  does NOT navigate to /thank-you — the submit stays at `/`, an
  inline fetch flow; the "newsletter-success route" comment was a
  misidentification — the page is the checkout-success
  destination). BUILT at the measured contract:
  `src/app/thank-you/page.tsx` (the live's verbatim classes on
  the already-pinned @theme tokens), the sitemap now the live's
  7 + /demo = 8 URLs (the STRICT superset — the D141 swap
  superseded), the smoke page loop + the battery route-watch
  flipped from the 404-by-design to the words-match. **The
  EIGHTEENTH surface (D148): the cursor/caret + form-autofill
  contract** — the cursor census identical on every pairable
  route (pointer/text counts: / 32+1, /login 4+2, /faq 27+1),
  the caret-color the auto-inherited currentColor both sides,
  the :autofill rules ZERO both sides (the empty-set contract),
  and the autocomplete census: the live ships NONE anywhere
  while the clone carries the S14-era login pair — now
  REGISTERED as the registry's fourth DOM entry (the
  invisible-at-rest functional superset: password-manager +
  browser-autofill assist, WCAG 1.3.5). **The route extension:
  the four legal routes' walks at 1440 (22 stops) + /privacy at
  390 (16 stops) — structurally identical across sides** (the
  legal bodies carry no tab stops; the only deltas the
  registered S41 a11y-name supersets). **The D146 record
  CORRECTED**: "the clone's /pricing continues as a fully
  working page" was an ERROR — the git history has NO
  src/app/pricing (the route never existed); both sides fail
  that route honestly (the pricing content lives in the
  landing's #pricing section on both sides); the battery's
  route-watch now asserts both sides' truth (the working
  supersets are /demo + /dashboard only). Gotcha 53: a "by
  design" record is a HYPOTHESIS about the reference's intent —
  re-verifiable, and sometimes WRONG. TDD: the session43 pins
  9/9 GREEN (4 RED on the missing route first). Gate: **714 ->
  725 checks** (248 unit + 125 smoke + 352 e2e); the battery
  **41/41 GREEN, ZERO DRIFT** across four phases (thankyou 9 +
  input-surface 11 + focus-ext 5 + route-watch 16); 21
  screenshots (the standing 20 + the new 17-thank-you shot; DB
  canonical before AND after); VLM 8/8 with ZERO flags (the
  standing five + the banner + the boundary + the thank-you
  page).

- **Session 41 (2026-10-12) remediation** — see
  `docs/remediation-plan-session41.md`: a focus-order +
  mobile-nav-verification cycle (the worklog S41 candidates, answered
  by the recon's measurements). **THE HEADLINE: the drift battery's
  SIXTEENTH SURFACE — the focus-order inventory** (the Tab sequence
  as an ORDERED surface, paired clone-vs-live WITHIN a viewport: the
  landing at 1440 [34 stops] and 390 [28], /login [6], /faq [28],
  the open mobile menu [10] — every combo structurally IDENTICAL
  across sides; the only deltas the registered records: the D-record
  CTA-card href, the a11y-name supersets [logo/burger/newsletter —
  the live's controls are UNNAMED], the gotcha-52e open-menu card
  height). **The new law (gotcha 52f — the FULL-WALK law)**: the
  first 390 walk read FIVE stops — the stall detector broke on three
  CONSECUTIVE UNNAMED feature tabs sharing one key; the true walk is
  28 stops both sides — consecutive unnamed controls are legitimate
  stops, and the tab inventory is VIEWPORT-dependent on both sides
  (pairs WITHIN a viewport, never across). **The behavioral trio,
  measured directionally**: the clone locks scroll + closes on
  Escape + returns focus to the burger — the live does NONE of
  these (its post-Escape walk continues the menu rows); the burger's
  a11y trio stands against the live's bare button. **The
  reference-regression watch: NO RECOVERY, NO NEW REGRESSION** (the
  soft-404 four unchanged; the /login word-count false flag
  adjudicated — a light page is not a broken page, the watch now
  asserts the FORM); the SEO surface re-verified (D141 sitemap,
  RFC-9309 robots, per-route meta/canonical/og). TDD: the
  session41-focus-inventory suite **7/7 GREEN on arrival**. Gate:
  **700 -> 707 checks** (247 unit + 124 smoke + 329 -> 336 e2e —
  the session41 suite +7); the battery **36/36 GREEN, ZERO DRIFT**
  (focus-order 23 + route-watch 13); 20 screenshots refreshed (DB
  canonical before AND after — the capture lesson: a Playwright GLOB
  does not cross `/`, so the PATCH-abort needs a REGEX route or the
  canonical DB dirties); VLM 5/5 with ZERO flags + 2/2 supplementary
  (the banner + boundary states).

- **Session 40 (2026-10-11) remediation** — see
  `docs/remediation-plan-session40.md`: a responsive-breakpoint +
  reference-regression-watch cycle (the worklog S40 candidates,
  re-scoped by the recon's measurements). **THE HEADLINE: the drift
  battery's FIFTEENTH SURFACE — the responsive breakpoint inventory**
  (the same element set measured at 390/768/1024/1440 on the landing
  and /login, paired clone-vs-live, DWELL-loaded): nav height 56px
  @390 / 72px @≥768 both sides; the burger below md / 7 desktop links
  at ≥768; **zero horizontal overflow at every width both sides**;
  document heights byte-identical per width (10092/7748/7544/7498
  landing, 900 login); **ZERO real geometry drift at any breakpoint**
  — the only asymmetry the clone's `<main>` landmark on the LANDING
  (the registered a11y superset; on /login BOTH sides carry
  main|min-h-screen.flex, identical sets). **The new law (gotcha
  52e — the DWELL law is PER-BREAKPOINT)**: a viewport change
  re-renders and RE-ARMS the below-fold entrances — the un-dwelled
  first probe read the live's problem-section card at 262×311 (its
  UNFIRED initial scale(.95); the bundle authors scale:.95 → 1) vs
  the clone's true 276×327, +30px cascading fictions below; under
  dwell both settle at `transform: none`. **The reference-regression
  watch (D146)**: the live's soft-404 set grew to FOUR routes —
  `/pricing` NEW this session (verified twice) alongside /demo,
  /dashboard, /checkout; its sitemap UNCHANGED (7 URLs — /pricing
  never listed, the clone's sitemap policy record stands); the
  clone's /pricing the documented working-superset route. TDD: the
  session40-responsive-inventory suite **7/7 GREEN on arrival** (the
  parity session's registry-pins pattern; one standing pin hardened —
  the S36 D135 hover-poll's 150ms hover-settle after a full-suite
  load flake). Gate: **693 -> 700 checks** (247 unit + 124 smoke +
  322 -> 329 e2e — the session40 suite +7); the battery **69/69
  GREEN, ZERO DRIFT** across its two phases (responsive 56 + route
  watch 13); 20 screenshots refreshed (DB canonical before AND
  after); VLM 5/5 with ZERO flags (the known parity expectations
  encoded in the prompts).

- **Session 39 (2026-10-11) remediation** — see
  `docs/remediation-plan-session39.md`: a stacking-inventory +
  loop-period + reduced-motion cycle (the worklog S39 candidates,
  re-scoped by the recon's measurements). **THE HEADLINE: the drift
  battery's FOURTEENTH SURFACE — the z-index/stacking inventory**
  (every rendered element with z-index ≠ auto OR position ≠ static,
  DWELL-loaded — the new gotcha-52a law: the live's below-fold
  entrances need HOLDING, not passing) — the raw signature diff
  resolves ENTIRELY into REGISTERED families (the live's dormant
  toaster shells ×2 families [z-[100] content routes + z-9999
  data-rht-toaster on /login], the framer centering/residue
  transforms ~51 vs ~20, the platform announcer, the dashboard
  sticky-header superset [the live's top bar is STATIC — scrolls
  away], the WCAG live region, the /demo superset route [the live
  SOFT-404s it]). **The loop PERIOD layer caught D144**: the hero
  scroll-dot bar (the live's OWN BUNDLE: `y:[0,8,0], duration:1.5` —
  the clone shipped S8's coarse 1.7s estimate; fixed in both CSS
  carriers). **D145 REGISTERED**: the live's chevron float is
  suppressed by its own vestigial `whileInView:{y:0}` (authored
  −15px, rendered 0.04–4.4px — an unstable race; the clone keeps the
  AUTHORED contract per the D125/S14 precedent). **The live
  /dashboard 404s as of S39** (a reference-side regression — the S38
  parity record stands as the versioned contract). **TOOLING (gotcha
  52): four measurement laws** — the DWELL law (entrances need
  holding), the REAL-TIMESTAMP law (performance.now deltas, never
  nominal index×interval — timer clamping under-reports ~10%; median
  trough-gaps), the VARIANT-CONFLICT law (adjudicate rendered
  amplitudes against the live's BUNDLE — whileInView/animate races
  have no stable rendered contract), the EVAL re-catch
  (page.evaluate(string) needs eval() first). Gate: **673 -> 693
  checks** (247 unit + 124 smoke + 302 -> 322 e2e — the session39
  suites +20); the battery **24/24 GREEN, ZERO DRIFT** across its
  three phases (stack 8 + period 5 + extra 11); 20 screenshots
  refreshed (DB canonical before AND after); VLM 5/5 after
  adjudication (every flag a check-prompt expectation error or
  live-own parity — the mobile-menu artifact verified IDENTICAL on
  the live by side-by-side VLM comparison; gotcha 18's toaster
  pointer-block re-caught IN THE WILD on the live's own burger).

- **Session 38 (2026-10-11) remediation** — see
  `docs/remediation-plan-session38.md`: a loop-inventory +
  static-inventory cycle (the session_74 S38 candidates, RE-SCOPED by
  the recon's measurements — the three proposed surfaces all measured
  EMPTY or at parity: radial/conic gradients ZERO carriers; the
  will-change/backface/transform-style/isolation companions zero
  non-default carriers on either side; the font-family STACKS four
  byte-identical stacks). **THE HEADLINE: the drift battery's
  THIRTEENTH SURFACE — the LOOP inventory** (library-agnostic
  animation parity: time-sampled computed transform/opacity/
  background-position/stroke-dashoffset — CSS keyframes AND the
  live's framer inline writes both surface as cyclers; plus the WAAPI
  layer pinning every CSS animation's name/duration/delay/keyframe
  stops) — caught on its FIRST run **D142**: the logo petal
  choreography (the live's petals slide AXIS-ALIGNED ±12.84px with
  the 0/30/50/80/100 peak-hold shape, WAAPI-extracted; the clone
  shipped a diagonal 3px jitter — amplitude 4.28x off, direction
  rotated 45°) and **D143**: the hover-shine's gradientShift (the
  live's FOUR-CORNER bg-position cycle (0% 50%) → (0% 0%) →
  (100% 50%) → (50% 100%) → back, hover-sampled; the clone shipped
  a two-stop sweep). Both fixed in globals.css with the live's
  verbatim function spellings (WAAPI strings compare byte-identically).
  **TOOLING (gotcha 51): animation-name is library-blind** (the live's
  framer loops are inline writes — an animation-name column reads ~16
  phantom clone-only carriers); the loop inventory is the honest
  surface, with the LONG-SETTLE law (framer entrance springs RING for
  seconds — 2.5s before sampling) and the WINDOW-COVERAGE law (a 4.6s
  window cannot converge a 14s bg-pos cycle — family + movement
  evidence + the WAAPI duration, never a phase jaccard). Gate:
  **656 -> 673 checks** (247 unit + 124 smoke + 285 -> 302 e2e — the
  session38 suites +17); the battery **52/52 GREEN, ZERO DRIFT**
  across its three phases (loop 16 + r3 24 + extra 12); 20
  screenshots refreshed (DB canonical before AND after); VLM 4/5 raw
  -> 5/5 after the login 4px-strip flag re-adjudicated by
  computed-level evidence.

- **Session 37 (2026-10-11) remediation** — see
  `docs/remediation-plan-session37.md`: a transition-timing +
  gradient-layer + pointer-modality cycle (the session_72 S37
  candidates). **THE HEADLINE: the drift battery's TWELFTH SURFACE —
  the transition-timing contract** (which props transition, at what
  duration/easing, per interactive; the `--tw-*` family stripped) —
  caught **D137**: the live's LOGIN bundle ships `.transition-colors`
  with the legacy `-webkit-text-decoration-color` alias (7 props)
  where its SPA bundle ships 6 — fixed with a route-scoped style
  override + 3 pins. **The gradient layer** (background-image through
  the gradient contract) caught **D138** — v4's `in oklab`
  interpolation directive, a REAL mid-ramp rendering difference —
  fixed by overriding the five USED `bg-gradient-to-*` utilities;
  **D139** — the explicit 0%/100% stop positions (value-identical,
  the from/to ride the override, the via positions normalized);
  **D140** — slate-100 + gray-50 `lab()` STOPS (the D134-D136 family
  one layer deeper: the STOP layer no color-prop anchor sees), pinned
  in the @theme; the color-mix alpha stops probed VALUE-IDENTICAL
  (maxDelta <= 0.044) and normalized. **The pointer-modality focus
  twin** (a REAL held mousedown — :focus without :focus-visible) ran
  GREEN at parity after THREE measurement-artifact families were
  disciplined (the scroll-settle, atomicity, and verified-poll laws —
  gotcha 50c). **The extra phase** caught **D141**: the clone's
  sitemap listed /login where the live's own policy omits it —
  removed. **TOOLING (gotcha 50): the standalone server FORKS** (a
  wrapper-only kill orphans a next-server child serving a STALE
  build — the port guard + the group kill); **an incremental build
  can serve a MIXED build** after route-scoped <style> edits (a
  hydration #418 with NO code defect — rm -rf .next before any gate
  build; the clean-rebuild bisect proved the CSS innocent). Gate:
  **645 -> 656 checks** (247 unit + 124 smoke + 274 -> 285 e2e — the
  session37 suites +11); the battery **36/36 GREEN, ZERO DRIFT**
  across its four phases (pointer 8 + gradient 8 + transition 8 +
  extra 12); 20 screenshots refreshed (DB canonical before AND
  after); VLM 4/5 raw -> 5/5 after the login 4px-strip flag
  adjudicated by computed-level evidence.

- **Session 36 (2026-10-11) remediation** — see
  `docs/remediation-plan-session36.md`: an interaction-surface +
  container-style + prompt-boundary-pin cycle (the session_70 S36
  candidates). **THE HEADLINE: the drift battery's NEW ELEVENTH
  SURFACE — the interaction-surface column (the S6 hover-probe
  discipline automated: the k-th rendered interactive element at
  REST, under REAL hover [page.mouse.move — gotcha 16], and under
  REAL keyboard Tab focus [the focus-VISIBLE contract], through the
  S35 normalization contract)** — it caught the **`lab()`
  serialization family** on its first run: the clone's v4-default
  "exact match" tokens (Session 9's unpinned list — slate-50,
  gray-200) computing to `lab(…)` spellings where the live ships
  `rgb(…)`. Probed IN VIVO: VALUE-identical (maxΔ=0 through the
  lab→sRGB conversion) — fixed per the slate-200 byte-stability
  precedent (`--color-slate-50: #f8fafc`, `--color-gray-200:
  #e5e7eb`, `--color-gray-100: #f3f4f6` — D136 the anchor-invisible
  structural-wrapper carrier, found by directed grep + probe), with
  the battery's parseColor growing lab()/lch() parsers (the gotcha-4
  law one layer deeper — gotcha 49). The TENTH surface's
  **non-text-bearing second anchor** (the painted media-leaf: icon
  tiles, dots, skeleton shapes, avatars — 61 painted leaves on the
  landing) ran GREEN on its maiden run, verified non-trivial. **R3:
  the composer's prompt-version pin at the route boundary** — the
  mocked-SDK route tests assert the WIRE carries the imported
  GENERATE_SYSTEM_PROMPT constant (RED proven by mutation: a
  re-inlined drifted prompt fails the pin). Gate: **639 → 645
  checks** (247 unit + 124 smoke + 274 e2e); the drift battery
  **102/102 GREEN, ZERO DRIFT across all ELEVEN surfaces**
  (phase-split: 78 main + 8 hover + 8 focus + 8 extra — the sandbox
  reaps long-detached runs); 20 screenshots refreshed (DB canonical
  before AND after); VLM 5/5 with BOTH flags adjudicated by evidence
  (the mockup PASS in-frame at its measured section; the "white
  section" = the LIVE's own features band, confirmed by VLM-reading
  the live's own full page).

- **Session 35 (2026-10-11) remediation** — see
  `docs/remediation-plan-session35.md`: a computed-STYLE inventory +
  aria-vocabulary + SDK-prompt-guard cycle (the session_68 S35
  candidates). **THE HEADLINE: the drift battery's NEW TENTH SURFACE —
  the computed-STYLE inventory column (the twice-deferred candidate,
  shipped with its normalization contract: VALUE-level color parsing
  [rgb/hex/hsl/oklab/oklch → tuples], 0.5px length tolerance + the
  FULL-radius equivalence class [9999px ≡ 33554432px, the scientific-
  notation serialization parsed as a float], the 14-property semantic
  whitelist, the text-bearing element anchor with an element-count
  guard, the rendered-ness BOX check [getClientRects — a child inside
  a display:none subtree still computes its OWN display])** — it
  caught THREE real drift classes on its first run after 34 sessions
  of class-string parity: **(D130) the live's CUSTOM radius scale**
  (rounded-sm 8px, rounded-lg 12px — pinned via `--radius-sm`/
  `--radius-lg` in @theme, the tracking-scale family); **(D131) the
  login's light `--muted`** (zinc-100 under the opaque gradient — the
  F5 `--border` family, pinned in the login route style);
  **(D133) the accessibility note's one-off `mt-4 text-white/50
  italic`** (the content model's note variant). **(D132) the aria-*
  vocabulary extension** (the ninth column's growth): every
  aria-controls reference on the clone was DANGLING at rest (panels
  + mobile-menu unmounted when closed) where the live's Radix
  regions are MOUNTED-HIDDEN — the FAQ panels and the burger's
  mobile-menu now mount hidden at rest (the `hidden` attribute keeps
  the answers out of innerText exactly like the live; the stale S4
  "Radix unmounts closed content" record described the SPA shell),
  and the registry's VALUE layer gains the **id-refs rule type**
  (aria-controls + aria-labelledby: the battery compares RESOLUTION
  validity in each side's own document, never the per-library ID
  namespace — DOM_VALUE_RULES now five entries). **(R3) the
  SDK-prompt drift guard:** `GENERATE_SYSTEM_PROMPT` extracted as a
  versioned seam with the belt-and-braces invariant pinned (the
  prompt's 60/220 limits stay ≤ the sanitizer's 120/500 clamps —
  parsed out of the prompt text, an edit to either side fails a
  pin). Gate: **639 checks** (246 unit + 124 smoke + 269 e2e); the
  drift battery **78/78 GREEN on all TEN surfaces**; VLM 5/5 (the
  hero's below-fold flag adjudicated by the in-frame mockup shot —
  the single-frame family).

- **Session 32 (2026-10-10) remediation** — see
  `docs/remediation-plan-session32.md`: a head-tag-SET parity +
  membership-boundary pinning cycle (the session_62 S32 candidates).
  **THE HEADLINE: the drift battery's NEW SEVENTH COLUMN — the
  per-route head-tag SET (which tags EXIST on each side) — caught
  FOUR drifts on its first run** (the session_62 candidate's own
  prediction: "the twitter surface remains unmeasured"). **(F1) the
  live's `twitter:url` (D120):** shipped on EVERY live route (the
  route's absolute URL), absent on the clone — Next's Twitter
  metadata type has NO url field, so the emission rides
  `metadata.other` through `routeMetadata(page, path)` (the value
  derives from `siteUrl()` + path — one env var, one origin). **(F2)
  the live's /login REDEPLOYMENT (D121):** /login now ships
  `theme-color #000000` + the "Base44 link preview" image alts (ONLY
  on /login; the gotcha-17 record updated) — the login layout
  exports the viewport themeColor + passes routeMetadata's new
  `imageAlt` option. **(F3) the 404's DUPLICATE canonical + og:url
  (D122):** Next 16's client metadata resolution APPENDS its head
  copies AFTER the mount effects run — the S31 first-match mutation
  never saw the appended `/_not-found` copy (and the e2e pin read
  first-match too); the fix normalizes ALL instances + a
  MutationObserver catches the late insertion, and the new pins read
  the COUNTS. **(F4) the clone's `next-size-adjust`:** ADJUDICATED a
  Turbopack framework artifact (the `adjustFontFallback: false`
  opt-out was tested and is INERT under Turbopack — reverted, no
  dead config). **(F6) the 108-row MEMBERSHIP-DISAGREEMENT pins
  (D123):** the S30 dual-ceiling shape at its extreme — the chart's
  top-8-by-runs and the list's newest-100 share ZERO members, each
  honest about its own criterion; the stats carry the full truth
  (5,280/140). Gate: **583 checks** (205 unit + 124 smoke + 255
  e2e); the drift battery GREEN on all SEVEN surfaces (the seventh
  column at parity).

- **Session 31 (2026-10-10) remediation** — see
  `docs/remediation-plan-session31.md`: a head-layer parity +
  chart-boundary pinning cycle. **THE HEADLINE: the drift battery's
  NEW SIXTH COLUMN — the canonical/og surface — caught TWO head
  drifts on its FIRST run** (the session_60 candidate's own
  suggestion — word parity had stood in as the head's proxy for 30
  sessions). **(F1) the live's content-route DESCRIPTION TRUNCATION
  (D117):** the five content routes ship `"{Page} on SAAS Company. "
  + DEFAULT_DESCRIPTION.slice(0, 80) + "."` as BOTH og:description
  AND meta description — the description part HARD-CAPPED at 80
  chars, cut MID-WORD ("…with an immersi."), the landing + /login
  keeping the FULL 214-char default. Invisible to every standing
  gate (the S6 map recorded the pattern, never the length; the
  head-metadata e2e pinned only prefixes; word parity never sees
  meta content). The fix: `DESCRIPTION_APPENDIX_CAP = 80` in
  `pageDescription()` — the ONE seam (description + og + twitter
  all follow); the unit pins flipped to the measured strings + the
  derivation pins; the head-metadata e2e gains the EXACT `descExact`
  pins. **(F2) the 404's canonical + og:url (D118):** the live
  points both at the ACTUAL requested URL (the SPA head-manager
  pattern); the clone had Next's default resolving against the
  internal `/_not-found` route id — a URL that does not exist,
  referenced by a canonical. The not-found page (a client
  component) now sets both tags to `window.location` through a
  one-shot effect (the S11 mount-gate family; no hydration surface;
  Next's router rewrites the head on the Go Home transition).
  Pinned by `session31-head-parity.spec.ts`. **(F3) the chart 8↔9
  note transition (D119):** `session31-chart-edge.spec.ts` pins the
  boundary the S28 tie-break spec walked past — at EXACTLY 8 rows
  NO chart note (the `total > CHART_ROWS` edge); at 9 (the 9th row
  TIED with the 8th, OLDER) the note appears, the older tied row
  is the first-ever EXCLUDED, the LIST note still ABSENT at the
  same workspace (the two honesty contracts side by side — the S30
  mirror image), the stats carrying the full truth. **(F4) the
  battery's live-burger selector:** the live's burger carries NO
  aria attributes and its SVG has NO class — the LIVE side selects
  by the LAST nav button (the clone keeps its labeled burger, the
  a11y superset). Gate: **575 checks** (201 unit + 124 smoke + 250
  e2e); the drift battery GREEN on all SIX surfaces (word parity
  1.0000 ×8, mobile nav byte-identical 7 × 44, SEO clean, JSON-LD
  parity + superset, the canonical/og column at parity).

- **Session 30 (2026-10-10) remediation** — see
  `docs/remediation-plan-session30.md`: a reference-redeployment
  audit + dual-ceiling-boundary pinning cycle. **THE HEADLINE: the
  live reference REDEPLOYED a structured-data layer** (gotcha 7 —
  the reference is a moving target; the D62/D113 "ships none"
  record was true at ITS measurement time): the drift battery's NEW
  JSON-LD mount column (the S29-suggested fifth surface, hardened
  into the battery) caught `application/ld+json` on EVERY live route
  — a minimal WebSite + Organization everywhere, a BreadcrumbList
  (Home → {Page}) on the five content routes. The clone's answer
  (D115): the sitewide pair mounted ONCE in the root layout
  (`websiteStructuredData()` + `organizationStructuredData()`), the
  BreadcrumbList on the five content routes + /demo
  (`breadcrumbStructuredData(page, path)` — the crumb names ARE the
  routes' own metadata stems, content-as-code), and the S29
  supersets stand (`softwareStructuredData()` — the @graph's node
  extracted, cross-linked through the shared @id anchors; the
  FAQPage on /faq). **The dual-ceiling boundary pins (D116):**
  `session30-dual-ceiling.spec.ts` (the dedicated-user pattern,
  `.serial`, Prisma-minted) — at EXACTLY 100 rows the workspace fits
  the list cap (NO list note — the `length < total` boundary); the
  101st row (the OLDEST, a 500-run champion) caps the list at 100 +
  the honest note, the oldest invisible, and the stats stay TRUE
  across the cap (the full-workspace truth while the champion sits
  OUTSIDE the list yet FIRST in the chart). **The capture lesson
  (gotcha 44):** fullPage screenshots capture beyond-viewport
  content WITHOUT scrolling — the IO-driven Reveal entrances never
  fire for below-fold sections (blank dark bands); the fix is a
  scroll-through pass + a post-action settle. Gate: **569 checks**
  (200 unit + 124 smoke + 245 e2e); the drift battery GREEN (word
  parity 1.0000 ×8 — the reference's COPY unchanged; the mobile nav
  byte-identical 7 × 44px with a REAL tap — no Tailwind v4 bug; the
  JSON-LD column at parity + superset); 20 screenshots refreshed;
  VLM ×5 PASS.

- **Session 29 (2026-10-10) remediation** — see
  `docs/remediation-plan-session29.md`: a JSON-LD superset +
    first-run-boundary audit (the S55/S56 logs' three suggested
    surfaces — the empty-to-FIRST workspace transition, the
    all-zero-runs chart floor, and the structured-data extension)
    shipped one superset feature and gated two probed-correct
    boundary families: **the JSON-LD structured-data superset** —
    ZERO routes shipped `application/ld+json` (the reference ships
    none either — pure superset); the pure builders in
    `src/lib/seo.ts` (`landingStructuredData()` — Organization +
    WebSite + SoftwareApplication with the PLANS-derived offers
    [0, 49], Enterprise's null "Custom" price honestly OMITTED —
    and `faqStructuredData()` — the FAQPage from FAQ_ITEMS
    verbatim) render through `src/components/site/json-ld.tsx` on
    the landing and /faq only; content-as-code governs every fact
    (one source of truth per fact, never re-typed copy); the
    word-parity/transfer/CLS budgets proven immune BEFORE
    authoring (the script never renders into innerText, creates no
    resource-timing entry, has no box) and the drift battery
    re-verified GREEN ×8 after the mount. **The first-run boundary
    pins** — the S29 probe walked one user live through 0 rows → 1
    row/0 runs → 3 rows all-zero → one 500-run champion (9/9
    verdicts, every shape COHERENT): `session29-first-run.spec.ts`
    pins the empty-to-FIRST transition through the REAL UI compose
    (cards 1/0/0/100.0% — the documented S21 null→100 convention,
    "No data yet." expiring exactly when data arrives), the
    all-zero chart's UNIFORM 4% floor bars (the top bar NOT
    full-track — the adjudicated degenerate case: all rows tie at
    zero, so equality is the honest encoding), and the first-run
    expiry (the top bar becomes the full track, the rate stays
    100.0% now MEASURED). **The mid-authoring tooling lesson
    (gotcha 43):** one `await` bug in test (a) + Playwright's
    worker-restart-after-failure = the spec module RELOADED, the
    `Date.now()` EMAIL regenerated, beforeAll re-registered a NEW
    user — (b)/(c) ran against split state with wrong-layer
    secondary failures ("the wire and the file disagree" was the
    tell); fixed with the await + `test.describe.serial` for
    state-sharing groups (applied to session28-tie-break too).
    `session29-jsonld.spec.ts` is the FIRST e2e spec importing from
    src/ (FAQ_ITEMS/PLANS — the pin derives from the same sources
    the schema renders from). Gate: **554 checks** (190 unit + 124
    smoke + 240 e2e); 20 screenshots refreshed (VLM ×5: 4/5 + the
    H1-gradient FAIL re-adjudicated with PIXEL EVIDENCE — 4,404
    gradient-family pixels in the H1 zone, the drift-#11
    single-frame sampling artifact, not a defect).

- **Session 28 (2026-10-09) remediation** — see
  `docs/remediation-plan-session28.md`: an hours-seam-exactness +
  tie-break-pinning + CLS-budget audit (the S53 log's three suggested
  surfaces — the `topRuns` tie-break under live mutation, the stat
  cards' `hours` rounding boundary at exactly x.5, and the CLS
  layout-stability milestone — surveyed then extended to their class)
  found and fixed one latent defect and shipped two pin families:
  **the client-fallback hours seam's order-dependent float drift** —
  the "Hours saved" card's CLIENT fallback (the meta-less
  `listStats` memo) summed `timeSavedHours` with a naive JS float
  reduce, order-dependent at exactly-x.5 decimal shapes (probed:
  [15.4, 17.9, 15.2] summed to 48.499999999999993 in list order —
  displaying 48 where the server's SQLite SUM displayed 49; four of
  six probed drift shapes diverged by 1 between the seams — the
  S22/S27 "one definition" law violated at the exact boundary). The
  fix: the pure `sumHours()` seam (`src/lib/workflow.ts` — integer-tenths
  accumulation, associative, order-free; every persisted hours value is
  on the 0.1 grid so the snap is exact for every reachable state);
  the route's rate-rows fetch became the STAT-ROWS fetch
  (+timeSavedHours, renamed `statRows`) feeding both pure seams; the
  aggregate dropped its dead hours column; the page took the twin
  change; the client memo rides the same seam — the seam survey
  re-run shows all six drift shapes AGREE. ALSO: the tie-break pins
  (`session28-tie-break.spec.ts` — the dedicated-user pattern with a
  deterministic 10-row workspace; probed CORRECT 5/5 first: newest
  first among equals, the boundary tie, the pause/resume stability),
  the CLS pins (≤ 0.1 on landing/login/dashboard — the last unpinned
  milestone family), and the e2e suite's AUTH_RATE_LIMIT_MAX raised
  50 → 100 (the ~45 auth flows per run had outgrown the pin — the
  Session-11 razor-edge pattern recurring; the 429s landed on the
  last files alphabetically while an isolated re-run passed). Gate:
  **541 checks** (182 unit + 124 smoke + 235 e2e); 20 screenshots
  genuinely refreshed (VLM ×5 PASS — the three first-run FAILs were
  the check prompts' own contracts written from memory, adjudicated
  against the code before any change).

- **Session 27 (2026-10-09) remediation** — see
  `docs/remediation-plan-session27.md`: a stat-honesty + paint-budget
  audit (the S50 log's three suggested surfaces — the unpinned
  TTFB/FCP budget families, the composed-vs-charted cross-surface
  consistency audit, and the first-run story under the empty-workspace
  boundary shapes — surveyed then extended to their class) found and
  fixed one defect and shipped the paint-budget extension: **the
  success-rate stat card's average-of-averages fallacy** — the card
  rendered Prisma's `_avg successRate`, the UNWEIGHTED mean over
  workflows (probed RED with the extreme shape: 1 row of 12,000 runs @
  60% + 4 rows of 3 runs @ 100% — the card displayed 92.0% while the
  workspace's true run-weighted rate is 60.0%, a 32-point divergence
  sitting directly beside "Total runs 12,012"); the fix is the pure
  `weightedSuccessRate()` seam (`Σ(runs × successRate) / Σ(runs)`,
  null iff Σruns = 0 → the documented 100 mapping) riding the GET
  route's and the dashboard page's `Promise.all` (the two-column
  rate-rows fetch replaces `_avg`) + the client's weighted fallback
  memo + the meta field rename `avgSuccessRate` → `successRate`
  (name/value coherence on the wire) + the label rename to "Success
  rate" (the S26 label-names-its-criterion law); the smoke's 105
  volumetric probe rows changed rate 99.5 → 50 so the new wire pin
  DISCRIMINATES (unweighted 52.7 vs weighted 93.1 — at 99.5 both
  rendered 99.5%, pinning nothing). ALSO: the paint-milestone budgets
  (TTFB ≤ 500ms + FCP ≤ 1000ms per route + the authed-dashboard LCP ≤
  1000ms — the unpainted corners of the S25/S26 families); the pin-gap
  closures (the chart's client-refresh path on compose/delete WITHOUT
  a reload + the empty-workspace first-run render); and the capture
  script's swallowed-error bug fixed (its `finally`'s
  `process.exit(0)` preempted the pending catch — the S26 run had
  refreshed only 17 of 20 shots while exiting 0; the completion log
  line is the check, never the exit code alone). Gate: **529 checks**
  (176 unit + 124 smoke + 229 e2e); 20 screenshots genuinely
  refreshed (VLM ×5 PASS on the first run — both S26 lessons encoded
  in the prompts).

- **Session 26 (2026-10-09) remediation** — see
  `docs/remediation-plan-session26.md`: a chart-ranking + transfer-budget
  audit (the S48 log's three suggested surfaces — the chart's
  top-8-by-runs vs recency question, the keyboard-focus sub-tab order
  audit, and the JS-transfer budget — surveyed then extended to their
  class) found and fixed one defect with a two-layer mechanism and
  shipped the transfer-budget extension: **the chart's
  selection-criterion lie** — the runs chart under "Runs by workflow"
  charted the 8 most RECENT rows (`slice(0, 8)`, mirroring the list),
  not the top 8 BY RUNS (probed RED with a 12-row workspace whose
  OLDEST row carries 12,000 runs: the champion INVISIBLE, every bar a
  4%–7.5% stub — the maxRuns denominator from a row the chart never
  displayed); the DEEPER lie: at >100 workflows the client state is
  the capped newest-100 list, so ANY client-side ranking ranks only
  the newest 100 — the fix is SERVER-SIDE: `meta.topRuns` (the S21
  stat-cards precedent extended to the ranking surface) + the page's
  `initialTopRuns` prop + the pure `rankByRuns()` fallback seam
  (`CHART_ROWS` moved to `src/lib/workflow.ts` — one constant for
  server + client); `maxRuns` is the CHARTED max (the top bar renders
  100%), the note names the criterion ("Showing the top 8 of {total}
  workflows by runs."), the LIST keeps its own recency note — D106.
  **The keyboard tab-order audit: CLEAN** (34 reachable + focus-styled
  on `/`, 6/6 on /login, 27/28 on the dashboard — the 28th the
  disabled Compose button, correctly skipped; the D63 shared item;
  aria-pressed toggle buttons legitimate — a documented non-finding).
  **The JS-transfer budget pins shipped** (the S48 suggestion):
  landing/login/authed-dashboard scripts ≤ 400KB (measured 172/152/
  177KB — 2.3–2.6x margins, preventive by design) — D107. +6 unit +
  5 smoke (the 111-row topRuns wire pins — the champion sits outside
  the newest-100 cap) + 7 e2e (4 ranking pins + 3 transfer pins); RED
  observed pre-fix (unit 6/6; e2e: first row most-recent, champion
  crowded out, top bar 61.57%); gate: **511 checks** (170 unit + 123
  smoke + 218 e2e); 20 screenshots refreshed (VLM ×5 — after
  adjudicating the ELEVENTH and TWELFTH check-prompt drifts: a
  single-frame capture of the ANIMATED gradient heading read as
  "missing gradient" (a time-sampled probe proved the 14s sweep
  RUNNING), and the prompt invented a hero "dashboard mockup" — the
  hero's video is the full-bleed BACKGROUND, the mockup a separate
  below-fold section; write the check prompt FROM the spec's pinned
  assertions).

- **Session 25 (2026-10-09) remediation** — see
  `docs/remediation-plan-session25.md`: a runs-chart honesty +
  observability audit (the S46 log's two suggested surfaces — the
  performance-budget hook and an a11y deep-dive on the runs chart —
  surveyed then extended to their class) found and fixed two defects
  and shipped the hook: **the chart truncation lie** — the runs chart
  rendered `slice(0, 8)` silently (probed RED with a 12-row probe
  workspace: 8 bars, no note, heading "Runs by workflow"); now
  `CHART_ROWS` + the S21-pattern note "Showing the 8 most recent of
  {total} workflows." with the TRUE server-side total — D104. **The
  chart's missing list semantics** — the rows were div soup (a screen
  reader never heard "list, 8 items"); now a semantic `ul`/`li` —
  D105. Caught mid-execution BY the probe: the note's first draft used
  `text-white/40` (3.5:1 — the axe scan flagged it; the LIST's S21
  note carried the same latent violation, never rendered in any scan);
  both notes now `text-white/50` (5.3:1). **The performance-budget
  hook shipped** (`tests/e2e/performance-budget.spec.ts`): landing DOM
  ≤ 1200 / landing LCP ≤ 1500ms / login LCP ≤ 800ms / authed dashboard
  DOM ≤ 500 — the S21/S22 ceilings pinned with 2–4x margins + the
  WORKFLOW_RATE_LIMIT_MAX=50 webServer insurance pin. Adjudicated
  non-finding: the 4% bar floor (identical bars for a 20x difference —
  the adjacent exact values are the honest contract). +7 e2e (3 chart
  pins + 4 budget pins); gate: **493 checks** (164 unit + 118 smoke +
  211 e2e); 20 screenshots refreshed (VLM ×5 — after adjudicating the
  NINTH and TENTH check-prompt drifts: an invented "Watch demo" CTA /
  omitted beta badge, and an invented "Sign in" heading / "NovaAI
  logo" — the pinned contracts are the beta badge + Book a Demo +
  hero video, and "Welcome to SAAS Company" with the reference's own
  'S' chip).

- **Session 24 (2026-10-09) remediation** — see
  `docs/remediation-plan-session24.md`: a temporal-and-placement-
  honesty audit (the S44 log's suggested surfaces — the banner
  lifecycle and a performance-budget hook — surveyed first, then
  extended to their class) found and fixed three defects: **the
  client hang class** — no client fetch carried a timeout, so a
  black-holed request (the CLIENT twin of S15's server-side hang)
  left the dashboard's busyId spinner engaged FOREVER (probed RED:
  still spinning after 8s, no banner; the S12 pins cover aborts,
  which reject immediately — the hang was invisible to the gates);
  now `fetchWithTimeout()` (`src/lib/client-fetch.ts`, 20s) rides
  ALL five client fetch sites — D101. **The stale-banner class** —
  the two error surfaces outlived their context (a failed compose's
  "Try again." stayed mounted after a SUCCESSFUL unrelated pause,
  and vice versa — probed RED both directions); now every action
  start clears BOTH surfaces — D102. **The seed-placement class** —
  the first-run db:push/db:seed relied on env resolution outside the
  app's tested seam (RED-confirmed in vivo: this sandbox's
  shell-exported absolute DATABASE_URL + parent .env — gotcha 1's
  vectors — redirected the seed's write outside the repo while the
  app opened the 0-byte <repo>/db/custom.db and login answered
  P2021); now `parseEnvValue()`/`selectDatabaseUrl()`/
  `resolveCliDatabaseUrl()` in `src/lib/db-path.ts` + the seed's
  `seed-target:` line + `scripts/prisma-with-db.ts` for
  db:push/migrate/reset (deterministic precedence: process env →
  repo .env → default, anchored, observable) — D103. +13 checks
  (8 unit incl. a REAL hung TCP socket — an inert mock can't observe
  the abort; 1 smoke seed-target pin; 4 e2e in the session24-temporal
  suite — the hang pins ride Playwright's clock API so the 20s
  ceiling costs milliseconds); gate: **486 checks** (164 unit + 118
  smoke + 204 e2e); 20 screenshots refreshed (VLM ×5 — after
  adjudicating the SEVENTH and EIGHTH check-prompt drifts: the hero's
  primary CTA IS "Book a Demo" (Get Started lives in the navbar —
  pinned), and the demo page's footer sits below the 900px fold
  (footerTop 1009, page height 1378)).

- **Session 23 (2026-10-09) remediation** — see
  `docs/remediation-plan-session23.md`: a client-side failure-class
  honesty audit (the CLIENT twin of S22's server race — the
  "optimistic-UI semantics" candidate the Session-42 log suggested)
  found and fixed two defects: **the missing honest-404 dispatch** —
  S22 made the raced PATCH/DELETE answer the honest 404, but the
  client's catch treated it like a network fault: the retry-lie
  banner ("Could not update that workflow. Try again." — every retry
  404s forever) plus the ghost row staying mounted (probed with two
  browser contexts). The fix gives the 404 class its own UI contract
  (the S13 401-sentinel's pattern): PATCH-404 → the row dropped
  locally + a re-sync + the polite role=status announce ("… is no
  longer in the workspace."); DELETE-404 → the idempotent-success
  contract ("… was already removed."); plus the SessionExpired
  early-return in every catch — D99. **The refresh() ordering guard**
  — no in-flight guard: two concurrent actions on different rows
  fired two refresh GETs, and a delayed stale snapshot landing last
  RESURRECTED the deleted row (probed deterministically via
  route-delay); now a useRef sequence counter drops any response
  superseded by a newer refresh — D100. ALSO fixed (survey tooling,
  gotcha-30 family): the capture script's error-boundary mock used
  the glob `**/api/workflows` which does NOT match the [id] routes —
  the mock's own Pause-click escaped to the real server and paused a
  dev-DB row across two sessions (the seed checksum covers
  names/rows, not statuses); the mock now covers [id], and the dev DB
  is canonical with before/after verification. +3 e2e checks (the
  session23-honesty suite — two-context ghost-row pins + the
  delayed-stale resurrection pin; one pin bug caught BY the pins:
  Next's route announcer is itself a role=alert element — filter
  alert-count pins by text); gate: **473 checks** (156 unit + 117
  smoke + 200 e2e); 20 screenshots refreshed (VLM ×5 — after
  adjudicating the SIXTH check-prompt drift: a "missing 3 workflow
  cards" verdict, disproven by the 900px viewport cut).

- **Session 22 (2026-10-09) remediation** — see
  `docs/remediation-plan-session22.md`: a mutation-concurrency audit
  (the RACE class on the UPDATE/DELETE side — S17's register race closed
  CREATE's P2002 window; the `[id]` routes still ran read-check-act;
  plus the S21-suggested performance-budget survey) found and fixed one
  defect + one pin gap: **the `[id]` mutation race** — a DELETE
  committing while a slow under-ceiling PATCH body parsed threw
  UNCLASSIFIED P2025 → the 500 INTERNAL_ERROR envelope (probed 3/3; the
  parallel DELETE double-fire hit 500 in 2/5). The fix carries the
  ownership predicate IN the write: `updateMany`/`deleteMany` with
  `userId` in the WHERE (count 0 → the honest 404; neither ever throws
  P2025 — the race is closed by construction), with the empty-patch
  `{}` body keeping its 200 + row contract (Prisma's
  `updateMany({data:{}})` returns count 0 even for an existing row).
  **The cross-user ownership battery** — the IDOR guard had NO
  wire-level pin anywhere; the smoke suite now registers users B and C
  and pins user A on B's row → 404 ×3 (+ the survived row). The
  performance layer adjudicated CLEAN (landing LCP 732ms / 860 DOM
  nodes; dashboard LCP 120ms / 314 nodes — the S21 ceiling holding; the
  1.9MB hero video is the reference's own parity asset); the SEO
  surface re-verified; PATCH/DELETE limiters adjudicated NON-findings
  (no row growth). Gate: **470 checks** (156 unit + 117 smoke incl. the
  14 concurrency/ownership pins + 197 e2e); 20 screenshots refreshed
  (VLM-verified ×5 — after adjudicating the FIFTH check-prompt drift: a
  FAIL-with-empty-DEVIATIONS on the dashboard shot, disproven by the
  open-description probe + the untouched bytes + the e2e suite).

- **Session 21 (2026-10-09) remediation** — see
  `docs/remediation-plan-session21.md`: a data-volume audit (the first
  systematic survey of the OUTPUT side of the wire — what a response may
  RETURN, what a page query may FETCH, and what the client may RENDER;
  the OUTPUT twin of S20's request-size survey) found and fixed two
  defects: **the unbounded workflows list** (probed on a probe-only DB
  with 400 seeded workflows: `GET /api/workflows` answered a **134.5KB
  body** — `findMany` with no `take`, linear growth, no ceiling — and
  the dashboard mounted **400 article cards (9,649 DOM nodes)**; now
  `MAX_WORKFLOW_LIST = 100` rides SQL `take` in BOTH the GET route and
  the dashboard page query, with the envelope gaining an additive
  top-level `meta` sibling of `data` (`ok()` now accepts
  `{ headers, meta }`): the capped GET ships `meta: { total, stats }`
  — the TRUE total and the honest server-side aggregates via the pure
  `statsFromAggregate()` — because a ceiling without honest aggregates
  would silently turn the four stat cards into subset summaries; the
  client consumes `meta` in `refresh()` with the list-derived memo as
  the FALLBACK (the e2e error-boundary mocks fulfill with bare arrays
  and keep working); the list header reads the TRUE total; a capped
  workspace renders "Showing the 100 most recent of N workflows.";
  re-probed: 100 rows / 33.7KB / `meta.total: 400` / 100 articles
  (2,584 DOM nodes) — D95) and **the unthrottled workflow creation**
  (`POST /api/workflows` was the ONLY unthrottled mutation in the app —
  auth, newsletter, demo, and generate all carry limiters; now
  `workflowRateLimit(userId)`: 30 creates per USER per 15 minutes,
  `WORKFLOW_RATE_LIMIT_MAX` override, the 429 `RATE_LIMITED` envelope
  with the S15 `Retry-After` contract — D96). ALSO: the standing
  battery re-verified — word parity 1.0000 ×8 (reference UNCHANGED),
  the mobile-nav byte-identical (7 rows × 44px, REAL tap; no Tailwind
  v4 bug), D62 holds; adjudicated CLEAN with evidence: the PATCH
  numeric-integrity layer (runs/successRate/timeSavedHours are
  server-controlled, not patchable), the SEO static-asset layer
  (og-image a real 1200×630 PNG; manifest valid; robots/sitemap the
  honest superset semantics), the logging-hygiene layer (the probe
  server's log after the full survey traffic: boot banner only, zero
  PII), the hero-video layer (1.9MB, muted + playsInline), and the
  dependency currency (the documented F10 chain only; majors-only).
  Gate: **456 checks** (156 unit incl. the 11 meta/ceiling/limiter
  pins + 197 e2e unchanged + 103 smoke incl. the 9 data-volume/creation
  pins); 20 screenshots refreshed (VLM-verified ×5 — after adjudicating
  the FOURTH check-prompt drift: the login chip's actual LIGHT
  slate-100→200 gradient read against a prompt that said "gradient
  slate").

- **Session 20 (2026-10-09) remediation** — see
  `docs/remediation-plan-session20.md`: a method-and-payload audit (the
  first systematic survey of the METHOD-MISMATCH layer — the
  framework-owned answer for unexported methods sits BELOW every
  handler, the one layer `apiRoute` never sees — and the REQUEST-SIZE
  layer — whether anything caps a POST body before the parse) found
  and fixed two defects: **the method-mismatch bare-405 violation**
  (probed: 11 method-mismatch requests — GET on the six POST-only
  routes, POST on the two GET-only routes, PUT/PATCH/DELETE on
  workflows, HEAD on a POST-only route — all answered a BARE 405 with
  an EMPTY body, no content-type, no `Allow`, no cache-control; now
  `methodGuard(allow)` + `optionsGuard(allow)` in `src/lib/api.ts`:
  every route file exports a guard for each unimplemented method — the
  405 METHOD_NOT_ALLOWED envelope + the RFC 9110 `Allow` header +
  no-store via the fail() seam; the explicit OPTIONS export keeps the
  204 preflight honest (Next's auto-answer enumerates exports and would
  over-report) — D93) and **the unbounded request-size parse** (a 50MB
  login body was fully buffered and JSON-parsed in 314ms — no ceiling
  in code or docs; now `bodyTooLarge(request)` + MAX_JSON_BODY_BYTES
  (128KB) placed immediately BEFORE `request.json()` in each of the 7
  body-parsing handlers — a declared over-ceiling body answers 413
  PAYLOAD_TOO_LARGE (re-probed: 91ms, nothing buffered); chunked
  bodies are the proxy's residual (DEPLOYMENT.md §2) — D94). ALSO: the
  standing battery re-verified — word parity 1.0000 ×8 (BOTH sides
  rendered in Chromium — a raw-fetch probe reads the live's
  un-hydrated SPA shell), the mobile-nav byte-identical (7 rows — 6
  anchors + the Log In button — 44px each; no Tailwind v4 bug), D62
  holds (the SPA-404 adjudicated on the RENDERED content); adjudicated
  CLEAN: the unknown-API-route layer (the branded 404 page), the
  OPTIONS auto-answer, the cookie attributes (httpOnly/Lax/secure),
  scrypt params, the register-409 by-design trade-off, dependency
  currency (audit unchanged; outdated majors-only). Gate: **436
  checks** (145 unit incl. the 8 api-guards pins + 197 e2e unchanged +
  94 smoke incl. the 15 method/payload pins); 20 screenshots refreshed
  (VLM-verified ×5 — after adjudicating three check-prompt drifts:
  the hero fold, the login card's actual S-logo + "Welcome to SAAS
  Company" contract, and its Google→or→email order).

- **Session 19 (2026-10-08) remediation** — see
  `docs/remediation-plan-session19.md`: a crash-path-honesty audit (the
  first systematic survey of what the wire carries when a route's
  dependencies CRASH, not merely when input is wrong — plus the
  server-component half of the S13 branded-boundary goal) found and
  fixed two defects: **the crash-path envelope violation** (probed
  with an unwritable DATABASE_URL: SEVEN endpoints answered a BARE 500
  with an EMPTY body and NO content-type — login, register,
  newsletter, demo, me-with-session, workflows GET/POST — violating
  the invariant "no route returns bare JSON" on exactly the worst-day
  paths; now `apiRoute()` in `src/lib/api.ts` wraps every exported
  handler in all 10 route files: what escapes becomes the
  INTERNAL_ERROR envelope AND the stack is RESTORED to fd 2 — Next
  only logs UNhandled route errors, so catching without re-logging
  would REMOVE the operator's stack; classification inside handlers
  untouched — D91) and **the unbranded server-crash page** (the
  dashboard page's own DB failure answered Next's `__next_error__`
  document; now two NARROW try/catch blocks — deliberately narrow:
  `redirect()` throws a control error a wide catch would swallow,
  breaking the S14 authenticated gate — render the branded
  `dashboard-unavailable.tsx` degraded view, status 200 by design
  (the S18 health-probe pattern; `/api/health`'s `db` field owns the
  alerting) — D92). ALSO: the dependency-currency layer adjudicated
  CLEAN (npm audit: the documented F10 chain only; npm outdated:
  majors only); the standing battery re-verified (word parity 1.0000
  ×8, mobile-nav byte-identical, D62); two survey-tooling lessons:
  the zombie-port trap recurred AND a survey script that DEFAULTS its
  probe port evaluated the zombie while its runner booted a healthy
  server elsewhere (pass base URLs EXPLICITLY — gotcha 33). Gate:
  **413 checks** (137 unit incl. the 5 apiRoute pins + 197 e2e
  unchanged + 79 smoke incl. the 13 broken-DB pins on the third
  mini-server :3230); 20 screenshots refreshed (VLM-verified ×5).

- **Session 18 (2026-10-08) remediation** — see
  `docs/remediation-plan-session18.md`: a deployment-honesty audit (the
  first survey of what the DEPLOYMENT's own signals can see: the health
  probe, the boot warning, the Docker first-run, and the rate limiter's
  IP trust model) found and fixed four defects: **the DB-blind health
  probe** (a server with an unwritable DATABASE_URL answered
  `/api/health` 200 ok while login returned a bare 500 — the Docker
  HEALTHCHECK inherited the blindness; now the envelope carries
  `db: "up"/"down"` from a SELECT 1 raced against 1.5s, the status
  deliberately stays 200 — D87), **the silent AUTH_SECRET fallback**
  (production boots without the var signed sessions with the PUBLIC
  repo constant with zero runtime signal; now `src/instrumentation.ts`
  writes the FORGEABLE warning DIRECTLY to fd 2 — the Next-16 runtime
  captures BOTH console.* AND process.stderr.write from bundled code,
  and a dynamic import("node:fs") races the turbopack chunk loader at
  boot; only the static import + fs.writeSync(2, …) reliably lands —
  D88), **the broken Docker first-run** (the S17 runbook's one-off init
  could not work — the runner ships neither the prisma CLI nor the
  schema; now the build stage pushes the schema into /app/db/custom.db
  and the runner COPYs it — a fresh NAMED volume seeds itself with zero
  init commands; bind mounts document the checkout path; the
  first-account-before-closing-registration note — D89), and **the
  half-documented IP trust model** (clientIpOf trusts the first
  X-Forwarded-For hop verbatim — direct exposure mints a fresh auth
  bucket per header-rotated request; DEPLOYMENT.md §2 + README now
  state the proxy requirement — D90). ALSO: `next build` COPIES the
  repo `.env` into `.next/standalone/` (a standalone-directory deploy
  ships the build-time env incl. AUTH_SECRET); one zombie-server
  recurrence caught by the parity battery itself (the fresh-port
  discipline — the kill+wait pattern is unreliable in this sandbox).
  Gate: **395 checks** (132 unit incl. the 6 instrumentation pins +
  197 e2e unchanged + 66 smoke incl. the health-db pin); 20
  screenshots refreshed (VLM-verified ×5).

- **Session 17 (2026-10-08) remediation** — see
  `docs/remediation-plan-session17.md`: an account-enumeration-timing +
  registration-concurrency + registration-access-control +
  deployment-artifact audit (four layers no prior session surveyed:
  the TIMING side of an identical envelope — a 401 that always says
  "Invalid email or password" can still leak WHICH emails exist through
  latency (CWE-208); the RACE class on the write paths — the
  findUnique→create TOCTOU window; the PAD §10 open-registration
  MEDIUM, the ledger's oldest open item; and the §10 no-Dockerfile
  LOW) found and fixed four defects: **the login timing side-channel**
  (the unknown-email path skipped scrypt — 3.5ms vs 34.1ms medians, a
  9.8x delta behind a byte-identical 401; now `dummyPasswordHash()` in
  `src/lib/auth.ts`: a module-init salt:hash decoy burned
  unconditionally so the timing profile is flat — post-fix probe ratio
  1.0x, pinned by the suite's first timing pin, 7+7 curl medians under
  2.5x — D83); **the register TOCTOU race** (10 truly-parallel
  independent-socket POSTs → {"201":1,"409":8,"500":1} — the loser's
  unhandled P2002 was a BARE 500 with an EMPTY body and no
  content-type; now `isUniqueConstraintError()` in `src/lib/db-errors.ts`
  + the create catch → the exact sequential-duplicate 409 EMAIL_TAKEN,
  every other error rethrows — D84; survey fact: undici's fetch pool
  serializes on one socket, true wire-level concurrency needs
  independent sockets); **the open registration** (the PAD §10 MEDIUM
  since the ledger began; now `registrationOpen()` + the register-route
  gate: only the exact `ALLOW_REGISTRATION="false"` closes with 403
  REGISTRATION_CLOSED — default OPEN preserves every existing contract;
  login stays open on a closed deployment; the login card surfaces the
  message verbatim with zero client changes — D85); and **the missing
  Dockerfile** (the §10 LOW; now the multi-stage standalone-artifact
  `Dockerfile` + `.dockerignore` + DEPLOYMENT.md §8 — honestly labeled
  NOT build-tested in the authoring environment, no Docker daemon —
  D86). ALSO: word parity 1.0000 on all 8 routes (reference UNCHANGED),
  the mobile nav byte-identical with real-touch contexts (no Tailwind
  v4 bug; the live's burger remains pointer-blocked, D32); the
  Subscriber upsert + DemoRequest model adjudicated CLEAN (no other
  P2002 exposure); ONE zombie-server twist — a syntax-error crash
  mid-script orphaned the smoke script's closed-gate server (the
  abort happens AFTER the boot lines but BEFORE the kill; the orphan
  later answered a fresh boot's health check on the same port — the
  closed-gate server moved to :3220). Gate: **388 checks** (126 unit
  incl. the dummy-hash + registration-gate + db-errors pins + 197 e2e
  unchanged + 65 smoke incl. the timing-parity, race-envelope, and
  closed-gate pins); 20 screenshots refreshed (VLM-verified).

- **Session 16 (2026-10-08) remediation** — see
  `docs/remediation-plan-session16.md`: an authenticated-endpoint-abuse +
  response-cache-directive + framework-banner audit (three layers no
  prior session surveyed: COST CONTROL on the LLM route — auth,
  newsletter, and demo were all rate-limited while the most expensive
  endpoint per call was the only unlimited one; the caching directives
  of the API envelope — Next.js protects its dynamic PAGES with
  no-store but NOT route-handler JSON; and the fingerprinting layer of
  the response banner) found and fixed three defects: **the unlimited
  LLM composer** (the probe drove 15/15 rapid authenticated POSTs to
  `/api/workflows/generate` — all 200 in 8.1s, no 429 ever engaged;
  now `generateRateLimit` in `src/lib/rate-limit.ts` — **per-USER**
  buckets (the route is authenticated — the honest unit), 10/15min
  default, `GENERATE_RATE_LIMIT_MAX` override, 429 + `Retry-After`
  (the S15 contract); the CLIENT contract unchanged BY DESIGN:
  compose()'s `genRes.ok` check degrades a 429 into the client-side
  template draft, so the feature never hard-fails — the limiter only
  caps the LLM spend — pinned by the new e2e route-fulfilled-429
  degrade row + the deterministic smoke trip at
  `GENERATE_RATE_LIMIT_MAX=2` — D80); **the missing cache directive**
  (`Cache-Control: private, no-store` now emitted at the single
  `ok()`/`fail()` seam — authenticated JSON previously carried NO
  caching directive while RFC 9111 permits heuristic storage of
  unmarked 200s; the 429 sites' Retry-After survives the merge — D81);
  and **the X-Powered-By banner** (`poweredByHeader: false` — the live
  ships none: `server: cloudflare`; fingerprinting the framework on
  every page response was pure downside — D82). ALSO adjudicated CLEAN
  with evidence: hostile-content rendering (a `<script>`-named workflow
  + max-length fields: zero dialogs, escaped-as-text, truncate +
  line-clamp + zero horizontal overflow), the fresh-user empty state,
  the post-logout back-button (server 307 → login, no stale bfcache
  leak), IDOR scoping, email normalization, password bounds, seed
  idempotency, UI busy guards. ONE workspace-hygiene discovery: the
  DEV `db/custom.db` had drifted to all-paused across S12–S15's probe
  traffic — re-seeded (the e2e/smoke suites are immune: fresh DBs per
  run). TWO survey-tooling traps: Playwright's `page.request` refuses
  to SEND `Secure` cookies over plain http (Chromium navigations treat
  127.0.0.1 as trustworthy and DO — probe authenticated APIs through
  in-page fetches), and after an API-register, navigate DIRECTLY (a
  /login visit hits the S14 authenticated gate). Gate: **371 checks**
  (114 unit incl. the generateRateLimit pins + 197 e2e incl. the
  composer 429-degrade row + 60 smoke incl. the generate-limiter trip,
  Retry-After, no-store ×3, and banner-absence ×2); 20 screenshots
  refreshed (VLM-verified); word parity 1.0000 on all 8 routes
  (reference UNCHANGED), mobile nav byte-identical (no Tailwind v4
  bug; live's burger D32-blocked), axe /dashboard + /demo zero,
  console zero-noise on every touched route.

- **Session 15 (2026-10-08) remediation** — see
  `docs/remediation-plan-session15.md`: a REDIRECT-TARGET +
  superset-a11y + external-dependency-hang + rate-limit-response
  audit (four layers no prior session surveyed: WHERE a user-controlled
  redirect parameter can ship the browser — the `from_url` open-redirect
  class (CWE-601); the axe floor of the SUPERSET-only routes (D63's
  live-parity adjudication covers live-mirrored routes only); the HANG
  class for external deps — degrade-not-fail covers failures, not
  hangs; and the 429 response headers the README promised but no route
  emitted) found and fixed four defects: **the open redirect**
  (`/login?from_url=https://evil.example/phish` shipped the
  just-authenticated browser off-site — confirmed in the pre-fix
  network log; now `safeRedirectPath` in `src/lib/validation.ts`:
  prefix checks + a WHATWG dummy-origin re-parse, only same-site
  absolute paths survive, everything else falls back to /dashboard —
  D76, 12 unit cases + 3 auth pins incl. the legit /faq round-trip);
  **the /demo heading-order violation** (the h1-only superset page put
  the byte-pinned footer's first h3 after an h1 with no intervening h2;
  now an sr-only h2 opens the form card — axe re-run: ZERO violations,
  matching the dashboard — D77); **the SDK hang** (/api/workflows/generate
  awaited the LLM SDK with no timeout; now the `withTimeout` seam in
  `src/lib/workflow.ts` resolves with the deterministic template after
  SDK_TIMEOUT_MS (10s) — a hang is a DEGRADE condition, a rejection
  still propagates — D78, fake-timer unit pins); and **the missing
  `Retry-After` header** (`fail()` now accepts response headers; all
  four rate-limited sites emit `Retry-After: <sec>` on 429 — D79,
  deterministic smoke trip of the newsletter bucket). ALSO: word
  parity 1.0000 on all 8 routes (reference UNCHANGED), the mobile nav
  byte-identical (no Tailwind v4 bug; live's burger D32-blocked), the
  Session-11 probe's `navigateCloses: false` adjudicated a selector-typo
  artifact (the corrected probe GREEN); one zombie-server recurrence
  caught mid-survey — the chunk-against-disk check was BLIND (only JS
  changed, so the CSS chunk name was unchanged) and ps//proc are
  process-blind in this sandbox, so the survey moved to a FRESH PORT.
  Gate: **357 checks** (111 unit + 196 e2e incl. the redirect-target
  pins, the outline pin, and the reduced-motion /demo row + 50 smoke
  incl. the Retry-After pins); 20 screenshots refreshed (VLM-verified).

- **Session 14 (2026-10-08) remediation** — see
  `docs/remediation-plan-session14.md`: a FEATURE-REACHABILITY +
  authenticated-navigation + status-message + reduced-motion-contract
  audit (four layers no prior session surveyed: is every shipped
  superset feature REACHABLE from a URL — grep every API route for a UI
  consumer; what `/login` does for an ALREADY-authenticated visitor;
  whether successful dashboard mutations announce themselves (WCAG
  4.1.3); and the reduced-motion contract, verified clean but unpinned)
  found and fixed three defects: **the dead `/api/demo` endpoint**
  (validation + rate limit + the DemoRequest model shipped complete with
  ZERO UI consumers — dead code dressed as a superset; now `/demo`, a
  dark-brand Book-a-Demo page mirroring the API's own validation with the
  composer's catch contract + a polite role=status confirmation + a
  sitemap entry — the live 404s /demo so it's pure superset; pinned by
  `tests/e2e/demo.spec.ts`); **the authenticated `/login` card** (a
  signed-in visitor got the login form — every production auth system
  sends them to the workspace; `login/page.tsx` is now a thin async
  server gate `sessionUserId()` → `redirect("/dashboard")` over the
  byte-pinned card split unchanged into `login-card.tsx`; pinned in
  `tests/e2e/auth.spec.ts`); and **the dashboard's silent successes**
  (zero aria-live regions — a screen-reader user's pause/resume/delete/
  compose changed the stats in silence; now a sr-only polite
  `role="status"` region announces every successful mutation, pinned in
  the dashboard suite). ALSO: the reduced-motion contract pinned for the
  first time (`tests/e2e/reduced-motion.spec.ts` — content visible
  without scrolling + the loop clamp, whose computed value serializes as
  "1e-05s"); the standing battery re-verified — word parity 1.0000 on
  all 8 routes (reference UNCHANGED), the mobile nav byte-identical
  (no Tailwind v4 bug; live's burger D32-blocked); one ZOMBIE-SERVER
  recurrence killed by PID (the post-rebuild boot silently lost
  EADDRINUSE — gotcha 26); the 404-route console log adjudicated
  live-parity (the live's own 404 ships two 401s, D68). Gate: **333
  checks** (94 unit + 191 e2e incl. the demo + reduced-motion suites +
  48 smoke incl. the /demo page pin); 20 screenshots (18 refreshed +
  the boundary recapture + the new demo-page shot, VLM-verified).

- **Session 13 (2026-10-08) remediation** — see
  `docs/remediation-plan-session13.md`: a SESSION-LIFECYCLE + render-fault
  + focus-management audit (three layers no prior session surveyed: what
  the signed-in dashboard does when the cookie EXPIRES mid-tab; what
  renders on a client-side render fault; where focus lands when the
  mobile menu Escape-closes) found and fixed three defects: **the
  session-expiry lying banner** (cookie-expired Pause/Delete/Compose each
  said "Try again." — but every retry 401s forever; all dashboard fetches
  now route through `apiFetch`, which redirects a 401 to
  `/login?from_url=/dashboard` — the SAME contract as the server-side
  gate; a network ABORT keeps the Session-12 banner contract — the two
  failure classes stay distinct, pinned pairwise by
  `tests/e2e/session-lifecycle.spec.ts`); **the missing error
  boundaries** (any render fault surfaced Next.js's default unbranded
  "This page couldn't load" page — reachable via a contract-violating API
  row (`runs: null` passes the `Array.isArray` guard and crashes the
  article template); now a branded dark recovery card
  (`src/app/error.tsx` + `global-error.tsx`): role="alert" + Try again
  (`reset()` restores the server-provided state) + Go-to-home, plus a
  `refresh()` shape-guard; pinned by `tests/e2e/error-boundary.spec.ts`
  with a route-fulfilled contract violation); and **the mobile menu's
  Escape focus loss** (the focused link unmounted and `activeElement`
  fell to `body` — WCAG 2.4.3; Escape now returns focus to the burger via
  `burgerRef`, pinned in the mobile-navigation suite). ALSO: the standing
  battery re-verified — word parity 1.0000 on all 8 routes (reference
  UNCHANGED), the mobile nav byte-identical with real-touch contexts (no
  Tailwind v4 bug; the live's burger remains pointer-blocked, D32), every
  route's console zero-noise, and one ZOMBIE-SERVER recurrence killed by
  port mid-survey (gotcha 26's CSS-chunk-against-disk discipline). Gate:
  **321 checks** (94 unit + 180 e2e incl. the session-lifecycle +
  error-boundary suites + 47 smoke); 19 screenshots (18 standard + the
  branded-boundary evidence shot, VLM-verified).

- **Session 12 (2026-10-08) remediation** — see
  `docs/remediation-plan-session12.md`: a CONSOLE-NOISE-v2 sweep (the
  first to capture `unhandledrejection` + `console.error/warn` alongside
  pageerror, on every route AND during interactions), the first
  network-level FAULT-INJECTION of the dashboard's mutation handlers, and
  the first preload-emission survey found and fixed three defects: **the
  flaky FAQ motion-parity pin** (its pre-reveal phase sampled a transient
  pre-hydration state right after `goto` — the first FAQ item is in the
  initial viewport, so the rAF reveal could settle before the evaluate
  landed under load (2/10 isolated + a full-suite failure); the
  pre-reveal contract now pins through the STATIC HTML and the settled
  check polls); **the Gasparyan preload injection** (React Float
  auto-preloads eager SSR-shell imgs, and the router's RSC prefetch
  injects the head link into every navbar-bearing route — a console
  warning + a wasted fetch on six routes; `loading="lazy"` suppresses
  the emission, visible parity unchanged, the live's img stays eager);
  and **the dashboard's uncaught fetch rejections** (pause/delete/sign-out
  had NO catch — route-aborted faults surfaced `TypeError: Failed to
  fetch` pageerrors with zero feedback, and Sign out never navigated;
  every handler now upholds the composer's catch contract with a
  full-width `role="alert"` banner). ALSO: the live's own console ships
  two 401 errors the clone doesn't have (the console tier of the D55
  family — D68); one mid-verification word-parity "regression" was
  disproven as a ZOMBIE-SERVER artifact (stale :3000 process serving a
  build whose CSS chunks were deleted — unstyled page, concatenated
  innerText; the discipline: compare the served HTML's CSS chunk name
  against disk); the mobile nav re-verified byte-identical (no Tailwind
  v4 bug; the live's burger remains pointer-blocked, D32). Gate:
  **314 checks** (94 unit + 173 e2e incl. the resource-hygiene +
  resilience suites + 47 smoke incl. the lazy-img contract pin); every
  route's console: zero noise; word parity 1.0000 on all 8 routes.

- **Session 11 (2026-10-08) remediation** — see
  `docs/remediation-plan-session11.md`: the first HYDRATION-HEALTH survey
  (a console/pageerror sweep of every route) plus the first cross-route
  axe sweep (clone AND live, adjudicated) and an API edge-case probe
  found and fixed four defects: **the 404 hydration error** (every unknown
  route tripped React #418 — the statically-prerendered client component
  rendered `usePathname()` while the prerendered HTML shipped the internal
  route id; AND `usePathname()` settles to `/_not-found` post-router —
  fixed with a `useSyncExternalStore` mount gate reading
  `window.location.pathname`, pinned by the new hydration suite);
  **the paused-card contrast compounding** (the dashboard's `opacity-80`
  articles turned `text-white/50` into EFFECTIVE white/40 — 3.61:1,
  glyph-pixel-verified; a controlled experiment proved oklab/color-mix
  composites identically to rgba, isolating the ancestor opacity as the
  cause; fixed white/60); **the PATCH/POST name-contract split** (POST
  rejected >120 chars, PATCH silently truncated — now both reject via
  `requiredString`); and **the gate's own flaky ring pin** (fixed-200ms
  mid-transition samples + blind-Tab×4 landing on inputs when hydration
  shifted the tab order — now tab-until-focused + poll-to-settled,
  10/10 + 8/8 consecutive greens). ALSO: `AUTH_RATE_LIMIT_MAX` (default
  10) de-fragilized the e2e suite (its UI sign-ins sat at exactly the
  default budget — one extra spec tripped a mid-suite 429); the
  clone-only axe violations on `/`, `/faq`, and the 404 were adjudicated
  LIVE-PARITY (ledgered D63 — the live ships them too; parity law);
  the mobile nav re-verified byte-identical (the live's burger remains
  pointer-blocked, D32). Gate: **307 checks** (94 + 167 e2e incl. the
  hydration suite + 46 smoke); axe /dashboard ZERO violations; word
  parity 1.0000 on all 8 routes.

- **Session 10 (2026-10-08) remediation** — see
  `docs/remediation-plan-session10.md`: the first LOOPING-MOTION survey (a
  full-page census sampling every element's computed transform/opacity
  across multiple rounds AFTER entrances settle — still-changing = loop —
  plus animate/transition config extraction from the live's JS bundle)
  found the clone missing EIGHT of the live's twelve loops: the hero
  mockup's ambient glow (scale+opacity, 4s), red chrome dot (scale, 2s),
  four side-list dots (staggered scale pulses), the under-glow (y+opacity,
  3s — ALSO restructured: a SIBLING of the card, unclipped, rendered
  un-centered because the live's framer transform kills its
  `-translate-x-1/2`; pinned via `translate-none`), and the One-Platform
  mini-dashboard's four skeleton opacity pairs (3s, staggered delays) —
  all reproduced as seven measured `@theme --animate-*` keyframe tokens
  (framer's inline writes are invisible to the CSS-property census that
  produced Session 4's "static mockup" verdict). ALSO: the dashboard's
  first axe audit (the superset surface) fixed `text-white/40` contrast
  (→ white/60) and added its `<h1>`; `public/` assets now ship the live's
  CDN caching (`max-age=604800`); the live's post-login surface was
  settled definitively (NO authenticated experience — every authed route
  404s; the repo's /dashboard stays the D1 superset). Gate: 299 checks
  (92 + 164 e2e incl. the mockup-motion-parity suite + 43 smoke); loop
  census 12 = 12; VLM mockup + One-Platform IDENTICAL; word parity 1.0000
  on all 8 routes.

- **Session 9 (2026-10-07) remediation** — see
  `docs/remediation-plan-session9.md`: the first RENDERED-PALETTE survey
  (every default-palette color this app uses, converted to sRGB and compared
  with the live's v3-era hex) plus the interactive-state matrix, the
  browser-chrome layer (::selection/scrollbars/cursors/overscroll), the
  form/media attribute inventory, the ARIA snapshot tree, the `:root` var
  inventory, the mobile-nav paired re-verification, and the HTTP header
  inventory. Found and fixed six gap groups: **the v4 OKLCH PALETTE
  ROUNDTRIP** (31 tokens pinned to v3 hex — up to 69 RGB units off: the
  stars, the problem reds, the features grays/greens, the avatar gradient
  endpoints, every login slate); **the Sign in's keyboard ring** (Session
  8's `--ring` variable alone left v4's `ring-ring` utility un-emitted —
  the ring rendered currentColor WHITE; now `--color-ring` in `@theme` +
  an `input:focus:focus-visible` cascade nudge keeps the inputs' slate-400
  where the live's order puts it); **the invented violet ::selection
  removed** (the live ships none); **the login overscroll pin**
  (`html { overscroll-behavior-y: none }` route-scoped); **the login's
  light `--color-border`** (inert, computed parity); and **four security
  headers** via `next.config.ts` (the live's exact set). Gate: 284 checks
  (92 + 150 e2e incl. the palette-parity suite + 42 smoke); VLM
  problem/testimonials/login IDENTICAL; word parity 1.0000 on all 8
  routes.

- **Session 8 (2026-10-07) remediation** — see
  `docs/remediation-plan-session8.md`: the first MOTION-LAYER survey
  (computed transition/animation values of every animated element, live vs
  clone, plus MutationObserver entrance traces and live-bundle config
  extraction) found the clone's entire entrance system broken three ways
  and rebuilt it **rAF-driven** (`src/lib/motion.ts` — framer-motion
  parity: easeOut cubic-bezier(0,0,0.58,1), per-element y/duration/stagger,
  settled `opacity: 1; transform: none;`) — adding the missing entrances
  (testimonial cards, mockup, hero trio, legal pages, /faq items) and
  removing the invented ones (logo-cloud container, One-Platform chips,
  whole-CTA). Three v4 engine shifts pinned: **shadow-sm** (v4 renamed the
  scale — `--shadow-sm` restores v3's value), **transition-colors** (v4
  carries 9 properties vs v3's 6 — a utilities-layer override), and the
  **line-height cascade inversion** (v3's responsive text utilities beat
  leading-*; three elements pinned with `--tw-leading: initial`). The
  login focus chrome matched (`--ring: 240 10% 3.9%`, focus-visible:ring-ring,
  the violet outline rule neutralized route-scoped, the Google-icon wrapper
  DIV); the FAQ chevron's muted-foreground matched; the float keyframes
  corrected (−15px/4s); the navbar logo's light swap re-mechanized as the
  live's React-driven PATH FILL (the anchor stays bare — the Session-4
  spec pin corrected to read the rendered fill); per-plan CTA disabled:*
  utilities matched. Gate: 266 checks; VLM hero/CTA IDENTICAL; word parity
  1.0000 on all 8 routes.

- **Session 7 (2026-10-07) remediation** — see
  `docs/remediation-plan-session7.md`: the first TYPOGRAPHY-LAYER survey
  (computed letter-spacing + first-resolved font-family of every text
  element, live vs clone) plus a full asset/network inventory, a 22-step
  keyboard Tab walk, an axe-core run, edge viewports (1920/320), and the
  mobile menu's resize-while-open behavior. Found and fixed eight gaps:
  **the reference's SPA bundle doubles the tracking scale** (`tracking-wider`
  0.1em / `tracking-widest` 0.2em — every eyebrow had rendered at half the
  live's tracking for six sessions; fixed via `@theme` overrides, with the
  login route pinning the standard scale back since the live's login
  bundle keeps it); the **Thrune wordmark** now renders DM Serif Display
  (the live's three wordmarks carry INLINE font-family styles — the clone
  had rendered all three Playfair-first); the Testimonials H2's
  tracking-tight; the Gasparyan `alt="Logo"`; the star rows' aria made
  valid (`role="img"`); **the mobile menu's resize-while-open scroll-lock
  bug** (a matchMedia listener closes the menu on md entry); and a working
  self-hosted apple-touch-icon (the live's URL is dead). Byte-verified:
  the hero video (md5-identical) and Gasparyan SVG; the live's favicon URL
  is DEAD (our working one is the superset); the D32 burger block still
  confirmed. Gate: 227 checks; VLM hero 100 / pricing 99; word parity
  1.0000 on all 8 routes.

- **Session 6 (2026-10-07) remediation** — see
  `docs/remediation-plan-session6.md`: the first CLASS-STRING-LAYER audit
  (a full-DOM skeleton diff — tag + class + key attrs — live vs clone)
  plus a per-route `<head>` map and real-pointer hover probes found and
  fixed seven clone-side gaps: the testimonial avatars now cycle the
  live's FOUR per-person gradients (the pre-fix clone rendered all as
  violet→purple-600); the Enterprise "Custom" price renders as the
  live's plain 30px DIV (was a 48px text-5xl span); the testimonial
  edge-fade directions un-swapped (black AT the edges); the AI-suggestion
  paragraph matches the live's rendered FULL white (its own class is a
  broken inert token); the per-route head pattern implemented through
  `src/lib/seo.ts` (og:title/`"X on SAAS Company. …"`/og:url/canonical)
  with a WORKING self-hosted `/og-image.png` (the live's 404s) and a
  self-hosted `manifest.json`; the `<body>` stripped to the live's bare
  element (no classes, `-webkit-font-smoothing: auto`); three invented
  class extras removed. ALSO DOCUMENTED: the live's own mobile burger is
  pointer-blocked by its empty toast portal — the clone keeps the working
  burger (D32). Gate: 215 checks; VLM 99/99/98.

- **Session 5 (2026-10-07) remediation** — see
  `docs/remediation-plan-session5.md`: the UI typeface corrected to
  GOOGLE's actual "Vend Sans" variable font (the Session-1 files were Wix
  Madefor — ~2.4% wider glyphs; traced via performance entries + fontTools;
  the swap closed the pricing-pill deltas AND the D19 Pro-card +27px);
  the login card's alternate states (sign-up / forgot / reset-success /
  error) rebuilt to the measured layouts (back-button + h2 + form, no
  logo/Google/divider, shadcn alert banners between field and submit,
  "Invalid email or password" / "Passwords do not match" / the green
  check-your-email view; the register API's name is now optional — the
  reference's sign-up has no name field); the keyboard focus ring matched
  (the reference's universal `outline-color: violet/50` on the UA default
  ring, replacing this repo's invented `:focus-visible` rule); the Pro
  card's inert scale utilities removed (the reference's markup carries
  them but its css never emits them — rendered truth wins); the
  testimonials strip made full-bleed. Gate: 192 checks; VLM
  97/100/100/100/98.

- **Session 4 (2026-10-07) remediation** — see
  `docs/remediation-plan-session4.md`: the login route now swaps the body
  theme like the reference's own login css bundle (white bg, zinc-950 text,
  system font — typed input text is dark and visible again, and the
  reference's v3-style space-y gap is restored inside the form); the pricing
  model corrected to the reference's truth (toggle defaults to ANNUAL; Pro
  $49/mo monthly, $39/mo annual; the caption is plain "/month" in both
  states); the navbar rebuilt as section-aware (always transparent,
  scroll-spy pills, light-mode swap over the white features section — the
  scrolled-glass bar was an invention); the dashboard mockup made static
  like the reference (solid purple dots — the unlayered `.skeleton-wave`
  had overridden `bg-primary/80`); the FAQ accordion animates with the
  reference's Radix keyframes and unmounts closed panels (word parity
  1.0000 on every page now); `apple-mobile-web-app-status-bar-style: black`.
  Gate: 179 checks.

- **Session 3 (2026-10-07) remediation** — see
  `docs/remediation-plan-session3.md`: the brand tokens restored to the
  reference's `:root` values (primary #8624ff, accent/electric-blue #0055ff
  — Session 1 had read the unused `.dark` block), the body font switched to
  the Display cut like the live, straight quotes on testimonial/AI-suggestion
  copy, the reference's `X | SAAS Company` page titles, the 404 card quoting
  the missing pathname, Lenis 1.3 smooth scrolling, the login-only noscript,
  and the apple-mobile-web-app-title meta. Gate: 165 checks.

- **Session 2 (2026-10-07) remediation** — see
  `docs/remediation-plan-session2.md`: accessibility-page content restored
  (two reference lists + the no-caption rule), the login page's back-link
  removed (bare-card parity), the hero indicator's motion matched
  (`animate-scroll-dot`), the features card rebuilt per tab from the live DOM
  (incl. per-tab check icons), and the dependency chain hardened
  (vitest 5.0.3; overrides for the unpatched-upstream advisories).

- **The live reference changes over time** (it was previously a PM-workspace
  app; the current deployment is the NovaAI marketing site). Parity claims
  in the PAD reference the 2026-10 survey. If the live app is redeployed
  again, re-run the paired survey before touching chrome.
- **"Continue with Google" renders for parity but degrades to a notice** —
  no OAuth credentials in a self-hosted clone (documented deviation).
- **Google Fonts (Playfair Display / DM Serif Display)** are pulled via
  `next/font/google` for the client-logo wordmarks; the UI font is the
  self-hosted Vend Sans. If building fully offline, expect the next/font
  step to need network access.
