# Session 17 Log — Hydration Health, Cross-Route Axe, the API Contract & the Flaky Gate (the Session-11 Remediation, 2026-10-08)

Continuing from Session 15/16 (main @ 49d8a7a — the verified Session-10
push `05d08f0` + `ba9fe50` plus the session-log updates). The mandate:
refresh, review the session-15/16 + remediation-plan-10 docs, re-audit
against the live (with particular attention to the mobile navigation and
possible Tailwind v4 bugs), remediate TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- Fresh clone (the workspace had been reset); both repos re-cloned
  (`saas-company` + the `scandihaven` reference); `.env` re-created from
  `.env.example` (AUTH_SECRET generated; `DATABASE_URL="file:../db/custom.db"`),
  `db/custom.db` pushed + seeded at the repo root. **The
  exported-DATABASE_URL trap was live AGAIN** (the shell exports an
  absolute path outside the repo into every command) — neutralized
  per-command with `env -u DATABASE_URL` throughout; no foreign file
  survived this time.
- Root docs (AGENTS/CLAUDE/README/PAD/SKILL v2.9.0) + status docs
  (session_15/16, remediation-plan-10, worklog) reviewed; the
  `skills/` folders excluded from every toolchain (verified:
  tsconfig/eslint ignore them; vitest matches only `src|tests/**/*.test.ts`;
  playwright's testDir is `tests/e2e`).
- Baseline gate: lint ✓ typecheck ✓ Vitest 92/92 ✓ build ✓ smoke 43/43 ✓
  Playwright **163/164** — the one failure being the palette-parity
  keyboard-ring pin, which reproduced at a ~30–40% rate in isolation.
  That flake (observed but not diagnosed at the end of Session 10) became
  this session's first finding.

## Phase 2 — The audit (the reference UNCHANGED; five new survey surfaces)

**Drift check** (8 routes, scroll-passed innerText): word parity **1.0000
on every route** — the live is unchanged since Session 10.

1. **The mobile-navigation paired re-verification** (the standing operator
   ask, real-touch 390×844 contexts): the clone's burger (342,16 24×24,
   `md:hidden text-white/80 hover:text-white`) taps open into the
   byte-identical panel (0,56 390×397, seven 44px rows, same classes
   `md:hidden bg-black/95 backdrop-blur-xl border-b border-white/5`),
   scroll-locks while open, Escape closes, navigate closes (e2e-pinned),
   the resize guard closes across 768. The live's own burger remains
   POINTER-BLOCKED by its empty toast portal (D32) — a real tap times out
   even now. **No Tailwind v4 bug exists in the clone's mobile nav**; the
   documented v4 traps (oklab serialization, theme-var triplets,
   aspect-ratio slash, tracking scale, shadow rename, leading cascade,
   ring emission order) are all pinned by the passing suites.
