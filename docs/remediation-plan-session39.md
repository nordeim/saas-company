# Remediation Plan — Session 39

The worklog S39 candidates (the loop inventory's period layer, the
reduced-motion surface, the z-index stacking inventory), answered against
the measured codebase. The baseline is the Session-38 tree (gate 673 =
247 unit + 124 smoke + 302 e2e; the drift battery 13 surfaces, 52 checks,
zero drift — `docs/session_76.md`).

## The re-scoping recon (research/recon-s39.mjs + the adjudication probes)

All three candidate surfaces measured BEFORE the contracts were designed:

- **The z-index/stacking inventory** (the fourteenth-surface candidate):
  64 carriers on the clone's landing vs 65 on the live's. The 13 raw
  signature asymmetries adjudicated IN VIVO (adj-zindex-s39.mjs,
  adj-stuck-s39.mjs): (1) the live's TWO `fixed top-0 z-[100]` elements
  are its DORMANT TOASTERS (empty `flex max-h-screen w-full flex-col-reverse
  p-4 … md:max-w-[420px]` shells — the S33/gotcha-18 record; the clone
  deliberately omits them: they pointer-block the live's own mobile
  burger); (2) the live's resting `matrix(…)` transforms on the nav-links
  container (`-241.367` = the `left-1/2 -translate-x-1/2` centering
  write), the scroll-dot wrapper (`-12`), and the pricing badge
  (`-68.7031`) are CENTERING WRITES, not motion; (3) ~51 elements on the
  live carry framer RESIDUE transforms (identity `translateY(0px)` after
  entrances, mid-loop scale/translate writes on the dots/orbs) vs ~20 on
  the clone (the Reveal end-states) — the library-internal D125 family at
  the stacking layer; (4) the clone-only `next-route-announcer` is the
  Next.js platform artifact. NO real visual stacking drift: paint order is
  identical (the toasters are empty, the residue transforms are identity
  or centering, z-auto children paint the same inside an extra context).
- **The DWELL law (a new measurement law, gotcha 52a).** The recon's fast
  smooth-scroll pass left the live's below-fold `whileInView` entrances
  UNFIRED — the overview card read stuck at inline `opacity: 0; transform:
  translateY(30px)` while a direct scroll-and-hold settles it to
  `opacity: 1; transform: none` (adj-stuck-s39.mjs). Transient passes do
  not fire the live's entrances; every below-fold surface must dwell
  (~450ms per section) before sampling, or resting-state surfaces (the
  stacking inventory included) read pre-entrance fiction.
- **The reduced-motion twin**: under `prefers-reduced-motion: reduce`
  emulation the LIVE keeps **29 loopers cycling** (its framer inline
  writes AND its own CSS animations — `gradientShift`, the
  `organic-gradient` text fills — the live ships NO reduced-motion support
  anywhere in either bundle), while the CLONE collapses to **ZERO**
  cyclers (the globals.css `0.01ms` kill-switch + the Reveal early-return
  + the Lenis skip — the Session-14 F4 a11y-superset decision, now
  measured at the loop-inventory level).
- **The loop period layer** (adj-periods-s39.mjs, adj-fine-periods-s39.mjs,
  adj-float-multi-s39.mjs, adj-float-inview-s39.mjs, adj-bundle-s39.mjs):
  real-timestamp trough-gap analysis over ~24s windows. At parity:
  side-list dots 2.0s, the ambient glow 4.0s, the under-glow 3.0s, the
  skeleton bars/tiles 3.0s, the petals 3.0s (WAAPI-pinned). **ONE real
  drift: D144** — the hero's scroll-dot bar: the live cycles at
  **1.5s** (measured 1498ms; the live's own bundle reads
  `animate:{y:[0,8,0]}, transition:{duration:1.5, repeat:Infinity}`)
  while the clone's `--animate-scroll-dot` ships **1.7s** (Session 8's
  coarse rAF estimate). A 13% period difference in the dot's bounce
  rhythm, visible on every landing load.
