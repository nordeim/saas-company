# Remediation Plan — Session 41

The worklog S40 candidates (the reference-regression watch on the live's
four soft-404 routes, the responsive surface's route extension, and the
focus-order inventory as the battery's sixteenth surface), answered
against the measured codebase. The baseline is the Session-40 tree (gate
700 = 247 unit + 124 smoke + 329 e2e; the drift battery 15 surfaces, 69
checks across two phases, zero drift — `docs/session_80.md`).

## The re-scoping recon (research/recon-s41.mjs + the adjudication probes)

All three candidate surfaces measured BEFORE the contracts were designed:

- **The reference-regression watch (R1).** The live's 12 routes re-probed
  in full: the soft-404 set is UNCHANGED at four routes — `/pricing`,
  `/demo`, `/dashboard`, `/checkout` (HTTP 200, "Page Not Found", 16
  words) — and the working eight re-verified (`/` 739w, `/faq` 101w,
  `/thank-you` 36w, the four legal routes 335/390/566/285w). The live's
  `/login` initially flagged soft-404 on a word-count threshold (24
  words < 30) — the adjudication probe (research/adj-s41.mjs A1) shows
  it WORKING: the email + password inputs present, no "Page Not Found"
  text, the "Welcome to SAAS Company" heading. **The login is a
  light-but-working page — the route-watch check must assert the FORM,
  not the word count.** The live's sitemap is unchanged (7 URLs — no
  /login, no /pricing). **NO RECOVERY, NO NEW REGRESSION: D146 stands.**
- **The focus-order inventory (R2 — the sixteenth surface).** The Tab
  sequence captured as an ordered surface, paired clone-vs-live
  (research/recon-s41.mjs + adj-s41.mjs A2): the landing at 1440 (34
  stops) and 390 (28 stops), `/login` at 1440 (6 stops), `/faq` at 1440
  (28 stops), and the mobile open menu (10 stops). **Every combo's
  sequence is structurally IDENTICAL across sides** — same stop counts,
  same ordered tag sequences, same ordered href/name sequences modulo
  the registered records. The delta classes, all adjudicated:
  (1) the Dashboard CTA card href `/dashboard` (clone) vs `/checkout`
  (live) — the registered D-record; (2) the logo `aria-label="NovaAI
  home"`, the burger `aria-label="Open menu"`, the newsletter input
  `aria-label="Email address"` and button `aria-label="Subscribe"` —
  the registered a11y supersets (the live's controls are UNNAMED: the
  logo carries no label, the newsletter button is icon-only); (3) the
  open-menu CTA card height 327 vs 311 — the live's unfired
  `scale(.95)` dwell artifact (gotcha 52e, registered). The viewport
  pairing law: **the tab inventory is viewport-dependent on BOTH sides**
  (34 stops at 1440 vs 28 at 390 — the reference's own responsive
  reordering) — the surface pairs WITHIN a viewport, never across.
- **The measurement law (gotcha 52f — this session's law).** The first
  390 walk read FIVE stops — a capture artifact: the walk's stall
  detector broke on CONSECUTIVE UNNAMED CONTROLS (three icon-only
  buttons in a row share the same tag|href|name key, reading as a
  stall). The full-walk discipline (end only on body, cap 80) reads the
  true 28 stops on both sides. **Consecutive unnamed controls are
  legitimate stops, never a stall signal** — the fifth measurement law.
- **The mobile-nav standing verification (R3).** The burger a11y trio:
  the clone carries `aria-expanded` (toggling), `aria-label="Open
  menu"`, `aria-controls="mobile-menu"`; the live carries NONE. The
  open menu: 7 rows at exactly 44px on both sides, identical
  order/hrefs. The behavioral supersets, measured precisely
  (research/adj2-s41.mjs A4): the clone LOCKS SCROLL while open
  (`body overflow:hidden`) where the live does not; the clone CLOSES ON
  ESCAPE (the post-Escape walk resumes the page order: Book a Demo →
  Dashboard) where the live's menu STAYS OPEN (the walk continues the
  menu rows: Features → How It Works → Pricing); the clone returns
  focus to the burger. Gotcha 18 re-captured: the live's empty toaster
  shell (`z-[100]`, fixed) blocks pointer events on its burger —
  keyboard activation is the honest probe on the live.
