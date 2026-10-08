# Remediation Plan — Session 13 (2026-10-08)

**Scope:** Fix the issues, bugs and gaps found by the Session 13 parity +
production-readiness audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** fresh paired captures (word parity **1.0000 on all 8
routes** — the reference is UNCHANGED since Session 12; the standing
mobile-nav real-touch probe re-run: the clone's panel byte-identical and
working, **no Tailwind v4 bug**; the live's burger remains pointer-blocked,
D32). The Session-13 NEW audit surfaces — layers no prior session
systematically surveyed:

1. **The session-lifecycle layer**: what does the signed-in dashboard do
   when the session cookie EXPIRES (or is revoked) while the tab is open?
   The 7-day TTL (§6.1) makes this a certainty for every long-lived user,
   yet no prior session probed the post-expiry mutation path (Session 12
   fault-injected network-level ABORTS — a different failure class: an
   abort means "retry might work"; a 401 means "the session is gone").
2. **The render-fault layer**: what renders when a CLIENT-side render error
   occurs (malformed API data, a proxy corrupting a payload, version skew
   between API and UI)? The repo ships no `error.tsx` / `global-error.tsx`
   — Next.js's DEFAULT error UI (generic, light, unbranded) answers.
   Code-level reachability confirmed: `refresh()` guards `payload?.ok` but
   NOT the shape of `payload.data` — a `{ok:true,data:null}` envelope
   passes the guard, `setWorkflows(null)` lands, and the `stats` memo's
   `workflows.filter` crashes on the next render.
3. **The focus-management layer**: the mobile menu's keyboard contract.
   The burger carries `aria-expanded`/`aria-controls` (good), but Escape
   closes the panel WITHOUT returning focus to the burger — the focused
   menu link unmounts and `document.activeElement` falls to `body`
   (WCAG 2.4.3 focus-order; a keyboard user loses their place in the
   page). The live's own menu is pointer-blocked (D32) and cannot serve
   as the reference here — pure superset (D55 family).
4. **The standing re-verification battery** (every session): the drift
   check + the mobile-nav paired real-touch probe (the operator's
   standing ask, with explicit Tailwind-v4-bug vigilance).

Also audited and found CLEAN (non-findings): the login form's
autocomplete contract (`email` / `current-password` / `new-password`
already present — the a11y superset shipped in a prior session), the auth
cookie flags (`httpOnly`, `sameSite=lax`, `secure` in production, 7-day
`maxAge`), the compose double-submit guard (`composing` + `disabled`), the
per-row busy guard on pause/delete, and the API envelope's 401 shape
(`fail("UNAUTHORIZED", "Session no longer valid.", 401)` — the exact
signal the client needs for R1).

