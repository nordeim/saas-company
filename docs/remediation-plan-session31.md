# Remediation Plan — Session 31 (2026-10-10)

**Scope:** Execute the Session 31 audit's findings — the live reference's
CONTENT-ROUTE DESCRIPTION TRUNCATION (caught by the drift battery's NEW
sixth column — the canonical/og surface, the session_60 S31 candidate
hardened this session and validated on its FIRST run), the 404 route's
canonical/og:url drift (the clone ships Next.js's internal `/_not-found`
default where the live points at the actual unknown path), the CHART_ROWS
8↔9 note-transition boundary pins (the session_60 S31 candidate), and the
battery's own live-burger selector hardening — TDD-first, gated by the
full quality gate (§7.3 of the PAD), and re-verified by the standing
paired survey.

**Audit method:** the standing drift battery REBUILT for the session
(`research/drift-battery-s31.mjs` — word parity, the mobile-nav paired
real-touch probe, the SEO surface, the JSON-LD mount column, and the NEW
canonical/og-tag column) plus the targeted live probes
(`research/live-headtags-probe-s31.mjs`,
`research/live-burger-probe-s31.mjs`,
`research/live-dashboard-probe-s31.mjs`). The baseline gate on the pulled
Session-30 tree (`037fe89`, including the separately-pushed session log
61): **569 checks ALL GREEN** (200 unit + 124 smoke + 245 e2e — no flake;
lint + typecheck + build clean), the canonical DB re-seeded (checksum
`e7f6c011`, 6 rows / 5 active / 7,120 runs), the exported `DATABASE_URL`
trap live again in the reset shell (pointing at the PARENT directory) —
neutralized (unset) in every command this session.

**The standing battery:** word parity **1.0000 on all 8 routes** (the
body copy unchanged); the mobile-nav paired probe: the clone's burger
opens with a REAL tap into the byte-identical panel (**7 rows × exactly
44px** — Features, How It Works, Pricing, Testimonials, FAQ, Log In, Get
Started, the same hrefs; `bg-black/95`); the SEO surface clean (sitemap
200 `application/xml`, robots the honest superset, og-image a real
1200×630 PNG, `/manifest.json` 200 valid JSON); the JSON-LD column at
parity + superset (the clone: the sitewide pair everywhere + breadcrumbs
on the content routes + /demo + the SoftwareApplication on the landing +
the FAQPage on /faq; the live: the pair everywhere + breadcrumbs on the
five). The NEW sixth column (canonical/og) found the two head drifts
below. The live's authenticated surfaces re-probed: `/dashboard` and
`/checkout` still render the SPA 404 — the clone's workspace remains the
documented superset.

## Findings

