# Session 60 — the formal log of the Session 30 remediation cycle

**The mission** (the task chain's 15 steps): refresh the workspace (the
sandbox had been RESET — the repo re-cloned from `origin/main` at
`6b69046`), review the five core docs + the four session docs
(session_58 the S29 formal log, remediation-plan-29 fully ticked, the
worklog tail, session_59 the S29 transcript), audit with the repo
skills, iterate toward parity, remediate TDD-first, screenshot, align
the docs, and push through the SSH wrapper.

**The baseline** on the fresh tree: environment rebuilt (npm install,
`.env` from `.env.example` with a fresh AUTH_SECRET, Prisma generate,
db:push + db:seed) — and the exported-`DATABASE_URL` trap LIVE in the
reset shell (the historical first-seed wrote the PARENT directory's
`db/custom.db` before the unset; re-seeded to the repo's own
`db/custom.db` immediately — checksum `e7f6c011`, 6 rows / 5 active /
7,120 runs, canonical). The baseline gate: **554 checks ALL GREEN**
(190 unit + 124 smoke + 240 e2e — no flake; lint + typecheck + build
clean) — the codebase fully aligned with its documentation.

**The audit** (the standing drift battery REBUILT for the reset
workspace — `research/drift-battery-s30.mjs` — plus the targeted live
probes): word parity **1.0000 on all 8 routes** (the reference's COPY
unchanged), the mobile-nav paired probe (the clone's burger opens with
a REAL tap into the byte-identical panel — **7 rows × exactly 44px**,
the same hrefs; **no Tailwind v4 bug**; the live's burger remains
pointer-blocked, D32, probed via JS click), the SEO surface (sitemap
200 `application/xml`, robots, the og-image 1200×630, the manifest —
the battery's own first draft probed `/manifest.webmanifest`, a script
bug fixed in-session; the clone serves `/manifest.json` 200 valid
JSON, the live's own 302-redirects through its app API).

**THE HEADLINE FINDING: the live reference REDEPLOYED a
structured-data layer** (gotcha 7 — the reference is a moving target;
the D62/D113 "ships none" record was true at ITS measurement time).
The drift battery's NEW JSON-LD mount column (the S29-suggested fifth
surface, hardened into the battery this session) caught
`application/ld+json` on EVERY live route: a minimal WebSite +
Organization pair everywhere (incl. /login + the SPA-404), a
BreadcrumbList (Home → {Page}) on the five content routes (FAQ,
Privacy, Terms, Accessibility, Refund Policy — live-captured). The
clone's answer: **parity + superset** (D115) — the sitewide pair
mounted ONCE in the root layout, the BreadcrumbList on the five
content routes + /demo (the crumb names ARE the routes' own metadata
stems — content-as-code, never re-typed), and the S29 supersets stand
(the SoftwareApplication with the PLANS-derived offers on the landing
— extracted from the @graph into a standalone script cross-linked
through the shared @id anchors; the FAQPage on /faq; the working
self-hosted og-image logo where the live points at its own CDN asset).
The second finding: **the 100/101-row dual-ceiling boundary** (the
session_58 S30 candidate) — constructed-correct but unpinned (the
seeded 6-row workspace hides both ceilings).

**The remediation** (`docs/remediation-plan-session30.md`, validated
against the codebase before execution — pin-conflict scans: the new
builder symbols nowhere; only the S29 spec pins ld+json; the
word-parity/transfer/CLS immunities inherited from the S29 proofs and
re-verified against the LIVE's own mounted scripts), executed
TDD-first: **RED observed** (10 structural unit failures — the builders
do not exist). R1 the four new pure builders in `src/lib/seo.ts`
(`websiteStructuredData()` / `organizationStructuredData()` /
`breadcrumbStructuredData(page, path)` / `softwareStructuredData()`) +
the mounts (the root layout pair; the landing's software node; the
breadcrumbs on the five content routes + /demo) + 10 unit pins + the
jsonld e2e suite evolved 2 → 4 (the parity mount, the every-route
pair, the live-captured breadcrumb names). R2
`session30-dual-ceiling.spec.ts` (the dedicated-user pattern,
`.serial`, the spec-scoped PrismaClient mint): (a) at EXACTLY 100 rows
NO list note (the `length < total` boundary) + the TRUE header + the
chart's own note at the same surface; (b) the 101st row (the OLDEST,
a 500-run champion) — the honest note, the oldest invisible, "101
total"; (c) the stats TRUE across the cap (1,500 runs / 105 hours
while the champion sits OUTSIDE the list yet FIRST in the chart).

