# Remediation Plan — Session 12 (2026-10-08)

**Scope:** Fix the issues, bugs and gaps found by the Session 12 parity +
production-readiness audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** fresh paired captures (word parity **1.0000 on all 8
routes** — the reference is UNCHANGED since Session 11). The Session-12 NEW
audit surfaces — layers no prior session systematically surveyed:

1. **A console-noise sweep v2** (every route + interactions): Session 11
   captured `pageerror` only; this sweep adds `unhandledrejection`,
   `console.error`, and `console.warn` on every route (landing, login, FAQ,
   four legal pages, 404, dashboard signed-in) AND during interactions (the
   FAQ accordion, the pricing toggle, a newsletter submit, a wrong-password
   login, the dashboard composer + pause).
2. **The first fault-injection sweep** (network-level failures): Playwright
   `route.abort()` on the dashboard's API calls mid-interaction — the
   production-readiness question the prior sessions never asked: what does
   the UI do when the network dies mid-action? (Every handler's fetch was
   audited for the catch contract; `compose()` vs `toggleStatus`/`remove`/
   `signOut` were compared empirically.)
3. **The resource-loading/preload layer**: who emits `<link rel="preload">`,
   where it travels (React Float + the Next.js router's RSC prefetch
   injection into other routes' heads), what the browser warns about, and
   how the live's SPA compares (its img attributes, its video attributes,
   its transfer profile).
