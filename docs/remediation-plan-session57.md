# Remediation Plan — Session 57

The worklog S56 candidates (the reference-regression watch, the
THIRTEENTH; the 31st surface's route extensions — the /login
error-state's banner family, the 404's + /thank-you's print-image
floors; or the THIRTY-SECOND surface — the image STREAM interiors at
the byte level, the q/Q graphics-state stack depth, or the
/Annots-dict interiors at the value layer), answered against the
measured codebase — with the best-judgment scope: the
THIRTY-SECOND-surface trio ALL probed on the raw shape FIRST (the
lesson-88 discipline), the route-extension candidates verified
ALREADY-PINNED by the committed S56 spec (the alternates' 6/6/1/2/2
image interiors + the content routes' empty-set family — no re-probe
needed). **THE THIRTY-SECOND SURFACE selected: the image STREAM
PAYLOAD layer** — with the /Annots value layer measured as the second
column and the q/Q stack registered as a law. **A REGISTRATION
session** (the S45/S48-S56 pattern: pin, no build; ZERO src/ changes)
— The baseline is the Session-56 tree at `b2344a4` + the closing
pushes (`05ac5fa` + `1c68e1a`); the S56 gate 849 = 252 + 125 + 472
verified standing (see F7 — the transcription-injection near-miss).

## The environment (the CONTINUITY session — no rebuild needed)

