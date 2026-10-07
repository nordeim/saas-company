# Remediation Plan — Session 6 (2026-10-07)

**Scope:** Fix the issues, bugs and gaps found by the Session 6 parity audit
of this repository against the live reference (`saas-company.base44.app`),
executed TDD-first, gated by the full quality gate (§7.3 of the PAD), and
re-verified by a fresh paired survey.

**Audit method:** fresh paired captures of every live route (text similarity
1.0000 on all 8 routes vs the Session-5 ground truth: the **reference is
UNCHANGED** — word parity, section offsets, pills, cards, strip metrics all
re-confirmed exact). The Session-6 NEW audit surface was the **class-string
layer**: a systematic full-DOM skeleton diff (tag + class + key attrs, both
sides, 1440×900) that no prior session ran, plus **real-pointer interaction
probes in Playwright** (hover states with true mouse events — an
agent-browser `mouse move` probe produced a FALSE hover failure that
Playwright disproved; lesson below), a **per-route `<head>` metadata map**
(titles, descriptions, og:*, twitter:*, canonical, manifest, icons), the
**mobile burger's real clickability at 390**, and a reduced-motion pass.
Every hover/color conclusion was settled with computed styles, not VLM
impressions.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | **Testimonial avatar gradients are uniform on the clone.** The live cycles FOUR per-person gradient combos, keyed to the card (measured computed `backgroundImage` on the live's strip, in card order): SC = `from-violet to-purple-600` (rgb(213,0,255)→rgb(147,51,234)), MR = `from-electric-blue to-blue-600` (rgb(0,85,255)→rgb(37,99,235)), EW = `from-purple-500 to-violet` (rgb(168,85,247)→rgb(213,0,255)), DP = `from-blue-500 to-electric-blue` (rgb(59,130,246)→rgb(0,85,255)); the duplicated cards 5–8 repeat the same per-person gradients. The clone hardcodes `from-violet to-purple-600` on EVERY card — three of the four people wear the wrong colors (two of them blue-family on the live) | `src/components/sections/testimonials.tsx:75` | HIGH | Verified (computed gradients, both sides, in strip order) | Visual |
| F2 | **The Enterprise "Custom" price renders at the wrong size and structure.** LIVE: a plain `div.font-heading.text-3xl.font-bold.text-white` → 30px / 36px tall, direct child of the `mb-8` block (no flex wrapper, no baseline span). CLONE: reuses the numeric-price markup — `div.flex.items-baseline.gap-1 > span.font-heading.text-5xl` → 48px / 48px tall. The "Custom" label is ~1.6× too large | `src/components/sections/pricing.tsx:105–112` | HIGH | Verified (computed fontSize 30 vs 48; heights 36 vs 48; both cards 540 tall) | Visual + structure |
| F3 | **The testimonial strip's edge fades are direction-swapped.** LIVE left fade = `bg-gradient-to-r from-black to-transparent` (black AT the left edge, fading inward) and right = `bg-gradient-to-l …`. CLONE: left = `bg-gradient-to-l`, right = `bg-gradient-to-r` — both inverted: no darkening at the actual edges, a hard black cut 64–128px INSIDE the strip (visible whenever cards slide under the fades). Probably a Session-5 full-bleed refactor slip | `src/components/sections/testimonials.tsx:54–55` | HIGH | Verified (computed backgroundImage direction, both fades, both sides) | Visual |
| F4 | **The One-Platform AI-suggestion paragraph renders at 50% white; the live renders FULL white.** The live's own class string carries a broken/inert token — `text-sl(var(--foreground))]` (a typo'd arbitrary value that never compiles) — so the paragraph INHERITS white (computed `rgb(255,255,255)`). The clone ships `text-white/50` (computed white at 50% alpha). Rendered truth wins: full white | `src/components/sections/problem.tsx:157` | MEDIUM | Verified (computed color both sides) | Visual |
| F5 | **Per-route `<head>` metadata pattern missing.** The live emits, on every content route: `og:title`/`twitter:title` = the page title; `description`/`og:description`/`twitter:description` = `"{Page} on SAAS Company. {default description}"` (faq/privacy/terms/accessibility/refund-policy only — `/` and `/login` keep the default description); `og:url` = `twitter:url` = `canonical` = the page URL. The clone ships static root og:title ("SAAS Company" everywhere), the default description everywhere, and NO og:url / twitter:url / canonical at all. Additionally: the live links a **web app manifest** (Base44 PWA — name/short_name/icons/start_url/display/theme #000000/bg #ffffff) and declares `og:image`/`twitter:image` (a 1200×630 render of the four-petal mark) — the image URL 404s on the live (dead media object), so a WORKING self-hosted og image + manifest are supersets. The clone also ships two meta tags the live does NOT have: `theme-color #000000` and `viewport-fit=cover` | `src/app/layout.tsx` (root metadata + viewport), `src/app/{faq,privacy,terms,accessibility,refund-policy,dashboard}/page.tsx` (per-page metadata), new `public/og-image.png` + `public/manifest.json` | MEDIUM | Verified (per-route head map of all 8 live routes vs the clone's) | SEO/social + functional superset |
| F6 | **The `<body>` element carries classes and an antialiased rule the live does not have.** LIVE: `<body>` has NO class attribute at all (its stylesheet sets `body{background-color:hsl(var(--background));color:hsl(var(--foreground));font-family:var(--font-body)}`) and computes `-webkit-font-smoothing: auto`. CLONE: `<body class="min-h-screen bg-black text-white antialiased font-body overflow-x-hidden">` + a base-layer `-webkit-font-smoothing: antialiased` declaration — Safari renders the clone's text thinner than the live's. The clone's base-layer body rule already covers bg/color/font, so the classes are redundant EXCEPT they change smoothing | `src/app/layout.tsx:67`, `src/app/globals.css` (base layer body rule) | LOW | Verified (computed webkitFontSmoothing `auto` vs `antialiased`; body className both sides) | Visual (subtle, Safari) |
| F7 | **Three invented/dead class-string extras** (rendering-identical, DOM-parity cleanup): the nav pill's inner text span carries an invented `group-hover:text-black` (live: plain `relative z-10 text-black`); the burger button carries an invented `transition-colors` (live: instant hover color change); the dashboard mockup link contains a dead empty `<span class="absolute inset-0 rounded-2xl" aria-hidden="true" />` the live does not have | `src/components/site/navbar.tsx`, `src/components/sections/problem.tsx:113` | LOW | Verified (DOM skeleton diff) | DOM parity |

### Live-side bugs found (no clone change — document as supersets/deviations)

| # | Live bug | Evidence | Clone behavior |
|---|----------|----------|----------------|
| L1 | **The live's mobile menu is UNOPENABLE by a real tap at 390.** The live mounts two empty toast portals (`div.fixed.top-0.z-[100].flex.max-h-screen.w-full…p-4`, 390×32, `pointer-events: auto`) that span the full viewport width over the nav's top strip — the burger (y-center 28 < 32) is pointer-blocked: a real Playwright click opens NOTHING (only a JS `.click()` opens it). The clone's burger works and opens the byte-identical panel (0,56 390×397, 7 rows @44px, same hrefs, black/95 + blur(24px)) | Real-click + js-click probes, both sides, at 390×844 | Keep the working burger — the intended UX (D21-class documented superset) |
| L2 | **The live's `og:image`/`twitter:image` URL is dead** (HTTP 404 `storage: object doesn't exist` — a 1200×630 fill transform of the four-petal mark) | curl of the exact meta URL | Ship a WORKING self-hosted 1200×630 og image (D7-class asset relocation + superset) |
| L3 | **The live ships a broken inert class** `text-sl(var(--foreground))]` on the AI-suggestion paragraph | DOM class string + computed color (inherits white) | Match the RENDERED truth (F4) — the same "inert class" class of finding as the S5 Pro-card scale |

### Non-findings (checked, clean — dismissed with computed-style evidence)

- **Get Started pill hover** — full parity: the shimmer overlay reaches
  `opacity: 1` with the exact pastel gradient + `gradientShift` 6s animation,
  the anchor's `hover:text-white` fires, the inner text stays black, and the
  arrow slides exactly 2px (the live via v3 `transform: matrix(1,0,0,1,2,0)`,
  the clone via v4's `translate: 2px` — rendering-identical, engine artifact
  like D6). An initial agent-browser `mouse move` probe reported a FALSE
  hover failure (the `:hover` state matched but utilities never applied);
  Playwright real mouse events disproved it — **hover-state probes must use
  real pointer events**.
- **Other gradient circles** (hero/how-it-works icons): computed gradients
  identical (violet/80→electric-blue/60 etc.) — only the testimonial avatars
  diverge (F1).
- **Footer logo animation**: the live's `anim-flogo-*` keyframes are
  BYTE-IDENTICAL to its `anim-logo-*` set (translateY ±12.84px, same stops)
  — a name-only duplication; the clone's reuse renders identically.
- **CTA h2 tracking**: class strings differ (`tracking-tight` live vs
  `tracking-normal` clone) but computed letter-spacing is IDENTICAL.
- **Video element**: the live omits the `muted` ATTRIBUTE but its `muted`
  PROPERTY is true (JS-set) — behavior identical to the clone's attribute.
- **390 geometry**: pricing cards 342px @ x=24 (all three), hero h1
  44px/−0.88px, strip first-card x=0 + scrollWidth 2408 — all exact.
- **Mobile menu open-state**: byte-identical (panel geometry, 7 rows @44px,
  hrefs, order, bg black/95, blur 24px) once opened.
- **Anchor/CTA inventory** (href/rel/target on every `<a>`, plus every
  button's aria attrs): identical except D1 (`/checkout`→`/dashboard`
  superset) and D22 (aria supersets).
- **lucide icon markup** (`<path>` vs `<line>/<rect>/<polyline>`):
  lucide-react version artifact, rendering-identical.
- **Reveal entrance classes at rest**: the clone's
  `transition-all duration-700 …` wrappers are the S1 implementation
  vehicle; rendered identical at rest on both sides.
- **Reduced motion**: both sides keep the logo petal animation running
  under `prefers-reduced-motion` (15 vs 17 animated elements — comparable);
  the clone's collapse of the rest matches its documented S1 design.
- **Post-login chrome on the live** (operator credentials): unchanged —
  lands on `/`, nav still shows Log In + Get Started, "Dashboard" mockup
  link still points at the SPA-404 `/checkout`. The D1 superset
  documentation remains valid.

---

## 2. Remediation (TDD — every pin observed RED before its GREEN)

### R1 — Testimonial avatar gradients (F1)

- Add a `gradient` class field to each entry in `TESTIMONIALS`
  (`from-violet to-purple-600` / `from-electric-blue to-blue-600` /
  `from-purple-500 to-violet` / `from-blue-500 to-electric-blue` — the
  live's exact class strings in card order), and render it on the avatar
  circle. The `cards = [...TESTIMONIALS, ...TESTIMONIALS]` duplication then
  repeats each person's gradient exactly like the live.
- **RED first**: a new e2e block asserting each of the first four avatar
  circles' computed `backgroundImage` matches its expected gradient
  (accepting both rgba and oklab serializations per D6) and that cards 5–8
  repeat them.

### R2 — Enterprise "Custom" price (F2)

- In `pricing.tsx`, the `price === null` branch renders the live's exact
  structure: `<div className="font-heading text-3xl font-bold text-white">Custom</div>`
  as a direct child of the `mb-8` block (no flex wrapper, no baseline span,
  no caption). Numeric plans keep the current (already-parity) structure.
- **RED first**: an e2e check that the Enterprise card's "Custom" element
  is a `DIV` at `font-size: 30px` with height 36 (±2px tolerance for
  sub-pixel line-height differences).

### R3 — Testimonial edge fades (F3)

- Swap the directions: left fade → `bg-gradient-to-r from-black to-transparent`,
  right fade → `bg-gradient-to-l from-black to-transparent` (the live's
  exact strings; keep the clone's `pointer-events-none` UX superset).
- **RED first**: an e2e check that the left fade's computed gradient
  direction ends in `to right` (black at the viewport's left edge) and the
  right fade's in `to left`.

### R4 — AI-suggestion paragraph color (F4)

- Drop `text-white/50` from the paragraph so it inherits white like the
  live's inert-class render. Keep every other class verbatim.
- **RED first**: an e2e check that the paragraph's computed color is
  `rgb(255, 255, 255)`.

### R5 — Per-route head metadata + og image + manifest (F5)

- New pure helper `src/lib/seo.ts`: `pageDescription(page: string)` →
  `` `${page} on SAAS Company. ${DEFAULT_DESCRIPTION}` `` (the live's exact
  template), with a unit spec (RED first) pinning the five page names and
  the passthrough for the default.
- Root layout `metadata`: add `alternates: { canonical: "./" }`,
  `openGraph.url: "./"`, `openGraph.images` + `twitter.images` →
  `/og-image.png`, and `manifest: "/manifest.json"`.
- Per-page metadata (faq/privacy/terms/accessibility/refund-policy):
  `description: pageDescription("FAQ")` etc. + `alternates.canonical` +
  `openGraph` carrying the per-page title/description/url (mirroring the
  live's per-route og:title). `/login` and the 404 keep the DEFAULT
  description but still get og:url/canonical per route (the live's pattern).
- New `public/og-image.png` — a 1200×630 brand card (black canvas, the
  four-petal mark), generated once and committed (the live's own og image
  URL is dead — L2 — so a working asset is the superset).
- New `public/manifest.json` — the live's values, self-hosted: name/short
  name "SAAS Company", the default description, the favicon.svg as both
  icon sizes (192/512, svg), `start_url: "/"`, `display: "standalone"`,
  `theme_color: "#000000"`, `background_color: "#ffffff"`.
- Viewport parity: drop `viewportFit: "cover"` and `themeColor: "#000000"`
  from the `viewport` export (the live ships neither).
- `twitter:url` is NOT expressible through Next's metadata API — document
  as an accepted engine deviation (og:url carries the same information for
  every real scraper).
- **RED first**: a new `tests/e2e/head-metadata.spec.ts` pinning, per route:
  title, description/og:description (the "X on SAAS Company." pattern where
  applicable), og:title, og:url, canonical, the og/twitter image pair, the
  manifest link, and the ABSENCE of theme-color + viewport-fit.

### R6 — Body parity (F6)

- Remove the `className` from `<body>` (the base-layer rule already sets
  bg/color/font; `min-h-screen`/`overflow-x-hidden` live on the wrapper div
  exactly like the live's DOM).
- Delete `-webkit-font-smoothing: antialiased;` from the base-layer body
  rule (the live computes `auto`).
- **RED first**: e2e checks `document.body.className === ""` and
  `webkitFontSmoothing === "auto"`.

### R7 — Class-string cleanups (F7)

- Remove the invented `group-hover:text-black` from the nav pill's inner
  span; remove the invented `transition-colors` from the burger button;
  remove the dead overlay span from the dashboard mockup link.
- **RED first**: e2e class-list assertions on the three elements (exact
  class strings, the live's verbatim).

### R8 — Documentation alignment

- PAD: revision block, §5.4 ledger (D26 avatar gradients → Parity, D27
  Custom price → Parity, D28 edge fades → Parity, D29 AI-suggestion color
  → Parity (the live's inert-class rendered truth), D30 head metadata
  superset (og:image working, manifest, per-route pattern; twitter:url
  engine deviation), D31 body parity, D32 the live's pointer-blocked burger
  → the clone keeps the working burger (L1 superset)), §7 test counts.
- AGENTS.md: gotcha — "hover-state probes need real pointer events
  (agent-browser `mouse move` can report stale state)" + head-pattern note.
- CLAUDE.md: session-6 context block.
- README: features table (og image + manifest), test counts, head parity.
- `saas-company_SKILL.md`: lessons 20–21 (class-string-layer diffing finds
  what computed-style-only surveys miss; real-pointer events for hover
  probes).
- `worklog.md` + this plan; screenshots refresh; `.env.example` re-verified
  (no new env vars — all fixes are code/assets).

---

## 3. Pre-execution codebase validation (done before writing this plan)

- Baseline gate on the inherited tree: ALL GREEN — lint ✓ typecheck ✓
  Vitest 73/73 ✓ build ✓ smoke 38/38 ✓ Playwright 81/81 ✓ (192 checks).
- `.env` `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root ✓;
  `.env.example` tracked and in sync ✓; all four configs exclude `skills/` ✓.
- All fix sites located and read: `testimonials.tsx` (avatar line 75, fades
  54–55), `pricing.tsx` (105–112), `problem.tsx` (113, 157), `layout.tsx`
  (metadata 30–52, viewport 55–60, body 67), globals.css base layer,
  per-page metadata files (`faq`, `privacy`, `terms`, `accessibility`,
  `refund-policy`, `dashboard` all export `metadata`).
- Existing pins audited for conflicts: the only "Custom" pin
  (`pages.spec.ts:110`) asserts visibility only — compatible with R2.
  No existing spec pins avatars, fades, the AI-suggestion color, head
  metadata, body classes, or the three F7 elements.

## 4. Execution order

R1 → R2 → R3 → R4 (visual fixes, one RED batch) → R5 (head/SEO) → R6 → R7
(class parity) → full gate → paired re-survey (word parity + the new pins'
metrics + VLM spot checks) → screenshots → docs (R8) → commit + SSH push.
