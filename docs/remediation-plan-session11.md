# Remediation Plan — Session 11 (2026-10-08)

**Scope:** Fix the issues, bugs and gaps found by the Session 11 parity +
production-readiness audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** fresh paired captures (word parity 1.0000 on all 8 routes —
the **reference is UNCHANGED** since Session 10). The Session-11 NEW audit
surfaces — layers no prior session systematically surveyed:

1. **A cross-route axe-core sweep of the CLONE** (all 9 routes: landing,
   login, FAQ, four legal pages, 404, dashboard) — Session 10 audited only
   the dashboard; the marketing/legal routes had never been swept.
2. **A LIVE-side axe sweep on the parity-bound routes** (`/`, `/faq`, the
   404) to adjudicate every clone violation as parity (live ships it too)
   vs superset gap (clone-only).
3. **A console-error / page-error sweep on every clone route** (production
   readiness — a client-side hydration or runtime error on any route is a
   defect even when the visual output is correct).
4. **An API edge-case robustness probe** (invalid UUIDs, invalid enums,
   oversized payloads, silent-truncation vs rejection consistency between
   POST and PATCH paths).
5. **A pixel-level contrast adjudication** (glyph-interior sampling at 4×
   device scale + a controlled oklab-vs-rgba compositing experiment) for
   the axe-flagged dashboard line, plus a controlled engine experiment to
   rule out a Tailwind v4 oklab compositing shift.
6. **The standing mobile-nav paired re-verification** (real-touch 390×844
   contexts: burger geometry, tap-open, panel geometry + rows, scroll-lock,
   Escape close, navigate close, resize guard) + a paired footer-href map +
   VLM side-by-side adjudication on the five regression-prone surfaces
   (hero, mockup, pricing, testimonials, mobile menu) with pixel-level
   dismissal of the false positives.