Every conclusion below was settled with computed probes, cookie
deletion, route fulfillment, or code-level reachability analysis — never
VLM impressions alone.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | **Session-expiry (401) UX: the dashboard's mutation handlers treat a dead session exactly like a dead network — a "Try again" banner that lies, and the user stranded on /dashboard.** Probe (cookie deleted post-sign-in, then Pause clicked): the PATCH returns the 401 envelope, `!res.ok` throws, the banner reads "Could not update that workflow. Try again." — but retrying will 401 FOREVER (the session is gone server-side). Same for `remove` ("Could not delete that workflow. Try again.") and `compose` ("Could not compose that workflow. Try again." — via the POST 401 after the generate 401 falls back to the template draft). `refresh()` silently keeps stale data (`res.ok` false → no setState, no signal). Meanwhile the SERVER-side gate already upholds the honest contract for page loads: anonymous `/dashboard` → `redirect("/login?from_url=/dashboard")` (`src/app/dashboard/page.tsx:14`). The client-side mutation path must uphold the SAME contract: a 401 means "sign in again", not "try again". The live has no dashboard (D62 — superset surface; the D59 precedent: fix and document) | `src/components/dashboard/dashboard-app.tsx:113-146` (+ `refresh()` at :73) | HIGH (production: every 7-day+ user hits this; the message actively misleads) | Verified (cookie-deletion probe: URL stayed /dashboard, the lying banner rendered, zero pageerrors) | Superset quality (session lifecycle) |
| F2 | **No error boundaries — a client-side render error surfaces Next.js's DEFAULT unbranded error UI ("This page couldn't load — Reload to try again, or go back"), and the most reachable crash path is one malformed envelope away.** Code reachability: `refresh()` runs `setWorkflows(payload.data)` guarded by `res.ok && payload?.ok` — `data` is never shape-checked, so a `{ok:true,data:null}` response (proxy corruption, API bug, version skew) sets `workflows=null` and the `stats` memo's `workflows.filter` throws `TypeError: Cannot read properties of null (reading 'filter')` on the next render. Probe (route-fulfilled malformed GET + successful PATCH + Pause click): the pageerror fired and Next.js's generic light error page replaced the dashboard — no brand canvas, no Vend Sans, no role=alert, English boilerplate, and NO scoped recovery (only full Reload/Back). The repo ships NO `src/app/error.tsx` and NO `src/app/global-error.tsx`. The live is an SPA with no equivalent surface (D62/D59: superset, fix and document) | `src/app/` (missing `error.tsx` + `global-error.tsx`); `src/components/dashboard/dashboard-app.tsx:73-77` (`refresh()`) | HIGH (production: any render fault — not just this path — currently debrandizes the app) | Verified (route-fulfillment probe: the crash + the default Next UI captured) | Superset quality (render faults) |
| F3 | **Mobile-menu Escape close loses focus: the focused menu link unmounts and `document.activeElement` falls to `body` — the burger never regains focus.** The burger carries `aria-expanded`/`aria-controls`/state-swapping `aria-label` (good ARIA semantics), but the Escape handler (`setOpen(false)`) unmounts the panel while focus sits on one of its links — focus drops to `body`, and a keyboard user must Tab from the top of the page to return. Probe (link focused → Escape): `activeAfterEscape: {tag: BODY, isBurger: false}`. The disclosure pattern's contract: close → return focus to the DISCLOSURE (the burger). The live's menu is pointer-blocked (D32) and its keyboard story is irrelevant — pure superset (D55 a11y family) | `src/components/site/navbar.tsx:78-88` (the Escape effect) | MEDIUM (a11y: keyboard/AT users below md) | Verified (focus probe at 390×844 hasTouch) | Superset quality (a11y) |
| F4 | **Non-finding — the standing mobile-nav probe: CLEAN, byte-identical, NO Tailwind v4 bug** (the operator's standing ask): burger 342,16 24×24 (identical classes to the live's), tap opens the byte-identical panel (0,56 390×397, seven 44px rows, `md:hidden bg-black/95 backdrop-blur-xl border-b border-white/5`, oklab bg = black/95 rendering-identical), scroll-lock while open, Escape closes, the resize guard closes across 768 and restores scroll. The live's burger remains pointer-blocked by its empty toast portal (D32) | — | CLEAN | Verified (real-touch paired probe) | Non-finding |
| F5 | **Non-finding — drift check: word parity 1.0000 on all 8 routes; the reference is UNCHANGED since Session 12.** | — | CLEAN | Verified (scroll-passed innerText, bag-of-words) | Non-finding |
| F6 | **Non-findings — audited clean this session:** the login form's autocomplete attributes (`email` / `current-password` / `new-password` — already the a11y superset); the auth cookie flags (httpOnly, sameSite=lax, secure-in-prod, 7-day maxAge); the compose double-submit guard (`if (composing || !idea.trim()) return` + `disabled`); the per-row busy guard (`busyId === w.id` disables pause/delete); the API's 401 envelope shape (`{ok:false,error:{code:"UNAUTHORIZED",message:"Session no longer valid."}}` — the exact signal R1 keys on) | — | CLEAN | Verified (code audit) | Non-finding |

### Non-findings (checked, clean — dismissed with evidence)

