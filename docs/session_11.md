# Session 11 Log — Motion-Layer & Engine-Shift Parity (the Session-8 Remediation, 2026-10-07)

Continuing from Session 9 (main @ 8a9e043 — the verified Session-7 push
`4b7b480`; the operator's session_10.md transcript note landed on top as
`04c69ed`). The mandate: refresh, review the session-9/10 +
remediation-plan-7 docs, re-audit against the live, remediate TDD-first,
re-verify, document, push.

## Phase 1 — Workspace & baseline

- `git pull` brought in `docs/session_10.md` (8a9e043 → 04c69ed); tree
  clean. Root docs + session docs reviewed; codebase validated: `.env`
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root ✓,
  `.env.example` tracked and in sync ✓, all four configs exclude
  `skills/` ✓. The shell's exported absolute `DATABASE_URL` neutralized
  for every command (the AGENTS.md trap was live in this shell).
- Baseline gate: ALL GREEN — lint ✓ typecheck ✓ Vitest 80/80 ✓ build ✓
  smoke 38/38 ✓ Playwright 109/109 ✓ (227 checks). The codebase matched
  the documented Session-7 state exactly.
- Survey tooling: the session-9 wrapper pattern (boot → probe → kill in
  one command, pinning its own `DATABASE_URL`) reused under `scripts/s10`
  in the workspace (outside the checkout).

## Phase 2 — The audit

**Drift check** (8 routes, scroll-passed innerText): the reference is
UNCHANGED — similarity 1.0000 on every route. Every finding below is
clone-side (or a live-side behavior worth documenting).

**NEW survey surface #1 — the MOTION layer** (computed
`transition-*`/`animation-*` of every animated or transitioning element,
live vs clone, matched by class-string + text):

1. **F1 — the entrance system, broken three ways.** The live drives its
   scroll entrances with framer-motion: a rAF loop writing inline
   `opacity`/`transform` per frame (MutationObserver traces show
   `style="opacity: 0; transform: translateY(17.7654px)"` at ~17 ms
   intervals), easing `easeOut` = cubic-bezier(0, 0, 0.58, 1) (extracted
   from the bundle as `cP=na(0,0,.58,1)`; ten sampled entrance frames fit
   with MAE 0.014), per-element y/duration/stagger, viewport `once: true`,
   settled inline exactly `opacity: 1; transform: none;`. The clone's
   `Reveal` appended `transition-all duration-700 ease-out
   will-change-transform` classes ON the child: **(a)** on children
   carrying their own `transition-colors` (the problem cards) the
   Reveal's `transition-all` LOSES the property-list cascade — opacity
   and transform are not in the winning list and the entrance SNAPS
   (sampled 0,0,0 → 1 with no intermediate frames); **(b)** the same
   cascade leaves `duration-700`/`ease-out`/stagger-delay ACTIVE FOREVER
   — hover transitions rendered at 0.7 s + 0.12–0.24 s delay where the
   live renders its own clean 0.15 s / 0.3 s, with `will-change` and an
   inline `transition-delay: 0ms` residue at settle; **(c)** the
   durations/easings/staggers were all wrong (700 ms
   cubic-bezier(0,0,0.2,1) vs the live's 300–800 ms per element).
2. **F1-MISS / F1-EXTRA.** Missing entrances: the testimonial strip cards
   (y=40, cyclic (i%8)·100 ms), the dashboard mockup (y=60/800 —
   confirmed live pre-reveal `translateY(60px)`), the hero mount trio
   (badge y=20/600; H1 y=40/800/delay 400 — the live's H1 inline style
   carries the motion alongside its letterSpacing/mix-blend/filter;
   subtitle y=30/800/delay 600), the four legal pages' content blocks
   (y=20/600 on mount), the /faq heading (y=20/600) and items (y=15,
   i·80 ms, 400 ms — each in an UNCLASSED motion div inside `space-y-3`).
   Invented entrances: the logo-cloud container (the live's is static),
   five One-Platform inner `y=0` Reveals (the live animates the showcase
   as ONE), the whole-CTA block (the live animates ONLY the badge —
   y=30/800).
3. The live's full parameter table was extracted from its bundle (18
   `initial/whileInView/viewport/transition` configs + the hero's
   `animate` trio) — the remediation's R1 table.

**NEW survey surface #2 — the line-height cascade** (computed
`line-height` of all 140 text elements): three diffs, one root cause —
**the v3/v4 cascade inversion**. In v3, responsive text-size utilities
(`sm:text-base`, `md:text-4xl`, `md:text-6xl`) are emitted inside their
media queries AFTER all base utilities, so their line-heights BEAT
coexisting `leading-*` utilities; in v4 the leading utilities set
`--tw-leading`, which the text utilities consume via `var(--tw-leading,
var(--text-*--line-height))` — leading always wins. Affected: the hero
subtitle (24→26 px), the features H3 (40→45 px), the CTA gradient span
(60→75 px). Counter-probes confirmed STATIC text+leading pairs (problem
copy `text-sm leading-relaxed` = 22.75 px; the KV wordmark `text-3xl
leading-none` = 30 px) match both engines — the divergence is exactly
the responsive+leading combination.

