# Remediation Plan — Session 29 (2026-10-10)

**Scope:** Execute the Session 29 audit's findings (the session_55/session_56
suggested surfaces — the empty-to-FIRST workspace transition, the
all-zero-runs chart floor, and the JSON-LD structured-data superset),
TDD-first, gated by the full quality gate (§7.3 of the PAD), and re-verified
by the standing paired survey.

**Audit method:** the standing drift battery first (word parity **1.0000 on
all 8 routes** — the reference UNCHANGED; the mobile-nav paired probe: the
clone's burger opens with a REAL tap into the byte-identical panel — seven
rows, every row exactly 44px — **no Tailwind v4 bug**; the live's burger
remains pointer-blocked, D32; the live LOGIN re-verified — D62 holds; the
SEO surface clean: sitemap 200 `application/xml`, robots the honest
superset, og-image a real 1200×630 PNG, manifest valid). The baseline gate
inherited **541 checks ALL GREEN** (182 unit + 124 smoke + 235 e2e — no
flake; lint + typecheck + build clean) on the pulled Session-28 tree
(`0d94be6` + the local skills commit rebased on top — `skills/` excluded
from every toolchain, per the operator contract). Then the Session-29 NEW
audit surface, probed on the probe-only server (:3251,
`db/probe-s29.db`, gotcha-30 discipline, one purpose-built user walked
live through the boundary shapes 0 rows → 1 row / 0 runs → 3 rows all
zero → 9 rows with one 500-run champion): **9/9 probe verdicts PASS** on
the standing behavior — the findings are one superset GAP and two PIN GAPS:

1. **F1 — the JSON-LD structured-data superset (the feature — zero
   structured data on all 8 routes).** The clone's SEO surface covers
   sitemap/robots/per-route metadata/og-image/manifest, but NO route
   ships `application/ld+json` (probed across all 8 public routes: false
   ×8). The reference ships none either (it is a Base44-hosted SPA —
   no parity constraint, the D62 family), so this is a pure SUPERSET
   candidate: valid schema.org structured data (Organization + WebSite +
   SoftwareApplication with the pricing offers on the landing; FAQPage
   on /faq) is the canonical SEO extension for a marketing site — it is
   what makes the clone's SEO "production ready" beyond the reference,
   exactly the task chain's "production-ready superset" goal. The
   content-as-code law governs the design: the FAQ entities derive
   VERBATIM from `src/lib/faq-content.ts` (FAQ_ITEMS), the offers derive
   from `src/lib/pricing.ts` (PLANS' monthlyPrice: Free 0, Pro 49;
   Enterprise's null price cannot be an Offer and is omitted — an
   honest omission, never an invented "0"), and the description derives
   from DEFAULT_DESCRIPTION — ONE source of truth per fact, no duplicated
   copy anywhere.

2. **F2 — the first-run boundary pins (pin gaps around probed-CORRECT
   behavior).** The S29 probe walked the empty-to-first transition live
   and found the standing behavior COHERENT at every shape: the empty
   workspace renders 0/0/0/100.0% + "No data yet." + the empty-list note
   (the S27 boundary — re-verified); the FIRST row lands (compose, runs
   0) and the cards become 1/0/0/100.0% with the chart rendering the row
   (the "No data yet." truth expiring exactly when data arrives); three
   all-zero rows render three UNIFORM floor bars (~4%, honest "0"
   labels); the first 500-run row lands and the top bar becomes the full
   track (100%) with the zero bars staying at the floor —
   proportionality honest, and the rate stays 100.0% now MEASURED
   (500 @ 100%). But NO spec pins any of this: session27(a) pins the
   0-ROW boundary only; session27(c)/(d) pin compose/delete chart
   refresh on the SEEDED (nonzero) workspace; session26(c) pins "the top
   bar spans the full track" only against nonzero data. The S25 survey
   law: probe every surface with the shape that exercises the question —
   the pin is the surviving memory of the probe.

3. **F3 — the maxRuns comment's over-broad invariant (a docs-truth
   micro-fix).** The chart's `maxRuns` comment claims "the top bar
   renders the full track, 100%" — true whenever the charted max is
   nonzero, but FALSE in the degenerate all-zero workspace (probed: the
   floor keeps the denominator at 1 and every bar rides the 4%
   visibility floor, uniform — the top bar is NOT full-track). The
   comment should name the degenerate case it hides (the S39
   docs-truth family: a comment that over-claims is a lie waiting for
   its first reader).