**The mid-cycle tooling lessons** (both encoded as AGENTS gotcha 44 +
SKILL lessons 68–69): (1) **the zombie-server family struck twice** —
the reset sandbox's Bash tool kills backgrounded process trees at
invocation end (the e2e run and the probe server both died silently
mid-run); the fix is the subshell double-fork `( script & )` for every
long-running boot, plus the standing kill-before-restart discipline
when a probe answers from a STALE build (the :3260 zombie serving the
S29 @graph until the port was cleared). (2) **the fullPage-capture
trap** — the first 20-shot refresh produced a landing-full whose
below-fold sections were BLANK DARK BANDS (Playwright's
captureBeyondViewport does NOT scroll — the IntersectionObserver-driven
Reveal entrances never fired) and section shots captured mid-entrance
(the rAF entrances run delay + 600–900ms after the IO trigger); the
fix is a scroll-through pass before the capture + a post-action
settle, verified by a VLM read of the captured bands (the exit code
alone lies — a "successful" capture can be visually empty).

**Verification:** the full gate rose **554 → 569 checks ALL GREEN**
(200 unit + 124 smoke + 245 e2e — the plan's ~563 prediction
overshot by the jsonld suite's +2 evolution). The drift battery
re-run GREEN: word parity 1.0000 ×8 (the JSON-LD scripts never render
into innerText — the immunity held on both sides), the mobile-nav
byte-identical, the SEO surface clean, and the NEW JSON-LD column at
parity + superset (the clone: pair everywhere, breadcrumbs on the
content routes + /demo, the software node on the landing, the FAQPage
on /faq; the live: pair everywhere, breadcrumbs on the five). 20
screenshots genuinely refreshed (the scroll-through fix applied; the
DB canonical before AND after — 6 rows / 5 active / 7,120 runs). The
VLM spot-checks ×5: **5/5 PASS** (the one first-run FAIL — "no
dashboard mockup below the heading" — adjudicated as the check
prompt's own below-the-fold viewport assumption and verified in the
full-page shot).

**Documentation:** PAD (the revision block, the ledger D113-superseded
+ D115–D116, §7 counts 200/124/245 = 569, §7.2 the evolved jsonld
suite + the dual-ceiling suite, §11 the seo.ts row + the new spec
row), AGENTS (gotcha 44 + the counts + the invariant line's
Session-29/30 structured-data layer), CLAUDE (the session-30 context
+ the stack-table/checklist counts), README (the 569 badge + the
structured-data row at parity+superset + the verification block), SKILL
v2.29.0 (lessons 68–69), `.env.example` verified in sync (no new env
vars — the builders read the existing NEXT_PUBLIC_SITE_URL), the
remediation plan ticked with the measured gate, this formal session
log, and the worklog.

**Session 30 complete — all 15 task-chain steps executed; the commit
and push follow.** This cycle's theme was **the reference-redeployment
answer**: the battery's fifth surface caught the live's new
structured-data layer, and the clone answered at parity + superset in
one pass — the pair everywhere, the breadcrumbs on the content routes,
the supersets standing — while the dual-ceiling pins closed the last
unpinned dashboard boundary (the 100/101-row edge the seeded workspace
can never exercise). Two capture-and-tooling hazards were decoded and
encoded (the backgrounded-process killer, the fullPage blank-band
trap).

**Suggested next (Session 31 candidates):** the JSON-LD surface's
remaining refinements (an Organization `sameAs`/`contactPoint` once
the reference or the deployment carries real social/profile URLs —
inventing them would violate the content-as-code law; a WebSite
`SearchAction` only if a search surface ever ships); the battery's OWN
next hardening (a canonical/og-tag column — the live's canonical
pattern is currently word-parity's proxy, not its own measured
surface); or the dashboard's remaining unpinned boundaries (the
CHART_ROWS edge at exactly 8/9 rows with a tie at the boundary — the
S28 tie-break spec pins the tie order but not the 8↔9 note transition
itself).