4. **The standing mobile-nav paired re-verification** (real-touch 390×844
   contexts — the operator's standing ask) + the standing drift check.
5. **A live-side console adjudication** (the live's own console errors vs
   the clone's — the parity tier of console hygiene).

Every conclusion below was settled with computed styles, rendered probes,
route-aborted interactions, controlled rebuild experiments, or live-side
paired audits — never VLM impressions alone.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | **The FAQ motion-parity pin is FLAKY — its `pre` phase samples a transient pre-hydration state with no synchronization.** `motion-parity.spec.ts:174` does `page.goto("/faq")` then IMMEDIATELY evaluates the first FAQ item's wrapper style, asserting `opacity:0`/`translateY(15px)`. But the first FAQ item is IN the initial viewport, so the rAF reveal engine (delay 0, 400ms) starts the entrance on hydration — when the evaluate lands late (loaded machine, warm cache, CDP round-trip jitter), the wrapper has already settled to `opacity: 1; transform: none;` and the `toContain("opacity:0")` assertion fails. Observed: 1 failure in 2 full-suite runs this session + 2/10 isolated runs (then 16 consecutive passes — load-dependent timing). The gate was documented green (307/307) at the end of Session 11 on a quiet machine. Same defect class as Session-11 F1 (the ring pin): a transient-state sample without synchronization | `tests/e2e/motion-parity.spec.ts:174-196` | HIGH (test infra) | Verified (3 observed failures across 2 full-suite + 26 isolated runs; the race window is structural — the pre state exists only between DOM-ready and the reveal's completion) | Test infrastructure |
| F2 | **React Float's automatic `<img>` preload for the Gasparyan logo ships in the landing HTML and is INJECTED into every navbar-bearing route's head by the Next.js router's RSC prefetch — where the image never renders: a console WARNING on every content route + a wasted fetch.** The mechanism (verified with paired probes): (a) React 19's Float emits `<link rel="preload" href="/media/gasparyan-logo.svg" as="image">` for the eager `<img>` rendered in the landing's SSR shell (it appears in `index.html` but in NO other route's static HTML); (b) every route that renders the navbar carries the logo `<Link href="/">` — Next.js prefetches the / route's RSC payload when the link enters the viewport; (c) the payload carries the landing's Float head links, which React injects into the CURRENT page's head; (d) the image never renders on /faq, /privacy, /terms, /accessibility, /refund-policy, or /dashboard → the browser fires "The resource …/gasparyan-logo.svg was preloaded using link preload but not used within a few seconds…" and the fetch is wasted. Verified on /faq (9s probe: the link IS in the head, 0 imgs on the page, the warning fires), /dashboard (logoLinkPresent: true, warning fires), and /login (bare card, no logo link → NO injection — confirming the mechanism). The LIVE adjudication: the live's gasparyan img is EAGER (`loading: null`), carries NO preload link, and its SPA has no RSC-prefetch injection — the live's console carries NO such warning (its own console noise is its two 401 session-check XHRs). Controlled experiment (this session): adding `loading="lazy"` to the img suppresses the Float preload emission entirely (rebuilt index.html: 0 gasparyan preload links) — the logo cloud is below the fold, a 4KB local SVG appears instantly on scroll-near, and visible parity is unchanged | `src/components/sections/logo-cloud.tsx:85` (the `<img>`) | MEDIUM (production: console noise on 6 routes + wasted fetch) | Verified (paired probes on 4 routes + the live-side img/preload/console audit + the controlled lazy rebuild experiment) | Superset quality (resource hygiene) |
| F3 | **The dashboard's `toggleStatus`/`remove`/`signOut` have NO catch — under network-level failures they produce console pageerrors with ZERO user feedback (and Sign out's navigation never runs).** Fault-injected with Playwright `route.abort("connectionfailed")` on the signed-in dashboard: pausing a workflow → `pageerror: TypeError: Failed to fetch` (the uncaught rejection surfaces as a page error), the busy state clears but the UI silently shows stale data; deleting → same; Sign out → same pageerror AND `router.push("/")` never executes — the user is stuck on /dashboard with a dead button and no explanation. The composer (`compose()`) is the model citizen: catch → `setError("Could not compose that workflow. Try again.")` → a visible `role="alert"` banner (verified under the same fault: errorVisible true, ZERO pageerrors). The login card and the footer newsletter form both carry the same try/catch contract. The live has NO dashboard (D62 — this is the clone's superset surface; the D59 precedent applies: fix and document) | `src/components/dashboard/dashboard-app.tsx:108-136` | MEDIUM (production: UX + console hygiene under faults) | Verified (fault-injection probes with correct aria-label selectors: pageerrors captured on all three paths; compose clean) | Superset quality (resilience) |
| F4 | **The LIVE's own console ships TWO 401 resource errors on its landing** (its session-check XHRs return 401 for anonymous visitors and the browser logs them). The clone's landing console is CLEAN (the navbar never calls /api/auth/me unauthenticated). This is the console-hygiene tier of the D55 family: the clone beats the live. Ledger note only — parity law does not require reproducing the live's console errors | PAD §5.4 ledger (documentation) | INFO | Verified (live-side console capture, 6s dwell) | Parity (document) |
| F5 | **Console-noise sweep v2: CLEAN on every route and interaction.** Zero `pageerror`, zero `unhandledrejection`, zero `console.error`, zero `console.warn` on /, /login, /faq, /privacy, /terms, /accessibility, /refund-policy (the 404's single "Failed to load resource: 404" line is the browser's own log for the 404 DOCUMENT — the live's 404 does the same; the wrong-password 401 line is the browser's fetch log — the live's login fires the same). The only route-level noise anywhere is F2's preload warning (on the navbar routes) — everything else is F3's fault-time pageerrors | — | CLEAN | Verified (the v2 sweep, 2.2s dwell per route + interaction buckets) | Non-finding (except F2/F3) |
| F6 | **Drift check: word parity 1.0000 on all 8 routes — the reference is UNCHANGED since Session 11.** | — | CLEAN | Verified (scroll-passed innerText, bag-of-words) | Non-finding |
| F7 | **The mobile navigation menu: WORKING, byte-identical, NO Tailwind v4 bug** (the standing operator ask, re-verified with real-touch 390×844 contexts): the clone's burger (342,16 24×24, `md:hidden text-white/80 hover:text-white`) taps open into the byte-identical panel (0,56 390×397, seven rows all 44px — Features #features, How It Works #how-it-works, Pricing #pricing, Testimonials #testimonials, FAQ /faq, Log In, Get Started #pricing), the open menu scroll-locks (`body overflow: hidden`), Escape closes, link-tap closes + navigates (e2e-pinned via `#mobile-menu`; the survey probe's `navigateCloses: false` is the known artifact — its locator matches the hidden desktop pill), and the resize guard closes across 768. The panel's computed styles render exactly (display block, opacity 1, `oklab(0 0 0 / 0.95)` = black/95 rendering-identical, backdrop blur(24px)). The live's own burger remains pointer-blocked by its empty toast portal (D32) | — | CLEAN | Verified (real-touch paired probe) | Non-finding |
| F8 | **Resource-loading parity: no action.** Both sides ship the hero video without an explicit `preload` attribute; the live's video element carries no `muted` ATTRIBUTE (its autoplay relies on the platform) while the clone's `muted` is required for autoplay to actually run — the working superset choice (already implemented, md5-identical bytes). The live transfers ~2.1MB across 11 requests (one 190KB SPA bundle + the 1.9MB video from its CDN); the clone's RSC architecture splits differently by design. The live's only `<img>` (Gasparyan) is eager with no preload (see F2 for the clone-side divergence this creates). No rendered-output difference exists on this layer | — | CLEAN (informative) | Verified (live-side video/img attribute capture + resource summary) | Non-finding |

### Non-findings (checked, clean — dismissed with evidence)

- **Word parity 1.0000 on all 8 routes** (the reference unchanged).
- **`unhandledrejection` never fires on any route or interaction** — only
  the fault-injected F3 paths produce pageerrors (as `TypeError: Failed to
  fetch` pageerrors, not rejection events).
- **The fonts' preload links are app-wide and USED** (the Vend Sans faces
  render on every route — no preload warnings for them).