**Adjudicated CLEAN/non-findings** (documented so a future session does
not re-litigate blind): the 100.0% rate at N-rows/0-runs (the documented
S21 null→100 convention — vacuously true; the adjacent "Total runs 0"
card carries the zero-truth WITHIN the stat-card grid itself; the
convention expires seamlessly into the measured story at the first run —
probed C3: 500 runs → 100.0% now measured, no display flip, no jarring
transition); the uniform 4% floor bars at the all-zero workspace
(equality is the honest encoding for all-equal-zero data — the "0"
labels carry the value truth, and full-width bars would falsely suggest
maximal activity; the floor is the S25/S27 adjudicated visibility
convention, re-verified at 1/3/8 charted zero rows); the note threshold
(probed at exactly 9 rows: "Showing the top 8 of 9 workflows by runs."
— pinned since S25/S26, re-verified); the proportionality with one
nonzero champion (top bar 100%, zero bars at the floor — pinned by
session26(b)'s champion-visibility and re-verified live); the
empty-workspace boundary itself (pinned since S27, re-verified A0).

## The fixes (TDD-first)

### R1 — the JSON-LD structured-data superset (F1)

- **`src/lib/seo.ts`:** NEW pure builders, one source of truth per fact:
  - `siteUrl()` — `process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"` (the sitemap/robots source; no behavior
    change to those files — they keep their inline reads, both pinned).
  - `landingStructuredData()` — `{"@context": "https://schema.org",
    "@graph": [Organization, WebSite, SoftwareApplication]}`:
    Organization (`@id` `#organization`, name SAAS Company, url, logo =
    the og-image), WebSite (`@id` `#website`, name, url, publisher →
    the Organization `@id`), SoftwareApplication (`@id` `#software`,
    name NovaAI, applicationCategory BusinessApplication,
    operatingSystem "Web", description = DEFAULT_DESCRIPTION, offers
    derived from PLANS: Free `$0`, Pro `$49`, Enterprise omitted).
  - `faqStructuredData()` — `{"@context": "https://schema.org",
    "@type": "FAQPage", mainEntity: FAQ_ITEMS.map(...Question/
    acceptedAnswer verbatim)}`.
- **`src/components/site/json-ld.tsx`:** NEW 6-line server component —
  `<script type="application/ld+json" dangerouslySetInnerHTML=
  {{__html: JSON.stringify(data)}} />` (the App Router pattern).
- **`src/app/page.tsx`:** mount `<JsonLd data={landingStructuredData()} />`
  (the landing is statically prerendered — the script renders into the
  static HTML; no head mutation, no layout participation).
- **`src/app/faq/page.tsx`:** mount `<JsonLd data={faqStructuredData()} />`.
- **`src/lib/seo.test.ts`:** NEW pins — the graph shapes (@context +
  @graph 3 nodes + the linked @ids); the offers DERIVE from PLANS
  (map monthlyPrice → String(price), null dropped — the derivation pin
  that keeps the schema honest when pricing changes); the FAQ entities
  match FAQ_ITEMS verbatim (length + q + a — the content-as-code law);
  the JSON round-trip (JSON.parse(JSON.stringify(...)) deep-equal — no
  Date/undefined loss); the site URL fallback.

### R2 — the first-run boundary pins (F2 — preventive, probed behavior gated)

**NEW `tests/e2e/session29-first-run.spec.ts`** (the dedicated-user
pattern — session28's; sorts after session28-tie-break, before
typography-parity; ~3 UI sign-ins + 1 API register against the
AUTH_RATE_LIMIT_MAX=100 budget):

- (a) **the empty-to-FIRST transition through the REAL UI compose**
  (the production path): register a unique user → the dashboard's empty
  states (S27's boundary, re-asserted in this spec's own workspace) →
  compose through the FORM (idea → button → generate → POST → refresh)
  → WITHOUT a reload: the cards become 1/0/0/100.0%, the chart's "No
  data yet." is GONE with the row rendered (the ~4% floor bar + the "0"
  label), the list gains the article. The vacuous-rate expiry story
  pinned: the rate card reads 100.0% at 0 runs (the documented
  convention) beside "Total runs 0".
- (b) **the all-zero chart**: two more UI composes → three uniform
  floor bars (~4% each, "0" labels) — the top bar NOT full-track (the
  degenerate case of session26(c)'s invariant, named in the pin comment
  as the adjudicated convention: equality is the honest encoding).
- (c) **the first-run expiry**: Prisma-update the oldest row to runs
  500 (the spec-scoped PrismaClient, the session28 pattern — the API
  cannot mint nonzero runs) → reload → the top bar 100% full-track, the
  zero bars at the floor, the cards "Total runs 500" with the rate
  STILL 100.0% — now MEASURED (the seamless expiry).
- the user cascade-deleted in an afterAll (the survivor discipline).

### R3 — the maxRuns comment caveat (F3 — docs-truth, no behavior change)

`src/components/dashboard/dashboard-app.tsx`'s maxRuns comment gains the
degenerate-case clause: the floor keeps the denominator at 1 when every
charted row is 0, all bars ride the 4% visibility floor uniform, and
equality IS the honest rendering (adjudicated Session 29 — the "0"
labels carry the value truth; full-width would falsely suggest maximal
activity).

### Validation before execution (performed against the codebase)

