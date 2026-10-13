The raw working log of Session 49 (the S48 chain continued on the
surviving workspace — the environment NOT reset this time).

1. Read the operating instructions + the uploaded prompt
   (coding_agent_prompt.md); set up the TODO list (nine phases). The
   workspace SURVIVED from S48 (node_modules, the browsers, .env all
   intact); git pull brought in 06e968e (the separately-pushed
   session_106.md — the operator's S48 transcript). The exported
   DATABASE_URL trap (gotcha 1) found LIVE on the first env probe —
   unset in every command this session. The DB canonical STATE
   verified 1/6/7,120/5/1 (the checksum delta from e7f6c011 a benign
   read-connection artifact — the state counts the canonical check).
2. Read the history docs: session_105 (the S48 raw log), session_106
   (the operator's S48 transcript), remediation-plan-session48
   (ticked + the pushed-hash record), the repo worklog tail (the S48
   entries, the S49 candidates). Read the core docs strategically:
   AGENTS (the commands, the gate order, the gotchas 1-58), CLAUDE,
   README, the PAD's revision block + the ledger tail + §7.1, the
   SKILL v2.47.0 + lesson 87. Validated against the codebase (src/,
   the 57 specs, the configs, .env.example, db-path.ts). The skills
   catalog consulted (tdd / code-review-and-audit / agent-browser /
   evidence-driven-testing).
3. THE BASELINE GATE: lint ✓, typecheck ✓, unit 252/252 ✓, the clean
   build ✓ (the S48 font fix holding — one KNOWN standing warning:
   the instrumentation.ts Edge-Runtime node:fs warning, the S18
   documented seam), smoke 125/125 ✓, the e2e in nine chunks
   411/411 ✓ — **788/788 ALL GREEN** on the pulled tree.
4. The audit of the S48 diff (33098de): the layout.tsx weight fix
   (the root-cause comment thorough), the session48 spec (265 lines,
   the poppler instruments, the param-based helpers), the docs
   alignment — all conforming to the house patterns. No defects.
5. The S49 recon (research/recon-s49.mjs — five phases, incremental
   saves, the clone on :3400 against the scratch recon49.db, the
   port-sweep discipline): PH1 the route-watch — ZERO DRIFT (the
   working eight at 739/101/335/390/566/285/36/24; the soft-404
   statuses at the registered family; the sitemaps live 7 / clone 8).
   PH2 the 23rd surface's ROUTE EXTENSIONS — the four content-route
   link censuses at FULL PARITY (byte-identical in set AND
   multiplicity, page counts paired 2/2/3/2) + the landing's 87-anchor
   census re-verified + the named-destination layer at annotation
   granularity parity on all five probed routes (the landing's
   pricing×18/features×9/how-it-works×8/testimonials×8/unnamed×5 via
   pymupdf; the dest TABLES via pdfinfo -dests — the landing's four
   named + p1, the content routes' single unnamed p1). PH3 THE
   TWENTY-FOURTH SURFACE (the font-EMBEDDING layer) — AT FULL PARITY
   ON ITS FIRST MEASUREMENT: the family×count×type×encoding censuses
   byte-identical on 9/10 routes (the landing VendSans-Light 10× Type
   3/Custom; /faq /privacy /terms /refund-policy 7×; /accessibility
   8×; /thank-you 4×; the 404 5×; /login DejaVuSans 2× +
   DejaVuSans-Bold 1× CID TrueType/Identity-H — the system-ui
   fallback identical both sides); /demo the clone's 7× vs the live's
   5× (the registered superset); emb/sub/uni yes/yes/yes everywhere;
   no serif faces in any PDF (the below-fold wordmark record). THE
   PDF METADATA layer (the sibling): parity on 9/10 routes with
   CreationDate/ModDate/File size normalized out (Title/Creator/
   Producer/Pages + the flags identical); /demo the registered
   superset. ONE INSTRUMENTATION BUG in flight: the first ph3 font
   parse returned an EMPTY census — pdffonts' TYPE column carries a
   space ("CID TrueType") and the per-column \S+ regex matched
   nothing (empty-equals-empty would read as false PARITY); fixed
   with the 2+-space column split (reparse-s49.mjs over the saved
   PDFs). PH4 the mobile-nav D160 fifth re-verification — THE RECORD
   HOLDS EXACTLY (the clone y21/y28/y35 all open, the 397px panel +
   6 links; the live y21/y28 toaster-blocked, y35-only; the panel
   contract identical). PH5 the live login — lands at /, /dashboard
   the 16-word SPA 404 (the record holds, the fifth consecutive
   session).
6. The STABILITY PROBE (stability-s49.mjs): the font-census counts
   re-rendered FRESH on three routes — 10/7/2+1 exact, agreeing with
   both the S48 stale renders and the S49 fresh renders: the subset
   counts are deterministic under the pinned Chromium — SAFE TO PIN.
   (One zombie listener survived the probe's teardown — swept clean
   by the second pass; the gotcha-56b discipline held.)
7. Wrote docs/remediation-plan-session49.md (the registration +
   versioning scope; D171-D173; F1-F6) — validated against the
   codebase before the execution.
8. F1: tests/e2e/session49-fontembedding-metadata.spec.ts — 9 pins
   GREEN on the FIRST run (the 5 font pins: the per-route censuses
   with the deterministic counts, the /login system-stack census, the
   embedding contract + the type split, the /demo superset floor, the
   subset-prefix law; the 2 metadata pins: the per-route censuses +
   the /demo superset; the 2 extension pins: the four content-route
   link censuses + the dest tables).
9. F2: research/drift-battery-s49.mjs (the battery rebuilt with the
   FONT-EMBEDDING + METADATA column, the dest-table extension) —
   50/50 GREEN ZERO DRIFT across four phases ON THE FIRST RUN.
10. F3 THE FULL GATE: lint ✓, typecheck ✓, unit 252/252 ✓, the clean
    build ✓, smoke 125/125 ✓, the e2e in nine chunks 420/420 — **the
    gate 788 -> 797**.
11. F4 the screenshots: 21/21 captured (the gotcha-44 scroll-through
    pass; the two-pattern PATCH interception), the DB canonical
    before AND after (1/6/7,120/5/1), ZERO mutations. The VLM
    standing checks: 6/8 on the first pass — the 01 flag ADJUDICATED
    (the prompt's own wrong headline quote: the DOM proof confirmed
    the real h1 "Automated Workflows, Powered by AI" + the video
    present at 720px + no overflow; the re-run with the corrected
    prompt PASS), the 07 flag ROOT-CAUSED to a REAL LATENT CAPTURE
    BUG: the FAQ capture click's regex /what is novaai/i matched
    NOTHING (the real first question "Is my data secure with
    NovaAI?") and the .catch(() => {}) swallowed it — the standing 07
    shot had shipped WITHOUT an expanded panel since the script's
    introduction (the lesson-87 silently-dead-branch family). FIXED:
    the capture script now clicks the real first question; shot 07
    re-captured WITH the DOM proof (aria-expanded=true + the panel
    visible + the answer text rendered) and re-verified VLM PASS.
    Final: 8/8.
12. F5 the docs alignment (research/docs-align-s49.py — 20 edits):
    PAD (the S49 revision block, the ledger D171-D173, the §7.1
    counts 58 specs/420), AGENTS (the counts + gotcha 59 — the
    silently-dead capture-interaction law), CLAUDE (the session-49
    context), README (the 797 badge + the 24th-surface story + the
    session49 suite row + the counts + the STALE 123 smoke-row count
    fixed to 125 — a latent doc drift), SKILL v2.48.0 (lesson 88),
    .env.example verified in sync (no config surface touched), the
    remediation plan session49 (F1-F5 ticked), the session logs (this
    file), the worklog next, then the commit + the wrapper push.
