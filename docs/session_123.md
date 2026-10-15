# Session 123 (the Session-57 remediation cycle) — 2026-10-16

A CONTINUITY session — the workspace survived the inter-session
boundary for the first time in four cycles (the tree clean at
`1c68e1a`, a fast-forward pull adding only the operator's raw S56
transcript `docs/session_122.md`; node_modules, the Chromium v1243
binaries, `.env`, the canonical dev DB 1/6/2, and the paramiko +
ssh-shim infrastructure all intact — no rebuild needed). The
baseline verified: unit 252/252, the session56 spec 6/6, the full
e2e `--list` 472 in 65 files (pre-S57), lint/typecheck clean.

F0 — THE THIRTEENTH STANDING WATCH (research/recon-s57-ph1.mjs on
:3400 against the fresh db/recon57.db): **14/14 GREEN — ALL RECORDS
HOLD**. The working eight at BYTE-IDENTICAL word parity
(739/24/101/36/335/390/566/285), the 404 route 16=16, the sitemaps
clone 8 / live 7, the soft-404 family at the registered statuses
(/pricing 404/200; /checkout 404/200; /dashboard 307/200; /demo
200/200), the D160 mobile-nav record EXACT (the clone's burger open
at ALL THREE y points — the 390x397 panel, 7 rows; the live
toaster-blocked y21/y28 + y35-only; NO Tailwind v4 bug), the live
login records holding (the operator credentials -> / at 739 words;
/dashboard the 16-word SPA-404), the clone login -> the working
dashboard (233 words, h1 "Dashboard").

F1 — THE SURFACE SELECTION (research/recon-s57-ph2-probe.mjs, the
lesson-88 discipline — the S56 worklog's THIRTY-SECOND-surface trio
probed on the raw shape FIRST; the route-extension candidates
verified already-pinned by the committed S56 spec): (a) the image
STREAM interiors measured RICH — /login's 6 payload streams
BYTE-IDENTICAL across sides (same sha256s, same object numbers) on
the first honest render; (b) the q/Q graphics-state stack measured
balanced everywhere (THIN as a surface, registered as a LAW); (c)
the /Annots-dict interiors measured RICH (the rects byte-precise,
the values identical modulo the page-object allocation + the URI
origin). FOUR INSTRUMENT CATCHES in flight, each root-caused as the
instrument before any code conclusion: (i) the `--binary-data`
syntax does not exist in qpdf 12 — the first probe's "payload-sha
equality: true" on /login was MATCHING ERROR STRINGS (a false
positive from identically-failed extractions); the corrected
instrument reads the filtered stream from STDOUT as a Buffer; (ii)
the qpdf-JSON stream `data` is BASE64 for binary streams — the
first q/Q read showed ZERO operators until the payload was decoded
(with the disambiguation: a plain-ASCII content stream is also
base64-alphabet-clean — test for PDF operators before and after
decoding); (iii) the qpdf JSON serializes strings with the `u:`
type prefix (`u:http://...`) — the /Annots origin-normalization
regex anchored on `^https?` never fired, producing phantom DIFFs;
(iv) `--show-object N` (space form) is rejected — the `=` form is
required.

F2 — THE LANDING STABILITY PROBE
(research/probe-landing-stability-s57.mjs — 3 fresh renders per
side): the payload decomposition. The STABLE-SHARED CORE
byte-identical across sides on every render (the 1165x103 pair +
the 541x160 + 625x245 DCTs + the 201x201/2025x534 Gray masks); the
CLONE-STABLE INTERSECTING family (the 626x204 + 710x288 DCTs —
stable on every clone render, frame-dependent on the live, the
clone's stable sha appearing in the live's set); the VIDEO-FRAME
family frame-dependent on BOTH sides with INTERSECTING sha sets
(the 1920x1080 poster + the 1047x105 pair + the 201x201/2025x534
RGB payloads — the same 8s hero video captured at different times:
de39ffca + 77a75b89 both observed on both sides); the 201x1 pair
frame-dependent on BOTH sides (0-of-3 clone / 2-of-3 live this
session vs the S56 record's 2-of-3 clone — the prior clone-only
reading CORRECTED); the CLONE-ONLY form-nested slivers
(1x26/738x1/738x26) with STABLE payload shas — the S56 registered
superset now pinned at the byte level.

F3 — THE FULL RECON (research/recon-s57.mjs — one boot-work-kill
unit, the public states on the clean context first, the
authenticated dashboard last): **THE THIRTY-SECOND SURFACE at FULL
BYTE PARITY on every deterministic route** — /login 6 streams (the
4 DCTs + the 754x676 RGB/Gray SMask pair) byte-identical with the
same object numbers (14/5/24/28/20/21) across sides; the six
content routes + the 404 + /demo the empty-set family; ALL FIVE
/login alternates byte-identical (default/error the 6-stream set,
reset 1, signup/forgot 2). **THE /ANNOTS VALUE LAYER at exact
parity on every public route** (landing 69, /faq 14, /thank-you 1,
privacy/terms/refund 14, /accessibility 16, /login + the 404 empty;
/demo the 14/0 registered superset floor) under the pg-dropped +
origin-normalized contract. **THE Q/Q LAW**: balanced on every page
content stream (endDepth 0, maxDepth <= 2) with the content-route
ENGINE-FAMILY deltas registered (the clone's page streams carry
+4/+2/+6/+4 q-pairs on privacy/terms/accessibility/refund — 70/66,
68/66, 86/80, 70/66, stable per side, verified 3x; the landing's
animated 189/190 band + the forms stream-count delta 54/57; /demo
the 96/7 superset floor). ONE RECON INSTRUMENT CATCH: the
determinism re-render of /login ran on the authenticated context —
/login redirected to /dashboard and render B measured the
dashboard's images; the fix is the fresh-context law (every
determinism re-render on a CLEAN context).

