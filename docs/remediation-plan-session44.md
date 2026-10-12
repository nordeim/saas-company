# Remediation Plan — Session 44

The worklog S43 candidates (the reference-regression watch, the eighteenth
surface's ROUTE EXTENSION — the /demo input-surface census, or the nineteenth
surface — the view-transition, selection/clipboard, or dynamic-route
URL-state contracts), answered against the measured codebase. The baseline
is the Session-43 tree (gate 725 = 248 unit + 125 smoke + 352 e2e; the drift
battery EIGHTEEN surfaces, 41 checks across four phases, zero drift —
`docs/session_90.md`).

## The re-scoping recon (research/recon-s44.mjs + adj-s44.mjs + adj2-s44.mjs)

All candidate surfaces measured BEFORE the contracts were designed:

- **R1 — the reference-regression watch (BOTH sides — the gotcha-53 law).**
  The live's 12 routes re-probed in full: the soft-404 set is UNCHANGED at
  four routes — `/pricing`, `/demo`, `/dashboard`, `/checkout` — and the
  working eight re-verified at exact word parity (739/24/101/36/335/390/
  566/285, every value byte-identical to the S43 record). The live's
  sitemap unchanged (7 URLs). The CLONE side asserted too: the eight
  working routes at parity counts, `/thank-you` 36, `/demo` 83 (the
  working superset), the 8-URL strict-superset sitemap. **NO RECOVERY, NO
  NEW REGRESSION.**
- **R2a — the SELECTION surface (the nineteenth-surface candidate, measured
  paired on / + /login + /faq).** The `::selection` rule scan: ZERO rules
  on both sides on every route (the known gotcha-23 record, now formally
  measured at the CSSOM layer) + ZERO in document-level `<style>` text.
  The `user-select` computed census on every text-bearing element: **all
  `auto` on both sides** (no `user-select: none` anywhere — neither side
  disables selection on any element); the element-COUNT deltas (347/355 on
  /, 32/31 on /login, 77/91 on /faq) are the registered DOM-structure
  families (the live's dormant toaster shells, the clone's route
  announcer, the Radix carrier wrappers). **GREEN at parity (the empty-set
  + all-auto contract).**
- **R2b — the VIEW-TRANSITION surface (the nineteenth-surface candidate).**
  `document.startViewTransition` reads `true` on BOTH sides — but that is
  the browser's own API availability (Chrome 111+), not app behavior. The
  app-behavior layers read the EMPTY-SET both sides: ZERO `@view-transition`
  rules in any stylesheet, ZERO `view-transition-name` declarations in any
  rule, on / + /login + /faq. **The empty-set contract at parity (the
  S42 print-surface pattern).**
- **R2c — the URL-STATE surface (the nineteenth-surface candidate — the
  headline).** Four layers measured paired:
  - **The hash CLICK** (the hero CTA `#pricing`, the SCROLL-SETTLE law
    applied — poll scrollY to a stable pair): **EXACT PARITY** — both
    sides settle at the same scrollY (4620 @1280×720) with the target's
    top at 0 and `#pricing` in the URL.
  - **The fresh-load hash** (`/#pricing` direct): **THE REGISTERED
    SUPERSET** — the live NEVER scrolls (scrollY stays 0 forever: its SPA
    shell lacks the `#pricing` element at parse time — the anchor appears
    in the DOM at t≈516–810ms, after the browser's native hash-jump
    attempt has already failed; nothing re-triggers the scroll after
    mount), while the clone's SSR HTML carries the anchor from t≈69ms and
    the native jump settles at the target by t≈325–470ms. The same for
    `/#features`. The gotcha-18 burger law: the clone KEEPS the working
    behavior (deep links to page sections work — shareable `#pricing`
    URLs land at the section); never "fix" it toward the live's broken
    state.
  - **The query-param tolerance**: `/?utm_source=test`, `/faq?utm_medium=x`,
    `/thank-you?ref=42` — every page renders at its normal word count and
    the canonical + og:url stay CLEAN of the query on BOTH sides. **GREEN
    at parity.**
  - **The trailing-slash + case records**: `/faq/` — the live serves 200
    with canonical → `/faq` (the SPA anything-answers family: duplicate
    URL served, self-corrected only by the canonical tag); the clone
    answers **308 → `/faq`** (single canonical URL at the status-code
    layer — the SEO-stronger contract, the same honest-status family as
    the D68 real-404 record). `/FAQ` — the live 200 + rendered SPA-404;
    the clone the honest 404. **REGISTERED (no fix — the clone's records
    are the superset family).**
- **R2b-follow-up (adj2-s44) — the ROUTE-CHANGE class.** The decisive
  instrument (the page `load`-event counter — fires ONLY on full document
  loads — plus the window-mark survival test): the LIVE does FULL PAGE
  LOADS on its route links (the footer `/faq` link: 1 full load, window
  mark gone; the navbar Log In button: 1 full load) while its logo click
  is same-document (its own inconsistency); the CLONE does CLIENT-SIDE
  transitions everywhere (0 full loads on all three probes, the window
  mark survives — the Next App Router `<Link>`/`router.push` behavior).
  The rendered results are identical on every probe (words 101/24/739).
  **REGISTERED as the platform superset (the D125 law: never simulate the
  reference's full loads — the clone's client-side nav is faster and
  state-preserving).** (The first A3 probe's `sameDoc` reading was
  INVERTED by a destructuring bug — `{markBefore}` destructured from
  `{mark, entries}` reads undefined on both sides, so the full-load side
  read `true` and the client-nav side read `false`; the load-counter
  instrument is the decisive one. A measurement-law lesson for the SKILL.)
