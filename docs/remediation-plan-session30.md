# Remediation Plan — Session 30 (2026-10-10)

**Scope:** Execute the Session 30 audit's findings — the live reference's
STRUCTURED-DATA REDEPLOYMENT (the drift battery caught the reference now
shipping `application/ld+json` on every route — the D62/D113 "ships none"
record is stale, gotcha 7: the reference is a moving target), the 100/101-row
dual-ceiling boundary pins (the session_58 S30 candidate), and the drift
battery's own fifth-surface hardening — TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by the standing paired survey.

**Audit method:** the standing drift battery REBUILT for the reset workspace
(`research/drift-battery-s30.mjs` — word parity, the mobile-nav paired
real-touch probe, the SEO surface, and the NEW JSON-LD mount column) plus the
targeted live probes (`research/live-jsonld-probe-s30.mjs`,
`research/live-breadcrumbs-probe-s30.mjs`,
`research/live-mobilenav-probe-s30.mjs`). The baseline gate on the pulled
Session-29 tree (`6b69046`): **554 checks ALL GREEN** (190 unit + 124 smoke +
240 e2e — no flake; lint + typecheck + build clean), the canonical DB
re-seeded (checksum `e7f6c011`, 6 rows / 5 active / 7,120 runs), the exported
`DATABASE_URL` trap live again in the reset shell — neutralized (unset) all
session (the historical first-seed wrote the parent directory's file before
the unset; re-seeded to the repo `db/custom.db` immediately).

**The standing battery:** word parity **1.0000 on all 8 routes** (the
reference's COPY unchanged — the redeployment touched the head, not the
body); the mobile-nav paired probe: the clone's burger opens with a REAL tap
into the byte-identical panel (**7 rows × exactly 44px** — Features, How It
Works, Pricing, Testimonials, FAQ, Log In, Get Started, the same hrefs;
`bg-black/95`; **NO Tailwind v4 bug**; the live's burger remains
pointer-blocked by its own toast portal, D32, probed via JS click — its
panel's visible rows are the same 7 × 44); the SEO surface clean (sitemap 200
`application/xml`, robots the honest superset, og-image a real 1200×630 PNG,
`/manifest.json` 200 valid JSON — the battery's own first draft probed
`/manifest.webmanifest`, a script bug fixed in the same session; the live's
own manifest 302-redirects through its app API to the same content shape).

## Findings

