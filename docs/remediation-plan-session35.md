# Remediation Plan — Session 35

The session_68-recorded S35 candidates:

1. **The computed-STYLE inventory column** (the deferred session_66
   candidate — twice deferred: S34 judged it "not shipped half-designed")
   — which CSS properties each side's text-bearing elements RESOLVE,
   compared as VALUES. Needs its normalization contract designed first:
   shorthand expansion, the oklab/rgba spelling split (gotcha 4), unit
   canonicalization.
2. **The registry's aria-* extension** — the S33 probes measured the FAQ's
   ARIA contract at parity MANUALLY; the ninth surface's VALUE vocabulary
   covers only `data-*` + microdata today. Growing the vocabulary to the
   shared `aria-*` attributes (with the radix-`:rN:` reference
   normalization per the D125 record) automates what was a one-off probe.
3. **The composer's SDK-prompt drift guard** — the generate route's system
   prompt asks for `<= 60`-char names / `<= 220`-char descriptions while
   `sanitizeGeneratedWorkflow` clamps at 120/500: an intentional
   belt-and-braces pair (the prompt asks tighter than the clamp enforces)
   that lives in an inline string — a future edit to either side would
   drift silently. Pin the pair so any edit surfaces as a review question.

## Scope decision (the operator's open-questions mandate)

- **R1 = candidate 1** (the computed-STYLE inventory). The tenth surface.
  The reachable-subset precedent (palette/typography/section-parity specs)
  pins known properties on known elements; the inventory column is the
  same law at the fleet scale — ANY whitelisted property on ANY matched
  text-bearing element, measured on both sides, normalized to VALUES.
- **R2 = candidate 2** (the aria-* VALUE extension). Same battery pass,
  same registry path — the vocabulary of the ninth column grows from
  `data-*` to include the shared `aria-*` set with ID-reference
  normalization.
- **R3 = candidate 3** (the SDK-prompt drift guard). A seam extraction +
  unit pins — small, deterministic, closes the session's third candidate.

## The normalization contract (R1's design — the twice-deferred piece)

