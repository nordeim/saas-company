# Session 33 — the DOM-attribute parity audit + the versioned superset registry + the concurrent-limiter pins

The task chain continued from the Session-32 close. The workspace pulled clean (`git pull` brought in `51dfc98` — the separately-pushed `session_65.md` transcript), the environment verified in place (node_modules, `.env` with `DATABASE_URL="file:../db/custom.db"`, the canonical DB at 6 rows / 5 active / 7,120 runs, `db/` at the repo root), and the exported `DATABASE_URL` trap found LIVE again (pointing at the parent directory) — unset in every command this session.

The docs reviewed: AGENTS (45 gotchas at pull), CLAUDE, README (583 badge), PAD, SKILL v2.31.0, the S32 remediation plan (fully ticked, pushed `6063668`), session_64 (the S32 log with the S33 candidates), session_65 (the S32 transcript), and the worklog tail. The S33 candidates from session_64: (1) the battery's DOM-attribute layer ("itemprop/data-* attributes on body content, unmeasured"); (2) the documented-superset registry ("so a NEW clone-only tag surfaces as drift rather than blending into the known set"); (3) the composer's concurrent-window limiter shape ("two tabs composing simultaneously against the per-user limiter").

The baseline gate on the pulled tree: lint clean, typecheck clean, unit 205/205, build clean, smoke 124/124, e2e 255/255 — **583/583 ALL GREEN**. The codebase aligned with its documentation.

While e2e ran: the repo skills consulted (tdd — the anti-tautology law and the pin-gap class; nextjs16-tailwind4; clone-app-pat-pro and agent-browser conventions standing from prior sessions), scandihaven re-cloned and refreshed (the same Next 16 + React 19 + Tailwind v4 + Vitest/Playwright patterns — no new pattern needed this cycle), the S32 code changes audited (the `routeMetadata` other-channel, the login layout's viewport/imageAlt, the not-found MutationObserver — all verified in place), and the standing configs re-verified (vitest includes, the playwright webServer env pins, the sitemap's 8 routes, robots, `.env.example`).

## The audit — the battery's EIGHTH column

