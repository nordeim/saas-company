# Remediation Plan — Session 61

The worklog S60 candidates (the SEVENTEENTH standing watch with the 35th
surface's shading-interior column; the 36th surface — the pdftohtml -xml
reading-order layer as the recorded first candidate; or the remaining
css-text mirror families), answered against the measured codebase — with
the best-judgment scope: the watch + the D160 mobile-nav re-verification
(the kickoff's explicit watch item) + **THE THIRTY-SIXTH SURFACE** measured
on its first honest two-sided capture — at FULL PARITY, requiring NO src/
fix; the session's deliverable the measurement itself + the gate pins
(the session61 suite +6, TDD-verified ×4) + the instrument hardenings.

## The environment (the SECOND consecutive fresh-clone session)

The workspace was reset at the boundary again — a fresh `git clone` (the
tree at `5ebad7e`, the S60 closing state: session_129 + session_130 + the
remediation plan 60 + the worklog all present), node_modules reinstalled
(`npm ci`, 430 packages — the prisma postinstalls blocked by npm's
install-scripts gate, `npx prisma generate` run explicitly), the Playwright
Chromium v1243 binaries re-downloaded, `.env` re-created from `.env.example`,
the DB re-pushed + re-seeded IN-REPO at 1/6/2 (the gotcha-70a discipline —
every DB-touching command pinned `DATABASE_URL="file:../db/custom.db"` per
command; the seed target verified in-repo). The push stack rebuilt: paramiko
5.0.0 into the venv + the ssh shim re-extracted from the runbook's Appendix
A to `/home/z/my-project/bin/ssh`.

## F1 — THE BASELINE (the full rebuild gate)

lint ✓ typecheck ✓ unit 252/252 ✓ build ✓ smoke 125/125 ✓ e2e 500+6=506/506
in 69 files through the committed s60 chunk runner (the file-set
reconciliation EMPTY, 69/69). Two in-flight flakes, both adjudicated
against the registered families: the palette-parity focus-ring family
(chunk 4, clean on re-run — the registered environment family) and the
session38 font-stack family (chunk 11, clean on the third attempt +
standalone 5/5 — the S58/S60-registered chunk-context family).

## F2 — THE SEVENTEENTH STANDING WATCH: ALL RECORDS HOLD

The fresh two-sided capture (the live at `saas-company.base44.app` + the
clone standalone on :3400 against a scratch `db/recon61.db`):

- **The working eight at byte-identical word parity** — / 739, /login 24,
  /faq 101, /thank-you 36, /privacy 335, /terms 390, /accessibility 566,
  /refund-policy 285 — every route measured fresh on BOTH sides.
- **The 404 16=16** (the live's SPA 200/16-words v the clone's honest
  404/16-words); **the sitemaps 8/7** (the /thank-you superset entry); the
  soft-404 family at the registered statuses (the live all-200; the clone
  /demo 200-superset, /dashboard 307-auth, /LOGIN 308-canonical).
- **The live login records** — the D131 trio re-measured in vivo: the
  Sign in / Forgot password? / "Need an account? Sign up" borderless trio
  computes rgb(229,231,235) at border-width 0 (the session's one
  instrument catch: the third element is ONE button whose full text is
  "Need an account? Sign up" — an exact-string match missed it; the
  prefix match is the honest selector).
- **The clone login → the working dashboard (233 words).**

## F3 — THE D160 MOBILE-NAV RECORD: EXACT, NO TAILWIND v4 BUG (the kickoff's watch item)

Two-sided at 390×844 (elementFromPoint at the burger's three y-points +
real clicks + the row census):

- **The clone**: the burger clickable at ALL THREE y-points (21%/50%/79%
  — the hit resolves to the burger's own svg path every time), every
  click OPENS the menu, and the rows are the canonical **7 × 44px** set
  (Features, How It Works, Pricing, Testimonials, FAQ, Log In, Get
  Started). The baseline e2e's mobile-navigation suite (14 checks incl.
  the burger swap, Escape close, the md transition) all GREEN.
- **The live**: the burger blocked at y21/y28 by its own dormant toaster
  container (`div.fixed.top-0.z-[100]` — the registered D124/D160
  live-side blocker family); only the y35 sliver reaches the burger, and
  even that click opens nothing (no scroll lock, no panel, no
  aria-expanded — the live's degraded affordance, unchanged).

## F4 — THE THIRTY-SIXTH SURFACE: the pdftohtml -xml reading-order layer at FULL PARITY (D217)

The recorded first S61 candidate, measured on its first honest two-sided
capture (20 PDFs: 10 routes × both sides, identical print inputs per the
pin-your-own-input law — `s52-pin@test.local`; then the 3 login
alternates, both sides — the 13-state census). Three censuses per state:

- **(A) the per-word FONT census** — every `<text>` element's fontspec
  (family|size|color, the subset prefix stripped) counted;
- **(B) the READING-ORDER sequence** — poppler's own layout ordering of
  the words (a SECOND engine's read of the text the S58/D198 line layer
  pinned through the qpdf token stream);
- **(C) the COLUMN assignment** — per 4pt line-bucket the sorted
  x-origins.

**The verdict: FULL PARITY on 12 of 13 states** — login 11v11, typed
11v11, reset 6v6, signup 8v8, error 12v12, faq 33v33, thank-you 3v3,
privacy 46v46, terms 49v49, accessibility 81v81, refund-policy 44v44,
landing 43v43 — every one EQUAL on all three censuses (the landing held
at both the 4s recon dwell and the 800ms e2e dwell — the census is
entrance-invariant at this granularity). **The 404 (7v7)**: the font
census EQUAL; the reading-order + column delta at exactly ONE word — the
live's third word carries a trailing space ("The page ") the clone's does
not, shifting the next word's x-origin by 4pt — **the REGISTERED 404
2-space-glyph emission family** (S47/S58), word count identical.

The embedded-font cross-check on the same PDFs re-verified the S49
records exactly: faq 7× VendSans-Light, 404 5×, thank-you 4×, landing
10× — identical subsets both sides; /login the registered DejaVu
system-stack (2× + Bold 1×).

**REGISTERED (D217, law-quality): the 36th surface at full reading-order
parity — the S58 line layer + the S49 font layer + the S61 word layer
all converge; no fix required.**

## F5 — THE TDD PINS (the session61 suite, no src/ fix to drive RED)

`tests/e2e/session61-readingorder-laws.spec.ts` — 6 tests pinning the
clone side of the measured parity: D217a the login family's five-state
censuses (11/11/6/8/12 + the exact font censuses incl. the typed #08080a
and error #b91b1b entries); D217b the six content routes (33/3/46/49/81/
44 + censuses); D217c the 404's census + the REGISTERED trailing-space
guard (the clone's "The page" without the space, the 4pt-shifted
following origin — pinned at the spec-route's own values 209/481); D217d
the landing's 43-word census at the 800ms dwell; D217e the faq's full
33-entry reading-order sequence (poppler's ordering verbatim); D217f the
login-typed sequence (the interpolation-input law at the reading-order
layer). GREEN 6/6 stable across FOUR runs; lint + typecheck clean (two
in-flight instrument catches: the numeric test-timeout third arg is not
a valid TestDetails in this Playwright — the house `test.setTimeout()`
in-body form; and the write-layer quote-sandwich mangling of `'"'` in
the entity decoder — the fromCharCode constant).

## F6 — THE FULL GATE: 883 → 889 (252 + 125 + 512)

lint ✓ typecheck ✓ unit 252/252 ✓ build ✓ (unchanged src/) smoke
125/125 ✓ e2e **512/512** in **70 files** through the new
`scripts/run-e2e-chunks-s61.sh` (the s60 list verbatim + the session61
spec appended as its own chunk per gotcha 66c/67; the file-set diff
against the global `--list` EMPTY, 70/70). In-flight flakes adjudicated:
the chunk-4 ring family (clean on re-run) + the chunk-11 font-stack
family (clean on the third attempt, standalone 5/5 — both registered).

## F7 — THE SCREENSHOTS + THE VLM

21/21 re-captured (the capture driver on :3500 against a scratch
`db/capture61.db` — the dev DB canonical before AND after, md5
`e22829c2c39d151da61a8103a136cd64`, zero mutations; the port swept incl.
the next-server CHILD process — the sweep hardening this session). **VLM
8/8 — ZERO ADJUDICATIONS (the fourth consecutive)**: the hero h1, the
Free/Pro/Enterprise tiers with Pro most-popular, the login copy, the
dashboard's metrics + rows, the mobile menu's 7-row set, the FAQ's 5
questions, the demo form, the 404 shell.

## F8 — THE DOCUMENTATION

PAD (the D217 ledger row + the 7.1 counts 70 specs/512 + the S61
revision block), AGENTS (the counts + gotcha 71 — the write-layer quote
mangling + the next-server child sweep), CLAUDE (the session-61
context), README (the 889 badge + the session61 suite row), SKILL
v2.60.0 (lesson 100), the remediation plan (this file), the session log
131, the worklog.

## The S62 candidates

- The EIGHTEENTH standing watch (the records now include the 36th
  surface's reading-order column).
- The 37th surface: the /ExtGState-adjacent transfer-mode interiors; or
  the animation-band value layer under a pinned-frame contract (the
  14v10 count family's value-level counterpart); or the remaining
  css-text mirror families (the login bundle's --border cascade
  adjudication documented in the S60 not-fix guards).
