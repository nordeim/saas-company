I'll start working on this comprehensive task. Let me first set up a task plan, then begin with the workspace refresh.
The workspace already exists from previous sessions. Let me check the current state of the saas-company repo and worklog.
The workspace has extensive prior session work (Sessions 1-11 completed, repo at commit `ddef709`, tree clean). The user's current message asks for Session 18 workflow (reviewing session_17, remediation-plan-session11, worklog, session_18). Let me first refresh the workspace with git pull.
The pull brought in `docs/session_18.md` — the plan for the current session. Let me read the session docs.
Now let me read the key session documents to understand the current project state.
Now let me check the repo's root worklog (latest entries) and the project docs structure.
Now let me read the core project documents — AGENTS.md, CLAUDE.md, and README.md.
现在让我审阅 PAD 关键部分（修订块、偏差台账、质量门禁）以及 SKILL 文档版本。
Let me check PAD §10 (Known Issues), the skills catalog, and current environment state.
Docs are internalized. Now let me validate the environment state and run the baseline gate.
Environment is set up correctly (`.env` has `DATABASE_URL="file:../db/custom.db"`, `db/custom.db` at repo root, node_modules installed). The shell `DATABASE_URL` trap is live (exports a foreign absolute path) — I'll neutralize it per-command per AGENTS.md gotcha 1. Now running the baseline gate:
One e2e failure in the baseline — the FAQ motion-parity pin. Let me investigate whether it's flaky or a real regression.
The spec passes 27/27 in isolation — the failure is order-dependent/timing-sensitive (a genuine gate-fragility finding like Session 11's F1). Let me examine the failing test:
The test samples the FAQ item's pre-reveal state immediately after `goto` — inherently racy against the rAF reveal engine. Let me examine the reveal engine to understand the race window:
Let me examine the FAQ page structure and check whether the first FAQ item is in the initial viewport (the race window):
Let me check the captured failure details from the earlier run:
test-results is empty. Let me re-run the full e2e suite to reproduce and capture the exact failure:
**167/167 passed on the second run** — the FAQ motion-parity failure is an intermittent flake (1 failure in 2 full-suite runs, 0 in isolation). This is a genuine gate-fragility finding for this session. Let me characterize its flake rate:
2/10 failures in isolation — reproducible. Now let me capture the exact failure mode:
The flake is load-dependent (2/10 earlier, 0/16 now). The root cause is analytically clear from the test structure — the `pre` assertion samples a transient pre-hydration state right after `goto` with no synchronization, racing the 400ms reveal of the in-view first FAQ item. This is this session's first finding (same class as Session 11's F1 flaky pin).

Now let me set up the reference-site survey. First, checking existing survey tooling from prior sessions:
Prior survey tooling exists. Let me inspect the drift script and adapt it for this session:
The drift script is reusable. Let me start the clone server and run the paired drift check against the live reference:
The server process died with the shell. Let me restart it detached:
The server keeps dying between Bash invocations. Let me test persistence patterns:
The sandbox kills background processes between Bash sessions. Let me check for tmux/screen or use the agent-browser skill:
No tmux/screen — I'll run the server + survey script in the same Bash invocation (server backgrounded within the invocation):
**Word parity 1.0000 on all 8 routes — the reference is UNCHANGED.** The mobile-nav probe needs hasTouch contexts (known artifact). Let me run the dedicated mobile-nav survey:
Mobile nav verified: clone byte-identical and working (burger 342,16 24×24; panel 0,56 390×397, seven 44px rows; scroll-lock, Escape, resize guard all green; oklab bg = black/95 rendering-identical) — **no Tailwind v4 bug**; the live's burger remains pointer-blocked (D32). The `navigateCloses: false` is the known probe artifact (locator matches the hidden desktop pill; the e2e spec pins it properly and passes).

