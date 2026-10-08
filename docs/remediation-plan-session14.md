# Remediation Plan — Session 14 (2026-10-08)

**Scope:** Fix the issues, bugs and gaps found by the Session 14 parity +
production-readiness audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** fresh paired captures (word parity **1.0000 on all 8
routes** — the reference is UNCHANGED since Session 13; the standing
mobile-nav real-touch probe re-run: the clone's panel byte-identical and
working, **no Tailwind v4 bug**; the live's burger remains pointer-blocked,
D32). The Session-14 NEW audit surfaces — layers no prior session
systematically surveyed:

1. **The feature-reachability layer**: is every shipped superset feature
   actually REACHABLE from a URL? Probed by grepping every API route for a
   UI consumer. Found: `POST /api/demo` (validation + rate limit + the
   `DemoRequest` Prisma model) has **zero UI consumers** — the hero's "Book
   a Demo" anchors to `#pricing` (live-parity behavior, correctly), so the
   demo-request backend is a half-shipped feature: dead code dressed as a
   superset. **F1.**
2. **The authenticated-navigation layer**: what does `/login` do for a user
   who is ALREADY signed in? Probed (API sign-in → GET /login): it renders
   the login card (200 + form + "Welcome to SAAS Company") to an
   authenticated session. Every production auth system (NextAuth, Clerk,
   et al.) sends an authenticated `/login` visitor to the workspace — the
   honest contract. Pure superset (the live has no real auth — D62). **F2.**
3. **The status-message layer (WCAG 4.1.3)**: the dashboard's error paths
   surface `role="alert"` banners (Sessions 12–13), but SUCCESSFUL
   mutations are silent — probed: **zero aria-live regions** on the
   dashboard. A screen-reader user pauses, resumes, deletes, or composes a
   workflow and gets NO confirmation the action landed (stats change
   silently). **F3.**
4. **The reduced-motion contract layer**: `Reveal` settles instantly under
   `prefers-reduced-motion: reduce` (verified CLEAN by probe — below-fold
   content renders at opacity 1, the footer visible) and globals.css kills
   the CSS loops — but **no e2e pin emulates reduced motion**. A future
   regression (removing the settle() early-return) would strand content at
   opacity:0 for reduced-motion users with nothing red in the gate. **F4**
   (pin-only — the code is verified correct).

Also audited and found CLEAN (non-findings): the keyboard focus-visible
walk on the landing (every interactive element carries the violet
`rgba(213, 0, 255, 0.5)` outline ring through a 12-step Tab walk), the
footer newsletter form's fault contract (catch → `role="status"` +
`aria-live="polite"` — the composer pattern, already correct), the
reduced-motion content visibility itself (see F4), and the live-side
confirmation that `/demo`, `/contact`, `/book-demo`, `/demo-request`,
`/sales` all serve the live's SPA 404 shell (the live has NO demo route —
the clone's `/demo` page is pure superset, like the dashboard).

## Findings → remediation map

| # | Finding | Layer | Severity | Fix |
|---|---------|-------|----------|-----|
| F1 | `/api/demo` is unreachable dead code — the demo-request superset feature has no UI surface | Feature reachability | MEDIUM (production honesty: dead code ≠ superset) | R1: the `/demo` route |
| F2 | `/login` renders the login card to authenticated users | Authenticated navigation | MEDIUM (UX/correctness) | R2: the server-side session gate |
| F3 | Dashboard mutation successes are silent for screen-reader users | Status messages (WCAG 4.1.3) | MEDIUM (a11y superset tier — the D55 family) | R3: the polite live region |
| F4 | Reduced-motion content visibility + loop-pausing is correct but UNPINNED | Reduced-motion contract | LOW (regression risk only) | R4: the reduced-motion suite |

## The plan

### R1 — The `/demo` route (F1): make the demo-request feature reachable

A first-class dark-brand page at `/demo` ("Book a Demo"), following the
codebase's content-page pattern (server page + client view, `Navbar` +
`Footer`, the `py-28 pt-40` section frame, `Reveal` entrances — the FAQ
view is the model):