**NEW survey surface #3 — the box-shadow scale** (computed shadows both
sides, with an oklab-aware visible-layer parser): v4 renamed the small
shadows — the live's `shadow-sm` (v3: `0 1px 2px 0 0.05`) renders on the
clone as v3's DEFAULT shadow (`0 1px 3px 0.1, …`). The login Sign in
button + the Google button's hover render heavier. `shadow-lg`/`shadow-xl`
are unchanged v3→v4 (the avatar's shadow-lg verified rendering-identical
through its oklab spelling — the first survey pass false-negatived it
until the parser learned oklab).

**NEW survey surface #4 — the login focus chrome** (focused computed
styles + the live's login css bundle rules): (a) this app's global
`*{outline-color: violet/50}` rule (the SPA parity, Session 5 F3) also
applies on /login here — the live's login bundle ships NO such rule (its
outlines render UA currentColor; the Sign in's outline computes WHITE
there vs violet/50 here); (b) the Sign in/Google buttons and both inputs
lack the live's `focus-visible:ring-ring` class — emitted in the live's
login css with `--ring: 240 10% 3.9%` (slate-950), so the live's
keyboard-focused Sign in renders a slate-950 ring (inert on the inputs —
their `focus:ring-slate-400` wins, identical both sides); (c) the Google
icon wrapper is a SPAN here vs a DIV on the live.

**NEW survey surface #5 — completion geometry + pseudo-elements**: 640
and 1024 (never measured before): page widths, h1 sizes, ALL section
offsets IDENTICAL. Pseudo-elements: none on either side.

**The standing asks re-verified**: the mobile menu remains
byte-identical (panel geometry/rows/hrefs; the D32 live-side
pointer-block still confirmed); the resize guard holds (the suite);
post-login lands on `/` with unchanged chrome (D1 documentation valid).
No new Tailwind v4 trap touches the nav — the motion rewrite never
touches `navbar.tsx`'s menu logic.

