# Remediation Plan — Session 2 (2026-10-07)

**Scope:** Fix the issues, bugs and gaps found by the Session 2 parity +
dependency audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full §7.3
quality gate, and re-verified by a fresh paired survey.

**Audit method:** fresh DOM captures of every live route (agent-browser,
1440/768/390), word-level + heading/link difflib comparisons against both the
clone and the Session 1 ground truth, VLM side-by-side scoring (z-ai vision,
comparable scroll-triggered full-page captures), `npm audit`, and a full
re-run of the 143-check test gate. Raw evidence: `/home/z/my-project/session2-ref/`
(outside the repo), summarized below.

**Reference drift check:** the live site is UNCHANGED since the Session 1
survey — identical headings (22/22), identical link map (22/22), identical
mobile-menu geometry, `/dashboard` + `/checkout` still SPA-404 (the clone's
workspace remains the documented superset D1). Every finding below is
therefore a clone-side gap, not reference drift.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | Accessibility legal page is missing two reference lists: the 8-item "we have also" commitment list (section 3) and the 4-item coordinator contact list (section 6) | `src/lib/legal-content.ts` L70–120 (`ACCESSIBILITY`) | MEDIUM | Verified (live DOM) | Content parity |
| F2 | Accessibility page renders the "A legal disclaimer" caption; the reference omits it on THIS page only (it appears on privacy/terms/refund-policy, where the clone matches 1.0) | `src/lib/legal-content.ts` L72; `legal-page-view.tsx` L17 | MEDIUM | Verified | Content parity |
| F3 | Login page shows an extra "← Back to SAAS Company" link (reference `/login` has zero anchors, no nav, no footer — a bare auth card) | `src/app/login/page.tsx` L263–271 | LOW | Verified (live DOM) | Visual parity |
| F4 | Hero scroll-indicator motion profile differs: reference drives the dot with a JS oscillation (`translateY 0→~8px`, period ≈1.7 s, ~40 samples captured); clone uses Tailwind `animate-bounce` (−2 px, 1 s, bouncy) — static markup is identical (`w-6 h-10` pill, `w-1 h-2` dot) | `src/components/sections/hero.tsx` L128–130 | LOW | Verified (rAF sampling) | Motion parity |
| F5 | `npm audit`: 11 vulnerabilities — CRITICAL: vitest 3.2.7 chain (tinypool prototype-pollution → RCE GHSA-85c8-ppgw-ccpr; @vitest/mocker path traversal GHSA-82fw-gwwq-j7x9); HIGH: prisma/@prisma/config via deepmerge-ts (GHSA-ggr8-5vv4-36mx); HIGH: eslint chain (braces GHSA-vfj7-8cjw-p6xm, micromatch, fast-glob, @next/eslint-plugin-next) — all dev-time only | `package.json` deps | HIGH | Verified (`npm audit --json`) | Dependency health |
| F6 | VLM residual deltas below threshold, accepted as engine/timing artifacts: full-page 98/100 (animated chart bar heights, text wrapping), mobile menu 95/100 (blur over video frame), hero 95/100 (logo petal mid-animation frame, video frame) | — | INFO | Reasoned | Accepted (documented) |
| F7 | The reference's own footer typo "© 2026 NovaaAI" is cloned verbatim (NOT a bug — flagged here so no one "fixes" it back) | `src/components/site/footer.tsx` L164 | INFO | Verified | Parity (no action) |
| F8 | Found during execution (VLM re-runs, confirmed in both DOMs): the features-section card diverges per tab — AI tab shows extra "SOC 2 compliant"/"Alerts on" badges instead of the reference's single right-aligned "Optimization score: 78%" caption; Analytics tab renders the generic template instead of the reference's 12-bar chart + three stat chips (2,847 / 12.4% / $84.2K); Builder tab renders the generic template instead of the reference's 4 numbered steps + pulsing "Pipeline Active" footer | `src/components/sections/features.tsx` | MEDIUM | Verified (live DOM, all three tabs) | Content parity |
| F9 | Found during execution: the check rows use blanket `CheckCircle2` icons; the reference uses per-tab lucide icons — AI: zap + shield; Analytics: chart-column + clock; Builder: workflow + zap | `src/components/sections/features.tsx` | LOW | Verified (live SVG classes) | Icon parity |
| F10 | Residual dependency advisory: braces GHSA-vfj7-8cjw-p6xm (stack-exhaustion DoS) — vulnerable range ≤ 3.0.3 covers EVERY published version; no patched release exists upstream. Lint-toolchain-only (no attacker-controlled input reaches braces in this repo). The npm "force fix" (eslint-config-next 16→14 downgrade) is REJECTED — it would weaken the Next 16 toolchain to silence an unpatchable dev-time advisory | `package.json` overrides | LOW (accepted) | Verified (`npm audit --json`) | Accepted (documented) |