- `src/app/demo/page.tsx` — server component exporting
  `routeMetadata("Book a Demo")` (the Session-6 per-route head pattern).
- `src/components/demo/demo-view.tsx` — the client form: name (required,
  ≤80), email (required, valid), company (optional ≤120), message
  (optional ≤2000); `autocomplete` attributes (`name`, `email`,
  `organization`); client validation mirrors `src/lib/validation.ts`
  (the API's own rules — `requiredString` bounds + `isValidEmail`); the
  composer contract (catch → `role="alert"` error banner; success →
  `role="status"` confirmation, `aria-live="polite"`); a busy guard on
  submit. The API's existing rate limit (429) surfaces through the same
  banner.
- `src/app/sitemap.ts` — add `/demo` (public marketing surface; the
  sitemap is the clone's own superset SEO surface — the live's sitemap
  lists only its five real routes).
- **No live-parity surface is touched**: the hero's "Book a Demo" pill
  keeps its `#pricing` anchor (the live's behavior), the navbar/footer
  keep their byte-pinned markup, and the live itself 404s `/demo` (its
  SPA shell — verified), so the page is pure superset exactly like
  `/dashboard`.

RED first (`tests/e2e/demo.spec.ts`): (a) the page renders (200, the
heading, all five fields, navbar + footer); (b) empty-submit is blocked
by client validation; (c) the happy path submits and shows the success
confirmation; (d) the API-rejection path (an over-length name) surfaces
the error banner; (e) the network-fault path (`route.abort`) shows the
banner with ZERO pageerrors (the Session-12 discipline); (f) the sitemap
lists `/demo`. GREEN: build the page + view.

### R2 — The authenticated-`/login` redirect (F2)

Split `src/app/login/page.tsx` (currently `"use client"` end-to-end):

- `src/app/login/login-card.tsx` — the entire current client component,
  unchanged (the reference's byte-pinned card).
- `src/app/login/page.tsx` — a thin async server component: read
  `sessionUserId()`; if present, `redirect("/dashboard")`; else render
  `<Suspense><LoginCard /></Suspense>`. `export const dynamic =
  "force-dynamic"` (the session read makes it dynamic; explicit like the
  dashboard gate). The metadata stays in `login/layout.tsx` (unchanged).
- Compatibility verified: every existing `/login` visit in the battery
  (auth/login-states/brand-parity/palette/typography/head-metadata/
  hydration specs + the smoke page loop) happens in an ANONYMOUS context
  (no `storageState` anywhere in the suite) — the anonymous card render
  is the regression pin.

RED first (a new pin in `auth.spec.ts`): API sign-in → `goto("/login")`
→ the URL becomes `/dashboard` and the workspace renders; plus the
anonymous regression pin (fresh context → the card renders). GREEN: the
split + gate.

### R3 — The dashboard status announcements (F3)

`src/components/dashboard/dashboard-app.tsx`: an `announce` state + an
`sr-only` polite live region (`role="status"` `aria-live="polite"`)
mounted once; every successful mutation sets a human sentence: compose →
`"Workflow created."`, toggle → `"Paused {name}."` / `"Resumed {name}."`,
delete → `"Deleted {name}."`. The error paths keep their existing
`role="alert"` banners (failure and success stay distinct — the Session-13
failure-class discipline applied to the success class).

RED first (pins in `dashboard.spec.ts`, piggybacking the existing
sign-in): pause → the live region carries "Paused Lead enrichment
pipeline."; compose → "Workflow created."; delete → "Deleted …". GREEN:
the live region + announcements.

### R4 — The reduced-motion suite (F4, pin the verified-clean contract)

`tests/e2e/reduced-motion.spec.ts` (contexts with `reducedMotion:
"reduce"`): (a) the landing's below-fold `Reveal` content renders at
opacity 1 WITHOUT scrolling (the settle() early-return contract); (b) the
CSS loops collapse (a looping element's computed `animation-duration`
serializes the 0.01ms override); (c) `/faq` renders its accordion rows
visible. Expected GREEN on arrival (the probe verified the behavior —
this is a regression pin, not a bug fix; documented as such).

### R5 — Full gate + paired re-verification + docs

- Gate: lint → typecheck → 94 unit → build → 47 smoke → e2e (expect
  **321 + ~11 = ~332 checks**; the smoke page loop gains `/demo` 200 +
  the demo API pin already exists — smoke count may rise to 48–49).
- Re-verification: word parity 1.0000 ×8 (the /demo route ADDS a route —
  parity is measured on the 8 pinned routes only); the mobile-nav
  real-touch probe; the three RED probe families re-run GREEN
  (authed-/login redirect, live-region announcements, /demo reachability);
  console sweep on `/demo` (zero noise — pageerror + unhandledrejection +
  console.error/warn).
- Screenshots: the 16 standard shots refreshed + the new
  `16-demo-page.png` (VLM spot-check).
- Docs: PAD (revision block, ledger D73–D76, §7 counts, §11 key files),
  AGENTS (gotcha 28 — reachability audits + status messages + the
  authed-login redirect), CLAUDE (session-14 context), README (badge,
  features row, troubleshooting), SKILL v2.13.0 (lessons 36–37), the
  checklist ticked, session log `docs/session_23.md`, repo `worklog.md`.
- `.env.example`: no new env vars (verified — no new knobs this session).

## Validation of this plan against the codebase (pre-execution)

- `POST /api/demo` contract re-read (name/email required, company/plan/
  message optional, 429 rate limit shared with newsletter) — the form
  fields and validation mirror it exactly ✓.
- `routeMetadata()` / `pageDescription()` semantics re-read —
  `routeMetadata("Book a Demo")` emits the per-route head pattern ✓.
- The FAQ view pattern (server page + client view + Navbar/Footer +
  `py-28 pt-40` + Reveal) re-read as the design model ✓.
- `sessionUserId()` + the dashboard gate pattern re-read; the login
  metadata's layout placement re-confirmed ✓.
- Auth POST budget re-counted: the suite's webServer pins
  `AUTH_RATE_LIMIT_MAX=50`; Session 13 sat at ~18 sign-ins; this session
  adds ~3 (R2's redirect pin ×1, R3's piggybacked pins ×1–2) → ~21/50 ✓.
- Pin-conflict scan: no existing spec visits `/login` while authenticated;
  no existing spec pins the dashboard's live-region absence; no spec
  emulates reduced motion ✓.

## Execution order

R1 (RED demo.spec → the page + view + sitemap → GREEN) → R2 (RED auth pin
→ the login split + gate → GREEN) → R3 (RED dashboard pins → the live
region → GREEN) → R4 (the reduced-motion suite, pin-only) → full gate →
paired re-verification → screenshots → docs (R5) → commit + SSH push per
the runbook.

### ToDo checklist

- [x] R1: RED `demo.spec.ts` (6 pins) → `/demo` page + view + sitemap → GREEN
- [x] R2: RED authed-`/login` redirect pin → login/page.tsx split + session gate → GREEN
- [x] R3: RED dashboard live-region pins → the polite announcement region → GREEN
- [x] R4: `reduced-motion.spec.ts` (pin-only, expected GREEN — incl. the "1e-05s" serialization fix)
- [x] Full gate: lint → typecheck → 94 unit → build → 48 smoke (+/demo 200) → 191 e2e (333 checks)
- [x] Paired re-verification: word parity 1.0000 ×8, mobile-nav real-touch probe (byte-identical, no v4 bug), RED probes re-run GREEN (authed-/login redirect, live-region announcement, /demo 200 + zero console noise ×8 routes; the 404's single resource log adjudicated live-parity — the live's own 404 ships two 401s, D68)
- [x] Screenshots: 18 standard refreshed + 16-demo-page.png + the boundary evidence recapture (20 total, VLM-verified)
- [x] Docs: PAD (D73–D75 + revision block + §7 + §11), AGENTS (gotcha 28 + counts), CLAUDE (session-14 context), README (333 badge + rows + troubleshooting), SKILL v2.13.0 (lessons 36–37), session log `docs/session_23.md`, worklog, this plan ticked
- [x] `.env.example` re-verified (no changes — no new env vars this session)
- [ ] Commit (Conventional Commits + emoji) + SSH push via `docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified)
