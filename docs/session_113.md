# Session 113 — the transcript log of Session 52 (the PDF structural layer + the alternates' post-build convergence)

Session 52 in progress — the baseline gate 817/817 verified on the fresh
environment; the S52 recon complete; this log records the session's work.
(The repo was re-cloned at the Session-51 closed state `52237ea` after a
workspace reset; the environment rebuilt — npm install, `.env` from
`.env.example` with `DATABASE_URL="file:../db/custom.db"`, `db:push` +
`db:seed` at the canonical checksum `e7f6c011`, Chromium 153, qpdf 12.2.0 +
the poppler family verified; the gotcha-1 exported-`DATABASE_URL` trap found
LIVE and neutralized per-command all session.)

The baseline gate: lint ✓, typecheck ✓, unit 252/252 ✓, clean build ✓,
smoke 125/125 ✓, e2e 440/440 in chunks — **817/817 ALL GREEN** (matching
the S51 record exactly).

The S52 recon (research/recon-s52.mjs + the b/c/d + rootcause + stability
probes — five phases, incremental saves, the clone on :3400 against the
scratch recon52.db):

- PH1 the route watch — **ZERO DRIFT, the EIGHTH consecutive session**:
  the working eight at byte-identical word parity
  (739/24/101/36/335/390/566/285), the soft-404 four at the registered
  family, the sitemaps live 7 / clone 8. NEW STANDING DATUM: the
  404-route DOM words 16 = 16 (both sides' shells identical — the
  interpolated "could not be found" copy + the Go Home button).
- PH2 the /login alternates' POST-BUILD vector censuses — the S51 badge
  build CONVERGED (the reset state's 1609 raster, words 31, fonts, page
  families, color-VALUE sets all identical); the card form's 30-op
  text-family delta ROOT-CAUSED AT THE GLYPH LEVEL: both sides carry
  exactly 6 BT blocks with blocks 1-5 byte-identical in ops AND glyph
  strings; the single delta is block 0 — the SAME 16 glyphs in the same
  order ("Check your email") where the clone emits 16 single-glyph Tj +
  15 Td and the live emits ONE combined Tj (15 + 15 = exactly the
  30-op delta — the registered D177 family at glyph granularity). The
  error state at parity (the registered 136-vs-139 family).
- PH3 the dashboard's authenticated vector census at depth — the clone's
  registration confirmed (292 words, 2 pages, VendSans-Light 9×, 34
  forms, 292 objects); the LIVE's post-login lands on `/` (739 words —
  the landing) and `/dashboard` remains the 16-word SPA-404 (the record
  holding for the EIGHTH consecutive session). The reference dashboard
  image is the CLONE'S OWN dashboard (the seeded workspace; its
  "99.2% AVG SUCCESS RATE" predates the deliberate D108 stat-honesty
  fix — the live has no dashboard to mirror, so the clone's honest
  run-weighted 99.5% IS the contract).
- PH4 **THE TWENTY-SEVENTH SURFACE — the PDF STRUCTURAL layer — at FULL
  PARITY on its first honest measurement**: the catalog key sets
  identical per route (the anchor-bearing {/Dests,/Pages,/Type,
  /ViewerPreferences} family tracking the D169 record; the clone's /demo
  carries /Dests where the live's 73-object shell carries none); BOTH
  sides emit UNTAGGED, OUTLINE-FREE PDFs (the empty-set contract);
  /ViewerPreferences identical; the object counts deterministic and
  near-identical (login 51/51, faq 241/241, privacy 234/234, terms
  242/242, refund 239/239, accessibility 315/315, thank-you 101/101;
  the landing's 523/525-vs-530 animated bucket; the /demo superset
  260/73). THE INSTRUMENT LESSON (the lesson-88 FIFTH sighting, caught
  by the raw-output discipline): the first structuralCensus prototype
  guessed the qpdf-11 JSON shape and read EMPTY CATALOGS — every route
  "matched" at empty-equals-empty FALSE PARITY; the honest fix dumps
  the raw shape and locates the catalog BY ITS /Type under qpdf[1].
- PH5 the mobile-nav D160 record — **HOLDS EXACTLY, the EIGHTH
  consecutive session**: the clone's burger opens at y21/y28/y35 (the
  390×397 panel, 6 links); the live's y21/y28 still toaster-blocked
  (the exact `fixed top-0 z-[100]` div), y35-only. No Tailwind v4 bug —
  the panel's `bg-black/95` serializes through oklab() on the clone and
  rgba() on the live, rendering-identical (the gotcha-4 law re-verified
  by the oklab-aware panel detector).

