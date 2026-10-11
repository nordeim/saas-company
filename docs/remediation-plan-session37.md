# Remediation Plan — Session 37

The session_72 S37 candidates, answered in one pass. The baseline is the
Session-36 tree (gate 645 = 247 unit + 124 smoke + 274 e2e; the drift
battery 102/102 GREEN across eleven surfaces — `docs/session_72.md`).

- **R1 — the interaction surface's POINTER-MODALITY focus twin.** The S36
  focus column measured the `:focus-visible` chrome through REAL Tab
  presses — the KEYBOARD modality. The POINTER modality (a mouse-down
  focus) is a different state in Chromium: `:focus` matches but
  `:focus-visible` does NOT. If one side styles `focus:` utilities and
  the other `focus-visible:`, the drift is invisible to every existing
  surface (the rest column, the hover twin, the Tab twin) and shows ONLY
  under a real `page.mouse.down()`. The trap (the gotcha-25 law one
  modality wider): a synthetic `el.focus()` NEVER distinguishes modality —
  only a real pointer press gives the pointer-modality state.
- **R2 — the style inventory's background-image gradient layer.** The
  S35/S36 columns measure fourteen semantic properties — all scalars and
  colors. `background-image` (the hero's violet→blue ramps, the card
  gradients, the login's full-page wash) has never been compared: the
  live ships v3-computed gradient strings, the clone v4's — and the
  S36 lab() lesson says the engine's SERIALIZATION can drift while the
  VALUES are identical. Gradients need their own normalization contract
  (the stops as color tuples, the angle/shape grammar, the position
  list) before the comparison is honest.
- **R3 — the battery's TWELFTH surface: the transition-timing contract.**
  Which props transition, at what duration, with what easing, per
  interactive element — the choreography layer the hover twin depends on
  but never measures. Tailwind v4's `transition-colors` emits a WIDER
  property list than v3's (the `--tw-gradient-*` custom-property family
  rides in v4's list); v4's default `transition` property list differs
  from v3's too. Each divergence is either an engine-internal spelling
  (adjudicated) or a REAL choreography drift (fixed).

## The pointer-modality focus contract (designed BEFORE the column ships)

- **The anchor:** the same k-th RENDERED interactive element (`a`,
  `button`) the S36 interaction column measures, per route, with the
  element-count guard (the S35 discipline — a count mismatch fails
  loudly, it never "aligns" indices).
- **The state:** a fresh load per route, the scroll-through pass
  (gotcha 44 — entrances settle), `scrollIntoViewIfNeeded` per element,
  then a REAL `page.mouse.move()` to the element center (gotcha 16)
  followed by `page.mouse.down()` — and the read taken while the button
  is HELD (the mousedown state is the pointer-modality focus state:
  `:focus` matches, `:focus-visible` does not, in Chromium, for
  links and buttons). The stable-poll read (two consecutive equal
  samples or the 700ms cap) applies — a read taken mid-transition is a
  lie. `page.mouse.up()` + a move-away after each element.
- **The measured properties:** the S35 semantic 14-property whitelist,
  UNCHANGED — color/border/typography chrome; the animation-touched
  (opacity/transform/filter) and layout-engine properties stay excluded
  (gotchas 15/24/48).
- **The comparison:** per paired element, BOTH the rest row (already
  green through the S36 columns — re-derived here as the pairing key)
  and the pointer-focus row through the S35 normalization contract
  (colors as VALUE tuples incl. the lab()/lch() parsers, lengths with
  0.5px tolerance + the full-radius equivalence class, first-family
  font comparison).

## The gradient-layer contract (the style inventory's background-image extension)

- **The anchor:** every element whose computed `background-image` is not
  `none` on the route — BOTH anchor classes (text-bearing AND painted
  media-leaf — the S35/S36 pair), plus a route-level gradient-COUNT
  guard (a silent gradient added or dropped is a drift by construction).
- **The normalization:** the computed string is parsed into a gradient
  RECORD —
  - the FUNCTION family (`linear-gradient`, `radial-gradient`,
    `conic-gradient`) compared exactly (a linear↔radial swap is a real
    drift);
  - the DIRECTION grammar normalized: angles as degrees floats
    (Chromium serializes `135deg` → `135deg`; `to bottom right` stays
    `to bottom right` — compare the serialized form exactly, they are
    stable), the shape/extent keywords (`circle farthest-side` etc.)
    compared exactly;
  - the STOPS as the S36 color-tuple pipeline (rgb/hex/hsl/oklab/oklch/
    lab/lch all parse — the gotcha-4 law at the gradient layer), with
    the `transparent` keyword normalized to `rgba(0, 0, 0, 0)` (its
    computed serialization);
  - the stop POSITIONS as floats with a 0.5% tolerance and the MISSING
    position = the auto-spaced default (compared as absent, never
    invented);
  - MULTIPLE layers (comma-separated images) compared as an ordered
    list (the paint order is visual).
- **The comparison:** pairwise per index through the record equality;
  a stop-count or layer-count mismatch is a drift by construction (the
  element-count guard's sibling).

## The transition-timing contract (the twelfth surface)

- **The anchor:** the k-th rendered interactive element (`a`, `button`)
  per route — the same anchor family the S36 interaction column rides.
- **The measured record:** `transition-property`, `transition-duration`,
  `transition-timing-function`, `transition-delay` — read as the
  COMPUTED LISTS (Chromium serializes each as the comma-separated list
  cycling per property).
- **The normalization:**
  - durations/delays as ms floats (Chromium serializes `150ms` or
    `0.15s` — parse the float, never the spelling);
  - timing functions canonicalized: the keywords stay keywords
    (`ease`, `linear`, `ease-in`, …), `cubic-bezier(a, b, c, d)` as the
    rounded-float tuple, `steps(n, <position>)` as the pair;
  - the property LIST compared as the ordered list of lowercase
    property names with the `--tw-*` custom-property family STRIPPED —
    the adjudication candidate (v4's `transition-colors` carries the
    inert `--tw-gradient-from/via/to` vars v3 never emits; they
    transition nothing unless gradient-stop utilities change, and when
    they DO change v4 animates the ramp smoothly — a strictly-better
    superset, the production-superset law). The strip is MEASURED, not
    assumed: the battery logs both the raw and the stripped list, and
    an element whose stripped list still drifts is a REAL finding.
- **The comparison:** pairwise per index; `all` vs an explicit list is
  a drift surfaced (never silently expanded).

## The TDD execution order (the house law)

1. The battery phases built (research/drift-battery-s37.mjs — the
   phase-split discipline: pointer / gradient / transition / extra, each
   a self-contained foreground call; a silently-empty log with no EXIT
   line is the reap signature — gotcha 49).
2. Each phase's FIRST RUN read as findings; every finding adjudicated
   IN VIVO (probe the computed values on both sides, convert the
   spellings, decide VALUE-identical vs REAL drift) before any fix.
3. Real drifts: RED pins first (tests/e2e/session37-*.spec.ts), then
   the fix, then GREEN. Value-identical spellings: the normalization
   contract grows the parser (the S36 lab() precedent) — and a USED
   value-identical token may still earn an @theme PIN for byte-stable
   serialization (the slate-200 precedent).
4. The full gate re-run (unit + lint/typecheck/build + smoke + e2e).
5. The 20-shot screenshot refresh + the VLM standing five (the
   scroll-through discipline; DB canonical before AND after).
6. Docs aligned: PAD (the revision block, the ledger rows, §7 counts,
   §7.2 the session37 pins, §11 the spec row), AGENTS (the counts +
   the twelfth surface + the new gotcha if the session earns one),
   CLAUDE, README, SKILL version bump + the new lesson,
   .env.example sync check, this plan ticked, the session log
   (docs/session_74.md), the worklog.

## The open questions (best-judgement decisions, recorded here)

- **Does the pointer-modality twin ride its own phase or extend the
  focus phase?** Its own — the phase-split law (each phase a
  self-contained foreground call under the 10-minute reaper) and the
  per-phase fresh-load discipline both demand it.
- **Is the dashboard route in scope?** No — the battery's eight public
  routes only (the authed workspace has no live-side stable anchor for
  a logged-out battery; the workspace parity rides the e2e suite's
  274 pins, the standing law since S6).
- **Where do transition adjudications live if the `--tw-*` strip is not
  enough?** In the battery's normalization (the S35/S36 precedent —
  style-layer equivalence classes live in the contract, not the
  head-superset registry; the registry stays head-tag/DOM-attr scoped).

## ToDo (ticked as executed, with measured results)

- [x] R1: the pointer-modality phase built; first run read — THREE
      measurement-artifact families caught and hardened (the scroll-settle
      discipline, the atomicity discipline, the state-aware verified poll);
      the verified run: **8/8 GREEN, ZERO DRIFT** — the pointer-modality
      chrome (:focus under a held mousedown, hover+focus+active) is at
      parity across all eight routes; no code drift existed (the earlier
      readings were transients, each disproven by focused in-vivo probes)
- [x] R2: the gradient phase built; first run caught **D138** (v4's `in
      oklab` interpolation directive — a REAL rendering difference, fixed
      by overriding the five USED bg-gradient-to-* utilities), **D139**
      (the explicit 0%/50%/100% stop positions — the from/to positions
      ride the same override; the via positions normalized as the
      auto-spacing equivalence class), **D140** (slate-100 + gray-50
      `lab()` stops — pinned per the slate-200 precedent); the color-mix
      alpha stops adjudicated VALUE-IDENTICAL in vivo (maxDelta ≤ 0.044);
      re-run **8/8 GREEN**; 7 e2e pins (session37-gradient-parity)
- [x] R3: the transition phase built; first run caught **D137** (the
      live's login-bundle transition-colors carries the legacy
      `-webkit-text-decoration-color` alias — route-scoped override +
      3 e2e pins incl. the route-scoping guard); the `--tw-*` strip
      measured (the clone's lists already matched — Session 8's F3
      override); re-run **8/8 GREEN**
- [x] The extra phase: **12/12 GREEN** after encoding the documented
      contracts (the sitemap superset, the robots superset, the JSON-LD
      supersets, the md:hidden burger selector, the full-load word
      parity); caught **D141** (the clone's sitemap listed /login where
      the live's policy omits it — removed, 1 e2e pin)
- [x] The full gate re-run: **656 checks ALL GREEN** (247 unit + 124
      smoke + 285 e2e — 274 standing + 11 new session37 pins; lint /
      typecheck / build clean)
- [x] The 20 screenshots + the VLM standing five: 4/5 raw → **5/5 after
      evidence adjudication** (the login card's 4px top strip verified
      byte-exact at the computed level — linear-gradient(to right,
      rgb(226,232,240), rgb(203,213,225), rgb(226,232,240)) — a 4px
      element is below the VLM's practical resolution; the pricing shot
      re-framed on the card grid after two mis-frame iterations)
- [x] The docs alignment + the session log (docs/session_74.md) + the
      worklog
- [x] The commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding — the S31/S36 discipline)

## The measured session record (for the ledger)

- **Gate: 645 → 656** (247 unit + 124 smoke + 274 → 285 e2e)
- **Battery: 36 checks GREEN, zero drift** (pointer 8 + gradient 8 +
  transition 8 + extra 12 — the S37 four-phase split)
- **The findings ledger: D137–D141** (five new rows)
- **The tooling lessons (AGENTS gotcha 50):** the standalone server FORKS
  (a wrapper-only kill orphans a next-server child that keeps serving a
  STALE build — the port guard + the process-group kill); the incremental
  build can serve a MIXED build after route-scoped `<style>` edits (a
  hydration #418 at load with NO code defect — `rm -rf .next` is the only
  trustworthy reset before a gate); the measurement laws (scroll-settle,
  atomicity, the verified poll) are part of the surface contract, not
  niceties — three separate artifact classes manufactured false drift
  until each was disciplined

## The pushed-hash record (the closing discipline)

- Remediation commit **3db744f** pushed via the SSH wrapper with the
  EXPLICIT `--remote git@github.com:nordeim/saas-company.git` (the S31
  trap: the wrapper's DEFAULT remote is the runbook's example repo —
  the explicit flag held from the first dry-run).
- Wrapper-verified: remote main @ 3db744f == local HEAD; the
  fetch-independent HTTPS ls-remote agreed
  (3db744fafe5d22427bbc424f2deb373de49f53ac).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1–S36 record); both the wrapper's temp key copy and
  the operator's key file shredded after use.
- Zero zombies at close (all probe/battery/capture ports swept and
  cleared); the tree clean; no new branches.
