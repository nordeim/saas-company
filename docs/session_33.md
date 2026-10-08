# Session 33 Log — The Crash-Path-Honesty Audit (the Session-19 Remediation, 2026-10-08)

Continuing from Session 31/32 (remote main @ 37a0f4b — the verified
Session-18 push `1221194` + the session-32 transcript). The mandate:
refresh, review the session-31/32 + remediation-plan-18 docs, re-audit
against the live (with the standing mobile-navigation and Tailwind-v4
vigilance), remediate TDD-first, re-verify, document, push.

## Phase 0 — The workspace recovery

This session began with the sandbox **partially reset**: the repo was
still deployed at the workspace root (the Session-18 layout, node_modules
and .next intact) but the git checkout carried a **local-only UUID
commit** (`ca3dc22`, a sandbox-snapshot artifact committing the three
S18 survey scripts) while the remote had advanced to `37a0f4b` (the
session-32 transcript). Resolution: the scripts were backed up, local
main was reset to `origin/main`, the scripts were restored as
untracked + excluded, and a redundant fresh clone was removed — clean
tree at `37a0f4b` on main. The dev DB was re-pushed + re-seeded (the
canonical checksum `e7f6c011`), and the exported-`DATABASE_URL` trap
was LIVE (a stale absolute path) — neutralized per-command
(`env -u DATABASE_URL`) all session.

## Phase 1 — Docs & baseline

- Root docs (AGENTS 32 gotchas / CLAUDE / README / PAD ledger at D90 /
  SKILL v2.17.0) + status docs (session_31, session_32 — the previous
  conversation's transcript, remediation-plan-18 fully ticked but for
  the push step, which `1221194`'s wrapper-verified push closed,
  worklog) reviewed; the `skills/` folder excluded from every toolchain
  (re-verified).
- Baseline gate: lint ✓ typecheck ✓ Vitest 132/132 ✓ build ✓ smoke
  66/66 ✓ Playwright 197/197 — **395 checks, fully green, no flake.**

## Phase 2 — The audit (the reference UNCHANGED; two new survey surfaces + a currency layer)

