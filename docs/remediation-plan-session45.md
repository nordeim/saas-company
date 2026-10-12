# Remediation Plan — Session 45

The worklog S44 candidates (the reference-regression watch, the nineteenth
surface's ROUTE EXTENSIONS — the hash/query contracts on the content routes
and the input census on /login's alternates, or the twentieth surface — the
history/bfcache, media-query/pointer-coarse, or audio/video surfaces),
answered against the measured codebase. The baseline is the Session-44 tree
(gate 743 = 248 unit + 125 smoke + 370 e2e; the drift battery NINETEEN
surfaces, 44 checks across three phases, zero drift — `docs/session_93.md`).

## The recon (research/recon-s45.mjs)

All candidate surfaces measured BEFORE the contracts were designed:

- **R1 — the reference-regression watch (BOTH sides — the gotcha-53 law).**
  The live's 12 routes re-probed: the raw-HTTP layer serves 200 for
  everything (the SPA anything-answers family, unchanged); the RENDERED
  layer re-verified at exact word parity on the working eight
  (739/24/101/36/335/390/566/285 — every value byte-identical to the S44
  record); the soft-404 four unchanged (/pricing, /demo, /dashboard,
  /checkout on the live render the SPA 404; the clone's statuses the
  honest 404/404/307-gate/404 — the registered family). The live's
  sitemap unchanged (7 URLs); the clone's the 8-URL strict superset.
  **NO RECOVERY, NO NEW REGRESSION.** (The recon's first status sweep
  read empty — Playwright's `APIResponse.status` is a METHOD; a property
  read serializes to nothing — re-probed with raw fetch; a tooling-law
  candidate for the SKILL.)
- **R2a — the HISTORY/BFCACHE surface (the twentieth-surface candidate —
  THE HEADLINE).** The traversal class measured paired (the landing →
  scroll to `#pricing` → the footer `/faq` link → `goBack()`):
  - **The CLONE: same-document popstates.** The window mark SURVIVES the
    back traversal (`window.__bfMark` armed before, intact after), the
    navigation-type entry stays the ORIGINAL document's `navigate` (no
    new document), the page `load`-event counter stays 0, and the scroll
    position is RESTORED exactly (4620 → 4620 — the deep `#pricing`
    depth, through Lenis). Forward returns to `/faq` rendered (101
    words) the same way. `history.scrollRestoration` reads `auto`.
  - **The LIVE: cross-document full reloads.** The window mark is LOST
    (a new document), the navigation-type entry reads `back_forward`,
    the scroll position is DUMPED to 0 (the user's reading depth
    destroyed by every back), and `pageshow`'s `persisted` never fires
    (no bfcache restore — the full-load family's HTTP layer [D152]
    costs a network reload per traversal).
  - **REGISTERED as the platform superset** (the D125/gotcha-18 family:
    never simulate the reference's full loads; never fix toward the
    live's broken scroll-restoration state).
- **R2b — the POINTER/MEDIA surface (the twentieth-surface candidate).**
  The CSSOM scan: ZERO `@media` rules matching `pointer`/`hover`/
  `any-pointer` on EITHER side (the empty-set contract — the S42
  print-surface pattern); `-webkit-tap-highlight-color` reads
  `rgba(0, 0, 0, 0)` on links both sides; `touch-action` reads `auto`
  on body + links both sides; the `matchMedia` capability reads
  (coarse/fine/hover-none/hover-hover) are browser context, not app
  behavior — recorded, excluded from the contract (the
  startViewTransition precedent). **GREEN at parity (the empty-set).**
- **R2c — the AUDIO/VIDEO surface (the twentieth-surface candidate).**
  The hero video measured paired: BOTH sides 1920×1080, duration 8s,
  `autoplay` + `loop` + `playsInline` + NO `controls`, PLAYING
  (`currentTime` advancing across a 1.2s sample), the `muted` PROPERTY
  true + volume 1, zero `<source>` children (the direct `src`), zero
  `<audio>` elements anywhere (the empty-set). **ONE DELTA — the
  `muted` ATTRIBUTE**: the clone ships it in the SSR HTML
  (`<video muted …>`, `src/components/sections/hero.tsx`); the live
  does NOT (its React runtime sets the property at mount — the known
  React SSR quirk: `muted` does not serialize through `renderToString`;
  the attribute-less HTML relies on hydration timing for the
  muted-autoplay contract). The clone's attribute is the MORE ROBUST
  contract (the muted autoplay works from the first paint, no JS
  timing dependency) — **REGISTERED as the superset** (never remove it
  to chase attribute parity with the live's weaker contract).
- **R3 — the nineteenth surface's ROUTE EXTENSION (the /login alternates
  input census, paired — both sides ship the alternate states).** The
  census on every state: DEFAULT 6 interactives (4 pointer + 2 text),
  SIGN-UP 5 (2 pointer + 3 text), FORGOT 3 (2 pointer + 1 text) —
  **the counts structurally IDENTICAL across sides at every state**;
  the only delta the clone's autocomplete set (email +
  current-password on default; email + new-password ×2 on sign-up;
  email on forgot — the live ships NONE anywhere) — within the
  registered D148 entry's route scope (`/login`), the reason text now
  extended to name the forgot state explicitly.

