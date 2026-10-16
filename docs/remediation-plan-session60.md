# Remediation Plan — Session 60

The worklog S59 candidates (the SIXTEENTH standing watch; the 34th
surface's route extensions — the second-interpolation-input cross-check
at the color layer, the 3 remaining literal-#d500ff outline/shadow
rules; or the THIRTY-FIFTH surface — the /Shading pattern-interior value
layer), answered against the measured codebase — with the best-judgment
scope: ALL THREE candidate families probed in one session (the watch +
both route extensions + the 35th surface), the probes' findings decoding
to ONE real src/ convergence (the literal-rule family) plus one
test-instrument hardening (the D135 hover family), executed through the
full TDD discipline.

## The environment (the FRESH-CLONE session — the first since S24)

The workspace was RESET at the session boundary — a fresh
`git clone` (the tree at `4747964`, the S59 closing state: session_127 +
session_128 + the remediation plan 59 + the worklog all present),
node_modules reinstalled, the Playwright Chromium v1243 binaries
re-downloaded, `.env` re-created from `.env.example`, and the DB
re-pushed + re-seeded.

**THE SANDBOX DATABASE_URL GOTCHA (the session's environment
discovery)**: this sandbox pre-sets `DATABASE_URL=file:/home/z/my-project
/db/custom.db` — an ABSOLUTE out-of-repo URL — in the process
environment. The repo's own CLI precedence rule #1 (an explicit process
env DATABASE_URL is operator intent; absolute URLs pass through
untouched — the Session-24 R3 contract) honors it, so a bare
`npm run db:push && npm run db:seed` writes OUTSIDE the repo (probed in
vivo: the seed printed `seed-target:file:/home/z/my-project/db/custom.db`
while `<repo>/db/` held only `.gitkeep`). In a normal environment the
repo's own `.env` (precedence 2) applies and the documented fresh-checkout
story works unchanged — the codebase is CORRECT per its tested contract;
the sandbox is the artifact. **The session discipline**: every
DB-touching command pins `DATABASE_URL="file:../db/custom.db"` per
command (the gotcha-1 discipline the smoke/e2e suites already embed);
the canonical dev DB re-seeded IN-REPO at 1/6/2, md5 recorded.

The baseline verified: lint ✓ typecheck ✓ unit 252/252 ✓ the standalone
build ✓ smoke 125/125 ✓ e2e **500/500** (the chunked runner re-created
under `research/` per the house pattern — the s59 list expanded verbatim
from the committed runner per gotcha 67). Two in-flight flakes, both
adjudicated against the registered environment families: the session40
responsive chunk's font-stack flake (clean on direct re-run — the S58/S59
registered family) and **the D135 hover flake** (chunk-context-only,
clean standalone — root-caused this session as the instrument's
early-return race, hardened in F6 below).

## F1 — THE SIXTEENTH STANDING WATCH: ALL RECORDS HOLD

The fresh two-sided capture (the live at
`saas-company.base44.app` + the clone standalone on :3400 against a
scratch `db/recon60.db`):

- **The working eight at BYTE-IDENTICAL word parity** — / 739, /login
  24, /faq 101, /thank-you 36, /privacy 335, /terms 390,
  /accessibility 566, /refund-policy 285 — every route measured fresh on
  BOTH sides, every count equal to the S59 record.
- **The 404 16=16** (the live's SPA 200/16-words v the clone's honest
  404/16-words — the registered status family).
- **The sitemaps 8/7** (the clone's /thank-you superset entry).
- **The soft-404 family at the registered statuses** (the live all-200
  SPA; the clone /demo 200-superset, /dashboard 307-auth, the casings
  308-canonical).
- **The D160 mobile-nav record EXACT — NO Tailwind v4 bug**: the
  clone's burger clickable at ALL THREE y-points (21/28/35 — measured
  in vivo, no blocker element), the 7 rows × 44px pinned GREEN by the
  baseline mobile-navigation spec (the 5 links + the Log In button +
  the Get Started link); the live's burger blocked by its fixed
  z-[100] toaster container (the registered D124/D160 live-side
  blocker family).
