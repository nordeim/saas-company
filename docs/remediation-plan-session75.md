# Remediation Plan — Session 75

The worklog S74 candidates (the THIRTY-FIRST standing watch now carrying
the 49th surface's descriptor columns; the 50th surface — the /ToUnicode
CMap interiors, the nested IMAGE-XObject interiors, or the /Decode-array
color-space layer), answered against the measured codebase — with the
best-judgment scope: the watch (now carrying the D230 descriptor columns)
+ the D160 mobile-nav re-verification (the kickoff's explicit watch item)
+ **THE FIFTIETH SURFACE measured as THE /ToUnicode CMap INTERIORS — the
D230-registered presence-only sibling (every Type3 font's code-to-Unicode
CMap stream + the /CIDToGIDMap identity family), measured at FULL BYTE
PARITY ACROSS SIDES** with NO src/ fix, plus the all-ten -1 numbering
law and the ligature law registered.

## The environment (the FRESH-CLONE REBUILD — the tenth)

The workspace did NOT survive the boundary: the repo re-cloned at
`3368015` (main, clean). The full rebuild per the gotcha-70a
pin-per-command discipline: `npm install` 430 packages, `.env` from
`.env.example` (DATABASE_URL=file:../db/custom.db), the dev DB pushed +
seeded IN-REPO (1 user / 6 workflows / 2 subscribers, seed-checksum
`e7f6c011` — the canonical content markers; the file md5 `d055fe1e`
this seed's own timestamp artifact, tracked for the session's
zero-mutation discipline), the Chromium v1243 binaries (already cached),
paramiko 5.1.0 (installed --break-system-packages), the ssh shim
re-extracted to `/home/z/my-project/bin/ssh`. **The gotcha-70a pin
applied proactively from the first DB command this run** (the sandbox's
pre-set out-of-repo absolute `DATABASE_URL=file:/home/z/my-project/db/
custom.db` confirmed live, then bypassed per command — NO out-of-repo
artifact was ever created).

## F1 — THE BASELINE (clean)

lint ✓ typecheck ✓ unit 252/252 ✓ build ✓ smoke 125/125 ✓ e2e
**565/565 in 83 files** through the committed s74 chunk runner (the
gate run in foreground batches per the gotcha-63 reaper law; the resume
arithmetic clean: 311@11 -> resume 12 -> 440@16 -> resume 17 -> 521@23
-> resume 24 -> 565@34, zero overlap, zero reconciliation).

## F2 — THE AUDIT (clean)

The two commits since the S74 remediation (`c652815` the S74 closing +
`3368015` the operator's `update session log` creating
`docs/session_158.md`) — docs-only, **zero src/ since S60** (the streak
holds; S75 the FIFTEENTH consecutive). npm-audit = the documented F10
`braces` residual (the eslint-config-next chain; the "fix" a breaking
downgrade). The `skills/` folder excluded from all
checking/testing/compilation (eslint ignores + tsconfig exclude +
dockerignore verified).

## F3 — THE THIRTY-FIRST STANDING WATCH: ALL RECORDS HOLD (with the D230 descriptor columns)

The instruments REBUILT FROM SCRATCH on the fresh clone (both sides
measured fresh: the live at `saas-company.base44.app` + the clone
standalone on :3400 against the scratch `db/recon75.db`, seed-checksum
`e7f6c011`):

**PHASE A (the DOM columns) 6/6 GREEN both sides** — the working eight
at word parity (739/24/101/36/335/390/566/285 per-route EQUAL), the 404
16=16, the sitemaps 8/7 (the clone's 8 = the live's 7 + the /demo
superset, origin-agnostic), the raw-status family (the clone's
200/308/308/404; the live's 200s — through non-following requests per
gotcha 71c), the D131/D133 pair (the login chip's bg-muted
rgb(244,244,245) both sides + the accessibility white/0.5 italic note —
the oklab/rgba spelling equivalence), the clone login → the working
dashboard (233 words) + the live's localStorage-token family
(token(735) + base44_access_token(735)).

**PHASE B/C (the print columns) — the clone 24/24 GREEN + the live
24/24 GREEN — THE SEVENTH CONSECUTIVE FULLY-GREEN TWO-SIDED PRINT
WATCH**: the pinned constants (clone 33/22/11 {21N+1S} @1700 + 32/21
@1000; live 34/21/13 T-INVARIANT), the census-level determinism ×2 both
sides, the SMask kinds (clone {L:8, None:1, A:2}; live {L:10, None:1,
A:2}), the shading census (clone 10 = {1:4, 2:6}; live 14 = {1:6, 2:8}),
the scn token columns (clone 7 form + 4 tiling; live 8 + 6), the Do
columns (clone 24 = 19+5 T-invariant; live 19 form STABLE + the totals
20 in the registered 20-21 jitter range), the gs columns (clone 132 =
124+8 both frames; live 123+7 = 130, in the registered 130-131 range),
the transfer routes (login 9× /Normal, faq 12× /Normal), the landing
print word census (251 = 251) + the D225 G-stream columns GREEN (the
census 10={8L+2A} v 12; the clone's last-four -1 @1000) + the D226
tiling columns GREEN (the census 6={4+2} + the ONE /Matrix carrier
[147] v the live 7+0; the held pair 13/19) + the D227 function-body
columns GREEN (the census 5 v 7 — the live's dedup pair 179/185 sharing
the 246-byte body) + the D228 glyph-stream columns GREEN (the site
census sig [22,9,56,29,52,25,26,15,29,15], 278 streams, 228846 bytes
BOTH SIDES) + the D229 width+encoding columns GREEN (the signature,
the nonzero 278, the /g0 1662, the diffs 1940 — all IDENTICAL
cross-side) + **THE D230 DESCRIPTOR COLUMNS GREEN ON THEIR FIRST
CARRIED RUN** (the census [22,31,35,58,62,89,104,142,143,198] with the
clone's last-four -1 @1000; the weight signature [500,600,400,500,400,
600,700,500,400,600]; the StemV/XHeight metric maps; the A-J subset
family; the family 'u:Vend Sans Light' — ALL IDENTICAL cross-side).

**THE S75 INSTRUMENT CATCH (the print-browser-build law, registered as
SKILL lesson 114e)**: the first Phase B/C collection ran through the
python-playwright 1.57/chromium-1200 pair and produced prints MISSING
the never-intersected opacity-0 sections entirely (207 v 251 words, 17
duplicate font subsets, the ca=0/ca=0.02 gs slots absent) — the
pinned-frame print contract is BROWSER-BUILD-SPECIFIC. The durable form:
collect prints through the REPO's own playwright (v1.63.0/chromium
v1243, a Node collector) — never a foreign browser build. Two further
analyzer catches fixed honestly (the dictOf plain-dict fallback for
qpdf's nested inline dicts; the G-stream census's ref-string SMask
handling + the inverted form-skip logic).

