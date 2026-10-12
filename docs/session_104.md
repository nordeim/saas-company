# Session 48 — the curated log (2026-10-13)

**The shape:** a BUILD-FIX + measurement + versioning cycle — the
worklog S47 candidates (the 22nd surface's route extensions or the
23rd surface) answered by the recon, PLUS the session's own headline:
a build-pipeline font drift that broke the production build on the
pulled tree before any session work could begin.

## F0 — the build-pipeline font drift (D167, the headline)

The baseline gate was RED at the build step on a CODE-UNTOUCHED
tree: 16 Turbopack module-not-found errors, every one at the
Playfair Display font module
(`[next]/internal/font/google/playfair_display_55235e5f.module.css`:
`Can't resolve '@vercel/turbopack-next/internal/font/google/font'` /
`next/font/google queries have exactly one entry`).

**The root cause (an external supplier change under the pinned
toolchain):** Google's css2 endpoint now dedupes every requested
wght of Playfair Display to the SAME variable-font gstatic URL
(measured 2026-10-13: the 400/500/600/700 @font-face blocks all
reference one woff2), so `weight: ["400","500","600","700"]`
produced four @font-face src lines sharing ONE URL query — and
Next 16.4.0's Turbopack NextFontGoogleFontFileReplacer asserts
exactly one import-map entry per query. The S46/S47 builds passed
because Google's CSS serving differed then (gotcha 7, the
moving-target law — now at the build-pipeline layer).

**The fix:** `weight: "variable"` in `src/app/layout.tsx` — the
semantically correct selection for a variable font (the range form
`"400 700"` is rejected by Turbopack's own validator; only the
"variable" token or discrete weights are accepted). Rendering
unchanged, verified three ways: the family still registers as
"Playfair Display" (the built CSS now `font-weight:400 900` over 4
subsets + the DM Serif pair + the Vend Sans pair — 12 @font-face
total, the preloads intact), the wordmarks' 500/700 weights resolve
through the same variable file, and the typography-parity suite +
the full gate pass on the fixed tree.

## The recon (research/recon-s48.mjs — six phases, incremental saves)

- **R1 route-watch: ZERO DRIFT.** The working eight at exact word
  parity (739/101/335/390/566/285/36/24 — every value
  byte-identical to the S45/S46/S47 record); the soft-404 statuses
  at the registered family; the sitemaps at the registered sets
  (live 7, clone 8 — the strict superset). The live login ->
  /dashboard SPA-404 record holds (R6: login lands at /,
  /dashboard the 16-word SPA 404 — the fourth consecutive session).
- **R2 the print-text route extensions (D168):** /terms 400 = 400,
  /accessibility 584 = 584, /refund-policy 295 = 295, the 404
  (bogus path) 16 = 16 — all EXACT; /demo 101 vs the live's
  16-word SPA shell (the registered working superset). The 22nd
  surface now covers every public route.
- **R3 the 23rd surface (the PDF LINK layer, D169) — AT FULL PARITY
  ON ITS FIRST MEASUREMENT.** Two instruments agree: pymupdf's
  `get_links()` (the recon) and poppler's `pdftohtml -xml` (the
  e2e-embeddable pin — the same poppler family as the S47 pdftotext
  precedent, no python in the test layer). The censuses (origins
  stripped, internal anchors normalized to #page targets):
  byte-identical sets AND multiplicities on 9/10 routes — the
  landing's 87-anchor census ({#5:24, #6:19, /faq:12, #4:11, #7:9,
  #1:6, /refund-policy:2, /terms:1, /privacy:1, /accessibility:1,
  /:1}; the pymupdf cross-check reading the 48 named destinations
  at pricing×18/features×9/how-it-works×8/testimonials×8 + 5
  unnamed), the content routes' nav+footer sets (14-16 each),
  /thank-you EXACTLY ONE link (→ /), and the /login + 404 EMPTY
  SETS (the login bundle's bare card carries buttons, not
  anchors); /demo the clone's 14 links vs the live's ZERO. The page
  counts paired (8/1/2/2/2/3/2/2/1 — the S42 records hold).