The remediation plan (docs/remediation-plan-session52.md) written and
validated against the codebase, then executed TDD-first:

- F1 the session52 spec (tests/e2e/session52-structurallayer-
  convergence.spec.ts) — 9 registration pins (the structural layer's
  catalog keys / empty-set / ViewerPreferences / top-level views /
  object counts / the /demo + dashboard contracts; the alternates'
  post-build convergence with the glyph-run block census; the 404-route
  DOM datum). THREE PIN-TRANSCRIPTION CATCHES in flight, each
  root-caused before re-pinning: (a) the email-length family — the
  print pipeline paints the typed email, so the text-op counts shift
  with the input (76/136 with a 21-char email vs 74/134 with 18 —
  every pin binds the spec's own input); (b) the /demo /Dests
  transcription error (the clone's /demo carries /Dests — its 14
  links; only the live's shell lacks it); (c) the landing's object
  count carries the animated-form bucket (523 AND 525 across runs —
  pinned 515-535, the stable routes exact). 9/9 GREEN, stable ×2.
- F2 the battery rebuild (research/drift-battery-s52.mjs) — the
  STRUCTURAL + ALTERNATES-CONVERGENCE columns joining the standing
  columns: **195/195 GREEN, ZERO DRIFT** across five phases (up from
  113). Five instrumentation corrections in flight: the
  order-insensitive check (key order is not a census fact), the 400ms
  scroll dwell (a 90ms cadence out-runs the observers — both sides
  read the unrevealed state), the stale-page render bug, the no-scroll
  vs scrolled record split (87/13/251 vs 105/29/670 — all
  both-sides-equal, the scrolled records now registered), and the
  reset card's root-caused 30-op band.
- F3 the full gate — **817 → 826** (252 unit + 125 smoke + 449 e2e),
  ZERO src/ changes (the registration pattern).
- F4 the screenshots — the standing 21-shot set refreshed (the capture
  server on :3500 against db/capture52.db; the gotcha-44 scroll-
  through; the two-pattern PATCH interception; the FAQ click; the
  reset badge's waitFor proof; the direct /dashboard navigation); the
  dev DB canonical before AND after (1/6/7,120/2/0, zero mutations).
  The VLM standing checks 8/8 — the two first-pass flags ADJUDICATED
  BY EVIDENCE (both the prompts' own enumeration errors: the reset
  card's text-style back button + the mobile menu's Log In button
  row, both proven present by the evidence probes).
- F5 the docs alignment — PAD (the S52 revision block, the ledger
  D181-D183, the 7.1 counts 61 specs/449), AGENTS (the counts +
  gotcha 62), CLAUDE (the session-52 context), README (the 826 badge
  + the 27th-surface story + the session52 suite row), SKILL v2.51.0
  (lesson 91), .env.example verified in sync, the plan ticked, this
  session log, the worklog.
- F6 the commit + the wrapper push — the remediation commit pushed to
  main via the SSH wrapper (the explicit --remote discipline; the
  fingerprint verified; the key shredded after).

**The headline:** the **twenty-seventh parity surface — the PDF
structural layer** — measured at FULL parity on its first honest
measurement (the catalog keys, the tagged/outline empty-set, the
object counts), with the instrument lesson (the qpdf-12.2 JSON-shape
law — the lesson-88 family's fifth sighting) caught by the
raw-output discipline before any false parity was recorded; the S51
badge build's convergence verified at the operator layer with the
30-op text delta root-caused at the GLYPH level (the same 16 glyphs,
per-glyph vs one run); the mobile-nav + live-login records re-verified
for the eighth consecutive session; the gate raised 817 → 826; the
battery 195/195 zero drift; 21 screenshots + VLM 8/8; all docs
aligned.

**Suggested next (the S53 candidates):** the reference-regression
watch continues; the 27th surface's route extensions (the alternates'
structural censuses; the dashboard's authenticated structural census
at depth — the outlines/acroform tables under auth); or the
twenty-eighth surface — the PDF's XObject RESOURCE layer (the
per-page resource dictionaries' name tables), the print-time COLOR
SPACE layer (the ICC profile streams + the alternate color spaces),
or the font SUBSET table layer (the CIDToGIDMap + the Widths arrays).