## The adjudicated session scope

A MEASUREMENT + REGISTRATION + VERSIONING session (the S42 original
pattern — no re-scope needed: every measured delta is a clone-side
superset family or an exact parity; NO clone gap exists to build against).
The twentieth surface is **the traversal/history + media-capability +
audio/video surface family**; the nineteenth surface's route extension is
the /login alternates census; the route-watch continues. Four new ledger
records (D153–D156), one registry entry (the muted attribute — the fifth
DOM-attr entry), and the autocomplete reason's forgot-state extension.

- **D153 — the traversal contract**: the live's back/forward are
  cross-document full reloads (mark lost, `back_forward`, scroll dumped
  to 0, no bfcache `pageshow`) vs the clone's same-document popstates
  (mark survives, scroll restored, 0 loads) — the REGISTERED platform
  superset.
- **D154 — the muted-attribute record**: the clone's SSR `muted`
  attribute vs the live's property-only React quirk — REGISTERED (the
  autoplay-robustness superset).
- **D155 — the pointer/media empty-set**: zero pointer/hover media
  rules, transparent tap-highlight, auto touch-action — parity at the
  empty-set (neither side ships pointer-conditional styling).
- **D156 — the hero-video contract**: 1920×1080 / 8s / autoplay+loop+
  playsInline / playing / muted-prop / zero audio elements — parity at
  the playback layer, the attribute delta registered (D154).

## The ToDo list (TDD — the registry shape test RED first, then the pins)

- [x] F1 — `tests/e2e/session45-traversal-media-video.spec.ts` (the
      twentieth-surface pins, versioning the CLONE side):
      (a) the TRAVERSAL pins — back after a client-side route change is
      same-document (the load-event counter stays 0 + the window mark
      survives), the scroll position RESTORED at the deep anchor
      (before === after), the forward traversal returns `/faq` rendered,
      `history.scrollRestoration === "auto"`;
      (b) the MEDIA empty-set pins — zero pointer/hover/any-pointer
      `@media` rules in the CSSOM, `-webkit-tap-highlight-color`
      transparent on links, `touch-action` auto on body + links;
      (c) the VIDEO pins — the attribute census (autoplay, loop, muted,
      playsInline, NOT controls, NOT crossOrigin, aria-hidden), the
      playback contract (currentTime advancing, muted property true,
      volume 1, videoWidth/Height 1920/1080, duration 8, the
      self-hosted `/media/hero-ai-loop.mp4` src, zero `<source>`
      children), the LOOP behavior (seek to duration−0.3 → wraps below
      1s), zero `<audio>` elements;
      (d) the /login ALTERNATES census pins — default 6 (4 pointer +
      2 text, autocomplete email + current-password), sign-up 5 (2 + 3,
      email + new-password ×2), forgot 3 (2 + 1, email)
- [x] F2 — the REGISTRY extension (TDD — the shape test RED first):
      the fifth DOM-attr entry (`muted`, clone, ["/"], the React-SSR
      quirk reason, session 45) + the autocomplete reason extended to
      name the forgot state + the `head-superset.test.ts` shape pins
      updated (four → five entries, the session set [33, 43] →
      [33, 43, 45])
- [x] F3 — `research/drift-battery-s45.mjs`: the twentieth-surface
      phase (paired: the traversal class both sides [the clone
      same-document + restored / the live full-load + dumped — the
      registered records], the media empty-set both sides, the video
      census both sides, the login-alternates census both sides) + the
      standing route-watch (both sides, the raw-fetch status read) —
      GREEN, ZERO DRIFT expected