Now let me identify NEW survey surfaces. First, checking what the hydration spec listens for:
The hydration spec captures only `pageerror` — `unhandledrejection` and console noise are unsurveyed. That's a new surface. Let me also check the dashboard's client-side fetch-failure handling:
Found a code-level inconsistency: `compose()` catches fetch failures and surfaces an error, but `toggleStatus()`, `remove()`, and `signOut()` have **no catch** — a network-level fetch rejection becomes an unhandled promise rejection with no user feedback. Let me check the login card and newsletter handlers for the same pattern:
Login and footer both catch properly — the gap is dashboard-only. Now let me write the new-surface survey script (console-noise v2 + fault injection):
Key findings: (1) **the gasparyan-logo.svg preload fires on routes that never render it** (console warning + wasted bandwidth on /faq, /login, /dashboard); (2) all routes otherwise console-clean; (3) my fault-injection probe may have missed the actual buttons (composeErrorVisible false despite the setError contract) — let me check the real DOM selectors:
My probe's selectors missed (buttons use aria-labels, placeholder has no "idea"). Let me find the preload hint source and re-probe with correct selectors:
The preload ships only in `index.html`, yet the warning fires on non-landing flows. Let me check the logo-cloud img attributes and test the mechanism empirically:
The gasparyan img is eager and React Float auto-emits its preload. The warning fires on OTHER routes via RSC prefetch injection (navbar logo `<Link href="/">` prefetches the landing). Let me verify this mechanism empirically and fix the fault-injection selectors:
Mechanism confirmed. Three real defects found (uncaught fetch rejections in `toggleStatus`/`remove`/`signOut` → pageerror + dead UX under network faults; `compose` is the model). Let me check the layout for the preload source:
No explicit preload in source — it's React Float's automatic image preload. Let me empirically test whether `loading="lazy"` suppresses it:
The lazy experiment suppressed the preload. Let me verify the build completed and restore/confirm:
`loading="lazy"` suppresses React Float's preload emission cleanly. Before committing to this fix, let me check the LIVE's gasparyan img attributes for parity, and review the saved survey JSON:
The warning fires on /faq too — every navbar-bearing route is affected. Now checking the live's gasparyan img attributes:
The live shows no img with "gasparyan" in src — likely a storage URL. Let me probe its actual img inventory:
The live ships an **eager** img (loading: null) with no preload and no warning (SPA, no RSC prefetch). Notably, the live's own console shows 401 errors the clone doesn't have — clone wins that tier. The `loading="lazy"` fix kills the React Float preload (proven), eliminating the warning + wasted fetch on every navbar route; visible behavior identical for a below-fold 4KB local SVG.

Now let me check the dashboard's mount flow for `refresh()` handling:
The dashboard receives server-loaded initial state — `refresh()` only runs post-mutation. Now let me verify the SSR HTML serialization for the FAQ Reveal wrappers (for the deterministic F1 fix):
The SSR serialization is deterministic: `<div style="opacity:0;transform:translateY(15px)"><div data-state="closed"…` — the F1 fix can pin this statically. Experiment reverted (will re-apply as the R2 fix during remediation).

