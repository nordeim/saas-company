# Remediation Plan — Session 36

The session_70 S36 candidates, answered in one pass. The baseline is the
Session-35 tree (gate 639 = 246 unit + 124 smoke + 269 e2e; the drift
battery 78/78 GREEN across ten surfaces — `docs/session_70.md`).

- **R1 — the battery's ELEVENTH surface: the interaction-surface column.**
  The S6 hover-probe discipline (gotcha 16: hover needs REAL pointer
  events — an agent-browser `mouse move` once reported `:hover` matching
  while no utility applied), automated fleet-wide. The tenth surface
  measures every text-bearing element's computed style AT REST; the
  interactive chrome's HOVER and FOCUS states — the states a user
  actually spends their pointer on — have never been compared as a
  surface (S6 probed the Get Started pill ONCE, by hand).
- **R2 — the style inventory's non-text-bearing extension.** The S35
  radius findings were all text-bearing carriers (the BRANTOX chip, the
  AI chips, the 404's Go Home); the tenth surface's text-anchor SKIPS
  every painted leaf and media container — the icon gradient tiles, the
  avatars, the dots, the skeleton shapes, the mockup chrome — the layer
  where the custom radius scale was actually DEFINED (`rounded-lg` =
  12px measured on chips). The column grows a second anchor class.
- **R3 — the composer's prompt-version pin at the route boundary.** The
  S35 seam (`GENERATE_SYSTEM_PROMPT` in `src/lib/workflow.ts`) is
  unit-pinned for TEXT and invariant, and the route imports it — but
  nothing pins that the WIRE carries the constant: the mocked-SDK route
  tests assert outputs, never `messages[0]`. A future edit re-inlining
  a prompt string in the route would drift silently past every pin.

## The interaction contract (designed BEFORE the column ships — the S35 lesson)

- **The anchor:** the k-th RENDERED interactive element (`a`, `button`)
  in DOM order, per route, with an element-count guard that fails
  loudly (the S35 anchor discipline). Rendered = the BOX check
  (`getClientRects().length > 0` — gotcha 48: a `md:hidden` burger is
  excluded by construction, both sides).
- **The hover state:** Playwright's REAL `page.mouse.move()` to the
  element's center (gotcha 16 — never a synthetic `mouseover`), after a
  scroll-through pass (gotcha 44: entrances settle first) and a
  `scrollIntoViewIfNeeded` per element. Settle 350ms after the move
  (the live's `transition-colors` run 150–300ms).
- **The focus state (the keyboard twin):** a fresh load, then REAL
  `Tab` presses (the gotcha-25 tab-until-focused discipline — a
  programmatic `el.focus()` does NOT match `:focus-visible` for links
  and buttons, and the honest keyboard chrome is focus-VISIBLE), one
  per focusable in tab order, measuring `document.activeElement`'s
  whitelist after each press. The count guard covers the focusable
  sequence.
- **The measured properties:** the S35 semantic 14-property whitelist,
  UNCHANGED — the animation-touched (opacity/transform/filter) and
  layout-engine properties stay excluded (gotchas 15/24/48), so the
  hover shimmer (an opacity keyframe) and the arrow slide (transform)
  are invisible to the column BY DESIGN; what it measures is the
  color/border/typography chrome of the hover and focus states.
- **The comparison:** per paired element, BOTH the rest row and the
  state row through the S35 normalization contract (colors as VALUE
  tuples, lengths with 0.5px tolerance + the full-radius equivalence
  class, first-family font comparison). A state that changes a prop on
  one side but not the other is a drift by construction.
- **At-rest discipline:** the scroll-through pass runs before every
  collection, both sides, every pass (gotcha 44).

## The non-text-bearing contract (the tenth surface's second anchor)

- **The anchor:** the k-th painted media-leaf element per route —
  RENDERED (the BOX check), NON-text-bearing (no direct text-node
  child with content — the complement of the S35 text anchor), whose
  element children (if any) are ALL media/inline-SVG tags (`img`,
  `video`, `svg`, `path`, `circle`, `rect`, `use`, `g`, `defs`,
  `linearGradient`, `stop`, `polygon`, `ellipse`, `line`, `polyline`,
  `text` — the "media-leaf" rule: an icon tile wrapping one svg
  qualifies; a card wrapping divs does not), and PAINTED (computed
  background-color alpha > 0 OR border-top-width > 0 OR
  border-top-left-radius > 0). Element-count guard, loud on mismatch.
- **The exclusion rationale:** structural wrappers (sections, cards)
  carry element children by construction and differ per-library (the
  D125 family); the painted-media-leaf rule reaches the decorative
  layer (tiles, chips, dots, avatars, orbs, skeleton shapes) without
  the wrapper noise.
- **The properties + comparison:** the same 14-property whitelist and
  the same normalization contract, pairwise per index.

## R3 — the route-boundary prompt pin (TDD)

- **RED (the mutation proof):** sabotage the route locally (re-inline
  a drifted prompt string) → the new route pin fails → restore. A
  pin-gap test is only trustworthy once proven to bite (the S33
  concurrent-limiter class: green on arrival, RED demonstrated by
  construction).
- **GREEN:** `tests/route.test.ts` gains the pin: the mocked
  `createCompletion` receives `messages` whose system entry IS the
  imported `GENERATE_SYSTEM_PROMPT` constant (imported from
  `@/lib/workflow` — the same source the route imports; no second
  source, the anti-tautology law honored: the pin fails on any
  re-inlined drift, passes only on the shared seam).

## The plan's ToDo list

- [x] 0. Baseline gate on the pulled tree (lint → typecheck → unit →
      build → smoke → e2e; expect 639/639).
- [x] 1. Write this plan (this file) BEFORE building the battery.
- [x] 2. Rebuild the battery as `research/drift-battery-s36.mjs`: the
       standing ten surfaces + the ELEVENTH (interaction: hover pass +
       focus pass) + the tenth surface's non-text-bearing second
       anchor.
- [x] 3. First run; adjudicate EVERY finding in vivo before fixing
       (the radius-scale discipline: measure the live's engine layer,
       never trust a class string).
- [x] 4. TDD cycles for every fix: RED pin → GREEN implementation.
- [x] 5. Full gate re-run (expect 639 + the new pins); battery re-run
       ZERO DRIFT on all eleven surfaces.
- [x] 6. The 20-shot screenshot refresh (scroll-through discipline; DB
       canonical before AND after — rows/active/runs).
- [x] 7. VLM spot-checks on the standing five.
- [x] 8. Docs alignment: PAD (revision block, ledger, §7 counts, §11
       rows), AGENTS (counts + the new surfaces + any new gotcha),
       CLAUDE (the session-36 context), README (badge + rows), SKILL
       version bump + lesson, `.env.example` sync check, this plan
       ticked with the measured gate, the session log
       `docs/session_72.md`, the repo `worklog.md`.
- [x] 9. Commit (Conventional Commits, main only) + the SSH-wrapper
       push + the closing record commit.

## Open questions, decided

- **Focus measurement modality:** keyboard Tab (focus-VISIBLE chrome —
  the honest keyboard contract), NOT `el.focus()` (which never matches
  `:focus-visible` on links/buttons outside user-interaction
  heuristics). Decided: Tab.
- **Hover on inputs:** skipped — the anchor is `a, button` (inputs join
  the FOCUS pass, where their rings live). The login form's input
  focus rings are the gotcha-23 surface; the focus pass covers them.
- **The live's toast portal** (fixed top-0, 390×32, pointer-events
  auto — gotcha 18) sits over the login card's top-left on the live:
  hover targets under it are measured as the portal (no visual
  change). The portal is /login-only and the anchor set there (form
  buttons/links) sits below it; adjudicated in vivo if a finding
  points there.
- **Transition mid-flight values:** the 350ms hover settle + the 100ms
  per-Tab settle; if a finding looks like a mid-flight sample, re-probe
  with a longer settle before believing it (the S11 ring-pin family).

## The measured outcome (recorded at close)

- **Baseline gate:** 639/639 ALL GREEN on the pulled tree (246 unit +
  124 smoke + 269 e2e; lint/typecheck/build clean).
- **The battery:** rebuilt phase-split (`research/drift-battery-s36.mjs`
  — main 78 + hover 8 + focus 8 + extra 8 = **102/102 GREEN, ZERO
  DRIFT across all ELEVEN surfaces** after remediation).
- **The first-run findings:** the interaction surface caught THREE
  drifts, all ONE class — the **`lab()` serialization family**
  (D134: the features AI-chip's `border-gray-200`;
  D135: `hover:bg-slate-50` on the login Google button + the 404 Go
  Home) — probed IN VIVO, VALUE-identical (maxΔ=0 through the
  lab→sRGB conversion), fixed per the slate-200 byte-stability
  precedent: `--color-slate-50: #f8fafc`, `--color-gray-200: #e5e7eb`,
  `--color-gray-100: #f3f4f6` (D136 — the anchor-invisible
  structural-wrapper carrier, found by directed grep + probe) pinned
  in the `@theme`, with the battery's `parseColor` growing
  lab()/lch() parsers. The non-text-bearing painted media-leaf
  anchor ran GREEN on its maiden run (verified NON-TRIVIAL: 61
  painted leaves on the landing, 4 on /login, 1 on the 404).
- **R3 (the prompt pin):** RED proven by mutation (a re-inlined
  drifted prompt string fails the pin), then GREEN — the mocked-SDK
  route tests assert the WIRE carries the imported
  `GENERATE_SYSTEM_PROMPT` constant.
- **The gate: 639 → 645** (247 unit + 124 smoke + 274 e2e — the
  route prompt pin +1, the session36-interaction-parity suite +5;
  the plan's projection was +4/+1 — LOW by the anchor-invisible
  D136 pin + the slate-300 hover-border sibling carrier).
- **20 screenshots refreshed** (DB canonical before AND after —
  6 rows / 5 active / 7,120 runs). **VLM 5/5 PASS** after BOTH
  flags adjudicated by evidence: the hero's below-fold family (the
  mockup PASS in-frame at its measured section — the first take
  targeted the hero's full-bleed BACKGROUND video, the gotcha-41
  trap, re-targeted to the dashboard-preview section) and the
  full-page "white section" (the LIVE's own features band —
  "Smart Automation That Learns" — confirmed by VLM-reading the
  live's own full page: parity by construction).
- **Pushed:** see the git log — main only, the SSH wrapper with the
  explicit `--remote git@github.com:nordeim/saas-company.git`.

## The pushed-hash record

The remediation commit **`565692d`** (27 files: the three @theme
byte-stability pins + the battery's lab()/lch() canonicalizers + the
route-boundary prompt pin + the session36-interaction-parity suite +
the docs alignment across PAD/AGENTS [gotcha 49]/CLAUDE/README [the
645 badge]/SKILL v2.35.0 [lesson 75] + the remediation plan + the
session log docs/session_72.md + the refreshed screenshots) pushed via
the SSH wrapper with the EXPLICIT `--remote
git@github.com:nordeim/saas-company.git` (the wrapper's default remote
is the runbook's example repo task-management — the S31-recorded trap;
the explicit flag held from the first dry-run). The wrapper verified
remote main @ 565692d == local HEAD; the fetch-independent HTTPS
ls-remote agreed (565692dad7151270c0b5324ca658043d9c39149e). The
operator key's fingerprint verified through paramiko's own key parse
before the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU —
the S1–S35 record); both the wrapper's temp key copy and the
operator's key file shredded after use; the tree clean; no new
branches; zero zombie servers.
