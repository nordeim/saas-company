# Remediation Plan — Session 33 (2026-10-10)

**Scope:** Execute the Session-33 audit's findings — the drift battery's
NEW EIGHTH column (the DOM-attribute layer — the session_64 S33
candidate: "itemprop/data-* attributes on body content, unmeasured")
caught THREE instrumentation-set deltas on its first run (all adjudicated
with in-vivo probes), the documented-superset registry (the other
session_64 candidate: "a registry the battery reads, so a NEW clone-only
tag surfaces as drift rather than blending into the known set") joins as
the versioned repo file `src/lib/head-superset.ts`, and the composer's
concurrent-window limiter shape (the third candidate) joins as the pin
work — TDD-first, gated by the full quality gate (§7.3 of the PAD), and
re-verified by the standing paired survey.

**Audit method:** the standing drift battery REBUILT for this session
(`research/drift-battery-s33.mjs` — word parity, the mobile-nav paired
real-touch probe, the SEO surface, the JSON-LD mount column, the S31
canonical/og column, the S32 head-tag SET column NOW WIRED TO THE
REGISTRY, and the NEW eighth column: the per-route body DOM-attribute
SET) plus the targeted live probes (`research/focused-probe-s33.mjs`).
The baseline gate on the pulled Session-32 tree (`51dfc98`): **583
checks ALL GREEN** (205 unit + 124 smoke + 255 e2e; lint + typecheck +
build clean), the canonical DB verified (6 rows / 5 active / 7,120
runs), the exported `DATABASE_URL` trap live again in the reset shell
(pointing at the parent directory) — neutralized (unset) in every
command this session.

**The standing battery (first run): 117 checks, 114 GREEN, 3 DRIFT —
all three on the NEW EIGHTH COLUMN** (the session_64 candidate's
prediction validated on its first run, the third column in a row):
word parity 1.0000 ×8, the mobile-nav paired probe byte-identical
7 × 44px (no Tailwind v4 bug), the SEO surface clean, the JSON-LD
mounts at parity + superset, the canonical/og column GREEN (now with
the twitter:url check), the head-tag SET column GREEN THROUGH THE
REGISTRY (the five adjudicated clone-only tags reading "registered
superset" per route — and any UNREGISTERED clone-only tag now surfaces
as drift), and the live's authenticated surfaces re-probed (/dashboard
and /checkout still render the SPA 404 — the clone's workspace remains
the documented superset).

## Findings

1. **F1 — the live's `/login` ships `data-rht-toaster`; the clone ships
   none (LOW — ADJUDICATED dormant instrumentation after an in-vivo
   probe).** `data-rht-toaster` is react-hot-toast's global toast
   container attribute — the live's login bundle mounts the Toaster
   component (position: fixed, z-index 9999). The focused probe
   measured it in vivo: **0 children at rest**, and after a FAILED
   login the error surfaces through the INLINE `[role=alert]` banner
   ("Invalid email or password") exactly like the clone (the
   login-states spec's pinned surface) — the toaster never fires on
   any login flow (the failed-login and forgot-password flows both
   probed). Zero functional delta: the container is mounted dormant,
   the live's own error surface is the same banner the clone ships.
   Simulating a dormant toaster in the clone would add a fixed
   z-index-9999 container that never renders children — dead DOM for
   byte-parity of an instrumentation attribute. **No fix; registered
   in the DOM-attribute registry as live-only dormant.**

2. **F2 — the live's `/faq` ships `data-radix-collection-item`; the
   clone ships none (LOW — ADJUDICATED library-internal after an
   in-vivo probe).** The live's FAQ is a Radix Accordion — the
   attribute is Radix's internal collection registration marker (its
   item-management system for cross-item keyboard navigation). The
   focused probe measured the FULL ARIA contract on both sides: the
   trigger attributes are at parity (type=button, aria-expanded,
   aria-controls, data-state, id — the clone's stable
   `faq-trigger-N` ids vs the live's hydration-suffixed
   `radix-:rN:`), the trigger CLASS STRINGS are byte-identical
   (`flex flex-1 items-center justify-between transition-all
   hover:underline [&[data-state=open]>svg]:rotate-180 …`), and the
   panels carry the same contract (role="region" + aria-labelledby +
   data-state, mounted on open — Radix unmounts closed content too).
   The container carries data-orientation="vertical" on both sides.
   The one live-only attribute is Radix's own registry marker —
   adding it to the clone's CUSTOM accordion would claim membership
   in a Radix collection that does not exist: simulated
   instrumentation, the S32 next-size-adjust adjudication class (the
   option was inert; the marker would be a lie). The ARIA surface —
   the actual functional contract for assistive technology — is at
   parity. **No fix; registered in the DOM-attribute registry as
   live-only library-internal.**