F4 — THE TDD PINS (tests/e2e/session57-payload-annots-qq.spec.ts —
the constants GENERATED by research/gen-s57-spec-constants.js from
the recon's pin file + the stability probe, the zero-transcription
discipline): **10/10 GREEN, stable across THREE runs**. ONE
IN-FLIGHT CATCH: the landing test's first run failed on a
KEY-FORMAT mismatch — the stability probe's keys are dims-only
(`1165x103`) while the census keys carry the filter suffix
(`1165x103:none`); the fix normalizes by stripping the suffix (the
e2e-server probe confirmed the sha present — the mismatch was the
instrument, not the code).

F5 — THE BATTERY EXTENDED (research/drift-battery-s57.mjs +
drift-battery-s57b.mjs — the S56 battery ported + PHASE 7: the
payload + qq + annots columns on part A's CACHED renders):
**234/234 GREEN ZERO DRIFT** across seven phases (the standing
watch 16 + the poppler print layers 40 + the structural/resource
layers 27 + the interior layers 33 + the S55 columns 30 + the S56
columns 48 + the S57 columns 33 + the dashboard 7) — the battery
now running THIRTY-TWO surfaces. One battery refinement: the S56
landing image-interior check's live-core subset now EXCLUDES the
201x1 frame family (the S57 both-sides correction — the check
caught the frame-dependent emission in flight, root-caused through
the stability probe's records).

F6 — THE FULL GATE + **THE TRANSCRIPTION-INJECTION CATCH (gotcha
67, a near-miss root-caused before any record was committed)**: the
new S57 chunk runner's reconciliation (copied from the S56 runner
with the session57 spec ADDED per gotcha 66c) summed 472 while the
global `--list` said 482 — correctly diagnosed as the
not-yet-added session57 spec and fixed. The follow-up FILE-SET diff
showed `session38-logo-petels` vs `session38-logo-petals` —
initially misread as "the committed S53-S56 runners carry the
petals typo; the S54 fix never landed; 10 tests never ran; the S56
badge over-counted," and a full correction narrative was drafted
into the docs. ROOT-CAUSED AS FALSE before the commit: the diff's
runner side was built from a chunk list RE-TYPED INTO THE
RECONCILIATION COMMAND — the typo was injected by the instrument
itself. The committed runners verified correct by hexdump of the
actual files + `git show HEAD:` + the "fix" sed proving a no-op
(git: the runners unmodified); the S56 gate's 849 = 252 + 125 +
472 stands in full; the docs reverted to the honest record. THE
LAW: a reconciliation must expand the artifact's OWN file list
(parse the script's CHUCKS array), never a re-typed transcription —
the instrument can inject exactly the defect it claims to find. The
final gate reconciled at BOTH the count (482/482) and the file-set
level (the diff empty). An environment oddity in flight:
long-running commands left orphaned/mirrored runner processes
racing on the shared tally file — neutralized through fresh tallies
per batch + per-batch output-captured arithmetic + one playwright
invocation per command for the final chunk. Gate: **859 = 252 unit
+ 125 smoke + 482 e2e** (lint ✓ typecheck ✓ build ✓; the +10 over
the S56 gate is the session57 spec's own ten e2e checks).

F7 — THE SCREENSHOTS + VLM: 21/21 captured (the capture server on
:3500 against db/capture57.db; the dev DB canonical before AND
after — 1/6/2, zero mutations). The VLM standing checks 6/8
first-pass + 2 ADJUDICATED BY EVIDENCE (both the known
prompt-enumeration families from S56: the hero's below-fold logo
strip — the video contract is pinned and the payload surface just
measured the poster stream — and the login copy "Welcome to SAAS
Company" per the byte-identical 24/24 word parity) — VLM effectively
8/8.

F8 — THE DOCS: README (the 859 badge + the 32nd-surface story + the
session57 suite row + the counts), PAD (the S57 revision block + the
ledger D195/D196/D197 + the 7.1 counts 66 specs/482), AGENTS (the
counts + gotcha 67), CLAUDE (the session-57 context), SKILL v2.56.0
(lesson 96 + the §12 header range), the remediation plan session57,
this session log, the worklog; `.env.example` verified in sync (no
config surface touched). The F6 near-miss's false narrative fully
reverted from every doc BEFORE the commit (the transcription-
injection law recorded in its place).
