# Remediation Plan — Session 43

The worklog S42 candidates (the reference-regression watch, the focus-order
surface's ROUTE EXTENSION — the legal routes' long-content walks, and the
cursor/caret or form-autofill surfaces as the eighteenth), answered against
the measured codebase — PLUS the route extension's discovery: the
/thank-you working-parity gap. The baseline is the Session-42 tree (gate
714 = 247 unit + 124 smoke + 343 e2e; the drift battery 17 surfaces, 67
checks across three phases, zero drift — `docs/session_86.md`).

## The re-scoping recon (research/recon-s43.mjs + adj-s43.mjs + adj2-s43.mjs)

All candidate surfaces measured BEFORE the contracts were designed:

- **R1 — the reference-regression watch.** The live's 12 routes re-probed
  in full: the soft-404 set is UNCHANGED at four routes — `/pricing`,
  `/demo`, `/dashboard`, `/checkout` — and the working eight re-verified
  at exact word parity (739/24/101/36/335/390/566/285, every value
  byte-identical to the S42 record). The live's sitemap unchanged (7
  URLs incl. `/thank-you`, no `/login`, no `/pricing`). **NO RECOVERY,
  NO NEW REGRESSION: D146 stands.**
- **R2 — the focus-order route extension (the sixteenth surface's route
  growth).** The four legal routes at 1440 (22 stops both sides) +
  `/privacy` at 390 (16 stops both sides) — every walk structurally
  IDENTICAL across sides, ending on `<body>` both sides (the full-walk
  law held; the walker keyed on `activeElement`, never on the key
  string). The ONLY deltas the registered records: the logo's a11y name
  ("NovaAI home" vs the live's unnamed anchor) and the newsletter
  pair's names ("Email address"/"Subscribe" vs the live's
  placeholder/type-keyed stops) — the S41 a11y-name supersets. **GREEN
  at parity.** But `/thank-you`'s paired walk exposed a structural
  delta — the clone's stop 1 a `button||Go Home` (the 404 page's CTA)
  vs the live's `a|/|Back to Home` — which the adj-s43 probes
  escalated into the headline finding below.