3. **F3 — the clone's `/` ships `data-nav-theme`; the live ships none
   (LOW — ADJUDICATED clone-only functional marker).** The clone's
   section-aware navbar reads `[data-nav-theme="light"]` markers on
   the light sections (gotcha 14: the chrome swaps to black variants
   while the nav band overlaps them — the #features section is the
   sole carrier, measured). The live achieves the same chrome swap
   through its own mechanism. The markers are invisible (data-*
   attributes carry no rendering or AT semantics), and the BEHAVIOR
   is pinned GREEN by `tests/e2e/navbar-behavior.spec.ts` (the
   scroll-spy + the theme swap at the section boundary). **No fix;
   registered in the DOM-attribute registry as clone-only functional.**

4. **F4 — the documented-superset registry (the session_64 candidate
   2 — the structural finding the three deltas motivate).** Through
   Session 32 the battery's adjudicated clone-only head-tag set lived
   ONLY in the research/ scratch (gitignored, rebuilt every session):
   a NEW clone-only tag — a dependency upgrade's telemetry, a route's
   accidental metadata — would have blended silently into the
   "superset" reading. The registry joins as the VERSIONED repo file
   `src/lib/head-superset.ts`: the five S32 adjudications (next-size-
   adjust, the 404 robots, the og:image dims ×3) with their reasons
   and sessions, the `isDocumentedSuperset(key, route)` lookup, and
   — with this session's three findings — the DOM-attribute array
   (the `side` field distinguishes clone-only from live-only). The
   battery READS it (the tsx eval): any head tag or DOM attribute
   not in the registry surfaces as DRIFT. The unit pins hold the
   registry to its documented shape (exactly these entries, the
   route scoping, the both-directions DOM lookup) so adding an entry
   is an explicit, reviewed act.

