The raw working log of Session 50 (the S49 chain on a RESET workspace —
the environment rebuilt from the fresh clone).

1. Read the operating instructions + the uploaded prompt
   (coding_agent_prompt.md); set up the TODO list (the nine-phase house
   pattern). The workspace WAS RESET (a fresh clone — node_modules, the
   browsers, .env, the db all absent): npm install (430 packages), cp
   .env.example .env, prisma generate, db:push + db:seed (the canonical
   checksum e7f6c011 on the first try), playwright chromium 153.0.8010.12
   installed (the pinned Skia/PDF m153 family). The DB canonical state
   verified 1 user / 6 workflows / 7,120 total runs / 2 subscribers /
   0 demo requests.
2. Read the history docs: session_107 (the S49 raw log), session_108
   (the operator's S49 transcript), remediation-plan-session49 (ticked +
   the pushed-hash record), the repo worklog tail (the S49 entries, the
   S50 candidates). Read the core docs strategically: AGENTS (the
   commands, the gate order, the gotchas 1-59), CLAUDE (the session-49
   context), README (the 797 badge), the PAD's revision block + the
   ledger tail D171-D173 + §7.1, the SKILL v2.48.0 + lesson 88.
   Validated against the codebase (src/, the 59 specs, the configs,
   .env.example, db-path.ts). The skills catalog consulted
   (tdd / code-review-and-audit / agent-browser / evidence-driven-
   testing); skills/ excluded from every toolchain.
3. THE BASELINE GATE: lint ✓, typecheck ✓, unit 252/252 ✓, the clean
   build ✓ (the S48 font fix holding), smoke 125/125 ✓, the e2e in nine
   chunks 420/420 ✓ (one chunk-9 timing flake — the scroll-dot period
   pin — re-verified GREEN in isolation; the failure was CPU contention
   from the recon running concurrently — the timing-sampling test's
   known sensitivity) — **797/797 ALL GREEN** on the pulled tree.
4. The audit of the S49 diff (297d9b5): the session49 spec (311 lines,
   the poppler instruments, the param-based helpers), the docs alignment
   — all conforming to the house patterns. No defects.
5. The S50 recon (research/recon-s50.mjs — five phases, incremental
   saves, the clone on :3400 against the scratch recon50.db, the
   port-sweep discipline): PH1 the route-watch — ZERO DRIFT (the working
   eight at 739/101/335/390/285/566/36/24; the soft-404 statuses at the
   registered family; the sitemaps live 7 / clone 8). PH2 THE 24TH
   SURFACE'S ROUTE EXTENSIONS — the /login ALTERNATES' print story at
   FULL PARITY (the sign-up + forgot states: the font censuses DejaVu
   2x + Bold 1x identical; the metadata identical; the link censuses
   both EMPTY SETS; the print text 19/19 + 25/25). PH3 THE TWENTY-FIFTH
   SURFACE (the PDF XObject/IMAGE layer) — AT FULL PARITY ON ITS FIRST
   HONEST MEASUREMENT, AFTER ONE INSTRUMENT BUG CAUGHT AND FIXED IN
   FLIGHT: the first parse returned an EMPTY census (pdfimages' data
   rows are right-aligned with LEADING SPACES — the `!startsWith(" ")`
   filter killed every row; the lesson-88 empty-census family's THIRD
   sighting — the raw-output verification discipline caught it before
   any false-parity reading was recorded). The honest census (sorted
   structural keys, the object order + content-derived sizes normalized
   out): the landing 13 images byte-identical across sides (the hero
   VIDEO frame 1920x1080 icc 92ppi; the H1 GRADIENT-TEXT raster
   2025x534 rgb+smask; the CTA pill PAIR 1047x105 x2; the badge pill
   1165x103; the blurred glows 626x204 + 710x28x on p1, 541x160 +
   625x245 on p4); /login 6; EVERY other route the EMPTY SET on both
   sides. VLM-attributed (pdfimages -png extracts): the rasterization
   law — video frames, background-clip:text gradients, alpha-composited
   pills, and blurred glows rasterize; everything else stays vector.
   PH4 the mobile-nav D160 SIXTH re-verification — THE RECORD HOLDS
   EXACTLY (the clone y22/y28/y36 all open, the 390x397 panel, 6 links,
   Escape closes; the live's y22/y28 hit the dormant toaster — the
   hit-target map records the exact `fixed top-0 z-[100]` div — y36-only).
   PH5 the live login — lands at /, /dashboard the 16-word SPA 404 (the
   record holds, the sixth consecutive session).
6. The STABILITY PROBE (research/stability-s50.mjs): the image-census
   keys re-rendered fresh — 13/6/0 exact, identical across renders —
   DETERMINISTIC, safe to pin. The probe's extension: the alternates'
   IMAGE censuses (2+2 byte-identical across sides) with the
   STATE-TRACKED RASTER record — the login card's background raster
   re-rasterizes per state at the card's rendered height (1765x2696
   default / 1833 sign-up / 1533 forgot).
7. Wrote docs/remediation-plan-session50.md (D174-D176; F1-F6) —
   validated against the codebase before the execution.
8. F1: tests/e2e/session50-imagelayer-alternates.spec.ts — 9 pins
   GREEN on the FIRST run (the 6 image pins: the landing's 13-key
   census, the /login 6, the empty-set parity, the video-frame
   contract, the rasterization-law floor, the order-invariance +
   determinism law; the 3 alternate pins: the fonts, the metadata +
   links + text, the images + the state-tracked heights).
9. F2: research/drift-battery-s50.mjs (the battery rebuilt with the
   IMAGE + ALTERNATES columns) — three runs: 61/66 (the embedded-
   filename link-census law caught: pdftohtml emits internal anchors
   as `<basename>.html#N` — the per-side filename must be stripped),
   then 65/66 (the ANIMATED-GLOW JITTER law measured: the live's
   pulsing glow rasterized 710x288 AND 710x289 across renders — the
   ±1px frame-dependence bucketed, the S38 range law at the raster
   layer), then **66/66 GREEN ZERO DRIFT** on the final run.
10. F3 THE FULL GATE: lint ✓, typecheck ✓, unit 252/252 ✓, the clean
    build ✓, smoke 125/125 ✓, the e2e in nine chunks 429/429 — **the
    gate 797 -> 806**.
11. F4 the screenshots: 21/21 captured (the gotcha-44 scroll-through
    pass; the two-pattern PATCH interception; the FAQ click's DOM proof
    per gotcha 59 — aria-expanded=true asserted before the shot; the
    resilience banner's real copy "Could not update that workflow"
    — one capture fix in flight), the DB canonical before AND after
    (1/6/7,120/2/0 — zero mutations). The VLM standing checks: 7/8 on
    the first pass — the 06 flag ADJUDICATED BY EVIDENCE (my prompt
    wrongly asked for the NovaAI marketing wordmark; the login card's
    "S" chip + "Welcome to SAAS Company" is the live's own measured
    auth branding, parity since Session 2; the corrected re-run PASS).
    Final: 8/8.
12. F5 the docs alignment (research/docs-align-s50.py — 16 edits):
    PAD (the S50 revision block, the ledger D174-D176, the §7.1 counts
    59 specs/429), AGENTS (the counts + gotcha 60 — the leading-space
    row-filter law + the animated-glow jitter), CLAUDE (the session-50
    context), README (the 806 badge + the 25th-surface story + the
    session50 suite row + the counts), SKILL v2.49.0 (lesson 89),
    .env.example verified in sync (no config surface touched), the
    remediation plan session50 (ticked), the session logs (this file),
    the worklog next, then the commit + the wrapper push.