Every conclusion below was settled with computed styles, rendered-pixel
sampling, controlled experiments, axe-core, or live-side paired audits —
never VLM impressions alone.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | **The Session-9 keyboard-ring pin is FLAKY — it samples the box-shadow MID-TRANSITION and accepts only one serialization.** The `palette-parity.spec.ts:143` test presses Tab×4, waits a FIXED 200ms, then string-matches `"rgb(9, 9, 11) 0px 0px 0px 4px"` inside `boxShadow`. Observed failing 3/6 isolated runs with two distinct failure modes: (a) the ring's box-shadow TRANSITION has not settled — sampled values include `rgba(9, 9, 11, 0.996) 0px 0px 0px 3.98466px` (99.6% alpha, subpixel width — a mid-animation frame; the shadow interpolates through ~2px→4px), and (b) the settled value serializes as `rgba(9, 9, 11, 1) 0px 0px 0px 4px` (alpha-1 rgba spelling) which the exact-string match rejects. A gate test that fails intermittently undermines the "verify, then claim" contract (CLAUDE.md §1) — the documented 299-check gate itself observed this flake at the end of Session 10 | `tests/e2e/palette-parity.spec.ts:142-156` | HIGH (test infra) | Verified (6 isolated runs: 3 pass / 3 fail; captured failure strings show mid-transition + spelling variance) | Test infrastructure |
| F2 | **Every 404 page triggers a React hydration error (#418) — the page re-renders client-side after a text mismatch.** `not-found.tsx` is a `"use client"` component that renders `The page "${pathname…}"` from `usePathname()`. The route is STATICALLY PRERENDERED at build time, so the served HTML ships the span EMPTY (server render has no concrete route); the client hydrates with the real pathname → the text node mismatches → `Minified React error #418` (hydration failure) → React discards the server tree and re-renders the whole page client-side. Confirmed in the console sweep (the ONLY page error on any route; `pageerror: Error: Minified React error #418`). The live's 404 is a client-rendered SPA surface with ZERO console/page errors — this is a clone-side production defect, not parity. The visual result is eventually correct (the pathname appears post-hydration), which is why word parity and the brand-parity pins never caught it | `src/app/not-found.tsx` (the `{`"${pathname.replace(/^\//, "")}"`}` span) | HIGH (production bug) | Verified (pageerror captured on `/nope-404`; server HTML inspected — the span renders empty; the live's 404 console is clean) | Superset quality (robustness) |
| F3 | **The dashboard's paused/draft workflow cards render their description at EFFECTIVE white/40 — 3.61:1, failing AA.** The workflow `<article>` carries `opacity-80` for non-active statuses (`dashboard-app.tsx:262`), and the description line is `text-white/50` (line 289): the effective alpha composites 0.5 × 0.8 = 0.4 → rendered #676767 over #020202. Pixel-verified at 4× device scale: the glyph interiors sample at EXACTLY `103,103,103` (22,944 uniform pixels — matching 0.4·255 + 0.4·2 ≈ 103). axe reports `3.61 (#666666 on #020202)`. A controlled experiment (rgba vs oklab vs color-mix over the same bg) proved all three spellings composite IDENTICALLY at 129 — the oklab engine is NOT the cause; the ancestor opacity is. Session 10 fixed four `text-white/40` lines on this page but missed this opacity-compounded instance. The dashboard is the superset surface (not parity-bound) — the D59 precedent applies | `src/components/dashboard/dashboard-app.tsx:289` (`text-white/50` description) | MEDIUM (a11y) | Verified (axe 4.10 + rendered-glyph pixel sampling + the controlled compositing experiment) | Superset quality (a11y) |
| F4 | **API contract inconsistency: POST rejects an oversized name, PATCH silently TRUNCATES it.** `POST /api/workflows` validates the name with `requiredString(data.name, 120, "Name")` → a >120-char name returns `400 VALIDATION`. `PATCH /api/workflows/[id]` instead does `data.name.trim().slice(0, 120)` → a 300-char name returns `200 ok` with the name silently cut to 120 (probed: a 300-char PATCH persisted a 120-char name). Create-rejects / update-silently-truncates is an inconsistent contract for the same field; a client cannot reason about the boundary. The category field has the same split (`cleanString(…, 40)` truncates on PATCH) but category is genuinely optional-with-clamp on both paths, so only the name path is a behavioral inconsistency | `src/app/api/workflows/[id]/route.ts:44` | MEDIUM (API contract) | Verified (probed both endpoints with a 300-char name) | Superset quality (API) |
| F5 | **The clone's remaining axe violations on `/`, `/faq`, and the 404 are LIVE-PARITY** (adjudicated against a live-side axe sweep): the beta badge's color-contrast (`.border-violet/20.px-3.py-1`), the testimonial strip's `scrollable-region-focusable` (`.overflow-x-auto`), the FAQ's `text-white/40` contrast + `page-has-heading-one` (the live's FAQ also starts at H2 "Questions? We've Got Answers"), and the 404's h1 contrast + `landmark-one-main` + `region`×2 all ship IDENTICALLY on the live. Meanwhile the live carries violations the clone does NOT (its burger has no accessible name — `button-name` critical; its logo anchor has no link name; 103 `region` nodes on the landing) — the clone's documented a11y-superset family. Decision (parity law): the shared violations stay (fixing them would break visual parity — e.g. the badge's violet/20 border at 3:1 is the reference's own design); the ledger records the adjudication | PAD §5.4 ledger (documentation) | DOCS | Verified (paired axe runs, logged-out vs logged-in contexts matched) | Parity (document) |
| F6 | **Production-readiness sweep: CLEAN.** No console or page errors on any route except F2's 404 hydration. All `public/` assets serve 200 + `Cache-Control: public, max-age=604800`; hashed chunks immutable. `sitemap.xml` + `robots.txt` correct (7 URLs; api + dashboard disallowed). The session cookie ships `Secure; HttpOnly; SameSite=lax; Max-Age=604800`. Invalid workflow ids → 404 (not 500); invalid status enum → 400; oversized idea → 400; no dead links; footer href map byte-identical to the live's (the "unresolved" navbar anchors on content routes exist identically on the live — both sides' shared footer ships `#features`, `#pricing`, `/faq`, `#`(Docs), the four legal routes, and `#`×4 socials) | — | CLEAN | Verified (curl + browser sweeps) | Non-finding |
| F10 | **The e2e suite's own auth-POST budget sat at EXACTLY the limiter default (10/10) — one extra signed-in spec trips a mysterious mid-suite 429 that breaks an UNRELATED pin.** Found live during execution: adding one signed-in dashboard spec (the R3 contrast pin) made the Session-10 mockup-motion-parity contrast pin fail order-dependently (the suite's ~10 UI sign-ins — auth.spec 4, dashboard 3, mockup-motion-parity 2, login-states 1 — share one IP and one process with the in-memory limiter). The pre-change count was already AT the edge, explaining historical near-flakes. FIX: `AUTH_RATE_LIMIT_MAX` env override (default 10 — production unchanged; the Playwright webServer pins 50), unit-pinned both ways | `src/lib/rate-limit.ts` + `playwright.config.ts` + `.env.example` | MEDIUM (test infra fragility) | Verified (the order-dependent failure reproduced, then vanished with the override; counted the exact POST budget across the suite) | Test infrastructure |
| F7 | **The mobile navigation menu: WORKING, byte-identical, NO Tailwind v4 bug** (the standing operator ask, re-verified with real-touch contexts): the clone's burger (342,16 24×24, `md:hidden text-white/80 hover:text-white`) taps open into the byte-identical panel (0,56 390×397, seven rows all 44px — Features #features, How It Works #how-it-works, Pricing #pricing, Testimonials #testimonials, FAQ /faq, Log In, Get Started #pricing), the open menu scroll-locks (`body overflow: hidden`), Escape closes, link-tap closes + navigates (e2e-pinned via `#mobile-menu`), and the resize guard closes across 768. The live's own burger remains pointer-blocked by its empty toast portal (D32 — the documented live-side defect; the clone keeps the WORKING burger as the intended superset). The documented v4 traps (oklab serialization, theme-var triplets, aspect-ratio slash, tracking scale, shadow rename, leading cascade, ring emission order) are all pinned by the existing suites — no NEW v4 engine bug found in this cycle | — | CLEAN | Verified (real-touch paired probe + the passing mobile-navigation suite) | Non-finding |
| F8 | **VLM visual-parity spot checks: IDENTICAL on hero, mockup, mobile menu, testimonials; the pricing composite's "logo differs" claim DISPROVEN by pixels.** The first pricing/testimonials captures showed a scroll-position artifact (the live's Lenis intercepted the first `scrollIntoView` — the section landed at viewport-top 4800 vs the clone's 80); recaptured with deterministic scroll both sides pin `#pricing` at top 80 with IDENTICAL section heights (1026 = 1026; testimonials 697 = 697). The VLM's remaining pricing claims (logo mark "diamond vs sparkle", toggle pill, Pro glow) were adjudicated: the zoomed logo crops differ by 0.0% of pixels (the mark) and 0.2% (the wordmark) — the mark ROTATES (four-petal choreography), so mid-phase shapes read differently to a VLM; the toggle and Pro card are pinned by the passing brand/section/palette e2e suites. Word parity 1.0000 on all 8 routes | — | CLEAN | Verified (VLM + pixel-diff adjudication) | Non-finding |

### Non-findings (checked, clean — dismissed with evidence)

- **Word parity 1.0000 on all 8 routes** (reference unchanged since Session 10).
- **The oklab compositing hypothesis DISPROVEN by control**: `rgba(255,255,255,.5)`,
  `oklab(…/.5)`, `color-mix(in oklab, #fff 50%, transparent)`, and `#ffffff80`
  all render glyph interiors at exactly `129,129,129` over `#020202` — no v4
  engine shift on this layer (F3's cause is the ancestor opacity, not oklab).
- **The invalid-UUID 500 vector: absent** — `GET/PATCH/DELETE /api/workflows/not-a-uuid`
  all return clean 404 envelopes (Prisma treats a non-UUID as no-match through
  `findFirst`).
- **The generate endpoint clamps oversized ideas** (5000-char idea → 400
  `Idea must be at most 200 characters.`).
- **The API envelope contract holds on every probed error path** (JSON body
  expected, validation, not-found, session-guard).
- **No dead internal links on any route; the footer href map is
  byte-identical to the live's** (the content-route navbar anchors resolve
  on neither side — the live ships the same `#features`-style hrefs).

---

## 2. Remediation (TDD — every pin observed RED before its GREEN)

### R1 — The flaky keyboard-ring pin (F1): settle-aware polling

`tests/e2e/palette-parity.spec.ts` — the fixed `waitForTimeout(200)` +
exact-string assertion becomes an `expect.poll` loop that samples the
focused button's `boxShadow` until it carries the slate-950 ring in EITHER
serialization (`rgb(9, 9, 11)` or `rgba(9, 9, 11, 1)`) at the settled ~4px
width (accept the subpixel range ≥ 3.9px), with a bounded timeout (10s —
the `expect` config default). The RED evidence is the captured flake (3/6
failures with mid-transition strings); the GREEN proof is N consecutive
passing runs (target: 10/10 isolated runs) plus the full-suite gate.

### R2 — The 404 hydration error (F2): mount-gate the pathname

`src/app/not-found.tsx` — the component keeps `usePathname()` but renders
the quoted pathname only after mount:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
// …
<span className="font-medium text-slate-700">
  {`"${mounted ? pathname.replace(/^\//, "") : ""}"`}
</span>
```

The server render and the hydration render agree (empty quotes), React
hydrates cleanly, and the pathname fills in one post-mount commit —
`toHaveText`/`toContainText` (auto-retrying) keep the Session-3
brand-parity pin green. **RED first** (`tests/e2e/pages.spec.ts` or a new
`tests/e2e/hydration.spec.ts`): a page-error listener on a 404 navigation
asserts ZERO `pageerror` events (currently fails with React #418); plus the
server-rendered HTML keeps `The page "" could not be found` (the static
prerender contract).

### R3 — The paused-card contrast (F3): white/50 → white/60 on the description

`src/components/dashboard/dashboard-app.tsx:289` — the workflow description
line moves from `text-white/50` to `text-white/60` (uniform across card
states): active cards compute ≥ 7:1; paused/draft cards (opacity-80)
compute ≥ 5.1:1 — both clear AA at 14px. **RED first** (extend the
dashboard spec): an axe-based or computed-color assertion on the
paused-card description — the effective glyph color must clear 4.5:1
against the effective card background (currently 3.61:1).

### R4 — The PATCH/POST name contract (F4): validate, don't truncate

`src/app/api/workflows/[id]/route.ts` — the name branch adopts the same
`requiredString(data.name, 120, "Name")` validator POST uses: empty → 400;
> 120 → 400 `VALIDATION` ("Name must be…"); the UI never sends >120 (the
composer clamps at the source), so no client change is needed.
**RED first** (`scripts/smoke-test.sh` +1 check): PATCH with a 300-char
name must return 400 with `ok:false` (currently 200 with a truncated
name); PATCH with a valid name still 200.

### R4b — The auth-limiter budget (F10, found during execution): the override

`src/lib/rate-limit.ts` — `authRateLimit` reads `AUTH_RATE_LIMIT_MAX`
(default 10, clamped ≥ 1; login + register share the bucket);
`playwright.config.ts` webServer env pins 50; `.env.example` documents the
knob; two unit tests pin the default AND the override. The R3 contrast pin
piggybacks on the seeded-workspace test's existing sign-in (the suite's
POST count returns to its historical level, with headroom now).

### R5 — Documentation alignment (F5 + the lessons)

- PAD: revision block; ledger rows for the axe-parity adjudication (the
  shared violations + the live-only violations the clone already beats),
  the 404 hydration fix, the paused-card contrast fix, the PATCH contract
  fix, and the flaky-pin lesson; §7 counts (299 → 302); §11 key files.
- AGENTS.md: gotcha 25 (statically-prerendered client components cannot
  quote route state at SSR — mount-gate or suppress; a hydration error is
  a defect even when the visual output looks right) + the flaky-test
  discipline note on the gate (poll rendered values; never string-match a
  single serialization of a transitioning property).
- CLAUDE.md: session-11 context block + counts. README: counts + the
  troubleshooting row for the 404 pathname fill-in.
- `saas-company_SKILL.md`: version bump + lessons 30–31 (survey the CONSOLE
  layer — a clean render can still ship a hydration error; and: alpha
  compositing compounds through ancestor opacity — audit effective alpha,
  not the utility class; the control-experiment method that separates an
  engine shift from a design choice).
- `worklog.md` + `docs/session_17.md` + this plan; screenshots refresh;
  `.env.example` re-verified (no new env vars — all changes are
  code/test/docs).

---

## 3. Pre-execution codebase validation (done before writing this plan)

- Baseline gate on the fresh clone: lint ✓ typecheck ✓ Vitest 92/92 ✓
  build ✓ smoke 43/43 ✓ Playwright 163/164 — the one failure being F1's
  flake (3/6 reproduction rate isolated), matching the documented
  Session-10 tail state exactly.
- `.env` `DATABASE_URL="file:../db/custom.db"` with `db/custom.db` pushed +
  seeded at the repo root ✓ (the shell's exported absolute `DATABASE_URL`
  trap was live again in this sandbox — neutralized per-command per
  AGENTS.md gotcha 1; a first `db:seed` attempt wrote a foreign file at
  `/home/z/my-project/db/custom.db` before the discipline was applied —
  removed and re-seeded in-repo).
- `.env.example` tracked and in sync ✓; tsconfig/eslint/vitest/playwright
  all exclude `skills/` ✓ (verified by config inspection + the green
  lint/typecheck/test runs).
- Existing pins audited for conflicts: the Session-3 404 pin
  (`brand-parity.spec.ts:148`) uses auto-retrying `toHaveText` — safe
  under the mount-gate; the dashboard spec has NO pins on
  `text-white/50` or `opacity-80` — safe to bump; the smoke 404 check
  pins only the status code — safe; the mobile-navigation,
  navbar-behavior, and motion-parity suites are untouched by R1–R4.
- The e2e dashboard sign-in helper pattern (`signIn` via
  `getByLabel("Email")`) is reused for the R3 pin; the smoke suite's
  cookie-jar pattern is reused for the R4 pin.

## 4. Execution order

R1 (de-flake the ring pin; verify with 10/10 isolated runs) → R2 (RED
hydration spec → the not-found mount-gate → GREEN) → R3 (RED contrast pin →
the white/60 bump → GREEN) → R4 (RED smoke pin → the PATCH validator →
GREEN) → R4b (the AUTH_RATE_LIMIT_MAX override — the F10 fragility found
live during R3's full-suite run) → full gate (lint → typecheck → 94 unit →
build → 46 smoke → 167 e2e = 307 checks) → paired re-verification (word
parity, the mobile-nav probe, a 404 console re-check, an axe re-run on the
dashboard) → screenshots refresh → docs (R5) → commit + SSH push per the
runbook.
