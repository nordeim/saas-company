# AGENTS.md — SAAS Company (NovaAI)

Single Next.js 16 App Router application cloning the reference dark-theme
SaaS marketing site (`saas-company.base44.app` — "NovaAI") with a functional
superset: real cookie-session auth, a persisted workflow dashboard, a working
newsletter/demo-capture API, and SEO surfaces. Stack: React 19, TypeScript
strict, Tailwind CSS v4 (CSS-first — no `tailwind.config.*`), Prisma 6 +
SQLite at `db/custom.db`, Vitest + Playwright. Clone remote:
`https://github.com/nordeim/saas-company.git`; pushes go to the SSH remote
via `docs/ssh_git_wrapper_v3.py`.

## Commands

| Task | Command |
|------|---------|
| Install | `npm install` |
| Dev server (port 3000) | `npm run dev` |
| Production build | `npm run build` |
| Production server | `npm run start` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Unit tests (252 checks) | `npm run test` |
| Browser E2E (541 checks; needs a build) | `npm run test:e2e` |
| Prisma client after schema change | `npx prisma generate` |
| Recreate DB from schema | `npm run db:push` |
| Seed demo workspace | `npm run db:seed` |
| End-to-end smoke suite (125 checks) | `./scripts/smoke-test.sh` (needs `npm run build` first) |

