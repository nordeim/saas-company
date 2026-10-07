# Remediation Plan — Session 8 (2026-10-07)

**Scope:** Fix the issues, bugs and gaps found by the Session 8 parity audit
of this repository against the live reference (`saas-company.base44.app`),
executed TDD-first, gated by the full quality gate (§7.3 of the PAD), and
re-verified by a fresh paired survey.

**Audit method:** fresh paired captures of every live route (word parity
1.0000 on all 8 routes vs the Session-7 ground truth: the **reference is
UNCHANGED**). The Session-8 NEW audit surfaces — layers no prior session
surveyed:

1. **The MOTION layer** (computed `transition-*`/`animation-*` of every
   animated or transitioning element, live vs clone, systematically) — the
   survey that found this session's headline bug: the clone's entire
   scroll-entrance system is a CSS-transition approximation of the live's
   rAF-driven framer-motion engine, and the approximation is broken three
   ways (see F1).
2. **The line-height cascade** (computed `line-height` of all 140 text
   elements) — found the v3/v4 cascade INVERSION between responsive
   `text-*` utilities and `leading-*` utilities (F4).
3. **The box-shadow scale** (computed shadows both sides, incl. the
   oklab-spelling parse) — found v4's shadow-scale rename rendering the
   login button's shadow one step bigger (F2).
4. **The login focus system** (focused computed styles + the live's login
   css bundle rules) — the login route inherits this app's global violet
   outline rule that the live's login bundle does not ship (F5).
5. **Edge-completion geometry** (640 and 1024 — the two widths no prior
   session measured) and **the pseudo-element inventory** (both clean).

