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
| Tests | Vitest 5 (unit) + Playwright 1.63 (E2E) + bash/curl smoke (38) | 80 unit + 97 browser checks |
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
- [ ] `npm run test` → 80/80 PASS
- [ ] `npm run build` compiles clean
- [ ] `./scripts/smoke-test.sh` → 38/38 PASS
- [ ] `npm run test:e2e` → 97/97 PASS (needs the build first)
- [ ] Schema changes regenerated (`npx prisma generate`) and reseeded
- [ ] No `.env`, keys, or `db/*.db` staged (`git status` review)
- [ ] Commit message follows `:art: feat:` / `:memo: docs:` / `:bug: fix:` on `main`

## Known Context

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
