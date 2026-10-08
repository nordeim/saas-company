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

## The Stack (versions from package-lock.json)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | `output: "standalone"`, `outputFileTracingRoot` pinned |
| Runtime | React 19 + TypeScript 5 (strict, `noImplicitAny: false`) | |
| Styling | Tailwind CSS 4 (CSS-first) | tokens in `src/app/globals.css` `@theme`; NO config file |
| Data | Prisma 6 + SQLite | `db/custom.db` at repo root; `db push`, no migrations |
| Auth | Node crypto (scrypt + HMAC-SHA256 cookies) | zero external auth services |
| AI | z-ai-web-dev-sdk (server-side only) | deterministic fallback in `src/lib/workflow.ts` |
| Tests | Vitest 5 (unit) + Playwright 1.63 (E2E) + bash/curl smoke (47) | 94 unit + 173 browser checks |
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
- [ ] `npm run test` → 94/94 PASS
- [ ] `npm run build` compiles clean
- [ ] `./scripts/smoke-test.sh` → 47/47 PASS
- [ ] `npm run test:e2e` → 173/173 PASS (needs the build first)
- [ ] Schema changes regenerated (`npx prisma generate`) and reseeded
- [ ] No `.env`, keys, or `db/*.db` staged (`git status` review)
- [ ] Commit message follows `:art: feat:` / `:memo: docs:` / `:bug: fix:` on `main`

## Known Context

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