1. **F1 — the live's structured-data redeployment: a PARITY GAP + the
   superset evolution (HIGH).** The reference NOW ships JSON-LD on every
   public route (probed across all 8 + /demo):
   - **EVERY route** (including `/login` and the SPA-404): a minimal
     `WebSite` script (`{name, url}`) + a minimal `Organization` script
     (`{name, url, logo}` — the logo points at their hosted favicon SVG).
   - **The 5 content routes** (`/faq`, `/privacy`, `/terms`,
     `/accessibility`, `/refund-policy`): additionally a `BreadcrumbList`
     (`Home → {Page}`, absolute `item` URLs; names: FAQ, Privacy, Terms,
     Accessibility, Refund Policy — the pages' own title stems).
   - The clone (D113): the landing's ONE `@graph` script
     (Organization + WebSite + SoftwareApplication) + `/faq`'s FAQPage —
     nothing on the other six routes.
   - **The gaps:** (a) the sitewide `WebSite` + `Organization` pair is absent
     from the clone's non-landing routes; (b) the `BreadcrumbList` is absent
     from the clone's content routes. **The retained supersets:** the
     `SoftwareApplication` with the PLANS-derived offers (the landing), the
     `FAQPage` (/faq), the working self-hosted logo (`/og-image.png` — the
     live's logo URL is its own CDN asset), and the `@id` anchor linking.
   - Word parity is UNAFFECTED (scripts never render into `innerText` —
     re-verified 1.0000 ×8 with the live's scripts mounted), so this is an
     invisible-to-rendering head-layer parity gap — exactly the class the
     battery's JSON-LD column now covers.

2. **F2 — the 100/101-row dual-ceiling boundary pins (MEDIUM — pin gaps
   around constructed-correct behavior; the session_58 S30 candidate).** The
   list cap (`MAX_WORKFLOW_LIST = 100`) and the chart cap (`CHART_ROWS = 8`)
   sit at the same surface with DIFFERENT note contracts: the list's note
   renders when `workflows.length > 0 && workflows.length < total` — at
   EXACTLY 100 rows the workspace fits the cap and NO note renders (`100 <
   100` is false); at 101 the note reads "Showing the 100 most recent of 101
   workflows." The chart's note renders when `total > 8` — present at both
   100 and 101 ("Showing the top 8 of {100|101} workflows by runs."). The
   header counter reads the TRUE `meta.total` (never the fetched length).
   NO spec pins any of this at exactly 100/101 (the seeded 6-row workspace
   hides both ceilings; the S25 survey law: probe every capped surface with
   data that EXCEEDS its cap — the 100-row boundary is the cap's own edge).
   Minting: the spec-scoped PrismaClient (the session28/29 dedicated-user
   pattern — the e2e webServer's `WORKFLOW_RATE_LIMIT_MAX=50` forbids
   API-minting 100 rows).

3. **F3 — the drift battery's fifth surface (LOW — the standing battery's
   own hardening).** The battery now carries the JSON-LD mount column (which
   routes serve `application/ld+json` on each side) — this session's rebuild
   already includes it; the docs' battery description gains the column so
   future sessions keep it.

**Adjudicated CLEAN/non-findings** (documented so a future session does not
re-litigate): the live's `/manifest.json` 302→its-API→200 (the clone's static
200 is the working equivalent — no action); the live's canonical/og tags
(unchanged — the Session-6 per-route pattern holds, word parity the proxy);
the live's SPA-404 serving the pair on unknown routes (the clone's 404 gains
the pair via the layout — the same "every route" behavior); the clone's
`/dashboard` gaining the sitewide pair (robots-disallowed, session-gated —
harmless, and the layout-level mount matches the live's every-route reality
by construction); the mobile-nav panel (byte-identical rows, re-verified this
session — no Tailwind v4 bug, D32 unchanged).

## The fixes (TDD-first)

### R1 — the JSON-LD parity extension: the sitewide pair + the BreadcrumbList (F1)

The restructure keeps ONE content source per fact and the stable `@id`
anchors, and moves the mounting to match the live's shape:

- **`src/lib/seo.ts`:**
  - `websiteStructuredData()` — NEW: the WebSite script matching the live's
    minimal shape plus the stable anchor: `{@context, @type: WebSite,
    @id: ${base}/#website, name: SITE_NAME, url: base, publisher:
    {@id: organization}}` (the live's minimal `{name, url}` + the anchor
    linking the superset nodes need).
  - `organizationStructuredData()` — NEW: the Organization script:
    `{@context, @type: Organization, @id: ${base}/#organization, name:
    SITE_NAME, url: base, logo: ${base}/og-image.png}` (the live's shape +
    the anchor + the WORKING self-hosted logo — the live's logo URL is its
    own CDN asset; the og-image is the clone's equivalent working image).
  - `breadcrumbStructuredData(page, path)` — NEW: the live's exact shape:
    `{@context, @type: BreadcrumbList, itemListElement: [Home → /, {page} →
    {path}]}` with absolute `item` URLs through `siteUrl()`.
  - `softwareStructuredData()` — the SoftwareApplication node EXTRACTED from
    the current `landingStructuredData()` @graph (publisher → the
    Organization `@id`; offers still DERIVED from PLANS, Enterprise's null
    honestly omitted).
  - `landingStructuredData()` and `faqStructuredData()` — RETAINED as the
    documented @graph/FAQPage builders **for the unit pins' shape
    documentation** but the PAGES stop mounting `landingStructuredData()`
    (the landing mounts `softwareStructuredData()`; the sitewide pair lives
    in the layout). `faqStructuredData()` keeps its /faq mount.
    - *Decision:* deprecating `landingStructuredData()` entirely would orphan
      the unit pins' @graph-linking documentation; keeping it as the
      reference shape while the runtime mounts the split scripts keeps BOTH
      the pin coverage and the parity shape. The unit pins for the split
      builders derive from the SAME facts (SITE_NAME, DEFAULT_DESCRIPTION,
      PLANS).
- **`src/app/layout.tsx`:** mount `<JsonLd data={websiteStructuredData()} />`
  + `<JsonLd data={organizationStructuredData()} />` — EVERY page route (the
  live's sitewide pattern; API route handlers never render the layout).
- **`src/app/page.tsx`:** replace the `landingStructuredData()` mount with
  `<JsonLd data={softwareStructuredData()} />` (the landing = the live's pair
  + the SoftwareApplication superset = 3 scripts).
- **The 5 content routes + /demo:** mount
  `<JsonLd data={breadcrumbStructuredData(page, path)} />` on `/faq`,
  `/privacy`, `/terms`, `/accessibility`, `/refund-policy` (parity: the
  live's exact 5) and `/demo` ("Book a Demo" — the clone-only superset
  route; the same content-route pattern for consistency).
- **`src/lib/seo.test.ts`:** +unit pins — the pair's shapes (@context, @type,
  name, url, the @id anchors, the og-image logo), the publisher linking,
  the breadcrumb derivation (the two-element trail, the absolute items, the
  position numbering), the SoftwareApplication extraction (offers still
  PLANS-derived), the JSON round-trips.
- **`tests/e2e/session29-jsonld.spec.ts` → evolved (renamed
  `session30-jsonld-parity.spec.ts` is NOT needed — the file's pins evolve
  in place, keeping the S29 lineage):** the landing's pin updates from "ONE
  @graph script" to "the sitewide pair + the SoftwareApplication" (3
  scripts: WebSite, Organization, SoftwareApplication — the @id linking now
  CROSS-SCRIPT); /faq's pin updates to "pair + FAQPage + BreadcrumbList";
  NEW pins: the pair present on EVERY public route (/, /login, /faq,
  /privacy, /terms, /accessibility, /refund-policy, /demo, the 404);
  the BreadcrumbList on the 5 content routes with the live-captured names
  (FAQ, Privacy, Terms, Accessibility, Refund Policy) deriving from the
  SAME `routeMetadata` page names the routes render (content-as-code: the
  crumb names derive from the route's own metadata stem, never re-typed).

### R2 — the dual-ceiling boundary pins (F2 — preventive, constructed-correct gated)

**NEW `tests/e2e/session30-dual-ceiling.spec.ts`** (the dedicated-user
pattern, `.serial`, the spec-scoped PrismaClient mint — sorts after
session29-*, before typography-parity):

- (a) **Exactly 100 rows:** Prisma-mint 100 rows for a purpose-built user →
  the list renders 100 articles with NO list note (`100 < 100` is false —
  the workspace fits the cap exactly); the header counter reads "100 total"
  (the TRUE total, never the fetched length); the chart's note reads
  "Showing the top 8 of 100 workflows by runs."; `meta.total == 100`.
- (b) **101 rows (one more minted):** the list still renders 100 articles +
  the honest note "Showing the 100 most recent of 101 workflows."; the
  header counter "101 total"; the chart note "…top 8 of 101…"; the 101st
  (oldest) row invisible in the list — the cap's honesty at its own edge.
- (c) **The stats stay TRUE across the cap:** the four stat cards read the
  server-side aggregate (101 rows minted with known runs/hours → the cards
  carry the full-workspace truth, not the capped subset's).
- The user cascade-deleted in an afterAll (the survivor discipline).

### R3 — the battery's fifth surface + docs truth (F3)

- The battery script's JSON-LD column + the manifest-URL fix persist under
  `research/` (the gitignored scratch convention).
- The docs' battery description (AGENTS/PAD) gains the fifth surface.

### Validation before execution (performed against the codebase)

- **Pin-conflict scans:** the symbols `websiteStructuredData` /
  `organizationStructuredData` / `softwareStructuredData` /
  `breadcrumbStructuredData` appear in NO file under src/ or tests/ (the
  namespace is clean); only `session29-jsonld.spec.ts` references
  `ld+json` (its two `toHaveLength(1)` assertions are the pins this plan
  legitimately evolves); no smoke pin greps ld+json; no spec counts
  `<script>` tags other than the S29 spec; the head-metadata pins read
  `<meta>`/`<link>`, never body scripts.
- **Safety (inherited from the S29 proofs, re-verified this session against
  the LIVE's own mounted scripts):** word parity 1.0000 ×8 with scripts
  mounted on BOTH sides — the scripts never render into
  `document.body.innerText`; an inline `<script>` creates NO
  resource-timing entry (the transfer budgets immune); a `<script>` has no
  box (CLS immune).
- **Suite-order scan:** `session30-dual-ceiling.spec.ts` sorts after
  `session29-jsonld.spec.ts` and before `typography-parity.spec.ts`
  (alphabetical, single worker, shared e2e.db); the spec's 1 register + 1-2
  sign-ins sit within the `AUTH_RATE_LIMIT_MAX=100` budget; the
  Prisma-minted rows cascade-delete (the later specs' 6-row expectations
  intact).
- **RED expectation:** R1 fails structurally on the pre-fix build (the new
  builders do not exist — the unit import fails the file; the e2e finds no
  pair on the non-landing routes, no breadcrumbs). R2/R3 are preventive
  (constructed-correct first — the pin is the surviving memory of the
  boundary walk; their RED is a future regression).

## Post-execution verification

1. Full gate: lint → typecheck → unit → build → smoke → e2e — the count
   rises 554 → **~563** (+6-8 unit: the pair/breadcrumb/software builder
   pins; +2-3 e2e: the jsonld parity evolution + the dual-ceiling trio; the
   MEASURED gate is what counts — the S26 lesson).
2. The drift battery re-run (the landing/faq/content-route HTML changed):
   word parity 1.0000 ×8, the mobile-nav byte-identical panel, the SEO
   surface, and the NEW JSON-LD column: the clone's mounts = the live's
   pattern + the supersets (pair everywhere, breadcrumbs on the 5 content
   routes + /demo, SoftwareApplication on the landing, FAQPage on /faq).
3. The JSON-LD live validity probe: every script parses; the pair's shapes
   match the live-captured structure; the breadcrumbs' trails absolute.
4. The 20-shot screenshot refresh + VLM spot-checks ×5 (the
   contract-precise prompt discipline).
5. `.env.example` verified in sync (no new env vars — the builders read the
   existing NEXT_PUBLIC_SITE_URL).

## ToDo

- [x] R1a `websiteStructuredData()` + `organizationStructuredData()` +
      `breadcrumbStructuredData()` + `softwareStructuredData()` in
      `src/lib/seo.ts` (the pure builders, one source of truth per fact)
- [x] R1b the sitewide pair mount in `src/app/layout.tsx`
- [x] R1c the landing's `softwareStructuredData()` mount (replacing the
      @graph mount) + the BreadcrumbList mounts on the 5 content routes +
      /demo
- [x] R1d the unit pins in `src/lib/seo.test.ts` (the pair shapes, the
      @id linking, the breadcrumb derivation, the extraction's PLANS
      derivation, the round-trips)
- [x] R1e the e2e evolution: `session29-jsonld.spec.ts` pins updated to the
      parity mount structure + the new every-route/breadcrumb pins
- [x] R1f RED observed on the pre-fix build (structural — the builders do
      not exist; the e2e finds no pair on the non-landing routes)
- [x] R2 NEW `tests/e2e/session30-dual-ceiling.spec.ts` (the 100/101-row
      boundary walk — the dedicated-user pattern, `.serial`, Prisma mint,
      cascade cleanup)
- [x] R3 the battery's fifth surface + manifest-URL fix (research scratch)
- [x] Full gate green — 554 → **569** (measured: 200 unit + 124 smoke
      + 245 e2e; +10 unit (the pair/breadcrumb/extraction builder pins)
      + 5 e2e (the jsonld suite evolved 2 → 4 + the dual-ceiling trio))
- [x] Drift battery re-run GREEN (word parity 1.0000 ×8, mobile-nav
      byte-identical, SEO clean, the JSON-LD column at parity+superset)
- [x] JSON-LD live validity re-check (parse + shapes + trails)
- [x] Screenshots (20) + VLM spot-checks (5) PASS
- [x] PAD ledger D115–D116 + §7 counts + §11 key files + the D62/D113
      stale-reference adjudication (the live now ships structured data)
- [x] AGENTS counts + the battery's fifth surface + the gotcha-7 reprise
- [x] CLAUDE session-30 context + counts
- [x] README badge/counts + the structured-data row update
- [x] SKILL version bump + lessons
- [x] .env.example verified in sync
- [x] remediation plan ticked + session log `docs/session_60.md`
- [x] worklog.md updated
- [x] commit on main + SSH wrapper push (wrapper-verified — the hash
      recorded below post-push)

**Pushed:** `f1df32a` on `main` → `git@github.com:nordeim/saas-company.git`
(via `docs/ssh_git_wrapper_v3.py` with an operator-supplied key — the
fingerprint verified against the S1–S29 record
(`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`), the dry-run with
the explicit `--remote` confirmed the fast-forward `09e89fc..f1df32a`,
the real push executed, and the wrapper asserted **remote main @
`f1df32a` == local HEAD** — wrapper-verified; the fetch-independent
ls-remote assertion agreed). The operator key shredded after use (both
the wrapper's temp copy and the operator's file). No new branches —
everything on `main`, per the operator contract. The shim: the paramiko
ssh shim REBUILT at `/home/z/bin/ssh` for the reset sandbox (the
Appendix-A implementation with the bidirectional stdin pump — the S28
lesson; placed on PATH per invocation; the fingerprint verified through
paramiko's own key parse, the SHA256 over the wire-format blob).