- **The SEO surface (the standing check).** The clone's sitemap = 7
  URLs, the D141 policy set (live's set − {/thank-you} + {/demo}; no
  /login on EITHER side); robots.txt RFC-9309 (UA *, Allow /, Disallow
  /api/ + /dashboard, the Sitemap line); title/description/canonical/
  og:title present on the probed public routes. The base URL follows
  `NEXT_PUBLIC_SITE_URL ?? http://localhost:3000` — the registered
  convention; the URL SET is the parity contract, not the host.
- **The responsive route extension (the deferred candidate).** NOT
  taken this session: the focus-order surface (the operator's standing
  mobile-menu concern) + the standing route-watch filled the session;
  /faq + the legal routes at the four widths stay recorded as S42
  candidates.

## The ToDo list (TDD)

- [x] R1 — the route-watch record: NO RECOVERY, NO NEW REGRESSION (the
      soft-404 four unchanged, the working eight re-verified, the
      sitemap unchanged); the `/login` word-count false flag adjudicated
      (the form check replaces the threshold for light pages); D146
      stands
- [x] R2 — the sixteenth surface measured GREEN at parity (the five
      combos above; zero unregistered deltas; the viewport pairing law
      + gotcha 52f encoded)
- [x] R2a — `tests/e2e/session41-focus-inventory.spec.ts`: the
      clone-side pins — the landing's 34-stop walk at 1440 (the
      ordered skeleton: the 6-link head, the newsletter tail), the
      28-stop walk at 390, the burger a11y trio with the
      aria-expanded toggle, the open menu's row contract (44px), the
      Escape-close + focus-return + scroll-lock supersets, and the
      accessible names of the logo + newsletter pair — **7/7 GREEN on
      arrival** (the parity session's registry-pins pattern, the S39/
      S40 precedent)
- [x] R2b — the battery's sixteenth-surface phase
      (research/drift-battery-s41.mjs): the five paired walks with the
      full-walk discipline (gotcha 52f) + the D-record/superset
      adjudication + the menu behavioral trio + the route-watch
      registry (the login checked by its FORM) — **36/36 GREEN ZERO
      DRIFT** (focus-order 23 + route-watch 13; one battery check fixed
      in flight — the live's post-Escape walk reads the menu rows' HREF
      "#features", not the innerText "Features")
- [x] The full gate re-run on the clean build — **707 checks ALL
      GREEN** (247 unit + 124 smoke + 336 e2e = the 700 standing + the
      7 session41 pins; lint/typecheck/build clean)
- [x] The 20 screenshots refreshed under docs/screenshots/ (DB
      canonical before AND after — 6 rows / 5 active / 7,120 runs) +
      the VLM standing five — **5/5 PASS with ZERO flags**
- [x] The docs alignment: PAD (the revision block, §7 counts, §7.2 the
      session41 pins, §11), AGENTS (the counts + the sixteenth surface
      + gotcha 52f), CLAUDE (the session-41 context), README (the 707
      badge + the S41 rows), SKILL v2.40.0 (lesson 80: consecutive
      unnamed controls are legitimate stops — the full-walk law),
      .env.example verified in sync (no env vars touched, code-only),
      the session logs (docs/session_82.md is the S40 transcript —
      S41 adds docs/session_83.md curated + docs/session_84.md raw),
      the worklog
- [x] The commit + the wrapper push (the explicit `--remote`, the
      fingerprint check, the key shredding)

## The pushed-hash record (the closing discipline)

- Remediation commit **dcf9016** pushed via the SSH wrapper with the
  EXPLICIT `--remote git@github.com:nordeim/saas-company.git` (the S31
  trap: the wrapper's DEFAULT remote is the runbook's example repo —
  the explicit flag held from the first dry-run).
- Wrapper-verified: remote main @ dcf9016 == local HEAD; the
  fetch-independent HTTPS ls-remote agreed.
- The operator key's fingerprint verified through paramiko's own key
  parse BEFORE the push (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU
  — matches the S1-S40 record); both the wrapper's temp key copy and
  the operator's key file shredded after use.
- Zero zombies at close; the tree clean; no new branches.