Non-findings (checked, clean): mobile navigation (geometry, tags, hrefs,
44px rows, close-on-navigate — identical to the live; 8 e2e pins green);
FAQ answers + single-expand accordion behavior (live-expanded spot checks
match the pinned content); privacy/terms/refund-policy (1.0 word parity);
Tailwind v4 traps (all five documented traps still enforced — no v4 bug
present); the exported-`DATABASE_URL` sandbox trap (all booting scripts pin
their own value; `db/` resolves at the repo root in every context).

---

## 2. Remediation ToDo (executed in order, TDD)

### R1 — Restore the accessibility page's reference content (F1 + F2)

1. **RED:** extend `src/lib/content.test.ts` accessibility pins FIRST:
   - `ACCESSIBILITY.sections[3]` carries `list: {style: "disc", items: [8 exact strings]}` (the commitments, ending "Ensured all videos, audio, and files on the site are accessible");
   - `ACCESSIBILITY.sections[6]` carries `list: {style: "none", items: [4 exact placeholder strings]}`;
   - `ACCESSIBILITY.disclaimer === null` while PRIVACY/TERMS/REFUND_POLICY keep `"A legal disclaimer"`.
2. **GREEN:** update `src/lib/legal-content.ts`:
   - extend `LegalSection` with an optional `list?: { style: "disc" | "none"; items: string[] }`;
   - append the two lists to sections 3 and 6 (items verbatim from the live DOM capture);
   - type `disclaimer: string | null`; set `null` on ACCESSIBILITY only.
3. **GREEN:** update `src/components/site/legal-page-view.tsx`:
   - render the caption only `if (page.disclaimer)`;
   - render lists after the paras: `list-disc list-inside mt-4 space-y-2` (style "disc") / `list-none mt-4 space-y-1` (style "none") — the reference's exact classes.
4. **VERIFY:** re-run `npm run test` (content pins green); rebuild; re-run the
   page parity audit — accessibility similarity → 1.0 (from 0.9072).

### R2 — Remove the login page's non-reference back-link (F3)

1. **RED:** add an e2e pin to `tests/e2e/pages.spec.ts` (legal-pages block):
   the `/login` page renders no anchor elements at all
   (`expect(page.locator("a")).toHaveCount(0)` after load) — currently fails
   (the back-link exists).
2. **GREEN:** delete the back-link block and the `&nbsp;` spacer paragraph
   from `src/app/login/page.tsx` (L263–271); drop the `Link`/`useState`-unused
   imports that remain.
3. **VERIFY:** the new e2e pin passes; VLM login compare re-run (expect the
   caption row to disappear); word parity → 1.0.

### R3 — Match the hero scroll-indicator motion (F4)

1. **RED:** no unit seam applies (pure CSS motion). The e2e landing spec gains
   an assertion that the dot carries the custom animation class
   (`animate-scroll-dot`), currently failing.
2. **GREEN:** in `src/app/globals.css` add the v4-CSS-first token:
   `@theme { --animate-scroll-dot: scroll-dot 1.7s ease-in-out infinite; }`
   with `@keyframes scroll-dot { 0%,100% { transform: translateY(0) } 50% { transform: translateY(8px) } }`;
   swap `animate-bounce` → `animate-scroll-dot` in `hero.tsx`; keep
   `prefers-reduced-motion` coverage (add `scroll-dot` to the collapsed set).
3. **VERIFY:** sample the clone dot via rAF (amplitude ≈8px, period ≈1.7s) and
   re-run the hero VLM compare.

### R4 — vitest 3.2.7 → 5.0.3 (F5 critical chain)

1. `npm install -D vitest@^5.0.3` (major bump; the config surface used here —
   `defineConfig`, `test.include`, `environment`, `resolve.alias` — is stable
   across v5).
2. **VERIFY:** `npm run test` → 69/69 green on v5; `npm audit` shows the
   vitest/tinypool/@vitest/mocker chain resolved.

### R5 — prisma chain (F5 high, non-breaking)

1. `npm audit fix` (targets @prisma/config → deepmerge-ts; stays on prisma
   6.x — latest 6.19.3; do NOT take the 8.0.0-rc).
2. **VERIFY:** `npm run db:push && npm run db:seed` still resolve
   `<repo>/db/custom.db`; smoke suite re-run green.

### R6 — eslint chain overrides (F5 high, dev-only)

1. Add `package.json` `overrides` pinning the patched transitive versions:
   `"braces": "^3.0.3"`, `"micromatch": "^4.0.8"`, `"fast-glob": "^3.3.3"`.
   Explicitly REJECT `npm audit`'s suggested downgrade of
   `eslint-config-next` 16.4.0 → 14.2.35 (it would mismatch the Next 16
   toolchain to silence a dev-only advisory).
2. `npm install` → `npm audit` → expect 0 vulnerabilities (or document
   residue); `npm run lint` still green on `eslint-config-next@16.4.0`.