- [x] F4 — the full gate re-run on the clean build — **743 + N checks
      ALL GREEN** (248 + [S-unit if the registry test grows] unit +
      125 smoke + [370 + N] e2e; lint/typecheck/build clean, the
      instrumentation.ts warning the known standing one)
- [x] F5 — the screenshot refresh (the standing 21; DB canonical before
      AND after; the REGEX route-abort discipline) + the VLM standing
      checks — PASS expected
- [x] F6 — the docs alignment: PAD (the revision block, the ledger
      D153–D156, section 7 counts, §7.2, §11), AGENTS (the counts +
      the invariants' Session-45 extension + the measurement laws [the
      APIResponse.status method trap; the React muted-attribute SSR
      quirk]), CLAUDE (the session-45 context), README (the badge +
      the traversal-superset story + the rows), SKILL v2.44.0 (lesson
      84: the traversal-class instrument + the React muted-attribute
      quirk + the status-method trap), .env.example verified in sync,
      the remediation plan session45 (this file, ticked), the session
      logs (session_95 curated + session_96 raw), the worklog
- [x] F7 — the commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding)

## The measured record (the session's adjudications, beyond the plan)

- **THE HEADLESS-SEEK-STALL LAW (the plan's loop-pin re-scope).** The
  spec's first loop-wrap pin (seek to duration−0.3 → wrap under 1s)
  FAILED — and the directed probe found why: a programmatic
  `currentTime` seek on an autoplaying muted `<video>` in headless
  Chromium NEVER resolves (`seeking: true, paused: true` forever at
  the seek target — probed 3s × 20 samples on the CLONE and
  IDENTICALLY on the LIVE: both stall at 7.7). The loop SEAM is
  unmeasurable headlessly — an infrastructure limitation, not an app
  delta. The honest proxy: pin the `loop` ATTRIBUTE + the advancing
  clock + the 8s window (the wrap's measurable half); documented in
  the spec's comment, gotcha 55(a), and SKILL lesson 84.
- **Two spec in-flight catches.** (a) The census helper referenced
  `page` at MODULE scope (`ReferenceError: page is not defined`) —
  the helper takes the page as a parameter (the S43 pattern).
  (b) The TS-strict window-mark casts (`__s45mark`/`__s45loads`
  through `Record<string, unknown>` — the S44 cast lesson applied).
- **The recon's status-sweep trap.** The recon's first route-status
  sweep read `{}` — Playwright's `APIResponse.status` is a METHOD;
  the property read yields the function itself, which JSON.stringify
  silently DROPS. Re-probed with raw fetch (the correct statuses:
  the clone's honest 404/307 family + the live's SPA anything-
  answers 200s — the registered records unchanged). Gotcha 55(c) /
  lesson 84.
- **The traversal measurements (the battery's phase 1, both sides'
  truth).** The clone: mark survives, 0 loads, scroll restored
  EXACTLY (4620 → 4620), forward renders /faq at 101 words,
  scrollRestoration auto. The live: mark lost, `back_forward`,
  scroll dumped to 0, no bfcache pageshow — the D153 record.
- **The gate: 743 → 756** (248 unit + 125 smoke + 383 e2e — the
  session45 suite +13: the 4 traversal + 2 media + 4 video + 3
  login-alternates census pins). The battery 33/33 GREEN ZERO DRIFT
  across four phases (traversal 7 + media 2 + video 5 + alternates 4
  + route-watch 15) — on its FIRST run (no in-flight fixes needed).
  21 screenshots (DB canonical before AND after — 1/6/7,120/5/1,
  zero mutations); VLM 8/8 ZERO flags.
- **The registry grew to FIVE DOM-attr entries** (the muted attribute
  — the React SSR quirk record) with the autocomplete reason extended
  to name the forgot state; the unit shape pins updated (24 tests in
  the head-superset file, 248 total unchanged — the shape tests were
  modified, not added).
- **The route statuses re-verified at the raw-HTTP layer**: the
  clone's /pricing 404, /demo 200 (superset), /dashboard 307 (the
  session gate), /checkout 404; the live 200-everything (the SPA
  anything-answers family) — NO RECOVERY, NO NEW REGRESSION (the
  rendered word parity byte-identical on the working eight;
  sitemaps at the registered sets: the live 7, the clone 8).
