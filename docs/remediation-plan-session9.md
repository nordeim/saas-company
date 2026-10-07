# Remediation Plan — Session 9 (2026-10-07)

**Scope:** Fix the issues, bugs and gaps found by the Session 9 parity audit
of this repository against the live reference (`saas-company.base44.app`),
executed TDD-first, gated by the full quality gate (§7.3 of the PAD), and
re-verified by a fresh paired survey.

**Audit method:** fresh paired captures (word parity 1.0000 on all 8 routes —
the **reference is UNCHANGED** since Session 8). The Session-9 NEW audit
surfaces — layers no prior session systematically surveyed:

1. **The interactive-state matrix** (default/hover/active computed styles of
   every visible interactive element + a keyboard focus-visible walk on `/`
   and `/login`) — the survey that found this session's headline bug family:
   the default-palette drift (F1) and the Sign in ring (F2).
2. **The rendered palette** (every default-palette color the app uses,
   converted to sRGB and compared against the live's v3-era hex values).
3. **The browser-chrome styling layer** (::selection rules in the CSSOM,
   scrollbar styling, cursors, tap-highlight, color-scheme, touch-action,
   overscroll-behavior — per route).
4. **The form-control & media attribute inventory** (every input/button/form/
   video attribute, both sides).
5. **The ARIA snapshot tree** (Playwright `ariaSnapshot()` of `/` and
   `/login` — the structured accessibility tree, never surveyed).
6. **The `:root` custom-property inventory** (every CSS variable defined at
   root scope, name- and value-diffed, per route).
7. **The mobile navigation paired re-verification** (the standing operator
   ask — real-tap open on the clone vs JS-click on the live, panel geometry,
   rows, hrefs, classes, transitions, scroll-lock, Escape/X/navigate close,
   and the resize-across-768 guard).
8. **The HTTP header inventory** (the live's response headers vs the
   standalone server's — the production-readiness layer).

Every conclusion below was settled with computed styles, canvas-normalized
color reads, oklch→sRGB conversion math, CSSOM rule extraction, or ARIA
tree diffs — never VLM impressions.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | **Tailwind v4's default palette is oklch-defined — the roundtrip renders up to 69 RGB units off the live's v3-era hex.** The live's compiled css carries the v3 hex values; v4's `theme.css` carries oklch approximations. Measured drift on the colors this app uses (v4→sRGB vs v3 hex): green-400 rgb(5,223,114) vs #4ade80 (**−69 R**), green-500 rgb(0,201,80) vs #22c55e (−34 R), red-500 rgb(251,44,54) vs #ef4444 (+12/−24/−14), red-700 rgb(193,0,7) vs #b91c1c (+8/−28/−21), purple-600 rgb(152,16,250) vs #9333ea (+5/−35/+16), blue-600 rgb(21,93,252) vs #2563eb (−16/−6/+17), amber-400 (+4/−6/−36), yellow-400 rgb(253,199,0) vs #facc15 (+3/−5/−21), orange-500 (+6/−10/−22), slate-400 (−4/−2/+1), slate-500/600/700/800/900 (−2…+3 per channel, e.g. slate-700 rgb(49,65,88) vs #334155 — live-verified), gray-300/600/700/800/900 (−1…+2), red-200, green-200/600/700, yellow-500, amber-500, blue-500, purple-500, slate-300. **Rendered evidence (paired probes):** the problem cards' `bg-red-500` solid chip renders lab(55.48,75.07,48.85)≈rgb(251,44,54) on the clone vs rgb(239,68,68) on the live; the stars' `fill-yellow-400` renders lab(83.27,8.65,106.9)≈rgb(253,199,0) vs rgb(250,204,21); the features tab's `text-gray-600` renders lab(35.63,−1.59,−10.84)≈rgb(74,85,101) vs rgb(75,85,99); the login Google button's `text-slate-700` renders rgb(49,65,88) vs rgb(51,65,85) (the outline-color diff proves it: live rgb(51,65,85) vs clone rgb(49,65,88) — EXACTLY the computed v4 value). 30 tokens affected across slate/gray/red/green/yellow/amber/orange/blue/purple — including the testimonial avatar gradient endpoints (purple-500/600, blue-500/600) and every slate on /login | `src/app/globals.css` `@theme` — pin all 30 drifted tokens to the v3 hex values | HIGH | Verified (paired computed colors; oklch→sRGB conversion math cross-checked against the live's measured rgb; the live's own css emits v3 hex) | Visual (engine palette — the tracking/shadow/leading family, one level deeper) |
| F2 | **The login Sign in button's keyboard ring renders WHITE, not the live's slate-950 — Session 8's R5 fix is incomplete.** The live's keyboard-focused Sign in renders boxShadow `rgb(255,255,255) 0 0 0 2px, rgb(9,9,11) 0 0 0 4px, shadow-sm` (ring-offset white + ring-ring slate-950 + shadow). The clone renders `…rgb(255,255,255) 0 0 0 2px, rgb(255,255,255) 0 0 0 4px, shadow-sm` — the ring renders currentColor (the button's white text). Root cause: Session 8 defined the LEGACY variable `:root { --ring: 240 10% 3.9% }` in the login route style, but **v4's `ring-ring` utility emits `--tw-ring-color: var(--color-ring)`** — and `--color-ring` is not in `@theme`, so the utility is NEVER EMITTED (the `focus-visible:ring-ring` class is inert) and `focus-visible:ring-2` falls back to currentColor. The motion-parity spec pinned the class string and the `--ring` variable value — both pass — but never the rendered ring (a spec gap; the Session-4 logo-pin lesson repeated) | `globals.css` `@theme`: `--color-ring: hsl(240 10% 3.9%);` (the emission path; keep the route-style `--ring` for the live's variable parity) + the spec now pins the RENDERED ring | HIGH | Verified (keyboard Tab walk both sides, element screenshots, the v4 emission chain) | Visual (focus chrome) + spec correction |
| F3 | **The clone's violet `::selection` rule is an INVENTION.** The clone's base layer ships `::selection { background: rgb(213 0 255 / 0.35); color: #fff }`. The live's SPA css ships **no ::selection rule at all** (CSSOM grep: zero matches on `/`) — its selection renders the platform default; its login bundle ships only unused `.selection:*` variant utilities (no element carries them). Selecting text on the clone paints violet; on the live, the browser default | `globals.css`: delete the `::selection` block | MEDIUM | Verified (CSSOM ::selection rule inventory, both bundles) | Visual (invention) |
| F4 | **The live's /login sets `html { overscroll-behavior-y: none }`; the clone's is auto.** Measured: live /login html=none (landing=auto — it is a login-bundle rule, not app-wide); clone auto on every route. The property suppresses pull-to-refresh/scroll-bounce chaining on the auth route | `src/app/login/page.tsx` route `<style>`: `html { overscroll-behavior-y: none; }` | MEDIUM | Verified (computed overscrollBehaviorY, html vs body, both routes both sides) | Behavioral (route-scoped) |
| F5 | **The live's login bundle ships a light `--border`; the clone's login inherits the dark `#242424`.** The live's login: borderless elements (Sign in / Forgot password? / Need an account?) compute borderColor rgb(229,231,235) (gray-200 — its bundle's `--border: 220 13% 91%`); the clone's compute rgb(36,36,36) (the dark `--color-border`). INERT today (every affected element has border-width 0 — nothing paints) but the computed matrix diverges | `login/page.tsx` route `<style>`: `body { --color-border: #e5e7eb; }` (the live's login-bundle value; documented as inert) | LOW | Verified (computed borderColor + borderWidth both sides) | Computed parity (inert) |
| F6 | **The live ships four security headers the standalone server does not.** `curl -I` both: the live (Base44/Cloudflare) sends `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy: strict-origin-when-cross-origin`, `strict-transport-security: max-age=31536000`; the clone sends none of them. Production parity + hardening | `next.config.ts` `headers()` + smoke-test pins | MEDIUM | Verified (curl -I both sides) | Production parity |
| F7 | **Undocumented a11y supersets (docs-only).** The ARIA snapshot tree (never previously surveyed) shows the clone ships: `navigation "Main navigation"` (aria-label), the logo link `aria-label="NovaAI home"` + the svg's `img "NovaAI"` (navbar + dashboard), a `<main>` landmark (the live has none — its own axe "103 landmark-less nodes" noise), `aria-hidden` on every decorative icon (the live exposes them as unnamed `img` noise), `aria-pressed` on the features tab buttons, `aria-label="Email address"`/`"Subscribe"` on the newsletter input/button, and the Next.js `<NEXT-ROUTE-ANNOUNCER>` (role=alert route announcer — a framework a11y feature the live's Vite SPA lacks). All are D22/D38-class a11y supersets — none is in the ledger | PAD §5.4 ledger rows | DOCS | Verified (ariaSnapshot diff both routes) | Superset (document) |
| F8 | **Live-side observations (no clone change — document).** (a) The live's /login ships a `region "Notifications alt+T"` (the Base44 toast portal — the same empty infrastructure whose overlay pointer-blocks its burger, D32) as a11y noise; (b) the live's mobile menu does NOT close on Escape (the clone's Escape-close is a superset — the clone also locks scroll D39, scrolls on row-click D21, and carries aria-expanded/label D22); (c) the live's login css defines `--ease-out: cubic-bezier(.16,1,.3,1)` (≠ v4's default) and px-spelled `--radius-*` — both INERT (no consumer on the page; the clone's rem spellings render identical values); (d) v4's shadow composition emits two extra TRANSPARENT box-shadow layers (6 vs the live's 4 computed slots) — rendering-identical (transparent paints nothing), D6-class; (e) the live's login bundle ships a full `::-webkit-scrollbar` design-system suite (12px, ds thumb colors) — dead weight: the login page never overflows at any tested viewport | PAD §5.4 ledger + §5.5 notes | DOCS | Verified (ARIA trees; Escape probe; CSSOM var/rule inventories; computed boxShadow strings) | Live-side / engine notes |

### Non-findings (checked, clean — dismissed with evidence)

- **Word parity 1.0000 on all 8 routes** (reference unchanged since Session 8).
- **The mobile navigation panel is byte-identical**: `px-6 py-4 flex flex-col
  gap-2` at 0,56 390×396, six rows all 44px (Features #features, How It Works
  #how-it-works, Pricing #pricing, Testimonials #testimonials, FAQ /faq, Get
  Started #pricing); the burger identical (class, 342,16 24×24, pointer, no
  transition classes on either side — no Tailwind v4 trap); the resize guard
  closes the clone's menu across 768 (both sides end overflow-visible, no
  open panel); real-tap open works on the clone (the live's tap remains
  blocked by its toast portal, D32).
