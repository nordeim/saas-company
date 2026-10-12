# Remediation Plan — Session 46

The worklog S45 candidates (the reference-regression watch, the twentieth
surface's ROUTE EXTENSIONS — the traversal contract on /thank-you + the
legal routes — or the twenty-first surface: the clipboard/keyboard-shortcut,
drag-and-drop, or network-failure/offline surfaces), answered against the
measured codebase. The baseline is the Session-45 tree (gate 756 = 248 unit
+ 125 smoke + 383 e2e; the drift battery TWENTY surfaces, 33 checks across
four phases, zero drift — `docs/session_96.md`).

## The recon (research/recon-s46.mjs) + the adjudication probes

All candidate surfaces measured BEFORE the contracts were designed:

- **R1 — the reference-regression watch (BOTH sides — the gotcha-53 law).**
  The working eight re-probed at exact word parity (739/24/101/36/335/
  390/566/285 — every value byte-identical to the S44/S45 record); the
  statuses at the registered family (the clone's honest /pricing 404,
  /demo 200, /dashboard 307-gate, /checkout 404, /FAQ 308; the live's
  SPA anything-answers 200s); the sitemaps at the registered sets (the
  live 7, the clone 8 — the strict superset). **NO RECOVERY, NO NEW
  REGRESSION.** The live's /dashboard re-verified through the reference
  LOGIN (adj A2): the sign-in lands at `/`, and /dashboard renders the
  SPA 404 (16 words, h1 "404") — the registered soft-404 record holds;
  the clone's working dashboard remains the superset.