1. **F1 — the live's content-route description truncation: a HEAD-LAYER
   PARITY GAP (HIGH; caught by the battery's new sixth column).** The
   live's five content routes ship, as BOTH `og:description` AND
   `meta[name=description]`:
   `"{Page} on SAAS Company. " + DEFAULT_DESCRIPTION.slice(0, 80) + "."`
   — the description part hard-capped at 80 characters, cut MID-WORD
   ("…with an immersi." from "immersive"), with a trailing period. The
   measured exact strings (total lengths): FAQ 102, Privacy 106, Terms
   104, Accessibility 112, Refund Policy 112 — the tail is the identical
   81-char string on every route (`Your intelligent AI assistant that
   streamlines complex workflows with an immersi.`), so the cap applies
   to the DESCRIPTION PART, never the combined total (the totals differ
   per page name). The landing and `/login` keep the FULL 214-char
   `DEFAULT_DESCRIPTION` (measured on both). The clone ships the full
   prefix + description everywhere — the Session-6 map recorded the
   `"{Page} on SAAS Company. {default}"` PATTERN but never the length
   (the head-metadata e2e pins only `startsWith` prefixes; the S31
   column measured the strings exactly). Word parity is UNAFFECTED (meta
   content never renders into `innerText` — confirmed 1.0000 ×8 with the
   live's truncated form mounted), so this is exactly the invisible
   head-layer class the sixth column now covers. The fix must ride the
   ONE seam every route consumes (`pageDescription()` in `src/lib/seo.ts`
   — `routeMetadata()` → description + og + twitter mirrors).

2. **F2 — the 404 route's canonical + og:url (MEDIUM; the same column).**
   The live's unknown routes ship `canonical` = `og:url` = the ACTUAL
   requested URL (the SPA head-manager's per-location pattern). The
   clone ships Next.js's default: both resolve against the INTERNAL
   route id `/_not-found` (measured: `http://…/_not-found`) — a URL that
   does not exist, pointed at by a canonical link (wrong by any standard:
   a canonical should reference a real, indexable URL). og:title,
   og:description, and the rest of the 404's head already match the live
   (the battery's title/desc comparisons passed on the 404 route); only
   the two URL tags drift. The not-found page is a CLIENT component (no
   `metadata` export possible) that already carries the Session-11 mount
   gate (`useSyncExternalStore`, one post-hydration commit) for the
   quoted pathname span — the same gate can set the two head tags to
   `window.location` (origin + pathname + search), reproducing the SPA's
   behavior exactly.

3. **F3 — the CHART_ROWS 8↔9 note-transition boundary (MEDIUM — pin gaps
   around constructed-correct behavior; the session_60 S31 candidate).**
   The chart's honesty note renders when `total > CHART_ROWS`: at
   EXACTLY 8 rows NO note renders (`8 > 8` false — an off-by-one in the
   comparison would surface here and nowhere else); at 9 the note reads
   "Showing the top 8 of 9 workflows by runs." The S28 tie-break spec
   pins the tie ORDER on a 10-row workspace (past the boundary); the S25
   chart-honesty and S26 ranking specs pin the note at 12+ rows; NOTHING
   pins the transition itself — and with a TIE at the membership
   boundary (the 8th and 9th rows equal on runs), the tie-break decides
   which row is charted and which is the first-ever excluded row (the
   newer keeps the seat — `createdAt DESC`). The list's own note contract
   sits at the same 9-row workspace UNCAPPED (`workflows.length < total`
   is false at 9 < 100 — the list note ABSENT where the chart note is
   PRESENT, the two honesty contracts side by side at the small end —
   the S30 dual-ceiling suite's mirror image).

4. **F4 — the battery's live-burger selector (LOW — the standing
   battery's own hardening).** The battery's mobile-nav probe selects the
   live's burger by `aria-label`/`aria-expanded`/`svg[class*=menu]` —
   the live's burger (re-probed this session: `class="md:hidden
   text-white/80 hover:text-white"`, a plain inline SVG with NO class,
   NO aria attributes) matches NONE of them; this session's first
   battery run reported `burger=null` and never opened the live's panel.
   The focused probe confirms the live's panel is UNCHANGED (7 rows ×
   44px, the same hrefs, `rgba(0, 0, 0, 0.95)`). The fix: the
   last-nav-button discipline (at mobile width the burger is the LAST
   button in the nav on the live's markup — probed). The clone's burger
   keeps its `aria-label="Open menu"` + `aria-expanded` (the a11y
   SUPERSET — the D32 working-burger law: never fix toward the live's
   lesser state).

**Adjudicated CLEAN/non-findings** (documented so a future session does
not re-litigate): the live's mobile-nav panel (byte-identical 7 × 44,
re-verified through the focused probe after the selector flake); the
live's burger carrying no aria attributes (the live's own a11y posture —
the clone's labels are the superset); the live's `/dashboard` +
`/checkout` (still the SPA 404 — the superset stands); word parity
(1.0000 ×8 — the redeployment touched only the head); the JSON-LD
surface (parity + superset stands); the landing's + /login's
descriptions (full 214 on both sides — measured); the twitter meta
mirror (follows `pageDescription()` by construction; the live's twitter
surface is not a measured parity column); the live's manifest
302→its-API→200 (the S30 adjudication stands); the /demo route's
description joining the content-route truncation (the live has no
/demo — the pattern governs, the same decision as the S30 breadcrumb).

## The fixes (TDD-first)

### R1 — the description truncation parity (F1)

The live's measured rule becomes the clone's, at the one seam every
route reads:

- **RED:** flip `src/lib/seo.test.ts`'s `pageDescription` pins to the
  measured strings (the five content routes' exact truncated forms), add
  the derivation pins: the description part is exactly
  `DEFAULT_DESCRIPTION.slice(0, 80) + "."` (81 chars), the combined
  totals measure 102/106/104/112/112, and `pageDescription(null)`
  keeps the FULL 214-char default (the landing + /login pattern —
  unchanged).
- **GREEN:** `pageDescription()` gains the cap: a named
  `DESCRIPTION_APPENDIX_CAP = 80` constant; the content-route form
  becomes `` `${name} on ${SITE_NAME}. ${DEFAULT_DESCRIPTION.slice(0,
  DESCRIPTION_APPENDIX_CAP)}.` `` — with the measured-rule comment (the
  live's head-manager behavior, the sixth column's first catch).
- **e2e:** extend `tests/e2e/head-metadata.spec.ts`'s route table with
  the exact `descExact` strings (replacing nothing — the prefix
  assertions stay, the exact pins ADD): the five content routes' full
  measured descriptions + the landing's full 214 default. The twitter
  mirror assertions (`twDesc === desc`) keep passing by construction.

### R2 — the 404 canonical + og:url parity (F2)

- **RED:** a new e2e pin (in the new `session31-head-parity.spec.ts`):
   on an unknown route, `link[rel=canonical]` and `meta[property=og:url]`
   both equal `window.location.origin + pathname + search` (the live's
   SPA pattern). Pre-fix: both read `…/_not-found` — structural fail.
- **GREEN:** the not-found page sets the two tags at mount through the
  existing mount gate (the same one-post-hydration-commit pattern as the
  quoted pathname span — server and hydration renders stay untouched;
  the tags fill in and STAY, `location` is immutable on a terminal 404).
  SSR/prerender HTML keeps Next's default until hydration — the live's
  SPA ships NOTHING until hydration either (its head manager runs
  client-side) — the rendered end-state is the parity surface.

### R3 — the chart 8↔9 boundary pins (F3)

`tests/e2e/session31-chart-edge.spec.ts` (the dedicated-user pattern,
`.serial`, the spec-scoped PrismaClient mint — the S28/S30 convention):

- **(a) EXACTLY 8 rows** — a discriminating workspace: the champion
  (1,500) → a 300-run tie cluster (NEW t-2d / MID t-20d) → fillers 200 /
  150 / 120 / 100 → the boundary row (96 runs, t-1d). Pins: the chart
  renders ALL 8 rows in rank order (nothing excluded — the workspace
  fits the cap), NO chart note ("Showing the top 8…" ABSENT), NO list
  note (length === total), the header reads "8 total", and the
  champion's bar is the full track (`width: 100%`).
- **(b) the 9th row minted ONTO (a)'s workspace** — the boundary TIE:
  96 runs (equal to the boundary row), t-30d (OLDER). Pins after a
  reload: the chart STILL 8 rows; the OLDER tied row is EXCLUDED (the
  newer keeps the seat — the tie-break at the membership boundary); the
  chart note APPEARS: "Showing the top 8 of 9 workflows by runs."; the
  LIST note still ABSENT (9 < 100 — the two honesty contracts side by
  side); the header reads "9 total"; the champion still first and
  full-track.
- **(c) the stats carry the full-workspace truth across the transition**
  — the "Total runs" card includes the EXCLUDED row's runs (the
  server-side aggregate over ALL 9 rows, never the charted subset).

### R4 — the battery's selector + the sixth column (F4)

`research/drift-battery-s31.mjs`'s live-burger probe gains the
last-nav-button discipline (the aria-attribute selectors keep working on
the CLONE — the superset side; the LIVE side selects by structure). The
docs' battery description gains the sixth column (canonical/og) so
future sessions keep it — the column that caught F1/F2 on its first run.

## ToDo

- [x] R1a RED: the `pageDescription` unit pins flipped to the measured
      truncated strings + the derivation pins (the 81-char tail, the
      102/106/104/112/112 totals, the landing's full 214)
- [x] R1b GREEN: `DESCRIPTION_APPENDIX_CAP` + the capped content-route
      form in `pageDescription()` (one seam — description, og, and the
      twitter mirror all follow)
- [x] R1c e2e: `head-metadata.spec.ts` gains the exact `descExact` pins
      (the five measured strings + the landing's full default)
- [x] R2 RED+GREEN: the 404 canonical/og:url mount-gate fix +
      `session31-head-parity.spec.ts` (the unknown-route pin)
- [x] R3 `session31-chart-edge.spec.ts` (the 8-row cap edge, the 9th-row
      boundary tie, the full-truth stats — `.serial`, Prisma mint,
      cascade cleanup)
- [x] R4 the battery's live-burger selector fix (the last-button
      discipline) — research scratch, re-run GREEN
- [x] Full gate green — 569 → **575** (measured: 201 unit + 124 smoke
      + 250 e2e; +1 net unit (the pageDescription describe 3 → 4), +5
      e2e (the head-parity pair + the chart-edge trio) — the plan's
      ~576 projection overshot by the unit-flip arithmetic)
- [x] Drift battery re-run GREEN (the sixth column now at parity: the
      truncated descriptions + the 404 canonical match the live)
- [x] Screenshots (20) + VLM spot-checks
- [x] PAD ledger D117–D119 + §7 counts + §11 key files
- [x] AGENTS (the battery's sixth column + the F1/F2 record) + CLAUDE +
      README counts
- [x] SKILL version bump + lesson (the sixth column's first-catch story:
      a proxy is not a measurement — word parity stood in for the head
      for 30 sessions while the live's description truncation hid behind
      a prefix assertion)
- [x] .env.example verified in sync
- [x] remediation plan ticked + session log `docs/session_62.md`
- [x] worklog.md updated
- [x] commit on main + SSH wrapper push (wrapper-verified — the hash
      recorded below post-push)

**Projection:** the gate grows by the R1 unit pins (+3-4) and the R2/R3
e2e tests (+4) → ~576-577 total. The battery's sixth column joins the
standing GREEN set at parity.
