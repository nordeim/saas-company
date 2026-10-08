# Session 23 Log — Reachability, Authenticated Navigation & Status Messages (the Session-14 Remediation, 2026-10-08)

Continuing from Session 21/22 (main @ 2184665 — the verified Session-13
push `3064c64` + `87bc3e2` plus the session-log update). The mandate:
refresh, review the session-21/22 + remediation-plan-13 docs, re-audit
against the live (with the standing mobile-navigation and
Tailwind-v4 vigilance), remediate TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- `git pull` brought in `docs/session_22.md` (the prior session's
  transcript); the tree was clean at `2184665`. Root docs
  (AGENTS 27 gotchas / CLAUDE / README / PAD Session-13 revision / SKILL
  v2.12.0) + status docs (session_21/22, remediation-plan-13, worklog)
  reviewed; the `skills/` folder excluded from every toolchain
  (re-verified: tsconfig/eslint/vitest/playwright).
- `.env` intact (`DATABASE_URL="file:../db/custom.db"`, AUTH_SECRET,
  AUTH_RATE_LIMIT_MAX=10) with the seeded `db/custom.db`; the
  exported-DATABASE_URL trap live — neutralized per-command
  (`env -u DATABASE_URL`) throughout.
- Baseline gate: lint ✓ typecheck ✓ Vitest 94/94 ✓ build ✓ smoke 47/47 ✓
  Playwright **180/180** — the inherited gate fully green (no flake).

## Phase 2 — The audit (the reference UNCHANGED; four new survey surfaces)

**Drift check** (8 routes, scroll-passed innerText): word parity **1.0000
on every route** — the live is unchanged since Session 13.

**Standing mobile-nav paired re-verification** (real-touch 390×844
contexts): the clone's burger (342,16 24×24) taps open into the
byte-identical panel (0,56 390×397, seven 44px rows; scroll-lock,
Escape, resize guard all working). **No Tailwind v4 bug**; the live's
burger remains pointer-blocked (D32).

The Session-14 NEW surfaces — layers no prior session systematically
surveyed:

1. **The feature-reachability layer** (grep every API route for a UI
   consumer): `POST /api/demo` — validation + rate limit + the
   `DemoRequest` model — shipped complete with **zero UI consumers**.
   The hero's "Book a Demo" pill anchors to `#pricing` (correct
   live-parity), so the demo-request backend was dead code dressed as a
   superset feature. **F1.** Live-side confirmation: `/demo`, `/contact`,
   `/book-demo`, `/demo-request`, `/sales` all serve the live's SPA 404
   shell — the route is pure superset.
2. **The authenticated-navigation layer** (API sign-in → GET /login):
   the login card rendered to an already-authenticated session (200 +
   form). Every production auth system sends an authenticated `/login`
   visitor to the workspace. Pure superset (D62). **F2.**
3. **The status-message layer** (WCAG 4.1.3): the dashboard's error
   paths surface `role="alert"` banners, but successful mutations are
   SILENT — probed: **zero aria-live regions**. A screen-reader user's
   pause/resume/delete/compose changed the stats with no confirmation.
   **F3.**
4. **The reduced-motion contract layer**: `Reveal` settles instantly
   under `prefers-reduced-motion: reduce` (verified CLEAN — below-fold
   content at opacity 1, no scrolling needed) and globals.css clamps the
   loops — but **no e2e pin emulated reduced motion**. **F4**
   (pin-only).

Also audited CLEAN (non-findings): the keyboard focus-visible walk on
the landing (every interactive element carries the violet
rgba(213,0,255,.5) outline through a 12-step Tab walk), the footer
newsletter form's fault contract (catch → role=status + aria-live), and
the reduced-motion content visibility itself.

The remediation plan (`docs/remediation-plan-session14.md` F1–F4 →
R1–R5) was written against these findings, then validated against the
codebase (the API contract, the routeMetadata semantics, the FAQ-view
design pattern, the auth-POST budget re-count, the pin-conflict scan)
before execution.