- **The live login records** (24 words; the borderless trio's computed
  rgb(229,231,235) at border-width 0 — the D131 inert record
  re-measured on the live in vivo this session).
- **The clone login → the working dashboard (233 words)**.

## F2 — THE 34TH SURFACE'S ROUTE EXTENSIONS: both verified

- **P1 — the second-interpolation-input cross-check: HOLDS.** Under a
  49-char email (a different interpolation input than S59's probe),
  the typed text's fills census `.0351,.0351,.0429` ×2 on BOTH sides
  (the live's hsl(240 10% 3.9%) floats) and all 15 distinct fills
  identical — zero live-only, zero clone-only. The pin-your-own-input
  law confirmed at the color layer: the S59 convergence is
  input-invariant.
- **P2 — the 3 remaining literal-violet rules: MEASURED, ONE REAL
  DIVERGENCE FAMILY.** The live's served CSS fetched and
  rule-extracted:
  - the live's universal rule is `* { border-color: hsl(var(--border));
    outline-color: hsl(var(--ring) / .5) }` with `:root { --ring: 290
    100% 50% }` — the outline tint consumes the RING COMPONENT VAR
    (the float carrier, R = 212.5/255 at runtime); the clone's
    `outline-color: rgb(213 0 255 / 0.5)` is the 8-bit literal
    (213/255) — the LAST unconverted member of the D205/D206
    token-syntax family;
  - the live's `@keyframes pulse-glow {0%,to{opacity:.4} 50%{opacity:.8}}`
    + `.animate-pulse-glow{animation:pulse-glow 4s ease-in-out
    infinite}` — opacity-ONLY, NO box-shadow, 4s; the clone's copy
    carries INVENTED box-shadows (the two `rgb(213 0 255 / …)`
    literals) + opacity 1/.6 + a 2.4s duration. INERT (no consumers in
    either tree — verified: zero `.animate-pulse-glow` elements in the
    live DOM; the session39 note already records the clone's copy as
    defined-but-unused) — a css-text-layer convergence.

## F3 — THE THIRTY-FIFTH SURFACE: the /Shading PATTERN-interior VALUE layer at FULL PARITY

The D205 family's shading counterpart — the first candidate the
var-indirection law makes measurable — censused at the pattern-dict
granularity (ShadingType / Coords / the /Function C0/C1 endpoint values
at the PDF's own float serialization) on the gradient-richest
deterministic routes, both sides, same print inputs:

- **/login: 3 v 3 patterns, FULL INTERIOR PARITY** (every endpoint
  value identical).
- **/faq: 0 v 0 — the empty set.**
- **the landing: the live's 14 patterns vs the clone's 10 — every
  DISTINCT interior shape shared** (all C0/C1/Coords values identical);
  the count delta is the registered animation-band engine family
  (count-only, the values converge).

**REGISTERED: the 35th surface at full value parity — the S59 token
convergence carried the shading layer; no fix required.**

## F4 — THE TDD FIX (the literal-rule convergence, RED → BUILD → GREEN)

- **RED**: `tests/e2e/session60-literalrule-laws.spec.ts` pinning the
  converged truth — the @theme `--ring: 290 100% 50%` component var;
  the `*` rule's outline half consuming `hsl(var(--ring) / 0.5)`;
  the BUILT css surviving unresolved (the var-indirection law's
  verification at the outline seam); the pulse-glow keyframe at the
  live's exact body (opacity .4/.8, NO box-shadow, the 4s duration in
  both the @animate token and the class); the D212 ring guard's
  updated pin (the login-local `:root { --ring: 240 10% 3.9% }` +
  the computed slate-950 ring unchanged); the not-fix guards (the
  border half KEEPS `var(--color-border)` — the D211/D131 adjudication:
  the live's login --border cascade is a multi-defined zinc/gray/dark
  !important soup whose value never paints; the clone's equivalent
  consumption is 8-bit-transparent and inert, and the D131 login-local
  `--color-border: #e5e7eb` pin mechanism depends on it).
- **BUILD**: `src/app/globals.css` — the @theme `--ring` component
  var; the `*` rule's outline half; the pulse-glow convergence (the
  two box-shadow literals REMOVED, the opacity values + duration
  converged to the live's exact text).
- **GREEN**: stable ×3 + the full gate.

## F5 — THE D135 HOVER-INSTRUMENT HARDENING (test-only, the S40 precedent)

The chunk-context flake root-caused: the poll's
two-consecutive-EQUAL early-return locks the PRE-hover white when the
hover state lags the first samples (the race the S40 hardening's 150ms
head start narrowed but did not close — the flake reproduces only in
the 4-file chunk order after the session33 concurrency load, 3 failures
in 5 in-context runs, 0 in 5 standalone). The hardening (all THREE
D135-family tests — the login bg pin + the 404 twin + the border
sibling): the locator-based `hover()` (re-resolves the element + moves
to its CURRENT center — also closes the stale-point/layout-shift
mechanism) + the changed-then-stable poll (wait for the value to LEAVE
the initial pre-hover read up to the cap, then require the stable
pair). RED demonstrated in the failing chunk order, GREEN after, ×3.

## F6 — THE FULL GATE

lint → typecheck → unit (252 + the session60 unit pins if any) →
build → smoke → e2e **505** (the +5 session60 spec), the file-set diff
against the global `--list` EMPTY (the runner list APPENDED per gotcha
66c/67).

## F7 — THE SCREENSHOTS + THE DOCS

The 21-screenshot set re-captured (the ported capture driver on :3500
against a scratch `db/capture60.db` — the dev DB canonical before AND
after, zero mutations); `.env.example` verified current (it IS the
source this session's `.env` was created from — the working
first-run story proven end-to-end on the fresh clone). PAD (the S60
revision block + the ledger D213+ + the 7.1 counts), AGENTS (the
counts + gotcha 70 — the sandbox DATABASE_URL gotcha + the D135
hardening law), CLAUDE (the session-60 context), README (the counts +
the session60 suite row), SKILL (lesson 99), the remediation plan (this
file), the session log 129, the worklog.

## The pushed-hash record (the closing discipline)

- The remediation commit **bc75686** (27 files: the session60 spec +
  the src/app/globals.css literal-rule convergence + the
  session36-interaction-parity D135 hardening + the docs alignment
  [PAD/AGENTS/CLAUDE/README/SKILL v2.59.0] + the 15 refreshed
  screenshots + scripts/run-e2e-chunks-s60.sh + the session log 129 +
  this plan + the worklog) — **PUSHED AND WRAPPER-VERIFIED**: the push
  ran `4747964..bc75686 HEAD -> main` through the wrapper v3.1 (the
  paramiko 5.0.0 shim on PATH — `/home/z/my-project/bin/ssh`,
  re-extracted from the skill's Appendix A after the workspace reset),
  and the wrapper's own verification gate returned **remote
  refs/heads/main @ bc75686 == local HEAD** with exit 0, the
  remote-tracking ref synced (git status agreeing, no "ahead"
  residue).
- The operator key's fingerprint was verified through paramiko's own
  key parse BEFORE the push and matched the S1-S59 record exactly
  (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — the clean
  first materialization, no transcription catch this session); the
  wrapper's temp key copy shredded per its lifecycle; the operator's
  key file destroyed after the final closing push (the closing
  discipline).
- Zero zombies at close (the port-sweep discipline held through every
  probe/render/capture/e2e run — :3000/:3100/:3400/:3500 all swept
  clean and re-verified at the closing commit); the scratch DBs
  removed (recon60/capture60); the tree clean before the closing
  commit; no new branches.

## The S61 candidates

- The SEVENTEENTH standing watch (the records now include the 35th
  surface's shading-interior column).
- The 36th surface: the pdftohtml -xml READING-ORDER layer (the
  column-assignment + the per-word font family census at the word
  level); or the /ExtGState-adjacent transfer-mode interiors; or the
  animation-band value layer under a pinned-frame contract (the
  14v10 count family's value-level counterpart).
- The remaining css-text mirror families (the login bundle's
  `--border` cascade adjudication documented in F4's not-fix guards).