- The workspace SURVIVED the inter-session boundary this cycle: the
  tree clean at `1c68e1a` (a fast-forward pull adding only
  `docs/session_122.md` — the operator's raw S56 transcript),
  node_modules intact, the Playwright Chromium v1243 binaries present,
  `.env` correct (`DATABASE_URL="file:../db/custom.db"`), the dev DB
  canonical at 1/6/2, paramiko 5.0.0 + the `/home/z/bin/ssh` shim in
  place. The baseline verified: unit 252/252, the session56 spec 6/6,
  the full e2e `--list` 472 in 65 files (pre-S57), lint/typecheck
  clean.

## The surface selection (research/recon-s57-ph2-probe.mjs — the
## raw-shape probes on FRESH renders, BEFORE any census was designed)

- **P1 — the image STREAM interiors: measured RICH — SELECTED as THE
  THIRTY-SECOND SURFACE.** The S56 layer measured the image DICTS
  (dims/colorspace/filter/smask); the PAYLOAD BYTES were never
  compared. The probe's first instrument catch: the sha equality read
  TRUE on /login as an artifact of MATCHING ERROR STRINGS (the
  `qpdf --show-object N --filtered-stream-data --binary-data` syntax
  does not exist in qpdf 12 — every extraction failed identically on
  both sides); the corrected instrument (`--show-object=N
  --filtered-stream-data` to STDOUT, captured as a Buffer) measured
  the honest shape: /login 6 streams BYTE-IDENTICAL across sides
  (same shas, same object numbers), the landing's DCT family +
  the 6.2MB video poster byte-identical in the first render.
- **P2 — the q/Q graphics-state stack: measured THIN — registered as
  A LAW.** Balanced q/Q on every page content stream (endDepth 0,
  maxDepth <= 2), the counts equal on login/faq/thank-you/404, with
  the content-route engine-family deltas (see F3). The first read
  showed ZERO q/Q everywhere — the second instrument catch: the
  qpdf-JSON stream `data` is BASE64 for binary streams (the tokens
  live inside the decoded payload; a plain-ASCII stream is also
  base64-alphabet-clean — the disambiguation tests for PDF operators
  before and after decoding).
- **P3 — the /Annots-dict interiors: measured RICH — folded in as
  THE SECOND COLUMN (D196).** The S48 23rd surface measured the
  pdftohtml link CENSUS; the raw annotation DICTS (the /Rect
  geometry, the /A action values, the /Dest named dests, the /F
  flags) were never compared. The first read showed DIFFs on every
  annots-bearing route — the third instrument catch: the qpdf JSON
  serializes strings with the `u:` type prefix (`u:http://...`), so
  the origin-normalization regex anchored on `^https?` never fired;
  with the `u:`-aware strip the rows are IDENTICAL (the rects
  byte-precise to 2dp across sides).
- **P4/P5 — the route-extension candidates: verified ALREADY-PINNED**
  (the committed S56 spec's alternates test covers the error state's
  image interior [6 images, same as default]; the stable-routes test
  covers the 404 + /demo + /thank-you image floors [the empty-set
  family]). No re-probe needed.

## The findings (F1-F8)

- **F1 — THE THIRTY-SECOND SURFACE AT FULL BYTE PARITY (D195)**: the
  image STREAM PAYLOAD layer — every deterministic route at FULL
  BYTE PARITY on the first honest fresh measurement: /login 6
  streams (the 1168x168 + 1765x2696 + 329x329 + 413x413 DCTs + the
  754x676 RGB/Gray SMask pair) with byte-identical sha256s AND the
  same object numbers (14/5/24/28/20/21) across sides; the six
  content routes + the 404 + /demo the empty-set family; ALL FIVE
  /login alternates byte-identical (default/error the full 6-stream
  set, reset 1, signup/forgot 2); determinism verified 2x (payload +
  qq + annots on /login, /faq, the dashboard).
- **F2 — THE LANDING'S PAYLOAD BUCKETS (the 3x-per-side stability
  probe)**: (a) the STABLE-SHARED CORE byte-identical — the 1165x103
  pair (dde0380a + efc09f9f), the 541x160 + 625x245 DCTs, the
  201x201 + 2025x534 Gray MASKS; (b) the CLONE-STABLE INTERSECTING
  family — the 626x204 + 710x288 DCTs stable on every clone render,
  frame-dependent on the live (the clone's stable sha appears in the
  live's set); (c) the VIDEO-FRAME family — the 1920x1080 poster +
  the 1047x105 pair + the 201x201/2025x534 RGB payloads
  frame-dependent on BOTH sides with INTERSECTING sha sets (the same
  8s video captured at different times: de39ffca + 77a75b89 both
  observed on both sides); (d) the 201x1 pair frame-dependent on
  BOTH sides (0-of-3 clone / 2-of-3 live this session vs 2-of-3
  clone in S56 — the S56 record's clone-only reading CORRECTED);
  (e) the CLONE-ONLY form-nested slivers 1x26/738x1/738x26 with
  STABLE payload shas — the S56 registered superset now pinned at
  the byte level.
- **F3 — THE Q/Q LAW (D197)**: the graphics-state stack balanced on
  every page content stream (q === Q, endDepth 0, maxDepth <= 2, both
  sides, every route) with the content-route ENGINE-FAMILY deltas
  registered — the clone's page streams carry +4/+2/+6/+4 q-pairs on
  privacy/terms/accessibility/refund (70/66, 68/66, 86/80, 70/66 —
  stable per side, measured 3x; the forms' records IDENTICAL on
  those routes), the landing's animated 189/190 band + the forms
  stream-count delta 54/57, the /demo 96/7 superset floor, and the
  exact-parity routes (login 4/4, faq 98/98, thank-you 9/9, the 404
  7/7).
- **F4 — THE /ANNOTS VALUE LAYER (D196)**: every annotation dict at
  the value level — the /Rect byte-precision (values identical to 2
  decimal places across sides), the /A action dicts (/S /URI,
  origin-normalized), the /Dest named destinations, the /F 4 flags,
  the /BS empty — under the pg-dropped (page-object allocation) +
  origin-normalized contract, at EXACT parity on every public route:
  landing 69, /faq 14, /thank-you 1, privacy/terms/refund 14,
  /accessibility 16, /login + the 404 the empty sets; /demo the
  14/0 registered superset floor (the live's 16-word shell carries
  no links — the S48 record); the dashboard (clone-only) 1 annot.
- **F5 — THE THIRTEENTH STANDING WATCH: ALL RECORDS HOLD** (the recon
  ph1, 14/14 GREEN): the working eight at byte-identical word parity
  (739/24/101/36/335/390/566/285), the 404 16=16, the sitemaps 8/7,
  the soft-404 family at the registered statuses, the D160
  mobile-nav record EXACT (the clone all-three-y open the 390x397
  panel, 7 rows — NO Tailwind v4 bug; the live toaster-blocked
  y21/y28 + y35-only), the live login records holding, the clone
  login -> the working dashboard (233 words).
- **F6 — THE INSTRUMENT CATCHES (four, each root-caused before any
  code conclusion)**: (a) the filtered-stream syntax (`--binary-data`
  does not exist in qpdf 12 — the data goes to STDOUT; the first
  probe's "payload-sha equality: true" was MATCHING ERROR STRINGS,
  a false positive); (b) the base64-stream-data law (the zero-q/Q
  first read); (c) the u:-prefix origin-normalization law (the
  annots "DIFF"s were the un-fired regex); (d) the fresh-context
  determinism law (the authenticated context's /login redirect made
  render B measure the dashboard's images — the context-order law
  extended to the determinism phase).
- **F7 — THE TRANSCRIPTION-INJECTION CATCH (gotcha 67, a near-miss
  root-caused before any record was committed)**: the new chunk
  runner's reconciliation (the count summed 472 vs the global
  `--list` 482 — correctly diagnosed as the not-yet-added session57
  spec, fixed by ADDING it to the last chunk per gotcha 66c) was
  followed by a file-set diff that showed `session38-logo-petels`
  vs `session38-logo-petals` — initially misread as "the committed
  S53-S56 runners carry the petals typo; the S54 fix never landed;
  10 tests never ran; the S56 badge over-counted." ROOT-CAUSED AS
  FALSE before the commit: the diff's runner side was built from a
  chunk list RE-TYPED INTO THE RECONCILIATION COMMAND — the typo was
  injected by the instrument itself. The committed runners verified
  correct by hexdump of the actual files + `git show HEAD:` + the
  "fix" sed proving a no-op (git: the runners unmodified); the S56
  gate's 849 = 252 + 125 + 472 stands in full. THE LAW: a
  reconciliation must expand the artifact's OWN file list (parse the
  script's CHUCKS array from the file), never a re-typed
  transcription — the instrument can inject exactly the defect it
  claims to find, and a corrupted instrument's "evidence" is
  re-verified against the artifact before any record is rewritten.
  The final gate reconciled at BOTH the count (482/482) and the
  file-set level (the runner's spec set diffed against the global
  `--list` set — empty). Additionally: an environment oddity in
  flight — long-running commands left orphaned/mirrored runner
  processes racing on the shared tally file (a fresh tally per batch
  + per-batch output-captured arithmetic + one playwright invocation
  per command for the final chunk neutralized it).
- **F8 — THE VLM STANDING CHECKS**: 6/8 first-pass PASS + 2
  ADJUDICATED BY EVIDENCE (both the known prompt-enumeration
  families from S56: the hero's below-fold logo strip + the login
  copy "Welcome to SAAS Company" — the byte-identical word-parity
  record outranks the prompt) — VLM effectively 8/8.

## The plan (R1-R8) — all [x] delivered

- [x] R1 — THE THIRTEENTH standing watch
      (research/recon-s57-ph1.mjs, self-contained boot-work-kill on
      :3400 against db/recon57.db): **14/14 GREEN — ALL RECORDS
      HOLD**.
- [x] R2 — THE SURFACE-SELECTION PROBES (recon-s57-ph2-probe.mjs +
      probe-landing-stability-s57.mjs): the trio probed raw-first
      (with the four instrument catches in flight, each root-caused
      as the instrument), the stability probe's 3x-per-side
      decomposition delivering the landing's payload buckets.
- [x] R3 — THE FULL RECON (recon-s57.mjs — one boot-work-kill unit,
      the fresh db/recon57.db): the ten public routes + the five
      alternates + the dashboard, BOTH sides — the payload censuses
      (every deterministic route EQ), the qq records (the
      engine-family deltas), the annots censuses (every public
      route EQ under the normalization contract), determinism 2x,
      the pin file written (research/s57-pin.json).
- [x] R4 — THE TDD PINS: `tests/e2e/session57-payload-annots-qq.spec.ts`
      (the constants GENERATED by research/gen-s57-spec-constants.js
      from the recon's pin file + the stability probe — the
      zero-transcription discipline; the one in-flight catch: the
      landing test's key-format mismatch — the constants' keys are
      dims-only from the stability probe, the census keys carry the
      filter suffix) — **10/10 GREEN, stable across THREE runs**.
- [x] R5 — THE BATTERY EXTENDED (drift-battery-s57.mjs + -s57b.mjs —
      the S56 battery ported + PHASE 7: the payload + qq + annots
      columns on the cached renders): **234/234 GREEN ZERO DRIFT**
      across seven phases (the standing watch 16 + the poppler
      print layers 40 + the structural/resource layers 27 + the
      interior layers 33 + the S55 columns 30 + the S56 columns 48 +
      the S57 columns 33 + the dashboard 7) — the battery now
      running THIRTY-TWO surfaces. One battery refinement: the S56
      landing image-interior check's live-core subset EXCLUDES the
      201x1 frame family (the S57 both-sides correction).
- [x] R6 — THE FULL GATE: lint ✓ typecheck ✓ build ✓ Vitest 252/252
      ✓ smoke 125/125 ✓ e2e **482/482** (scripts/
      run-e2e-chunks-s57.sh — the session57 spec ADDED per gotcha
      66c; every chunk reconciled; the file-set diff against the
      global --list EMPTY). Gate: **859 = 252 + 125 + 482** (re-derived
      from the layer counts; the S56 gate's 849 stands — the +10 is
      the session57 spec's own checks).
- [x] R7 — THE SCREENSHOTS + VLM: 21/21 captured (the capture
      server on :3500 against db/capture57.db; the dev DB canonical
      before AND after — 1/6/2, zero mutations); VLM effectively
      8/8 (2 adjudicated by evidence — the prompt's own enumeration
      errors).
- [x] R8 — THE DOCS ALIGNMENT (the F7 near-miss's false narrative
      fully reverted from every doc BEFORE the commit — the
      transcription-injection law recorded in its place): README
      (the 859 badge + the
      32nd-surface story + the session57 suite row + the counts),
      PAD (the S57 revision block + the ledger D195/D196/D197 + the
      7.1 counts 66 specs/482 + the S56 badge correction), AGENTS
      (the counts + gotcha 67), CLAUDE (the session-57 context),
      SKILL v2.56.0 (lesson 96 + the §12 header range), `.env.example`
      verified in sync (no config surface touched), this plan, the
      session log 123, the worklog.

## The gate arithmetic (the honest re-derivation — gotchas 64c/67)

- 252 unit + 125 smoke + 482 e2e = **859** (the S56 gate's 849 = 252
  + 125 + 472 stands in full — the runners verified correct; the +10
  is the session57 spec's own ten e2e checks, normal growth).
  Re-derived from the layer counts, never incremented; the runner's
  file set diffed against the global `--list` set — empty.

## The S58 candidates for Session 58

- The reference-regression watch continues (the FOURTEENTH).
- The 32nd surface's route extensions: the /login alternates' ICC
  streams (the S56 shape-law detection extended to the alternates'
  image interiors), or the dashboard's payload-under-live-data story
  (a workflow-run mutation re-rendered — the chart stripes' payload
  stability).
- Or the THIRTY-THIRD surface: the content streams' TEXT-POSITION
  layer (the Td/Tm/TJ positioning operators as a value census — the
  glyph-run segmentation already registered at S52, the raw
  positioning arrays never compared), the /ExtGState's /HT
  halftone + /SA smoothness keys at the value layer, or the /OpenAction
  + /PageMode document-view layer.

## The pushed-hash record (the closing discipline)

- The remediation commit **0f4498f** pushed via the SSH wrapper
  with the EXPLICIT --remote git@github.com:nordeim/saas-company.git;
  wrapper-verified (remote main @ 0f4498f == local HEAD); the
  fetch-independent HTTPS ls-remote cross-check agreed
  (0f4498f32c5223a3ca152221558c8174548e2d29).
- The operator key's fingerprint verified through paramiko's own key
  parse (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU —
  matches the S1-S56 record) BEFORE the push; the wrapper's temp key
  copy shredded after each run; the operator's key file destroyed
  after the push.
- Zero zombies at close (the port-sweep discipline held through every
  recon/battery/capture/e2e run — :3400/:3401/:3402/:3403/:3404/:3500/
  :3100 swept clean; the orphaned/mirrored runner processes from the
  gate's long-command windows swept + neutralized through the
  per-batch arithmetic); the tree clean before the closing commit; no
  new branches.