- **R3 — the input-surface ROUTE EXTENSION (the eighteenth surface's route
  growth, /demo).** The clone's `/demo` census (the live soft-404s it —
  the registered D73 superset route, no pairing possible): **22 pointer +
  5 text + 0 other** across 27 rendered interactives; the autocomplete set
  `name=name, email=email, company=organization` (the S14 functional
  superset family) with the message textarea + the footer newsletter
  input attribute-less (the registered parity contract); the caret
  uniform `rgb(255, 255, 255)`. **GREEN — the clone-side pins version the
  contract.**

## The adjudicated session scope

A MEASUREMENT + REGISTRATION session **re-scoped by the adjudication into
a BUILD session (the S43 pattern)**: the nineteenth surface is **the
URL-state + navigation-class + selection/view-transition surface family**,
versioned in a new e2e spec + a new battery phase; the /demo input census
extends the eighteenth surface's route coverage; the route-watch
continues. Four new ledger records + **THE BUILD (D149): the
case-canonicalization middleware**.

- **THE BUILD (D149).** The adj3-s44 P2 probe DISPROVED the recon's
  unprobed assumption (the live's /FAQ renders "Page Not Found") — the
  live serves **the FAQ page itself** at /FAQ (101 words, title "FAQ |
  SAAS Company"), and the full sweep confirms its SPA router matches
  case-INSENSITIVELY for every working content route: /Faq, /FaQ,
  /THANK-YOU, /Privacy, /TERMS, /Accessibility, /Refund-Policy all serve
  their pages (only /LOGIN — the live's separate Base44 auth page —
  stays case-sensitive, and the soft-404 routes stay 404 at any case).
  The clone 404s every case variant — the S43 /thank-you family AGAIN:
  the clone 404s what the live serves working. **BUILD
  `src/middleware.ts`**: the case-canonicalizing 308 (any case variant
  of a known page route redirects to the lowercase canonical, query
  preserved, one redirect even for the case+slash combo) — the
  honest-status family (the trailing-slash 308 precedent): the live
  serves duplicate 200s at every casing, the clone canonicalizes to the
  single URL. The clone's /LOGIN, /DEMO, /DASHBOARD variants redirect
  too (the live fails all three — the superset).
- **The fresh-load hash record (D150)**: the live NEVER scrolls on true
  fresh loads (adj3 P1 x2: y=0, target 4620px below — the SPA shell
  lacks the anchor at parse; only same-document hash CHANGES scroll,
  P3) while the clone's SSR anchor scrolls (the registered superset —
  deep links work).
- **The trailing-slash record (D151)**: live 200-at-both (canonical
  self-correcting) vs clone 308 — registered (the same contract the
  middleware now extends to case variants).
- **The route-change platform record (D152)**: the live FULL-LOADS its
  route links (footer /faq, Log In) while the clone does client-side
  transitions everywhere — the platform superset (the live's own logo
  click is same-document, its own inconsistency, recorded).

## The ToDo list (TDD — the build RED first, then the parity pins)

- [x] F1 — `src/middleware.ts`: the case-canonicalizing 308 — the known
      page-route set (/, /login, /demo, /faq, /thank-you, /privacy,
      /terms, /accessibility, /refund-policy, /dashboard), the lowercase
      + single-trailing-slash normalization, the query preservation, the
      /api + /_next matcher exclusions, the pass-through for unknown
      routes (the honest 404) and static assets
- [x] F2 — `tests/e2e/session44-urlstate-selection-surface.spec.ts`
      (TDD — RED on the missing middleware first, then GREEN):
      (a) the case-canonicalization pins — /FAQ -> 308 + location /faq;
      the full sweep (/Faq, /FaQ, /THANK-YOU, /Privacy, /TERMS,
      /Accessibility, /Refund-Policy, /LOGIN, /DEMO, /DASHBOARD — the
      last three the clone's supersets over the live's failures);
      /FAQ/ (case + slash) -> ONE 308 to /faq; the query preservation
      (/FAQ?utm_source=test -> /faq?utm_source=test); the honest-404
      preservation (/PRICING, /NOT-A-ROUTE -> 404, never redirected);
      the static pass-through (/OG-IMAGE.PNG -> 404, not 308);
      (b) the hash-CLICK pins — the hero CTA `#pricing` + the nav
      `#features` settle with the target at the viewport top;
      (c) the fresh-load hash pins — /#pricing + /#features direct:
      the SSR anchor present early, the scroll settles at the target
      (the registered superset versioned clone-side);
      (d) the query-canonical pins — the utm/ref tolerance with clean
      canonical + og:url;
      (e) the trailing-slash pin — /faq/ 308 -> /faq; / stays 200;
      (f) the selection pins — the ::selection empty-set + the
      user-select all-auto census (the versioned counts);
      (g) the view-transition pins — the empty-set;
      (h) the route-change pins — footer /faq link, logo click, Log In
      button: 0 full loads, the window mark survives;
      (i) the /demo INPUT-CENSUS pins — 22 pointer + 5 text + 0 other;
      the autocomplete trio; the caret white
- [x] F3 — `research/drift-battery-s44.mjs`: the nineteenth-surface
      phase (paired: the hash-click parity, the fresh-load hash — live
      stays 0 [from about:blank, the TRUE fresh load — the battery's
      first run read the same-document hash-change artifact, fixed] /
      clone scrolls, the query-canonical parity, the trailing-slash +
      case records — the live's duplicate-200 family vs the clone's
      308 canonicalization, the selection + view-transition empty-sets,
      the route-change class) + the /demo census phase (clone-side) +
      the standing route-watch (both sides) — GREEN, ZERO DRIFT expected
- [x] F4 — the full gate re-run on the clean build — **725 + N checks
      ALL GREEN** (248 unit + 125 smoke + [352 + N] e2e;
      lint/typecheck/build clean, the instrumentation.ts warning the
      known standing one — VERIFY the middleware + instrumentation
      static-import coexistence on the real build)
- [x] F5 — the screenshot refresh (the standing 21; DB canonical before
      AND after; the REGEX route-abort discipline) + the VLM standing
      checks — PASS expected
- [x] F6 — the docs alignment: PAD (the revision block, the ledger
      D149-D152, section 7 counts, section 7.2, section 11, the
      middleware in the architecture), AGENTS (the counts + the
      nineteenth surface + the middleware gotchas), CLAUDE (the
      session-44 context + THE STALE STACK-TABLE COUNTS FIXED — line 36
      still reads "247 unit + 302 browser checks" and line 151
      "302/302 PASS", three sessions stale), README (the badge + the
      rows), SKILL v2.43.0 (lesson 83: the inverted-probe law + the
      unprobed-assumption law + the negative-zero law), .env.example
      verified in sync, the remediation plan session44 (this file,
      ticked), the session logs (curated + raw), the worklog
- [x] F7 — the commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding)