- **The interactive-state matrix (landing)**: every probed default/hover/active
  state matches except the F1 palette spellings/values and the F8d transparent
  shadow-layer counts. The keyboard focus walk (25 stops) matches everywhere
  (violet/50 outlines, matched rings) except the login items below.
- **The hero video attributes**: autoplay/loop/muted/playsInline, preload
  metadata, no poster, no controls, object-fit cover, 1920×1080 — identical.
- **Forms and buttons**: method/action/novalidate and every button type —
  identical (all `submit` on the landing, the same submit/button split on
  /login).
- **Browser chrome**: color-scheme `normal` both sides (neither pins `dark`),
  tap-highlight transparent, touch-action auto, body/link/button cursors,
  the strip's `[scrollbar-width:none]` + `[&::-webkit-scrollbar]:hidden`
  utilities — all matched. No page-scrollbar styling on either landing.
- **The `:root` variable inventory**: 0 value diffs on `/`; on `/login` only
  the F8c inert/spelling entries.
- **The login ARIA tree** matches modulo the F7 superset family and F8a.
- **The dashboard mockup's `from-primary/80 to-accent/60` dots** (custom
  tokens): rendering-matched — the custom brand tokens were never affected by
  F1; only the DEFAULT palette drifted.

---

## 2. Remediation (TDD — every pin observed RED before its GREEN)

