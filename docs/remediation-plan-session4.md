# Remediation Plan — Session 4 (2026-10-07)

**Scope:** Fix the issues, bugs and gaps found by the Session 4 parity audit
of this repository against the live reference (`saas-company.base44.app`),
executed TDD-first, gated by the full quality gate (§7.3 of the PAD), and
re-verified by a fresh paired survey.

**Audit method:** fresh DOM captures of every live route (agent-browser,
1440/900 + 390/844), word-level + heading/link difflib comparisons against
the clone, a **deep computed-style probe of 13 previously-unprobed surface
groups** (login card, head metadata, FAQ accordion states, pricing toggle
states, features tabs, hero video, footer form, 768px chrome, testimonials,
CTA), **scroll-state navbar probing** (first survey of the nav below the
fold — Sessions 1–3 only ever inspected the nav at scrollY 0), a live CSS
bundle diff (`/assets/index-BrYDoaSB.css` vs `/static/index-Dqfc36mx.css`),
VLM side-by-side scoring (4 pairs), and a full re-run of the 165-check gate
(all green on the inherited tree). Raw evidence:
`/home/z/my-project/session4-ref/` (outside the repo).

**Reference drift check:** the live site is UNCHANGED since the Session 3
survey — text similarity 1.0000 on all 8 routes, identical headings/links,
mobile-menu geometry byte-identical (panel 0,56,390×397; 7 rows @44px),
`/checkout` still SPA-404 (the clone's workspace remains the documented
superset D1). Every finding below is therefore a clone-side gap, not
reference drift.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | **The login route keeps the dark body theme; the live's /login swaps to a light theme.** The live's /login loads its OWN css bundle (`/static/index-Dqfc36mx.css`) whose `:root` defines `--background: 0 0% 100%`, `--foreground: 240 10% 3.9%` (zinc-950) and whose body renders the Tailwind default system font — measured: body bg `rgb(255,255,255)`, color `rgb(9,9,11)`, font `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji"…`. The clone's /login inherits the global dark body (bg `rgb(0,0,0)`, color white, Vend Sans). Consequences: (a) **typed input text renders WHITE on the light slate inputs — near-invisible (usability bug)**: the inputs set no text color and inherit through `text-card-foreground` (`--color-card-foreground: #ffffff`); (b) the whole card renders in Vend Sans instead of the system stack; (c) overscroll rubber-band shows black instead of white | `src/app/login/page.tsx`, `src/app/globals.css` | HIGH | Verified (computed styles both sides + live login bundle `:root` + `body{}` rules) | Visual + usability |
| F2 | **The pricing model is inverted vs the live.** The live's toggle defaults to **ANNUAL** on fresh load (the "Annual / Save 20%" pill carries `bg-white text-black`), with Pro **$39/mo annual** and **$49/mo monthly** (49→39 ≈ the advertised 20%). The clone defaults to Monthly with Pro $39 monthly / $31 annual — wrong default AND wrong base price (Session 1 read the $39 without checking which pill was active — the same "read the wrong state" class as Session 3's F1/F2). Additionally: (a) the live's caption is **`/month` in BOTH states** — the clone renders `/month, billed annually` in annual state; (b) the clone's Annual pill is 165px vs the live's 161px — the live's DOM is `Annual<span…>` (no whitespace node) while the clone's JSX emits `Annual\n<span…>` (trailing-space text run) | `src/lib/pricing.ts` (monthlyPrice 39), `src/components/sections/pricing.tsx` (useState "monthly", JSX whitespace), `src/lib/pricing.test.ts` (pins 39/31 + "billed annually" — all wrong vs the live) | HIGH | Verified (both toggle states driven on the live; pill widths + innerHTML captured) | Content + functional |
| F3 | **The navbar is not section-aware, and its scrolled state is an invention.** Measured on the live across scrollY 0→6000 (incl. real wheel scrolling): (a) the nav is **`bg-transparent` at every scroll position and direction** — it NEVER gains a background/blur/border; the clone's `scrolled>24px` state (`bg-black/80 backdrop-blur-xl border-b border-white/5`) does not exist on the live and is clearly visible over the white features section; (b) **scroll-spy**: the nav link of the current section gets a pill — `bg-white/30` (+ solid text) in dark mode, `bg-black/15` in light mode (observed: Features active at y≈3250–4150, Pricing at y≈4250–5826, Testimonials at y≈6000 — consistent with "last section whose top passed the ~2/3 viewport line; sections without a nav link keep the previous"); (c) **adaptive light/dark**: when the nav band (0–72px) overlaps the white features section (top 3323 / bottom 4179), the logo fill, link text (white/60→black/60), Log In (white/80→black/80) and the center pill (bg-white/10→bg-black/10) all swap to black variants; the Get Started pill stays white/black. The clone has none of this (always dark, never highlights). The scrolled-glass bar survived three sessions of VLM audits because full-page screenshots only ever draw the nav at the top, over the dark hero | `src/components/site/navbar.tsx`, `src/components/site/logo.tsx`, `src/components/sections/features.tsx` | HIGH | Verified (6-position scroll map + wheel-scroll re-test + boundary probes at y=3250/3310/4150/4190 + computed link/logo/pill colors) | Functional + visual |
| F4 | **The dashboard mockup's list dots render near-invisible, and the mockup carries invented animations.** The live's mockup contains ZERO animated elements (censused) — static tiles, static chart bars at the same percentages as the clone (42,64,45,80,55,70,90,60,75,85,50,95%), solid purple list dots (`w-2 h-2 rounded-full bg-primary/80` → `rgba(134,36,255,0.8)`). The clone: (a) adds `skeleton-wave` to the dots — the UNLAYERED `.skeleton-wave` background (white/4%→12% wave) OVERRIDES the layered `bg-primary/80` utility → the dots render as faint wave circles instead of solid purple; (b) adds a `grown` fade/height-in stagger (`transition-opacity duration-1000`, bars 4%→h%, `translateY(60px)`) that the live doesn't have; (c) carries a corrupted class `transition-eight]` in the bar class string | `src/components/sections/dashboard-preview.tsx` (L86 dots, `grown` mechanism, L72 bar classes), `src/app/globals.css` (L357 `.skeleton-wave`) | MEDIUM | Verified (live animation census empty; dot computed bg both sides; VLM flagged the dots) | Visual |
| F5 | **The FAQ accordion doesn't animate, and closed panels stay in the DOM.** The live uses the Radix/shadcn pattern: the panel carries `data-state` + `data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up` (`.2s ease-out` height keyframes against `--radix-accordion-content-height`), and **closed panels are UNMOUNTED** (absent from the DOM — the root cause of the long-standing FAQ word-parity 0.6052 artifact). The clone toggles the `hidden` attribute (snap open/close) and keeps all closed panels in the DOM. `globals.css` already contains an UNUSED `.accordion-panel` grid-rows class from Session 1 — never wired in | `src/components/site/faq-view.tsx`, `src/app/globals.css` (unused `.accordion-panel`) | MEDIUM | Verified (live panel classes + keyframes extracted from the live bundle; both states driven) | Interaction feel + DOM parity |
| F6 | **`apple-mobile-web-app-status-bar-style`** is `default` on the clone; the live emits `black` | `src/app/layout.tsx` (appleWebApp block) | LOW | Verified (head metas diffed) | Metadata |