## The measured record (the session's adjudications, beyond the plan)

- **THE /FAQ DISCOVERY (the re-scope).** The battery's first run read
  two live-side REDs against the plan's assumptions — both adjudicated
  by directed probes (research/adj3-s44.mjs): (1) the fresh-load hash
  reading y=4620 on the live was a MEASUREMENT artifact — the battery's
  `goto` from /#testimonials was a SAME-DOCUMENT hash-change the SPA's
  handler scrolls (P3); a TRUE fresh load (from about:blank, P1 ×2)
  reads y=0 forever — the A1 reading stands. (2) The live's /FAQ
  renders THE FAQ PAGE (101 words, the FAQ title) — its SPA router is
  case-insensitive for every working content route; the plan's
  "rendered SPA-404" assumption was unprobed. The battery's /FAQ check
  FLIPPED to the redirect contract and the session re-scoped from
  measurement-only to a BUILD (the D149 proxy).
- **The Next 16 proxy convention.** `middleware.ts` is DEPRECATED in
  Next 16 (renamed `proxy.ts`, `export function proxy` — the same API
  + matcher config); the first build warned and the file was renamed
  before commit. The instrumentation hook's static node:fs import
  coexists with the proxy (the register()'s NEXT_RUNTIME === "edge"
  early-return holds; the boot verified on the standalone server).
- **The redirect-chain discovery.** Next's own trailing-slash 308
  PRECEDES the proxy in the request chain: /FAQ/ -> /FAQ (the
  framework's slash strip, case preserved) -> /faq (the proxy's case
  canonicalization) — TWO permanent hops, not one; the spec pins the
  chain honestly instead of fighting the framework.
- **The spec's in-flight measurement-law catches.** (a) The
  NEGATIVE-ZERO law — `Math.round` on a sub-pixel-negative rect top
  (the Lenis settle) returns `-0` and `Object.is(-0, 0)` is false;
  normalized with `Math.abs(Math.round(...))`. (b) The
  SETTLE-every-read law — the nav #features click read mid-animation
  without the scroll-settle poll. (c) The TS-strict casts for the
  spec's evaluate payloads (`window.__navMark`, `el.name`,
  `link.href`, `meta.content`).
- **The gate: 725 -> 743** (248 unit + 125 smoke + 370 e2e — the
  session44 suite +18: the 7 trailing-slash + case-canonicalization
  pins [incl. the sweep, the chain, the query preservation, the
  honest-404/static pass-throughs] + 2 hash-click + 2 fresh-load hash
  + 1 query-canonical + 2 selection + 1 view-transition + 2
  route-change + 1 /demo census). The battery 44/44
  GREEN ZERO DRIFT (urlstate 26 + demo-input 3 + route-watch 15).
  21 screenshots (DB canonical before AND after); VLM 8/8 ZERO flags.

## The pushed-hash record (the closing discipline)

- (to be recorded at the push)