### R1 — The v3 palette pins (F1)

`globals.css` `@theme` gains the 30 v3 hex values (the live's own compiled
values; only the DRIFTED, USED tokens — the exact matches stay v4):

```css
/* The live's compiled css carries Tailwind v3's hex palette; v4's defaults
   are oklch approximations that roundtrip to different sRGB values (up to
   69 units — green-400). Pin every drifted token this app uses to the v3
   hex (Session 9 F1; the drift table lives in this plan). */
--color-slate-300: #cbd5e1;  --color-slate-400: #94a3b8;
--color-slate-500: #64748b;  --color-slate-600: #475569;
--color-slate-700: #334155;  --color-slate-800: #1e293b;
--color-slate-900: #0f172a;
--color-gray-300: #d1d5db;   --color-gray-600: #4b5563;
--color-gray-700: #374151;   --color-gray-800: #1f2937;
--color-gray-900: #111827;
--color-red-200: #fecaca;    --color-red-400: #f87171;
--color-red-500: #ef4444;    --color-red-700: #b91c1c;
--color-green-200: #bbf7d0;  --color-green-400: #4ade80;
--color-green-500: #22c55e;  --color-green-600: #16a34a;
--color-green-700: #15803d;
--color-yellow-400: #facc15; --color-yellow-500: #eab308;
--color-amber-400: #fbbf24;  --color-amber-500: #f59e0b;
--color-orange-500: #f97316;
--color-blue-500: #3b82f6;   --color-blue-600: #2563eb;
--color-purple-500: #a855f7; --color-purple-600: #9333ea;
```

