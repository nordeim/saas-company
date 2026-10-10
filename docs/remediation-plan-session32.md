# Remediation Plan — Session 32 (2026-10-10)

**Scope:** Execute the Session-32 audit's findings — the drift battery's
NEW SEVENTH column (the per-route head-tag SET — the session_62 S32
candidate: "which meta/og/twitter tags exist on each side, not just the
four measured now — the twitter surface remains unmeasured") caught FOUR
real drifts on its first run, the mobile-nav probe needed its own selector
fix (the instrument, not the surface), and the session_62 candidate 3
(the 100-row chart/list membership-disagreement shape) joins as the
boundary-pin work — TDD-first, gated by the full quality gate (§7.3 of
the PAD), and re-verified by the standing paired survey.

**Audit method:** the standing drift battery REBUILT for the reset
workspace (`research/drift-battery-s32.mjs` — word parity, the mobile-nav
paired real-touch probe, the SEO surface, the JSON-LD mount column, the
S31 canonical/og column, and the NEW head-tag SET column) plus the
targeted live probes (`research/focused-probe-s32.mjs`,
`research/followup-probe-s32.mjs`). The baseline gate on the pulled
Session-31 tree (`d07337b`): **575 checks ALL GREEN** (201 unit + 124
smoke + 250 e2e — no flake; lint + typecheck + build clean — the first
build attempt hit a transient turbopack font-cache race, cleared with
`rm -rf .next`), the canonical DB seeded (checksum `e7f6c011`, 6 rows /
5 active / 7,120 runs, the seed-target verified at the repo path), the
exported `DATABASE_URL` trap live again in the reset shell (pointing at
the parent directory) — neutralized (unset) in every command this
session.

**The standing battery (first run):** word parity **1.0000 on all 8
routes** (GREEN — the body copy unchanged); the SEO surface clean
(sitemap 200 `application/xml` with all 8 routes listed, robots the
honest superset, og-image a real 1200×630 PNG, `/manifest.json` 200
valid JSON); the JSON-LD column at parity + superset; the canonical/og
column GREEN on all 7 real routes (the S31 truncation + per-route
canonical hold); the live's authenticated surfaces re-probed (`/dashboard`
and `/checkout` still render the SPA 404 — the clone's workspace remains
the documented superset); the live's og:image/twitter:image re-verified
DEAD (HTTP 404, 29 bytes — the D30 record holds; the clone's
self-hosted working og-image superset stands). The mobile-nav probe
returned its rows at 7 × 44px on BOTH sides (the probe's own logo-link
inclusion + panel-element selection need the R5 fix — the e2e
mobile-navigation suite pins the panel geometry GREEN, so this is the
instrument, not the surface).

## Findings

1. **F1 — the live ships `twitter:url` on EVERY route; the clone ships
   none (HIGH; the head-tag SET column's catch — the exact surface the
   session_62 candidate predicted).** Measured on all 8 live routes:
   `<meta name="twitter:url" content="{the route's absolute URL}">` —
   the SAME URL as the route's canonical/og:url (`https://saas-company.
   base44.app` on `/`, `…/login` on `/login`, `…/faq` on `/faq`, …, and
   the ACTUAL requested URL on unknown routes — the SPA head-manager's
   per-location pattern, the same family as the S31 404-canonical
   catch). The clone's twitter surface carries card/title/description/
   image but NO url — invisible to every standing gate (the head-metadata
   e2e spec pins title/desc/image only; the S31 sixth column measured
   canonical/og:title/og:description/og:url — four tags, never the
   twitter:url). The fix must ride the same per-route seam every route
   reads (`routeMetadata()` in `src/lib/seo.ts` + the root layout for
   the landing + the not-found effect for the 404). **Next.js's Twitter
   metadata type has NO `url` field** (verified against
   `next/dist/lib/metadata/types/twitter-types.d.ts` — site/siteId/
   creator/creatorId/description/title/images only), so the emission
   rides `metadata.other` (the arbitrary-meta channel: `other: {
   "twitter:url": value }` → `<meta name="twitter:url" content=…>`) —
   the value constructed from `siteUrl()` + the route path (the SAME
   origin source the JSON-LD builders and metadataBase read: one env
   var, one origin, never a re-typed URL).

2. **F2 — the live's `/login` REDEPLOYED `theme-color` + the image alts
   (MEDIUM; gotcha 7 — the moving target).** Measured: `/login` now
   ships `<meta name="theme-color" content="#000000">` +
   `og:image:alt` = `twitter:image:alt` = `"Base44 link preview"` — and
   NO other route ships any of the three (probed across all 8). The
   Session-6 record ("the live ships NEITHER theme-color NOR
   viewport-fit") was true at ITS measurement time — the gotcha-17 law
   ("do NOT re-add theme-color") is now STALE FOR /LOGIN: the reference
   wins, the redeployed tag joins at parity (the exact measured value
   `#000000`). The viewport-fit half of the law survives (the live still
   ships no viewport-fit). The alts: the live's own boilerplate string
   "Base44 link preview" describes its og:image; the clone's og:image is
   the documented working replacement (the live's is dead — re-verified
   this session), and the alt rides at the measured verbatim value (the
   S31 mid-word-truncation precedent: the head is copied EXACTLY,
   oddities included; an "improved" alt would be an invented string —
   the content-as-code law).