- **THE HEADLINE — the /thank-you working-parity gap (adj-s43 A1/A2/A3
  + adj2-s43).** The live serves a REAL page at `/thank-you` (36
  words): a payment-success interstitial — `h1` "Payment Successful!"
  (`font-heading text-4xl md:text-5xl font-bold text-white mb-4`,
  48px/700 centered), `p1` "Thank you for upgrading to NovaAI. Your
  plan is now active and you can start automating right away."
  (`text-white/50 font-body mb-8 text-lg`), `p2` "A confirmation email
  has been sent to your inbox with all the details."
  (`text-white/40 font-body mb-8 text-sm`), the lucide
  `circle-check-big w-16 h-16 text-green-500` icon row (`mb-6 flex
  justify-center`, rgb(34,197,94)), and the CTA `a href="/"` "Back to
  Home" (`inline-flex items-center gap-2 px-8 py-4 bg-white text-black
  rounded-full font-semibold hover:bg-white/90 transition-all` + the
  `arrow-right w-4 h-4` child). The wrapper `min-h-screen
  bg-background flex items-center justify-center px-6` around
  `text-center max-w-md` — a BARE centered page: NO nav, NO footer, NO
  landmarks (the live's own structure; the dormant toaster shell the
  registered D124/D126 live-side family, never simulated). The head:
  title "Thank You | SAAS Company", the D117-truncated description
  (the `pageDescription("Thank You")` seam reproduces the live's string
  BYTE-EXACTLY — verified), canonical/og:url/twitter:url the route,
  og:image the working replacement, NO og:image:alt (measured — the
  /login-only D121 record holds). The JSON-LD trio: the sitewide
  WebSite + Organization pair + the BreadcrumbList [Home, Thank You].
  The live's sitemap lists it (weekly/0.8). **The A2 probe disproved
  the S14 rationale**: the live's newsletter form does NOT navigate to
  /thank-you (the submit stays at `/` — an inline fetch flow; the
  "newsletter-success route" comment in sitemap.ts was a
  misidentification) — the page is the checkout-success destination
  (the counterpart of the live's soft-404'd `/checkout`). **The clone
  404s it today** (16 words, the 404 page — the registered
  "404-by-design"). The superset principle (the user's goal: every
  reference route works at least as well in the clone) says: **BUILD
  the page at the measured parity contract.** This is the ONLY route
  where the clone soft-404s what the live serves working — the mirror
  image of the D73/D146 record (where the live soft-404s what the
  clone serves working). The build closes the set: post-build, every
  one of the live's 8 public routes works in the clone, plus `/demo`.
- **R3 — the cursor/caret surface (the eighteenth-surface candidate,
  half one).** Every rendered interactive's computed `cursor` at REST,
  paired clone-vs-live on `/`, `/login`, `/faq` (+`/demo` the
  registered superset route): the CENSUS IDENTICAL on every pairable
  route — `/` 32 pointer + 1 text both sides, `/login` 4 + 2,
  `/faq` 27 + 1. The clone's base-layer `button, [role="button"] {
  cursor: pointer }` (gotcha 3) matches the live's own pointer
  behavior exactly — the cursor layer is at PARITY, no fix. The
  caret twin: every text-entry control's `caret-color` IDENTICAL
  (rgb(255,255,255) on the dark routes, rgb(9,9,11) on /login — the
  auto-inherited currentColor; neither side ships an explicit
  caret-color rule). **GREEN at parity.**
- **R4 — the form-autofill surface (the eighteenth-surface candidate,
  half two).** The `autocomplete` census on every form control,
  paired: the live ships NONE anywhere (its login email/password pair
  carries no autocomplete attributes — measured); the `:autofill` /
  `:-webkit-autofill` rule scan reads ZERO rules on both sides (the
  empty-set contract, the print-surface pattern). The clone ships the
  S14-era autoComplete set — the login pair (`email` +
  `current-password`, `new-password` in the signup alternate) and the
  demo form (`name`/`email`/`organization`) — a deliberate
  functional superset that predates the registry (S33) and was never
  versioned. **REGISTER it** (the DOM_ATTR_SUPERSET entry): the
  invisible-at-rest functional superset family (password-manager +
  browser-autofill assist, WCAG 1.3.5 identify-input-purpose) — the
  same class as the a11y-name supersets. No new autocomplete
  attributes added (the newsletter inputs match the live's own
  attribute-less contract — the parity discipline).

## The ToDo list (TDD)

- [x] F1 — `src/app/thank-you/page.tsx`: the server-component build at
      the measured contract — the verbatim wrapper/container/classes
      (`min-h-screen bg-background flex items-center justify-center
      px-6` > `text-center max-w-md`; the `--font-heading`/`--font-body`
      and `--color-green-500: #22c55e` tokens already pinned in
      `@theme`), `routeMetadata("Thank You", "/thank-you")`, the
      `breadcrumbStructuredData("Thank You", "/thank-you")` JSON-LD
      mount, the `CircleCheckBig`/`ArrowRight` lucide children, NO
      nav/footer/toaster
- [x] F2 — `src/app/sitemap.ts`: +`/thank-you` (weekly/0.8 — the live's
      own fields) → the clone's set = the live's 7 + `/demo` = 8 URLs,
      the STRICT superset (the D141 record updates; the misidentified
      newsletter comment replaced with the checkout-success story);
      `tests/e2e/session37-sitemap-parity.spec.ts` updated to the
      8-URL contract
- [x] F3 — `src/lib/head-superset.ts`: `DOM_ATTR_SUPERSET` +=
      `autocomplete` (side clone, routes `["/login"]` — the S14
      functional superset versioned, the eighteenth surface's
      adjudication) + the `head-superset.test.ts` shape pin