- **The /login route gets NO gasparyan injection** (the bare auth card
  carries no logo Link — the mechanism's control case).
- **The 404's and the wrong-password login's console lines are browser-level
  resource logs, identical on the live** (parity, not defects).
- **The live's console warnings: NONE** (its noise is the two 401 errors —
  F4); the clone's only warning was F2's preload warning.

---

## 2. Remediation (TDD — every pin observed RED before its GREEN)

### R1 — The flaky FAQ motion-parity pin (F1): pin the pre-reveal state via the SSR HTML contract

`tests/e2e/motion-parity.spec.ts:174` — the remediated test:

1. **The pre-reveal contract moves to the STATIC HTML** (deterministic —
   no race with the reveal engine): `request.get("/faq")` must return HTML
   containing `<div style="opacity:0;transform:translateY(15px)">` (the
   SSR serialization of the unclassed Reveal wrapper — verified in the
   built `faq.html`; the heading block's `translateY(20px)` does not
   collide with the substring).
2. The wrapper tag/class DOM checks stay (stable post-hydration — the
   wrapper is an unclassed DIV in SSR and after).
3. **The settled check converts to `expect.poll`** (never a fixed wait +
   exact string against a transitioning property — the Session-11 R1
   lesson): poll the wrapper's `style` attribute to
   `opacity: 1; transform: none;`.

**RED evidence:** the captured full-suite failure + the 2/10 isolated
reproductions. **GREEN proof:** 10/10 consecutive isolated runs + the full
suite.

### R2 — The Gasparyan preload injection (F2): `loading="lazy"` on the img

`src/components/sections/logo-cloud.tsx:85` — the `<img>` gains
`loading="lazy"` (the controlled experiment proved this suppresses React
Float's preload emission; the below-fold logo cloud appears identically —
a 4KB local SVG loads instantly on scroll-near). Ledger the loading-layer
deviation (the live's img is eager; the visible layer is identical).

**Pins (RED first — both fail against the current build):**
- `tests/e2e/resource-hygiene.spec.ts` (new): (a) on /faq, after the RSC
  prefetch window (~5s dwell), the document head contains ZERO
  `link[href*="gasparyan"]` elements AND zero console warnings mentioning
  "preload"; (b) on /, the logo-cloud img LOADS when scrolled into view
  (`naturalWidth > 0`, `complete`) — the visible-parity guard.
- `scripts/smoke-test.sh` (+1): the landing HTML must NOT contain a
  gasparyan `as="image"` preload link (the static contract).

### R3 — The dashboard's fault resilience (F3): the catch contract + a visible banner

`src/components/dashboard/dashboard-app.tsx` — `toggleStatus`, `remove`, and
`signOut` adopt the composer's catch contract:

- A new `actionError` state + a full-width `role="alert"` banner under the
  header (the composer's error lives inside the composer card — invisible
  to a user working the workflow list; the banner is visible from every
  scroll position). Cleared at the start of every action; styled like the
  composer's error (`text-sm text-red-400`).
- `toggleStatus`/`remove`: `try { fetch; if (!res.ok) throw; refresh(); }
  catch { setActionError("Could not update/delete that workflow. Try
  again."); } finally { setBusyId(null); }` — the `!res.ok` check extends
  the contract to HTTP-level failures (500/404), matching `compose()`'s
  `if (!createRes.ok) throw`.
- `signOut`: `try { await fetch(logout); router.push("/"); refresh(); }
  catch { setActionError("Could not sign out. Check your connection and
  try again."); }` — the user stays on /dashboard with an honest message
  (navigating away while the session cookie lives would lie to the user).

**Pins (RED first — 3 fail against the current build):**
`tests/e2e/resilience.spec.ts` (new, one sign-in per test — 4 auth POSTs,
budget 14/50): (a) PATCH aborted → zero pageerrors + the banner visible +
the workflow's status unchanged in the UI; (b) DELETE aborted → zero
pageerrors + the banner visible; (c) logout aborted → zero pageerrors + the
banner visible + the URL still /dashboard; (d) generate/create aborted →
the composer's own error visible + zero pageerrors (the regression pin for
the already-correct path).

### R4 — Documentation alignment

- PAD: revision block; ledger rows **D67–D69** (the lazy-img
  loading-layer deviation + its console-hygiene win; the dashboard
  fault-resilience superset; the live's 401 console noise vs the clone's
  clean console — the D55-family console tier); §7 counts; §11 key files
  (the two new specs).
- AGENTS.md: **gotcha 26** (React Float auto-preloads `<img>`s rendered in
  the SSR shell — and the Next.js router's RSC prefetch injects those head
  links into every route that links to the page, so a route-specific image
  preload becomes app-wide noise; `loading="lazy"` suppresses the
  emission) + the counts.
