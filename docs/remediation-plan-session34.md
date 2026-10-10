# Remediation Plan — Session 34

The session_67-recorded S34 candidates (from `docs/session_66.md`):

1. **The DOM-attribute layer's VALUE-level twin** — the battery's eighth
   column measures the attribute SET (which `data-*` names exist, per
   route, both sides); the VALUES of the SHARED attributes are unmeasured
   (e.g. the FAQ's `data-state` spellings, the accordion's
   `data-orientation`, the navbar's `data-nav-theme` carriers).
2. **The computed-STYLE inventory column** (the ninth-column candidate) —
   which CSS properties each side's components resolve.
3. **The composer's real-SDK output path** — the sanitize-clamp behavior
   under a live LLM response; only the template fallback is pinned today.

## Scope decision (the operator's open-questions mandate)

- **R1 = candidate 1** (the VALUE-level column). The SET column caught
  three drifts on its first run (S33); the VALUE twin is the same law one
  layer deeper: an attribute that exists on both sides but ANSWERS
  differently is invisible to the SET column by construction.
- **R2 = candidate 3** (the composer's real-SDK path), as a deterministic
  seam extraction + unit pins — the route's fence-stripping/parse/sanitize
  chain is currently inline and unpinned (only `templateWorkflow` and the
  bare `sanitizeGeneratedWorkflow` bounds are unit-tested; no pin covers
  the markdown-fenced JSON shape a real LLM actually emits, prose-wrapped
  output, empty choices, or the clamp's interaction with the parse).
- **Candidate 2 (the computed-STYLE inventory)** is DEFERRED to the S35
  candidate list: the standing palette/typography/section-parity specs
  already pin the REACHABLE subset property-by-property; a full
  inventory column needs a normalization contract (shorthand expansion,
  oklab/rgba spellings — gotcha 4) designed first. Recording the design
  sketch in the session log; not shipping it half-designed.

## R1 — the battery's VALUE-level column

**Files:** `research/drift-battery-s34.mjs` (gitignored scratch, the house
convention), `src/lib/head-superset.ts` (registry extension only if the
column catches drift needing adjudication).

- [x] R1a. Rebuild the standing battery (the S33 eight surfaces — word
      parity ×8, mobile nav 7×44px, SEO surface, JSON-LD, canonical/og,
      head-tag SET registry-wired, DOM-attribute SET registry-wired) on a
      FRESH port with a scratch DB (gotchas 1/26/31/46: own
      `DATABASE_URL`, kill by port, fresh ports per boot).
- [x] R1b. Add the **VALUE-level column**: for every data-* attribute in
      the INTERSECTION of both sides' SETs on a route, collect the
      multiset of `attr=value` pairs (element-attached, body scope) and
      diff them; live-only VALUES on a shared attribute surface as DRIFT
      with the same registry adjudication path (a value-level entry
      shape).
- [x] R1c. Run against the live (`saas-company.base44.app`, rendered in
      Chromium — gotcha 34: never raw-fetch the SPA shell) and the clone
      standalone; record every finding; adjudicate in vivo (probe the
      functional contract before registering — the S33 discipline).
- [x] R1d. If drift is caught: register the adjudications in
      `src/lib/head-superset.ts` (+ unit pins for the registry shape),
      re-run to GREEN. If the live redeployed (gotcha 7): re-measure,
      never assume.

## R2 — the composer's real-SDK output path (TDD)

**Files:** `src/lib/workflow.ts` (extract the seam), the generate route
(call the seam), `src/lib/workflow.test.ts` (+ `generate-llm-parse.test.ts`
if the file grows past a cohesive unit).

- [x] R2a. **RED**: write the failing unit pins for a new pure seam
      `parseLlmWorkflow(text: string): GeneratedWorkflow | null` —
      strips markdown fences, JSON-parses, sanitizes; pins:
      bare JSON, ```json-fenced JSON, prose-wrapped garbage → null,
      empty/whitespace → null, non-object JSON (array/string/number) →
      null, the name/description clamps under LLM-shaped over-long
      output, the unknown-category → Ops fallback, the description <10
      rejection, and the happy path's exact passthrough.
- [x] R2b. **GREEN**: extract `parseLlmWorkflow` in `src/lib/workflow.ts`
      composing the EXISTING `sanitizeGeneratedWorkflow` (one sanitizer,
      two callers — the route and the seam; no second definition).
- [x] R2c. Rewire `src/app/api/workflows/generate/route.ts` to call the
      seam (the route's try/catch contract unchanged — the seam THROWS on
      malformed JSON like `JSON.parse` did, so the catch→template path is
      preserved; verify by reading the diff, then the full gate).
- [x] R2d. Route-level pin: `vi.mock("z-ai-web-dev-sdk")` with a fenced
      JSON completion → the envelope carries the SANITIZED workflow (the
      real-output path, pinned at the route boundary); SDK garbage → the
      template envelope. (Mock-based — deterministic; a live-credential
      probe is out of scope for the gate by the S15/S33 discipline: the
      gate must never depend on an external service.)

## R3 — the standing close-out

- [x] R3a. Full gate: `npm run lint` → `npm run typecheck` →
      `npm run test` → `npm run build` → `./scripts/smoke-test.sh` →
      `npm run test:e2e` (the 602 + the new pins; record the measured
      counts).
- [x] R3b. Battery re-run GREEN across all NINE surfaces (or eight, if
      the VALUE column lands inside the DOM-attribute surface's reading);
      zero unregistered drift.
- [x] R3c. Screenshot refresh (`docs/screenshots/`, the scroll-through
      discipline, DB canonical before AND after) + VLM spot-checks on the
      standing five.
- [x] R3d. Docs aligned: PAD (revision block + ledger + §7 counts + §7.2
      + §11), AGENTS (counts + the new surface + any new gotcha), CLAUDE
      (session-34 context + counts), README (badge + rows), SKILL version
      bump + lesson, `.env.example` verified in sync, this plan ticked
      with the measured gate, `docs/session_68.md` (the S34 log), the
      worklog.
- [x] R3e. Commit on `main` + SSH wrapper push (explicit
      `--remote git@github.com:nordeim/saas-company.git`, the S31
      discipline), keys shredded after use.

## Projection

- Unit: 220 + ~12 (R2 pins) ≈ 232; e2e/smoke unchanged (R2 is unit-level;
  the generate route's behavior is contract-preserving) → **~614 total**.
- The battery: ~117 standing + the VALUE column's per-route checks
  (8 routes × the shared-attribute inventory) ≈ ~125-135; the exact count
  measured on the first run.

---

## Measured close-out (Session 34)

- **R1 (the VALUE column — the ninth surface):** the battery's first
  run caught the /faq carrier-count delta (D127 — Radix stamps
  data-state/data-orientation on every accordion node, ~3x the
  clone's carriers, values at parity) + surfaced the apple-touch-icon
  (D128 — the semantic-head scope restored, the S7-F8 working-asset
  superset registered on the seven non-login routes). The mobile-nav
  collector's first authoring read a false drift (the live's burger
  carries NO aria-expanded — the shared selector is the md:hidden nav
  button; visibility via computed style, not offsetParent) — fixed and
  re-measured **byte-identical 7 x 44px both sides** (no Tailwind v4
  bug).
- **R2 (the real-SDK output path):** TDD RED (8 structural failures)
  -> GREEN — `parseLlmWorkflow()` extracted with the
  THROWS-on-non-JSON contract preserved (the S15 law: the route's
  catch owns the failure class); +9 unit pins +5 route-boundary pins
  under the mocked SDK (GREEN on arrival — the pin-gap class).
- **R3 (the gate):** lint/typecheck/build clean; **unit 241/241**
  (220 + 7 registry + 9 seam + 5 route), **smoke 124/124**, **e2e
  258/258** = **623 total** (the ~614 projection LOW by 9: the route
  boundary pins landed as a 5-test file). The battery re-run **73/73
  GREEN, ZERO DRIFT across all NINE surfaces** (the VALUE column
  reading "values-only registered" on /faq through the registry's new
  `DOM_VALUE_RULES`). 20 screenshots refreshed (the scroll-through
  discipline; DB canonical before AND after — 6 rows / 5 active /
  7,120 runs); VLM 5/5 PASS (the pricing shot's first capture caught
  mid-entrance — the gotcha-44 family; re-captured with the
  scroll-through pass; the hero verdict parser fixed to read the
  first word, not any "fail" substring in the explanation).
