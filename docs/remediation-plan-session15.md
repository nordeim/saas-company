# Remediation Plan — Session 15 (2026-10-08)

**Scope:** Fix the issues, bugs and gaps found by the Session 15 parity +
production-readiness audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** fresh paired captures (word parity **1.0000 on all 8
routes** — the reference is UNCHANGED since Session 14; the standing
mobile-nav real-touch probe re-run with a CORRECTED row locator: the clone's
panel byte-identical and working — burger 342,16 24×24 taps open into the
0,56 390×397 panel with seven 44px rows; scroll-lock, Escape, resize guard,
and navigate-close all verified working — **no Tailwind v4 bug**; the live's
burger remains pointer-blocked, D32). NOTE: the Session-11 survey script's
`navigateCloses: false` on the clone was a SELECTOR TYPO ARTIFACT (its
`aref="#features"]` locator never matched, so the row-tap silently no-op'd);
the corrected probe (`survey-navigate-close-session15.mjs`) shows the panel
closing on row-navigate, and the e2e mobile-navigation suite has pinned
close-on-navigate all along. The Session-15 NEW audit surfaces — layers no
prior session systematically surveyed:

1. **The redirect-target layer (open redirect, CWE-601)**: `/login` accepts
   an arbitrary `from_url` query param and `login-card.tsx` pushes it
   VERBATIM after a successful sign-in (`router.push(fromUrl)`). Probed
   empirically: signing in from `/login?from_url=https://evil.example/phish`
   performs a REAL hard navigation to the attacker's host (the probe
   captured `https://evil.example/phish?_rsc=…` in the network log; the
   browser landed on the DNS-failure page), and the protocol-relative
   `//evil.example` variant behaves identically. A textbook phishing
   vector: `clone.example/login?from_url=https://clone.example.verify-…`
   ships the user's fresh session context into an attacker-controlled
   page. (The Session-14 authenticated-`/login` gate is NOT affected — it
   redirects to `/dashboard` before the param is ever consumed; the only
   consumer of `from_url` is the anonymous card's push. The server gates
   and the dashboard's 401 redirect use hardcoded paths.) **F1.**
2. **The superset-surface a11y layer**: the S14 axe adjudication (D63)
   covers live-mirrored routes — but `/demo` and `/dashboard` are SUPERSET
   routes with no live counterpart, and their a11y floor should be CLEAN,
   not parity-pinned. Probed with axe-core: the dashboard is CLEAN
   (zero violations); **/demo ships a `heading-order` violation
   (moderate)** — the page's only heading is the h1 ("Book a Demo"), so the
   byte-pinned footer's first `<h3>` ("Product") lands after an h1 with no
   intervening h2 (a skip). On the landing the h2 sections precede the
   footer, so the same footer is clean there; the violation is the SUPERSET
   page's own outline. **F2.**
3. **The hang class for external dependencies**: the "degrade, never fail"
   doctrine (ADR-004) covers SDK *failures* but not SDK *hangs* —
   `/api/workflows/generate` awaits `zai.chat.completions.create(...)`
   with NO timeout: a black-holed SDK connection (network partition, stuck
   service) leaves the composer POST blocked indefinitely, the UI's busy
   guard engaged, and no user feedback, forever. The catch-block fallback
   never fires because no error ever arrives. **F3.**
4. **The rate-limit response contract**: README's troubleshooting row
   documents "Wait for the window (see `Retry-After`)" — but NO route
   emits the `Retry-After` header (probed: 429 responses carry only the
   envelope body; `fail()` accepts no headers). The standard machine-
   readable throttle signal (RFC 9110 §10.2.7) is absent while the docs
   claim it exists — a docs/behavior mismatch, and a poorer contract for
   every scripted client. **F4.**
5. **The reduced-motion coverage of the newest surface**: the Session-14
   reduced-motion suite pins the landing and `/faq`; `/demo` (the newest
   `Reveal` consumer) has no pin. Verified clean by probe; pin-only.
   **F5.**

Also audited and found CLEAN or ADJUDICATED (non-findings): the 405
responses on unhandled methods return empty bodies with the security
headers intact (Next.js framework behavior — the envelope contract governs
the app's HANDLED methods; adjudicated, not a defect); the hero video's
eager autoplay strategy (byte-parity with the live — the SAME video, the
SAME attributes; never "optimize" beyond the live's own behavior on a
live-parity surface); `GET /api/workflows/[id]`'s lack of a UI consumer
(the route FAMILY is consumed via PATCH/DELETE — the GET is a conventional
REST read surface, not dead code like S14's `/api/demo`); the dashboard's
axe sweep (zero violations — the superset floor holds there); the session
cookie flags (httpOnly, SameSite=Lax, secure-in-production — re-verified);
CSRF posture (JSON content-type + SameSite=Lax cookies: cross-site POSTs
with `application/json` require a CORS preflight the API never grants);
and the standing battery above (word parity, mobile nav).

## Findings → remediation map

| # | Finding | Layer | Severity | Fix |
|---|---------|-------|----------|-----|
| F1 | Open redirect via `/login?from_url=` — the card pushes an attacker-supplied absolute/protocol-relative URL after sign-in | Security (CWE-601) | MEDIUM (phishing vector; requires a sign-in in the flow) | R1: `safeRedirectPath` guard |
| F2 | `/demo` ships a heading-order violation (h1 → footer h3 skip) on a superset route | A11y superset floor | LOW-MEDIUM | R2: the sr-only h2 + outline pin |
| F3 | `/api/workflows/generate` has no SDK timeout — the hang class breaks degrade-not-fail | Production readiness | MEDIUM | R3: the `withTimeout` seam |
| F4 | 429 responses lack the `Retry-After` header the README documents | API contract / docs truth | LOW | R4: `fail(headers)` + the four sites + smoke pin |
| F5 | Reduced-motion contract unpinned on `/demo` | Regression risk only | LOW | R5 (folded into R2): the reduced-motion `/demo` row |

## The plan

### R1 — The redirect-target guard (F1)

- `src/lib/validation.ts` — new pure export `safeRedirectPath(raw:
  unknown): string`: non-strings, empty, and non-`/`-prefixed values fall
  back to `/dashboard`; `//`- and `/\`-prefixed values (protocol-relative
  and the backslash normalization trick) fall back too; surviving values
  are WHATWG-parsed against a dummy origin and re-serialized
  (`pathname + search + hash`) — any value whose origin escapes the dummy
  is external and falls back. Belt and braces: the startsWith checks catch
  the known vectors, the URL parse catches whatever normalization the
  browser invents next.
- `src/app/login/login-card.tsx` — `params.get("from_url") || "/dashboard"`
  becomes `safeRedirectPath(params.get("from_url"))` (the helper owns the
  null/empty fallback). Nothing else on the byte-pinned card changes.
- RED first: unit cases in `src/lib/validation.test.ts` (null → fallback;
  empty/whitespace → fallback; `"/dashboard"` → kept; `"/faq?x=1#z"` →
  kept with query/hash; `"https://evil.example/phish"` → fallback;
  `"//evil.example"` → fallback; `"/\\evil.example"` → fallback;
  `"javascript:alert(1)"` → fallback; `" /dashboard"` (padded) → kept;
  `123` → fallback). e2e pins in `tests/e2e/auth.spec.ts`: (a) sign-in
  from `?from_url=https://evil.example/phish` lands on `/dashboard`
  (RED today — the browser navigates off-origin); (b) the
  protocol-relative variant likewise; (c) a legit internal
  `?from_url=/faq` round-trips to `/faq` (the feature's honest use).
- Auth POST budget: +3 sign-ins (≈24/50 on the pinned webServer) ✓.
- Pin-conflict scan: no existing spec completes a sign-in with a
  `from_url` (the session-lifecycle pins stop at the redirect URL) ✓.

### R2 — The /demo heading outline (F2) + reduced-motion row (F5)

- `src/components/demo/demo-view.tsx` — the form card opens with an
  sr-only `<h2>` ("Request a demo") so the page outline reads
  h1 → h2 → footer h3×4. Zero visual delta (the sr-only utility); the
  byte-pinned footer and every other surface stay untouched. The superset
  page's outline becomes valid without touching live-parity chrome.
- RED first: a heading-outline pin in `tests/e2e/demo.spec.ts` — the
  page's heading sequence (tag + text) reads exactly
  `H1 "Book a Demo" → H2 "Request a demo" → H3 Product → H3 Company →
  H3 Resources → H3 "Stay in the loop"`. RED today: the H2 is absent.
- F5: a `(d)`-style row in `tests/e2e/reduced-motion.spec.ts` — `/demo`
  renders its form fields at opacity 1 under `reducedMotion: "reduce"`
  without scrolling (the settle() early-return contract; expected GREEN —
  pin-only, the code is verified correct).

### R3 — The SDK timeout seam (F3)

- `src/lib/workflow.ts` — new pure export
  `withTimeout<T>(promise: Promise<T>, ms: number, fallback: () => T):
  Promise<T>` and the `SDK_TIMEOUT_MS = 10_000` constant: resolves with
  the promise's value when fast; resolves with `fallback()` when the
  timer fires first; REJECTS when the promise rejects (the caller's
  existing catch owns that class); the timer is cleared on settle (no
  dangling handle holding the process). Awaiting the fallback (not
  throwing) is deliberate: a hang is a DEGRADE condition, not a failure —
  the template stands, exactly like a malformed completion.
- `src/app/api/workflows/generate/route.ts` — the `create` call wraps:
  `withTimeout(zai.chat.completions.create({...}), SDK_TIMEOUT_MS, () =>
  null)`; a null completion flows into the existing `""` → parse-throw →
  catch → template path (the route's structure is unchanged; only the
  await gains a ceiling).
- RED first: unit cases in `src/lib/workflow.test.ts` under
  fake timers (fast resolution passes the value through; the timer fires
  → the fallback value; a rejection propagates; a fast resolve clears
  the timer — no fallback fires after the fact). The composer e2e
  (already pinned end-to-end since Session 2) re-verifies the happy path
  unchanged.

### R4 — The Retry-After contract (F4)

- `src/lib/api.ts` — `fail(code, message, status, headers?)`: the
  optional `Record<string, string>` merges into the NextResponse.
- The four 429 sites (`auth/login`, `auth/register`, `newsletter`,
  `demo`) pass `{ "Retry-After": String(limit.retryAfterSec) }`.
- RED first: a smoke pin — the script's newsletter+demo block gains a
  deterministic trip: after the existing newsletter(1) + invalid(2) +
  demo(3) POSTs, two more newsletter POSTs (4, 5) are allowed, and the
  SIXTH returns 429 — assert the `Retry-After:` response header is
  present and a positive integer. (The newsletter limiter is its own
  bucket, 5/10 min, so the pin cannot starve the auth budget the
  suite's login checks need; the smoke server is a fresh process each
  run, so the counts are deterministic. No e2e 429 pin — the e2e
  webServer shares ONE news bucket across spec files, and a demo-spec
  trip would 429 the later newsletter spec.)

### R5 — Full gate + paired re-verification + docs

- Gate: lint → typecheck → **111 unit** (94 + 17: 12 safeRedirectPath + 5 withTimeout) → build →
  **50 smoke** (48 + the 429-engages + Retry-After pins) → **196 e2e**
  (191 + 3 auth redirect pins + the demo outline pin + the reduced-motion
  /demo row) — **357 checks**.
- Re-verification: word parity 1.0000 ×8; the mobile-nav real-touch
  probe (with the corrected row locator — the navigate-close artifact
  stays put in the record); the RED probe families re-run GREEN
  (evil from_url → `/dashboard` on the URL bar, no external request in
  the log; the /demo outline carries the h2; a 429 carries
  `Retry-After`); the axe sweep of /demo → zero violations; the
  dashboard axe re-run → still zero; console sweep on the touched
  routes.
- Screenshots: the 18 standard shots refreshed + the `/demo` shot
  re-captured (its DOM gained an sr-only h2 — visually identical;
  VLM spot-check).
- Docs: PAD (revision block; ledger **D76–D79**; §7 counts + the two
  new pin families; §11 key files), AGENTS (counts; **gotcha 29** —
  redirect-target guards + the hang class for external deps + the
  docs-truth sweep), CLAUDE (session-15 context), README (352 badge,
  the Retry-After row becomes TRUE, the open-redirect guard row), the
  SKILL doc v2.14.0 (**lessons 38–39**), the remediation plan (this
  file, ticked), the session log `docs/session_25.md`, the repo
  `worklog.md`. `.env.example` re-verified (no new env vars —
  `SDK_TIMEOUT_MS` is a code constant, not a knob).
- Commit (Conventional Commits + emoji) + SSH push via
  `docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified).

## Validation of this plan against the codebase (pre-execution)

- `login-card.tsx` re-read: `from_url`'s ONLY consumer is line 68→106
  (`router.push(fromUrl)`); the server gates and `apiFetch`'s 401
  redirect use hardcoded paths ✓ (single fix site).
- `validation.ts` exports reviewed — `safeRedirectPath` fits the
  pure-guard family (`isValidEmail` / `requiredString`); the co-located
  test file's `describe` layout extends cleanly ✓.
- `demo-view.tsx` re-read: the card opens with the `border … rounded-2xl`
  div; the sr-only h2 slots ahead of the form with zero layout impact ✓.
- `workflow.ts` + `generate/route.ts` re-read: the wrap point is the
  single `await zai.chat.completions.create(...)`; the null-fallback
  flows into the existing catch-path (structure unchanged) ✓.
- `api.ts` re-read: `fail()`'s NextResponse construction accepts a
  headers merge with no signature break for the other ~20 call sites ✓.
- Smoke script re-read: the newsletter+demo block's POST count (3) +
  the pin's 2 + 1 = the deterministic 6th-POST 429; later login-dependent
  checks are unaffected (separate auth bucket) ✓.
- Auth POST budget re-counted: ~21 existing + 3 new ≈ 24/50 ✓.
- Pin-conflict scan: no spec completes a sign-in carrying `from_url`;
  no spec pins the demo outline; no spec asserts a 429 anywhere ✓.

## Execution order

R1 (RED unit+e2e → the guard → GREEN) → R2 (RED outline pin → the sr-only
h2 → GREEN + the reduced-motion row) → R3 (RED unit → the seam + wrap →
GREEN) → R4 (smoke pin → `fail(headers)` + the four sites → GREEN) →
full gate → paired re-verification → screenshots → docs (R5) → commit +
SSH push per the runbook.

### ToDo checklist

- [x] R1: RED `safeRedirectPath` unit cases + 3 auth.spec redirect pins → the validation guard + login-card integration → GREEN (17 unit RED → 111/111; the (c) legit-round-trip pin GREEN-on-arrival as designed)
- [x] R2: RED demo heading-outline pin → the sr-only h2 → GREEN + the reduced-motion `/demo` row (pin-only, GREEN-on-arrival; the outline expectation corrected to the footer's REAL column texts — Product/Legal/Social/Subscribe)
- [x] R3: RED `withTimeout` unit cases → the seam + `SDK_TIMEOUT_MS` + the generate-route wrap → GREEN
- [x] R4: RED smoke Retry-After pin → `fail(headers)` + the four 429 sites → GREEN (429-engages + Retry-After:600s)
- [x] Full gate: lint → typecheck → 111 unit → build → 50 smoke → 196 e2e (357 checks)
- [x] Paired re-verification: word parity 1.0000 ×8, mobile-nav real-touch probe (corrected locator, navigate-close GREEN), RED probes re-run GREEN (redirect guard ×4 variants + legit /faq round-trip, outline, Retry-After, axe-clean /demo + dashboard), console sweep ZERO on all touched routes
- [x] Screenshots: 18 standard + the error-boundary recapture + the /demo shot (20 total, VLM-verified)
- [x] Docs: PAD (D76–D79 + revision block + §7 + §11), AGENTS (gotcha 29 + counts), CLAUDE (session-15 context), README (357 badge + true Retry-After + guard row), SKILL v2.14.0 (lessons 38–39), session log `docs/session_25.md`, worklog, this plan ticked
- [x] `.env.example` re-verified (no changes)
- [ ] Commit (Conventional Commits + emoji) + SSH push via `docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified)