## F4 — THE D160 MOBILE-NAV RECORD: the clone EXACT, NO TAILWIND v4 BUG (the kickoff's watch item)

Two-sided at 390×844, raw mouse clicks at the burger's x-center (354)
at the EXACT registered y-points (y21/y28/y35), the honest side-aware
forms built in from the start (the S71-S74 durable instrument):
**the clone's at-point element is the burger's OWN SVG PATH at ALL
THREE y-points (the burger button at the identical 342/16/24×24
geometry); every raw click opening the canonical 7 rows × 44px**
(Features, How It Works, Pricing, Testimonials, FAQ, Log In, Get
Started — the reference order; the Close-menu swap with
aria-expanded=true; every row at exactly 44px) — the kickoff's
Tailwind v4 concern GREEN for the **TWELFTH consecutive session**.
**THE LIVE: the blocked-blocked-healed family HOLDING** — y21/y28
toaster-blocked (the at-point element the `fixed top-0 z-[100]` toast
container overlaying the top 32px; the live's burger the no-aria-label
`button.md:hidden` family) + **y35 OPENING the 7-row menu at 44px**
through the honest row-visibility form (the live has no #mobile-menu;
its menu verified through the visible-rows probe — the 7 reference
labels at y=72..392 every row exactly 44px, the panel
`md:hidden bg-black/95 backdrop-blur-xl` at h=397). ZERO instrument
catches.

## F5 — THE FIFTIETH SURFACE: THE /ToUnicode CMap INTERIORS (D231)