- **R4 the mobile-nav D160 re-verification (the operator's standing
  focus): THE RECORD HOLDS EXACTLY** (the fourth consecutive
  session) — the clone's burger opens at y20/y28/y36 (the identical
  bg-black/95 panel, 6 anchor rows at 44px + the Log In row); the
  live's y20/y28 toaster-blocked (the two dormant react-hot-toast
  containers re-measured), y36-only. TWO INSTRUMENTATION LAWS
  (gotcha 58b): an aria-keyed panel detector is BLIND on the live
  (its burger carries no aria-expanded — the S41 superset record;
  the honest instrument is the ROW-CONTRACT detector: the
  bg-black/95 + backdrop-blur container passing the rendered-ness
  BOX check), and the live's SPA attaches click handlers at
  HYDRATION (a domcontentloaded+700ms click silently no-ops;
  networkidle + a 1s dwell is the minimum honest wait).
- **R5 the entrance census on /login + /demo: the EMPTY SET on BOTH
  sides** (zero inline opacity-0/translateY carriers) — parity at
  the empty set (the S42 pattern), no build.

## The build (F1) + the battery (F2)

`tests/e2e/session48-pdflinks-buildfix.spec.ts` — 11 pins GREEN on
the first run: the 2 font pins (the served CSS's Playfair variable
registration `font-weight:400 900` + the discrete-weight regression
guard; the wordmark family chains), the 2 print-text extension pins
(400/584/295/16 + the /demo floor), the 5 link-layer pins
(/thank-you's single link; the /login + 404 empty sets; the /faq
census; the landing census; the /demo floor + the page counts), the
entrance empty-set pin, and the font rendering pin.

`research/drift-battery-s48.mjs` — the battery rebuilt with the
LINK-LAYER column: **30/30 GREEN ZERO DRIFT** across three phases
(the print-text paired incl. the new routes; the link censuses
paired; the entrance/route-watch paired). One in-flight
instrumentation fix: the settled-residue check needs the scroll
reveal first (an unscrolled carrier legitimately reads opacity:0 on
BOTH sides — not drift).

## The gate (F3) + the screenshots (F4)

**777 -> 788 = 252 unit + 125 smoke + 411 e2e, ALL GREEN** (the e2e
in nine chunks; lint/typecheck/build clean — the instrumentation.ts
warning the known standing one; the build on the FIXED tree).

21 screenshots refreshed, the DB canonical before AND after
(1/6/7,120/5/1, zero mutations) — one capture fix in flight: the
PATCH interception for the error-boundary shot needs its own
`/api/workflows/<id>` pattern (the glob `**/api/workflows`
satisfies at the LIST path only — the first run's real pause was
caught by the DB-canonical check, the interception re-registered,
the shot re-captured clean). VLM 8/8: two flags ADJUDICATED BY
EVIDENCE — the pricing shot's "cut text" the how-it-works caption
tails sliced at the section boundary (horizontalOverflow
DOM-measured FALSE: scrollWidth 1280 == clientWidth 1280; the 02
shot re-framed clean for a zero-flag set), and the mobile-menu
shot's "white fragment" the page content visible below the bounded
dropdown panel (the menu is a 397px dropdown, not a fullscreen
overlay — expected).

## The documentation (F5)

PAD (the revision block, the ledger D167-D170, the §7.1 counts
refreshed from the stale Session-35-era table), AGENTS (the counts
+ gotcha 58 — the build-pipeline drift law + the two mobile-nav
instrumentation laws), CLAUDE (the session-48 context), README (the
788 badge + the font-drift story + the session48 suite row + the
counts), SKILL v2.47.0 (lesson 87: the build-pipeline drift + the
variable-weight fix + the link-layer instrument + the capture-glob
trap), .env.example verified in sync (no config surface touched),
the remediation plan session48 (ticked + this measured record), the
session logs 104 + 105, the worklog.

## The S49 candidates

The reference-regression watch continues; the 23rd surface's ROUTE
EXTENSIONS (the link census on the remaining routes — /terms,
/accessibility, /refund-policy, /demo measured this session but
unpinned at the spec layer beyond the floors; the named-destination
layer at the annotation granularity); or the twenty-fourth surface
— the font-EMBEDDING layer (the subsetted faces both sides ship in
the PDF: the fontspec census, the CID-subset names, the embedded
bytes), the PDF metadata layer (the document properties), or the
selection/clipboard behavior under print emulation.