- **RED first** (`tests/e2e/palette-parity.spec.ts`, ~9 checks): the problem
  card's solid `bg-red-500` chip computes `rgb(239, 68, 68)`; the stars'
  `fill-yellow-400` computes `rgb(250, 204, 21)`; the features tab's
  `text-gray-600` computes `rgb(75, 85, 99)`; the features card's
  `bg-green-500` computes `rgb(34, 197, 94)`; the avatar gradient's
  to-purple-600 endpoint computes `rgb(147, 51, 234)` (strip-scoped); the
  login Google text `rgb(51, 65, 85)` + border `rgb(226, 232, 240)`; the
  Sign in bg `rgb(15, 23, 42)`; the focused input's ring
  `rgb(148, 163, 184)` (slate-400 — also fixed by the pin).

### R2 — The ring emission path (F2)

- `globals.css` `@theme`: `--color-ring: hsl(240 10% 3.9%);` (the live's
  login-bundle value — v4's `ring-ring` reads this token; the legacy
  `--ring` route pin from Session 8 stays for variable parity).
- **RED first**: the keyboard-focused Sign in's computed boxShadow contains
  `rgb(9, 9, 11) 0px 0px 0px 4px` (the slate-950 ring) — not the white
  fallback; the ring renders on the alternate-state submit buttons too.

### R3 — Remove the invented ::selection (F3)

- Delete the `::selection` block from globals.css (the live ships none).
- **RED first**: a sampled element's computed `::selection` background is
  `rgba(0, 0, 0, 0)` (no rule — the platform default), both routes.

### R4 — The login overscroll pin (F4)