### R7 — Documentation alignment

- `Project_Architecture_Document.md`: revision block v1.1 (this plan's
  findings + the ledger rows below), §5.4 add D9 (login bare-card parity
  restored) and D10 (scroll-dot motion matched), §7 counts if changed,
  dependency table (vitest 5).
- `README.md` / `CLAUDE.md` / `AGENTS.md`: stack + badge rows refreshed
  (vitest 5), troubleshooting row for the scroll-dot, gate counts.
- `docs/saas-company_SKILL.md` created via `skills/distill-codebase-skill`
  + `skills/to-distill-project-into-skill` (read both SKILL.md files first).

### R8 — Screenshots + .env.example

- Refresh `docs/screenshots/` from the remediated production build
  (login + accessibility changed; recapture the full set for consistency).
- `.env.example`: re-verify it matches the codebase exactly
  (`DATABASE_URL="file:../db/custom.db"`, `AUTH_SECRET`,
  `NEXT_PUBLIC_SITE_URL`) — no new vars introduced by R1–R6; keep tracked.

### R9 — Full re-verification

1. Gate: `npm run lint` → `npm run typecheck` → `npm run test` →
   `npm run build` → `./scripts/smoke-test.sh` → `npm run test:e2e`
   (all green; counts updated in docs if changed).
2. Parity re-survey: page-level difflib audit (expect accessibility 1.0,
   login 1.0) + VLM full-page/mobile-menu/hero re-run (expect ≥95).
3. `npm audit` → 0 known vulnerabilities.

### R11 — Features card per-tab parity (F8 + F9, found during execution)

1. **RED:** three new e2e pins in `tests/e2e/pages.spec.ts` ("features section
   (reference card parity)"): AI tab right-aligned caption + zero SOC2/Alerts
   badges; Analytics tab 12-bar chart + the three stat chips; Builder tab the
   four numbered steps + "Pipeline Active" — all failed against the pre-fix
   card.
2. **GREEN:** rewrote the illustrative card in `features.tsx` as three
   per-tab branches with the reference's measured markup — including
   `ANALYTICS_BARS` (12 bars: exact heights 30→95% and per-bar violet
   gradients sampled from the live DOM after its entrance animation), the
   stat chips (`2,847`/`12.4%`/`$84.2K`), the numbered step rows with
   connectors, and the pulsing green footer. Per-tab check icons
   (`zap`+`shield` / `chart-column`+`clock` / `workflow`+`zap`) replace the
   blanket `CheckCircle2` (verified against the live's lucide SVG classes).
3. **VERIFY:** pages.spec 15/15 green; VLM features-section compare 92→95.

### R10 — Handoff

- Update the repo `worklog.md` (Session 2 section).
- `git commit` (Conventional Commits, `main` only) → SSH push via
  `docs/ssh_git_wrapper_v3.py` with the operator key supplied out-of-band
  (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

---

## 3. Validation of this plan against the codebase (pre-execution review)

| Plan reference | Codebase check | Result |
|---|---|---|
| F1/F2 file + line refs | `legal-content.ts` L70–120 read; `LegalPage`/`LegalSection` types at L8–16; view renders `page.disclaimer` unconditionally at `legal-page-view.tsx` L17 | Aligned |
| F3 file + line refs | `login/page.tsx` L263–271 read (back-link + `&nbsp;` spacer); `Link` import at L4 | Aligned |
| F4 file + line refs | `hero.tsx` L128–130 (`animate-bounce` dot) read; globals.css `@theme` is the only token source (no config bridge) | Aligned |
| F5 versions | `npm ls`: vitest 3.2.7, prisma 6.19.3, eslint-config-next 16.4.0, next 16.4.0; latest 6.x prisma is 6.19.3 (8.x is RC — excluded) | Aligned |
| Test-count claims | 69 unit + 36 e2e + 38 smoke = 143, all green pre-plan (verified this session) | Aligned |
| Reference ground truth | Live re-surveyed this session: unchanged since Session 1 (headings 22/22, links 22/22, menu geometry identical, `/dashboard` + `/checkout` still 404) | Aligned |
| skills/ exclusion | tsconfig `exclude`, eslint `ignores`, vitest `include` patterns, Next `src/` scoping — all exclude `skills/` from checking/testing/compilation | Aligned |

**Risk assessment:** R1–R3 are surgical content/chrome edits with new pins
written first; R4 is a dev-dependency major bump validated by the existing
69-check suite; R5 is a lockfile-level fix; R6 is an overrides block that
cannot touch runtime. No schema, API, or auth changes. Rollback = revert the
single commit (R10 is the only push).

**Execution order rationale:** content parity first (R1–R3, the user-visible
goal), then dependency health (R4–R6, validated by re-running the gate), then
docs/screenshots (R7–R8, reflect the final state), then the single
verification + handoff pass (R9–R10).