3. **F3 — the clone's 404 ships DUPLICATE canonical + og:url (MEDIUM;
   the S31 fix's blind spot — first-match selectors on both sides).**
   Measured on the browser-rendered 404 (any unknown route): TWO
   `link[rel=canonical]` elements and TWO `meta[property=og:url]` tags —
   the FIRST of each mutated to the requested URL by the S31 one-shot
   effect, the SECOND still pointing at Next's internal `/_not-found`
   route id (the hydration-inserted metadata copy — the static
   prerender ships one of each; Next 16's client metadata resolution
   appends its own, and the S31 effect's `querySelector` (first-match)
   never sees it). The live ships EXACTLY ONE of each (plus its
   twitter:url). A canonical link referencing `/_not-found` — a URL that
   does not exist — is the exact D118 defect class, surviving one
   session after its fix because the e2e pin ALSO reads first-match. The
   fix: the not-found effect normalizes ALL instances (mutate the first,
   REMOVE the rest) for canonical, og:url, AND the new twitter:url —
   the rendered end-state is exactly one of each, all pointing at the
   requested URL (the live's shape). The e2e pin gains the COUNT
   assertions so the duplicate class can never hide behind a
   first-match read again.

4. **F4 — the clone ships `<meta name="next-size-adjust" content="">`
   on every route; the live ships none (LOW — ADJUDICATED a Turbopack
   framework artifact after an in-vivo test).** The next/font artifact:
   Next emits the tag whenever the font manifest reports size-adjust
   fallback files — here for the two `next/font/google` serif faces
   (Playfair Display + DM Serif Display, the logo-cloud wordmarks; the
   UI font is self-hosted `@font-face` and never rode this path — and
   its `vend-sans-*.woff2` file names, though they contain the `-s`
   substring, are CSS url() assets OUTSIDE the next-font manifest, so
   they do not fire the heuristic — verified against the manifest
   plugin's `next-font-loader` module traversal). The documented
   opt-out (`adjustFontFallback: false`) was TESTED this session and is
   **INERT under this repo's Turbopack build**: a clean rebuild with
   the option set on both fonts still emits the Times New Roman
   override metrics (`size-adjust: 111.26%` in the CSS), the `-s`
   media files, and the tag itself — the option is a webpack-pipeline
   lever that Next 16.4's Turbopack ignores (the type accepts it, the
   runtime does not). The tag is an EMPTY-CONTENT telemetry meta for
   the Google Aurora team — zero visual, zero SEO, zero functional
   impact — the same adjudication class as the framework's automatic
   `name:robots noindex` on the 404. The alternative (moving the
   wordmarks off next/font onto hand-rolled @font-face) would trade a
   telemetry tag for real regression risk on the PINNED wordmark
   typography (the typography-parity suite pins the wordmark inline
   font-families) — disproportionate. **No fix; documented.**

5. **F5 — the battery's mobile-nav probe selector (LOW — the standing
   battery's own hardening, the S31 F4 class).** The first S32 run
   measured the panel rows as `16,44,44,44,44,44,44` on BOTH sides —
   the probe's `nav a` filter included the LOGO link (16px) beside the
   panel's 7 rows, and the panel-background read picked a non-panel
   absolute element on the clone (an oklab white/10) and null on the
   live. The e2e mobile-navigation suite pins the panel geometry GREEN
   (the surface is fine) — this is the INSTRUMENT: scope the row
   measurement to the panel's own links (the dropdown container) and
   read the background from the rows' common ancestor.

6. **F6 — the 108-row chart/list membership-disagreement shape (MEDIUM
   — the session_62 candidate 3, a pin gap around constructed-correct
   behavior).** The S30 dual-ceiling suite pinned the 101-row shape
   (ONE excluded row — the oldest 500-run champion, invisible in the
   list yet first in the chart). The session_62 candidate names the
   stronger shape: a workspace where the chart's topRuns and the list's
   newest-100 disagree on membership MORE than one row — at 108 rows
   with the 8 highest-run rows all sitting OUTSIDE the newest-100, the
   chart and the list share ZERO members: the two surfaces render
   completely different workspaces at one URL, each honest about its
   own criterion ("the 100 most recent" vs "the top 8 by runs"). The
   behavior is correct by construction (the server-side topRuns
   aggregate + the capped newest-100 list + the two notes) — UNPINNED
   at this shape. `session32-membership.spec.ts` (the dedicated-user
   pattern, `.serial`, the spec-scoped PrismaClient mint — the S28/S30/
   S31 convention) pins it.

**Adjudicated CLEAN/non-findings** (documented so a future session does
not re-litigate): the clone's `og:image:width/height/type` (clone-only
on all routes — the working og-image's real dimensions, the D30
working-asset superset; the live's og:image is DEAD, re-verified 404/29
bytes — its head never describes a working image); the clone's
`name:robots noindex` on the 404 (Next's automatic not-found emission —
the clone's real HTTP 404 vs the live's 200-SPA-404 is the honest
superset; the live ships no robots meta because it never returns a real
404 status); the live's image alts on routes OTHER than /login (measured
absent — no clone change); the /demo route's twitter:url (the live has
no /demo — the pattern governs, the same decision as the S30 breadcrumb);
the trailing-slash spelling of og:url on the landing (the live's og:url
carries no trailing slash; the clone's metadataBase resolution emits one
— pathname-pinned on both, never string-pinned; the twitter:url joins at
the live's exact no-slash spelling); word parity (1.0000 ×8 — GREEN);
the JSON-LD surface (parity + superset — GREEN); the mobile-nav panel
itself (7 × 44px on both sides — the probe was the flake, R5); the live's
`/dashboard` + `/checkout` (still the SPA 404 — the superset stands);
the twitter:image URL (the live's is the dead media.base44.com asset;
the clone's self-hosted og-image is the working replacement — the D30
family, unchanged).

## The fixes (TDD-first)

### R1 — the twitter:url parity (F1)

- **RED:** `src/lib/seo.test.ts` gains the derivation pins —
  `routeMetadata("FAQ", "/faq").other["twitter:url"]` equals
  `` `${siteUrl()}/faq` `` (the SAME origin source the JSON-LD builders
  read — one env var, one origin, never a re-typed URL);
  `routeMetadata(null, "/login")` derives `…/login`; the root default
  (path `""`) derives the bare origin (the live's landing spelling —
  no trailing slash). `tests/e2e/head-metadata.spec.ts`'s route table
  gains the `twUrl` pin per route: `new URL(twUrl).pathname ===
  routePath` (the og:url pin style — origin-agnostic) AND `twUrl` is a
  real absolute URL.
- **GREEN:** `routeMetadata(page, path = "")` gains
  `other: { "twitter:url": \`${siteUrl()}${path}\` }` (Next's Twitter
  metadata type has no url field — the arbitrary-meta channel is the
  emission path); every caller passes its path (FAQ `/faq`, Privacy
  `/privacy`, Terms `/terms`, Accessibility `/accessibility`, Refund
  Policy `/refund-policy`, Book a Demo `/demo`, Dashboard `/dashboard`,
  login `/login`); the root layout's own metadata gains
  `other: { "twitter:url": siteUrl() }` (the landing — no page-level
  metadata — and the inherited base for the 404, which the R3 effect
  then rewrites to the requested URL).

### R2 — the /login theme-color + image alts (F2)

- **RED:** `tests/e2e/head-metadata.spec.ts`'s `/login` row gains
  `themeColor === "#000000"`, `ogImageAlt === "Base44 link preview"`,
  `twImageAlt === "Base44 link preview"` (and every OTHER route's row
  pins the three ABSENT — the live's own per-route shape); the
  standing `themeColor: null` pin (line 111) flips to the per-route
  table value. `src/lib/seo.test.ts` pins
  `routeMetadata(null, "/login", { imageAlt })` carrying the alts in
  BOTH image arrays and the option absent by default.
- **GREEN:** `routeMetadata(page, path, opts?: { imageAlt?: string })`
  spreads `alt` into the og images entry and the twitter images entry
  when provided; `src/app/login/layout.tsx` calls
  `routeMetadata(null, "/login", { imageAlt: "Base44 link preview" })`
  and exports `const viewport: Viewport = { themeColor: "#000000" }`
  (the per-route viewport export — scoped to /login exactly like the
  live's own tag; the route-scoped `<style>` pattern's head twin).

### R3 — the 404's duplicate-tag normalization (F3)

- **RED:** `tests/e2e/session32-head-parity.spec.ts` (new): on an
  unknown route, `link[rel=canonical]` count === 1,
  `meta[property=og:url]` count === 1, `meta[name=twitter:url]` count
  === 1, and ALL THREE equal `window.location.origin + pathname +
  search` (the live's exact trio shape). Pre-fix: counts 2/2/0-or-1
  (the hydration-inserted `/_not-found` copies survive; twitter:url
  missing — structural failures). The terminal-stability pin re-reads
  the counts after a settle (no re-insertion).
- **GREEN:** the not-found page's one-shot effect normalizes ALL
  instances per tag: the FIRST element is mutated to the requested
  URL, the REST are REMOVED (the live ships exactly one of each — the
  rendered end-state is the parity surface; the hydration-inserted
  `/_not-found` copies leave the DOM). The `twitter:url` tag joins the
  same normalization (the R1 base value inherits from the layout; the
  effect rewrites it to the requested URL like canonical/og:url).

### R4 — the next-size-adjust removal (F4) — ADJUDICATED, no fix

Tested in vivo and adjudicated (see F4): `adjustFontFallback: false`
on both Google font configs is INERT under the Turbopack build (a
clean rebuild still emits the fallback metrics + the tag). The option
is REVERTED (no dead config — a config that claims an effect it
cannot deliver is a lie by staleness). The tag joins the adjudicated
clone-only set (the battery's head-tag SET column reports it as a
documented artifact beside `name:robots` and the og:image dims).

### R5 — the battery's mobile-nav probe (F5)

- `research/drift-battery-s32.mjs`'s panel probe scopes the row
  measurement to the dropdown panel's own links (the 44px rows'
  container), reads the panel background from the rows' common
  ancestor, and keeps the live's last-nav-button burger discipline.
  Research scratch — re-run GREEN.

### R6 — the 108-row membership-disagreement pins (F6)

`tests/e2e/session32-membership.spec.ts` (the dedicated-user pattern,
`.serial`, the spec-scoped PrismaClient mint — the e2e webServer's
`WORKFLOW_RATE_LIMIT_MAX=50` forbids API-minting 108 rows):

- **(a) the shape:** 100 recent rows (runs 10, rate 100, hours 1,
  createdAt spaced 1h — the newest 100) + 8 OLD rows (the highest-run
  members: runs 570/560/550/540/530/520/510/500, hours 5, createdAt
  200+ days back — ALL outside the newest-100). Pins after sign-in:
  the header reads "108 total"; the list renders EXACTLY 100 articles
  with its honest note "Showing the 100 most recent of 108
  workflows."; the chart renders EXACTLY 8 rows with its note
  "Showing the top 8 of 108 workflows by runs."; **the chart's 8 names
  and the list's 100 names share ZERO members** (the membership
  disagreement the S30 single-row shape never reached); the chart's
  first row is the 570-run champion with the full-track bar.
- **(b) the stats carry the FULL-workspace truth:** 5,000 runs
  (100×10 + 8×500 — the capped subset would read 1,000), 140 hours
  (100 + 8×5 — the subset would read 100), 100.0% (all rows at 100),
  108 active.
- **(c) the chart's ranking is server-honest at the disagreement
  shape:** every charted name is one of the 8 OLD high-run rows in
  runs-descending order (NONE of them visible in the list — the
  `meta.topRuns` aggregate across the FULL workspace; a client-side
  ranking over the capped list would chart the 10-run recent rows
  instead — the S26 defect shape at its extreme).

## ToDo

- [x] R1a RED: the `routeMetadata` twitter:url derivation pins (unit)
- [x] R1b GREEN: `routeMetadata(page, path)` + `other` + every caller's
      path + the layout's landing value
- [x] R1c e2e: the head-metadata route table's `twUrl` pins
- [x] R2 RED+GREEN: the /login viewport themeColor + the imageAlt
      option + the per-route absent pins
- [x] R3 RED+GREEN: the not-found effect's all-instances normalization
      (extended mid-GREEN to a MutationObserver — Next's client metadata
      resolution appends its head copies AFTER the mount effects run,
      measured in vivo; the first-match-only normalization was
      insufficient) + `session32-head-parity.spec.ts` (the count trio +
      the terminal-stability re-read)
- [x] R4: F4 ADJUDICATED a Turbopack framework artifact (the opt-out
      tested and found inert — reverted, documented)
- [x] R5: the battery's mobile-nav panel probe fix (iteration 2: the
      row filter must catch the Log In BUTTON, not just anchors — the
      panel's 7th row is a `<button>`; the bg walks up to the first
      OPAQUE ancestor; the oklab/rgba spelling both accepted — gotcha 4)
      — re-run GREEN