- CLAUDE.md: session-12 context block + counts. README: badge/counts + a
  troubleshooting row (the lazy logo + the banner behavior).
- `saas-company_SKILL.md`: version bump v2.11.0 + **lessons 32–33** (survey
  the FAULT layer — abort the network mid-action and watch the console +
  the UI: a clean happy path hides uncaught rejections; and: React Float's
  automatic preloads travel through RSC prefetch into routes that never
  render the resource — audit `<link rel="preload">` on EVERY route, not
  just the page that owns the resource).
- `worklog.md` + `docs/session_19.md` + this plan; screenshots refresh;
  `.env.example` re-verified (no new env vars — all changes are
  code/test/docs).

---

## 3. Pre-execution codebase validation (done before writing this plan)

- Baseline gate on the pulled tree (main @ 23f19fb): lint ✓ typecheck ✓
  Vitest 94/94 ✓ build ✓ smoke 46/46 ✓ Playwright **166/167 → 167/167**
  (the one failure being F1's flake — reproduced 2/10 in isolation,
  root-caused structurally).
- `.env` `DATABASE_URL="file:../db/custom.db"` with `db/custom.db` pushed +
  seeded at the repo root ✓ (the shell's exported absolute `DATABASE_URL`
  trap is LIVE in this sandbox — neutralized per-command with
  `env -u DATABASE_URL` all session, per AGENTS.md gotcha 1).
- The SSR serialization for R1's static contract verified in the built
  `faq.html` (`<div style="opacity:0;transform:translateY(15px)">`) ✓.
- The lazy experiment for R2 verified against a scratch build (the preload
  disappears; the build compiles clean; the source was REVERTED pending
  TDD execution) ✓.
- The fault-injection findings for R3 verified with correct aria-label
  selectors (`button[aria-label^="Pause"]`, `button[aria-label^="Delete"]`,
  `aria-label="Workflow idea"`, the "Compose" submit) ✓ — the first probe
  round's false negatives (has-text selectors) were corrected and
  re-verified.
- Existing pins audited for conflicts: the dashboard spec has NO pins on
  the toggle/delete/signout handlers' error behavior (safe to add the
  catch contract); no spec pins the gasparyan img's `loading` attribute
  (safe to add lazy); the motion-parity FAQ test is the only consumer of
  the pre-reveal inline style (safe to restructure); the auth POST budget
  after R3's +4 sign-ins is 14/50 (the webServer's pinned
  `AUTH_RATE_LIMIT_MAX`) ✓.
- The e2e sign-in helper pattern (`getByLabel("Email")` /
  `getByRole("button", { name: "Sign in", exact: true })`) reused for the
  resilience spec ✓; the smoke suite's `LANDING` variable is the insertion
  point for R2's static pin ✓.

## 4. Execution order

R1 (de-flake the FAQ pin; verify with 10/10 isolated runs) → R2 (RED
resource-hygiene pins → the lazy img → rebuild → GREEN) → R3 (RED
resilience pins → the catch contract + banner → GREEN) → full gate (lint →
typecheck → 94 unit → build → 47 smoke → 173 e2e = **314 checks**) →
paired re-verification (word parity, the mobile-nav probe, the console
sweep v2 re-run, the fault-injection re-run, the preload re-probe) →
screenshots refresh → docs (R4) → commit + SSH push per the runbook.

### ToDo checklist

- [x] R1: restructure `motion-parity.spec.ts:174` (SSR contract + poll); 10/10 isolated greens
- [x] R2: RED `resource-hygiene.spec.ts` (2 pins) + RED smoke pin → `loading="lazy"` → rebuild → all GREEN
- [x] R3: RED `resilience.spec.ts` (3 RED pins + 1 regression pin) → catch contract + `actionError` banner → all GREEN
- [x] Full gate: lint → typecheck → 94 unit → build → 47 smoke → 173 e2e (314 checks)
- [x] Paired re-verification: word parity 1.0000 ×8, mobile-nav real-touch probe, console sweep v2 (zero noise), fault-injection re-run (zero pageerrors + banners), preload re-probe (zero injection)
- [x] Screenshots: refresh the 17 standard shots + the new resilience-banner shot (18 total) against the remediated build
- [x] Docs: PAD (revision block, D67–D69, §7, §11), AGENTS (gotcha 26 + counts), CLAUDE (session-12 context), README (badge + rows), SKILL v2.11.0 (lessons 32–33), session log `docs/session_19.md`, worklog, this plan's checklist ticked
- [x] `.env.example` re-verified (no changes — no new env vars this session)
- [ ] Commit (Conventional Commits + emoji) + SSH push via `docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified)