The battery's computed-STYLE inventory column compares, per route, the
k-th text-bearing element (direct text-node child, DOM order, skipping
script/style/noscript/template — the word-parity column's anchor class)
on both sides, over a FIXED property whitelist:

- **Property scope — the SEMANTIC set only:** `color`,
  `background-color`, `font-family` (first family), `font-size`,
  `font-weight`, `line-height`, `letter-spacing`, `text-transform`,
  `text-align`, `text-decoration-line`, `border-top-color`,
  `border-top-width`, `border-radius` (top-left corner). EXCLUDED by
  design: `opacity`/`transform`/`filter` (framer's loop engine writes
  them per frame — gotcha 15/24: a JS animation engine is invisible to
  and unstable for a census), the animation properties (already pinned
  by `mockup-motion-parity.spec.ts`), and the layout/positioning engine
  (`display`/`position`/insets — structural wrappers differ by
  construction, the D125 family).
- **Color canonicalization (gotcha 4):** every color parses to its
  `[r, g, b, a]` numeric tuple — `rgb()`/`rgba()`/hex/`hsl()`/`oklab()`/
  `oklch()`/`color(srgb …)` alike. Rendering-identical spellings compare
  EQUAL by construction; a VALUE delta surfaces as drift. Never "fix"
  the CSS to chase byte-parity.
- **Length canonicalization:** every length parses to a px FLOAT
  (`em`/`rem` resolved by the computed value already; `normal`
  line-height resolves to the used px value in Chromium) and compares
  with a 0.5px tolerance (sub-pixel rounding + the 120Hz rasterizer).
- **`font-family`:** the first family token (quotes stripped) — the font
  bytes themselves are the pinned story (gotcha 5).
- **`letter-spacing`:** px value (the doubled tracking scale is pinned;
  `normal` → 0).
- **At-rest discipline:** the scroll-through pass (gotcha 44) runs
  BEFORE collection on both sides so every entrance has settled; the
  excluded properties make the LOOPS immaterial.
- **Element-count guard:** the matched-element COUNT on each route is
  itself a check (a structural drift that shifts the sequence fails
  loudly rather than mis-pairing silently). Word parity ×8 already pins
  the text; this pins the STYLE the text renders in.

**The aria-* extension's normalization (R2):** the shared `aria-*`
attributes join the VALUE column's vocabulary. Plain-valued attributes
(`aria-expanded`, `aria-hidden`, `aria-disabled`, `aria-label`, …)
compare verbatim. ID-REFERENCE attributes (`aria-controls`,
`aria-labelledby`, `aria-describedby`, `aria-owns`, `aria-details`,
`aria-flowto`, `aria-errormessage`) normalize per token: any
`radix-:rN:` hydration suffix/prefix is stripped (the D125 record),
then the token compares — a structural id-stem delta beyond that
adjudicates through the registry's existing value-rule path.

## R1 — the battery's tenth surface

**Files:** `research/drift-battery-s35.mjs` (gitignored scratch, the
house convention — the battery is rebuilt every session from its
documented contract).

- [ ] R1a. Rebuild the standing NINE surfaces on the S34 contract
      (word parity ×8, mobile nav 7×44px, SEO, JSON-LD, canonical/og/
      twitter:url, head-tag SET registry-wired, DOM-attribute SET
      registry-wired, shared-attribute VALUE, the live standing
      re-probes) — fresh port, scratch DB, `DATABASE_URL` unset in the
      shell (gotchas 1/26/31/46).
- [ ] R1b. Add the **computed-STYLE inventory column** (the
      normalization contract above); run against the live and the
      clone; record every finding.
- [ ] R1c. Adjudicate in vivo — probe a suspect finding's FUNCTIONAL
      contract before registering anything; a real visual delta gets
      FIXED (the parity law), a library/engine spelling reads EQUAL by
      construction (the normalization), and a structure-level delta
      registers through `src/lib/head-superset.ts` with unit pins.
- [ ] R1d. Re-run to GREEN.

## R2 — the aria-* VALUE extension

**Files:** the battery (R1's script), the registry if adjudication
      demands it.

- [ ] R2a. Grow the VALUE column's vocabulary to the shared `aria-*`
      set with the ID-reference normalization; first run recorded.
- [ ] R2b. Adjudicate any delta (the S33 manual probes measured the
      FAQ ARIA contract at parity — the radix-`:rN:` id stems are the
      expected class); register + pin; re-run to GREEN.

## R3 — the SDK-prompt drift guard (TDD)

**Files:** `src/lib/workflow.ts` (the prompt seam),
`src/app/api/workflows/generate/route.ts` (rewire),
`src/lib/workflow.test.ts` (the pins).

- [ ] R3a. **RED**: pins for a new exported seam
      `GENERATE_SYSTEM_PROMPT` — the exact prompt text (the route's
      inline string extracted verbatim), plus the belt-and-braces
      INVARIANT pins: the prompt's name limit (60) ≤ the sanitizer's
      name clamp (120) AND the prompt's description limit (220) ≤ the
      sanitizer's description clamp (500) — the intentional pair, held
      as a reviewed relationship rather than two magic numbers that
      can drift apart silently. The limits parse OUT of the prompt
      text (the pin reads what the LLM reads — no second source).
- [ ] R3b. **GREEN**: extract the constant, rewire the route to use
      it (the route's behavior byte-identical — the prompt string is
      the same bytes), the invariant pins green.
- [ ] R3c. The existing generate-route tests must stay green
      (the route's observable contract unchanged).

## R4 — the standing close-out

- [ ] R4a. Full gate: `npm run lint` → `npm run typecheck` →
      `npm run test` → `npm run build` → `./scripts/smoke-test.sh` →
      `npm run test:e2e` (record the measured counts).
- [ ] R4b. Battery re-run GREEN across ALL TEN surfaces + the aria-*
      extension; zero unregistered drift.
- [ ] R4c. Screenshot refresh (`docs/screenshots/`, the scroll-through
      discipline, DB canonical before AND after) + VLM spot-checks on
      the standing five.
- [ ] R4d. Docs aligned: PAD (revision block + ledger + §7 counts +
      §7.2 + §11), AGENTS (counts + the tenth surface + any new
      gotcha), CLAUDE (session-35 context + counts), README (badge +
      rows), SKILL version bump + lesson, `.env.example` verified in
      sync, this plan ticked with the measured gate, the session log
      `docs/session_70.md`, the worklog.
- [ ] R4e. Commit on `main` + SSH wrapper push (explicit
      `--remote git@github.com:nordeim/saas-company.git`, the S31
      discipline), keys shredded after use.

## Projection

- Unit: 241 + ~6 (R3's prompt/invariant pins + any registry growth) ≈
  247; e2e/smoke unchanged (R3 is seam-level, byte-identical at the
  route) → **~629 total**.
- The battery: 73 standing + the style inventory's per-route checks +
  the aria-* rows ≈ ~120-135; the exact count measured on the first
  run.

---

## Measured close-out (Session 35)

- **R1 (the computed-STYLE inventory — the tenth surface):** the
  battery's first run caught THREE real drift classes (the fifth new
  column in a row to catch drift on its maiden run): **(D130)** the
  live's CUSTOM radius scale — `rounded-sm` 8px / `rounded-lg` 12px
  vs v4's 4px/8px (the BRANTOX chip, the five features AI chips, the
  404's Go Home button) — fixed with `--radius-sm`/`--radius-lg` in
  the @theme; **(D131)** the login's light `--muted` (zinc-100 under
  the opaque gradient — inert, the F5 family) — pinned in the login
  route style; **(D133)** the accessibility note's one-off
  `mt-4 text-white/50 italic` — the content model's note variant +
  the view's exact classes. The battery's own normalizer fixes: the
  FULL-radius equivalence class (9999px ≡ 33554432px), the
  scientific-notation length parse ("3.35544e+07px"), and the
  rendered-ness BOX check (`getClientRects()` — a child inside a
  display:none subtree still computes its OWN display; the first
  authoring's display check read 7 false element-count drifts on
  the mounted-hidden elements).
- **R2 (the aria-* VALUE extension):** the vocabulary's first run
  caught the clone's closed-state ARIA contract WEAKER than the
  live's — every aria-controls reference DANGLING at rest (the FAQ
  panels + the burger's mobile-menu unmounted when closed) where the
  live's Radix regions are MOUNTED-HIDDEN (D132; the stale S4
  "Radix unmounts closed content" record described the pre-hydration
  SPA shell). The panels + the mobile-menu now mount hidden at rest
  (the `hidden` attribute keeps the answers out of innerText exactly
  like the live); the accordion's height var moved to a
  useLayoutEffect keyed on open. The registry's VALUE layer gained
  the **id-refs rule type** — aria-controls + aria-labelledby
  compare RESOLUTION validity in each side's own document, never the
  per-library ID namespace (the D125 record); aria-expanded is
  values-only (the clone's burger the one extra carrier). The
  mobile-navigation + pages FAQ pins UPDATED from the old unmount
  contract to mounted-hidden (toHaveCount(0) → toBeHidden()).
- **R3 (the SDK-prompt drift guard):** TDD RED (3 structural
  failures) → GREEN — `GENERATE_SYSTEM_PROMPT` extracted verbatim +
  the route rewired (the model sees the same bytes); the
  belt-and-braces invariant pinned (the prompt's 60/220 limits
  PARSED OUT OF THE PROMPT TEXT stay ≤ the sanitizer's 120/500
  clamps MEASURED THROUGH THE SEAM).
- **R4 (the gate):** lint/typecheck/build clean; **unit 246/246**
  (241 + 3 prompt + 1 registry + 1 content), **smoke 124/124**,
  **e2e 269/269** (258 + the 11-test session35-parity suite) =
  **639 total** (the ~629 projection LOW by 10: the session35 pins
  landed as an 11-test file). The battery re-run **78/78 GREEN,
  ZERO DRIFT across all TEN surfaces** (the style inventory 8/8
  with the BOX check + the aria column 6/6 through the registry's
  five rules). 20 screenshots refreshed (the scroll-through
  discipline; DB canonical before AND after — 6 rows / 5 active /
  7,120 runs); VLM 5/5 PASS after the hero's below-fold flag
  adjudicated by the in-frame mockup shot (the single-frame family
  — the mockup starts at ~1480px, below even a 1400px viewport;
  the direct-scroll probe first caught it mid-entrance, the
  gotcha-44 discipline re-applied).