- [x] F4 — `tests/e2e/session43-thankyou-input-surface.spec.ts` (TDD —
      RED on the missing route first, then GREEN):
      (a) the /thank-you RENDER pins — the 36-word body, the h1/p1/p2
      text, the CTA anchor contract (tag `a`, href `/`, the class
      string), the icon row, the bare-page contract (no nav, no
      footer, no landmarks), zero overflow, docH = the viewport, the
      390 rendering (h1 36px, the CTA geometry);
      (b) the /thank-you HEAD pins — the title, the exact
      D117-truncated description, canonical/og:url/twitter:url =
      the route, og:image = /og-image.png, NO og:image:alt, the
      JSON-LD trio;
      (c) the /thank-you FOCUS-WALK pin — exactly 1 stop:
      `a|/|Back to Home`;
      (d) the EIGHTEENTH SURFACE pins — the cursor census (pointer +
      text counts on /, /login, /faq), the caret values (white on the
      dark routes, zinc-950 on /login), the autocomplete set on
      /login (email + current-password) with the /faq + / newsletter
      attribute-less contract;
      (e) the FOCUS-ORDER ROUTE EXTENSION pins — the legal routes'
      22-stop walk skeleton at 1440 + /privacy's 16-stop walk at 390
      (tag|href keyed, the registered a11y-name stops expected)
- [x] F5 — `research/drift-battery-s43.mjs`: FOUR phases — the
      /thank-you parity phase (the paired render/head/walk reads), the
      eighteenth surface (the paired cursor/caret/autofill census +
      the :autofill empty-set), the legal-route focus extension (the
      paired walks), the standing route-watch (the clone /thank-you
      FLIPPED to words-match 36 + the 8-URL sitemap vs the live's 7) —
      GREEN, ZERO DRIFT expected
- [x] F6 — the full gate re-run on the clean build — **725 checks
      ALL GREEN** (248 unit + 125 smoke + 352 e2e — 9 session43 e2e pins
      + 1 autocomplete registry unit pin + 1 /thank-you smoke page;
      lint/typecheck/build clean, the instrumentation.ts warning the
      known standing one)
- [x] F7 — the screenshot refresh (the standing set + the new
      /thank-you page shot; DB canonical before AND after; the REGEX
      route-abort discipline) + the VLM standing five — 5/5 PASS
      expected
- [x] F8 — the docs alignment: PAD (the revision block, §7 counts,
      §7.2, §11, the ledger records), AGENTS (the counts + the
      eighteenth surface + the /thank-you route invariant), CLAUDE
      (the session-43 context), README (the badge + the /thank-you
      story + the rows), SKILL v2.42.0 (lesson 82: the
      registered-design audit — a "by design" record is a hypothesis
      about the REFERENCE's intent, re-verifiable; the A2 probe that
      disproved the S14 newsletter rationale), .env.example verified
      in sync, the remediation plan session43 (this file, ticked), the
      session logs (curated + raw), the worklog
- [x] F9 — the commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding)


## The measured record (the session's adjudications, beyond the plan)

- **The D146 record CORRECTION (the in-flight finding).** The battery's
  first run asserted the clone's /pricing as a working superset — it
  reads a real 404 (16 words, pnf). The git history has NO
  `src/app/pricing/` (the route never existed); the S40 record's
  clone-side claim was an error from the day it was written. BOTH
  sides fail /pricing (the live's soft-404 D146; the clone's honest
  real 404); the pricing content lives in the landing's #pricing
  section on both sides. The battery's route-watch now asserts BOTH
  sides: the live's soft-404 set AND the clone's working set (the
  supersets are /demo + /dashboard only). Gotcha 53 + lesson 82.
- **The viewport law (the battery's in-flight fix).** The route-watch's
  word counts are a DESKTOP measurement: a battery phase that follows
  a 390 walk inherits the stale viewport — /faq reads 90 words at 390
  vs 101 at 1440 on BOTH sides (the layout-dependent innerText). The
  phase now resets the viewport first.
- **The struct-comparison bug (the battery's in-flight fix).** The
  first focus-ext comparison read `l.stops?.length` against an ARRAY
  (`l.length`) — the struct flag was false with 22/22 identical stops.
  The walks themselves were never in drift.

## The pushed-hash record (the closing discipline)

- Remediation commit **<HASH>** pushed via the SSH wrapper with the
  EXPLICIT `--remote git@github.com:nordeim/saas-company.git` (the S31
  trap: the wrapper's DEFAULT remote is the runbook's example repo —
  the explicit flag held from the first dry-run).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1-S42 record); both the wrapper's temp key copy and
  the operator's key file shredded after use.
- Zero zombies at close; the tree clean; no new branches.