Non-findings (checked, clean — dismissed with DOM evidence per the
"DOM beats VLM" rule):

- **Mobile navigation** (the operator's focus): geometry byte-identical to
  the live at 390×844 (panel 0,56,390×397; 7 rows @44px, exact hrefs/order),
  and the mobile hero offsets are identical (nav h56, h1 top 320, h1 h147).
  The VLM's "logo thicker / X thinner / gradient shift / spacing" flags were
  anti-aliasing, video-frame, and wrap misreads.
- **Get Started pill**: identical computed geometry at 768 and 1440 (the
  deep-probe's 138-vs-144 was font-load timing — re-measured identical).
- **"One Platform" mockup**: DOM byte-identical (chrome + title lines + 4
  blocks + h-20 block, same classes).
- **Chart bars**: identical source percentages on both sides; the VLM's
  "different heights" flag was the clone's grow-in animation captured
  mid-flight (fixed by F4).
- **"cutting 10+ vs 15+ hours"**: VLM misread — both DOMs read "15+".
- **Footer**: present on both sides (content-ratio-verified crops); the
  clone's full-page shot is 95px taller from accumulated sub-pixel rounding,
  not a missing section.
- **404 page**: byte-faithful (light wrapper over the black body on both
  sides — the live's 404 keeps the dark body too).
- **Hero video**: attrs/geometry/opacity identical (src differs by design —
  self-hosted).
- **Legal pages / FAQ / login / notfound word parity**: 1.0000 vs the live
  (FAQ 0.6052 = the F5 DOM artifact, not copy drift).
- **npm audit**: the same 5 accepted `braces`-chain highs
  (GHSA-vfj7-8cjw-p6xm, lint-toolchain-only, unpatchable upstream) —
  unchanged from Session 3; no new advisories.
- **Testimonials, CTA, footer form, features tabs (states + content), 768px
  chrome, head title/description/og chain**: probe-identical.

---

## 2. Remediation ToDo (executed in order, TDD)

### R1 — Login route body theme (F1)

1. **RED:** extend `tests/e2e/brand-parity.spec.ts` with a login-theme
   block: on `/login` the computed `body` background is `rgb(255, 255, 255)`,
   the computed body color is `rgb(9, 9, 11)`, the body font-family's FIRST
   face is `ui-sans-serif` (not "Vend Sans"), and the email input's computed
   color is `rgb(9, 9, 11)` (dark — visible typed text). On `/` the body
   stays black/white/"Vend Sans" (regression guard).
2. **GREEN:** in `src/app/login/page.tsx` render a route-scoped
   `<style>` (unmounts with the page, mirroring the live's per-route css
   bundle) that sets the light theme on `body` exactly as the live's login
   bundle renders it:
   `body{background-color:#fff;color:#09090b;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}`
   plus the light var overrides the card inherits through
   (`--color-card-foreground:#09090b;--color-foreground:#09090b;--color-background:#ffffff`
   on the body scope). The card's own classes stay byte-identical.
3. **VERIFY:** pins green; manual screenshot of /login with typed text
   (dark, visible); the other routes re-probed unchanged.

### R2 — Pricing model + toggle + caption + pill markup (F2)

1. **RED (unit, first):** rewrite the wrong pins in `src/lib/pricing.test.ts`
   to the live truth: Pro monthly **49**, annual **39**
   (`Math.round(49*(1-0.2))===39` — the advertised 20% holds), captions
   `$49`/`$39`, and `periodCaption` returns **`/month` for BOTH periods**.
   Observe the suite fail against the current `pricing.ts`.
2. **GREEN (domain):** `src/lib/pricing.ts` — `monthlyPrice: 49`;
   `periodCaption` returns `"/month"` always (drop the "billed annually"
   branch; the live never renders it).
3. **RED (e2e):** update `tests/e2e/pages.spec.ts` pricing block: on load
   (no click) the Annual pill is the active one (`bg-white` on Annual,
   Monthly inactive) and Pro shows **$39**; clicking Monthly shows **$49**;
   clicking Annual restores **$39**; `Save 20%` badge visible in all states;
   no "billed annually" text anywhere.
4. **GREEN (component):** `src/components/sections/pricing.tsx` —
   `useState<BillingPeriod>("annual")` (the live's default); restructure the
   Annual pill JSX so the text node carries no trailing whitespace
   (`{"Annual"}<span…>` — the live's `Annual<span>` innerHTML), closing the
   165→161px width delta.
5. **VERIFY:** unit + e2e green; pill width re-measured ≈161; smoke
   re-run (no pricing markers there).

### R3 — Section-aware navbar: kill the invented bar, add scroll-spy + adaptive theme (F3)

1. **RED:** new e2e block in `tests/e2e/landing.spec.ts` (or a dedicated
   `navbar-behavior.spec.ts`): (a) after `window.scrollTo(0, 3400)` (features
   in the nav band) the nav's computed background-color is
   `rgba(0, 0, 0, 0)` (never a bar); (b) the Features link has a non-transparent
   background while Pricing does not (scroll-spy); (c) after
   `window.scrollTo(0, 5200)` (pricing) the Pricing link is highlighted and
   Features is not; (d) at `scrollTo(0, 3400)` the logo svg's first path
   computes `rgb(0, 0, 0)` (currentColor black — light mode) and at
   `scrollTo(0, 0)` it computes `rgb(255, 255, 255)`.
2. **GREEN:** `src/components/site/navbar.tsx`:
   - remove the `scrolled` background entirely (nav stays `bg-transparent`
     always — delete the 24px listener or repurpose it);
   - add a rAF-throttled scroll listener computing two states:
     `activeId` — the last section (of `#features`, `#how-it-works`,
     `#pricing`, `#testimonials`) whose top has passed `scrollY +
     innerHeight*2/3` (matching all six observed states; sections without a
     nav link keep the previous highlight);
     `light` — true while the nav band (0–72px) overlaps any
     `[data-nav-theme="light"]` section;
   - link classes: dark `text-white/60 hover:text-white hover:bg-white/5` /
     active `text-white bg-white/30`; light `text-black/60 hover:text-black
     hover:bg-black/5` / active `text-black bg-black/15`;
   - center pill: `bg-white/10` ↔ `bg-black/10`; Log In: `text-white/80` ↔
     `text-black/80`; logo wrapper: `text-white` ↔ `text-black`
     (LogoWordmark already uses `currentColor`);
   - mark the features section with `data-nav-theme="light"`
     (`features.tsx`) — the only white section (its white comes from a
     background-image gradient, so bg-color probing can't detect it).
   - `prefers-reduced-motion` unaffected (class swaps only; the nav's
     existing `transition-colors` handles the fade).
3. **VERIFY:** pins green; manual scroll sweep both sites side-by-side;
  mobile menu unaffected (below md the pill/links are hidden — the mobile
  menu panel keeps its own measured bg-black/95 chrome); full e2e suite
  (the anchor-scroll spec is the risk surface — the spy must not fight
  Lenis).

### R4 — Static, correctly-colored dashboard mockup (F4)

1. **RED:** e2e pins in `landing.spec.ts`: every mockup list dot computes a
   background-color whose rgb is `(134, 36, 255)` at 0.8 alpha (accept rgba
   or oklab spelling per D6) — NOT the white wave; the mockup section
   contains zero elements with a running animation (`animation-name:
   none`) matching the live census; the chart bars' inline heights equal
   the measured percentages.
2. **GREEN:** `src/components/sections/dashboard-preview.tsx`:
   - dots: drop `skeleton-wave` (leave `w-2 h-2 rounded-full
     bg-primary/80`);
   - remove the `grown` mechanism: tiles/bars/list render statically at
     their final opacity/height (the section-level `Reveal` entrance —
     which the live DOES have — stays);
   - fix the corrupted `transition-eight]` class remnant.
   - keep `.skeleton-wave` in globals.css only if something else uses it
     (nothing does — remove the class + `wave-flow` keyframes).
3. **VERIFY:** pins green; screenshot the mockup — solid purple dots like
   the live.

### R5 — Animated, unmount-when-closed FAQ accordion (F5)

1. **RED:** e2e pins in `pages.spec.ts` FAQ block: opening a question gives
   the panel `data-state="open"` and the class set
   `data-[state=open]:animate-accordion-down`; the panel's height animates
   (assert the keyframes rule exists in the stylesheet and the panel
   references it); after closing, the answer text is ABSENT from the DOM
   (`toBeHidden` already tolerates unmounted; strengthen to
   `toHaveCount(0)` on the answer locator); FAQ word parity vs the live
   improves (the closed answers no longer pollute `outerHTML`).
2. **GREEN:** `src/components/site/faq-view.tsx` — replace the `hidden`
   toggle with the measured pattern: keep the panel mounted while
   `open || closing===i`, set `data-state` on the panel, apply the live's
   exact classes (`overflow-hidden text-sm data-[state=closed]:animate-accordion-up
   data-[state=open]:animate-accordion-down`), measure the panel height
   into `--radix-accordion-content-height` on open (ref callback), unmount
   200ms after close starts. Add the live's keyframes to globals.css:
   `@keyframes accordion-down{from{height:0}to{height:var(--radix-accordion-content-height)}}`
   + `accordion-up` (reverse) + the two `.data-[state=…]:animate-*` rules
   (copy the live's exact declarations). Delete the unused
   `.accordion-panel` grid-rows block.
3. **VERIFY:** pins green; word-parity re-run — FAQ similarity rises from
   0.6052 toward 1.0; the FAQ e2e (`accordion opens and closes`) still
   green; reduced-motion check (the global reduce rule collapses the
   animation — open/close still works).

### R6 — apple-mobile-web-app-status-bar-style (F6)

1. **RED:** extend the brand-parity head test: the head contains
   `apple-mobile-web-app-status-bar-style` with content `black`.
2. **GREEN:** `src/app/layout.tsx` — `appleWebApp: { title: SITE_NAME,
   statusBarStyle: "black" }`.
3. **VERIFY:** pin green.

### R7 — Full re-verification

1. Gate: `npm run lint` → `npm run typecheck` → `npm run test` →
   `npm run build` → `./scripts/smoke-test.sh` (38/38) → `npm run
   test:e2e` (all green, incl. the new pins).
2. Paired re-survey: word parity all pages (FAQ expected → ~1.0), mobile
   menu geometry, login computed theme, pricing states, navbar scroll map
   (0/1200/2400/3323/4500/6000 — logo fill, link colors, active pill, nav
   bg), mockup dots.
3. VLM re-run: full page + login + pricing + mobile menu (expect the F1/F2
   flags closed; ≥95 across the board).
4. `npm audit` — expect only the accepted braces chain.

### R8 — Docs, screenshots, handoff

- `docs/screenshots/` refreshed from the remediated build (pricing default
  state, login theme, mockup dots, navbar light mode all changed).
- Docs alignment: README (pricing description + feature table), PAD
  (§5.4 ledger rows D14–D18, test counts), AGENTS/CLAUDE notes (navbar
  behavior, login theme, pricing truth), `saas-company_SKILL.md` (§4, §12
  lessons: "survey the nav BELOW the fold", "read the toggle state that's
  ACTIVE", "unlayered custom CSS beats layered utilities").
- `.env.example` re-verified (no new env vars).
- Worklog + commit (`:bug: fix:` / `:memo: docs:` on `main` only) → SSH
  push via `docs/ssh_git_wrapper_v3.py` (runbook:
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

---

## 3. Validation of this plan against the codebase (pre-execution review)

| Plan reference | Codebase check | Result |
|----------------|----------------|--------|
| F1 login inheritance | `login/page.tsx` read: inputs carry no `text-*` color (inherit through `text-card-foreground` on the card div → `--color-card-foreground:#ffffff`); the live's login bundle `:root` + body rules extracted verbatim; no other route swaps body theme (live body probed on /, /faq, 404 — all dark) | Aligned |
| F2 pricing surface | `pricing.ts` (monthlyPrice 39), `pricing.tsx` (useState "monthly", `Annual\n<span>` JSX), `pricing.test.ts` (pins 39/31 + "billed annually"), `pages.spec.ts` pricing block (asserts $39 on load / $31 after Annual) — all located; PLANS is used ONLY by the pricing section (dashboard/API clean — grep verified) | Aligned |
| F3 navbar surface | `navbar.tsx` read: `scrolled` state at line 26/57 (the invention), no spy, no adaptive theme; `logo.tsx` uses `fill="currentColor"` (class swap suffices); `features.tsx` section located for the `data-nav-theme` attribute; no e2e pins the scrolled bar (grep clean) — only the mobile menu's `bg-black/95` panel is pinned (untouched) | Aligned |
| F4 mockup surface | `dashboard-preview.tsx` read: `skeleton-wave` on the dots (L86), `grown` state (L14, L46/47/58/72/83), `transition-eight]` remnant (L72); `.skeleton-wave` defined unlayered at globals.css L357 (beats layered utilities); live mockup animation census = empty; live dot = `bg-primary/80` no animation | Aligned |
| F5 accordion surface | `faq-view.tsx` read: `hidden={!isOpen}` snap (L64); live keyframes + panel/trigger/wrapper classes extracted verbatim; `.accordion-panel` unused in globals.css (grep: only definition); FAQ e2e uses `toBeHidden()` (unmount-tolerant) | Aligned |
| F6 metadata | `layout.tsx` appleWebApp block read (title only); live head captured (`black`) | Aligned |
| Test-pin safety | brand-parity suite: 13 checks, none touch pricing/navbar/accordion/login-theme (grep verified); mobile-navigation suite: geometry-only pins unaffected; the anchor-scroll spec polls `scrollY` with a 5s timeout (spy-compatible) | Aligned |
| skills/ exclusion | tsconfig `exclude`, eslint `ignores`, vitest `include`, Next `src/` scoping — all still exclude `skills/` (re-verified this session) | Aligned |

**Risk assessment:** R1 is a route-scoped style tag (no global CSS changes —
the dark routes are regression-guarded by the same RED spec). R2 is
domain-pure + two-component. R3 is the only behavioral surface with
coupling risk (spy × Lenis × anchor-scroll spec) — mitigated by the full
e2e suite and the manual scroll sweep. R4 deletes dead animation code. R5
is the only timing-sensitive change (200ms unmount) — guarded by the
strengthened e2e pin. R6 is inert metadata. No schema, API, auth, or
dependency changes. Rollback = revert the commit (single push).

**Execution order rationale:** the two HIGH user-visible bugs first (R1
login usability, R2 pricing truth), then the navbar behavior (R3), then
the visual statics (R4), then the interaction feel (R5), the inert
metadata (R6), and the single verification + handoff pass (R7–R8). Every
RED is observed failing before its GREEN.