- [x] R6: `session32-membership.spec.ts` (the 108-row shape, the
      full-truth stats, the server-honest ranking — passed on the
      pre-fix build by design: a pin gap around constructed-correct
      behavior; one authoring arithmetic fix — the old rows sum 4,280,
      not 4,160, the truth 5,280)
- [x] Full gate green — 575 → **583** (measured: 205 unit + 124 smoke
      + 255 e2e; +4 unit, +5 e2e — the projection's range held)
- [x] Drift battery re-run GREEN — **93/93, zero drift** (the seventh
      column at parity: the twitter:url present per route, the 404 trio
      exactly-once, the /login redeployment matched; the adjudicated
      clone-only set documented: next-size-adjust, 404 robots, og dims)
- [x] Screenshots (20, the scroll-through discipline; DB canonical
      before AND after — 6 rows / 5 active / 7,120 runs) + VLM 5/5
      (the hero shot's below-fold flags adjudicated by the full-page
      evidence — the S30/S31 single-frame family)
- [x] PAD ledger D120–D123 + §7 counts + §7.2 suites + §11 key files
      + the D30 supersession note
- [x] AGENTS (the counts + the battery's seventh surface + the
      gotcha-17 stale-record note + gotcha 45: the late head insertion)
      + CLAUDE (the session-32 context + the stack-table counts) +
      README (the 583 badge + the counts + the S32 rows)
- [x] SKILL v2.31.0 (lesson 71: a fix and its pin share the same
      blind spot until the pin measures MORE than the fix touches —
      pin the COUNTS; frameworks write to the DOM after your effects
      run)
- [x] .env.example verified in sync (no env vars touched — the
      twitter:url derives from the existing NEXT_PUBLIC_SITE_URL)
- [x] remediation plan ticked + session log `docs/session_64.md`
- [x] worklog.md updated
- [ ] commit on main + SSH wrapper push (wrapper-verified — the hash
      recorded below post-push)

**Projection:** the gate grows by the R1/R2 unit pins (+3-5) and the
R3/R6 e2e tests (+5: the head-parity pair + the membership trio) →
~581-584 total. The battery's seventh column joins the standing GREEN
set at parity.