Let me check the hero video's loading attributes for parity:
Survey phase complete. Now let me review the smoke script structure, the push runbook state, and the e2e helpers before writing the remediation plan:
Now let me check the e2e dashboard spec's sign-in pattern and the push shim state:
All validated — the webServer pins `AUTH_RATE_LIMIT_MAX: "50"` (headroom for +4 sign-ins). Now writing the comprehensive remediation plan:
Plan written. Now the pre-execution validation pass against the codebase (per the mandate: review before executing):
All touchpoints validated. Now executing TDD. **R1 — the FAQ pin de-flake** (RED evidence already captured: the full-suite failure + 2/10 isolated):
R1 applied. Verifying with 10 consecutive isolated runs:
**R1 GREEN — 10/10.** Now **R2**: first rebuild from the current (pre-fix, eager) source so the RED observation is honest, then write the pins:
Observing RED against the pre-fix build:
**RED observed** — test (a) fails exactly as designed (the link IS injected pre-fix); test (b) is the visible-parity guard (green both sides). Now the smoke pin (RED first):
I introduced a stray artifact in that edit — fixing it:
Now observe the smoke pin RED (against the current pre-fix build):
Smoke pin RED confirmed. Now the GREEN fix — `loading="lazy"`:
Rebuild and verify R2 GREEN (e2e + smoke):
**R2 fully GREEN (47/47 smoke).** Now **R3** — writing the resilience spec (RED first):
Observing R3 RED against the pre-fix code (the build is current except the dashboard change):
**RED observed perfectly** — tests 1–3 fail on `TypeError: Failed to fetch`; test 4 (regression pin) passes. Now the GREEN fix:
Now the banner markup between the header and main:
**R3 GREEN — 4/4.** Now the full gate (314 checks):
Full e2e suite: **173/173 passed**. Let me re-run smoke against the final build (it was last run pre-R3-build):
**FULL GATE GREEN — 314 checks** (94 unit + 173 e2e + 47 smoke). Now the paired re-verification battery:
Word parity dropped sharply — either the live changed or the probe degraded. Let me diagnose the live side directly:
The live serves its normal shell. The drop is likely a timing/rendering artifact in the probe. Let me re-run with diagnostics:
The live is unchanged (identical word counts); the **clone** lost ~14 words on every navbar-bearing route. Let me identify exactly which words are missing:
The clone's /faq shows questions without answers (closed panels unmount). Let me diff against the live's current text to find the exact missing words:
Same content on both sides — the difference must be elsewhere. Let me do a precise word-frequency diff:
The clone's nav/footer links are concatenating in innerText (missing separators). This appeared between builds today. Let me probe the computed display styles of those links:
The nav links compute `display: inline` inside a `block` parent — the responsive `md:flex` layer may not be emitting. This is potentially the Tailwind v4 bug the operator warned about. Let me inspect the navbar source and the emitted CSS:
v4 uses range syntax — my grep pattern missed it. Let me re-check properly:
The CSS responsive layer IS emitted (48rem = md). My probe must have misidentified the structure. Let me look at the actual navbar markup:
The probe symptoms (links inline, parents block) match an **unstyled page** — possibly a stale server serving HTML that references deleted CSS chunks (the Session-11 zombie-server trap). Let me verify:
**Smoking gun confirmed**: the served HTML references CSS chunk `1uvz2rgwqbjqr.css` which no longer exists on disk (current build ships `1f27wm-7861kr.css`) — a **zombie server is serving a stale build** (the documented Session-11 trap). The word-parity "regression" is a measurement artifact; the real parity is proven green by the 173/173 e2e gate (which boots its own fresh server). Let me kill the zombie and re-verify:
**Word parity 1.0000 on all 8 routes** — the regression was purely the zombie-server artifact (documented trap). Now completing the re-verification battery (mobile-nav + console sweep + preload + fault-injection):
Mobile nav byte-identical on the remediated build. Now the console + fault-injection re-runs:
All re-verification GREEN. Now refreshing the screenshots (17 standard shots):
Let me add a shot of the new resilience banner (this session's visible feature), then refresh all screenshots:
All 18 shots captured. Let me verify the resilience-banner shot actually shows the banner (VLM spot check):
VLM confirms the banner renders correctly. Now Phase 5 — documentation. First, the PAD ledger and revision block:
Now updating the PAD — revision block, ledger rows D67–D69, counts, key files:
Now the ledger rows D67–D69:
Now updating §7 counts and §11 key files:
Now §11 key files — adding the new specs:
Now AGENTS.md — counts + gotcha 26:
Now CLAUDE.md — session-12 context block and counts:
Now README.md — badge, test counts, features row, troubleshooting:
Now the SKILL doc — version bump + lessons 32–33:
Now ticking the remediation plan checklist and writing the session log:
Now appending to the repo worklog:
Now verifying `.env.example` matches the codebase (the mandate's requirement):
`.env.example` matches the codebase exactly (all 4 vars documented; NODE_ENV is a platform var). Now the final tree review and commit:
Code is unchanged since the full 314-check gate (only docs/screenshots since). Running the quick confirmation layers on the exact final tree:
Committing with the repo's Conventional Commits contract:
Committed `bc017f0`. Now the SSH push per the runbook:
The runbook is clear and the shim exists at `/home/z/my-project/bin/ssh`. Materializing the operator key (outside the repo, per rule 4) and verifying the fingerprint:
Fingerprint matches all prior sessions (`3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`). Dry-run against the saas-company remote:
Dry-run accepted (fast-forward `23f19fb..bc017f0`). Real push:
Push verified (remote main @ `bc017f0` == local HEAD). Shredding the operator key:
Now recording the verified push in the worklog (the prior sessions' pattern — final docs commit):
Both commits pushed and verified. Final step — updating the workspace-level worklog:
**Session 12 complete — everything pushed and verified on `main`** (`bc017f0` + `853b3aa`, wrapper-verified remote == local HEAD, keys shredded, tree clean).

**What I did:** With the reference unchanged (word parity 1.0000 on all 8 routes) and the mobile nav re-verified byte-identical (no Tailwind v4 bug), I surveyed three new layers — console noise v2, network fault injection, and resource preloads — finding and fixing three defects TDD-first: the gate's own flaky FAQ motion pin, React Float's "traveling" Gasparyan preload (console warnings on six routes), and the dashboard's uncaught fetch rejections (now visible `role="alert"` banners). Final gate: **314/314 checks**, every route's console fully clean.

**Suggested next steps:**
1. Fresh-clone check: `npm install && cp .env.example .env && npm run db:push && npm run db:seed && npm run dev`
2. Try the fault resilience: disconnect mid-pause on the dashboard — the red banner surfaces instead of silence
3. Standing follow-ups remain: Google OAuth wiring and containerized CI (PAD §10)