2. **The first cross-route axe sweep** (clone, all 9 routes) + **live-side
   axe adjudication** (/, /faq, the 404): the clone's violations on the
   parity-bound routes ship IDENTICALLY on the live (the beta-badge
   contrast, the testimonial strip's scrollable-region, the FAQ's
   white/40 + heading structure, the 404's landmarks) — **parity, not
   bugs** (ledgered D63). The clone's own superset surfaces surfaced TWO
   real violations: the dashboard's paused-card description (F3) and…
   the 404's console.
3. **The first console/pageerror sweep** (every route): exactly ONE page
   error in the whole app — **React #418 on every 404 load** (F2). Root
   cause chain: the not-found page is a statically-prerendered CLIENT
   component whose `usePathname()` span ships the INTERNAL route id
   (`"_not-found"`) in the prerendered HTML while the hydration render
   carries the real URL → text mismatch → React discards the server tree
   and re-renders client-side. The live's SPA 404 has a clean console.
4. **The API edge-case probe**: invalid UUIDs → clean 404 envelopes (no
   Prisma 500s), invalid enums → 400, oversized ideas → 400, the session
   cookie ships Secure/HttpOnly/SameSite=lax — but **PATCH silently
   TRUNCATES a 300-char name to 120 while POST rejects it** (F4) — an
   inconsistent contract for one field.
5. **Pixel-level contrast adjudication + a controlled compositing
   experiment** (for the axe-flagged dashboard line): the paused/draft
   articles carry `opacity-80`, so the description's `text-white/50`
   renders at effective white/40 — glyph-interior sampling at 4× device
   scale measured EXACTLY `103,103,103` over `#020202` (3.61:1). The
   control (rgba vs oklab vs `color-mix(in oklab, #fff 50%, transparent)`
   over the same bg — all render #818181) proved the v4 color engine
   INNOCENT: the ancestor opacity is the whole story (F3).
6. **VLM spot checks + pixel adjudication** (hero/mockup/mobile-menu/
   testimonials IDENTICAL; the pricing composite's "logo differs" claim
   disproven — the zoomed logo crops differ by 0.0%/0.2% of pixels; the
   mark ROTATES so mid-phase shapes read differently to a VLM; the
   section heights match exactly: pricing 1026 = 1026, testimonials
   697 = 697).

The remediation plan was written against these findings
(`docs/remediation-plan-session11.md` F1–F8 + the execution-discovered
F10), then validated against the codebase (every touchpoint re-read,
every conflicting pin checked) before execution.

## Phase 3 — Remediation (TDD; every pin observed RED first)

- **R1 — the flaky ring pin de-flaked** (F1): TWO root causes (the fixed
  200ms sampled the box-shadow MID-TRANSITION — `3.98466px`/alpha-.996
  frames, and Chromium serializes the settled value two ways; AND the
  blind Tab×4 landed on the INPUTS when hydration shifted the tab order —
  the failing samples carried the inputs' slate-400 ring). Fix:
  tab-until-the-Sign-in-is-focused (bounded) + `expect.poll` to the
  settled 4px ring matching either spelling. **10/10 isolated + 8/8
  full-spec consecutive greens** (was ~30–40% flaky).
- **R2 — the 404 hydration fix** (F2): RED first (the new
  `tests/e2e/hydration.spec.ts` — zero pageerrors + the quoted path +
  the static-HTML placeholder contract; the #418 pin failed as expected).
  Fix: a `useSyncExternalStore` mount gate (server snapshot false) reading
  `window.location.pathname` — NOT `usePathname()`, which settles to the
  internal `/_not-found` route id once the App Router settles (found the
  hard way: the first cut of the fix used usePathname and the page quoted
  `"_not-found"`). Server and hydration renders agree (empty quotes); the
  real URL fills one post-hydration commit and STAYS (sampled over 4s).
- **R3 — the paused-card contrast** (F3): RED first (the contrast pin,
  failing at 3.61:1 on "Blend usage, support sentiment…"); fix
  `text-white/50` → `text-white/60` on the description line (active ≥ 7:1,
  paused ≥ 5.1:1). The pin piggybacks on the seeded-workspace test's
  sign-in after the F10 discovery (below).
- **R4 — the PATCH name contract** (F4): RED first (two smoke pins — the
  300-char PATCH must 400 VALIDATION; the pre-fix server returned 200
  with a cut name); fix: the same `requiredString` validator POST uses.
- **R4b — F10, found live**: the full-suite run after R3 failed an
  UNRELATED Session-10 pin order-dependently — the suite's ~10 UI
  sign-ins (auth 4 + dashboard 3 + mockup 2 + login-states 1) sat at
  EXACTLY the auth limiter's default budget, and the +1 signed-in spec
  tripped a mid-suite 429. Fix: `AUTH_RATE_LIMIT_MAX` (default 10 —
  production unchanged; the Playwright webServer pins 50) + two unit
  tests (default AND override) + `.env.example` documentation.

## Phase 4 — Verification

- **Gate: ALL GREEN — 307 checks** (94 unit = 92 + 2 rate-limit; 167 e2e
  = 164 + 3 hydration; 46 smoke = 43 + 3 name-contract).
- **Paired re-survey**: word parity 1.0000 on ALL 8 routes (the 404
  restored to full parity — it briefly regressed to 0.1071 mid-fix while
  a zombie `next-server` process served a stale build from :3000; the
  playwright/smoke suites were unaffected — they boot their own servers);
  **axe on /dashboard: ZERO violations** (was 1); the 404 console: ZERO
  pageerrors (was React #418); the mobile nav re-probed byte-identical
  (burger 342,16 24×24; panel 0,56 390×397, seven 44px rows; scroll-lock,
  Escape, resize guard all green; the live's D32 still blocked).
- **Screenshots**: all 17 standard shots refreshed against the remediated
  build (the 404 shot verified quoting the REAL URL; the mobile-menu shot
  verified open with all rows — VLM-checked).

## Phase 5 — Docs & handoff

PAD (revision block; ledger **D63–D66**; §5.5 traps **17–18**; §7 counts
and conventions; §8.2 env table; §11 key files), AGENTS (commands/gate
counts; gotcha 8 rewritten for the override; **gotcha 25**), CLAUDE
(session-11 context, counts), README (307 badge, the hydration suite +
name-contract rows, the AUTH_RATE_LIMIT_MAX env row, two troubleshooting
rows), `saas-company_SKILL.md` v2.10.0 (**lessons 30–31**), the
remediation plan (`docs/remediation-plan-session11.md`, incl. the
execution-discovered F10/R4b), this log, and the repo `worklog.md`.
`.env.example` updated with the new optional var (AUTH_RATE_LIMIT_MAX)
and re-verified against the codebase. Commit + SSH push per the runbook.
