The curated close of Session 47 — the print-text surface, the two entrance
gaps it exposed and closed, and the twenty-second surface's registration.

**The headline:** the print-to-PDF text layer (the twenty-second surface)
exposed TWO REAL ENTRANCE-LAYER CLONE GAPS — the first clone-gap build
since Session 43. The live's landing PDF reads 251 words; the clone's read
291. The 40-token delta was the UN-REVEALED ENTRANCE SET: the print
pipeline paints only settled content, and the live's below-fold framer
entrances stay opacity-0 at print time — its PDF omits the logo-cloud
wordmarks and the entire CTA block. The clone shipped those two families
STATIC (the S8 records), so its PDF painted what the live's did not.

**The gaps (measured with five instruments — the opacity timeline, the
DOM chain, the carrier census, the scroll-settle, the frame sampler):**
(1) the live wraps EACH of the 8 logo-cloud wordmark carriers as a framer
motion element with initial `opacity: 0` — an OPACITY-ONLY fade (no
transform at any phase), per-element reveals, a ~50ms stagger (starts
490→890ms), ~400ms durations; (2) the live wraps the ENTIRE CTA content
block (badge + h2 + copy + pills) in ONE unclassed motion div (y=30,
~800ms easeOut). The S8 F1-EXTRA records — "the wordmark cloud is NOT a
motion element" (the CONTAINER: still true) and "the live animates ONLY
the badge pill" (the SCOPE: wrong for today's live, gotcha 7) — fell to
the print probe.

**The build (TDD):** `Reveal` gained the OPACITY-ONLY mode (`y={null}` —
no transform key at any phase; the settled write `opacity: 1` ONLY, the
live's byte-exact inline residue; 4 unit pins RED first), the 8 carriers
became per-element entrances (structural parity: the motion div IS the
classed carrier — `duration 400, delay (i+1)*50ms`), and the CTA
restructured to the whole-block wrapper (y=30, duration 800, the badge-
only Reveal replaced). **The convergence confirmed EXACTLY: the clone's
landing PDF moved 291 → 251 = the live's 251** — the un-revealed set
unpainted on BOTH sides.

**The twenty-second surface (D161–D166):** the print-to-PDF text layer
at exact parity (26/104/344/36 on the content routes + the landing's 251
convergence, via pdftotext — the naive stream regex is blind to
Chromium's CID-subset encodings); the focus-visible ring at rendered
parity (the rule-census delta the library-structure layer); the
forced-colors empty-set (zero rules both sides, identical substitution,
stable geometry); the 21st surface's route extensions (the offline render
on the content routes — the D159 superset extended; the /faq 87-vs-101
delta adjudicated as the CSS-abort concatenation artifact; the clipboard
census on /login + /demo at parity).

**The standing verifications:** the route-watch ZERO DRIFT (the working
eight byte-identical; the sitemaps at the registered sets); the mobile-
nav D160 record re-verified (the live's burger still y20/y28-blocked,
y36-only — the reference watch: NO CHANGE; the clone fully clickable);
the live login → /dashboard still the SPA 404.

**The gate: 764 → 777** (252 unit + 125 smoke + 400 e2e — the session47
suite +9 pins, green after two pin-transcription catches); the battery
17/17 GREEN ZERO DRIFT on the FIRST run; 21 screenshots (DB canonical,
zero mutations — the capture script gaining the gotcha-44 scroll-through
pass the new entrances require); VLM 8/8 ZERO flags (one transient CLI
output-mix re-run). All six docs aligned; the S48 candidates recorded in
the worklog.
