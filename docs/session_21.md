# Session 21 Log — Session Lifecycle, Render Faults & Focus Return (the Session-13 Remediation, 2026-10-08)

Continuing from Session 19/20 (main @ de7a2e3 — the verified Session-12
push `bc017f0` + `853b3aa` plus the session-log update). The mandate:
refresh, review the session-19/20 + remediation-plan-12 docs, re-audit
against the live (with particular attention to the mobile navigation and
possible Tailwind v4 bugs), remediate TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- `git pull` brought in `docs/session_20.md` (the prior session's
  transcript); the tree was clean at `de7a2e3`. Root docs
  (AGENTS/CLAUDE/README/PAD/SKILL v2.11.0) + status docs (session_19/20,
  remediation-plan-12, worklog) reviewed; the `skills/` folder excluded
  from every toolchain (verified: tsconfig/eslint ignore it; vitest
  matches only `src|tests/**/*.test.ts`; playwright's testDir is
  `tests/e2e`).
- `.env` already correct (`DATABASE_URL="file:../db/custom.db"`,
  AUTH_SECRET, AUTH_RATE_LIMIT_MAX=10) with `db/custom.db` pushed + seeded
  at the repo root; `.env.example` verified in sync. **The
  exported-DATABASE_URL trap was live** — neutralized per-command with
  `env -u DATABASE_URL` throughout the session.
- Baseline gate: lint ✓ typecheck ✓ Vitest 94/94 ✓ build ✓ smoke 47/47 ✓
  Playwright **173/173** — the inherited gate fully green (no flake).

## Phase 2 — The audit (the reference UNCHANGED; three new survey surfaces)

**Drift check** (8 routes, scroll-passed innerText): word parity **1.0000
on every route** — the live is unchanged since Session 12.

**Standing mobile-nav paired re-verification** (real-touch 390×844
contexts — the operator's standing ask): the clone's burger (342,16
24×24, identical classes) taps open into the byte-identical panel
(0,56 390×397, seven 44px rows; scroll-lock, Escape, resize guard all
working; oklab bg = black/95 rendering-identical). **No Tailwind v4
bug** in the clone's mobile nav; the live's burger remains
pointer-blocked (D32).

The Session-13 NEW surfaces — layers no prior session systematically
surveyed:

1. **The session-lifecycle layer** (the 7-day cookie TTL makes this a
   certainty for long-lived users): cookie deleted post-sign-in → Pause
   clicked → the PATCH 401s → the banner read "Could not update that
   workflow. Try again." — **a lie** (every retry 401s forever) and the
   user stayed stranded on /dashboard. Same for Delete and Compose;
   `refresh()` silently kept stale data. Meanwhile the server-side gate
   already upholds the honest contract for page loads
   (`redirect("/login?from_url=/dashboard")`). **F1.**
2. **The render-fault layer**: the repo shipped NO `error.tsx` /
   `global-error.tsx`. Code-level reachability: `refresh()` guards
   `payload?.ok` but not the SHAPE of `payload.data` — a
   `{ok:true,data:null}` envelope passes, `setWorkflows(null)` lands, and
   the stats memo's `.filter` crashes. Probe (route-fulfilled malformed
   GET + successful PATCH + Pause): the pageerror fired
   (`TypeError: Cannot read properties of null (reading 'filter')`) and
   Next.js's DEFAULT unbranded error page ("This page couldn't load")
   replaced the dashboard. **F2.**
3. **The focus-management layer**: the burger's Escape handler closed the
   panel WITHOUT returning focus — the focused menu link unmounts and
   `document.activeElement` fell to `body` (WCAG 2.4.3; probe: `{tag:
   BODY, isBurger: false}`). **F3.**

Also audited CLEAN (non-findings): the login form's autocomplete
attributes (already the a11y superset: email / current-password /
new-password), the auth cookie flags (httpOnly, sameSite=lax,
secure-in-prod, 7-day maxAge), the compose double-submit guard, the
per-row busy guard, and the API's 401 envelope shape.

The remediation plan (`docs/remediation-plan-session13.md` F1–F6 →
R1–R4) was written against these findings, then validated against the
codebase (touchpoints re-read, pin conflicts checked, the auth POST
budget re-counted) before execution.

## Phase 3 — Remediation (TDD; every pin observed RED first)

- **R1 — the session-expiry redirect** (F1): RED first
  (`session-lifecycle.spec.ts` — pins (a)(b)(c) failed exactly on the
  missing redirect; pin (d), the abort regression, passed); fix: the
  `apiFetch` wrapper — every dashboard fetch routes through it, and a
  401 redirects to `/login?from_url=/dashboard` (the server gate's own
  contract) with a caught `SessionExpired` sentinel (no unhandled
  rejection, no lying banner). GREEN 4/4.
- **R2 — the branded error boundaries** (F2): RED first
  (`error-boundary.spec.ts` — the default Next page rendered); fix:
  `src/app/error.tsx` (the dark-brand recovery card: role="alert",
  "Something went wrong", Try again via `reset()`, Go-to-home) +
  `src/app/global-error.tsx` (the last-resort root shell, inline-styled)
  + the `refresh()` `Array.isArray(payload.data)` shape-guard. GREEN 2/2
  — Try again restores the segment with the server-provided state.
- **R3 — the mobile-menu focus return** (F3): RED first (the
  mobile-navigation focus pin — activeElement fell to `body`); fix: the
  `burgerRef` + Escape handler focus return. GREEN (all 9
  mobile-navigation pins).

## Phase 4 — Verification

- **Gate: ALL GREEN — 321 checks** (94 unit + 180 e2e = 173 + 4
  session-lifecycle + 2 error-boundary + 1 mobile-focus; 47 smoke).
- **Paired re-survey**: word parity 1.0000 on ALL 8 routes; the three
  RED probes re-run GREEN (cookie-expiry redirects to
  `/login?from_url=/dashboard` with no lying banner; the branded
  boundary renders — never the default — and Try again restores;
  activeElement IS the burger post-Escape); console sweep v2 re-run:
  zero noise on every route; mobile-nav re-probed byte-identical. One
  ZOMBIE-SERVER recurrence killed by port mid-survey (EADDRINUSE on
  :3000; the served HTML's CSS chunk verified against disk per gotcha
  26's discipline before trusting any result).
- **Screenshots**: all 18 standard shots refreshed + the new
  `15-error-boundary.png` (19 total) — VLM-verified (the boundary shot
  shows the branded dark card with both buttons; the dashboard control
  shot shows no error state).

## Phase 5 — Docs & handoff

PAD (revision block; ledger **D70–D72**; §7 counts + the two new suites;
§11 key files incl. the two boundary files), AGENTS (counts; **gotcha
27** — failure-class-distinct UI contracts + ship error boundaries
before you need them), CLAUDE (session-13 context, counts), README (321
badge, the two new suites, two troubleshooting rows), the SKILL doc
v2.12.0 (**lessons 34–35**), the remediation plan (checklist ticked),
this log, and the repo `worklog.md`. `.env.example` re-verified (no new
env vars). Commit + SSH push per the runbook.