**The logo surprise (found mid-remediation by pixel evidence)**: the VLM
flagged the clone's nav logo BLANK over the white features section. The
live's rendered truth (pixel-sampled + element-shot): the logo IS dark
there — but through a mechanism no computed-color probe had seen: a
**React-driven PATH FILL attribute** (`fill="white"` dark →
`fill="black"` light on all 11 paths) while the ANCHOR stays bare
(`flex items-center`, color white — the computed `.color` read that
Session 4's spec pinned, and that my first fix trusted, was measuring
the wrong property). Also: the live's floating chevron is
framer-driven (`y:[0,-15,0]`, 4 s, easeInOut — measured mid-oscillation
at −14.7 px) vs the clone's 6 s/−12 px CSS keyframes; and the live's
pricing CTA `disabled:*` utilities are PER-PLAN (Free + Pro carry them,
Enterprise doesn't) — my first blanket removal was wrong, caught by the
re-survey.

## Phase 3 — Remediation (TDD; 12 unit + 21 e2e pins observed RED first)

- **R1** `src/lib/motion.ts` (pure: the easeOut bezier solver, the
  delay/duration timeline, the per-frame reveal state — unit-pinned with
  values fit to the live's ramp) + the rewritten rAF-driven `Reveal`
  (never adds classes; writes inline opacity/transform per frame;
  settles to EXACTLY `opacity: 1; transform: none;`; reduced-motion
  settles instantly — the documented a11y superset) + the parameter
  table across 10 files + the entrance additions/removals.
- **R2** `@theme --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)`.
- **R3** a utilities-layer `.transition-colors` override (the property
  list is hardcoded in v4's utility — no theme key exists).
- **R4** inline `--tw-leading: initial` pins on the three
  responsive+leading elements.
- **R5** the login route style: `:root { --ring: 240 10% 3.9% }` + a
  route-scoped `* { outline-color: revert }` neutralization;
  `focus-visible:ring-ring` on the buttons/inputs; the Google-icon
  wrapper SPAN→DIV.
- **R6** the FAQ chevron `text-muted-foreground` + `--color-muted-foreground:
  #a3a3a3` (the live's `0 0% 64%`).
- **R7** the navbar logo anchor stripped to the live's bare
  `flex items-center` + the PATH FILL swap mechanism; the Log In button
  class order matched verbatim; the per-plan CTA `disabled:*` utilities
  restored (Free + Pro, not Enterprise).
- **R8** the float keyframes corrected (−15 px / 4 s) + the footer
  petals' `anim-flogo-*` names + keyframe aliases.

Spec corrections with evidence: the Session-4 navbar-behavior logo pin
now reads the rendered PATH FILL (the old `.color` read diverges from
the live's mechanism on both sides).

## Phase 4 — Verification

- **Gate: ALL GREEN — 266 checks** (92 unit = 80 + 12 motion-engine;
  136 e2e = 109 + 27 motion-parity; 38 smoke). Survived three
  spec-bug-fix iterations (SSR style serialization without spaces; the
  H2's leading pin in the "no motion" assertion; a null-safety pass).
- **Paired re-survey**: word parity 1.0000 on all 8 routes; the motion
  diff went 78 → 17 on `/` with every remaining entry a documented
  class (the shimmer span implementation, the H1 style-node text
  artifact, the Pro card's inert scale classes, the newsletter
  `disabled:opacity-50` functional superset) or the KEEP-v4
  transition-transform list (the arrows animate through `translate`;
  narrowing it would stop them — the D6-class engine note). The
  entrance-timing probe: the clone's ramp 412→1024 ms vs the live's
  415→1034 ms (the ~600 ms easeOut curve, matched); under RM the clone
  settles instantly (the documented superset — the live animates).
- **VLM**: hero IDENTICAL; CTA IDENTICAL; features clean after the logo
  fix (one scroll-spy active-pill flag = capture-timing artifact,
  dismissed with the navbar-suite pins); the mobile-menu shot verified
  open with all rows.
- **Screenshots**: all 17 standard shots refreshed against the
  remediated build.

## Phase 5 — Docs & handoff

PAD (revision block, ledger D41–D48, §5.3 motion rewrite, §5.5 traps
13–14, §7 counts, §11 key files), AGENTS (gotchas 21–22, counts),
CLAUDE (session-8 context, counts), README (266 badge, motion notes,
counts), `saas-company_SKILL.md` v2.7.0 (lessons 24–25), the remediation
plan (`docs/remediation-plan-session8.md`), and this log. `.env.example`
re-verified (no new env vars — all changes are code). Commit + SSH push
per the runbook.