The drift battery rebuilt (`research/drift-battery-s33.mjs` — research/ is gitignored scratch, the house convention): the seven standing surfaces plus the NEW EIGHTH COLUMN (the session_64 candidate's own suggestion) — the per-route body DOM-attribute SET (`data-*` attribute names + the microdata attributes itemprop/itemtype/itemscope/itemref/itemid, both sides), and the head-tag SET column REWIRED to read a registry instead of hardcoding the adjudicated set.

**THE EIGHTH COLUMN'S FIRST RUN CAUGHT THREE DRIFT** — the third new column in a row to catch drift on its maiden run (the sixth: 2; the seventh: 4; the eighth: 3):

1. **The live's `data-rht-toaster` (live-only, /login)** — react-hot-toast's global container, mounted in the live's login bundle.
2. **The live's `data-radix-collection-item` (live-only, /faq)** — Radix Accordion's collection marker on the live's FAQ triggers.
3. **The clone's `data-nav-theme` (clone-only, /)** — the clone's own section-theme markers.

The microdata layer (the eighth column's other half): NONE on either side, any route — GREEN on arrival.

## The adjudications (the focused probe)

`research/focused-probe-s33.mjs` measured each finding in vivo before any decision:

- **F1 (the toaster — D124):** the container is DORMANT — 0 children at rest, and after a FAILED login the live's error surfaces through the inline `[role=alert]` banner ("Invalid email or password") exactly like the clone (the failed-login and forgot-password flows both probed). The live's own error surface IS the banner the clone ships. ADJUDICATED dormant instrumentation — simulating a dead fixed z-9999 container would be byte-parity for an instrumentation attribute.
- **F2 (the Radix marker — D125):** the live's FAQ is a Radix Accordion; the clone's is custom. The FULL ARIA contract measured at parity on both sides — aria-expanded, aria-controls, data-state, the panels' role="region" + aria-labelledby, the container's data-orientation="vertical", and the trigger CLASS STRINGS byte-identical (the clone's stable `faq-trigger-N` ids vs the live's hydration-suffixed `radix-:rN:`). The marker is Radix's internal collection registry; stamping it on a custom accordion would claim membership in a collection that does not exist — simulated instrumentation, the S32 next-size-adjust adjudication class. ADJUDICATED library-internal.
- **F3 (the nav-theme markers — D126):** the clone's navbar reads `[data-nav-theme="light"]` on the light sections (gotcha 14 — #features the sole carrier, measured); the live achieves the same chrome swap its own way. Invisible data-* with zero rendering/AT impact, the swap behavior pinned GREEN by navbar-behavior.spec.ts. ADJUDICATED clone-only functional.

## The registry (candidate 2 — the structural fix)

Through Session 32 the battery's adjudicated clone-only set lived ONLY in the gitignored research/ scratch — a NEW clone-only tag would have blended silently into the "superset" reading. The registry joins as the VERSIONED repo file **`src/lib/head-superset.ts`**: the five S32 head adjudications (next-size-adjust, the 404-scoped robots, the og:image dims ×3) plus the three S33 DOM entries — with the `side` field, because the DOM layer adjudicates BOTH directions (live-only library instrumentation the clone must not simulate; clone-only functional markers the live achieves its own way) where the head layer's reference-wins law makes live-only always drift. The `isDocumentedSuperset(key, route)` and `isDocumentedDomSuperset(attr, side, route)` lookups; **15 unit pins** hold the shape (exactly these entries, the route scoping, the cross-side rejection). The battery READS the file through a tsx eval — anything unregistered surfaces as DRIFT.

## The concurrent-limiter pins (candidate 3)

**`tests/e2e/session33-concurrent-limiter.spec.ts`** (the dedicated-user pattern, `.serial`, the API register + the spec-scoped PrismaClient cascade cleanup) — GREEN ON ARRIVAL 3/3, the pin-gap class (constructed-correct behavior, now permanently pinned):

- **(a) the shared bucket:** one browser context (one session, one user), two pages; the bucket exhausted with 50 concurrent counted-but-rejected generate attempts (valid JSON WITHOUT an idea — the route's own ordering counts every attempt BEFORE requiredString rejects it; zero SDK calls, each answering 400 in ms); then one more attempt from EACH tab fired CONCURRENTLY — both 429 + Retry-After (the S15 contract), no per-tab isolation, no leaked slot.
- **(b) the concurrent degrade:** with the bucket exhausted, both tabs' REAL UI composes fired simultaneously — the real server's real 429s, each client degrading to the deterministic template draft, each create succeeding: BOTH tabs announce "Workflow created." with zero uncaught pageerrors.
- **(c) the convergence:** both reloaded tabs render BOTH new rows + the true "2 total" — the shared-workspace truth.

## The mid-session zombie (gotcha 46)

The battery's first RE-RUN after the registry wiring showed 10 drifts — word parity "FeaturesHow It Works" (the concatenated-words signature), the mobile panel reading zero rows. Diagnosis: a stale probe server left holding :3270 from the focused-probe session, its PORT invisible to `pkill -f "PORT=3270"` (the port rode the environment, not argv), and the process RENAMED to `next-server (v1…)` by the Next runtime — invisible to argv greps entirely. After the rebuild, the stale server served HTML whose chunk references 404'd: every page rendered UNSTYLED (innerText lost its flex-layout whitespace; the burger's JS never loaded). Cleared by PID (`ss -tlnp` → kill); the clean re-run read **117/117 GREEN, ZERO DRIFT**. The law (AGENTS gotcha 46): kill zombies by PORT, never by argv — and treat a sudden multi-surface drift right after a rebuild as a zombie first, a regression second.

## The gate and the verification

- **Full gate: 583 → 602** (205 → 220 unit + 124 smoke + 255 → 258 e2e — the registry pins +15, the concurrent trio +3; the plan's ~592-594 projection was LOW: the registry pins landed as a 15-test file). Lint, typecheck, and build clean throughout.
- **The drift battery re-run: 117/117 GREEN, ZERO DRIFT across all EIGHT surfaces** — word parity 1.0000 ×8, the mobile nav byte-identical 7 × 44px (no Tailwind v4 bug), the SEO surface clean, the JSON-LD parity + superset, the canonical/og column at parity (now with the twitter:url check), the head-tag SET column reading "registered superset" per route, and THE EIGHTH COLUMN AT PARITY — the three DOM findings reading "registered" through the versioned registry, the microdata layer clean.
- The live re-probed: og:image/twitter:image still DEAD (the D30 record holds), /dashboard + /checkout still the SPA 404 (the superset stands).
- **20 screenshots refreshed** (the scroll-through discipline; DB canonical before AND after — 6 rows / 5 active / 7,120 runs). **VLM 5/5 PASS** after adjudication (the hero shot's below-fold flag — "no mockup visible" — adjudicated by the full-page shot's own PASS: "no blank bands, the layout is continuous and fully populated" — the S30/S31/S32 single-frame family; the mockup-motion-parity e2e suite pins the mockup's rendering GREEN in the gate).

## The documentation

PAD (the revision block, the ledger D124–D126, §7 counts 220/124/258 = 602, §7.2 the registry pins + the session33 suite, §11 the head-superset.ts row), AGENTS (the counts + the battery's eighth surface + the registry + **gotcha 46**: the process-renamed zombie), CLAUDE (the session-33 context + the stack-table/checklist counts), README (the 602 badge + the registry row + the feature-table row + the verification block), SKILL **v2.32.0** (**lesson 72**: an adjudicated superset that lives only in scratch is a superset that can silently grow — version the registry; and the zombie law), `.env.example` verified in sync (no env vars touched), the remediation plan ticked with the measured gate, this session log, and the worklog.

## What happened this session

**The headline:** the drift battery's NEW eighth column — the DOM-attribute layer, the session_64 candidate's own suggested generalization — caught **three instrumentation-set deltas on its first run** (the third column in a row to do so), all adjudicated with in-vivo probes at zero functional delta: the live's dormant react-hot-toast container, the live's Radix collection marker (with the ARIA contract measured at parity on both sides — never simulate a library's internals), and the clone's own nav-theme hooks. The adjudicated sets are now VERSIONED in `src/lib/head-superset.ts` — the registry the battery reads, so an unregistered delta (either side) surfaces as drift instead of blending into the superset. Plus the composer's concurrent-window limiter shape pinned: the two-tab shared bucket, the concurrent degrade, the convergence.

**The lesson (SKILL 72):** an adjudicated superset that lives only in gitignored scratch is a superset that can silently grow. Version the registry — every adjudication an explicit, reviewed entry with unit pins holding the shape. And the supporting zombie law (gotcha 46): a rebuilt Next standalone renames its process to `next-server (v1…)` — argv greps go blind; kill by port, and suspect a zombie first when a multi-surface drift appears right after a rebuild.

**Verified:** full gate **602/602** (220 unit + 124 smoke + 258 e2e) · the drift battery **117/117 GREEN, zero drift** across all eight surfaces · word parity 1.0000 ×8 · mobile nav byte-identical 7 × 44px (no Tailwind v4 bug) · the SEO surface clean · the JSON-LD parity + superset · 20 screenshots refreshed · VLM 5/5 (after the single-frame adjudication) · all docs aligned (PAD D124–D126, AGENTS gotcha 46, CLAUDE, README, SKILL v2.32.0, session log, worklog).

**Suggested next (the S34 candidates):** the registry's own next extension (the DOM-attribute layer's VALUE-level twin — the measured VALUES of the shared data-* attributes, e.g. the live's data-state spellings, currently only the SET is measured); the battery's ninth column candidate (the computed-STYLE inventory — which CSS properties each side's components resolve, the layer below the attribute SET); or the composer's remaining unpinned edge (the SDK's real-output path — the sanitize-clamp behavior under a live LLM response, currently only the template fallback is pinned). You can re-run the full gate anytime: `npm run lint && npm run typecheck && npm run test && npm run build && ./scripts/smoke-test.sh && npm run test:e2e`.
