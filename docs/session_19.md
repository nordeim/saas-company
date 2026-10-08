# Session 19 Log — Console Noise v2, Fault Injection & the Traveling Preload (the Session-12 Remediation, 2026-10-08)

Continuing from Session 17/18 (main @ 23f19fb — the verified Session-11
push `2f8b0eb` + `ddef709` plus the session-log update). The mandate:
refresh, review the session-17/18 + remediation-plan-11 docs, re-audit
against the live (with particular attention to the mobile navigation and
possible Tailwind v4 bugs), remediate TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- `git pull` brought in `docs/session_18.md` (the prior session's
  transcript); the tree was clean at `23f19fb`. Root docs
  (AGENTS/CLAUDE/README/PAD/SKILL v2.10.0) + status docs (session_17/18,
  remediation-plan-11, worklog) reviewed; the `skills/` folder excluded
  from every toolchain (verified: tsconfig/eslint ignore it; vitest
  matches only `src|tests/**/*.test.ts`; playwright's testDir is
  `tests/e2e`).
- `.env` already correct (`DATABASE_URL="file:../db/custom.db"`,
  AUTH_SECRET, AUTH_RATE_LIMIT_MAX=10) with `db/custom.db` pushed + seeded
  at the repo root; `.env.example` verified in sync. **The
  exported-DATABASE_URL trap was live** (the shell exports an absolute
  path outside the repo) — neutralized per-command with
  `env -u DATABASE_URL` throughout the session.
- Baseline gate: lint ✓ typecheck ✓ Vitest 94/94 ✓ build ✓ smoke 46/46 ✓
  Playwright **166/167 → 167/167** on re-run — the one failure (the FAQ
  motion-parity pin) became this session's first finding (F1: 2/10
  reproduction in isolation, then 16 consecutive passes — load-dependent).

## Phase 2 — The audit (the reference UNCHANGED; three new survey surfaces)

**Drift check** (8 routes, scroll-passed innerText): word parity **1.0000
on every route** — the live is unchanged since Session 11.