**Gate order before every push:** `npm run lint` → `npm run typecheck` →
`npm run test` (252/252) → `npm run build` → `./scripts/smoke-test.sh` (125/125)
→ `npm run test:e2e` (541/541) — 918 checks across three layers (Session 68:
  the session68-gsinvocation-laws suite +4 e2e — THE FORTY-THIRD-SURFACE
  pins [the content-stream gs EXTGSTATE-INVOCATION LAYER under the
  pinned-frame contract — the third name-table sibling (S66 /Pattern +
  S67 /XObject, now /ExtGState): (a) THE INVOCATION-SITE CENSUS — 132
  sites = 124 form-container + 8 tiling-container, ZERO page-stream,
  ZERO unresolved, at BOTH frames; (b) THE VALUE CENSUS — 18 identities
  (the full-stroke-fill family, the plain alpha family with ca255 x43 +
  ca26 x30, the ONE /Screen blend, the SMask-bearing states with the
  /None object invoked SIX times — the dedup family at the invocation
  layer); (c) THE PHASE-SLOT LAW — the animated 1169x149 phase form
  carries DIFFERENT gs invocations per pinned frame (the ca230 slot
  vanishing + the ca128 slot gained at T=1000, both attributed to the
  same form, identically on both sides); (d) THE T-INVARIANCE BY VALUE
  — 16 of 18 values T-invariant, the totals 132=132; the cross-side
  laws: 16 of 18 values at IDENTICAL multiplicities — the two deltas
  = the clone's ca255 +3 (the CSS-rasterized shimmer family at the gs
  layer + the mockup's +1) and the live's /Luminosity +2 (the D220
  hero-band pair confirmed at the invocation layer) — no src/ fix];
  the TWENTY-FOURTH standing watch all records hold (Phase A 13/13
  both sides; the live Do-count phase assignment CORRECTED — the
  len603 sliver is print-jitter-unstable, not frame-dependent; the
  D223 ledger row's number pair was one print pair, not a law); the
  D160 mobile-nav record — the clone EXACT again (NO Tailwind v4 bug);
  Session 67:
  the session67-doinvocation-laws suite +4 e2e — THE FORTY-SECOND-SURFACE
  pins [the content-stream /XObject Do INVOCATION LAYER under the
  pinned-frame contract: (a) THE INVOCATION-SITE CENSUS — 24 sites = 19
  form-container + 5 tiling-container, ZERO page-stream, ZERO unresolved,
  exactly ONE doubly-invoked value; (b) THE VALUE CENSUS — the 11 form
  invocations (the 1169x149 family + the 179x83 + the 2023x532 + the
  29x29 + the 729x770 trio) + the 13 image invocations (the shared
  payload family + the clone-only CSS-rasterized slivers); (c) THE SHARED
  PHASE FORM — the doubly-invoked animated pill whose emitted geometry
  differs by pinned frame (len765 -> len635), IDENTICALLY on both sides;
  (d) THE T-INVARIANCE BY VALUE — the full invoked tree identical across
  frames modulo the phase pair; the cross-side laws: the object-number
  ALIGNMENT (obj:42-52, 5 of 6 byte-identical), the trio's value parity
  across the renumbering, the near-twin's ONE-extra color
  re-establishment delta — no src/ fix]; the TWENTY-THIRD standing watch
  all records hold NOW WITH THE INVOCATION COLUMNS; the D160 mobile-nav
  record — the clone EXACT again (NO Tailwind v4 bug); Session 66:
the session66-scninvocation-laws suite +4 e2e — THE FORTY-FIRST-SURFACE
pins [the /scn PATTERN-INVOCATION LAYER under the pinned-frame contract:
(a) the invocation-site census — 7 form sites, ZERO page-stream
invocations, every invoked pattern invoked exactly once; (b) THE
SHADING-INVOCATION VALUE MIRROR — the 4 axial shading invocations carry
the D221b family values verbatim at the fill sites (the same mathematical
values the live invokes — full cross-side parity at the invocation layer);
(c) THE TILING-INVOCATION BBOX CENSUS — the logo [0,0,201,201] + icon
[122,150,247,275] tiles (both shared with the live) + the border-shimmer
strip, NO hero-band invocation (the live's masked-chain pair [0,0,128,0]
/ [128,0,0,0] the D220 family); (d) THE NAME-RENUMBERING-IN-STREAM LAW —
the invocation census is T-invariant BY VALUE across T=1700/T=1000, the
tiling streams differing across prints ONLY in nested name tokens
(/X97 Do -> /X96 Do — the name-allocation renumbering INSIDE the pattern
streams, beneath the S65 object-level law) + engine float epsilon at
degenerate 1e-8 scales; no src/ fix]; the TWENTY-SECOND standing watch all
records hold NOW WITH THE FUNCTION-INTERIOR COLUMNS (the S66 extension:
the T-invariance by value + the axial stitch decomposition, green both
sides); the D160 mobile-nav record — the clone EXACT again (all three
y-points open the canonical 7 rows x 44px, NO Tailwind v4 bug), the
live's y21/y28 toaster-blocked + the y35 healed affordance holding);
Session 65: the session65-gradientvalue-laws suite +4 e2e — THE FORTIETH-SURFACE pins [the GRADIENT-FUNCTION VALUE LAYER under the pinned-frame contract: (a) THE FUNCTION-INTERIOR T-INVARIANCE LAW — every shading function on both sides byte-identical across T=1700/T=1000 (compared BY VALUE — the object numbers renumber on the clone while the interiors do not); the gradient stop values are NOT the animation carrier, the phase lives in the alpha layer (the D219 slots); the pinned-determinism law now extends to the deepest interior layer measured (inside the functions, beneath the D220 SMask census); (b) THE CROSS-SIDE VALUE CONVERGENCE — the animated hero pair's constants converge at engine float precision (the live -.083333351/.50000012/.60000002 v the clone -.083333373/.50000024/.59999925, deltas <=1.2e-7) + the clone's epsilon carriers (.00000063773246/-.0000038263947) where the live prints plain 0 — the lightningcss v browser-engine residue, invisible at 8-bit; (c) THE AXIAL STITCH DECOMPOSITION — the 6 axial functions are 2 plain exponentials + 4 STITCHED two-exponential chains at Bounds [0.5] (the hero-text sheen [1,1,1]->[0.9765,0.9804,0.9843]->[1,1,1] symmetric pair over the 1332pt extent); (d) THE SINGLE-MATRIX LAW — exactly one tiling carries a /Matrix (the border-shimmer strip's static placement, identical at both frames; no hero-band [0,62,596,587] tiles — the live's masked-chain family); no src/ fix]; the TWENTY-FIRST standing watch all records hold NOW WITH THE INTERIOR COLUMNS (the 39th surface's SMask kind census + shading-family multiset green both sides — live 10/2/1 + 14 patterns incl. the hero-band mask pair, clone 8/2/1 + 10 patterns + the D220b multiset exact); the D160 mobile-nav record — the clone EXACT again (all three y-points open the canonical 7 rows x 44px, NO Tailwind v4 bug), the live's y35 healed affordance HOLDING since S64 (y21/y28 toaster-blocked as registered); the FRESH-CLONE REBUILD (npm ci + Chromium v1243 + paramiko 5.0.0 + the ssh shim + the DB re-seeded in-repo 1/6/2, seed-checksum e7f6c011, under the gotcha-70a pin-per-command discipline)]; Session 64: the session64-smaskinterior-laws suite +4 e2e — THE THIRTY-NINTH-SURFACE pins [the /SMask-in-gs INTERIOR DECOMPOSITION under the pinned-frame contract: the 13v11 pair element-attributed — the live's two extra /SMask entries are gradient-through-gradient-mask chains over the hero band (function-based shadings masked by oppositely-directed axial gradients = the two organic-gradient hero text elements; the clone prints the identical visual mask-free, 10 v 14 shading patterns); the @51 slot attributed — a pure gs-object dedup family (the live's one gs across five owners v the clone's two, same value/shape//Normal); THE /TR INTERIOR DISCOVERY — the shared /Alpha mask carries a funcType-4 {1 exch sub} alpha-inverting transfer, the first transfer function in either tree, INSIDE the SMask (the D218 top-level empty-set law untouched); no src/ fix]; the TWENTIETH standing watch all records hold NOW WITH THE PINNED-FRAME COLUMN (the pinned constants at T=1700 GREEN both sides — clone 33/22/SMask 11/{21 Normal + 1 Screen}, live 34/21/SMask 13 + the /Screen law, both byte-identical deterministic; SMask 13v11 + @51 2v1 re-confirmed); the D160 mobile-nav record — the clone's burger clickable at all three y-points opening the canonical 7 rows x 44px (NO Tailwind v4 bug), the live's y35 sliver NOW OPENING THE MENU (the live healed its y35 affordance since S63 — a live-site evolution registered, the toaster-blocked y21/y28 unchanged); the FRESH-CLONE REBUILD (the first since S61 — the DB re-seeded in-repo 1/6/2 under the gotcha-70a pin-per-command discipline)]; Session 63: the session63-pinnedframe-laws suite +4 e2e — THE THIRTY-EIGHTH-SURFACE pins [the ANIMATION-BAND VALUE LAYER under a PINNED-FRAME PRINT CONTRACT: pause every Web-Animations-API animation at a deterministic currentTime T, print, census — each side's pinned layer byte-identical across prints (the S62 animation band was pure phase randomness), 17 of 19 shapes EQUAL across sides at T=1700 incl. THE /SCREEN LAW + the whole /CA stroke family, two T-INVARIANT structural deltas registered (the live's /SMask 13v11 — re-attributed to a constant engine family — + the clone's @51 slot 1v2), the engine census (the live WAAPI(opacity)+rAF(transform), the clone CSS-consolidated — the same choreography, no src/ fix); the NINETEENTH standing watch all records hold NOW WITH THE TRANSFER-MODE COLUMN (login 9x /Normal, faq 12x /Normal, the /Screen law on the landing — GREEN both sides; the D131 trio serialization-tolerant); the D160 mobile-nav record EXACT — NO Tailwind v4 bug; GOTCHA 73: the /login STREAMING WINDOW — the async-auth route streams its card inside a hidden Suspense container ~100-250ms after goto (the full DOM present, every rect zero, nothing focusable), the baseline's three in-flight failures all root-caused to it, the two affected specs hardened test-only (the poll + re-attempt forms — the D135 law)]; Session 62: the session62-transfermode-laws suite +5 e2e — THE THIRTY-SEVENTH SURFACE pins [the /ExtGState-adjacent TRANSFER-MODE INTERIORS measured at FULL PARITY on its first honest two-sided capture: (a) the /BM VALUE census — /Normal on every deterministic route both sides + THE /SCREEN LAW (the landing's hero mix-blend-mode renders into print as the /Screen blend mode, ONE entry both sides, identical shape /BM,/ca at full opacity — the only non-Normal blend mode in either tree); (b) THE TRANSFER-FUNCTION EMPTY-SET LAW (the Table-59 family /TR /TR2 /HT /BG /BG2 /UCR /UCR2 /OP /op /OPM /RI /D /FL /AIS /TK /SP /Font — zero entries on every route, both sides); (c) the BM-BEARING SHAPE CENSUS at the D187 255-grid (404 3v3, login 9v9, login-typed 9v9, faq 12v12, thank-you 4v4, the four legal routes 11v11 each — the live's 8-bit-quantized alphas v the clone's raw CSS decimals converging on every grid point incl. the 179 half-point; the landing's animated slots the registered animation-band family around the stable core); NO src/ fix required; the EIGHTEENTH standing watch all records hold NOW WITH THE READING-ORDER COLUMN (the watch prints /login + /faq + /thank-you per side and compares the D217 word censuses — GREEN both sides; the fresh-context instrument law: the clone's login-flow cookie makes /login redirect to /dashboard, so any print column runs in a FRESH CONTEXT); the D160 mobile-nav record EXACT — NO Tailwind v4 bug (the kickoff's watch item GREEN)]; Session 61: the session61-readingorder-laws suite +6 e2e — THE THIRTY-SIXTH SURFACE pins [the pdftohtml -xml READING-ORDER layer measured at FULL PARITY on its first honest two-sided capture: 13 states (login 11v11, typed 11v11, reset 6v6, signup 8v8, error 12v12, faq 33v33, thank-you 3v3, privacy 46v46, terms 49v49, accessibility 81v81, refund-policy 44v44, landing 43v43) all EQUAL on the three censuses — the per-word font census (the subset prefix stripped) + poppler's own reading-order sequence + the per-line column assignment; the 404 (7v7) carrying only the REGISTERED 2-space-glyph emission family at one word (the live's trailing space + the 4pt shift — S47/S58); NO src/ fix required — the S58 line layer + the S49 font layer + the S61 word layer all converge; the SEVENTEENTH standing watch all records hold (the D131 trio's third element re-measured as ONE button — "Need an account? Sign up" — the prefix match the honest selector); the D160 mobile-nav record EXACT — NO Tailwind v4 bug (the kickoff's explicit watch item: the clone's burger clickable at all three y-points, every click opening the 7x44px row set; the live's toaster-blocked)]; Session 60: the session60-literalrule-laws suite +6 e2e — THE LITERAL-RULE CONVERGENCE pins [the 34th surface's route extension answered: the live's universal `*` rule consumes `hsl(var(--ring) / .5)` with `--ring: 290 100% 50%` — the D205 token-syntax family's LAST unconverted member, now mirrored through the @theme component var + the * rule's outline half, the BUILT css verified surviving; the pulse-glow keyframe at the live's opacity-only body (.4/.8, 4s — the two invented box-shadow literals REMOVED, INERT: zero consumers either tree); the not-fix guards (the border half's token consumption per the D211/D131 adjudication + the login ring literal per D212) + the computed-layer guard (the runtime indirection serializes rgba(213,0,255,.5) exactly — the D206 masking law); the SIXTEENTH standing watch all records hold; the 35th surface (/Shading pattern-interior VALUES) measured at FULL PARITY — the S59 convergence carried the shading layer; the second-interpolation-input cross-check holds (the 49-char email's typed fills .0351,.0351,.0429 x2 both sides); the D135 hover-instrument hardened (the changed-then-stable poll + locator hover — the chunk-context flake closed, the original failing order 26/26)]; Session 59: the session59-colorfill-laws suite +7 e2e — THE THIRTY-FOURTH SURFACE pins [the PDF COLOR-FILL VALUE layer: every rg/scn fill in every stream censused at the PDF's 4-decimal granularity — the six value families decoded to the TOKEN-SYNTAX divergence (the live's hsl-component tokens carry float precision: its violet renders .8333 in print where the hex mirror wrote .8353, both rounding to rgb(213,0,255) at 8-bit so every DOM layer masked it) + THE VAR-INDIRECTION LAW (lightningcss resolves literal hsl() to hex at compile time — the mirror keeps the live's raw-components + hsl(var(...)) indirection) + THE RED/GREEN-50 OKLCH-LEAK FIXES (the two 50-step pins the s9 palette missed: the error/success banners) + the login near-black/near-white hsl-spec convergence + the :root-vs-.dark NOT-FIX guards (the rendering primary #8624ff + destructive #ef4444 + the login ring; the .dark blocks never mount) + the 8-bit transparency guards; the dashboard's chart raster re-pinned (the D205 downstream — the stale-pin convergence law's second sighting)]; Session 58: the session58-textposition-laws suite +11 e2e — THE THIRTY-THIRD SURFACE pins [the content streams' TEXT-POSITION layer: every Td/Tm/TJ positioning record tokenized, the glyph runs positioned, the pages compared at the LINE level — (y, x0, runs, glyph-hash), the blocks merged per baseline so the ±2 BT/Tm page-layer re-blocking family absorbs into the honest comparable census — the six deterministic content routes at FULL LINE-LEVEL PARITY (23/6/36/39/34/64 lines), the landing's 23-line STABLE CORE, the alternates reset/signup/forgot at FULL parity POST-FIX, the default/error pair's registered ±1 run-split lines, the 404's 2-space-glyph emission delta, /demo the 27-line superset floor] + THE LOGIN-LOCAL H2-H6 TRACKING FIX [the reference's SPA bundle ships a base h1..h6 letter-spacing .02em rule its LOGIN bundle does NOT — the three alternate-state h2s computed +0.48px here vs normal on the live, measured at this layer as +3.84..4.57pt x-origin shifts with identical glyph hashes + the per-glyph 16/19/19-run decompositions vs the live's single merged run; the login-local pin converged the alternates to FULL line parity AND the S52 D182 record to the merged truth — the first src/ parity fix since S54, TDD RED→BUILD→GREEN] + THE FOUR LAWS [the /HT empty-set + the /OpenAction+/PageMode null catalog-view + the alternates' ICC empty-set + the gs VALUE-layer parity /SA /LW /LC /LJ /ML at exact multiset parity on every route] + THE MUTATION COLUMN [the dashboard's print payload tracks the data: +1 shading pattern per new chart row to the CHART_ROWS ceiling, objects growing deterministically, gs/tilings stable, A===A2 at every step]; Session 57: the session57-payload-annots-qq suite +10 e2e — THE THIRTY-SECOND SURFACE pins [the image STREAM PAYLOAD layer: the filtered bytes of every image XObject through `qpdf --show-object=N --filtered-stream-data` — every deterministic route at FULL BYTE PARITY on the first honest measurement: /login 6 streams incl. the 754x676 SMask pair + the DCT family, the content routes + the 404 + /demo the empty-set family, all five /login alternates byte-identical] + the landing's payload BUCKETS [the stability probe's decomposition: the stable-shared core byte-identical across sides, the video-frame family frame-dependent BOTH sides with INTERSECTING sha sets — the same 8s video captured at different times, the 201x1 pair frame-dependent on BOTH sides (the S56 record's clone-only reading corrected), the clone-only slivers 1x26/738x1/738x26 now pinned at the byte level] + THE /ANNOTS VALUE LAYER [every annotation dict's /Rect byte-precision + /A /S /URI actions + /Dest named dests + /F flags under the pg-dropped + origin-normalized contract — exact parity on every public route: landing 69, /faq 14, /accessibility 16, /login + 404 the empty sets, /demo the 14/0 superset floor] + THE Q/Q LAW [balanced q/Q on every page content stream, endDepth 0, maxDepth <= 2; the content-route engine-family deltas REGISTERED (clone privacy 70 / live 66, terms 68/66, accessibility 86/80, refund 70/66 — stable per side, 3x); the landing's animated band; /demo the 96/7 superset floor] + THE TRANSCRIPTION-INJECTION CATCH (gotcha 67: the reconciliation diff showed a logo-petels "typo in the committed runners" — root-caused as the RECONCILIATION COMMAND'S OWN re-typed chunk list carrying the typo; the committed runners verified correct by hexdump + git-unmodified; the honest file-set reconciliation expands the runner FILE ITSELF, never a re-typed copy); the dashboard's authenticated payload + qq + annots records; the THIRTEENTH standing watch all records hold; Session 56: the session56-imagelayer-interiors suite +6 e2e — THE THIRTY-FIRST SURFACE pins [the image XObject INTERIOR layer at the OBJECT level — every image's dims/colorspace/filter + the resolved /SMask target + the ICC profile streams through SHAPE-BASED detection: Skia's profiles carry NO /Subtype, so the S54 color-space detector was shape-blind at the image layer — the landing's video poster carries a 716-byte N=3 profile BYTE-IDENTICAL across sides, the first honest ICC measurement] + THE FOUR LAWS [the /Decode + /DecodeParms + BI/ID/EI inline-image EMPTY-SETS on every public route + the /demo print-gradient EMPTY-SET] + the landing's form-nested SUPERSET registered [the clone's CSS-keyframe animated elements rasterize as image slivers inside FORM XObjects at print time — 16-18 object-level images vs the live's stable 13 — the D125 engine family, the page-PLACED census unchanged at 13/13] + the /Info VALUE re-verification + the alternates' + dashboard's image-interior records; Session 55: the session55-functionlayer-laws suite +5 e2e — THE THIRTIETH SURFACE pins [the /Function layer — the gradient math at the function-dict granularity: the exponential Domain/C0/C1/N endpoint values + the stitching Bounds/Encode/sub-chains, stored INLINE inside the shading pattern dicts on /login — the inline-storage law, the lesson-88 family's SEVENTH sighting: an object-level probe measures EMPTY; the only complete census resolves through PatternType 2 -> /Shading -> /Function plus the standalone objects] + THE 29TH EXTENSION [the /SMask G-stream interiors — the luminosity-mask forms' own resource chains: BBox + the nested name tables + the 84-byte streams, 4/4 byte-identical on /login] + THE THREE LAWS [the /Metadata XMP empty-set + the /PieceInfo empty-set + the tiling nested-Resources flatness] + the alternates' five-state records + the dashboard's authenticated function fingerprint; Session 54:
the session54-interiorlayer-laws suite +5 e2e — the TWENTY-NINTH
SURFACE pins [the D184 name tables' RESOLVED TARGETS censused at the
dict level through qpdf --json: the ExtGState interiors as a sorted
multiset at the ALPHA GRID — the D187 law, the two pipelines'
/ca /CA serializations differ in BOTH directions per route but every
pair converges on the same Math.round(a*255) composite-grid point —
the object-level census the only complete one (9 of /login's 14
ExtGStates are TYPELESS — /Type is optional, and most are referenced
from FORM XObjects' nested /Resources), the PATTERN interiors (tiling:
PaintType/TilingType/XStep/YStep/BBox/streamLen; shading:
ShadingType/ColorSpace/Coords/Extend/Function shape), and the FONT
subset-metrics (the Type3 /Widths advance arrays) — the stable seven
at FULL INTERIOR PARITY on the first honest fresh measurement] + THE
TWO LAWS [the COLOR-SPACE EMPTY-SET — zero ICC streams, zero named
/ColorSpace entries, zero /Default* overrides on every route, both
sides; the PAGE-TREE FLATNESS — zero intermediate /Pages nodes, zero
inheritable attributes, proving the D184 per-page census complete by
construction] + the ROUTE EXTENSIONS [the alternates' per-state name
tables /X35//X36//X18//X22//X22 with /G3 + /P4 + the five states'
interiors; the dashboard's authenticated interior fingerprint
18/3/4/9] — AND THE S53 GATE-COUNT CORRECTION: the inherited 837
badge was an arithmetic slip (252+125+456 = 833, not 837; the S51/S52
totals 817/826 were pure sums — the S54 honest count 252+125+461 =
838), plus the S54 chunk-runner fix: the S53-committed runner's
`session38-logo-petels` typo SILENTLY SKIPPED the logo-petals spec —
gotcha 64, the SILENT-SKIP law (playwright path filters drop
non-existent files without error; verify every chunk's --list count
against the expected sum before trusting a tally); Session 53: the
session53-resourcelayer-alternates suite +7 e2e — the TWENTY-EIGHTH
SURFACE pins [the per-page /Resources NAME TABLES through qpdf --json
— the stable seven at BYTE-IDENTICAL name sets (the names encode the
referenced object numbers — the D181 object-count parity proven at the
NAME-ALLOCATION layer), the landing's count-parity with the animated
name bucket, the /demo resource superset floor, the dashboard's
authenticated fingerprint 30/7/10/6, the determinism re-render law] +
the ALTERNATES' STRUCTURAL pins [the five /login states' per-state
object-allocation fingerprint 51/52/34/38/38 identical across sides +
the dashboard's authenticated structural depth at 292 objects];
Session 52: the
session52-structurallayer-convergence suite +9 e2e — the TWENTY-SEVENTH
SURFACE pins [the PDF's document CATALOG layer through qpdf --json —
the per-route key sets, the tagged/outline empty-set, /ViewerPreferences,
the top-level views, the deterministic object counts with the landing's
animated bucket + the /demo superset floor] + the ALTERNATES'
POST-BUILD CONVERGENCE pins [the reset card's 6-block glyph-run census
with the per-glyph block-0 decomposition + the error card's census] +
the 404-route DOM datum; Session 51: the
session51-vectorlayer-reset-badge suite +11 e2e — the TWENTY-SIXTH
SURFACE pins [the PDF's content-stream operator census through
`qpdf --json --json-stream-data=inline` — the form XObjects' BBox +
operator-family counts and the per-page content families, with the
color-VALUE census adjudication (the 1/32-quantized distinct sets +
the white re-establishment record) and the /demo superset floor] + the
RESET-BADGE build pins [the /login reset-success state's missing
mail-icon badge — the slate-100 circle + the lucide Mail, the card
318 -> 398, the state-tracked raster 1359 -> 1609] + the /login ERROR
state's parity [the 2927 raster] + the dashboard's authenticated
print contract [292 words, 2 pages, VendSans-Light 9x, the empty
image + link sets, 34 forms]; the DM Serif italic-cut fix re-versioned
the session48 font pin — the live's css2 URL ships no ital axis, its
italic wordmark is the browser's synthesized oblique, so the clone
loads the regular cut only; Session 50: the
session50-imagelayer-alternates suite +9 e2e — the TWENTY-FIFTH SURFACE pins [the
per-route image-XObject censuses through pdfimages — the landing's 13 sorted
structural keys with the animated-glow ±1px bucket, the /login card's 6, the
content routes' empty sets; the video-frame contract; the rasterization-law
floor; the order-invariance + determinism law] + the /login ALTERNATES' print
story [the fonts/metadata/link-empty-sets/print-text censuses + the image
censuses with the state-tracked raster heights]; Session 49: the
session49-fontembedding-metadata suite +9 e2e — the TWENTY-FOURTH SURFACE pins [the
font-embedding censuses with the deterministic counts + the emb/sub/uni contract +
the /demo superset floor] + the PDF-metadata pins [Title/Creator/Producer/Pages
with the per-render dates + file sizes normalized BY CONSTRUCTION] + the 23rd
surface's route extensions [the four content-route link censuses + the
named-destination tables through pdfinfo -dests]; Session 48: the
session48-pdflinks-buildfix suite +11 e2e — the font-build regression pins [the
served CSS's Playfair variable registration, the D167 fix's contract] + the
print-text route extensions [D168] + the TWENTY-THIRD SURFACE pins [the PDF
link layer, D169 — the per-route link censuses through pdftohtml] + the
entrance empty-set [D170]; Session 47: the
session47-print-text-entrances suite +9 e2e — the twenty-second-surface pins
[the print-text layer] + the entrance-build pins [the wordmark + CTA gaps
closed] + the forced-colors empty-set + the offline route extensions; Session
46: the
session46-clipboard-drag-offline suite +8 e2e — the twenty-first-surface pins
[the clipboard empty-set, the drag contract, the offline render] + the burger
clickability/panel/close-on-navigate pins; Session 45: the
session45-traversal-media-video suite +13 e2e — the twentieth-surface pins
[the traversal class, the media empty-set, the video contract] + the /login
alternates census, and the registry's fifth DOM-attr entry; Session 44: the
session44-urlstate-selection-surface suite +18 e2e — the case-canonicalization
proxy pins [4 RED on the missing proxy first] + the nineteenth-surface parity
pins; Session 43: the session43-thankyou-input-surface suite +9 e2e + the
autocomplete registry pin +1 unit + the /thank-you smoke page +1; boots the standalone server on :3100 against its own
`db/e2e.db`, `AUTH_RATE_LIMIT_MAX=100` — raised from 50 in Session 28
when the suite's ~45 auth flows outgrew it — `GENERATE_RATE_LIMIT_MAX=50`). There is no hosted CI; the local gate is the only gate.
`next.config.ts` sets `ignoreBuildErrors` — the explicit `typecheck` step is
what catches type errors; never skip it.

First-run setup: `npm install && cp .env.example .env && npm run db:push &&
npm run db:seed && npm run dev`. Demo login: `demo@novaai.app` /
`Demo1234!`.

## Gotchas (verified the hard way)

1. **The exported-`DATABASE_URL` trap.** A shell-exported absolute
   `DATABASE_URL` overrides the repo `.env` for the Prisma CLI **and** the
   Next runtime — the server silently opens a foreign database file (the
   historical 12/30 smoke failure). `scripts/smoke-test.sh` and
   `playwright.config.ts` PIN their own `DATABASE_URL` per command; keep that
   discipline in every script that boots a server or runs Prisma.
2. **Relative `file:` URLs are schema-anchored.** `DATABASE_URL` in `.env` is
   `file:../db/custom.db`, which resolves against `prisma/schema.prisma` for
   the CLI and against the same anchor at runtime via `src/lib/db-path.ts`
   (unit-tested by `tests/db-path.test.ts`). One string → one file:
   `<repo>/db/custom.db`. The `db/` folder sits at the repo root and is
   git-ignored (`db/*.db`).
3. **Tailwind v4 is CSS-first.** Tokens live in `src/app/globals.css` under
   `@theme` — never add a `tailwind.config.*` or the `@config` bridge. Two
   v4 traps are load-bearing here: theme vars must be FULL color values
   (bare HSL triplets resolve to transparent), and `button,
   [role="button"] { cursor: pointer }` is set in the base layer because v4's
   preflight sets no pointer. See `docs/Tailwind-V4-Validation-Report.md`.
4. **v4 serializes `bg-white/10`-style colors through `oklab()`** —
   rendering-identical to the reference's rgba strings but
   computed-string-different. E2E assertions accept either spelling (see the
   mobile-navigation spec comments); never "fix" the CSS to chase byte-parity.
5. **The UI font is GOOGLE's "Vend Sans"** (variable wght 300-700),
   self-hosted as the two gstatic subsets in `src/fonts/` — the SAME bytes
   the live serves (`fonts.gstatic.com/s/vendsans/v1/…`, traced via
   performance entries in Session 5). Session 1 misidentified it as
   "Base44-hosted Wix Madefor" (the Wix faces are declared only in the
   live's unused login-bundle css) and the wrong metrics (+2.4% glyph
   width) drifted every text surface for four sessions. Never trust a
   font's NAME — trace its bytes.
6. **The reference ships INERT classes** — its markup carries utilities
   its compiled css never emits (the pricing Pro card's `scale-[1.02]
   md:scale-105` renders UNSCALED: `scale: none`, 540px at every width).
   Match the RENDERED computed style, not the class string; v4 here WOULD
   emit those utilities (540×1.05 = the old 567px D19 delta).
7. **The reference is a moving target.** The live app at
   `saas-company.base44.app` has been redeployed with different products
   across this repo's history (the previous cycle cloned a PM workspace
   called ORBITAL). Visual parity was re-measured against the CURRENT live
   (dark NovaAI marketing site); the measurements live in
   `Project_Architecture_Document.md` §5 and the e2e pins.
8. **Rate limits are per-process.** Auth endpoints throttle 10
   attempts/IP/15 min (in-memory `src/lib/rate-limit.ts`; override with
   `AUTH_RATE_LIMIT_MAX` — the Playwright webServer pins 50 because the
   suite's own ~10 UI sign-ins share one IP and one process with the
   limiter; at the default they sat at EXACTLY the budget — Session 11
   saw one extra signed-in spec trip a mid-suite 429 that broke an
   unrelated pin).
9. **Dependency overrides are load-bearing.** `package.json` pins
   `overrides` for `braces`/`micromatch`/`fast-glob`/`deepmerge-ts` — the
   patched transitive versions for advisories whose parents haven't shipped
   fixes (the residual `braces` GHSA-vfj7-8cjw-p6xm covers every published
   version; lint-toolchain-only — see the remediation plan F10). Never run
   `npm audit fix --force` here: it would downgrade `eslint-config-next`
   16→14 to silence a dev-time advisory.
10. **`/dashboard` is session-gated** (`redirect("/login?from_url=/dashboard")`)
   — expect 307 for anonymous requests; the smoke suite pins both the 307
   and the cookie'd 200.
11. **The reference ships TWO token blocks — `:root` and `.dark`.** The app
   never mounts `.dark`, so `:root` is what renders: primary = hsl(267 100%
   57%) = #8624ff, accent/electric-blue = hsl(220 100% 50%) = #0055ff, while
   `violet` (the magenta used by text/border/bg-violet) = #d500ff. Session 1
   read the `.dark` block and shipped the wrong primary/accent for two
   sessions — the Session-3 audit fixed it (see
   `docs/remediation-plan-session3.md` F1/F2).
12. **Arbitrary aspect ratios use the SLASH (`aspect-[16/9]`), never the
   colon spelling** — writing the ratio with a colon inside the brackets
   emits the invalid `aspect-ratio: 16:9` into the compiled CSS and postcss
   fails the whole build with an opaque `CssSyntaxError … Missed semicolon`
   at a flattened column. Worse: Tailwind's scanner reads class candidates
   from MARKDOWN too — documenting the colon spelling in a .md file breaks
   the build just like using it in a component (docs/ is `@source not`-ed
   in globals.css for exactly this reason; Session 4 hit both).
13. **The reference's /login loads its OWN css bundle** (light `:root`, body
   white + zinc-950 + the system font stack) — the login route swaps the
   body theme via a route-scoped `<style>` in `login/page.tsx`; every other
   route keeps the dark theme. Also: the reference's compiled `space-y-*`
   puts the gap on the FOLLOWING sibling (v3-style) — v4's
   margin-bottom-on-preceding is lost on inline labels (the login form)
   AND is cancelled by the alternate-states' back-button `-mb-2`, so the
   route style restores that pattern inside forms (`.space-y-1\.5`) and
   the auth stack (`.auth-stack` / `.auth-stack-sm6`). The card's
   ALTERNATE states (sign-up / forgot / reset-success) use a DIFFERENT
   layout from the default: back-button + h2 + form, NO logo chip,
   NO Google button, NO OR divider, and shadcn-style alert banners
   (bg-red-50/70 / bg-green-50/70) rendered BETWEEN the last field and
   the submit button — measured in Session 5, pinned by
   `tests/e2e/login-states.spec.ts`.
14. **The navbar is section-aware and never gains a background.** It is
   `bg-transparent` at every scroll depth (no scrolled-glass bar); a
   scroll-spy highlights the section in view (last section whose top passed
   the ⅔ viewport line) and the chrome swaps to black variants while the
   nav band overlaps `[data-nav-theme="light"]` sections (the white
   features section). Pinned by `tests/e2e/navbar-behavior.spec.ts`.
15. **The dashboard mockup LOOPS — never re-add the skeleton-wave shimmer,
   and never trust a CSS-property census against a JS animation engine.**
   The live pulses the ambient `-inset-32` glow (scale 1→1.15→1 + opacity
   .3→.5→.3, 4s), the red chrome dot (scale 1→1.2→1, 2s), the four list
   dots (same, staggered delay:i*.1), the under-glow (y 0→−12→0 + opacity
   .3→.5→.3, 3s — a SIBLING of the card, unclipped, rendered UNCENTERED:
   its framer transform kills the `-translate-x-1/2`, pinned via
   `translate-none`), and the One-Platform mini-dashboard's skeleton
   shapes (opacity pairs at 3s with delays) — reproduced as the measured
   `animate-mockup-*`/`animate-skel-*` keyframes in globals.css. The list
   dots keep their SOLID `bg-primary/80` fill (never re-add the
   `skeleton-wave` shimmer: as an UNLAYERED class it overrides the layered
   `bg-primary/80` utility). Session 4's "the mockup is completely
   STATIC" census was an artifact: framer writes inline styles per frame,
   so `animationName` reads `none` on an element that is mid-loop — survey
   motion by sampling VALUES over time (see PAD §5.5 trap 16). The pricing
   toggle defaults to ANNUAL (Pro $39/mo annual, $49/mo monthly — the $39
   Session 1 read was the annual price).
16. **Hover-state probes need REAL pointer events** (Session 6) — an
   agent-browser `mouse move` reported `:hover` matching while no hover
   utility applied (a false negative Playwright's real `page.mouse.move`
   disproved — the Get Started pill's shimmer was working all along).
   Related: the live's arrow slide renders v3 `transform: matrix(1,0,0,1,2,0)`
   while v4 emits `translate: 2px` — compare RENDERED geometry, not the
   property name.
17. **The reference's `<head>` is per-route** (Session 6): content routes
   ship og:title = the page title, description = "X on SAAS Company. …",
   and og:url = canonical = the route (implemented here through
   `src/lib/seo.ts` + per-page `routeMetadata` exports; `/og-image.png`
   is the WORKING replacement for the live's dead og:image URL). Do NOT
   re-add `viewport-fit` — the live ships none. `theme-color`: the live
   REDEPLOYED it on `/login` ONLY (`#000000`, Session 32's seventh-column
   catch) — the login layout now exports it at parity; every other route
   stays clean. The Session-6 "ships neither" record was true at ITS
   measurement time (gotcha 7).
18. **The live's mobile burger is pointer-blocked by its own empty toast
   portal** (fixed top-0 z-[100], 390×32, pointer-events auto — a JS
   click opens the live's menu, a real tap cannot; D32). The clone keeps
   the WORKING burger; never "fix" it toward the live's broken state.
19. **The reference's SPA bundle DOUBLES the tracking scale** (Session 7):
   `tracking-wider` renders 0.1em and `tracking-widest` 0.2em on the live
   — the overrides live in globals.css `@theme`
   (`--tracking-wider`/`--tracking-widest`), while the live's LOGIN bundle
   keeps the standard scale (pinned back in the login route's scoped
   `<style>`). Never "simplify" either side — the divergence is the
   reference's own two-bundle reality.
20. **Breakpoint-mounted chrome needs a resize guard** (Session 7): the
   mobile menu mounted below `md` and hidden above it kept its state (and
   the body scroll-lock) alive when the viewport crossed 768 — the
   `matchMedia("(min-width: 768px)")` close-on-match listener in
   `navbar.tsx` is load-bearing for resize/rotate flows.
21. **The scroll entrances are rAF-driven, NOT CSS transitions** (Session 8):
   the reference uses framer-motion (per-frame inline opacity/transform
   writes, easeOut cubic-bezier(0,0,0.58,1), per-element params); the
   `Reveal` component re-implements it via `src/lib/motion.ts`. Never add
   `transition-*` classes to entrance wrappers — on children that carry
   their own `transition-colors` the cascade SNAPS the entrance and
   corrupts the child's hover timing (the Session-8 F1 bug). The
   per-element parameter table lives in `docs/remediation-plan-session8.md`.
22. **v4 ships THREE more engine shifts beyond oklab** (Sessions 7–8): the
   tracking scale (the live's config doubles the two widest steps —
   `@theme --tracking-*`), the shadow-scale rename (v3 shadow-sm → v4
   shadow-xs — pinned via `--shadow-sm`), and the line-height cascade
   (v3's responsive `text-*` beats `leading-*`; v4's `--tw-leading` always
   wins — pinned per-element via `--tw-leading: initial`). Survey the
   ENGINE layer (computed values + the emitted rules), not just class
   strings — every one of these hid from class-string parity for 6+
   sessions.
23. **v4's default palette is OKLCH-DEFINED — the roundtrip drifts from
   v3's hex** (Session 9): up to 69 RGB units off (green-400; the stars'
   yellow-400, the problem cards' reds, the avatar gradient endpoints,
   every login slate drifted). The pins live in `globals.css` `@theme`
   (`--color-<family>-<shade>: <v3 hex>` — 31 tokens). Never "simplify"
   them back to v4 defaults, and never trust a color assertion that
   accepts both spellings without comparing VALUES. Related v4
   token-emission trap: `ring-ring` reads `--color-ring` (a legacy
   `--ring` HSL variable is NOT the emission path — without the @theme
   token the utility never emits and the ring falls back to currentColor),
   and v4 emits ring-ring AFTER ring-slate-400, so elements carrying both
   need the `input:focus:focus-visible` cascade nudge in the utilities
   layer. The live also ships NO `::selection` rule (ours was an
   invention, removed) and pins `/login` `html { overscroll-behavior-y:
   none }` + a light `--border` (both reproduced route-scoped).
24. **A JS animation engine is INVISIBLE to a CSS-property census**
   (Session 10): framer-motion writes inline `transform`/`opacity` per
   frame, so an element can be mid-loop while `getComputedStyle()
   .animationName` reads `none` — the Session-4 "static mockup" verdict
   shipped static for six sessions while the live pulsed eight loop
   groups. Survey the LOOP layer by sampling computed VALUES across
   multiple rounds after entrances settle AND by extracting the
   `animate:{…}`/`transition:{…}` configs from the live's JS bundle.
   Related: framer's inline transform REPLACES v3's `--tw-translate-*`
   composition (the live's under-glow renders un-centered) — v4's
   `translate` property is SEPARATE from `transform`, so reproducing that
   geometry needs an explicit `translate-none` (PAD §5.5 trap 16).
25. **A statically-prerendered CLIENT component cannot render route state
   at SSR — and `usePathname()` settles to the INTERNAL route id on
   404s** (Session 11): the not-found page shipped React #418 on EVERY
   unknown route (the prerendered HTML quoted `"_not-found"` while the
   hydration render carried the real URL — a text mismatch by
   construction), and post-settle `usePathname()` returns `/_not-found`,
   not the browser URL. The pattern: a `useSyncExternalStore` mount gate
   (server snapshot false) reading `window.location.pathname` — pinned
   by `tests/e2e/hydration.spec.ts`. Sweep the CONSOLE layer (pageerror)
   on every route — a clean render can still ship a broken hydration.
   Related Session-11 lessons: sample TRANSITIONING properties to
   settled (the ring pin's fixed-200ms mid-flight samples + its
   blind-Tab×4 focus misses made the gate itself flaky — poll, and
   tab-until-focused), and alpha composites through ANCESTOR opacity
   (the paused cards' `opacity-80` turned `text-white/50` into effective
   white/40 — audit the EFFECTIVE alpha, not the class; the clone-only
   axe violations on `/`, `/faq`, and the 404 are LIVE-PARITY — D63,
   not bugs to fix).
26. **React Float auto-preloads eager `<img>`s rendered in the SSR shell —
   and the Next.js router's RSC prefetch INJECTS those head links into
   every route that links to the page** (Session 12): the Gasparyan
   logo's automatic `<link rel="preload" as="image">` traveled from the
   landing into /faq, /privacy, /terms, /accessibility, /refund-policy,
   and /dashboard (the navbar's logo `<Link href="/">` prefetch), where
   the image never renders — a console "preloaded but not used" warning
   + a wasted fetch on six routes. `loading="lazy"` suppresses the
   emission entirely (pinned by `tests/e2e/resource-hygiene.spec.ts` +
   the smoke static-HTML pin). Audit `<link rel="preload">` on EVERY
   route, not just the page that owns the resource. Related Session-12
   lessons: fault-inject the network (`page.route(...abort())`) before
   trusting a happy path — the dashboard's pause/delete/sign-out carried
   NO catch and surfaced `TypeError: Failed to fetch` pageerrors with
   zero user feedback (now banners — `tests/e2e/resilience.spec.ts`);
   and before believing a mid-verification regression, verify the server
   serves the CURRENT build — compare the served HTML's CSS chunk
   filename against `.next/standalone/.next/static/chunks/` on disk (a
   ZOMBIE server on :3000 serving a stale build whose CSS chunks were
   deleted renders UNSTYLED: links concatenate in innerText and word
   parity collapses; the Playwright/smoke suites are immune — they boot
   their own servers).
27. **A 401 is not a network fault — failure CLASSES need distinct UI
   contracts; and ship `error.tsx`/`global-error.tsx` before you need
   them** (Session 13): a cookie-expired session makes every dashboard
   mutation 401 — and "Try again." banners LIE (each retry 401s forever).
   The honest contract is the server gate's own: redirect to
   `/login?from_url=/dashboard` (the `apiFetch` wrapper in
   `dashboard-app.tsx`; pinned pairwise against the abort-banner class
   by `tests/e2e/session-lifecycle.spec.ts`). Likewise a render fault
   (malformed API data — a row with `runs: null` passes the
   `Array.isArray` envelope guard and crashes the article template) must
   surface the BRANDED boundary (`src/app/error.tsx`), never Next.js's
   default "This page couldn't load" page — the app loses its identity
   exactly when the user is already having a bad day (pinned by
   `tests/e2e/error-boundary.spec.ts`; pin the boundary with a
   route-fulfilled contract violation, not a synthetic throw). Related:
   Escape-closing the mobile menu must RETURN FOCUS to the burger
   (`burgerRef`) — the focused link unmounts with the panel and
   `activeElement` falls to `body`, stranding keyboard users (WCAG
   2.4.3).
28. **Audit REACHABILITY, not just behavior — and success is a
   message class too** (Session 14): grep every API route for a UI
   consumer BEFORE calling it a shipped feature — `POST /api/demo`
   shipped complete (validation + rate limit + model) with ZERO
   consumers: dead code dressed as a superset. A feature unreachable
   from any URL is not a feature (`/demo` is its front half — D73).
   Likewise `/login` must redirect ALREADY-authenticated visitors to
   the workspace (D74) — and NOTE: any script or spec that signs in and
   then revisits `/login` will hit the redirect (the screenshot
   refresh script's re-sign-in blocks had to navigate to `/dashboard`
   directly). And successful mutations need STATUS MESSAGES (WCAG
   4.1.3): errors alert (`role="alert"`), successes confirm politely
   (a sr-only `role="status"` `aria-live="polite"` region — D75) —
   pre-fix the dashboard had zero live regions; a screen-reader user's
   actions changed the stats in total silence. Related: computed
   `animation-duration` for sub-millisecond values serializes in
   SCIENTIFIC NOTATION ("1e-05s" for the authored 0.01ms clamp) —
   compare parsed milliseconds, never the string; and the browser's
   own 404-document resource log is inherent noise on BOTH sides (the
   live's 404 ships two 401s — the D68 parity family).
29. **Guard WHERE a user-controlled redirect can ship the browser — and
   a hang is not a failure** (Session 15): any query param that becomes
   a post-auth `router.push` target is an OPEN REDIRECT (CWE-601) until
   proven otherwise — `/login?from_url=https://evil.example/phish`
   genuinely shipped the just-authenticated browser off-site (the
   network log carried `?_rsc=…`). The guard (`safeRedirectPath`):
   prefix checks + a WHATWG dummy-origin re-parse; only same-site
   absolute paths survive (D76). Likewise the HANG class: ADR-004's
   degrade-not-fail covers SDK FAILURES, not hangs — a black-holed
   `await` blocks the request forever with the UI's busy guard
   engaged; every external await needs a timeout that RESOLVES with
   the fallback (a hang is a degrade condition; a rejection still
   propagates — D78). And survey the DOCS-TRUTH layer: README promised
   `Retry-After` on 429s that no route emitted (D79) — pin what the
   docs claim. Related traps this session: the Bash output layer can
   SWALLOW `[m`-style character pairs from file contents (a
   `const [mode, setMode]` line DISPLAYED as `const ode, setMode]` —
   looked like a syntax error while tsc/esbuild/build were all green;
   hex-dump before believing a "corrupt" file), and the
   chunk-against-disk zombie check is BLIND when only JS changed (the
   CSS chunk name is content-hashed and the CSS was untouched — the
   old process served fresh static HTML from disk with its own stale
   hydrated JS; when ps//proc are process-blind, move the survey to a
   FRESH PORT with a fresh boot instead of trusting a reboot).
30. **Rate-limit the expensive endpoint, not just the sensitive ones —
   and probe authenticated APIs through the PAGE, not `page.request`**
   (Session 16): auth/newsletter/demo were all limited while
   `/api/workflows/generate` — the ONLY endpoint that costs real money
   per call — was unlimited (the probe drove 15/15 rapid authenticated
   POSTs all 200 in 8.1s). The fix keys the bucket PER-USER
   (`gen:${userId}` — the route is authenticated; an IP-keyed bucket
   would make a shared-egress office share one abuser's budget),
   overrides via `GENERATE_RATE_LIMIT_MAX` (the AUTH_RATE_LIMIT_MAX
   pattern), and keeps the CLIENT contract untouched: compose()'s
   `genRes.ok` degrade means a 429 still creates the template workflow
   — the feature never hard-fails, the limiter only caps the LLM spend
   (D80). The envelope also now carries `Cache-Control: private,
   no-store` at the ok()/fail() seam (Next protects dynamic PAGES with
   no-store but NOT route-handler JSON — D81), and
   `poweredByHeader: false` drops the X-Powered-By banner the live
   doesn't ship (D82). Survey-tooling traps: Playwright's
   `page.request` (APIRequestContext) REFUSES to send `Secure` cookies
   over plain http while Chromium page navigations treat 127.0.0.1 as
   trustworthy and DO send them — authenticated API probing must go
   through in-page fetches after a navigation; and after an API
   register, navigate DIRECTLY to the target page (a `/login` visit
   hits the S14 authenticated gate and redirects). Also: the DEV
   `db/custom.db` can DRIFT across sessions of probe traffic
   (S12–S15's pauses accumulated until every seeded workflow was
   paused — the resilience screenshot's Pause-button locator found
   nothing); re-seed with `npm run db:push && npm run db:seed` when a
   survey depends on the canonical workspace (e2e/smoke are immune —
   they boot fresh DBs).

31. **Identical envelopes can still leak through LATENCY — and a crashed
   script orphans its servers (Session 17).** The login 401 was
   byte-identical for unknown-email and wrong-password, but the unknown
   path SKIPPED scrypt: ~3.5ms vs ~34ms — a 9.8x median delta that
   enumerates registered addresses at 1,440 candidates/day/IP even under
   the rate limit (CWE-208). The fix pattern: burn a fixed-cost dummy
   hash (`dummyPasswordHash()`) whenever the lookup misses — the response
   never changes, only the timing floor flattens (pinned by the suite's
   first timing pin: 7+7 curl medians, ratio < 2.5x). The same session's
   RACE class: undici's fetch pool serializes on ONE socket — probing a
   TOCTOU window (findUnique→create) needs TRUE wire-level concurrency
   (independent sockets: parallel curl processes or http.request with
   keepAlive: false); the loser's unhandled P2002 was a bare 500 with an
   EMPTY body. And the zombie-server family gained a new member: a
   SYNTAX ERROR mid-script aborts bash AFTER the server-boot lines but
   BEFORE the kill — the orphan then answers a later run's fresh boot on
   the same port (the EADDRINUSE is silently swallowed; the health check
   sees the STALE process serving the OLD build — the S17 closed-gate
   smoke pins read "409 EMAIL_TAKEN" instead of 403 until the port
   moved to :3220). Boot-and-kill server blocks belong at the END of a
   script block or in a trap — and give every auxiliary server its own
   port.
32. **The Next.js 16 production runtime captures route-module console
   output — and `process.stderr.write` too (Session 18).** A boot-time
   diagnostic (the AUTH_SECRET warning) survived THREE channels' worth of
   silence: a module-init `console.error` executed with the login route
   answering and the log stayed empty; the instrumentation hook's
   `process.stderr.write` ran (proved by a diagnostic `appendFileSync`)
   and the log stayed empty; only `fs.writeSync(2, …)` from a STATIC
   `import { writeSync } from "node:fs"` reliably lands (a dynamic
   `await import("node:fs")` compiles to the turbopack chunk loader,
   which RACES at boot — hung on one boot, resolved on the next). Boot
   diagnostics belong in `src/instrumentation.ts` writing to fd 2
   directly. Related discoveries the same session: **`next build` COPIES
   the repo `.env` into `.next/standalone/`** (an unset-in-shell
   AUTH_SECRET is still SET from the copied file — probe the standalone's
   OWN `.env` when testing env-dependent boot behavior), and the
   `kill $PID; wait $PID` pattern proved UNRELIABLE in this sandbox (the
   :3030/:3033/:3044 zombies) — the parity battery's collapse to 0.0000
   with concatenated words is the zombie's gotcha-26 signature; prefer
   FRESH PORTS per boot-and-probe cycle.
33. **Catching an error REMOVES Next's log line — a wrapper must restore
   the operator's sight itself (Session 19).** Next.js logs UNhandled
   route errors (the Prisma stack + digest in the server log); the moment
   a wrapper catches the error to answer the INTERNAL_ERROR envelope, the
   stack VANISHES from the log — the catch must re-log via the fd-2 seam
   (`writeSync(2, …)`, the gotcha-32 channel) or the operator is blind to
   exactly the failures the wrapper now handles. Related traps the same
   session: **`redirect()` inside a try/catch is swallowed** — it throws
   a control error (NEXT_REDIRECT) that a page-level catch converts into
   the degraded view, silently breaking the authenticated gate (keep
   redirect calls OUTSIDE error catches — two narrow blocks beat one
   wide one); and **pass the base URL EXPLICITLY to every probe script**
   — a survey script that DEFAULTS its probe port silently evaluated a
   zombie serving a stale build while its runner booted a healthy fresh
   server on a different port (the "collapsed" parity was the tooling,
   not the build; diagnosed by CSS-links-vs-disk + counting
   stylesheets-in-Chromium, then re-probed on the verified port).
34. **The FRAMEWORK answers unexported methods with bare 405s — the
   method layer sits BELOW every handler (Session 20).** A GET on a
   POST-only route never reaches the handler or its `apiRoute` wrapper:
   Next.js itself answers `405` with an EMPTY body, NO content-type, NO
   `Allow`, NO cache-control (probed across 11 method-mismatch requests —
   the security-header set from `next.config.ts` DOES cover framework
   answers; only the envelope layer is absent). The fix is guard
   exports: `export const GET = methodGuard("OPTIONS, POST")` per route
   file claims the unimplemented methods for the envelope (the RFC 9110
   §15.4.6 `Allow` header arrives free via the `fail()` seam). Related
   discoveries the same session: **an explicit `OPTIONS` export replaces
   Next's auto-answer** (204 + Allow — the auto-answer enumerates EXPORTS
   and would over-report once guards exist); **POST/PATCH route handlers
   buffer the full body at `request.json()` with no framework ceiling**
   (a 50MB login body was fully parsed in 314ms — read the DECLARED
   `content-length` BEFORE the parse: the `bodyTooLarge` guard rejects
   128KB+ bodies at the header, 91ms, nothing buffered; chunked bodies
   without a declaration are the proxy's residual to cap — DEPLOYMENT.md
   §2); and **a raw-fetch word-parity probe of the LIVE reads the
   un-hydrated SPA shell** (every route "collapses" to ~130 words — the
   honest comparison renders BOTH sides in Chromium and diffs
   `document.body.innerText`; the same class: the live's `/dashboard`
   server-status is 200 for ANY route — the SPA 404 is the RENDERED
   content, adjudicate on what the client sees).
35. **Cap the OUTPUT side too — and pair every list ceiling with honest
   aggregates (Session 21).** S20 capped what a request may CARRY (the
   128KB input ceiling); the OUTPUT side was unbounded: `GET
   /api/workflows` had no `take` (probed: a 400-workflow user's GET
   answered a 134.5KB body, the dashboard mounted 400 article cards —
   9,649 DOM nodes — while the runs chart sliced to 8; the LIST rendered
   everything). The fix rides SQL `take: MAX_WORKFLOW_LIST` (the
   wire-level cap, not a client slice) AND moves the stat cards to
   server-side aggregates shipped as the envelope's additive `meta`
   sibling — because a capped list without honest aggregates silently
   turns the four stat cards into subset summaries (a ceiling that lies
   is worse than no ceiling). The `meta` field is strictly OPTIONAL in
   the client (the e2e error-boundary mocks fulfill with bare arrays and
   must keep working). Related discoveries the same session:
   **`POST /api/workflows` was the ONLY unthrottled mutation** (auth,
   newsletter, demo, generate all carry limiters — a script minted
   unbounded rows with one tiny JSON POST each; now `workflowRateLimit`,
   30/USER/15min, `WORKFLOW_RATE_LIMIT_MAX` override);
   **Playwright's `context.cookies(url)` filters SECURE cookies on plain
   http** — 127.0.0.1 is trustworthy for NAVIGATION (the cookie is sent)
   but cookie ENUMERATION with a URL argument drops it; enumerate with
   `context.cookies()` (no args) and match by name (the gotcha-30
   family); and **a `setsid`-detached survey server OUTLIVES its
   diagnostic session** — the next runner's fresh boot on the same port
   hits a silently-swallowed EADDRINUSE and probes the STALE build (the
   gotcha-26/31 family's fourth member — kill detached servers
   explicitly, or probe on fresh ports).

36. **Race the WRITE, don't check-then-write — and pin the ownership at
   the wire (Session 22).** S17 closed CREATE's race (P2002 → the 409
   classifier); the `[id]` PATCH/DELETE routes still ran
   read-check-act (`findFirst` → parse → `update`/`delete` by bare id):
   a DELETE committing while a slow under-ceiling PATCH body parsed threw
   UNCLASSIFIED P2025 → the 500 INTERNAL_ERROR envelope for a legitimate
   two-tab user (probed 3/3; the parallel DELETE double-fire hit 500 in
   2/5 — nondeterministic). The fix carries the ownership predicate IN
   the write (`updateMany`/`deleteMany` with `userId` in the WHERE;
   count 0 → the honest 404) — closed by construction, not by catching
   the symptom (`updateMany`/`deleteMany` never throw P2025). Two
   adjacent traps probed the same session: **Prisma's
   `updateMany({data:{}})` is a no-op returning count 0 EVEN FOR AN
   EXISTING ROW** — an empty-patch contract needs its own read branch;
   and the ownership (IDOR) guard had NO wire-level pin anywhere — the
   cross-user battery (user A on user B's row → 404 ×3) now pins it
   (a dropped `userId` regression is a guaranteed smoke failure, not a
   silent hole). Smoke-pin authoring traps: curl's `-w '%{http_code}'`
   writes NO trailing newline (a concatenated `cat c*` can never match
   `^200$` — count per-file), and bash's `${f/c/r}` substitution
   rewrites the FIRST 'c' anywhere in the path (a mktemp dir name) —
   pair files by explicit index.

37. **The CLIENT dispatches failure classes too — and a stale client
   snapshot can beat the truth (Session 23).** S13's law ("failure
   CLASSES need distinct UI contracts") did not stop at the wire: S22
   made the raced PATCH/DELETE answer the honest 404, but the client
   catch still wore the retry-lie banner ("Try again" — every retry
   404s forever) and kept the ghost row mounted. The client now
   mirrors the truth: a 404 drops the row locally + re-syncs + the
   polite `role="status"` announce (PATCH: "no longer in the
   workspace"; DELETE: the IDEMPOTENT-SUCCESS "already removed"), the
   `SessionExpired` early-return keeps 401s banner-free by
   construction, and only the RETRYABLE classes (network faults)
   keep the banner. The sibling trap: `refresh()` had no in-flight
   ordering guard — two concurrent actions on DIFFERENT rows (busyId
   only guards one row) fire two GETs, and a delayed stale snapshot
   landing LAST resurrected the deleted row (probed deterministically
   via route-delay); a `useRef` sequence counter drops any response
   superseded by a newer refresh. Pin-authoring traps this session:
   **Next.js's route announcer is itself a `role=alert` element
   carrying the page title** — an unfiltered alert-count pin can never
   pass; filter by text (the session-lifecycle pattern). And
   survey-tooling (the gotcha-30 family): **a `page.route` mock's
   `**/api/workflows` glob does NOT match `/api/workflows/[id]`** —
   the capture script's error-boundary Pause-click escaped the mock
   and landed on the dev DB (the seed checksum covers names/rows, not
   statuses — two sessions closed "canonical" with paused rows);
   cover the [id] routes in the regex and verify the dev DB logical
   state (rows + active count + runs sum) before AND after capture
   runs.

38. **A hang is not a failure — and a failure surface must not outlive
   its action (Session 24).** No client fetch carried a timeout: a
   black-holed request (a stalled connection — the CLIENT twin of
   S15's server-side hang) neither resolves nor rejects, so the
   dashboard's busyId spinner stayed engaged FOREVER with no banner
   and no recovery (the S12 resilience pins cover aborts, which
   reject immediately — the hang class was invisible to the gates
   until probed with a never-fulfilling `page.route`). Every client
   fetch now rides `fetchWithTimeout` (`src/lib/client-fetch.ts`, 20s
   — above the server's own 10s SDK ceiling), converting the hang
   into the existing network-fault contract. Pin it with Playwright's
   `clock` API (`page.clock.install()` + `fastForward`) — the 20s
   ceiling costs milliseconds; an inert fetch MOCK cannot observe the
   abort rejection (unit-pin the seam against a REAL hung TCP
   socket). The sibling law: every action start clears BOTH error
   surfaces — a "Try again." banner left mounted after a SUCCESSFUL
   unrelated action is a lie by staleness. And the first-run placement
   trap (this session's in-vivo RED): the seed and db:push now resolve
   through the db-path seam and PRINT their target (`seed-target:` /
   `[db] DATABASE_URL=`) — the seed must always write where the app
   reads; the sandbox's shell-exported absolute `DATABASE_URL` +
   parent `.env` (gotcha 1's vectors) silently redirected a whole
   first-run to a foreign database while login answered P2021.

39. **Every ceiling must say what it hides — and pin the budgets you
   measured (Session 25).** The runs chart rendered `slice(0, 8)`
   silently: with a 12-row workspace it showed 8 bars with no note while
   the heading read "Runs by workflow" — the same lie the workflow LIST
   was fixed for in Session 21 ("a ceiling that lies is worse than no
   ceiling"); the chart's ceiling never got the honesty because no probe
   ever held >8 rows. Now `CHART_ROWS` + the S21-pattern note with the
   TRUE total (D104) — and the survey discipline: probe EVERY capped
   surface with data that EXCEEDS its cap (the seeded 6-row workspace
   hides every ceiling above 6). The sibling law: performance budgets
   measured ad hoc are REGRESSIONS WAITING — the S21/S22 LCP/DOM-node
   ceilings now live in `tests/e2e/performance-budget.spec.ts` with 2–4x
   margins (the budget catches GROSS regressions, not milliseconds —
   generous ceilings are the de-flake strategy, not a weakness). And the
   a11y twin: a chart's rows are a LIST — div soup never announces
   "list, N items" to a screen reader (now `ul`/`li`, D105); when you
   add a note to a dark card, reach for `text-white/50` FIRST — this
   session's own first draft shipped `text-white/40` and the axe scan
   caught it at 3.5:1 (the S10/D59 lesson: the scan only catches what
   RENDERS — the LIST's S21 note carried the same latent violation for
   four sessions because it needs a >100-row workspace to appear).

40. **A ranked surface must rank by its own title — and the cap can hide
   the champion entirely (Session 26).** The runs chart under the heading
   "Runs by workflow" charted `workflows.slice(0, 8)` — the 8 most
   RECENT rows, mirroring the list: a 12-row workspace whose OLDEST row
   carried 12,000 runs rendered the champion INVISIBLE with every bar a
   4%–7.5% stub (the `maxRuns` denominator came from a row the chart
   never displayed — the bar-length encoding carried no information
   exactly when a runs ranking is meaningful). The survey discipline:
   probe every RANKED surface with a workspace whose top row by the
   ranking key is NOT the newest row (the seeded 6-row workspace hides
   the question — recency and rank coincide). And the deeper trap found
   while designing the fix: at >100 workflows the client's `workflows`
   state is the CAPPED newest-100 list — every old high-run row sits
   OUTSIDE the cap, so ANY client-side ranking ranks only the newest 100
   (the smoke 111-row workspace: the champion sits in ZERO of the
   newest-100 rows). An honest ranking over capped data must be
   SERVER-SIDE — the envelope's `meta` sibling (the S21 stat-cards
   precedent) carries `topRuns` across the FULL workspace; the client
   keeps a pure fallback seam for the meta-less contract. The VLM twin:
   a single-frame screenshot of an ANIMATED surface (the gradient
   heading's 14s sweep) can catch a white-dominant instant — adjudicate
   with a time-sampled probe before believing "missing" (the gotcha-15/24
   single-frame family), and write the check prompt FROM the spec's
   pinned assertions (the hero's video is the full-bleed BACKGROUND —
   `section video` pinned by src — NOT a mockup card; twelfth drift).

41. **A stat card's aggregate must weight by what it aggregates — and a
   `finally` block's `process.exit(0)` swallows the in-flight error
   (Session 27).** The card labeled "Avg success rate" rendered Prisma's
   `_avg successRate` — the UNWEIGHTED mean over workflows: with one
   12,000-run row at 60% and four 3-run rows at 100% it displayed 92.0%
   while the workspace's true (run-weighted) rate was 60.0% — the
   average-of-averages fallacy, displayed directly beside "Total runs
   12,012" (the run-share reading it invites). The law: a workspace-level
   rate must weight by RUNS (`Σ(runs × successRate) / Σ(runs)` — the
   share of runs that succeeded), computed server-side through a pure
   seam shared by the route, the page, and the client fallback; and the
   label + the wire field NAME their criterion ("Success rate" /
   `meta.stats.successRate` — a field named "avg" carrying a weighted
   rate would be the gotcha-40 chart lie one layer down). The pin
   discipline: a discriminating smoke pin needs probe data where the
   semantics DIVERGE (the 105 volumetric probe rows at successRate 50:
   unweighted 52.7 vs weighted 93.1 — at the old 99.5 BOTH rendered
   99.5%, pinning nothing). The tooling twin (caught the same session):
   the standing screenshot capture script failed mid-run after shot 13
   — and its `finally` block's `process.exit(ok ? 0 : 1)` PREEMPTED the
   pending catch handler, so the S26 run "succeeded" (exit 0) having
   refreshed only 17 of 20 shots; never exit 0 from a finally, and check
   the COMPLETION log line, never the exit code alone (the gotcha-32
   channels family — a swallowed channel lies).

42. **A seam's arithmetic is part of its contract — and the suite's own
    budgets grow with it (Session 28).** The "Hours saved" card had two
    computations behind one definition: the SERVER loaders (SQLite's SUM
    — extended-precision, grid-exact at every probed shape) and the
    CLIENT's fallback memo (a naive JS float reduce — ORDER-DEPENDENT at
    exactly-x.5 decimal shapes: [15.4, 17.9, 15.2] is 48.5 in decimal but
    48.499999999999993 in the list's addition order, displaying 48 where
    the server displayed 49 — four of six probed shapes diverged by 1).
    The law: when a value is computed at MORE THAN ONE seam, the
    arithmetic itself must be shared and ORDER-FREE — `sumHours()`
    accumulates INTEGER TENTHS (associative by construction) and every
    persisted hours value sits on the 0.1 grid (POST hardcodes 0; PATCH
    never writes hours), so the exactness is closed by construction, not
    by rounding luck. The survey corollary: extend a boundary probe to
    the CLASS — the runs sum (integer) was exact everywhere, and the
    run-weighted rate survived a 50,000-shape flip search (the
    large-magnitude integer-weighted products keep the toFixed(1)
    display stable) — both adjudicated CLEAN and documented so the next
    session does not re-litigate. And the tooling twin (caught the same
    session): the e2e suite's OWN auth flows grew to ~45 per run and
    crossed the webServer's `AUTH_RATE_LIMIT_MAX=50` mid-suite — the
    Session-11 razor-edge pattern recurring after 17 sessions of spec
    growth; the 429s landed on the LAST files alphabetically
    (session27/session28) while an isolated re-run passed 3/3, the
    signature of a budget exhaustion, not a defect. When the suite
    grows, re-count EVERY per-process budget it consumes — a pin set at
    the suite's size at authoring time is a razor edge at the suite's
    size two cycles later.

43. **Playwright RESTARTS the worker after a failed test — a
    state-sharing spec's module-level identifiers silently regenerate
    (Session 29).** The first-run spec's first authoring had one `await`
    bug in test (a) (`expect(statValue(...))` receiving a Promise —
    `expect(pending).toBe("0")` fails instantly); the failure RESTARTED
    the worker, the spec module RELOADED, the module-level
    `Date.now()`-suffixed EMAIL regenerated, and `beforeAll` re-ran in
    the new worker — registering a NEW user: test (b) then ran against
    an EMPTY workspace (chart 2 ≠ 3) and test (c) read ZERO rows for
    "the" user — the secondary failures pointed at the WRONG layer
    ("the wire and the file disagree" was the tell that the STATE, not
    the code, had split). Two laws: mark state-sharing groups
    `test.describe.serial` (fail-fast — the remaining tests SKIP
    instead of running against split state; also applied to
    session28-tie-break retroactively), and always diagnose the FIRST
    failure in a run — the cascade after a worker restart is noise.
44. **A `fullPage: true` screenshot captures beyond-viewport content
    WITHOUT scrolling — the IntersectionObserver-driven Reveal
    entrances never fire for below-fold sections, so they render as
    blank dark bands (Session 30).** The first 20-shot refresh
    produced a landing-full shot whose pricing/testimonials bands were
    empty black and section shots captured mid-entrance (the rAF
    entrances run delay + 600–900ms AFTER the IO trigger — a
    screenshot immediately after `scrollIntoViewIfNeeded` catches
    opacity ~0). The fix: a SCROLL-THROUGH pass before the capture
    (viewport steps, ~140ms pauses — every IO fires, every entrance
    settles) plus a post-action settle. Verify the captured bands with
    a VLM read (or pixel-variance), never the exit code alone.

45. **Next 16's client metadata resolution APPENDS head tags AFTER the
    mount effects run — first-match selectors on both the fix AND its
    pin are blind to the appended copies (Session 32).** The 404's
    canonical fix (S31) mutated `querySelector`'s first match at effect
    time while Next's hydration-inserted second copy (still pointing at
    the internal `/_not-found` id) appeared between the effect and the
    first settle — the S31 pin read first-match too, so the duplicate
    survived a full session hidden behind the SAME blind spot on both
    sides. Two laws: (a) a DOM-normalizing effect on framework-managed
    head tags needs a MutationObserver on `document.head` (childList)
    to catch the late insertion — normalize-all + re-normalize,
    idempotent, disconnected on unmount; and (b) pin the COUNTS
    (`querySelectorAll().length`), never just the first match — a
    duplicate-tag class is invisible to every first-match assertion by
    construction. Related the same session: the battery's head-tag SET
    column (the seventh surface) is what caught the twitter:url gap the
    four-tag sixth column structurally could not see — measure WHICH
    tags exist, not just the values of the ones you know about.
46. **A rebuilt Next standalone RENAMES its server process to
    `next-server (v1…)` — argv-based process greps and pkills are
    BLIND to it (Session 33).** The zombie-server family's newest
    member: a probe server left holding :3270 (its PORT rode the
    ENVIRONMENT through `setsid env PORT=… node …`, so `pkill -f
    "PORT=3270"` matched nothing), then the rebuild replaced
    `.next/standalone`'s chunks — the stale server served HTML whose
    chunk references 404'd, so every page rendered UNSTYLED: innerText
    lost its flex-layout whitespace ("FeaturesHow It Works" — the
    gotcha-26 concatenated-words signature), the burger never opened
    its panel, and the battery faked word-parity + mobile-nav drifts
    on an otherwise-clean run. The laws: kill zombies by PORT (`ss
    -tlnp` → the PID — the process NAME cannot be trusted after Next
    renames it), and treat a sudden multi-surface drift right after a
    rebuild as a ZOMBIE first, a regression second. Related the same
    session: the battery's DOM-attribute SET column (the eighth
    surface) is the tag-SET law's generalization to the body — and an
    adjudicated superset that lives only in gitignored scratch is a
    superset that can silently grow; the registry
    (`src/lib/head-superset.ts`) is the versioned answer.
47. **The SET column's twin measures VALUES — and a shared attribute's
    carrier COUNT is library structure, not a value drift (Session
    34).** The battery's ninth surface (the shared-attribute VALUE
    column) caught the /faq `data-state`/`data-orientation` delta on
    its first run: the live's Radix Accordion stamps both attributes
    on EVERY accordion node (Item + Trigger + Content — ~3x the
    clone's carriers) while the values themselves ("closed"/
    "vertical" at rest) sat at parity. The law: compare the distinct
    VALUE SET for a registered (attr, route) pair (`DOM_VALUE_RULES`
    in the registry — a spelling drift like "closed"-vs-"collapsed"
    still surfaces) and adjudicate the carrier-count delta as the
    library's wrapper structure (the D125 "never simulate a library's
    internals" law one layer deeper) — never stamp extra carriers to
    chase multiset parity. Related the same session: the head-tag SET
    column's scope is the SEMANTIC head — the bundler's loading rels
    (preload/modulepreload/stylesheet/prefetch/preconnect/dns-prefetch)
    are chunk-loading instrumentation, byte-different by construction
    between Next and the live's rolldown; and a rebuilt battery must
    re-derive its collectors from the registry's route spellings (the
    404 twin is `/does-not-exist-404`, or the registered robots entry
    reads as drift). The live's burger carries NO `aria-expanded` —
    the shared mobile-nav selector is the `md:hidden` nav button.
48. **A computed-STYLE inventory needs its normalization contract —
    and a rendered-ness check needs the BOX, not the computed display
    (Session 35).** The battery's tenth surface (the twice-deferred
    style-inventory candidate — shipped only after its contract was
    designed) caught three real drift classes on its first run after
    34 sessions of class-string parity: the live's dark bundle ships
    a CUSTOM radius scale (`rounded-sm` 8px, `rounded-lg` 12px — the
    tracking-scale family one layer deeper; pin `--radius-sm`/
    `--radius-lg` in `@theme`), a light login `--muted` under an
    opaque gradient (the F5 `--border` family — inert, pinned for
    computed parity), and a one-off `text-white/50 italic` note
    paragraph. The contract that made it honest: compare COLORS as
    VALUE tuples (rgb/hex/hsl/oklab/oklch all parse — gotcha 4's law
    at fleet scale), lengths with 0.5px tolerance plus the
    FULL-radius equivalence class (9999px ≡ 33554432px — v3's
    rounded-full vs v4's `calc(infinity × 1px)`; and Chromium
    serializes the latter in SCIENTIFIC NOTATION: "3.35544e+07px" —
    parse the float, never the string shape), a semantic property
    whitelist EXCLUDING the animation-touched and layout-engine
    properties, and the text-bearing element anchor with an
    element-count guard. The twin trap: a child inside a
    display:none SUBTREE still computes its OWN display ("block"),
    so `getComputedStyle().display === "none"` misses every element
    under a mounted-hidden ancestor — `getClientRects().length === 0`
    is the rendered test (safe for fixed-position chrome too). And
    the ARIA twin: an aria-controls reference to an UNMOUNTED panel
    is DANGLING — the live's Radix regions mount hidden at rest
    (the S4 "Radix unmounts closed content" record described the
    pre-hydration SPA shell, not the rendered DOM); compare ID-REF
    attributes by RESOLUTION in each side's own document, never by
    the per-library namespace spelling (the registry's `id-refs`
    rule type).


49. **Chromium serializes some v4-default palette tokens through
    `lab()` — and an anchor-scoped surface never sees a carrier
    outside its anchor (Session 36).** The battery's eleventh surface
    (the interaction-surface column — the S6 hover-probe discipline
    automated: the k-th rendered interactive element measured at REST,
    under REAL `page.mouse.move` [gotcha 16], and under REAL keyboard
    Tab focus [the focus-VISIBLE contract — a programmatic
    `el.focus()` never matches `:focus-visible` on links/buttons])
    caught the clone's v4-default "exact match" tokens (Session 9's
    deliberately-unpinned list) computing to `lab(…)` spellings where
    the live ships `rgb(…)` — hover:bg-slate-50 on the login Google
    button + the 404's Go Home, border-gray-200 on the features
    AI-chip. Probed IN VIVO: the VALUES are rendering-identical
    (maxΔ=0 through the lab→sRGB conversion) — the gotcha-4 law one
    layer deeper, so the battery's `parseColor` grew `lab()`/`lch()`
    parsers. But the FIX follows the Session-9 slate-200
    byte-stability precedent instead: a USED value-identical token
    gets PINNED to the v3 hex (`--color-slate-50: #f8fafc`,
    `--color-gray-200: #e5e7eb`, `--color-gray-100: #f3f4f6`) so the
    computed serialization is byte-stable. The twin trap (D136):
    `bg-gray-100` rides a painted STRUCTURAL wrapper (the features
    chip-row) that NO battery anchor measures — not text-bearing, not
    a media-leaf (the D125 wrapper family is excluded by design) —
    found only by directed grep over the remaining unpinned tokens +
    an in-vivo probe. The law: anchor-scoped surfaces see their
    anchors; token-level byte-stability is an @theme concern — sweep
    the UNPINNED token list against the app's actual class usage, not
    just what the surfaces catch. Related the same session: the
    battery runs PHASE-SPLIT (main/hover/focus/extra — the sandbox
    reaps long-detached runs; a silently-empty log with no EXIT line
    is the signature), and a hover read should be a STABLE-POLL (two
    consecutive equal samples or the 700ms cap — the S11
    settled-value lesson automated), never a single sample.

50. **Three tooling traps that manufacture false readings (Session 37).
    (a) The standalone server FORKS** — `node .next/standalone/server.js`
    spawns a `next-server` child; killing only the wrapper ORPHANS the
    child (reparented to init, PPID 1) and it keeps serving a STALE
    build forever — and a naive health check then "passes" against the
    zombie while every reading after it is a lie (measured: a
    post-gradient-fix battery read `clone=0 gradient carriers` against
    the zombie's pre-fix build). The discipline: spawn DETACHED (own
    process group), kill the GROUP (`process.kill(-pid, "SIGKILL")`),
    and GUARD the port (if :3300 answers a health check before you
    spawned, a zombie holds it — fail loudly).
    **(b) An incremental build can serve a MIXED build** after editing
    a route-scoped `<style>` template (and possibly any
    hydration-sensitive text): the HTML and the client chunk disagree
    and the page throws React #418 (text mismatch) at LOAD with NO
    code defect — it flunked 4-6 e2e specs per run and survived two
    bisect rounds before the clean-rebuild control caught it. The
    discipline: `rm -rf .next` before any gate build; an intermittent
    #418 on an untouched route is the signature.
    **(c) Interaction-state measurements need THREE laws** (each
    manufactured its own false-drift class on the pointer twin's first
    runs): the SCROLL-SETTLE law (both sites ANIMATE programmatic
    scrolls — the clone's Lenis, the live's CSS scroll-behavior — so a
    geometry read at +60ms is MID-ANIMATION and the mouse lands
    off-target; poll scrollY to a stable pair first), the ATOMICITY
    law (read geometry and press on the SAME side back-to-back — a gap
    lets late layout shifts move the element out from under the
    pointer), and the VERIFIED-POLL law (a state reading is accepted
    only when `:hover` matched throughout the poll — anything else is
    a retry, never a drift; record the `:hover/:focus/:active`
    matches with every reading). A drift line without its state
    signature is unadjudicable.
51. **`animation-name` is library-blind (Session 38).** The live animates
    its mockup/dots/skeletons through framer-motion INLINE WRITES — the
    computed `animation-name` stays `none`; the clone reproduces the same
    loops as CSS keyframes. An animation-name column would read ~16
    phantom "clone-only carriers" (all library-internal — the D125 law
    at the animation layer). The honest animation surface is
    LIBRARY-AGNOSTIC: time-sample the computed values (the LOOP
    inventory), and compare CSS-animation CONTRACTS (name, duration,
    delay, keyframe stops) only where both sides HAVE CSS animations —
    the Web Animations API's `el.getAnimations()[0].effect.getKeyframes()`
    is the definitive extractor (exact offsets, exact transform
    spellings — author the clone's keyframes with the LIVE's own
    function spellings, e.g. single-arg `translate(-12.84px)`, or the
    WAAPI strings never compare equal). Two measurement laws ride with
    the surface: the LONG-SETTLE law (the live's framer entrance springs
    RING for seconds after the scroll-through — a wrapper measured
    cycling `o 0.804..1, ty 0.44..11.66` at +500ms and FULLY at rest
    after 2.5s; sample only after a 2.5s settle or the ring
    manufactures a phantom looper), and the WINDOW-COVERAGE law (a 4.6s
    window cannot converge a 14s background-position cycle — compare
    the family + movement evidence + the WAAPI duration, never a
    jaccard across phases).
52. **Four measurement laws for the resting/period surfaces (Session
    39).** (a) The DWELL law: the live's below-fold `whileInView`
    entrances require the element HELD in view (~450ms per section), not
    transiently passed — a fast smooth-scroll pass leaves entrances
    UNFIRED (an overview card read stuck at inline `opacity: 0;
    transform: translateY(30px)` while a direct scroll-and-hold settles
    it), and every resting-state surface sampled after (the stacking
    inventory included) reads pre-entrance fiction. (b) The
    REAL-TIMESTAMP law: a sampled period must use `performance.now()`
    deltas, never the nominal `index × interval` — timer clamping
    inflates the nominal clock ~10% and EVERY period under-reports;
    same-direction crossings are ONE full period apart (never halve or
    double them), and a missed shallow trough merges two cycles — use
    the MEDIAN gap. (c) The VARIANT-CONFLICT law: the live's framer
    elements can carry BOTH `whileInView` and `animate` writers on the
    same property — the rendered value is an unstable race (the
    chevron's authored `y:[0,−15,0]` measured at 0.04–4.4px across
    loads, never −15); the authored config (read from the live's own
    JS bundle) is the only stable contract — adjudicate rendered-
    amplitude findings against the BUNDLE before fixing. (d) The
    EVAL re-catch: `page.evaluate("async () => …")` does NOT
    auto-invoke in this Playwright version — `eval()` the string
    first or it returns `undefined` SILENTLY (the S37 trap, caught
    twice again this session). (e) The PER-BREAKPOINT DWELL clause
    (Session 40): a viewport change re-renders and RE-ARMS the
    below-fold `whileInView` entrances — every breakpoint re-measure
    needs its own scroll-and-hold pass. The un-dwelled responsive
    probe read the live's problem-section mockup card at 262×311 (its
    UNFIRED initial `scale(.95)` — the bundle authors
    `initial:{opacity:0,scale:.95} → whileInView:{opacity:1,scale:1}`)
    vs the clone's true 276×327, cascading +30px fictions into every
    section below; under dwell both sides settle at `transform: none`
    with byte-identical rects. (f) The FULL-WALK law (Session 41): a
    focus-order walk ends ONLY on `<body>` — consecutive UNNAMED
    controls are legitimate stops, never a stall signal (the first
    390 walk read FIVE stops because three icon-only feature tabs
    share one tag|href|name key; the true walk is 28 stops on both
    sides — and the tab inventory is VIEWPORT-dependent on both
    sides, so the surface pairs WITHIN a viewport, never across).
53. **A "by design" record is a HYPOTHESIS about the reference's
    intent — re-verifiable, and sometimes WRONG (Session 43).** Two
    long-standing records fell to directed probes: (a) the S14 story
    "the live's /thank-you newsletter-success route has no clone
    equivalent by design" — the A2 probe (fill + submit the live's
    footer newsletter form) showed the live's form does NOT navigate
    to /thank-you at all (the submit stays at `/`, an inline fetch
    flow — exactly the clone's own S14 inline-confirmation superset);
    the page is the CHECKOUT-success destination, the live serves it
    working (36 words, in its own sitemap), and the clone 404'd it —
    the ONLY route where the clone soft-404'd what the live serves
    working (D147: built at the measured parity contract). (b) The
    S40/D146 record claimed "the clone's /pricing continues as a
    fully working page — the documented superset route" — the git
    history has NO `src/app/pricing/` (the route NEVER existed); the
    clone's /pricing serves the honest real 404 and BOTH sides fail
    that route (the pricing content lives in the landing's #pricing
    section on both sides). The lesson: a registered design decision
    is a claim about WHY a delta exists — when a new surface walks
    over the territory, PROBE the claim before honoring the record
    (a route extension exposed (a); a clone-side battery check
    exposed (b), which three sessions of live-side-only route-watch
    checks structurally could not). The route-watch now asserts BOTH
    sides: the live's soft-404 set AND the clone's working-set truth
    (the supersets are /demo + /dashboard only).

54. **Three measurement laws that manufactured false readings (Session
    44).** (a) The UNPROBED-ASSUMPTION law: the recon's /FAQ probe
    measured the live's HTTP 200 and the battery's first draft ASSUMED
    a rendered SPA-404 (the soft-404 family analogy) — the adj3 probe
    showed the live serves THE FAQ PAGE ITSELF there (its SPA router
    matches case-insensitively) — a route's RENDER is a separate
    measurement from its STATUS; never assert content behavior from a
    status-code analogy (the D149 build existed only because the
    assumption finally got probed). (b) The INVERTED-PROBE law: a
    same-document navigation test that compares a window mark against a
    comparator DESTRUCTURED UNDER THE WRONG NAME reads `undefined ===
    undefined` — TRUE on the full-load side (the mark is gone) and
    FALSE on the client-nav side (a string never equals undefined) —
    exactly backwards; the decisive route-change instrument is the page
    `load`-event counter (fires ONLY on full document loads), paired
    with the mark. (c) The NEGATIVE-ZERO law: `Math.round()` on a
    sub-pixel-negative rect top (a Lenis settle at -0.0001px) returns
    `-0`, and Playwright's `toBe` uses `Object.is` where `-0 !== 0` —
    normalize geometry reads with `Math.abs(Math.round(...))`. Riding
    along: the SETTLE-every-read law (every post-click geometry read
    needs the scroll-settle poll — the read at +0ms is mid-animation)
    and the TRUE-FRESH-LOAD law (a `goto` from another hash on the
    same origin is a SAME-DOCUMENT hash-change the SPA's handler
    scrolls; navigate from `about:blank` to measure the fresh-load
    class).

55. **Three measurement laws + one platform quirk (Session 45).**
    (a) The HEADLESS-SEEK-STALL law: a programmatic `currentTime`
    seek on an autoplaying muted `<video>` in headless Chromium
    NEVER resolves — the element reads `seeking: true, paused:
    true` forever at the seek target, IDENTICALLY on the clone and
    the live (probed both) — the video loop SEAM is unmeasurable
    headlessly; pin the `loop` ATTRIBUTE + the advancing clock
    instead, never the wrap behavior. (b) The React
    muted-attribute SSR quirk: React NEVER serializes `muted` to
    the `<video>` markup through server rendering — the live's
    attribute-less HTML sets the property at mount (hydration-
    timing-dependent autoplay); the clone's SSR `muted` attribute
    is the robust contract (D154, registered — never remove it to
    chase attribute parity). (c) The APIResponse.status METHOD
    trap: Playwright's `APIResponse.status` is a METHOD — a
    property read (`res.status`) yields the function itself,
    which `JSON.stringify` silently DROPS (the recon's first
    status sweep read `{}` — an empty object that looked like
    "no data", not an error); call `.status()` or use raw fetch.
    (d) The traversal-class instrument: the back/forward
    navigation class is measured by the page `load`-event counter
    + the window-mark survival (the D152 instruments extended) —
    the clone's popstates restore scroll exactly (4620 -> 4620)
    while the live's full reloads dump the user at 0 with no
    bfcache (D153, the registered platform superset).

56. **The dormant-overlay affordance law + the survey-script zombie-port
    law (Session 46).** (a) A visually invisible container with
    `pointer-events: auto` sitting over an interactive control is a REAL
    broken affordance, not a cosmetic one: the live's two dormant
    react-hot-toast containers (`fixed top-0 z-[100]`, 32px tall, 0-1
    children) cover the top two-thirds of its own burger icon at 390 —
    real pointer clicks at the icon's upper/center points hit the
    TOASTER and the menu never opens (D160, measured with the hit-target
    map: `elementFromPoint` + the three-point click census; only the
    y36 sliver works). Measure clickability as a MAP over the control's
    box, never a single center click — a center-click test would have
    read "broken" for a menu that opens at 2/3 of the icon, and a
    JS-dispatched click would have read "fine" for an affordance real
    users cannot press. (b) Every script that boots a standalone server
    for a survey must clear the port by PID before AND after (the
    gotcha-46 law applied to one's OWN runners): `kill $SERVER_PID`
    kills only the `node server.js` parent — the server RENAMES itself
    `next-server (v16.x)` and the renamed child SURVIVES, holds the
    port, and silently answers every later "fresh" boot (EADDRINUSE in
    the overwritten log; the scripts keep talking to a stale process
    with a stale build and a foreign AUTH_SECRET — the S46 shot-14
    false redirect-loop, diagnosed through the cookie-vs-page
    divergence). Sweep `ss -tlnp` for the port and `kill -9` every PID
    it reports.

57. **The print-pipeline exposure law + the record re-verification law
    (Session 47).** (a) An un-revealed below-fold entrance is INVISIBLE
    to every dwell-loaded surface — the style inventories, the loop
    censuses, and the word-parity checks all read POST-SETTLE truth
    (innerText INCLUDES opacity-0 text) — and to the print pipeline it
    is invisible BY OPPOSITE: `page.pdf` paints only settled content,
    so an entrance-layer gap surfaces as tokens MISSING from the PDF.
    The print-text layer (pdftotext on the page.pdf output) is the one
    instrument that sees the un-revealed set — it exposed TWO entrance
    gaps (the per-wordmark fades + the CTA whole-block wrapper) that
    39 sessions of dwell-loaded surfaces structurally could not. The
    naive PDF stream regex is blind to Chromium's CID-subset font
    encodings (/faq read 14 words through it) — poppler's pdftotext is
    the honest extractor. And a parity delta that COLLAPSES to zero
    after the gap build (291 -> 251 = the live's 251) is the strongest
    confirmation the build reproduced the reference's mechanism —
    predict the convergence BEFORE building, then measure it. (b) A
    "by design" record is a HYPOTHESIS about the reference — when a
    new surface walks over its territory, PROBE the record (gotcha
    53's extension): the S8 F1-EXTRA "the live animates ONLY the
    badge pill" and "the wordmark cloud is NOT a motion element"
    records both fell to the S47 print probe — the container record
    survived (re-verified true), the badge-only scope was wrong for
    today's live (the moving-target law: the reference is a
    redeployed app, and its motion scope changed under the record).

58. **The build-pipeline drift law + the two mobile-nav instrumentation
    laws (Session 48).** (a) An EXTERNAL supplier can break a pinned
    toolchain with ZERO local changes: Google's css2 endpoint changed
    its Playfair Display serving (every requested wght now dedupes to
    ONE variable-font URL), and Next 16.4.0's Turbopack
    NextFontGoogleFontFileReplacer asserts "exactly one entry" per
    URL query — the pulled tree failed `npm run build` with 16
    module-not-found errors at the font module. Diagnose through the
    supplier's CURRENT responses (curl the css2 URL — the four
    @font-face blocks sharing one gstatic URL is the smoking gun),
    fix at the CORRECT semantic layer (`weight: "variable"` for a
    variable font — the discrete form re-trips the assertion; the
    range form "400 700" is rejected by Turbopack's own validator),
    and PIN the rendered contract (the served CSS's variable
    registration) so the next supplier drift surfaces as a RED test,
    not a broken pipeline. (b) The mobile-nav instrument: an
    aria-keyed panel detector is BLIND on the live (its burger
    carries no aria-expanded — the S41 a11y-superset record); the
    honest detector is the ROW-CONTRACT one (the bg-black/95 +
    backdrop-blur container passing the rendered-ness BOX check).
    And the live's SPA attaches click handlers at HYDRATION — a
    click at domcontentloaded+700ms silently no-ops; networkidle +
    a 1s dwell is the minimum honest wait before ANY live-side
    interaction probe.


59. **The silently-dead capture-interaction law (Session 49).** A
    screenshot script's interaction that never matches — a
    `getByRole(...).click().catch(() => {})` whose regex fits NOTHING
    on the page — fails SILENTLY and ships a degraded standing shot
    (the S49 find: the FAQ capture click targeted "What is NovaAI?",
    a question that does not exist — the real first question is "Is
    my data secure with NovaAI?" — so the standing 07 shot had
    shipped WITHOUT an expanded panel since the script's
    introduction, unnoticed because the VLM prompts never asked for
    an expanded row). The law: every capture interaction must either
    carry its own DOM proof (assert the expanded state before the
    shot — the S49 re-capture does) or drop the `.catch()` swaddle
    so a dead locator FAILS the capture run. Same family as the
    capture-glob trap (gotcha 58/lesson 87): a silently-dead branch
    in an instrumentation script is worse than no branch at all.

60. **The leading-space row-filter law (Session 50 — the lesson-88
    family's third sighting).** `pdfimages -list`'s data rows are
    right-aligned with LEADING SPACES — a `!line.startsWith(" ")`
    filter silently returns an EMPTY census, and an empty-equals-empty
    comparison reads as false PARITY (the first S50 parse reported
    "zero images on every route" while the landing actually carries
    13). The same family as pdffonts' "CID TrueType" two-word column
    (S49) and the dead capture click (S49): every tabular instrument's
    parser must be validated against the instrument's OWN raw output
    before any empty reading is trusted — print the raw output on a
    known-nonempty input first. And its sibling measured in the same
    pass: the ANIMATED-GLOW RASTER JITTER — a pulsing element's
    rasterized box carries ±1px frame-dependence (the live measured
    710x288 and 710x289 across renders), so raster censuses pin static
    content exactly but bucket the animated rasters (the S38 loop-value
    range law at the raster layer).
61. **The binary-stream parser law + the color-value adjudication
    (Session 51).** (a) A PDF's binary streams (the embedded fonts,
    the jpegs) can carry the literal byte sequence "N 0 obj" — a
    text-regex object-boundary parse over a `qpdf --qdf` file finds
    FALSE object starts inside the binary, silently truncating every
    preceding object's region (the prototype's form censuses read
    10-154 byte fragments; the lesson-88 empty-census family's FOURTH
    sighting, caught by the raw-output discipline before any census
    was trusted). The robust instrument: `qpdf --json
    --json-stream-data=inline` — every stream arrives length-bounded
    and base64-encoded in the JSON, no text heuristics; `qpdf` (12.x)
    joins poppler as the e2e gate's second external binary
    prerequisite. (b) The COLOR-VALUE adjudication: an operator-count
    delta in the `RG`/`rg` (color-set) family is UNADJUDICABLE from
    counts alone — extract the actual r-g-b operands and census the
    VALUES (quantized at 1/32 per channel: the ≤0.5/255 lab()
    serialization family merges robustly [the 1/64 quantization
    straddles a rounding boundary — .9608 -> 61 vs .961 -> 62 despite
    a 0.05/255 difference], the palette's real colors stay distinct).
    If the value SETS match, the count delta is pure re-establishment
    frequency (the paint-order family — the D125 law at the
    print-operator layer). (c) The ENTRANCE-FRAME raster bucket: a
    below-fold mockup card's print raster is entrance-frame-dependent
    (the live measured 1481x832 AND 1494x838 across renders, the ppi
    varying with it — 180 vs 191) — the S38 range law at the raster
    layer, bucketed like the animated-glow ±1px but at the mockup's
    scale range.


62. **The qpdf-12.2 JSON-shape law + the empty-catalog trap (Session
   52).** Reading the structural layer through `qpdf --json`: the
   objects live under `qpdf[1]["obj:N 0 R"]` (plain objects wrapped in
   `.value`, streams in `.stream.{data,dict}` — there is NO
   `qpdf[0].trailer` in 12.2), and the catalog is located BY ITS
   `/Type /Catalog` — never by a guessed traversal. A guessed traversal
   silently returns empty-equals-empty and every route "matches" (the
   lesson-88 family's FIFTH sighting, caught by the raw-output
   discipline before any census was trusted: dump the JSON shape and
   show the traversal a non-empty input first). Two sibling
   measurements the same session: the per-route OBJECT COUNTS are
   deterministic across renders but the LANDING's carries the
   animated-form bucket (523 AND 525 across runs — the S38 range law
   at the object-allocation layer), and the print-PIPELINE's text
   counts on interpolated content are INPUT-LENGTH-DEPENDENT (the
   reset view paints the typed email: a 21-char measurement reads
   76/136 text ops, an 18-char one reads 74/134 — pin the spec's own
   input).

63. **The sandbox reaper law + the measurement-order laws (Session
   53).** (a) THE REAPER: this sandbox kills EVERY server child when a
   command ends — even `setsid nohup` detachments die — so every
   recon/battery/capture phase is a SELF-CONTAINED boot-work-kill unit
   (one server life per measurement batch; the wrapper boots, waits
   for health, runs ONE phase, kills). (b) THE CONTEXT-ORDER LAW: an
   AUTHENTICATED browser context redirects /login to /dashboard — a
   dashboard measurement taken mid-sequence poisons every public
   /login measurement after it (the S53 battery's alternates read the
   dashboard's 292 objects where /login's 51 belonged); public states
   run on the clean context FIRST, authenticated measurements in
   their OWN context LAST. (c) THE SSR-BYPASS LAW: a full-page `goto`
   takes the server-render path — browser route interception never
   sees the request; the error-boundary capture must go through a
   client-side refresh (the pause click), the spec's own pattern.
   (d) THE POST-LOGIN SETTLE: measuring the live SPA's landing words
   mid-navigation reads 0 — wait for the non-empty body before any
   census. (e) THE TALLY-EXTRACTION ARTIFACT: a timeout-killed chunk
   runner can under-record its early chunks' pass counts (301 vs the
   true 311 twice now) — reconcile against `playwright test --list`
   per chunk before believing a short gate.

64. **The silent-skip law + the gate-arithmetic audit (Session 54).**
   (a) THE SILENT SKIP: `playwright test pathA pathB ...` drops a
   non-existent path WITHOUT any error — the S53-committed chunk
   runner's `session38-logo-petels` typo (the file is
   `session38-logo-petals.spec.ts`) silently skipped the logo-petals
   spec's 10 tests from every chunked run; the tally still summed
   "green" because every chunk it DID run passed. The defense: verify
   every chunk's `--list` count against the expected per-chunk sum
   (and the full-suite `--list` total against the gate's e2e figure)
   before trusting a chunked tally — the S54 reconciliation caught the
   10-test hole at chunk 10 (6 listed vs the S53-recorded 16).
   (b) THE COMMIT-ARTIFACT DRIFT corollary: the committed runner is
   not guaranteed to be the bytes that ran (the S53 session's own
   456/456 record proves its in-flight list was correct — the typo
   entered the committed artifact) — re-verify a committed script's
   file list on FIRST REUSE, not never. (c) THE GATE-ARITHMETIC AUDIT:
   the S53 badge recorded 837 while its own decomposition
   (252+125+456) sums to 833 — a +4 slip (the S51/S52 totals 817/826
   were both pure sums); every badge bump must be re-derived from the
   layer counts, never incremented from the previous badge.
   (d) THE ALPHA-GRID LAW (the D134 oklab family's sixth sighting, at
   the ExtGState alpha layer): the two print pipelines serialize /ca
   /CA differently (raw CSS decimals 0.05/0.1/0.5 vs 8-bit-quantized
   13/255/26/255/128/255) in BOTH directions per route — compare at
   `Math.round(a*255)` (the 8-bit composite grid), where every
   measured pair converges (12.75->13, 5.1->5, 127.5->128).
   (e) THE TYPELESS-OBJECT TRAP: `/Type` is OPTIONAL for ExtGState
   (PDF 32000-1 Table 59) and Skia omits it on most entries — 9 of
   /login's 14 ExtGStates carry NO /Type, and most are referenced from
   FORM XObjects' nested /Resources (not the page name table); only
   the OBJECT-LEVEL census (shape-based detection through the Table-59
   key universe) is complete. (f) THE EMPTY-CANDIDATE DISCIPLINE: the
   worklog's 29th-surface candidates were ALL probed on the raw shape
   FIRST — the color-space layer measured EMPTY-SET on both sides
   (zero ICC streams, zero named spaces) and the page-tree inheritance
   layer measured FLAT (zero intermediate nodes) — both registered as
   LAWS, not surfaces; the font /Widths layer measured rich and folded
   into the interior surface. Probe before you build a census.

65. **The inline-storage law + the array-key enumeration artifact
   (Session 55).** (a) THE INLINE-STORAGE LAW (the lesson-88 family's
   SEVENTH sighting): on /login the gradient FUNCTIONS live INSIDE the
   shading pattern dicts (`PatternType 2 -> /Shading -> /Function` as
   an inline dict, NOT a separate object) — an object-level
   `/FunctionType` probe measures EMPTY on exactly the route that
   carries three functions; the only complete census resolves through
   the shading patterns AND walks the standalone objects (the landing
   stores 5-7 BOTH ways — both shapes must be censused, or a route's
   function layer silently reads empty). Probe the raw storage shape
   before trusting any "empty" finding. (b) THE ARRAY-KEY
   ENUMERATION ARTIFACT (the pin-shape family): iterating
   `Object.entries()` over a qpdf JSON value that is actually an
   ARRAY (the G-forms' `/ProcSet`) yields the array INDICES as keys
   (`["0".."4"]`) — the census then pins an artifact that carries no
   PDF meaning; guard with `Array.isArray()` first and keep the
   sorted VALUES. Caught at pin-generation review, before any spec
   was assembled. (c) THE SMask RECURSION TERMINUS: the luminosity
   G-forms reference IMAGE XObjects (the alpha masks) — one level of
   nesting, no deeper resource chains; a recursive census needs no
   cycle guard but MUST record the terminus (imageRefs/formRefs) or
   it measures nothing about the chain it claims to census.

66. **The object-level image census law + the ICC shape law (Session
   56).** (a) THE OBJECT-LEVEL CENSUS LAW (the gotcha-64e typeless law
   at the image layer): `pdfimages -list` walks PAGE-LEVEL resources
   ONLY — images referenced from FORM XObjects' nested /Resources (the
   animated mockup's raster slivers) and /SMask TARGET images are
   INVISIBLE to it. The complete image census is object-level through
   `qpdf --json`: the S50 page census (13 keys) and the S56 object
   census (16-18 on the clone, 13 stable on the live) are BOTH true —
   different layers, both pinned. (b) THE ICC SHAPE LAW (the lesson-88
   family's EIGHTH sighting): Skia's ICC profile streams carry NO
   /Subtype — just /N + /Length (+ /Alternate) — so a detector keyed
   on `/Subtype === /ICCBased` measures EMPTY on exactly the document
   carrying a profile (the landing's 1920x1080 video poster → the
   716-byte N=3 profile, byte-identical across sides). Shape-based
   detection: /N + stream data + the key universe + referenced from an
   image's `[/ICCBased n 0 R]` array. The S54 color-space empty-set
   law is REFINED, not contradicted: zero NAMED page-resource
   /ColorSpace entries holds; the image-embedded ICC layer sits below
   it. (c) THE SILENT-SKIP RECURRENCE (the gotcha-64 law's own
   corollary, caught in flight THIS session): copying the S55 chunk
   runner with a sed that REPLACED `session55-functionlayer-laws` with
   the new spec silently dropped the session55 spec's 5 tests — the
   tally summed 467 while `--list` said 472. Chunk runners are
   versioned artifacts: ADD the new spec to the previous session's
   final chunk, never replace it; reconcile every chunk AND the total
   against `--list` before trusting a gate.


67. **The transcription-injection law + the file-set reconciliation
   (Session 57, the gotcha-64 family's near-miss).** (a) THE NEAR-MISS:
   the new chunk runner's reconciliation (the count summed 472 vs the
   global `--list` 482 — correctly diagnosed as the not-yet-added
   session57 spec) was followed by a file-set diff that showed
   `session38-logo-petels` vs `session38-logo-petals` — read as "the
   committed runners carry the petals typo, the S54 fix never landed,
   10 tests never ran." ALL FALSE: the diff's runner side was built
   from a chunk list RE-TYPED INTO THE RECONCILIATION COMMAND — the
   typo was injected by the instrument itself (the committed runners
   verified correct by hexdump of the actual files + `git show HEAD:`
   + the no-op sed leaving them git-unmodified; the S56 gate's
   849 = 252 + 125 + 472 stands in full). THE LAW: a reconciliation
   must expand the artifact's OWN file list (parse the runner's
   CHUCKS array from the script file), never a re-typed transcription
   — the instrument can inject exactly the defect it claims to find.
   (b) THE FILE-SET RECONCILIATION (the sound part): counting
   `--list` totals is not enough — a typo'd or missing spec name
   silently drops from both the runner's list and its per-chunk
   reconciliation; the honest discipline diffs the runner's expanded
   spec FILE SET (parsed from the script) against the global `--list`
   file set — the diff must be EMPTY (this session's final gate
   reconciled 482/482 with the empty diff). (c) THE PAYLOAD-LAYER
   INSTRUMENT LAWS: qpdf's `--show-object=N --filtered-stream-data`
   writes the decoded bytes to STDOUT (no `--binary` flag exists in
   qpdf 12 — capture with `execFileSync` + `encoding: "buffer"`); the
   qpdf-JSON stream `data` field is BASE64 for binary streams (a
   plain-ASCII content stream is ALSO base64-alphabet-clean —
   disambiguate by testing for PDF operators before and after
   decoding); the JSON string serialization carries a `u:` type
   prefix (`u:http://...`) — an origin-normalization regex anchored
   on `^https?` never fires; and the q/Q token census must run on
   the DECODED stream (the raw JSON reads zero operators).

68. **The render-input identity law + the comparator-format law
   (Session 58, the D177 interpolation family at the battery layer).
   ** (a) THE RENDER-INPUT IDENTITY: a cached-render battery that
   compares clone-vs-live PDFs byte-for-byte or line-for-line is
   comparing INTERPOLATED CONTENT — the login family's censuses
   change with the email/password typed into the capture driver (a
   different email changes the print text, the x-origins, AND the
   run segmentation; a different password even changes the printed
   bullet count). A re-render of ONE side (here: the post-fix clone
   alternates) MUST reuse the exact inputs the OTHER side's cache
   was captured with — the first post-fix re-render borrowed the
   spec's pin email (`s52-pin@test.local`) against a live cache
   captured with `probe-s58@test.local`, and the battery's P1/P8
   comparisons went RED on the mismatch, not on parity drift (the
   four REDs root-caused as the instrument before any parity
   conclusion). Renders pin their own inputs, and both sides' pins
   must be IDENTICAL. (b) THE COMPARATOR-FORMAT LAW: a constants
   array compared against a comparator's output must be compared
   under the comparator's OWN canonical form — `payloadRows()`
   returns `rows.sort()`-ed, and a hand-written constants array in
   a different order REDs despite equal sets (fix: compare against
   `[...CONST].sort()`, or generate the constants through the same
   sort). (c) THE GLYPH-STRING HEX LAW (the lesson-88 family's 9th
   sighting, the session's own instrument birth): Chromium's print
   pipelines emit glyph strings as HEX (`<01> Tj`), not
   parenthesized literals — a paren-only `\((...)\)\s*Tj` regex
   reads every text block as empty; both forms must be parsed.
   (d) THE STALE-PIN CONVERGENCE: when a src/ fix CONVERGES a
   previously registered divergence (here the h2 tracking fix
   merging the reset card's 16-run per-glyph block-0 into 1 run,
   exactly the D182 30-op delta: text 74 → 44), the OLD divergence
   pin is now pinning a FALSEHOOD — the gate's missing test is the
   stale pin failing, and the honest update re-pins the converged
   truth with the provenance recorded in the spec.

69. **The var-indirection law + the leading-dot fill keys + the
   animation-band render law + the :root-vs-.dark trap (Session 59,
   the color-token surface's instrument births).** (a) THE
   VAR-INDIRECTION LAW: lightningcss (the v4 build) resolves any
   LITERAL `hsl()` in @theme to 8-bit hex at compile time — a
   token-syntax mirror of an hsl-token reference MUST use the
   reference's own indirection (raw components in a custom property
   + `hsl(var(--x))` as the token value) or the float precision the
   surface measures is silently re-quantized in the build; verify
   the BUILT css (`hsl(var(--violet))` surviving unresolved x23),
   not just the source. (b) THE LEADING-DOT FILL KEYS: PDF fill
   operators write sub-1 values with a LEADING DOT and no zero
   (`.8333 0 1 rg`), and integer values bare (`0`, `1`) — census
   keys expected as `0.8333` never match; also beware the heredoc
   double-escape (`\\d` landing in the file as `\\d` — a JS regex
   literal then matches backslash-or-d, not digits, and EVERY
   census reads empty; empty===empty comparisons pass TRIVIALLY,
   masking the break — always eyeball one census dump). (c) THE
   ANIMATION-BAND RENDER LAW: the landing's print fills (like its
   line records) are entrance-timing-dependent — a fresh render can
   catch the mock section unpainted (fill counts 92/103 vs a prior
   render's 230/407) — pin root checks PRESENCE-level, and pin
   exact fill counts only on summed DETERMINISTIC routes; a
   scroll-through on ONE side only breaks clone-v-live
   comparability (the cached live renders are same-dwell states).
   (d) THE :root-vs-.dark TRAP: a token-extraction regex taking the
   LAST definition reads the inert `.dark` block as the truth (the
   live ships BOTH; .dark never mounts) — a naive reconciliation
   flags the CORRECT clone mirrors (#8624ff primary, #ef4444
   destructive) as REAL divergences; block-aware extraction + the
   DOM glow-stops probe adjudicate (the rendering block is :root,
   verified by computed gradient stops), and the adjudication is
   then PINNED so the trap cannot recur.

70. **The sandbox DATABASE_URL precedent + the fresh-clone gate +
   the hover-instrument race (Session 60).** (a) THE SANDBOX
   DATABASE_URL GOTCHA: this sandbox pre-sets an out-of-repo
   ABSOLUTE `DATABASE_URL` in the process environment — the CLI
   precedence rule #1 (an explicit process env is operator intent;
   absolute URLs pass through) honors it, so a bare `npm run
   db:push && npm run db:seed` on a fresh clone writes OUTSIDE the
   repo while the app (same precedence) reads the same wrong file —
   consistent, but NOT the documented `<repo>/db` story. The
   codebase is correct per its tested contract (a normal environment
   falls to precedence 2: the repo's own .env); the sandbox is the
   artifact — pin `DATABASE_URL="file:../db/custom.db"` per command
   (the gotcha-1 discipline) on every DB-touching invocation in
   this environment. (b) THE FRESH-CLONE GATE: after a workspace
   reset, budget for the Chromium v1243 re-download + the
   node_modules reinstall BEFORE the baseline; the first e2e run
   after a fresh clone fails fast on the missing browser binary
   (install with `npx playwright install chromium`). (c) THE
   HOVER-INSTRUMENT RACE (the S40 law's refinement): a poll whose
   early-return fires on the FIRST two-consecutive-equal samples
   can lock the PRE-hover value when the hover state lags under
   chunk load — the changed-then-stable form (wait for the value to
   LEAVE the initial read, THEN require the stable pair) plus the
   locator-based `hover()` (re-resolves the element + moves to its
   CURRENT center, closing the stale-point/layout-shift mechanism)
   is the durable instrument; the same defect pattern was hardened
   across the whole D135 family (the login bg pin + the 404 twin +
   the border sibling).

71. **The write-layer quote-sandwich law + the next-server child sweep
   (Session 61, the second fresh-clone session's instrument births).**
   (a) THE WRITE-LAYER QUOTE-SANDWICH: tool write layers can MANGLE a
   single-character string literal that wraps a double quote in single
   quotes (the S61 spec's `'"'` landed on disk as `'"")` — an
   unterminated constant that only surfaced at parse time). The durable
   form for such literals is a fromCharCode constant (`const DQ =
   String.fromCharCode(34)`), and the byte-level verification habit
   (a python repr of the line) catches the mangling before the gate.
   Same family as the runbook's display-redaction law: never trust a
   display/write layer with a fragile byte sequence — write around it
   or verify the raw bytes. (b) THE NEXT-SERVER CHILD SWEEP: `node
   .next/standalone/server.js` spawns a CHILD `next-server` process
   that OUTLIVES the parent's death still holding the port — a
   parent-only kill leaves a zombie answering health checks. The
   zero-zombie discipline must sweep the PORT HOLDER (parse the pid
   from `ss -tlnp` on the port) after killing the parent, then verify
   the port is actually free. (c) THE REDIRECT-MASKING REMINDER: a
   `page.goto` FOLLOWS redirects, so a status census through it reads
   the FINAL 200 — the clone's registered 307/308 family (the
   /dashboard auth redirect + the case canonicalizations) only
   measures honestly through a non-following request
   (`page.request.get` with `maxRedirects: 0`).

72. **The fresh-context probe law + the banker's-rounding grid trap
   (Session 62's instrument births).** (a) THE FRESH-CONTEXT PROBE LAW:
   any two-sided probe that PRINTS or censuses a public route must run
   its print phase in a FRESH browser context — an authenticated
   session's cookie makes the clone's /login REDIRECT to /dashboard
   (the documented workspace-forward behavior), so a shared-context
   print after a login flow measures the DASHBOARD (79 words, VendSans,
   the workflow status badges), not the login card. The S62 watch's
   reading-order column hit this on its first clone-side pass — the
   fresh context is the honest unauthenticated state both sides.
   (b) THE BANKER'S-ROUNDING GRID TRAP: the D187 alpha grid
   (Math.round(v*255)) is JS semantics — half AWAY from zero. 0.7*255
   = 178.5 EXACTLY in IEEE754, and JS maps it to 179, but Python's
   round() is half-to-EVEN (round(178.5) = 178) — the S62 analyzer's
   first pass read a FALSE 178-v-179 drift on ALL FOUR legal routes.
   Any grid re-implementation outside JS must use
   floor(v*255 + 0.5), never round(). Pinned permanently by the
   session62 spec's D218e (the 179 convergence + the NOT-178 guard).

73. **The /login streaming window (Session 63's instrument birth).**
   The /login route is an async server component (the real-auth gate —
   a live session read) under Suspense: React streams the card markup
   inside a HIDDEN container and completes the boundary only after the
   session query resolves, so for the first ~100-250ms after goto the
   full DOM is present (innerHTML complete, stylesheets loaded,
   display/visibility normal) yet EVERY getBoundingClientRect() and
   offsetHeight reads ZERO and NOTHING streamed there is focusable.
   Three baseline failures root-caused to it: (a) raw-rect
   measurements taken at goto-return read 0-gap/0-height (the
   brand-parity card-spacing pin) — the fix is the poll form (poll
   the settled value); (b) locator.focus() waits only for ATTACHMENT,
   so a focus attempt inside the window is a silent no-op (the
   palette-parity email-ring pin) — the fix re-attempts the focus
   INSIDE the poll; (c) blind keyboard walks exhaust inside the
   window (the palette-parity Tab-walk pin) — the fix re-attempts one
   Tab per poll iteration. Computed-STYLE reads (colors, borders) are
   window-immune — only layout-dependent reads and focus/keyboard
   interactions can race the boundary. The D135 re-attempt law is the
   durable form.

## Architecture invariants

- **Layering:** route handlers (`src/app/api/**`) own validation +
  persistence; views never fetch directly — the dashboard server page loads
  initial state and the client component mutates through the API envelope.
- **The envelope:** every API route returns `{ ok: true, data }` or
  `{ ok: false, error: { code, message } }` via `src/lib/api.ts` (`ok` /
  `fail` / `requireSession` + the Session-19 crash-path wrapper
  `apiRoute` — what ESCAPES a handler becomes the INTERNAL_ERROR
  envelope with the stack re-logged to fd 2 — and the Session-20 method
  guards `methodGuard`/`optionsGuard` + the request-size ceiling
  `bodyTooLarge` before every body parse + the Session-21 optional
  `meta` sibling of `data` carrying the capped list's TRUE total +
  honest aggregates + the Session-22 ownership-scoped atomic writes
  `updateMany`/`deleteMany` with `userId` in the WHERE — count 0 is the
  honest 404, and the mutation race is closed by construction). The
  CLIENT mirrors the same honesty (Session 23): a PATCH/DELETE 404 drops
  the ghost row + re-syncs + announces politely (never the retry-lie
  banner — the S13 failure-class law extended to the client; a DELETE 404
  is idempotent success), 401s stay banner-free via the `SessionExpired`
  early-return, and `refresh()`'s sequence guard drops any response
  superseded by a newer refresh (no stale-snapshot resurrection). The
  client's TEMPORAL layer (Session 24): every fetch rides
  `fetchWithTimeout` (the 20s client ceiling — a hang converts into the
  network-fault banner + busy release, never an eternal spinner) and
  every action start clears BOTH error surfaces (a failure surface lives
  exactly until the user's next action of ANY class) + the Session-25
  observability layer: the runs chart's ceiling is honest (CHART_ROWS +
  the S21-pattern note with the TRUE total, D104) with semantic list
  rows (D105), and the measured performance ceilings (LCP/DOM budgets)
  are PINNED in the e2e gate — `tests/e2e/performance-budget.spec.ts` —
  and the Session-26 ranking layer: the chart titled "Runs by workflow"
  RANKS BY RUNS across the FULL workspace via the server-side
  `meta.topRuns` aggregate (the capped client list can never rank
  honestly at >100 rows — D106) with the pure `rankByRuns()` fallback
  seam, and the script-TRANSFER bytes are pinned (scripts ≤ 400KB per
  route — D107), and the Session-27 weighting layer: the stat card
  "Success rate" carries the RUN-WEIGHTED truth (`weightedSuccessRate()`
  — Σ(runs × successRate) / Σ(runs) over the FULL workspace, server-side
  via the shared pure seam; the meta field is `successRate`; the client
  fallback weights identically — D108) with the paint-milestone budgets
  pinned (TTFB ≤ 500ms + FCP ≤ 1000ms per route + the authed-dashboard
  LCP ≤ 1000ms — D109), and the Session-28 exactness layer: the "Hours
  saved" card's sum rides the ORDER-FREE `sumHours()` seam (integer-tenths
  accumulation over the stat-rows fetch — the route, the page, and the
  client fallback share ONE definition; a naive float reduce displayed
  1 low at exactly-x.5 shapes — D110) with the chart's tie-break
  (`runs DESC, createdAt DESC` — D111) and the CLS budgets (≤ 0.1 per
  route — D112) pinned, and the Session-29/30 structured-data layer: the
  sitewide WebSite + Organization pair mounted ONCE in the root layout
  (the live REDEPLOYED its own structured data — a minimal pair on every
  route + BreadcrumbLists on the content routes; the drift battery's
  JSON-LD column caught it — gotcha 7), the BreadcrumbList on the five
  content routes + /demo (the crumb names ARE the routes' own metadata
  stems), and the supersets — the SoftwareApplication with the
  PLANS-derived offers on the landing (Enterprise's null price omitted,
  never an invented 0), the FAQPage on /faq (entities VERBATIM from
  FAQ_ITEMS) — all through the PURE builders in `src/lib/seo.ts`, every
  fact derived from its ONE content source (D113 → D115) — with the
  first-run boundary stories pinned (the empty-to-FIRST transition, the
  all-zero chart's uniform floor, the first-run expiry — D114) and the
  100/101-row dual-ceiling boundary (the list cap's own edge: NO note at
  exactly 100, the honest note + the invisible oldest at 101, the stats
  TRUE across the cap — D116), and the Session-31 head-parity layer:
  the content routes' descriptions carry the live's MEASURED truncation
  (`DESCRIPTION_APPENDIX_CAP = 80` in `pageDescription()` — the
  description part capped at 80 chars mid-word with a trailing period;
  the landing + /login keep the full 214-char default; the exact
  strings pinned in the head-metadata e2e — D117), the 404's canonical
  + og:url point at the REQUESTED URL through the not-found page's
  one-shot effect (never Next's internal `/_not-found` default — D118),
  and the chart's 8↔9 note-transition boundary is pinned (the note
  absent at exactly 8, appearing at 9 with the tie-break deciding the
  first excluded row — D119), and the Session-32 head-trio layer: the
  twitter:url ships on EVERY route through `metadata.other` (Next's
  Twitter metadata type has no url field — the value derives from
  siteUrl() + the route path, one env var, one origin — D120), the
  /login-only redeployed theme-color #000000 + the "Base44 link
  preview" image alts ride the login layout's viewport export +
  routeMetadata's imageAlt option (D121), and the 404's head-tag trio
  is EXACTLY-ONCE through the normalize-all + MutationObserver effect
  (the hydration-appended `/_not-found` copies removed — D122), with
  the 108-row chart/list membership disagreement pinned (chart ∩ list
  = ∅ at the S30 shape's extreme — D123). The drift battery now runs
  ELEVEN surfaces (word parity, mobile nav, SEO, JSON-LD mounts, the
  Session-31 canonical/og column, the Session-32 head-tag SET column
  that caught D120/D121/D122 on its first run, the Session-33
  DOM-attribute SET column that caught the dormant toaster / the Radix
  marker / the nav-theme hooks on ITS first run — D124–D126, the
  Session-34 shared-attribute VALUE column that caught the /faq
  Radix carrier-count delta on ITS first run — D127, and the
  Session-35 computed-STYLE inventory column — the twice-deferred
  candidate shipped with its normalization contract — that caught the
  custom radius scale / the login --muted / the italic note on ITS
  first run — D130/D131/D133, plus the ninth column's aria-*
  vocabulary extension that caught the dangling aria-controls contract
  — D132, AND the Session-36 extensions: the style inventory's
  non-text-bearing second anchor — the painted media-leaf (icon
  tiles, dots, skeleton shapes, avatars; 61 painted leaves on the
  landing, GREEN on its first run, verified non-trivial) — and the
  ELEVENTH surface, the interaction-surface column (the k-th rendered
  interactive element at REST, under REAL hover [page.mouse.move —
  gotcha 16], and under REAL keyboard focus [Tab — the focus-VISIBLE
  contract], through the S35 normalization contract) that caught the
  `lab()` serialization family on ITS first run — D134/D135), AND the Session-37 extensions: the TWELFTH surface — the transition-timing contract (which props transition, at what duration/easing, per interactive; the `--tw-*` custom-property family stripped as inert-engine emission; the `--tw-*` strip measured, not assumed) that caught the live's login-bundle `-webkit-text-decoration-color` alias on ITS first run (D137); the style inventory's GRADIENT layer (every rendered element's computed background-image through the gradient contract — function family, direction grammar, stops as color tuples, the auto-spacing position equivalence class) that caught v4's `in oklab` interpolation directive — a REAL rendering difference — plus the stop-position emission and the last two unpinned `lab()` stop tokens (D138–D140); and the interaction surface's POINTER-MODALITY focus twin (the k-th interactive under a REAL held page.mouse.down()) — GREEN at parity through the three measurement laws (gotcha 50c), AND the Session-38 extension: the THIRTEENTH surface — the LOOP inventory (library-agnostic animation parity: every rendered element time-sampled over a ~4.6s window; a LOOPER is an element whose computed transform/opacity/background-position/stroke-dashoffset changes between samples, so CSS keyframes AND the live's framer-motion inline writes BOTH surface as cyclers; the record: class prefix, cycling property families, value ranges; plus the WAAPI layer pinning every CSS animation's name/duration/delay/keyframe stops exactly, with the clone's framer-reproduction names REGISTERED as the documented clone-only set) that caught the logo petal choreography (D142 — the live's petals slide AXIS-ALIGNED ±12.84px with the 0/30/50/80/100 peak-hold shape; the clone shipped a diagonal 3px jitter) and the hover-shine's gradientShift (D143 — the live's four-corner background-position cycle vs the clone's two-stop sweep) on ITS first run, with the
  adjudicated sets VERSIONED in `src/lib/head-superset.ts` (the
  registry the battery READS: an unregistered clone-only head tag or
  DOM attribute — either side — surfaces as DRIFT instead of blending
  into the "superset" reading; 15 → 23 unit pins hold the shape incl. the
  Session-34 VALUE-level rules, the sixth head entry, and the
  Session-35 aria-* rules with the `id-refs` type), AND the Session-39
  extension: the FOURTEENTH surface — the z-index/stacking inventory
  (every rendered element with computed z-index ≠ auto OR position ≠
  static, DWELL-loaded per gotcha 52a; the record: tag, class prefix,
  position, z-index, the stacking-context creator flags; the raw
  signature diff adjudicated against the REGISTERED families — the
  live's dormant toaster shells [z-[100] ×2 on content routes +
  data-rht-toaster z-9999 ×2 on /login, all empty], the framer
  centering/residue transforms [~51 live carriers vs ~20 clone Reveal
  end-states — the D125 family at the stacking layer], the clone's
  platform next-route-announcer, the dashboard superset chrome [the
  live's top bar is STATIC; the clone's sticky z-40 header the
  documented workspace superset], the S14-F3 WCAG live region, the
  /demo superset route [the live soft-404s it]) — GREEN at parity on
  all eight routes with zero unregistered asymmetries; plus the loop
  PERIOD layer (real-timestamp trough-gap analysis — gotcha 52b) that
  caught D144 (the scroll-dot bar: the live's bundle-authored 1.5s vs
  the clone's S8-estimated 1.7s — fixed) and the D145 variant-conflict
  record (the live's authored y:[0,−15,0] suppressed by its own
  vestigial whileInView:{y:0} — an unstable race; the clone keeps the
  authored contract, registered), plus the reduced-motion loop record
  (under `reduce` the live keeps 29 loopers cycling — framer writes
  AND its own CSS animations; the clone collapses to ZERO — the S14
  a11y superset, now pinned at the loop level), AND the Session-40
  extension: the FIFTEENTH surface — the responsive breakpoint
  inventory (the same element set measured at 390/768/1024/1440 on
  the landing and /login, paired clone-vs-live, DWELL-loaded per the
  new gotcha-52e law — a viewport change re-renders and re-arms the
  below-fold entrances, so every breakpoint re-measure needs its own
  scroll-and-hold pass, or the geometry reads pre-entrance fiction:
  the live's problem-section card at its unfired scale(.95) — 262×311
  vs the true resting 276×327, +30px cascading into every section
  below; the record: nav height [56px @390 / 72px @≥768], burger
  visibility, nav-link count, zero horizontal overflow, document
  height, the paired element-set geometry per breakpoint — GREEN at
  parity on both routes at all four widths with ZERO unregistered
  geometry drift; the only asymmetry the clone's `<main>` landmark on
  the LANDING [the registered a11y superset; on /login BOTH sides
  carry main|min-h-screen.flex, identical sets]; plus the
  reference-regression watch: the live's soft-404 set now FOUR routes
  — /pricing NEW in Session 40 alongside /demo, /dashboard, /checkout
  [D146, registered; the clone's routes the documented working
  supersets]; the live's sitemap unchanged [7 URLs], so the clone's
  sitemap policy record stands) AND the Session-41 extension: the
  SIXTEENTH surface — the focus-order inventory (the Tab sequence as
  an ordered surface, paired clone-vs-live WITHIN a viewport: the
  landing at 1440 [34 stops] and 390 [28], /login [6], /faq [28], and
  the open mobile menu [10] — every combo structurally IDENTICAL
  across sides; the only deltas the registered records: the
  D-record CTA-card href [/dashboard vs the live's /checkout], the
  a11y-name supersets [the logo "NovaAI home", the burger "Open
  menu", the newsletter input "Email address" / button "Subscribe"
  — the live's controls are UNNAMED], and the gotcha-52e open-menu
  card height [327 vs the live's unfired 311]; the behavioral trio
  measured directionally: the clone locks scroll + closes on Escape
  + returns focus to the burger, the live does NONE of these; plus
  the route-watch registry: NO RECOVERY, NO NEW REGRESSION — the
  soft-404 four unchanged, the /login checked by its FORM not its
  word count [a light page is not a broken page]) AND the Session-42
  extension: the SEVENTEENTH surface — the print media surface
  (measured at FOUR layers, paired clone-vs-live: the CSSOM rule
  scan [zero `@media print` rules in any stylesheet, either side],
  the DOCUMENT scan [zero `media`-attributed link/style elements —
  the blind-spot layer: a `<link media="print">` sheet's top-level
  rules are NOT CSSMediaRule, so the rule scan alone cannot see
  them], the COMPUTED scan [zero style deltas on the key elements
  under print emulation], and the RENDER layer [`page.pdf` A4 page
  counts IDENTICAL across sides on 7 of 8 public routes — the /demo
  delta clone-2 vs live-1 the REGISTERED working-superset route,
  the live soft-404s it] — the EMPTY-SET contract at exact parity:
  neither side ships any print styling, and the print render
  matches; NO superset addition — print restyling would be a VISIBLE
  deviation from the reference's printed output, and the registered
  superset families are functional features and invisible-at-rest
  a11y, never output changes) + the fifteenth surface's ROUTE
  EXTENSION (/faq + the four legal routes at the four widths —
  EXACT PARITY on every field: nav 56/72, the burger via the SHARED
  `md:hidden` selector [gotcha 47 — the live's bare burger carries
  no aria-controls, an aria-keyed read shows it "absent"], links
  1/7, zero overflow, docH byte-identical per width per route) AND
  the Session-43 extension: the /thank-you WORKING-PARITY ROUTE
  (D147 — the last route where the clone soft-404'd what the live
  serves working, closed: the live's 36-word payment-success
  interstitial built at the measured contract — the verbatim
  classes on the already-pinned @theme tokens, `routeMetadata`
  head with the byte-exact D117-truncated description, the
  BreadcrumbList [Home, Thank You], NO nav/footer/landmarks, NO
  toaster shell; the sitemap now the live's 7 + /demo = 8 URLs —
  the STRICT superset, the D141 swap superseded; the A2 probe
  disproved the S14 newsletter rationale — the live's newsletter
  form does NOT navigate there, the page is the checkout-success
  destination) + the EIGHTEENTH surface (D148 — the cursor/caret +
  form-autofill contract: the cursor census identical on every
  pairable route [pointer on links/buttons, text on entry
  controls], the caret-color the auto-inherited currentColor both
  sides, the :autofill/:-webkit-autofill rule scan ZERO both sides
  [the empty-set contract], and the autocomplete census — the
  live ships NONE anywhere while the clone carries the REGISTERED
  S14-era login pair [email + current-password — the registry's
  fourth DOM entry: the invisible-at-rest functional superset,
  password-manager + browser-autofill assist, WCAG 1.3.5; the
  newsletter inputs stay attribute-less on BOTH sides]) + the
  sixteenth surface's ROUTE EXTENSION (the four legal routes'
  walks at 1440 [22 stops] + /privacy at 390 [16 stops] —
  structurally identical across sides, the only deltas the
  registered S41 a11y-name supersets) + the D146 record
  CORRECTED (the clone's /pricing NEVER existed — both sides fail
  that route honestly; the working superset routes are /demo +
  /dashboard only; gotcha 53). AND the Session-44 extension: the
  CASE-CANONICALIZATION PROXY (D149 — `src/proxy.ts`, Next 16's
  renamed middleware convention: any case variant of a known page
  route 308s to the lowercase canonical, the query preserved, the
  /api + /_next paths excluded, unknown routes + static assets passed
  through to the honest 404 — the live's case-insensitive SPA router
  serves duplicate 200s at every casing; the clone serves the single
  canonical URL; /LOGIN /DEMO /DASHBOARD variants redirect too, the
  live fails all three — the superset) + the NINETEENTH surface
  (D150-D152 — the URL-state + navigation-class +
  selection/view-transition contracts: the hash-click parity on all
  four nav targets both sides; the fresh-load hash record — the live
  NEVER scrolls on a true fresh load [its SPA shell lacks the anchor
  at parse; only same-document hash CHANGES scroll — the about:blank
  discipline] while the clone's SSR anchor scrolls [the registered
  functional superset: deep links to sections WORK]; the query-param
  tolerance with clean canonical + og:url on both sides; the
  trailing-slash record [live 200-at-both vs clone 308]; the
  route-change class [the live FULL-LOADS its route links — footer
  /faq + Log In — while the clone does client-side transitions
  everywhere: the platform superset, measured with the load-event
  counter]; the selection empty-set [zero ::selection rules,
  user-select all-auto, both sides] + the view-transition empty-set
  [zero rules, zero names]) + the eighteenth surface's ROUTE
  EXTENSION (the /demo input census — 22 pointer + 5 text + 0 other
  across 27 interactives, the autocomplete trio, the caret white;
  clone-side pins, the live soft-404s /demo — D73). AND the Session-45
  extension: the TWENTIETH SURFACE — the traversal/history +
  media-capability + audio/video family (D153-D156 — the
  traversal contract measured with the load-counter + mark
  instruments: the clone's same-document popstates restore
  the scroll EXACTLY while the live's cross-document
  reloads dump it to 0 with no bfcache, the registered
  platform superset; the media empty-set — zero
  pointer/hover media rules either side, tap-highlight
  transparent, touch-action auto; the hero-video contract
  — 1920x1080 / 8s / autoplay+loop+playsInline / playing /
  muted-prop / zero audio elements, with the muted
  ATTRIBUTE the clone's registered robustness superset
  [the React SSR quirk — the registry's FIFTH DOM-attr
  entry]) + the nineteenth surface's ROUTE EXTENSION (the
  /login alternates census — 6/5/3 counts structurally
  identical across sides, the autocomplete within the
                                    registered D148 family) AND the Session-46 extension: the
                                    TWENTY-FIRST SURFACE — the clipboard/keyboard +
                                    drag-and-drop + offline-render family (D157-D159:
                                    the clipboard empty-set at rendered parity [the
                                    live's inert .select-none rule — zero carriers
                                    — the gotcha-6 rule-layer extension], the
                                    testimonial strip's native-overflow contract
                                    [structural + behavioral parity — no JS drag-pan
                                    on either side, the grab cursor cosmetic on
                                    both], the offline render platform superset
                                    [the clone's 718-word full SSR landing vs the
                                    live's 136-word SPA shell under total request
                                    block]) + the BURGER CLICKABILITY record (D160:
                                    the live's icon two-thirds blocked by its own
                                    dormant toast containers — only the y36 sliver
                                    responds; the clone fully clickable at every
                                    point — the registered superset over the
                                    reference's degraded affordance) AND the Session-47
                                    extension: the TWENTY-SECOND SURFACE — the
                                    print-to-PDF text layer + the entrance build it
                                    exposed (D161-D166: the focus-visible ring at
                                    rendered parity [the rule-census delta the
                                    library-structure layer]; the forced-colors
                                    empty-set [zero rules both sides, identical
                                    substitution, stable geometry]; the print-text
                                    layer at exact parity [26/104/344/36 on the
                                    content routes + the landing's post-build 251
                                    convergence — the un-revealed set unpainted on
                                    both sides]; the wordmark + CTA entrance gaps
                                    CLOSED [the live's per-wordmark opacity-only
                                    fades with the ~50ms stagger + the whole-block
                                    CTA wrapper at y=30 — the S8 records
                                    re-verified through the print probe, gotcha
                                    57]; the offline route extension [the D159
                                    superset on the content routes + the /faq
                                    concatenation artifact adjudicated])
  No route
  returns bare JSON — including on the crash paths AND the
  method-mismatch paths AND the raced paths.
- **Degrade-not-fail AI:** `/api/workflows/generate` asks
  `z-ai-web-dev-sdk` for a workflow draft and falls back to the
  deterministic template (`src/lib/workflow.ts`) on any SDK failure — the
  feature never hard-fails, and the sanitizer clamps LLM output before
  persistence.
- **Legal/FAQ content is code:** `src/lib/legal-content.ts` and
  `src/lib/faq-content.ts` carry the reference-captured copy verbatim;
  content integrity is unit-tested (`content.test.ts`).

## Git workflow

- **`main` only** — no feature branches (operator contract).
- **Commits:** Conventional Commits with emoji prefixes: `:art: feat: …`,
  `:memo: docs: …`, `:bug: fix: …`.
- **Push:** via `docs/ssh_git_wrapper_v3.py` with an externally supplied key
  (see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`) — never a resident
  `~/.ssh` dependency.
- **Never committed:** `.env`, `*.key`, `db/*.db`, `node_modules/`,
  `dev.log`/`server.log`, `tests/e2e/.auth/` (all gitignored).