- **D145 — the float-chevron conflict (REGISTERED, no fix).** The live's
  own bundle authors `animate:{y:[0,-15,0]}, transition:{duration:4,
  repeat:Infinity, ease:"easeInOut"}` — byte-for-byte the clone's
  `@keyframes float` (the Session-8 record, correct). But the live ALSO
  carries a vestigial `whileInView:{y:0}` + `initial:{y:0}` on the same
  element — a framer variant conflict that SUPPRESSES the authored float
  once the element enters view (measured in-view amplitude 0.04–0.14px
  across loads; out-of-view race artifacts up to 4.4px; NEVER the authored
  -15px). The rendered contract is an unstable library race — there is no
  pinnable value. Per the D125 law (library-internal artifacts are
  registered, not chased) and the Session-14 precedent (the a11y-superset
  note), the clone keeps rendering the AUTHORED contract (the working
  float) and the live's conflict is REGISTERED in the PAD ledger with the
  full measurement record.

## R1 — D144: the scroll-dot period (TDD)

- **The RED pin** (`tests/e2e/session39-scroll-dot-period.spec.ts`): the
  WAAPI contract — the bar's CSSAnimation `duration === 1500` — plus the
  sampled trough-gap period over a ≥10s real-timestamp window ∈
  [1400, 1600]ms, plus the range pin (ty 0..8, the live's authored
  amplitude).
- **The fix**: `src/app/globals.css` — `scroll-dot 1.7s ease-in-out
  infinite` → `scroll-dot 1.5s ease-in-out infinite` in BOTH carriers
  (the `--animate-scroll-dot` theme var and the `.animate-scroll-dot`
  class). The landing.spec.ts comment ("≈1.7s period") updated to the
  measured 1.5s. No component changes — the class contract already
  matches.
- **GREEN**, then the battery's period layer re-run.

## R2 — the fourteenth surface: the z-index/stacking inventory

- **The battery column** (research/drift-battery-s39.mjs, the stack
  phase): every rendered element with computed `z-index ≠ auto` OR
  `position ≠ static`, after the DWELL-load discipline — the record: tag,
  class prefix, position, z-index, and the stacking-context creator flags
  (opacity < 1, transform ≠ none, filter, isolation, will-change,
  contain, mix-blend-mode). The comparison: per route, the carrier-count
  guard, then the signature-set diff ADJUDICATED against the REGISTERED
  differences (the dormant toasters ×2 [live-only, empty shells], the
  framer residue/centering transform carriers [live-only, the D125
  family], the `next-route-announcer` [clone-only, platform], the
  clone-only `get-started-shimmer` class naming [the S38 registration]).
  An UNREGISTERED asymmetry fails loudly.
- **The pins** (`tests/e2e/session39-stacking-inventory.spec.ts`): the
  clone's landing carries EXACTLY ONE fixed element (the navbar, z-50);
  no element exceeds z-50 on the landing (the live's z-[100] toaster has
  NO clone counterpart — the gotcha-18 pointer-blocking fix stays fixed);
  the dashboard header is z-40 sticky; the section `z-10` wrappers
  present; the get-started shine span is the registered opacity carrier.

## R3 — the reduced-motion loop record (pin)

- `tests/e2e/session39-reduced-motion-loops.spec.ts`: under
  `reducedMotion: "reduce"`, a ≥5s time-sampled inventory of the landing
  finds ZERO cyclers (transform/opacity/background-position all constant)
  — the Session-14 collapse now pinned at the loop-inventory level, with
  the live's 29-cycler record (its framer writes AND its CSS animations
  keep running) documented in the spec header as the measured
  reference-side behavior.

## R4 — the period layer (pins)

- `tests/e2e/session39-period-parity.spec.ts`: the clone's CSS animation
  durations pinned through the WAAPI against the live's MEASURED periods
  (scroll-dot 1500 [the D144 fix], mockup-dot 2000, mockup-glow 3000,
  mockup-ambient 4000, skel-line/violet/tile/wide 3000, float 4000,
  pulse-glow 2400, logo/flogo 3000 [the S38 pins already carry the
  petals]) + a sampled-period pin for the scroll-dot bar and one
  skeleton tile (the trough-gap method, real timestamps).

## The TDD execution order (the house law)

1. The battery built (research/drift-battery-s39.mjs — phase-split:
   stack / period / extra; the port guard + the process-group kill + the
   DWELL-load discipline + the eval() string-function law carried from
   S37/S38).
2. The stack phase's FIRST RUN read as findings; every finding
   adjudicated IN VIVO (the dormant-toaster probe, the centering-write
   probe, the residue census) before any registry entry.