The candidate probe (the gotcha-64e/65a discipline, all three S74
candidates probed on the raw shape first): P1 the /ToUnicode CMaps RICH
(10 streams both sides, identical length censuses); P2 the nested
IMAGE-XObjects the registered D125/S56/S57 family (18 v 13 — already
measured); P3 the /Decode + ICC layer the registered empty-set laws
(0 decode arrays, 1 ICC profile both sides). **The 50th surface = D231
measured on the first two-sided pinned-frame walk (both sides at
T=1700 + T=1000, every CMap stream decoded BY VALUE) — 6/6 verdict
groups GREEN at law quality:**

- **(a) THE SITE CENSUS** — 10 CMaps both sides (one per Type3 font) +
  the /CIDToGIDMap /Identity family; the CMap object numbers clone
  [249,260,318,349,403,430,458,475,506,523] v live [254,265,323,354,
  408,435,463,480,511,528]; the byte-length census [559,416,840,624,
  798,590,581,501,605,476]; the bfchar [12,8,24,16,21,16,11,10,13,8]
  (sum 139) + bfrange [4,0,12,5,10,3,6,2,6,2] (sum 50) entry censuses.
- **(b) THE T-INVARIANCE + THE ALL-TEN -1 NUMBERING LAW** — every CMap
  byte-identical across frames on both sides (sha-verified); ALL TEN
  CMap object numbers shift by EXACTLY -1 @T=1000 (249->248 ..
  523->522) — every CMap allocated AFTER the vanishing ca230
  phase-slot object, the S68 contraction through the whole CMap range
  (the font-dict layer's last-four-only law contrasted: the
  numbering-law magnitude is an ALLOCATION-ORDER property); the live
  frame-stable (the per-load baseline family).
- **(c) THE CROSS-SIDE FULL-BYTE PARITY** — **ALL 10 CMap streams
  BYTE-IDENTICAL ACROSS SIDES** (sha256-verified position-paired:
  edbb7ec0/9d822d91/d5ccf5e9/83eb72ee/cdc0794f/4ccad127/99c43bd4/
  eebac7e2/21a429b1/19f1b7a3) — the fourth consecutive byte-parity
  layer of the 10-font family (D228 glyph streams -> D229 widths ->
  D230 descriptors -> D231 CMaps: the code-to-Unicode tables shared by
  both trees whole).
- **(d) THE STRUCTURE LAWS** — every CMap the uniform constants (the
  12-dict CIDInit prologue, Registry Adobe / Ordering UCS / Supplement
  0, CMapName /Adobe-Identity-UCS, CMapType 2, the single <00> <FF>
  codespacerange, the defineresource epilogue) + the expanded
  mapped-code census [21,8,55,28,51,24,25,14,28,14] (sum 268).
- **(e) THE VALUE LAWS** — exactly ONE multi-char Unicode target in
  the whole tree (font 62's `<79> <00660066>` — the "ff" ligature in
  its own SECOND bfchar block; the all-blocks census discipline); the
  union Unicode vocabulary 67 (the printable-ASCII family + U+00A9 (©)
  + U+2014 (—)); the 278-nonzero-width v 268-mapped-code delta (10
  glyphs with widths but no mapping — the non-text glyph family).

**NO src/ fix required** — the layer is at full byte parity.

## F6 — THE TDD PINS (the session75 suite, no src/ fix to drive RED)

`tests/e2e/session75-tounicode-laws.spec.ts` — 4 tests pinning the
clone side: D231a the site census (the font + CMap object numbers, the
length + entry censuses, the /Identity family); D231b the full-byte
T-invariance + the ALL-TEN -1 numbering law; D231c the uniform
structure constants + the mapped-code census; D231d the ligature law +
the union vocabulary + the width-mapping delta. **GREEN 4/4 ×3** (the
determinism discipline); lint + typecheck clean. **ZERO
pin-calibration catches** (the exact values extracted from the walk
output by construction).

## F7 — THE FULL GATE: 942 → 946 (252 + 125 + 569)

