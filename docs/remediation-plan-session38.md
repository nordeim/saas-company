# Remediation Plan — Session 38

The session_74 S38 candidates, answered against the measured codebase. The
baseline is the Session-37 tree (gate 656 = 247 unit + 124 smoke + 285 e2e;
the drift battery 36/36 GREEN across four phases — `docs/session_74.md`).

- **R1 — D142: the logo petal choreography.** The S38 recon's range probe
  (time-sampled computed transforms, both sides) caught the ONE real drift
  of the session: the live's four logo petals (navbar `anim-logo-*` +
  footer `anim-flogo-*`) slide AXIS-ALIGNED — ns `translateY(+12.84px)`,
  sn `translateY(−12.84px)`, ew `translateX(−12.84px)`, we
  `translateX(+12.84px)` (user units) — with the stop shape
  `0%: 0 → 30%: peak → 50%: peak (hold) → 80%: 0 → 100%: 0 (hold)`,
  3s ease-in-out infinite, ew/we `delay: 3000ms`. The clone ships a
  DIAGONAL 3px jitter (`translate(3px, −3px)` family) with a DIFFERENT
  stop shape (`0%, 40%, 100%: 0; 50%: peak`). Amplitude 4.28x off,
  direction rotated 45°, hold pattern wrong — visible in the navbar on
  every route. Extracted definitively through the Web Animations API
  (`el.getAnimations()[0].effect.getKeyframes()` — the exact offsets and
  transform values; `research/probe-logo-keys-s38.mjs`). The class-level
  timing (3s ease-in-out, the ew/we 3s delay) already matches — only the
  keyframe VALUES and SHAPE drift.
- **R2 — the THIRTEENTH surface: the LOOP inventory.** The S38 candidate
  list proposed the radial/conic gradient extension, the `will-change`
  companions, and the font-family STACK inventory. The recon measured all
  three — and found each EMPTY or at parity (see R3). The real gap the
  recon DID find: **`animation-name` is library-blind**. The live animates
  its mockup/dots/skeletons through framer-motion INLINE WRITES (the S10
  record) — computed `animation-name` stays `none`; the clone reproduces
  the same loops as CSS keyframes. An animation-name column would read 16
  phantom "clone-only carriers" (all library-internal). The honest surface
  is LIBRARY-AGNOSTIC: time-sample every rendered element's computed
  transform/opacity (plus the background-position and stroke-dashoffset
  carriers) and record which elements CYCLE, in which property family,
  and over what VALUE RANGE. CSS keyframes and framer writes both surface
  as cyclers. Measured on the landing: **22 loopers on each side, same
  DOM order, same loop signatures, same ranges** — everything at parity
  except the petals (D142).