- **R2a — the CLIPBOARD/KEYBOARD-SHORTCUT surface (the twenty-first-
  surface candidate).** The interference census: `document.oncopy`/
  `oncut`/`onpaste` NULL on both sides; the body `user-select` auto both
  sides; zero `::selection` rules both sides (the S44 record re-verified);
  zero app-level hotkeys on either side (the keydown listener deltas are
  framework internals — React/Lenis vs React/Base44 runtime — the D125
  law: never simulate a library's internals). ONE CSSOM delta: the live's
  compiled css carries `.select-none { user-select: none; }` — probed
  (adj A1): ZERO carriers on /, /faq, /login — the rule is INERT
  reference CSS residue (the gotcha-6 family: match the RENDERED computed
  style, not the rule string); the clone ships no such rule and also has
  zero carriers — **RENDERED PARITY at the empty-set.**
- **R2b — the DRAG-AND-DROP surface (the twenty-first-surface candidate —
  the testimonial strip).** Structural: EXACT parity — `cursor: grab`,
  `overflow-x: auto`, `scroll-snap-type: none`, `touch-action: auto`, no
  `draggable` attribute, scrollWidth 3208 / clientWidth 1440, 8 cards,
  the identical strip signature (`div.flex.gap-6.overflow-x-auto`).
  Behavioral: a real mouse drag does NOT pan the strip on EITHER side
  (scrollLeft unchanged through a 360px drag), the native wheel does not
  horizontal-scroll on either side, and ZERO drag-family listeners are
  scoped to the strip subtree on either side (the census's second
  witness) — the strip scrolls only through native touch/trackpad/
  scrollbar on both sides, and the grab cursor is cosmetic on both.
  **GREEN at parity (the native-overflow scroll contract + the no-JS-drag
  empty-set).**
- **R2c — the NETWORK-FAILURE/OFFLINE surface (the twenty-first-surface
  candidate).** With every non-document request blocked: the CLONE
  renders the FULL SSR landing (718 words, 8 body children, the h1 + the
  hero video element present — the complete page copy); the LIVE renders
  its 136-word SPA shell (1 body child, no video — adj A4: the h1 "SAAS
  Company" + a page-list fallback). **REGISTERED as the platform superset
  (the D125 family: the SSR-first architecture; never fix toward the
  live's empty shell).**
- **R3 — the MOBILE NAVIGATION comparison (the operator's explicit
  focus).** The live's menu, opened programmatically (adj5 P3): the panel
  is byte-identical to the clone's measured contract — `md:hidden
  bg-black/95 backdrop-blur-xl border-b border-white/5`, 7 rows (Features,
  How It Works, Pricing, Testimonials, FAQ, Log In, Get Started), all
  44px. **THE HEADLINE (adj5 + adj6): the live's BURGER is two-thirds
  UNCLICKABLE at 390** — TWO dormant react-hot-toast containers (`fixed
  top-0 z-[100]`, `pointer-events: auto`, a 32px band at y0-32) sit over
  the burger icon (y16-40): real pointer clicks at the icon's upper
  (y20) and center (y28) points hit the TOASTER and the menu never
  opens; only the bottom sliver (y36, below the 32px band) works. The
  CLONE's burger opens at EVERY point of the icon (y20/y28/y36 all
  measured GREEN) — plus the registered S41 a11y supersets (aria-expanded
  + aria-controls + aria-label, Escape-close, focus-return, scroll-lock)
  the live's bare button carries none of. At 1440 the live's toasters
  move to the bottom-right (the `sm:` classes) and the burger is
  `md:hidden` — no desktop interference, recorded for completeness.

## The adjudicated session scope

A MEASUREMENT + REGISTRATION + VERSIONING session (the S42/S45 original
pattern — no re-scope needed: every measured delta is a clone-side
superset family or an exact parity; NO clone gap exists to build against).
The twenty-first surface is **the clipboard/keyboard + drag-and-drop +
offline render family**; the mobile-nav clickability record extends the
S41 focus surface; the route-watch continues. Four new ledger records
(D157–D160), no registry growth (none of the new records is a head tag or
a DOM attribute — they are behavioral/architectural contracts that live in
the PAD's deviations ledger).

- **D157 — the clipboard/keyboard empty-set**: no clipboard interference,
  no app hotkeys, user-select auto, zero ::selection rules on either
  side; the live's `.select-none` rule inert (zero carriers) — rendered
  parity.
- **D158 — the drag-and-drop native-overflow contract**: the testimonial
  strip structurally identical (grab cursor, auto overflow, 8 cards) and
  behaviorally identical (no JS drag-pan, no wheel-pan — native scroll
  only) on both sides.
- **D159 — the offline render platform superset**: the clone's full SSR
  landing (718 words) vs the live's 136-word SPA shell under total
  network failure.
- **D160 — the burger clickability record**: the live's icon two-thirds
  blocked by its own dormant toast containers (only y36 of y16-40
  responds); the clone fully clickable at every point — the registered
  superset over the reference's degraded affordance.

## The ToDo list (TDD — the spec pins the CLONE side; the battery asserts
both sides' truth)

- [x] F1 — `tests/e2e/session46-clipboard-drag-offline.spec.ts` (the
      twenty-first-surface pins, versioning the CLONE side):
      (a) the CLIPBOARD/KEYBOARD empty-set pins — `document.oncopy`/
      `oncut`/`onpaste` null, body user-select auto, ZERO `::selection`
      rules in the CSSOM, ZERO `.select-none` carriers (the inert-rule
      guard: if a future class ever lands on an element, this pin flips);
      (b) the DRAG pins — the strip's structural contract (cursor grab,
      overflow-x auto, snap none, 8 cards, the no-`draggable` attribute)
      + the behavioral empty-set (a real 360px mouse drag leaves
      scrollLeft unchanged, the native wheel leaves it unchanged);
      (c) the OFFLINE pin — with every non-document request aborted, the
      landing renders the full SSR copy (the word floor ≥ 700, the h1,
      the hero video element);
      (d) the BURGER clickability pins — the icon's top/center/bottom
      points ALL open the menu (the 7-row/44px panel contract re-pinned
      alongside), the full-clickability superset D160's clone half;
      (e) the MENU STRUCTURE pin — the panel classes + the 7 rows + the
      44px heights + the close-on-navigate.
- [x] F2 — `research/drift-battery-s46.mjs`: the twenty-first-surface
      phase (paired: the clipboard empty-set both sides, the drag
      contract both sides, the offline word counts both sides at the
      registered records, the burger clickability map both sides [the
      clone 3/3 open / the live 1/3 — the registered degradation], the
      menu structure parity) + the standing route-watch (both sides, the
      raw-fetch status read) — GREEN, ZERO DRIFT expected
- [x] F3 — the full gate re-run on the clean build — **756 + N checks
      ALL GREEN** (248 unit + 125 smoke + [383 + N] e2e; lint/typecheck/
      build clean, the instrumentation.ts warning the known standing one)
- [x] F4 — the screenshot refresh (the standing 21; DB canonical before
      AND after; the REGEX route-abort discipline) + the VLM standing
      checks — PASS expected
- [x] F5 — the docs alignment: PAD (the revision block, the ledger
      D157–D160, section 7 counts, §7.2, the gate line), AGENTS (the
      counts + gotcha 56 — the dormant-overlay affordance law: a
      pointer-events:auto container over an interactive control is a
      REAL broken affordance even when visually invisible + the
      inert-rule re-verification), CLAUDE (the session-46 context),
      README (the badge + the clickability story + the rows), SKILL
      v2.45.0 (lesson 85: the hit-target map instrument —
      elementFromPoint + the multi-point click census; the offline-render
      word-floor proxy), .env.example verified in sync, the remediation
      plan session46 (this file, ticked), the session logs (session_97
      curated is the S45 close — write session_98 curated + session_99
      raw per the house numbering), the worklog
- [x] F6 — the commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding)

## The measured record (the session's adjudications, beyond the plan)

- **THE BURGER CLICKABILITY MAP (the session's headline instrument).**
  The live at 390: y=20 (upper icon) BLOCKED, y=28 (center) BLOCKED,
  y=36 (bottom sliver) OPENS, y=44 (outside the icon) correctly nothing.
  The clone at 390: y=20/y=28/y=36 ALL OPEN. The blocker: TWO
  react-hot-toast containers (`fixed top-0 z-[100] flex max-h-screen
  w-full flex-col-reverse p-4 …`, `pointer-events: auto`, 32px tall,
  0-1 children — dormant) overlapping the nav's z-50 band. The live's
  menu ITSELF is intact (the JS-dispatched click opens the identical
  7×44px panel) — the affordance, not the component, is degraded.
- **The offline word floor.** The clone renders 718 words under total
  request block (the recon's exact count; the spec pins ≥ 700 to absorb
  harmless copy drift); the live's shell measures 136 (recorded, not
  pinned against the live — the moving-target law).
- **The drag empty-set's two witnesses.** The behavioral witness (the
  real mouse drag + the native wheel leave scrollLeft at 0 on both
  sides) and the listener witness (zero drag-family listeners scoped to
  the strip subtree on either side — the document-level listeners are
  framework internals, D125).
- **The live's /dashboard through the reference login (adj A2).** The
  sign-in succeeds (lands at `/`); /dashboard renders the SPA 404 — the
  registered soft-404 four record CONFIRMED through the authenticated
  path (the first session to re-probe it post-login).
- **The inert `.select-none` rule.** The live's compiled css carries the
  Tailwind utility definition with ZERO carriers on any probed route —
  the gotcha-6 inert-class family extended to the rule layer. The clone
  ships no such rule; no action (never ship inert css to chase rule-set
  parity).

## The measured record (the session's adjudications, beyond the plan)

- **THE ZOMBIE-PORT INCIDENT (gotcha 56b / lesson 85 — the session's
  operational discovery).** The first capture run's shot 14 failed with
  an ERR_TOO_MANY_REDIRECTS loop between /dashboard and /login — a
  session cookie that passed /api/auth/me's parse while the page's
  sessionUserId() read null, an impossible-on-one-server divergence.
  The diagnosis trail: the cookie wire-read (SESSION-PRESENT on every
  loop request) -> the curl probe (login OK, /api/auth/me OK, GET
  /dashboard 307 with the SAME cookie) -> the server log's EADDRINUSE
  line. THE TRUTH: the recon's server had been `kill $SERVER_PID`'d,
  but the standalone server RENAMES itself `next-server (v16.4.0)` and
  the renamed child SURVIVED, holding :3300 with the recon's
  AUTH_SECRET + db while every later "fresh" boot silently EADDRINUSE'd
  and kept talking to the stale process (rebuilt mid-run — the module
  graph diverged from disk). Every runner script now sweeps the port
  by PID before AND after each boot (the gotcha-46 law applied to the
  house's own survey scripts).
- **The shot-14/15 capture rework.** The first capture attempt showed
  the HEALTHY dashboard for both degraded-state shots: the SSR initial
  data means the banner needs a FAILED ACTION (the resilience spec's
  pattern — abort the PATCH, click Pause), and the error boundary
  needs the contract-violating ROW (the error-boundary spec's pattern
  — route-fulfill /api/workflows with runs:null + a click to trigger
  the refresh). Riding along: the PATCH to /api/workflows/<id> had to
  be route-fulfilled too — a real PATCH paused a seeded workflow in
  the canonical db (the glob **/api/workflows does not match the id
  path; the first run ended 5 active/1 paused -> 4/2 — the DB restored
  via db:push + db:seed and the fix applied; the final run zero
  mutations).
- **The battery's two in-flight adjudications.** (a) The menu-panel
  class read sorted to the INNER px-6 wrapper (no bg classes) — the
  class check now reads every matching panel's classes joined. (b) The
  sitemap origin strip replaced the SERVER base (:3300) while the
  clone emits NEXT_PUBLIC_SITE_URL's default localhost:3000 — the
  strip now removes any origin. Both measurement-layer fixes, zero
  app drift.
- **The gate: 756 -> 764** (248 unit + 125 smoke + 391 e2e — the
  session46 suite +8: 2 clipboard + 2 drag + 1 offline + 3
  burger/menu pins). The battery 28/28 GREEN ZERO DRIFT across two
  phases (the 21st-surface family 25 + the route-watch 3).
- **The live's /dashboard through the reference login (adj A2).** The
  sign-in succeeds and lands at `/`; /dashboard renders the SPA 404
  (h1 "404", 16 words) — the registered soft-404 record holds, the
  first session to re-probe it through the authenticated path.
- **The vlm-checks CLI quirk.** The z-ai vision CLI's stdout mixes
  the SDK banner with the JSON — the -o flag + a JSON parse is the
  reliable read (the raw grep PASS check swallowed the response for
  two shots; the -o re-run read them correctly).

## The pushed-hash record (the closing discipline)

- Remediation commit **653b497** pushed via the SSH wrapper with the
  EXPLICIT `--remote git@github.com:nordeim/saas-company.git` (the S31
  trap: the wrapper's DEFAULT remote is the runbook's example repo —
  the explicit flag held from the first dry-run).
- Wrapper-verified: remote main @ 653b497 == local HEAD; the
  fetch-independent HTTPS ls-remote agreed
  (653b497c20150d4e0cc9f803e7fd91b53538eff9).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1-S45 record); the operator's key file shredded after
  use (the wrapper's own temp copy shredded at its teardown).
- Zero zombies at close (the port-sweep discipline held through every
  recon/adj/battery/capture/debug run; the ports swept clean at the
  end); the tree clean; no new branches.