**Drift battery** (8 routes, fresh :3070 boot, live vs clone): word
parity **1.0000 on every route**. **Mobile-nav paired real-touch
probe** (390×844, `hasTouch`): the clone's burger opens with a REAL
tap into the byte-identical panel — the same seven rows, all exactly
44px (the live's burger remains pointer-blocked, D32). **No Tailwind
v4 bug.** The live LOGIN re-verified with the operator credentials
(sepnetflix2023@outlook.com): sign-in redirects to `/` with the navbar
UNCHANGED and `/dashboard` renders the SPA 404 even authenticated —
**D62 holds.**

The Session-19 NEW surfaces — the layers of **crash-path honesty**
(what the wire carries when dependencies CRASH, not merely when input
is wrong):

1. **The crash-path envelope catalog:** a production server booted with
   an UNWRITABLE `DATABASE_URL` (`file:/dev/null/unwritable-s19/
   custom.db` — ENOTDIR by construction, PID-independent) and every
   endpoint probed with status + content-type + body. **SEVEN endpoints
   answered a BARE `500` with an EMPTY body and NO content-type** —
   login, register, newsletter, demo, `auth/me` (with a session minted
   against the probe server's known AUTH_SECRET), workflows GET and
   workflows POST (with the same session; the `[id]` family shares the
   structure). Only health (the S18 fix), the anonymous 401s, and the
   anonymous `auth/me` null-path answered envelopes. The architecture
   invariant — "no route returns bare JSON" — was violated on exactly
   the worst-day paths. **F1.** The catalog also captured the
   operator-sight fact that shaped the fix: the server log DOES carry
   the Prisma stack (Next.js logs UNhandled route errors — the stack +
   digest landed in the log), so a catch-and-envelope fix REMOVES that
   stack unless it re-logs it.
2. **The server-crash page layer:** `GET /dashboard` with the session
   answered Next's minimal `__next_error__` HTML — 9.6KB, the page's
   `<title>` but ZERO branded content. The S13 branded-boundary goal
   ("the app loses its identity exactly when the user is already having
   a bad day") never covered the SERVER half — its spec pins
   CLIENT-render crashes only. **F2.**
3. **The dependency-currency layer** (the S32 retrospective's
   suggestion): `npm audit` — exactly the single documented F10 braces
   chain, no new advisories; `npm outdated` — majors only (prisma 6→7/8,
   eslint 9→10, typescript 5.9→7, lucide 0.5→1.53) plus an in-range
   Playwright 1.64. **Adjudicated CLEAN** — the gate is green on the
   pinned set and the overrides are load-bearing (gotcha 9).

Adjudicated CLEAN with evidence: the security-header layer (the S9 F6
set re-verified in `next.config.ts`; no CSP is the documented
decision), the session-TTL semantics (7-day token, expiry re-validated
per request, `timingSafeEqual` on the HMAC), the logout CSRF surface
(POST-only), the client crash half (`apiFetch` + `res.json().catch` +
the S13 shape-check already degrade malformed bodies to banners), the
login page's DB independence (cookie-parse only — F2 is
dashboard-only), and D62 (re-verified).

## Phase 3 — Remediation, TDD-first

The plan (`docs/remediation-plan-session19.md`) was written and
validated against the codebase before any fix.

**R1 — the crash-path envelope (F1):** RED first (the catalog above;
then 5 unit pins observed RED — "apiRoute is not a function"; then the
smoke pins observed RED against the pre-fix build: envelope code
`got []`, content-type `got []`, `/dashboard` `got [500]`, no branded
fallback, `__next_error__` present — 74 passed / 5 failed). GREEN:
`apiRoute()` in `src/lib/api.ts` — whatever ESCAPES a handler becomes
the `INTERNAL_ERROR` envelope (generic copy — internals never leak;
`Cache-Control: private, no-store` via the `fail()` seam) AND the stack
is RESTORED to fd 2 via the S18-proven `writeSync(2, …)` seam (Next
only logs UNhandled errors, so the catch must re-log — 9
`[api:unhandled]` stacks verified in the broken server's log).
Classification inside handlers untouched (the S17 P2002→409 catch and
every 400/401/403/404/429 path fire first, pass through verbatim —
pinned by the handled-fail passthrough unit pin). Every exported
handler in all 10 route files wrapped. Unit 137/137; smoke 79/79 (13
new pins on a THIRD mini-server, :3230, unwritable DB + the same
AUTH_SECRET — the main server's session cookie is structurally valid
there; the S17 second-server pattern, own port per gotcha 31).

**R2 — the branded server-crash boundary (F2):** the dashboard page
gains TWO NARROW try/catch blocks (deliberately narrow — `redirect()`
throws a control error (NEXT_REDIRECT) that a single wide catch would
SWALLOW, silently breaking the S14 authenticated gate; the redirect
calls stay OUTSIDE both catches) rendering
`src/components/dashboard/dashboard-unavailable.tsx` — the error.tsx
visual language, a `role="alert"` region, Reload + Go-to-home, status
**200 by design** (the S18 health-probe pattern: the page ANSWERED
with an honest degraded state; `/api/health`'s `db` field owns the
alerting; ADR-004's degrade-not-fail extended from the API layer to
the page layer). Pinned by the smoke 200 / branded /
not-`__next_error__` pins.

## Phase 4 — The gate, re-verification & two tooling incidents

**Full gate: lint ✓ typecheck ✓ Vitest 137/137 ✓ build ✓ smoke 79/79 ✓
Playwright 197/197 — 413 checks, fully green, no flake.**

Re-verification: the crash catalog re-run on the remediated build —
every 500 carries `application/json` + `INTERNAL_ERROR`, `/dashboard`
serves the app's own shell at 200. Then the drift battery re-run — and
the first re-run COLLAPSED to 0.0000 with concatenated words
("FeaturesHow"), the gotcha-26/32 zombie signature: a stale :3070
process (the first drift boot's kill+wait silently failed — the
documented unreliability). The fresh-port move (:3075) "collapsed" the
same way — which exposed the SECOND incident, this session's own
tooling bug: the RUNNER booted :3075 but the SURVEY script carried a
hardcoded :3070 default, so the survey had silently probed the zombie
while the healthy server sat unused. The diagnosis pattern: curl the
served HTML's CSS chunk href vs disk + count stylesheets in Chromium
(the fresh server served 141 rules, bodyBg rgb(0,0,0), properly spaced
nav text) — then re-probed on the VERIFIED port (:3080): **word parity
1.0000 ×8, the mobile-nav byte-identical** (7 rows × 44px). The
:3100 e2e evidence was validated as fresh (the port was dead before
the run — no reuse of a stale server). Logged as gotcha 33 + SKILL
lesson 47: pass base URLs EXPLICITLY; never default a probe port.

Screenshots: the standard 20-shot set refreshed (fresh :3090 boot, the
canonical re-seeded workspace, checksum e7f6c011; the capture script
run with an explicit SHOT_BASE). VLM spot-checks ×5 — the first pass
flagged the dashboard's header, and the adjudication found the CHECK
PROMPT at fault (it expected a "Welcome back, Demo User" greeting the
dashboard never had — its header is the Nova.AI/Dashboard bar + user
email; the deterministic evidence — the e2e dashboard specs, the smoke
pins, the capture flow's URL waits — had already proven the page
correct). The prompts were corrected to the ACTUAL contracts; 5/5
PASS.

## Phase 5 — Documentation

PAD (revision block; ledger **D91–D92**; §7.1/7.2/7.3 counts; §11 key
files), AGENTS (counts + **gotcha 33** + the envelope invariant line
now names `apiRoute`), CLAUDE (session-19 context + the pre-push
checklist counts), README (413 badge, the crash-envelope and
workspace-unavailable troubleshooting rows, a stale 126/65 count pair
in the verification block fixed), the SKILL doc **v2.18.0 (lessons
46–47)**, `.env.example` re-verified in sync (no new vars), the
remediation plan session19 (ticked), this session log, the repo
worklog.

## Phase 6 — Commit & push

Single `:bug: fix:` commit to `main` (all code + tests + docs +
screenshots), pushed via `docs/ssh_git_wrapper_v3.py` with the
operator-supplied SSH key (the runbook's wrapper-verified sequence);
no branches (the operator contract).