- **R3 — the three candidate surfaces, measured and adjudicated.**
  - **The radial/conic gradient extension**: ZERO radial/conic carriers on
    any of the eight routes on either side (the mockup's "orb glows" are
    linear `bg-gradient-to-r` + `blur-3xl`, not radial). The parser
    extension still ships (the radial geometry contract: shape/extent/
    size/at-position compared exactly — the S37 layer's direction loop
    would otherwise swallow the geometry chunk into a colorless stop), but
    the surface is documented EMPTY-ON-ARRIVAL with the recon evidence.
  - **The `will-change`/`backface-visibility`/`transform-style`/
    `isolation` companions**: zero non-default carriers on ANY rendered
    element on ANY route, either side (`research/recon2-s38.mjs` — the
    isolation DEFAULT is `auto`, not `isolate`; the first probe's filter
    bug, caught and fixed). Green-on-arrival, verified empty on both
    sides; a sentinel pin guards the interactives.
  - **The font-family STACK inventory**: the full computed stack (not
    just the first family — the S35 column's `firstFamily()` limit)
    compared verbatim per text-bearing element: 4 distinct stacks
    (`"Vend Sans", sans-serif`; `"Playfair Display", serif`;
    `"DM Serif Display", serif`; the login route's system stack with the
    emoji fallbacks), byte-identical counts on both sides across all
    eight routes. Green-on-arrival, non-trivial (163 landing carriers).

## The loop-inventory contract (the thirteenth surface, designed BEFORE the column ships)

- **The anchor:** every rendered element (`getClientRects().length > 0`,
  the S35 BOX check) that is a LOOPER CANDIDATE at any sample — computed
  `transform ≠ "none"` OR `opacity ≠ "1"` — sampled over a 4.6s window at
  ~120ms (38 samples), after the full-load discipline (networkidle + the
  scroll-through + settle, so entrance transients decay and whileInView
  reveals complete; a late-arriving entrance ring is a TRANSIENT, never a
  drift — the S37 verified-poll law's sibling).
- **The record per looper (an element with >1 distinct sampled value in
  any tracked property):**
  - the CLASS PREFIX (first three classes) — the pairing key;
  - the cycling PROPERTY FAMILIES: transform-scale, transform-translate
    (tx/ty), opacity, background-position, stroke-dashoffset;
  - the VALUE RANGES (min/max of the matrix e/f entries, the opacity
    float, the dashoffset float) with tolerances (±0.6px translate,
    ±0.03 opacity, ±0.03 scale) — honest for every loop of period ≤ 5s;
  - the long-period carriers (the organic-gradient 14s/6s background-
    position loops) compare the observed DISTINCT-VALUE SPREAD overlap
    (≥ 70% jaccard on %-rounded values) — full-range convergence is not
    attainable inside one window, and the WAAPI layer pins their
    durations exactly anyway.
- **The WAAPI layer (the CSS-animated subset):** for every element with
  `getAnimations()`, the normalized `(animationName, duration, delay,
  per-keyframe transform/opacity/strokeDashoffset stops)` — the exact
  contract, cheap, catches duration/delay/stop drifts the sampling layer
  cannot resolve. (Framer loops return no CSSAnimation — invisible here
  BY DESIGN; the sampling layer owns them.)
- **The comparison:** per route, the looper COUNT guard (a count mismatch
  fails loudly), pairwise per DOM index (the class-prefix guard — a
  mismatched prefix is a pairing failure, never a diff), then the record
  equality. `animation-name` itself is NEVER compared (library-internal;
  the D125 law at the animation layer).

## The D142 fix contract (TDD)

- **The battery first:** the loop phase's maiden run reads the petal
  drift (clone ranges ±3px vs live ±12.84px) — the seventh new column in
  a row to catch drift on its first run, the record for the session.
- **The RED pins** (`tests/e2e/session38-logo-petals.spec.ts`): the WAAPI
  contract of all eight petals — ns/sn/ew/we × logo/flogo: duration 3000,
  delays (ns/sn 0, ew/we 3000), offsets `[0, .3, .5, .8, 1]`, transforms
  `[0, ±12.84px, ±12.84px, 0, 0]` on the right axis per petal — plus the
  sampled-range pin (the ns petal's ty max ≥ 12.2 over a 3.5s window).
- **The fix:** the eight `@keyframes` blocks in `src/app/globals.css`
  rewritten with the measured contract (the live's exact stop shape and
  values; the comment records the WAAPI extraction). No class changes,
  no component changes — the class timing already matches.
- **GREEN**, then the battery's loop phase re-run to 8/8.

## The R3 pin contracts

- **The companions sentinel** (`session38-static-inventory.spec.ts`): on
  the landing, every rendered interactive carries `will-change: auto`,
  `backface-visibility: visible`, `transform-style: flat`,
  `isolation: auto` — the empty-set contract versioned so a future
  regression surfaces loudly.
- **The font-stack pins** (same spec): the landing's three stacks and the
  login's system stack, VERBATIM (the full computed string including the
  emoji fallbacks) — plus a per-route distinct-stack-count contract.
- **The radial/conic parser**: battery-side only (the gradient phase's
  normalization grows the radial/conic geometry contract); the empty-set
  adjudication lives in this plan and the session log.

## The TDD execution order (the house law)

1. The battery built (research/drift-battery-s38.mjs — phase-split:
   loop / r3 / extra; the port guard + the process-group kill + the
   clean-build discipline carried from S37).
2. The loop phase's FIRST RUN read as findings; every finding adjudicated
   IN VIVO (the WAAPI extraction, the range probes) before any fix.
3. Real drifts: RED pins first, then the fix, then GREEN.
4. The full gate re-run (`rm -rf .next` before the build — gotcha 50b).
5. The 20-shot screenshot refresh + the VLM standing five.
6. Docs aligned: PAD (the revision block, the ledger row D142, §7 counts,
   §7.2 the session38 pins), AGENTS (the counts + the thirteenth surface
   + the library-blindness law), CLAUDE, README, SKILL version bump +
   the new lesson, .env.example sync check, this plan ticked, the session
   log (docs/session_76.md), the worklog.

## The open questions (best-judgement decisions, recorded here)

- **Does the loop phase run per-route or sliced?** Per-route inside one
  phase call, but with the route-slice escape hatch (`node battery.mjs
  loop 0:4`) — the 4.6s sampling window × 8 routes × 2 sides ≈ 4 minutes,
  inside the 10-minute reaper, with the hatch as the fallback.
- **Is the entrance-ring transient a loop?** No — a decaying spring ring
  (the live's mockup wrapper, measured `o 0.804..1, ty 0.44..11.66`
  decaying after the scroll-through) FAILS the cycling test at settle
  (its sampled value set converges to a single value once the ring
  decays; the 500ms settle + the >1-distinct-value rule exclude it).
  If it ever appears as a looper, the S37 verified-poll law applies:
  re-sample after a longer settle, never drift.
- **Are the ew/we petals' 3000ms delays functionally meaningful?** They
  are the live's own values (a full-period delay = the ew/we petals sit
  at rest through the first ns/sn cycle, then join in phase). The clone
  already ships them; the pins version them so the question stays closed.

## ToDo (ticked as executed, with measured results)

- [x] R1/D142: the battery loop phase's maiden run reads the petal drift
      (every logo-carrying route: families [tx+ty] vs [ty] + the WAAPI
      keyframe strings; PLUS the shine's gradientShift five-stop contract
      the WAAPI layer caught — D143, unforeseen by the plan)
- [x] The RED pins (session38-logo-petals.spec.ts — 10/10 RED) + the
      session38-shine-parity pins (2/2 RED)
- [x] The fix: the eight petal @keyframes blocks + the gradientShift
      five-stop corner cycle → GREEN 12/12; the loop phase re-run
      **16/16 GREEN** (8 routes x loop + WAAPI)
- [x] R2: the loop inventory at parity (31/31 loopers on the landing —
      the petals, pulses, dots, glow, under-glow, float, skel-*, scroll-
      dot, organic-gradients, border-shimmers, logo/flogo paths — same
      DOM order, same signatures/ranges; the WAAPI layer: the live's 15
      CSS animations all reproduced exactly, the clone's 16 extras the
      REGISTERED framer reproductions)
- [x] R3: the companions sentinel + the font-stack pins GREEN on arrival
      (5/5 — the empty-set contract + the four stacks with carrier
      counts); the radial/conic geometry parser shipped in the battery
      (zero carriers measured — the empty-set adjudication in this
      plan); the r3 phase **24/24 GREEN**
- [x] The extra phase: **12/12 GREEN** (word parity 1.0000 x8, the
      sitemap superset contract, the robots superset, the JSON-LD
      mounts, the mobile nav byte-identical)
- [x] The full gate on a clean build: **673 checks ALL GREEN** (247
      unit + 124 smoke + 302 e2e — 285 standing + 17 session38 pins;
      lint / typecheck / build clean)
- [x] The 20 screenshots + the VLM standing five: 4/5 raw → **5/5 after
      evidence adjudication** (the login 4px strip re-verified byte-exact
      at the computed level on the S38 build)
- [x] The docs alignment (PAD revision + ledger D142/D143 + counts, AGENTS
      counts + the thirteenth surface + gotcha 51, CLAUDE, README, SKILL
      v2.37.0 lesson 77, .env.example verified in sync — no env vars
      touched, code-only) + the session log (docs/session_76.md) + the
      worklog
- [x] The commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding)


## The pushed-hash record (the closing discipline)

- Remediation commit **a462734** pushed via the SSH wrapper with the
  EXPLICIT `--remote git@github.com:nordeim/saas-company.git` (the S31
  trap: the wrapper's DEFAULT remote is the runbook's example repo —
  the explicit flag held from the first dry-run).
- Wrapper-verified: remote main @ a462734 == local HEAD; the
  fetch-independent HTTPS ls-remote agreed
  (a46273487a30972de7e73e2510f7f495c7cb6ca5).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1–S37 record); both the wrapper's temp key copy and
  the operator's key file shredded after use.
- Zero zombies at close (all probe/battery/capture ports :3300–:3340
  swept and cleared); the tree clean; no new branches.