Every conclusion below was settled with computed styles, MutationObserver
traces, per-frame opacity sampling, bundle extraction, or bezier fitting —
never VLM impressions.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | **The entrance system diverges fundamentally — and is broken on the clone.** The live animates entrances with framer-motion: `initial {opacity: 0, y: N}` → `whileInView/animate {opacity: 1, y: 0}`, easing `easeOut` = **cubic-bezier(0, 0, 0.58, 1)** (fit against 10 sampled frames, MAE 0.014), viewport `once: true`, driven by a **rAF loop writing inline `opacity`/`transform` per frame** (MutationObserver: `style="opacity: 0; transform: translateY(17.7654px)"` at ~17 ms intervals), settled inline = exactly `opacity: 1; transform: none;`, `will-change: auto`. The clone's `Reveal` appends `transition-all duration-700 ease-out will-change-transform` classes ON the child. Three concrete failures: **(a)** on children that carry their own `transition-colors` (the problem cards) the Reveal's `transition-all` LOSES the cascade for the property list — `transition-property` resolves to the colors list, so opacity/transform are NOT in it and **the entrance SNAPS with no animation at all** (sampled: 0,0,0 → 1); **(b)** the same cascade leaves the reveal's `duration-700`/`ease-out`/stagger `delay` ACTIVE FOREVER on the cards — hover transitions render at **0.7 s ease-out + 0.12–0.24 s stagger delay** where the live renders its own clean **0.15 s** (problem cards) / **0.3 s** (pricing cards), and `will-change: transform` + an inline `transition-delay: 0ms` residue persist at settle; **(c)** the timing/easing/parameters are wrong everywhere: 700 ms `cubic-bezier(0,0,0.2,1)` vs the live's per-element 300–800 ms `cubic-bezier(0,0,0.58,1)`, staggers 120/140 ms vs the live's 150/200/100 ms | `src/components/site/reveal.tsx` (rewrite), every section using it | HIGH | Verified (computed transition/animation both sides; MutationObserver traces; per-frame opacity sampling; live bundle extraction) | Visual + Functional (systematic) |
| F1-MISS | **Entrances the live has and the clone lacks entirely:** the testimonial strip cards (y=40, delay `(i%8)*100` ms cyclic, 0.6 s), the dashboard mockup (y=60, 0.8 s — confirmed live: `style="opacity: 0; transform: translateY(60px)"` pre-reveal), the hero mount trio (badge y=20/0.6 s; H1 y=40/0.8 s/delay 400 — the live's H1 inline style carries the motion alongside its letterSpacing/mix-blend/filter props; subtitle y=30/0.8 s/delay 600), the four legal pages' content blocks (y=20, 0.6 s, ON MOUNT), the /faq heading block (y=20, 0.6 s) and the /faq accordion items (y=15, delay `i*80` ms, 0.4 s — each item sits in an UNCLASSED motion DIV inside the `space-y-3` container, live-verified) | testimonials.tsx, dashboard-preview.tsx, hero.tsx, legal-page-view.tsx, faq-view.tsx | HIGH | Verified (live inline styles + bundle configs) | Visual (missing feature) |
| F1-EXTRA | **Entrances the clone has that the live does NOT:** the logo-cloud wordmark container (live: no motion element — the clone wraps it in Reveal), the One-Platform inner chips (five `y=0` Reveals — the live animates the showcase as ONE element; the inner Reveals double-fade the chips through nested opacity), the CTA block (the clone animates the whole section; the live animates ONLY the badge pill — y=30, 0.8 s) | logo-cloud.tsx, problem.tsx, cta.tsx | MEDIUM | Verified (live settled styles are null on those elements) | Visual (invented) |
| F2 | **v4 renamed the small shadows — `shadow-sm` renders one step bigger.** v3's `shadow-sm` = `0 1px 2px 0 rgb(0 0 0 / 0.05)`; v4's `shadow-sm` = v3's DEFAULT shadow (`0 1px 3px 0 .1, 0 1px 2px -1px .1`). The login Sign in button (measured: live `…0.05) 0px 1px 2px 0px` vs clone `…0.1) 0px 1px 3px 0px, …0.1) 0px 1px 2px -1px`) and the Google button's `hover:shadow-sm` render heavier than the live. `shadow-lg`/`shadow-xl` are unchanged v3→v4 (the avatar's shadow-lg verified rendering-identical) | `src/app/globals.css` `@theme`: `--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);` | MEDIUM | Verified (computed boxShadow both sides) | Visual (token shift) |
| F3 | **v4's `transition-colors` property list is longer than v3's.** v3 emits `color, background-color, border-color, text-decoration-color, fill, stroke` (6); v4 adds `outline-color` + `--tw-gradient-from/via/to` (9). Rendered effect: elements with `transition-colors` FADE their focus `outline-color` over 150 ms on the clone while the live SNAPS it (the live's list has no outline-color); same for gradient-var changes. Durations/timings match everywhere (0.15/0.3/0.5 s `cubic-bezier(0.4,0,0.2,1)`) | `globals.css` `@theme`: `--transition-property-colors: color, background-color, border-color, text-decoration-color, fill, stroke;` | LOW | Verified (computed transitionProperty on 20+ elements) | Visual (engine utility definition) |
| F4 | **The v3/v4 line-height cascade INVERSION — three elements render taller line boxes on the clone.** In v3, a RESPONSIVE text-size utility (`sm:text-base`, `md:text-4xl`, `md:text-6xl`) is emitted inside its `@media` AFTER all base utilities — its line-height BEATS a coexisting `leading-*` utility. In v4 the leading utilities set `--tw-leading`, which the text utilities consume via `var(--tw-leading, var(--text-*--line-height))` — leading ALWAYS wins. Affected (live → clone): the hero subtitle `sm:text-base leading-relaxed` **24px → 26px**; the features H3 `md:text-4xl leading-tight` **40px → 45px**; the CTA H2 `md:text-6xl leading-tight` **60px → 75px** (the gradient span inherits). STATIC text+leading pairs match both engines (verified: problem copy `text-sm leading-relaxed` = 22.75px both sides; the KV wordmark `text-3xl leading-none` = 30px both sides) — the divergence is exclusively the responsive+leading combination | hero.tsx:112, features.tsx:122, cta.tsx:19 — pin `--tw-leading: initial` inline (forces the var() fallback = the text-size default, replicating the v3 outcome) | HIGH | Verified (computed line-heights both sides; v3/v4 rule extraction; the static-pair counter-probes) | Visual (engine cascade) |
| F5 | **The login route inherits focus chrome the live's login bundle does not ship.** (a) The global base rule `* { outline-color: rgb(213 0 255 / 0.5) }` (this app's SPA parity — Session 5 F3) also applies on /login here; the live's login css bundle has NO such rule — its login outlines render the UA currentColor (the Sign in button's outline computes WHITE on the live vs violet/50 on the clone). (b) The Sign in/Google buttons and both inputs lack the live's `focus-visible:ring-ring` class — on the live the rule IS emitted (`.focus-visible\:ring-ring:focus-visible{--tw-ring-color:hsl(var(--ring))}`) and `--ring: 240 10% 3.9%` (slate-950), so the live's keyboard-focused Sign in renders a slate-950 ring; inert on the inputs (their `focus:ring-slate-400` wins — verified both sides render slate-400). (c) The alternate-state back-button wrapper is a SPAN here vs a DIV on the live (same classes `transition-transform duration-200 -ml-4`, same transition values) | `src/app/login/page.tsx` (route `<style>`: neutralize the outline rule + define `--ring`; the button/input class consts + the back-button wrapper tag) | MEDIUM | Verified (live login css bundle rules + focused computed styles both sides) | Visual (route-scoped) |
| F6 | **The FAQ accordion chevron renders the wrong gray.** The live's chevron carries `text-muted-foreground` → `rgb(163, 163, 163)` (its `--muted-foreground: 0 0% 64%`); the clone's carries `text-white/50` → 50% white over black. All 6 chevrons on /faq. Also the token itself: the live's = `#a3a3a3` (neutral-400) vs this repo's `#a1a1aa` (zinc-400) | `src/components/site/faq-view.tsx:83` + `globals.css` `--color-muted-foreground: #a3a3a3` | LOW | Verified (computed color both sides) | Visual |
| F7 | **Class-string cleanups (byte-parity):** (a) the navbar logo anchor carries invented `transition-colors duration-300 text-white` — the live's is bare `flex items-center`; (b) the Log In button's classes are all correct but ORDERED differently than the live's verbatim string; (c) the pricing CTA buttons carry `disabled:opacity-50 disabled:cursor-not-allowed` with no `disabled` attribute ever set (inert) — the live's carry none | navbar.tsx, pricing.tsx:120 | LOW | Verified (DOM class attr both sides) | DOM parity |
| F8 | **The footer logo's petal classes are name-diverged.** The live's footer petals carry `anim-flogo-ns/ew/sn/we` (its navbar petals carry `anim-logo-*` — TWO different names in one bundle); the clone uses `anim-logo-*` for both. Motion values verified IDENTICAL (3 s ease-in-out, delays 0/3/0/3 s, same keyframes) — a byte-parity-only fix (ship the `anim-flogo-*` class names + keyframe aliases) | `src/components/site/logo.tsx` (the footer variant) + globals.css | LOW | Verified (computed animation both sides) | DOM parity (name-only) |
| F9 | **The newsletter button's `disabled:opacity-50` is FUNCTIONAL here** (the loading state sets `disabled` — the working-capture superset D2) while the live's form is a no-op with no such classes. KEEP + document in the ledger (the superset pattern) | footer.tsx:143 | INFO | Verified (the `disabled={state === "loading"}` binding) | Superset (documented) |

### Live-side observations (no clone change — document)

| # | Observation | Evidence | Clone behavior |
|---|-------------|----------|----------------|
| L1 | **The live's entrances RUN under `prefers-reduced-motion`** — identical curves RM vs normal (first-change ~420 ms, done ~950–1040 ms both) — framer-motion only honors RM when explicitly configured | per-frame sampling under emulated RM, both states | The clone collapses entrances instantly under RM — the **intentional a11y superset** (kept; ledger row) |
| L2 | **The live's below-fold reveals need sustained intersection** — fast scroll passes (700 px/40 ms) left the mockup and strip cards at `opacity: 0` after the pass; slow dwells reveal them | paired scroll probes | The clone's IntersectionObserver fires on any intersect — more robust; no action |
| L3 | Survey-methodology: computed-shadow visible-layer filters must parse `oklab()` spellings — the first pass false-negatived the clone's avatar ring+shadow (verified rendering-identical: `oklab(0.999…/0.5) 0 0 0 4px` = `rgba(255,255,255,0.5) 0 0 0 4px`) | direct boxShadow strings | The avatar is at parity (D6-class); noted for future surveys |

### Non-findings (checked, clean — dismissed with evidence)

- **Word parity 1.0000 on all 8 routes** (reference unchanged since Session 7).
- **Geometry at 640 and 1024** (the two never-before-measured widths): page
  widths, h1 size/width, and ALL section offsets IDENTICAL both sides.
- **Pseudo-elements**: none on either side (0/0).
- **Line-heights**: 140 text elements compared — only the F4 trio differs.
- **The login card structure**: the avatar block (h-20 w-20 sm:h-24 sm:w-24,
  ring-4 ring-white/50, shadow-lg, the slate gradient glow), H1/subtitle,
  Google button, or-divider, form — identical both sides, avatar shadow
  rendering-identical (oklab spelling).
- **`rounded-full`**: v3 `9999px` vs v4 `calc(infinity * 1px)` (computed
  `3.35544e+07px`) — rendering-identical engine artifact (D6-class; both
  clamp to the box; document, do not fight).
- **`transition-transform` property lists**: v3 `transform` vs v4
  `transform, translate, scale, rotate` — KEEP v4's: the clone's arrows move
  through the `translate` property (Session 6's engine finding); narrowing
  the list would STOP the arrow slide (a rendered regression). Document
  alongside D6.
- **The FAQ trigger/panel class strings**: byte-identical both sides.
- **The hero H1's inline props** (letter-spacing/mix-blend/filter):
  identical; the live simply appends the motion state to the same attribute.
- **The testimonial strip cards' hover**: `transition-colors duration-500`
  (0.5 s) matches both sides today and must keep matching after the
  entrance rewrite (the cards get motion WITHOUT losing their own hover
  classes — the rAF approach writes inline styles, never classes).
- **Mobile navigation**: the burger panel remains byte-identical (Session 6/7
  measurements hold; the D32 live-side pointer-block still confirmed by the
  drift-check run), the resize guard (Session 7 R6) is in the suite, and no
  new Tailwind v4 trap touches the nav — the motion rewrite does not touch
  `navbar.tsx`'s menu logic (only the logo anchor's class string, F7a).

---

## 2. Remediation (TDD — every pin observed RED before its GREEN)

### R1 — The rAF-driven Reveal (F1 + F1-MISS + F1-EXTRA)

- **New `src/lib/motion.ts`** (pure, unit-tested): the `easeOut` cubic
  bezier solver `cubicBezier(0, 0, 0.58, 1)` (bisection on the x-curve),
  `revealProgress(elapsed, {delay, duration})` (clamps; 0 during the delay),
  and `revealState(progress, y)` → `{opacity, transform}` (`translateY((1 -
  eased) * y px)` mid-flight; `{1, "none"}` at 1).
- **Rewrite `reveal.tsx`**: renders `<Tag className style>` — the SSR style
  = the caller's style + `opacity: 0; transform: translateY(${y}px)`. On
  mount (`mode="mount"`) or IntersectionObserver intersect
  (`mode="inview"`, threshold 0, once): a rAF loop writes
  `el.style.opacity` / `el.style.transform` per frame until progress ≥ 1,
  then sets exactly `opacity: 1; transform: none;` and stops. NO classes
  are added — children keep their own hover transitions (F1b fixed by
  construction). `prefers-reduced-motion` → settle instantly (the
  documented a11y superset, L1). No `will-change`, no `transition-delay`.
- **The parameter table** (extracted from the live's bundle — all ms):

  | Element | y | duration | delay | mode |
  |---|---|---|---|---|
  | Hero badge wrapper (unclassed div) | 20 | 600 | 0 | mount |
  | Hero H1 (the h1 IS the motion element — style merge) | 40 | 800 | 400 | mount |
  | Hero subtitle p | 30 | 800 | 600 | mount |
  | Logo-cloud eyebrow block | 20 | 600 | 0 | inview |
  | Dashboard mockup container | 60 | 800 | 0 | inview |
  | Problem eyebrow block | 20 | 600 | 0 | inview |
  | Problem cards ×3 | 30 | 600 | i*150 | inview |
  | One-Platform showcase (ONE element) | 30 | 800 | 0 | inview |
  | One-Platform footer note (inside the showcase) | 20 | 300 | 400 | inview |
  | Features eyebrow block | 20 | 600 | 0 | inview |
  | How-it-works eyebrow block | 20 | 600 | 0 | inview |
  | How-it-works steps ×3 | 40 | 600 | i*200 | inview |
  | Pricing eyebrow block | 20 | 600 | 0 | inview |
  | Pricing cards ×3 | 30 | 600 | 0/150/300 | inview |
  | Testimonials eyebrow block | 20 | 600 | 0 | inview |
  | Testimonial strip cards ×8 | 40 | 600 | (i%8)*100 | inview |
  | CTA badge pill (ONLY the badge) | 30 | 800 | 0 | inview |
  | /faq heading block | 20 | 600 | 0 | inview |
  | /faq items ×6 (unclassed wrapper divs) | 15 | 400 | i*80 | inview |
  | Legal pages ×4 content blocks | 20 | 600 | 0 | mount |

- **REMOVE**: the cloud container's Reveal (F1-EXTRA), the five One-Platform
  inner `y=0` Reveals, the whole-CTA Reveal → badge-only.
- **RED first** (`tests/e2e/motion-parity.spec.ts`, ~15 checks): entrance
  samples intermediate opacity (not 0→1 snap) on the problem card; the
  settled inline style is EXACTLY `opacity: 1; transform: none;` with
  `will-change: auto` and `transition-delay: 0s`; problem-card hover
  computes `transition-duration: 0.15s`; pricing-card hover `0.3s`; the
  strip card carries the motion style pre-reveal + hover `0.5s`; the mockup
  pre-reveals at `translateY(60px)`; the hero H1's inline style contains
  opacity/transform after mount; the legal content block reveals; the /faq
  items sit in unclassed motion wrappers; the CTA H2 has NO motion while
  the badge does; the cloud container has NO motion; the One-Platform chips
  have no own motion styles.

### R2 — The v3 shadow-sm token (F2)

- `globals.css` `@theme`: `--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);`
  (v3's value — v4 renamed the small end of the scale).
- **RED first**: the Sign in button's computed boxShadow contains
  `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px` and NOT `0.1) 0px 1px 3px`.

### R3 — The v3 transition-colors property list (F3)

- `globals.css` `@theme`:
  `--transition-property-colors: color, background-color, border-color, text-decoration-color, fill, stroke;`
- **RED first**: a nav footer link's computed `transition-property` equals
  the live's 6-prop string (no `outline-color`, no gradient vars).

### R4 — The three line-height pins (F4)

- `hero.tsx:112`, `features.tsx:122`, `cta.tsx:19`: add
  `style={{ ["--tw-leading" as string]: "initial" }}` — forces the var()
  fallback (the text-size default), replicating the v3 cascade outcome.
  Documented inline with the v3/v4 inversion note.
- **RED first**: the subtitle computes `line-height: 24px`; the features H3
  `40px`; the CTA gradient span `60px`.

### R5 — The login focus system (F5)

- The login route `<style>`: add `--ring: 240 10% 3.9%;` (the live's login
  bundle value) and a scoped `* { outline-color: revert; }`-class
  neutralization so the UA currentColor outline returns on /login only
  (matching the live's login bundle, which ships no outline-color rule).
- `login/page.tsx`: add `focus-visible:ring-ring` to the Sign in/Google
  button class consts and the input class const (byte-parity with the
  live's strings; active on the submit under keyboard focus, inert on the
  inputs where `focus:ring-slate-400` wins — same as the live).
- The back-button wrapper: SPAN → DIV (the live's tag).
- **RED first**: the Sign in's computed `outline-color` is NOT
  `rgba(213, 0, 255, 0.5)`; the class string contains
  `focus-visible:ring-ring`; `--ring` resolves `240 10% 3.9%`; the
  back-button wrapper tag is DIV.

### R6 — The FAQ chevron + the muted token (F6)

- `faq-view.tsx:83`: `text-white/50` → `text-muted-foreground`.
- `globals.css`: `--color-muted-foreground: #a1a1aa` → `#a3a3a3`
  (the live's `0 0% 64%`).
- **RED first**: the chevron's class contains `text-muted-foreground` and
  its computed color is `rgb(163, 163, 163)`.

### R7 — Class-string cleanups (F7)

- `navbar.tsx`: the logo anchor → `flex items-center` (strip the invented
  three); the Log In button classes reordered to the live's verbatim
  `px-5 py-2.5 text-white/80 hover:text-white transition-colors text-sm
  font-medium tracking-wide bg-transparent border-none cursor-pointer`.
- `pricing.tsx:120`: remove the inert `disabled:opacity-50
  disabled:cursor-not-allowed`.
- **RED first**: the logo anchor's class attr is exactly `flex items-center`;
  the Log In button's class attr equals the live's string; the pricing CTA
  carries no `disabled:` classes.

### R8 — The footer petal names (F8)

- The footer logo's four petals: `anim-logo-*` → `anim-flogo-*`; globals
  gains the `flogo-ns/ew/sn/we` keyframes (aliases of the measured
  choreography — identical values, the live's names).
- **RED first**: the footer petals carry the `anim-flogo-*` classes.

### R9 — Documentation alignment

- PAD: revision block; ledger D41–D47 (the rAF entrance system → parity;
  shadow-sm token → parity; transition-colors list → parity; the
  line-height cascade pins → parity; login focus chrome → parity; the FAQ
  chevron/muted token → parity; RM-instant superset + rounded-full +
  transition-transform + newsletter-disabled engine/superset notes); §5.3
  motion section rewrite (the framer mechanism measured); §5.5 trap 13–14
  (v4's shadow-scale rename; the --tw-leading cascade inversion); §7
  counts; §11 key files (motion.ts).
- AGENTS.md: gotchas 21–22 (the entrance engine + the two v4 token traps).
- CLAUDE.md: session-8 context block + counts.
- README: motion row, badge counts.
- `saas-company_SKILL.md` v2.7.0: lessons 24–25 (survey the MOTION layer —
  transitions AND the engine that drives entrances, a CSS-approximation of
  an rAF engine breaks on cascade conflicts; v4's renamed shadow scale +
  the leading cascade inversion — two more config-level engine shifts the
  class-string diff cannot see).
- `worklog.md` + this plan; screenshots refresh; `.env.example` re-verified
  (no new env vars — all changes are code).

---

## 3. Pre-execution codebase validation (done before writing this plan)

- Baseline gate on the inherited tree: ALL GREEN — lint ✓ typecheck ✓
  Vitest 80/80 ✓ build ✓ smoke 38/38 ✓ Playwright 109/109 ✓ (227 checks).
- `.env` `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root ✓;
  `.env.example` tracked and in sync ✓; all four configs exclude `skills/` ✓.
  The shell's exported absolute `DATABASE_URL` neutralized for every
  command (the AGENTS.md discipline — the trap was live in this shell).
- All fix sites located and read: `reveal.tsx` (the whole component),
  `hero.tsx` (26–128: the badge/H1/subtitle/CTA structure), `problem.tsx`
  (43–160: the cards, the showcase + five inner Reveals, the note),
  `pricing.tsx` (74–144: the card Reveal + the CTA button), `how-it-works.tsx`
  (51–70), `testimonials.tsx` (44–101: the eyebrow Reveal + the un-Reveal'd
  strip), `logo-cloud.tsx` (13–87), `features.tsx` (81–92), `cta.tsx`
  (12–36), `faq-view.tsx` (44–117), `legal-page-view.tsx`, `login/page.tsx`
  (35–58 the class consts, 134–171 the route style, 231–243 the avatar),
  `navbar.tsx`, `footer.tsx` (143), `globals.css` (55–175 the @theme + base).
- Existing pins audited for conflicts (rg over tests/e2e): no spec pins
  transition-duration, line-height, boxShadow, the chevron color, the logo
  anchor class, or entrance behavior. The mobile-navigation suite's
  resize test and the section-parity suite's class pins are unaffected by
  the Reveal rewrite (the cards KEEP their class strings — the rewrite
  removes the Reveal's ADDED classes only). The brand-parity font-chain and
  head-metadata suites untouched.
- v4 mechanics verified for the fixes: `shadow-sm` compiles to
  `box-shadow: … var(--shadow-sm)` (the @theme override is the emission
  point); `transition-colors` compiles to `transition-property:
  var(--transition-property-colors)`; `leading-*` sets `--tw-leading` which
  text utilities consume via `var(--tw-leading, var(--text-*--line-height))`
  — `--tw-leading: initial` (the guaranteed-invalid value) forces the
  fallback; the built CSS confirms all three chains.
- The `@property --tw-leading` registration (v4 registers it with
  `initial-value` empty) means the inline `initial` write is inherited-safe
  (it does not leak to children — custom properties set to `initial`
  compute to the guaranteed-invalid initial, and the elements' children
  don't consume it).

## 4. Execution order

R1 (the Reveal rewrite + param table + additions/removals, one RED batch)
→ R2 + R3 (the two @theme tokens, one RED batch) → R4 (the leading pins)
→ R5 (login focus) → R6 (chevron) → R7 (class cleanups) → R8 (petal names)
→ full gate → paired re-survey (word parity + the motion/leading/shadow/
focus re-probes + VLM spot checks on the hero and the features card) →
screenshots → docs (R9) → commit + SSH push.