## Phase 3 — Remediation (TDD; every fix pin observed RED first)

- **R1 — the `/demo` route** (F1): RED first (`demo.spec.ts` — all six
  pins failed on the 404); fix: `src/app/demo/page.tsx` (server page,
  `routeMetadata("Book a Demo")`) + `src/components/demo/demo-view.tsx`
  (the dark-brand form over the content-page pattern — Navbar/Footer/
  Reveal; five fields mirroring the API's own validation; the composer's
  catch contract; a polite role=status confirmation) + the sitemap
  entry. GREEN 6/6 — including the API-rejection banner, the
  network-fault banner with zero pageerrors, and the sitemap pin.
- **R2 — the authenticated-`/login` redirect** (F2): RED first (the
  auth-spec pin — URL stayed /login); fix: the login split —
  `login-card.tsx` (the byte-pinned client card, unchanged) +
  `page.tsx` as a thin async server gate (`sessionUserId()` →
  `redirect("/dashboard")`). GREEN.
- **R3 — the status announcements** (F3): RED first (the dashboard pin
  — no live region); fix: the sr-only polite `role="status"` region +
  `setAnnounce` on every successful mutation ("Paused {name}." /
  "Resumed {name}." / "Workflow created." / "Deleted {name}."). GREEN.
- **R4 — the reduced-motion suite** (F4): pin-only (verified clean by
  probe). Two spec-discovery notes: the loop clamp's computed value
  serializes as **"1e-05s"** (scientific notation — compare parsed
  milliseconds, never the authored "0.01ms"), and the demo spec's
  `getByLabel("Email")` needed scoping to `main` (the footer newsletter
  input also carries an Email label).

**Mid-survey ZOMBIE-SERVER recurrence** (gotcha 26): after the rebuild,
probes read every animation dead (`animationName: "none"` — the served
CSS chunk had been deleted from disk; the post-rebuild boot had
silently lost EADDRINUSE to the pre-rebuild process). Killed by PID,
re-booted, verified chunk-against-disk, re-probed: normal motion
`4s`/`1.7s`, reduced motion `1e-05s` — the animations were never
broken. The Playwright e2e results were immune (own server, current
build).

## Phase 4 — Verification

- **Gate: ALL GREEN — 333 checks** (94 unit + 191 e2e = 180 + 6 demo +
  1 auth + 1 dashboard-announcement + 3 reduced-motion; 48 smoke = 47 +
  the /demo page pin).
- **Paired re-survey**: word parity 1.0000 on ALL 8 routes; the three
  RED probe families re-run GREEN (authed-/login redirects to
  /dashboard with the workspace visible; the live region announces
  "Paused Weekly investor update digest." — sr-only verified; /demo
  renders 200 with all fields and ZERO console noise); the console
  sweep clean on 8/9 routes — the 404's single resource log adjudicated
  live-parity-or-better (the live's own 404 ships TWO 401s — the D68
  family); mobile-nav re-probed byte-identical.
- **Screenshots**: all 18 standard shots refreshed + the new
  `16-demo-page.png` + the boundary evidence recapture (20 total) —
  VLM-verified (the demo page renders the complete dark-brand form with
  sample data; the boundary shot shows the branded dark recovery card;
  the dashboard control is clean).

## Phase 5 — Docs & handoff

PAD (revision block; ledger **D73–D75**; §7 counts + the two new suites;
§11 key files incl. the demo route + the login split), AGENTS (counts;
**gotcha 28** — reachability audits + status messages + the
authenticated-/login collateral for scripts), CLAUDE (session-14
context, counts), README (333 badge, the demo-form feature row, two
troubleshooting rows), the SKILL doc v2.13.0 (**lessons 36–37**), the
remediation plan (checklist ticked), this log, and the repo
`worklog.md`. `.env.example` re-verified (no new env vars). Commit +
SSH push per the runbook.