3. Real drifts: RED pins first, then the fix, then GREEN.
4. The full gate re-run (`rm -rf .next` before the build — gotcha 50b).
5. The 20-shot screenshot refresh + the VLM standing five.
6. Docs aligned: PAD (the revision block, the ledger D144/D145, §7
   counts, §7.2 the session39 pins, §11 the spec rows), AGENTS (the
   counts + the fourteenth surface + gotcha 52: the dwell law, the
   period laws, the conflict law, the eval re-catch), CLAUDE, README, the
   SKILL version bump + lesson 78, .env.example sync check (no env vars
   touched — code-only), this plan ticked, the session log
   (docs/session_78.md), the worklog.

## The open questions (best-judgement decisions, recorded here)

- **Does the stacking inventory compare the ctx-creator flags exactly?**
  No — the framer residue makes the live's flag set inherently
  load-state-dependent (mid-loop scale writes read as `transform ≠ none`
  at sample time). The honest contract: the Z-INDEX and POSITION values
  compared exactly; the ctx-creator flags compared as REGISTRY-ADJUDICATED
  evidence (the live-only `tr/op` carriers must ALL resolve to the
  registered families — centering writes, residue, mid-loop samples —
  verified this session by the resting-transform census).
- **Is the D145 conflict worth "fixing" toward the rendered stillness?**
  No. The rendered contract is a race (0.04–4.4px across loads — no
  pinnable value); the authored contract is stable and already shipped;
  the Session-14 precedent resolves library artifacts as documented
  supersets. The ledger carries the full record.
- **Does the period layer run per-route or sliced?** The landing only —
  every member of the loop family lives on the landing (the dashboard
  route adds no loopers; the S38 loop inventory verified this).

## ToDo (ticked as executed, with measured results)

- [x] R1/D144: the RED pins (the WAAPI 1500ms duration + the sampled
      period — RED 2/3, the amplitude pin green) → the 1.7s → 1.5s fix
      in globals.css (both carriers) → **GREEN 3/3**; the landing.spec.ts
      comment updated to the bundle-read contract; the pin HARDENED to
      the median-gap estimator after one flaky full-suite run
- [x] R2: the fourteenth surface shipped in the battery (the stack phase,
      DWELL-loaded, registry-adjudicated) — **8/8 GREEN, ZERO DRIFT**
      (the registry extended in vivo: the login z-9999 react-hot-toast
      shells, the dashboard sticky-header superset chrome, the S14-F3
      WCAG live region, the /demo superset route) + the stacking pins
      GREEN 5/5 on arrival
- [x] R3: the reduced-motion loop pin GREEN 2/2 (ZERO cyclers under
      reduce over a 5s sampled inventory + the 0.01ms clamp re-read)
- [x] R4: the period-parity pins GREEN 10/10 (the WAAPI durations of the
      whole loop family = the live's measured periods; the pulse-glow
      DEAD-CSS note recorded — the hero badges ride Tailwind's
      animate-pulse 2s; the skeleton tile's sampled period in band)
- [x] The battery: **stack 8/8 + period 5/5 + extra 11/11 = 24/24 GREEN,
      ZERO DRIFT** (the extra phase's registry: the /thank-you sitemap
      omission, the RFC-9309 case-insensitive robots superset, the
      burger's a11y-trio + lucide-stroke-count normalization, the
      live-/dashboard-404 record)
- [x] The full gate on a clean build: **693 checks ALL GREEN** (247 unit
      + 124 smoke + 322 e2e — the session39 suites +20; lint/typecheck/
      build clean; one S38 pin hardened — the ew-petal window 3.5s →
      6.5s, two full delayed cycles)
- [x] The 20 screenshots refreshed (DB canonical before AND after —
      6 rows / 5 active / 7,120 runs) + the VLM standing five: **5/5
      after adjudication** (every flag a check-prompt expectation error
      or live-own parity; the mobile-menu artifact verified IDENTICAL on
      the live by side-by-side VLM comparison; gotcha 18's toaster
      pointer-block re-caught IN THE WILD on the live's own burger)
- [x] The docs alignment (PAD [revision block, ledger D144-D145, §7
      counts, §7.2, §11], AGENTS [the counts + the fourteenth surface +
      gotcha 52], CLAUDE [the session-39 context], README [the 693 badge
      + the S39 rows], SKILL v2.38.0 [lesson 78], .env.example verified
      in sync — no env vars touched, code-only) + the session log
      (docs/session_78.md) + the worklog
- [ ] The commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding)