5. **F5 — the composer's concurrent-window limiter shape (MEDIUM —
   the session_64 candidate 3, a pin gap around constructed-correct
   behavior).** The generate limiter is PER-USER (Session 16 F1:
   keyed by the authenticated user id — the honest unit behind
   requireSession) and the client degrades to the deterministic
   template on any non-ok generate response (Session 16: the
   feature never hard-fails; the existing dashboard.spec.ts pin
   route-FULFILLS a mocked 429). The UNPINNED shape: TWO TABS
   (one session, one user) composing SIMULTANEOUSLY against the
   shared in-memory bucket. Three contracts: (a) the bucket is
   shared across tabs — concurrent attempts from two tabs draw from
   ONE budget (no per-tab isolation; the checkRate increment is
   synchronous, so concurrent latecomers at an exhausted bucket all
   answer 429 — no slot leaks); (b) the degrade-not-fail contract
   holds under concurrency — with the bucket exhausted, BOTH tabs'
   UI composes still create their workflow through the template
   draft (the real server's real 429, never a mock); (c) the two
   tabs CONVERGE — after the concurrent composes both tabs re-read
   the same workspace (both new rows visible in both tabs after a
   reload). `session33-concurrent-limiter.spec.ts` (the
   dedicated-user pattern, `.serial`, the API register + the
   spec-scoped PrismaClient cascade cleanup) pins it. The
   exhaustion is minted DETERMINISTICALLY with zero SDK calls: 50
   malformed-JSON POSTs to /api/workflows/generate — each counts
   against the limiter BEFORE the body parse rejects it (the
   route's own ordering: session guard → limiter → parse), each
   answering 400 in milliseconds.

**Adjudicated CLEAN/non-findings** (documented so a future session
does not re-litigate): the live's og:image/twitter:image (still DEAD
— 404, 29 bytes; the clone's self-hosted working og-image superset
stands); the live's /dashboard + /checkout (still the SPA 404); the
clone's og:image:width/height/type + next-size-adjust + 404 robots
(the five registry head entries — reading "registered superset"
GREEN through the battery's new column); the FAQ's aria surface
(measured at parity both sides this session — the probe evidence in
F2); the login error surface (the inline banner, measured identical
both sides this session — the probe evidence in F1); the mobile-nav
panel (byte-identical 7 × 44px, the oklab/rgba spellings both
accepted — gotcha 4); the microdata layer (itemprop/itemtype/
itemscope: NONE on either side, any route — the eighth column's
other half, GREEN on arrival).

## The fixes (TDD-first)

### R1 — the DOM-attribute registry extension + unit pins (F4)

- **RED:** `src/lib/head-superset.test.ts` (new): the HEAD_SUPERSET
  shape pins (exactly 5 entries, the keys `name:next-size-adjust`,
  `name:robots`, `prop:og:image:width/height/type`, the robots
  route-scoping to the 404, the all-routes entries), the
  `isDocumentedSuperset` truth table (og:image:width true on any
  route, robots TRUE on the 404 and FALSE on /, next-size-adjust
  true everywhere, an unknown key false), and the DOM array pins
  (exactly 3 entries — `data-nav-theme` clone-only on `/`,
  `data-rht-toaster` live-only on `/login`,
  `data-radix-collection-item` live-only on `/faq` — the
  `isDocumentedDomSuperset(attr, side, route)` lookup with its
  side + route truth table, and the cross-side rejection: a
  clone-only entry never excuses the live side).
- **GREEN:** `src/lib/head-superset.ts` gains `DOM_ATTR_SUPERSET`
  (the `side: "clone" | "live"` field — the DOM layer adjudicates
  BOTH directions where the head layer's reference-wins law makes
  live-only always drift) + `isDocumentedDomSuperset()`. No app
  code changes — the registry is documentation-as-code the battery
  reads.

### R2 — the concurrent-limiter pins (F5)

`tests/e2e/session33-concurrent-limiter.spec.ts` (the dedicated-user
pattern, `.serial`, the API register + the spec-scoped PrismaClient
cascade cleanup — the S28/S30/S31/S32 convention):

- **(a) the shared bucket across tabs:** a dedicated user signed in
  in TWO pages (one browser context — one session cookie, one
  user); the bucket exhausted with 50 concurrent malformed-JSON
  POSTs to /api/workflows/generate (each counts before the parse
  rejects — the route's own ordering; zero SDK calls, each
  answering 400 in ms); then ONE more generate POST from EACH tab
  FIRED CONCURRENTLY — both answer 429 with the Retry-After header
  (the S15 contract), proving the two tabs draw from ONE per-USER
  budget with no per-tab isolation and no leaked slot at the
  exhausted ceiling.
- **(b) the degrade-not-fail contract under concurrency:** with the
  bucket still exhausted, the REAL UI compose fired in BOTH tabs
  simultaneously (distinct ideas) — the real server's real 429s (a
  route-fulfilled mock would test nothing here), each tab's client
  degrading to the deterministic template draft, each create
  succeeding: BOTH tabs announce "Workflow created." with zero
  uncaught pageerrors.
- **(c) the two-tab convergence:** after the concurrent composes,
  BOTH tabs reloaded — both render BOTH new rows (the shared
  workspace truth), the header counting the minted total.

- **RED expectation:** a pin gap around constructed-correct
  behavior (the S32-membership class) — the suite is expected
  GREEN on arrival; its value is the permanent guard on the
  per-user limiter's cross-tab contract.

### R3 — the battery's surface-8 registry wiring (F4)

`research/drift-battery-s33.mjs`'s eighth column reads BOTH registry
arrays (the tsx eval already loads the file): the adjudicated
entries read GREEN with "registered" notes, any UNREGISTERED
attribute (either side) surfaces as drift. Research scratch —
re-run GREEN.

### R4 — the full gate

583 → projected ~592 (205 + ~7 unit → ~212, 124 smoke, 255 + 3 e2e →
258). Lint, typecheck, and build clean throughout.

## ToDo

- [x] R1a RED: `src/lib/head-superset.test.ts` (the registry shape +
      the two lookup truth tables) — 8 structural failures observed
      (the DOM array + lookup absent), 7 head pins passing (the data
      file already shipped)
- [x] R1b GREEN: `DOM_ATTR_SUPERSET` + `isDocumentedDomSuperset` in
      `src/lib/head-superset.ts` — 15/15
- [x] R2: `session33-concurrent-limiter.spec.ts` — **GREEN ON ARRIVAL
      3/3** (the pin-gap class, as projected: the shared bucket across
      tabs, the concurrent degrade, the convergence — all
      constructed-correct, now permanently pinned)
- [x] R3: the battery's eighth column wired to the registry — re-run
      **117/117 GREEN, ZERO DRIFT** (after clearing a mid-session
      zombie-server false-drift: the process-renamed `next-server
      (v1…)` on :3270 served stale chunks after the rebuild — gotcha
      46, kill by PORT never by argv)
- [x] Full gate green — 583 → **602** (measured: 220 unit + 124
      smoke + 258 e2e; +15 unit, +3 e2e — the projection's ~592-594
      was LOW: the registry pins landed as a 15-test file, not the
      projected 6-8)
- [x] Drift battery re-run GREEN — **117/117, zero drift** through
      all EIGHT surfaces (the three DOM findings reading "registered"
      through the versioned registry; the five head tags reading
      "registered superset" per route)
- [x] Screenshots (20, the scroll-through discipline; DB canonical
      before AND after — 6 rows / 5 active / 7,120 runs) + VLM 5/5
      (the hero shot's below-fold flag adjudicated by the full-page
      evidence — the S30/S31/S32 single-frame family; the full-page
      shot itself PASS: "no blank bands, the layout is continuous and
      fully populated")
- [x] PAD ledger D124–D126 + §7 counts + §7.2 suites + §11 key files
- [x] AGENTS (the counts + the battery's eighth surface + the
      registry + gotcha 46: the process-renamed zombie) + CLAUDE (the
      session-33 context + the counts) + README (the 602 badge + the
      S33 rows)
- [x] SKILL v2.32.0 (lesson 72: the battery-column compounding
      reaches the DOM-attribute layer — and an adjudicated superset
      that lives only in scratch is a superset that can silently
      grow; version the registry)
- [x] .env.example verified in sync (no env vars touched — the
      registry is code-only; the concurrent spec rides the existing
      GENERATE_RATE_LIMIT_MAX)
- [x] remediation plan ticked + session log `docs/session_66.md`
- [x] worklog.md updated
- [x] commit on main + SSH wrapper push (wrapper-verified — the hash
      recorded below post-push)

**Projection:** the gate grows by the R1 unit pins (+6-8) and the R2
e2e trio (+3) → ~592-594 total. The battery's eighth column joins
the standing GREEN set with its three findings registered. (Measured:
602 — the projection was LOW; the registry pins landed as a 15-test
file, not the projected 6-8.)

**Pushed:** `1c6743f` on `main` → `git@github.com:nordeim/saas-company.git`
(via `docs/ssh_git_wrapper_v3.py` with an operator-supplied key and the
EXPLICIT `--remote git@github.com:nordeim/saas-company.git` — the
wrapper's DEFAULT remote is the runbook's example repo `task-management`,
the S31-recorded trap; the explicit flag carried from the first dry-run
this session, the S32 discipline). The wrapper asserted **remote
main @ `1c6743f` == local HEAD** — wrapper-verified; the fetch-independent
HTTPS ls-remote agreed (`1c6743f7736b8f9bf670fcb9f39bdd883ba8638b`).
The operator key's fingerprint verified against the S1–S32 record
(`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`) BEFORE the
push; the operator key shredded after use (both the wrapper's temp copy
and the operator's file). No new branches — everything on `main`, per
the operator contract.