- **Pin-conflict scans:** `application/ld+json` appears in NO spec or
  script (the name space is clean); the symbols
  `landingStructuredData`/`faqStructuredData`/`siteUrl` appear nowhere
  in src/ or tests/; NO e2e spec imports from `src/` today (this
  session's jsonld spec is the first — `FAQ_ITEMS` is pure TS with zero
  Next/CSS imports, so the Playwright transform compiles it cleanly);
  no smoke pin greps landing HTML word content (the script tag renders
  into HTML but never into `document.body.innerText` — the word-parity
  battery is immune); the transfer-budget pin filters
  `initiatorType === "script" || /\.js$/` — an inline ld+json script
  creates NO resource-timing entry and matches neither branch (immune);
  the CLS budgets are layout-only (a `<script>` has no box — immune);
  head-metadata pins read `<meta>`/`<link>` tags, not body scripts.
- **Suite-order scan:** `session29-first-run.spec.ts` and
  `session29-jsonld.spec.ts` sort after `session28-tie-break.spec.ts`
  and before `typography-parity.spec.ts` (alphabetical, single worker,
  shared e2e.db); the first-run spec's register + 3 sign-ins sit within
  the raised budget; the minted row cleanup keeps later specs'
  6-row expectations intact (cascade delete, the session28 pattern).
- **RED expectation:** R1 fails structurally on the pre-fix build (the
  builders do not exist — the unit import fails the file; the e2e finds
  no ld+json script on / or /faq). R2/R3 are preventive (probed correct
  first — the pin is the surviving memory of the probe; their RED is a
  future regression).

## Post-execution verification

1. Full gate: lint → typecheck → unit → build → smoke → e2e — the count
   rises 541 → **~554** (+6 unit: the JSON-LD builder pins; +4 e2e: the
   JSON-LD pair + the first-run trio; the MEASURED gate is what counts —
   the S26 lesson).
2. The JSON-LD validity re-verified live: each script parses, the FAQ
   entities count matches, the offers derive from PLANS.
3. The drift battery re-run (landing HTML changed): word parity 1.0000
   ×8 (the script never renders into innerText), mobile-nav
   byte-identical, D62 holds — GREEN.
4. The 20-shot screenshot refresh + VLM spot-checks ×5 (the
   contract-precise prompt discipline — the animated-gradient and
   verdict-format lessons stay encoded).
5. `.env.example` verified in sync (no new env vars — NEXT_PUBLIC_SITE_URL
   exists since the sitemap session).

## ToDo

- [x] R1a `siteUrl()` + `landingStructuredData()` + `faqStructuredData()`
      in `src/lib/seo.ts` (the pure builders, one source of truth per fact)
- [x] R1b `src/components/site/json-ld.tsx` (the script renderer)
- [x] R1c mount on `src/app/page.tsx` + `src/app/faq/page.tsx`
- [x] R1d the unit pins in `src/lib/seo.test.ts` (shapes, the PLANS
      derivation, the FAQ verbatim derivation, the round-trip)
- [x] R1e RED observed on the pre-fix build (structural — the builders
      do not exist; the e2e finds no script)
- [x] R2 NEW `tests/e2e/session29-first-run.spec.ts` (the empty-to-first
      UI transition, the all-zero floor, the first-run expiry — the
      dedicated-user pattern with cascade cleanup)
- [x] R3 the maxRuns comment caveat (docs-truth)
- [x] Full gate green — 541 → **554** (measured: 190 unit + 124 smoke
      + 240 e2e — the plan's ~554 prediction exact; +8 unit (the JSON-LD
      builder pins — 6 planned, 8 measured incl. the round-trips) + 5 e2e
      (3 first-run + 2 JSON-LD))
- [x] Drift battery re-run GREEN (word parity 1.0000 ×8, mobile-nav
      byte-identical, D62 holds)
- [x] JSON-LD live validity re-check (parse + entity count + offers)
- [x] Screenshots (20) + VLM spot-checks (5) PASS
- [x] PAD ledger D113–D114 + §7 counts + §11 key files
- [x] AGENTS counts + the invariant line naming the structured-data layer
- [x] CLAUDE session-29 context
- [x] README badge/counts + the JSON-LD row
- [x] SKILL version bump + lessons
- [x] .env.example verified in sync
- [x] remediation plan ticked + session log `docs/session_58.md`
- [x] worklog.md updated
- [x] commit on main + SSH wrapper push (wrapper-verified — the hash
      recorded below post-push)

**Pushed:** `8a3b02e` on `main` → `git@github.com:nordeim/saas-company.git`
(via `docs/ssh_git_wrapper_v3.py` with an operator-supplied key — the
fingerprint verified against the S1–S28 record
(`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`), the dry-run with
the explicit `--remote` confirmed the fast-forward `0d94be6..8a3b02e`
(carrying the operator's own local skills commit `0c56c25` rebased on
top, then the remediation), the real push executed, and the wrapper
asserted **remote main @ `8a3b02e` == local HEAD** — wrapper-verified.
The operator key shredded after use (both the wrapper's temp copy and
the operator's file). No new branches — everything on `main`, per the
operator contract. The shim: the paramiko ssh shim survived at
`/home/z/bin/ssh` (the S28 rebuild with the bidirectional stdin pump —
placed on PATH per invocation; the fingerprint verified through
paramiko's own key parse, the SHA256 over the wire-format blob).