1. **Console-noise sweep v2** — the first sweep to capture
   `unhandledrejection` + `console.error` + `console.warn` alongside
   pageerror, on every route AND during interactions (FAQ accordion,
   pricing toggle, newsletter submit, wrong-password login, dashboard
   composer/pause): all routes CLEAN except TWO findings — the Gasparyan
   preload warning (F2) on the navbar routes, and (the fault-injection
   sweep, surface #2) the dashboard's uncaught rejections (F3).
2. **The first fault-injection sweep** (network-level failures):
   `page.route(...abort())` on the signed-in dashboard — pausing, deleting,
   and signing out each produced `pageerror: TypeError: Failed to fetch`
   with ZERO user feedback (and Sign out's navigation never ran — the user
   stranded on /dashboard); the composer was the model citizen (catch →
   setError → `role="alert"` visible, zero pageerrors). The login card and
   footer newsletter both carry the catch contract — the gap was
   dashboard-mutations-only (F3).
3. **The resource-loading/preload survey**: React Float auto-preloads
   eager `<img>`s rendered in the SSR shell — the Gasparyan logo's
   `<link rel="preload" as="image">` shipped in the landing HTML and was
   INJECTED into every navbar-bearing route's head by the Next.js
   router's RSC prefetch (the logo `<Link href="/">`), where the image
   never renders: a console warning + a wasted fetch on six routes (F2).
   Verified on /faq (the link IS in the head, 0 imgs, the warning fires),
   /dashboard (logo link present, warning fires), and /login (bare card,
   no logo link → NO injection — the mechanism's control case). The LIVE
   adjudication: its gasparyan img is EAGER, no preload link, no warning
   (its own console noise is two 401 session-check errors — F4, the
   clone's console is cleaner). A controlled rebuild experiment proved
   `loading="lazy"` suppresses the Float emission entirely.
4. **The standing mobile-nav paired re-verification** (real-touch 390×844
   contexts): the clone's burger (342,16 24×24) taps open into the
   byte-identical panel (0,56 390×397, seven 44px rows; scroll-lock,
   Escape, resize guard all working; oklab bg = black/95
   rendering-identical). **No Tailwind v4 bug** in the clone's mobile nav;
   the live's burger remains pointer-blocked (D32).
5. **Resource-loading parity (informative)**: both sides ship the hero
   video without an explicit preload attribute; the live transfers
   ~2.1MB/11 requests; no rendered-output difference on this layer.

The remediation plan (`docs/remediation-plan-session12.md` F1–F8) was
written against these findings, then validated against the codebase
(every touchpoint re-read, every conflicting pin checked, the auth-POST
budget re-counted at 14/50 with the new suite) before execution.

## Phase 3 — Remediation (TDD; every pin observed RED first)

- **R1 — the flaky FAQ motion-parity pin de-flaked** (F1): the pre-reveal
  contract now pins through the STATIC HTML (`request.get("/faq")` must
  contain `<div style="opacity:0;transform:translateY(15px)">` — the SSR
  serialization, deterministic), the wrapper tag/cls checks stay
  (post-hydration stable), and the settled check converts to
  `expect.poll`. **10/10 consecutive isolated greens** (was 2/10
  failures).
- **R2 — the Gasparyan lazy load** (F2): RED first (the new
  `resource-hygiene.spec.ts` failed exactly on the injected link + a new
  smoke pin failed exactly on the landing-HTML preload); fix
  `loading="lazy"` on the logo-cloud img (proven to suppress the Float
  emission; below-fold visible parity unchanged); GREEN (2/2 e2e +
  47/47 smoke).
- **R3 — the dashboard's fault resilience** (F3): RED first (the new
  `resilience.spec.ts` — three pins failed on `pageerrors: TypeError:
  Failed to fetch`, the compose regression pin passed); fix: every
  mutation handler (`toggleStatus`/`remove`/`signOut`) adopts the
  composer's catch contract — catch BOTH network rejections AND `!res.ok`
  → a full-width `role="alert"` banner under the header (cleared per
  action); Sign out's failed path STAYS on /dashboard (the session cookie
  is still live — navigating away would lie to the user). GREEN 4/4.

## Phase 4 — Verification

- **Gate: ALL GREEN — 314 checks** (94 unit + 173 e2e = 167 + 2
  resource-hygiene + 4 resilience; 47 smoke = 46 + the lazy-img contract
  pin).
- **Paired re-survey**: word parity 1.0000 on ALL 8 routes — one
  mid-verification "regression" (0.757–0.955 on five routes) was
  **disproven as a ZOMBIE-SERVER artifact**: a stale :3000 process served
  old HTML referencing CSS chunks the new builds had deleted, rendering
  the page UNSTYLED (links concatenated in innerText — the tell); killed
  by port, re-verified clean against a fresh server (the
  Playwright/smoke suites were never affected — they boot their own
  servers). The mobile nav re-probed byte-identical; the console sweep v2
  re-run: zero noise on every route (the preload warning gone; the 404's
  404-document line and the wrong-password 401 line are browser-level
  logs the live ships too).
- **Screenshots**: all 17 standard shots refreshed + the new
  `14-dashboard-resilience-banner.png` (18 total) — VLM-verified (the
  banner shot shows "Could not update that workflow. Try again."; the
  control shot shows no error).

## Phase 5 — Docs & handoff

PAD (revision block; ledger **D67–D69**; §7 counts + the two new suites;
§11 key files), AGENTS (counts; **gotcha 26** — the traveling preload +
the fault-injection discipline + the zombie-server check), CLAUDE
(session-12 context, counts), README (314 badge, the resource-hygiene +
resilience suites, two troubleshooting rows), `saas-company_SKILL.md`
v2.11.0 (**lessons 32–33**), the remediation plan (checklist ticked),
this log, and the repo `worklog.md`. `.env.example` re-verified (no new
env vars). Commit + SSH push per the runbook.
