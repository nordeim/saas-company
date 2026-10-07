# SAAS Company — NovaAI Marketing Site + Workspace

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)
![SQLite](https://img.shields.io/badge/DB-SQLite-003b57?logo=sqlite)
![Tests](https://img.shields.io/badge/tests-266_checks_passing-2ecc8a)

A production-grade, self-hosted clone of the reference dark-theme SaaS
marketing site [`saas-company.base44.app`](https://saas-company.base44.app/)
(the "NovaAI" automated-workflows product) — rebuilt as one deployable
Next.js application, and extended into a **functional superset**: the
reference's dead demo link becomes a real authenticated workflow dashboard,
the footer subscribe form persists, and every surface is tested.

## Overview

The reference is a Base44-hosted marketing site: a video hero, a trusted-by
logo strip, problem/solution sections, a features tab trio, pricing with a
Monthly/Annual toggle, testimonials, FAQ, and legal pages — plus a login
card. This clone reproduces all of it (measured tokens, self-hosted fonts,
verbatim copy) and then goes further: cookie-session auth, a workflow
workspace with an AI composer (`z-ai-web-dev-sdk` with a deterministic
fallback), newsletter + demo-request capture, sitemap/robots, a health
probe, Lenis smooth scrolling, per-route SEO metadata with a working og-image + web app
manifest, and 266 automated checks across three test layers.

| Dashboard | Landing hero |
|:---:|:---:|
| ![Dashboard](docs/screenshots/08-dashboard.png) | ![Hero](docs/screenshots/01-landing-hero.png) |

| Pricing | Mobile menu |
|:---:|:---:|
| ![Pricing](docs/screenshots/02-landing-pricing.png) | ![Mobile menu](docs/screenshots/10-mobile-menu.png) |

## Key Features

| Feature | Description |
|---------|-------------|
| 🎬 **Faithful landing page** | Looping AI-video hero with the shimmer-bordered beta badge and animated gradient heading, dashboard mockup with the browser-chrome skeleton, trusted-by logo cloud (serif wordmarks), problem cards, "One Platform" showcase, white features tabs, how-it-works steps, pricing (Monthly/Annual — **defaults to Annual like the reference**: Pro $39/mo annual, $49/mo monthly, "Save 20%"), testimonial drag-strip, CTA, and the four-column footer |
| 🧭 **Reference chrome** | Fixed transparent nav with the center pill (md+), LOG IN + white Get Started pill, and the measured mobile burger dropdown (black/95 blur panel, 44px rows) — the nav is **section-aware** like the reference: scroll-spy highlights the section in view (white/30 pill on dark, black/15 on light) and the chrome swaps to black variants over the white features section; plus the slate login card (light body theme + system font, exactly as the reference's login bundle) and light 404 |
| 🔐 **Cookie-session auth** | scrypt password hashing + HMAC-signed sessions, per-IP rate limiting on auth endpoints (10/15 min), register/login/logout/me — sign-up lands straight in the workspace |
| ⚡ **Workflow dashboard (superset)** | The reference's "Dashboard" demo link 404s — here it's real: stats cards, a workflow list with pause/resume/delete, a runs chart, and an AI composer that drafts workflows from one-line ideas (server-side SDK + deterministic fallback, sanitized before persistence) |
| 📰 **Working capture forms** | Footer newsletter subscribe (idempotent upsert) and demo/contact requests persist to SQLite |
| ❓ **Interactive FAQ + legal** | The reference's six-question accordion and four legal pages, copy captured verbatim |
| 🧪 **266 automated checks** | 92 Vitest unit checks (pure domain seams incl. the SEO helpers + the motion engine), 136 Playwright browser checks (incl. the mobile-navigation, navbar scroll-behavior, per-tab features-card, login-theme, login alternate-states, brand-parity, section-parity, head-metadata, typography-parity, and motion-parity suites), 38 curl smoke checks against the production build |
| 🔎 **Per-route SEO head parity** | The reference's per-route `<head>` pattern — "X | SAAS Company" og:titles, "X on SAAS Company. …" descriptions, per-route og:url/canonical, a web app manifest — plus a WORKING self-hosted og-image (the live's own URL 404s); assembled in `src/lib/seo.ts` (`routeMetadata`) and pinned by the head-metadata e2e suite |
| 🌗 **Measured design system** | Tailwind v4 CSS-first tokens: #000 canvas, #8624FF primary, #0055FF accent, #D500FF violet, self-hosted **Google Fonts' "Vend Sans" variable font** (wght 300-700 — the exact gstatic bytes the reference serves; Session 5 font forensics replaced the Session-1 Wix Madefor misidentification), the reference's keyframes (organic-gradient, border-shimmer, logo petals, marquee) |

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Web framework | Next.js (App Router) | 16.1 | Pages + 11 API route handlers; standalone output |
| UI runtime | React | 19 | Component model |
| Language | TypeScript | 5 (strict) | Type safety end-to-end |
| Styling | Tailwind CSS | 4 | CSS-first tokens + measured custom classes |
| State | React hooks + fetch | — | Server pages load initial state; client components mutate via the API envelope |
| ORM | Prisma | 6 | Schema, client, `db push`, seed |
| Database | SQLite | — | Zero-config persistence at `db/custom.db` |
| Auth | Node `crypto` (scrypt + HMAC) | — | Cookie sessions, no external auth service |
| AI | z-ai-web-dev-sdk | 0.0.x | Server-side workflow composition (degrades to a template) |
| Icons | lucide-react | 0.5.x | Icon set |
| Smooth scroll | lenis | 1.3.x | The reference's momentum scrolling (`window.lenis`, reduced-motion aware) |
| Fonts | Self-hosted Google "Vend Sans" (variable 300-700) + next/font Google (Playfair/DM Serif) | — | Reference typography — the SAME gstatic woff2 bytes the live serves (Session 5 forensics) |
| Unit tests | Vitest | 5 | Pure domain seams |
| E2E tests | Playwright | 1.63 | Browser suite (Chromium) |
| Smoke | bash + curl | — | 38 checks against the production build |

## Architecture

```mermaid
flowchart LR
    B[Browser] -->|GET / · /login · /faq · /legal| P[Next.js pages<br/>server components]
    B -->|GET /dashboard (session-gated)| P
    B -->|fetch JSON, cookie auth| A["API route handlers (11)<br/>auth · workflows · newsletter · demo · health"]
    A -->|Prisma Client| D[("SQLite<br/>db/custom.db")]
    A -->|server-side| Z[z-ai-web-dev-sdk<br/>workflow composer + fallback]
```

## File Hierarchy

```
📂 prisma/
  📄 schema.prisma            # 4 models: User, Subscriber, DemoRequest, Workflow
  📄 seed.ts                  # Idempotent demo workspace (demo user + 6 workflows)
📂 public/
  📂 media/                   # hero-ai-loop.mp4, gasparyan-logo.svg
  📄 favicon.svg              # Brand mark (four-petal pinwheel)
📂 scripts/
  📄 smoke-test.sh            # 38-check E2E suite (boots the prod build on :3200)
📂 src/
  📂 app/
    📄 page.tsx               # Landing (10 sections)
    📄 layout.tsx             # Fonts, metadata, global styles
    📄 globals.css            # Tailwind 4 tokens + measured custom classes
    📂 login/ faq/ privacy/ terms/ accessibility/ refund-policy/
    📂 dashboard/             # Session-gated workspace (the superset)
    📂 api/                   # health · auth/* · newsletter · demo · workflows/*
    📄 not-found.tsx sitemap.ts robots.ts
  📂 components/
    📂 site/                  # navbar (+ mobile menu), footer, logo, reveal, legal view
    📂 sections/              # hero, dashboard-preview, logo-cloud, problem,
    #                          # features, how-it-works, pricing, testimonials, cta
    📂 dashboard/             # dashboard-app (stats, composer, workflow list, chart)
  📂 lib/                     # auth, api, db, db-path, rate-limit, pricing,
    #                          # validation, workflow, legal-content, faq-content
📂 tests/
  📄 db-path.test.ts          # SQLite URL resolution contract
  📂 e2e/                     # landing, mobile-navigation, auth, dashboard, pages
📄 docs/                      # screenshots, deployment, SSH push runbook, PAD…
```

## Quick Start

Requires **Node.js ≥ 20** (Bun ≥ 1.1 also works for the scripts).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env           # defaults are correct for local use

# 3. Create + seed the database (db/custom.db at the repo root)
npm run db:push
npm run db:seed

# 4. Start the dev server
npm run dev                    # http://localhost:3000
```

Open <http://localhost:3000>, then sign in to the dashboard at
<http://localhost:3000/login> with the seeded demo account:

| Email | Password |
|-------|----------|
| `demo@novaai.app` | `Demo1234!` |

### Verify Setup

```bash
curl http://localhost:3000/api/health
# {"ok":true,"data":{"status":"ok","app":"saas-company","ts":"…"}}

# Full verification (266 checks across three layers)
npm run lint && npm run typecheck && npm run test   # 92 unit checks
npm run build && ./scripts/smoke-test.sh            # 38 smoke checks
npm run test:e2e                                    # 136 browser checks
```

### Production

```bash
npm run build                  # next build + standalone assembly
npm run start                  # serves .next/standalone/server.js on :3000
```

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | SQLite connection string. Relative `file:` URLs resolve against `prisma/schema.prisma` (the CLI rule) — `src/lib/db-path.ts` implements the same rule for the runtime, so `file:../db/custom.db` points at `<repo>/db/custom.db` in every context (dev, build, standalone server). | `file:../db/custom.db` |
| `AUTH_SECRET` | Production | HMAC secret for session cookies. Generate with `openssl rand -hex 32`. Falls back to an insecure dev constant when unset. | — |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public origin — used for metadata, `sitemap.xml`, `robots.txt`. | `http://localhost:3000` |

## API Reference

All endpoints return `{ "ok": true, "data": … }` or
`{ "ok": false, "error": { "code", "message" } }`. 🔒 = requires session cookie.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Liveness probe |
| `/api/auth/register` | POST | Create account + sign in (name, email, password ≥ 8) — rate-limited |
| `/api/auth/login` | POST | Sign in, sets session cookie — rate-limited (10/IP/15 min → `429 RATE_LIMITED`) |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/me` | GET | Current user or `null` |
| `/api/workflows` 🔒 | GET / POST | List / create workflows (status: active·paused·draft) |
| `/api/workflows/[id]` 🔒 | GET / PATCH / ⚠️ DELETE | Workflow detail / update / delete |
| `/api/workflows/generate` 🔒 | POST | AI workflow composer — one-line idea → draft (deterministic fallback) |
| `/api/newsletter` | POST | Footer subscribe (idempotent, rate-limited) |
| `/api/demo` | POST | Book-a-demo / contact-sales capture |

## Design System

Measured from the reference (2026-10 survey) — a dark, glass-on-black
system with magenta and electric-blue brand gradients:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#000000` | Page canvas |
| `--color-card` | `#0f0f0f` | Raised dark surfaces |
| `--color-border` | `#242424` | Hairline borders |
| `--color-primary` | `#8624ff` | The reference's `:root` primary — hsl(267 100% 57%), the purple gradient partner (mockup bars, glows, icon chips) |
| `--color-accent` / `--color-electric-blue` | `#0055ff` | Electric blue — hsl(220 100% 50%), the blue gradient end (badge, chart bars) |
| `--color-violet` | `#d500ff` | Brand magenta — hsl(290 100% 50%) for text/border/bg-violet surfaces |
| `--color-destructive` | `#ef4444` | Problem cards, delete affordances |
| `--font-heading` / `--font-body` | "Vend Sans" / "Vend Sans" | Google Fonts' Vend Sans variable font (wght 300-700), self-hosted — the exact gstatic latin/latin-ext subsets the reference serves (Session 5; the chain is `"Vend Sans", sans-serif` like the live's `:root`) |
| `--font-serif` | Playfair Display → DM Serif Display | Client wordmarks |

The scroll entrances reproduce the reference's framer-motion engine
dependency-free (`src/lib/motion.ts` + `Reveal`: per-frame rAF inline
opacity/transform writes, easeOut cubic-bezier(0, 0, 0.58, 1), per-element
y/duration/stagger — Session 8's motion-layer audit). Custom classes in
`globals.css`: `.workflows-gradient-text` (the animated
hero heading fill), `.animated-gradient-text`, `.border-shimmer-*` (the beta
badge's traveling stroke), `.anim-logo-*` (the four-petal logo choreography),
`.get-started-shimmer`, `.skeleton-wave`, `.accordion-panel`, plus the
marquee/float/pulse-glow keyframes, plus the hero's `scroll-dot` — the
reference's rAF-sampled indicator motion (translateY 0→8px, ≈1.7 s). Type
details: `h1`–`h6` carry the
reference's base `letter-spacing: .02em` (the hero overrides to `-0.02em`
inline); the login card and 404 page run the reference's light slate theme.

## Testing

```bash
npm run test              # unit — 92 checks on the pure domain seams
npm run test:e2e          # Playwright — 136 browser checks (needs a build)
./scripts/smoke-test.sh   # curl E2E — 38 checks against the production build
```

The unit layer pins the pure logic: pricing math (plans, the 20% annual
discount, captions), the fixed-window rate limiter, input validation, the
workflow template/sanitizer, scrypt + HMAC auth, content integrity (FAQ +
legal — including the accessibility page's two reference lists and its
no-caption rule), and the SQLite URL resolution (incl. the standalone-server
`chdir`
trap). The Playwright layer drives the real UI in Chromium: the landing
structure, the **mobile navigation suite** (the highest-regression-risk
chrome — burger dropdown rows at the measured 44px, close-on-navigate, the
768 pill), the auth round-trip, the dashboard superset (composer
end-to-end, pause/resume), the FAQ accordion, the pricing toggle, all four
legal pages, the **per-tab features-card parity suite** (AI caption, analytics
chart + stats, builder steps), the **login bare-card pin** (zero anchors — the
reference's dead-end auth card), the **login alternate-states suite**
(sign-up / forgot / reset-success / error-banner structures measured from
the live), and the newsletter API pair. The smoke suite boots the production standalone server on
:3200 with its own scratch database (`db/smoke.db`) — it never touches dev
data.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error code 14: Unable to open the database file` | Server started with an inherited/absolute `DATABASE_URL` pointing elsewhere | Start via `npm run dev`/`npm run start`, or unset the exported variable; scripts pin their own `DATABASE_URL` |
| Prisma `P1003` / missing tables | Database not initialized | `npm run db:push && npm run db:seed` |
| Login suddenly returns 429 | Per-IP rate limit engaged (10 attempts / 15 min) | Wait for the window (see `Retry-After`) or restart the server |
| "Continue with Google" shows a notice instead of signing in | Expected — the self-hosted clone carries no OAuth credentials (documented deviation) | Use email sign-in |
| Fonts differ from the reference | The UI font is self-hosted Google "Vend Sans" (variable 300-700) from `src/fonts/` — the same gstatic bytes the live serves | Keep the `@font-face` blocks in `globals.css` intact |
| `oklab(...)` colors in computed styles | Tailwind v4 serializes alpha colors through oklab — rendering-identical to rgba | Expected; assertions accept either spelling |
| Hero indicator dot travels instead of bouncing | The reference drives it with a JS oscillation; this repo ships the measured `animate-scroll-dot` keyframe | Intended parity (rAF-sampled); `prefers-reduced-motion` collapses it |

## License

No license file is present in this repository; all rights are reserved by
default. Add an explicit license before redistributing.