- **Word parity 1.0000 on all 8 routes** (the reference unchanged) — F5.
- **The mobile navigation: byte-identical and working; NO Tailwind v4 bug**
  (F4 — the standing ask, re-probed with real-touch contexts; the v4
  engine's oklab serialization renders black/95 exactly).
- **The login card's autocomplete contract** — already shipped.
- **The auth cookie lifecycle** — flags and TTL are correct; the gap is
  purely the CLIENT's response to expiry (F1).
- **Double-submit guards** — compose and the row actions are guarded.
- **`loading.tsx` considered and REJECTED**: the marketing routes are
  statically prerendered (no navigation wait exists) and the dashboard's
  server segment resolves in single-digit ms locally — a route-level
  loading skeleton would FLASH on every entry for no user benefit at
  current latency. Documented here so the next session doesn't re-litigate.

---

## 2. Remediation (TDD — every pin observed RED before its GREEN)

### R1 — Session-expiry redirect (F1): 401 on any dashboard API call → the login page, same contract as the server gate

`src/components/dashboard/dashboard-app.tsx` — a tiny shared helper:

```ts
async function apiFetch(input: string, init?: RequestInit) {
  const res = await fetch(input, init);
  if (res.status === 401) {
    // The session is gone server-side — the same contract as the server
    // gate (page.tsx:14): go re-authenticate. Staying here + "Try again"
    // would lie (every retry 401s).
    router.push("/login?from_url=/dashboard");
    throw new SessionExpiredError(); // caught by the existing catch blocks
  }
  return res;
}
```

- `toggleStatus` / `remove` / `compose`'s two fetches / `refresh` route
  through `apiFetch`. A 401 redirects to `/login?from_url=/dashboard`
  (the login page already consumes `from_url`; the default is
  `/dashboard`, so the param is belt-and-braces explicit).
- The thrown sentinel is caught by the EXISTING catch blocks → the banner
  never renders for 401s (the redirect is the feedback); non-401 failures
  keep the Session-12 banner contract untouched (the resilience suite's
  abort pins stay valid — abort ≠ 401).
- `refresh()` additionally returns early on 401 (no stale-state lie).

**Pins (RED first):** `tests/e2e/session-lifecycle.spec.ts` (new — one
sign-in per test, 3 auth POSTs, budget 17/50):
(a) cookie deleted → Pause → the URL becomes `/login?from_url=/dashboard`
(pre-fix RED: the URL stays /dashboard + the lying banner);
(b) cookie deleted → Delete → same redirect contract;
(c) cookie deleted → Compose → same redirect contract (the generate 401
must not strand the user either);
(d) the regression pin: a NON-401 fault (route.abort) still shows the
Session-12 banner and stays on /dashboard (the two failure classes stay
distinct).

### R2 — Error boundaries + envelope hardening (F2): a branded `error.tsx` + `global-error.tsx`, and `refresh()` shape-checks `data`

1. `src/app/error.tsx` (new, client component): the dark-brand recovery
   card — `#000` canvas, Vend Sans, a `role="alert"` message ("Something
   went wrong loading this page."), a **Try again** button
   (`reset()` — remounts the segment with the server-provided initial
   state) and a **Go to home** link. Must NOT re-render the navbar (the
   boundary replaces the route segment).
2. `src/app/global-error.tsx` (new, client component): the last-resort
   root boundary — same branding, inline `<html><body>` shell, Try again
   (`reset()`) + home link. Never reached in normal operation (the
   route-level boundary answers first) but required for layout-level
   failures.
3. `src/components/dashboard/dashboard-app.tsx` `refresh()`: setState only
   on `Array.isArray(payload.data)` — the reachable null crash from the
   audit becomes inert; the boundary remains the safety net for every
   OTHER malformed shape (e.g. a row with `runs: null` still crashes the
   memo — correctly caught by the boundary).

**Pins (RED first):** `tests/e2e/error-boundary.spec.ts` (new — one
sign-in, 1 auth POST, budget 15/50):
(a) route-fulfill the LIST endpoint with a contract-violating ROW
(`{ok:true,data:[{…,runs:null}]}` — passes the new Array.isArray guard,
still crashes `w.runs.toLocaleString()`) + a successful PATCH → click
Pause → the BRANDED boundary renders (`role="alert"` + "Something went
wrong" + the Try again button), NOT Next.js default copy ("This page
couldn't load"); pre-fix RED: the default page.
(b) click **Try again** → the segment remounts with the server-provided
initial state → the dashboard heading + workflow list render again (the
fulfilled route only intercepts the GET refresh, and no refresh runs on
remount).
- Console note (honest contract): a genuine render fault logs the error
  through the browser's error reporting (React's error reporting path) —
  the pin asserts the RECOVERY UI, not console silence, for this suite
  (the zero-pageerror tiers remain pinned on every non-faulted route by
  the hydration + console suites).

### R3 — Mobile-menu focus return (F3): Escape closes AND returns focus to the burger

`src/components/site/navbar.tsx` — a `burgerRef` (`useRef<HTMLButtonElement>`)
on the burger button; the Escape handler becomes
`{ setOpen(false); burgerRef.current?.focus(); }`. Focus return on
Escape-close is the disclosure pattern's contract; tap-close and
link-navigate already move focus naturally (the click target). The
resize-guard close keeps its current behavior (focus return is pointless
when the menu is gone and the layout jumped to desktop).

**Pins (RED first):** extend `tests/e2e/mobile-navigation.spec.ts` (+1
test, no new sign-in): open the menu → focus the first link → press
Escape → `document.activeElement` IS the burger (`aria-controls ===
"mobile-menu"`); pre-fix RED: `body`.

### R4 — Documentation alignment

- PAD: revision block; ledger rows **D70–D72** (D70 the session-expiry
  redirect superset; D71 the branded error-boundary superset + the
  refresh shape-guard; D72 the mobile-menu Escape focus-return superset);
  §7 counts (+2 suites, new totals); §11 key files (the two new specs +
  the two new boundary files).
- AGENTS.md: **gotcha 27** (a 401 is not a network fault — failure
  CLASSES need distinct UI contracts: abort → "try again" banner, 401 →
  re-authenticate redirect; and: ship `error.tsx`/`global-error.tsx`
  before you need them — the default Next UI debrandizes the app exactly
  when the user is already having a bad day) + the counts.
- CLAUDE.md: session-13 context block + counts. README: badge/counts +
  the two new suites in the features row + a troubleshooting row
  (session-expiry redirect + the error boundary).
- `saas-company_SKILL.md`: version bump v2.12.0 + **lessons 34–35**
  (survey the SESSION-LIFECYCLE layer — expire the cookie mid-session and
  watch every mutation: the happy path hides lying banners; and: an app
  without error boundaries is one malformed envelope away from losing its
  brand at the worst moment — pin the boundary with a route-fulfilled
  contract violation, not a synthetic throw).
- `worklog.md` + `docs/session_21.md` + this plan (checklist ticked);
  screenshots refresh (all 18 against the remediated build — no NEW
  standard shot this session: the error boundary + the redirect are
  fault-time UIs captured as evidence shots only if VLM-verified);
  `.env.example` re-verified (no new env vars — all changes are
  code/test/docs).

---

## 3. Pre-execution codebase validation (done before writing this plan)

- Baseline gate on the pulled tree (main @ de7a2e3): lint ✓ typecheck ✓
  Vitest 94/94 ✓ build ✓ smoke 47/47 ✓ Playwright **173/173** — the
  inherited gate is fully green (no flake this session).
- `.env` `DATABASE_URL="file:../db/custom.db"` with `db/custom.db` pushed
  + seeded at the repo root ✓ (the shell's exported absolute
  `DATABASE_URL` trap is LIVE in this sandbox — neutralized per-command
  with `env -u DATABASE_URL` all session, per AGENTS.md gotcha 1).
- The RED probes for F1/F2/F3 executed against the current standalone
  build (see §1 — every finding's mechanism verified before planning).
- Existing pins audited for conflicts: the resilience suite pins
  route-ABORT behavior (a different failure class — its four pins stay
  valid under R1; R1's regression pin (d) double-locks the distinction);
  no spec pins `document.activeElement` after Escape (safe to add); no
  spec pins the absence of `error.tsx` (safe to add); the smoke suite's
  landing/HTML pins are untouched by all three fixes; the auth POST
  budget after the two new signed-in suites is 15–17/50 (the webServer's
  pinned `AUTH_RATE_LIMIT_MAX`) ✓.
- The login page's `from_url` contract verified (`params.get("from_url")
  || "/dashboard"` — R1's redirect target matches the server gate
  exactly) ✓; the 401 envelope shape verified in `src/lib/api.ts`
  (`requireSession` → `fail("UNAUTHORIZED", …, 401)`) ✓.
- `error.tsx` boundary placement verified against Next.js 16 App Router
  semantics (a route-segment client boundary resets that segment;
  `reset()` re-renders with the server props — the dashboard's
  `initialWorkflows` comes from the server component, so Try again
  restores real data) ✓.

## 4. Execution order

R1 (RED session-lifecycle pins → the 401 redirect helper → GREEN) →
R2 (RED error-boundary pins → `error.tsx` + `global-error.tsx` + the
`Array.isArray` guard → rebuild → GREEN) → R3 (RED focus pin →
`burgerRef` + Escape focus return → GREEN) → full gate (lint →
typecheck → 94 unit → build → smoke → e2e = **317+ checks**) → paired
re-verification (word parity ×8, the mobile-nav real-touch probe + the
new focus assertion, the RED probes re-run GREEN: cookie-expiry
redirects, the branded boundary, focus return) → screenshots refresh →
docs (R4) → commit + SSH push per the runbook.

### ToDo checklist

- [x] R1: RED `session-lifecycle.spec.ts` (3 RED pins + 1 regression pin) → the `apiFetch` 401-redirect helper → all GREEN
- [x] R2: RED `error-boundary.spec.ts` (2 pins) → `error.tsx` + `global-error.tsx` + the `refresh()` shape guard → rebuild → all GREEN
- [x] R3: RED mobile-navigation focus pin → `burgerRef` + Escape focus return → GREEN
- [x] Full gate: lint → typecheck → 94 unit → build → 47 smoke → 180 e2e (321 checks)
- [x] Paired re-verification: word parity 1.0000 ×8, mobile-nav real-touch probe (+ focus assertion), the three RED probes re-run GREEN (cookie-expiry redirects, branded boundary + Try-again restore, focus returns to burger; console sweep zero-noise ×8)
- [x] Screenshots: 18 standard shots refreshed + the new 15-error-boundary evidence shot (19 total, VLM-verified)
- [x] Docs: PAD (revision block, D70–D72, §7, §11), AGENTS (gotcha 27 + counts), CLAUDE (session-13 context), README (badge + rows), SKILL v2.12.0 (lessons 34–35), session log `docs/session_21.md`, worklog, this plan's checklist ticked
- [x] `.env.example` re-verified (no changes — no new env vars this session)
- [ ] Commit (Conventional Commits + emoji) + SSH push via `docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified)
