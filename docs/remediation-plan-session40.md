# Remediation Plan — Session 40

The worklog S40 candidates (the reference-regression watch on the live's
/dashboard + /checkout, the z-index registry's promotion into a committed
adjudication layer, the responsive breakpoint inventory as the battery's
fifteenth surface), answered against the measured codebase. The baseline
is the Session-39 tree (gate 693 = 247 unit + 124 smoke + 322 e2e; the
drift battery 14 surfaces, 24 checks across three phases, zero drift —
`docs/session_78.md`).

## The re-scoping recon (research/recon-s40.mjs + the paired probes)

All three candidate surfaces measured BEFORE the contracts were designed:

- **The reference-regression watch (R1).** The live's route set re-probed
  in full: `/` (739 words), `/login`, `/faq` (101w), `/thank-you` (36w),
  and all four legal routes (`/privacy` 335w, `/terms` 390w,
  `/accessibility` 566w, `/refund-policy` 285w) still serve their pages.
  The soft-404 set (HTTP 200, "Page Not Found", 16 words) is now FOUR
  routes: `/demo`, `/dashboard`, `/checkout` (the S39 records) AND
  **`/pricing` — NEW this session** (verified twice, fresh contexts). The
  live's sitemap is unchanged (7 URLs: the landing, /faq, the four legal
  routes, /thank-you — /pricing was never listed, so the clone's sitemap
  policy record stands: clone = live − {/thank-you} + {/demo}). The
  live's post-login redirect still lands on `/` with an in-memory
  session; its Dashboard link → `/checkout` → 404. The clone's /pricing
  joins /demo as a documented working-superset route (the S14/S39
  precedent — D146, a registry record, not a code change).
- **The responsive breakpoint inventory (R2 — the fifteenth surface).**
  The same element set measured at 390/768/1024/1440 on the landing and
  /login, paired clone-vs-live (research/probe-responsive-s40.mjs,
  probe-responsive-dwell-s40.mjs, probe-login-responsive-s40.mjs). The
  signature: nav height **56px at 390 / 72px at ≥768** on both sides; the
  burger visible below md, hidden at ≥768; 7 desktop nav links at ≥768 vs
  1 (the logo) at 390; **zero horizontal overflow at every width on both
  sides**; document heights byte-identical per width (landing 10092 /
  7748 / 7544 / 7498; login 900 at all four); element counts clone+1 at
  every width — the `<main>` landmark, the registered a11y superset.
  **ZERO real geometry drift at any breakpoint.**
- **The DWELL law at the responsive layer (a measurement-law extension,
  gotcha 52e).** The first (un-dwelled) probe read REAL-looking drift:
  the live's problem-section mockup card at 262×311 vs the clone's
  276×327, with +30px y-shifts cascading into every section below — the
  live's `md:col-span-1` wrapper sat at its UNFIRED `whileInView` initial
  `scale(.95)` (the entrance never fired below the fold). The live's own
  bundle authors `initial:{opacity:0,scale:.95} → whileInView:{opacity:1,
  scale:1}` — the resting contract is scale 1, and under the dwell
  discipline both sides settle at `transform: none` with byte-identical
  rects. **Every breakpoint re-measure needs its own dwell pass** — a
  viewport change re-renders, and the fourth law now has a per-breakpoint
  clause.
- **The z-index registry promotion (R3).** DEFERRED by measurement: the
  stacking surface's registry did not grow this session (no new stacking
  findings at any breakpoint — the fourteenth surface re-validated as
  part of the responsive sweep at 390 only, its record unchanged). The
  promotion into a committed `src/lib` sibling of head-superset.ts stays
  conditional on registry growth, exactly as the S39 record holds it.

## The ToDo list (TDD)

- [x] R1 — the route-watch record: `/pricing` registered as the live's
      FOURTH soft-404 route (D146); the clone's /pricing = the documented
      working superset; the sitemap policy record re-verified unchanged
- [x] R2 — the fifteenth surface measured GREEN at parity (the paired
      dwell probes above; zero real drift, the main-landmark superset the
      only asymmetry)
- [x] R2a — `tests/e2e/session40-responsive-inventory.spec.ts`: the
      clone-side pins — the nav-height contract (56px @390 / 72px @768,
      1024, 1440), the burger/desktop-nav visibility flip at md, zero
      horizontal overflow at all four widths, the `<main>` landmark
      exactly once, the per-breakpoint document heights (tolerance
      pinned), the problem-section card's dwell-settled `transform: none`
      (the gotcha-52e contract pinned in the gate), and the /login
      no-overflow sweep — **7/7 GREEN on arrival** (the parity session's
      registry-pins pattern, the S39 precedent)
- [x] R2b — the battery's fifteenth-surface phase
      (research/drift-battery-s40.mjs): the paired 4-width sweep on the
      landing + /login with the dwell discipline baked in, + the
      route-watch registry (the live's soft-404 set = {/pricing, /demo,
      /dashboard, /checkout}) — **69/69 GREEN ZERO DRIFT** (one battery
      check fixed in flight: the main-landmark contract is ROUTE-AWARE —
      on /login BOTH sides carry main|min-h-screen.flex, identical sets;
      the +1 superset is the landing's alone)
- [x] R3 — the z-index registry promotion: DEFERRED (measured — no
      registry growth; the conditional record stands)
- [x] The full gate re-run on the clean build — **700 checks ALL
      GREEN** (247 unit + 124 smoke + 329 e2e = the 693 standing + the
      7 session40 pins; lint/typecheck/build clean; one standing pin
      hardened in flight — the S36 D135 hover-poll's 150ms
      hover-settle head start after one full-suite load flake)
- [x] The 20 screenshots refreshed under docs/screenshots/ (DB
      canonical before AND after — 6 rows / 5 active / 7,120 runs) +
      the VLM standing five — **5/5 PASS with ZERO flags** (the known
      parity expectations — the light login, the white band — encoded
      in the prompts)
- [x] The docs alignment: PAD (the revision block, the D146 ledger row,
      §7 counts, §7.2 the session40 pins, §11), AGENTS (the counts + the
      fifteenth surface + gotcha 52e), CLAUDE (the session-40 context),
      README (the badge + the S40 rows), SKILL v2.39.0 (lesson 79: the
      dwell law is per-breakpoint — a viewport change re-renders and
      re-arms the entrances), .env.example verified in sync (no env
      vars touched, code-only), the session
      logs (docs/session_80.md curated + docs/session_81.md raw), the
      worklog
- [x] The commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding)

## The pushed-hash record (the closing discipline)

- Remediation commit **bc81975** pushed via the SSH wrapper with the
  EXPLICIT `--remote git@github.com:nordeim/saas-company.git` (the S31
  trap: the wrapper's DEFAULT remote is the runbook's example repo —
  the explicit flag held from the first dry-run).
- Wrapper-verified: remote main @ bc81975 == local HEAD; the
  fetch-independent HTTPS ls-remote agreed
  (bc81975966720b54f93c2bf1b045db3cd60460cb; the branch API was
  rate-limited this session — the git-protocol check the authoritative
  one).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1-S39 record); both the wrapper's temp key copy and
  the operator's key file shredded after use.
- Zero zombies at close (the :3300 probe server killed by PID; the
  battery's :3320 group-killed at its own teardown); the tree clean;
  no new branches.