lint ✓ typecheck ✓ unit 252/252 ✓ build ✓ (unchanged src/ — the
FIFTEENTH consecutive zero-src/ session) smoke 125/125 ✓ e2e
**569/569** in **84 files** through the new
`scripts/run-e2e-chunks-s75.sh` (the s74 list verbatim + the session75
spec appended as its own chunk per gotcha 66c/67; the file-set diff
against the global inventory EMPTY, 84/84 through
`scripts/reconcile-s75.py`). **All 35 chunks GREEN, ZERO failures —
the fifth consecutive zero-flake gate.**

## F8 — THE SCREENSHOTS + THE VLM

21/21 re-captured (the capture driver on :3500 against
`db/capture75.db` — the dev DB canonical before AND after, md5
`d055fe1e` unchanged, zero mutations; the honest mechanisms carried:
the AUTH_RATE_LIMIT_MAX=50 server pin, the public states on clean
contexts FIRST + the authenticated states in their OWN contexts LAST
(gotcha 63b), the scroll pass for the full-page shot (lesson 3), the
Compose-click banner with the Workflow-idea fill first, the routed-GET
+ Pause-click BROKEN_ROW branded boundary) — all 21 dimensions exact
(1280×720 / 390×844 / the 7318px full-page). **VLM 8/8 ZERO
ADJUDICATIONS** (the seventh consecutive clean pass — the hero-CTA
question scoped to the hero section from the start: ONE hero CTA "Book
a Demo"; the mobile menu the canonical 6 link rows + the Get Started
pill below, evenly spaced, no clipping; the login "Welcome to SAAS
Company"; the FAQ all 5 collapsed; the dashboard's 4 stat cards; the
404 + Go Home; the branded "Something went wrong" boundary with Try
again; the thank-you "Payment Successful!").

## F9 — THE DOCUMENTATION

PAD (the S75 revision block + the D231 ledger row + the 7.1 counts 84
specs/569), AGENTS (the counts + the Session-75 gate prefix), CLAUDE
(the session-75 context + the checklist + stack-table refresh 252/569),
README (the 946 badge + the session75 suite row + the stale 859
overview count honestly corrected to 946), SKILL v2.74.0 (lesson 114 —
the CMap layer's byte parity, the all-ten -1 allocation-order law, the
ligature law with the all-blocks census discipline, the width-mapping
delta, the print-browser-build law), the remediation plan (this file),
the session log 159, the worklog — through the persisted surgical edit
scripts (research/doc-edits-s75-part1.py + part2.py, content-idempotent).

## The S76 candidates

- The THIRTY-SECOND standing watch (the records now include the 50th
  surface's CMap columns — the byte-length census, the entry censuses,
  the mapped-code census).
- The 51st surface: the nested IMAGE-XObject interiors (the tilings'
  placed /Image objects — the dict + /SMask + payload bytes, the
  corrected premise of the S71 nested-form candidate, partially
  measured at S56/S57 — the unmeasured remainder the placement-context
  layer); or the /Decode-array + color-space conversion layer at the
  image-object level (registered empty at the S56 laws — re-probe on
  fresh prints); or the PDF's /Metadata XMP layer at the stream-value
  level (the S55 empty-set law re-verified once more).

## The pushed-hash record (the closing discipline)

- The remediation commit **6866109** (26 files: the session75 spec +4 + the
  s75 chunk runner + the reconcile script + the docs alignment
  [PAD/AGENTS/CLAUDE/README/SKILL v2.74.0] + the 15 refreshed screenshots
  + the session log 159 + this plan + the worklog) — **PUSHED AND
  WRAPPER-VERIFIED**: the push ran `3368015..6866109 HEAD -> main` through
  the wrapper v3.1 (the paramiko 5.1.0 shim at /home/z/my-project/bin/ssh —
  the fresh-clone session's re-extracted shim, the `--remote
  git@github.com:nordeim/saas-company.git` override for the wrapper's
  task-management default), and the wrapper's own verification gate
  returned **remote refs/heads/main @ 6866109 == local HEAD** with exit
  0, the remote-tracking ref synced (git status agreeing, no "ahead"
  residue). ZERO push retries this session (the remote unmoved since the
  clone).
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU —
  the exact S1-S74 record); the wrapper's temp key copy shredded per its
  lifecycle; the operator's key file destroyed after the push (the
  closing discipline).