- `login/page.tsx` route `<style>`: `html { overscroll-behavior-y: none; }`
  (login-scoped like the live's login bundle; the landing stays auto).
- **RED first**: `/login` html `overscrollBehaviorY` = `none`; `/` = `auto`.

### R5 — The login border token (F5)

- `login/page.tsx` route `<style>`: `body { --color-border: #e5e7eb; }` —
  the live's login-bundle `--border` (gray-200). Inert (width-0 borders)
  but restores the computed matrix.
- **RED first**: the Sign in's computed borderColor = `rgb(229, 231, 235)`.

### R6 — The security headers (F6)

- `next.config.ts`: `headers()` on `/:path*` — `X-Content-Type-Options:
  nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Strict-Transport-Security:
  max-age=31536000` (the live's exact set; HSTS is a no-op over plain http
  locally — it activates behind TLS like the live's deployment).
- **RED first**: `scripts/smoke-test.sh` gains 4 checks (the headers on `/`).
  Smoke: 38 → 42.

### R7 — Documentation alignment

- PAD: revision block; ledger **D49** (the v3 palette pins), **D50** (the
  ring emission path — correcting Session 8's D45 mechanism note), **D51**
  (::selection removed — the live ships none), **D52** (login overscroll),
  **D53** (login border token, inert), **D54** (security headers — the
  live's set), **D55** (the a11y superset family: nav label, logo labels,
  main landmark, aria-hidden icons, aria-pressed tabs, newsletter labels,
  the route announcer), **D56** (live-side: the Notifications region, the
  no-Escape-close menu, the inert --ease-out/radius spellings, the
  transparent shadow layers, the dead ds scrollbar suite); §5.5 trap 15
  (the oklch palette roundtrip — pin the v3 hex); §7 counts; §11 key files.
- AGENTS.md: gotcha 23 (the palette roundtrip + where the pins live).
- CLAUDE.md: session-9 context block + counts.
- README: badge counts, the security-header row.
- `saas-company_SKILL.md` v2.8.0: lesson 26 (survey the RENDERED palette —
  v4's oklch defaults are approximations, not the v3 hex; class strings and
  even spelling-tolerant specs hide multi-unit drift), lesson 27 (v4's
  `ring-ring` reads `--color-ring`, not shadcn's legacy `--ring` — a token
  that never enters @theme makes the utility inert; pin the RENDERED ring,
  not the variable).
- `worklog.md` + this plan + `docs/session_13.md`; screenshots refresh;
  `.env.example` re-verified (no new env vars — all changes are code/config).

---

## 3. Pre-execution codebase validation (done before writing this plan)

- Baseline gate on the inherited tree: ALL GREEN — lint ✓ typecheck ✓
  Vitest 92/92 ✓ build ✓ smoke 38/38 ✓ Playwright 136/136 ✓ (266 checks).
- `.env` `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root ✓;
  `.env.example` tracked and in sync ✓; tsconfig/eslint/vitest/playwright/
  globals.css all exclude `skills/` ✓. The shell's exported absolute
  `DATABASE_URL` neutralized for every command (the AGENTS.md trap was live
  in this shell again).
- All fix sites located and read: `globals.css` (the `@theme` block at
  26–60, the `::selection` block at 193–196, the base layer), `login/page.tsx`
  (the route `<style>` at 135–192, the button consts at 49–59),
  `next.config.ts`, `scripts/smoke-test.sh`.
- Existing pins audited for conflicts (rg over tests/e2e): the brand-parity
  suite converts oklab→sRGB before asserting and pins only the CUSTOM brand
  tokens (unaffected by the palette pins); the section-parity avatar spec
  pins class strings + `linear-gradient(to right bottom` structure (not
  values — compatible); no spec pins `::selection`, `overscroll`,
  `borderColor`, or the Sign in's rendered boxShadow; the motion-parity
  `--ring` variable pin stays valid (the variable remains defined). The
  mobile-navigation, navbar-behavior, typography, head-metadata, and
  motion-parity suites are untouched by every fix.
- v4 mechanics verified for the fixes: `@theme` `--color-*` tokens are the
  emission source for every `text|bg|border|from|to|ring` color utility
  (`text-slate-700` → `color: var(--color-slate-700)`); opacity modifiers
  mix through `color-mix(in oklab, var(--color-*) p%, transparent)` —
  premultiplied interpolation with transparent contributes no hue, so a
  pinned hex renders the exact rgba the live's v3 modifier emits;
  `ring-ring` requires `--color-ring` in `@theme` or the utility never
  emits (the F2 root cause — confirmed against v4's theme.css and the
  built css).
- The palette drift table was computed for ALL 37 used tokens (oklch→sRGB
  math cross-checked against the live's measured computed values — slate-700
  predicted rgb(49,65,88), measured rgb(49,65,88)); 7 are exact matches
  (slate-50/100/200, gray-100/200, red-50, green-50 — left unpinned), 30
  drift and get pins.

## 4. Execution order

R1 (the palette pins + the palette-parity suite, one RED batch) → R2 (the
ring token + the rendered-ring pin) → R3 + R4 + R5 (the three route/chrome
removals+pins, one RED batch) → R6 (the headers + smoke pins) → full gate →
paired re-survey (word parity + the palette/ring/selection/overscroll
re-probes + VLM spot checks on the problem cards, stars, avatars, login) →
screenshots → docs (R7) → commit + SSH push.
