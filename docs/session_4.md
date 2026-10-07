I'll continue the task from where we left off. Let me set up the work plan and refresh the workspace first.
The workspace exists with both repos already cloned. Let me refresh the saas-company repo and read the worklog to understand prior state.
Worklog shows Sessions 1-3 are complete and pushed (main @ f8bd8b3). This is a new session continuing the parity work. Let me refresh the workspace and verify the latest state.
`git pull` brought in the new `docs/session_3.md`. Now let me review the root documentation files as mandated.
Now let me review the session-specific docs: `docs/session_3.md`, `docs/remediation-plan-session3.md`, and the repo's own worklog.
Session 3 context is clear. Now let me read `saas-company_SKILL.md` and the repo's worklog to complete the documentation review.
Documentation review complete. Now let me validate the codebase state — first the environment (the known `DATABASE_URL` trap), `.env`, `db/`, and `.env.example` state.
The known env trap is present again (shell exports a parent-workspace `DATABASE_URL`). I'll unset it for all commands per the AGENTS.md discipline. State validation: `.env` ✅ (`file:../db/custom.db`), `.env.example` ✅, `db/` at root ✅ (seeded custom.db), deps installed ✅. Now the baseline gate.
Lint ✅ · Typecheck ✅ · Unit 73/73 ✅. Now the production build, then smoke + e2e suites.
**Baseline gate: ALL GREEN — 165/165 checks** (73 unit + 54 e2e + 38 smoke). The codebase aligns with the documented Session-3 state. Now let me load the agent-browser skill for the live-reference re-survey.
Skill loaded. Let me check the existing survey scripts from previous sessions to reuse the established methodology.
Session-3 artifacts and scripts are intact. Let me review the drift-check script to reuse the established methodology.
Methodology understood. Let me check how the Session-3 survey script captured the live HTML, then build the Session-4 drift check on the same pattern.
Pattern understood. Now I'll write the Session-4 drift-check script: capture the current live site's HTML for all routes and compare against the Session-3 ground truth.
**Reference is UNCHANGED since Session 3** — 1.0000 text similarity on all 8 routes. Now let me log into the live site to verify the post-login state, the demo link target, and the mobile navigation geometry.
Logged in — lands on `/` as before. Let me check the post-login nav state and the demo link target.
Post-login nav unchanged, `/checkout` still 404s (clone's `/dashboard` superset remains valid), `html.lenis` present. Now the mobile navigation geometry check at 390×844 — the user's particular focus.
**Mobile menu geometry: BYTE-IDENTICAL to the Session-3 record** (panel 0,56,390×397; 7 rows @44px, exact hrefs/order). Now let me boot the clone's production build and run the paired clone-side survey.
Clone captured. Now the word-parity comparison across all routes — let me check the Session-3 parity script and adapt it.
Word parity matches the verified state (FAQ's 0.605 is the known collapsed-accordion DOM artifact). Let me inspect the landing's heading/link drift — it should be the documented superset items.
Landing drift = the two documented artifacts only (live's inline-`<style>` capture + the intentional D1 `/dashboard` superset). Word parity is confirmed at the Session-3 level.

Now the **Session-4 value-add: deep probes on surfaces prior sessions didn't fully cover** — login-page computed styles, head metadata, FAQ/pricing/features interaction states, hero video, tablet breakpoint. Let me write the paired deep-probe script.
**7 probe groups differ — several REAL new findings.** Let me investigate each: the login page body colors (live=white body, clone=black), the FAQ accordion animation classes, the pricing toggle structure, and the Get Started pill width at 768. First, the login page structure on both sides.
**MAJOR NEW FINDINGS on the login page:**
1. Live body = **white** (`rgb(255,255,255)`), clone body = **black** (`rgb(0,0,0)`)
2. Live login font = **system ui-sans-serif**, clone = Vend Sans
3. Live input text = **dark** `rgb(9,9,11)`, clone input text = **white on light-slate bg** (near-invisible typed text — a real usability bug!)

Let me examine the live login HTML structure and the clone's login source to size the fix.
The live login has a full-screen `bg-gradient-to-br from-slate-50 to-slate-100` main with a white/95 card. Now the clone's login source:
The clone's login page HAS the light `<main>` gradient — but it **inherits the dark body defaults** (bg black, text white, Vend Sans), while the live's login route swaps the body theme (white bg, zinc-950 text, system font). The inherited white text color makes typed input text nearly invisible (inputs don't set their own text color). Let me check the FAQ accordion implementation and the pricing toggle next.
The clone's FAQ snaps open/closed (`hidden` attr) while the live animates (`animate-accordion-down/up` Radix keyframes). Let me extract the live's accordion keyframes and check the pricing toggle markup, plus the Get Started pill geometry.
Live accordion CSS extracted: `accordion-down/up` keyframes, `.2s ease-out`, Radix `--radix-accordion-content-height` var. Now let me probe the live's pricing toggle structure and the Get Started pill geometry at both breakpoints.
Wait — the live's **Annual** pill shows active styling (`bg-white text-black`) on fresh load. Let me verify both sides' initial toggle state and prices precisely.
The probe's toggle click didn't actually switch states (it re-clicked the already-active pill). Let me directly compare the fresh-load toggle state and full price text on both sides.
**MAJOR FINDING**: The live's pricing toggle defaults to **ANNUAL** on fresh load, with Pro at **$39/month** (the annual price!). Let me click Monthly on the live to see the monthly price.
**CRITICAL FINDING — the clone's pricing model is INVERTED vs the live:**
- **Live**: defaults to **Annual**; Pro = **$39/mo annual**, **$49/mo monthly** (Save 20%: 49→39)
- **Clone**: defaults to Monthly; Pro = $39 monthly, $31 annual — **wrong default AND wrong prices**

Let me verify the full card captions in both live states, then check the clone's pricing model.
Pricing ground truth confirmed. Now let me examine the clone's pricing model and its test pins.
The clone's pricing has 3 gaps: wrong default (monthly vs live's annual), wrong base price (39 vs live's 49 monthly), and a "billed annually" caption the live doesn't render. Let me check the pinned tests and the toggle wrap's full class.
Toggle wrap class matches. Let me check all e2e specs for pricing assertions and probe the remaining findings (Get Started pill at 768, login body theme details).
Now let me consolidate the remaining probes: Get Started pill geometry at 768, the live's body theme on /login vs /faq vs 404, and input text visibility. One script, both sides.
Key results:
- **Get Started pill: SAME** at 768/1440 — earlier 138-vs-144 was font-load timing, dismissed with DOM evidence
- **Login body theme confirmed**: live swaps to white bg + zinc-950 text + system font on /login only; clone keeps dark theme → invisible typed text
- **Pricing inversion confirmed**

Let me check the 404 page structure and the full FAQ button classes, then run the VLM visual comparison.
Let me check the clone's 404 page implementation for comparison.
The clone's 404 uses a light `bg-slate-50` full-screen wrapper, but the live's 404 body is BLACK. Let me examine the live's 404 DOM structure precisely.
The live's 404 uses the same light wrapper structure as the clone — byte-faithful, NOT a finding. But /login swaps the actual body theme. Let me check exactly how the live's body tag differs per route.
The live's body tag is attribute-less everywhere — the /login theme must come from an injected style rule. Let me find it.
No explicit white rule — the live's /login simply doesn't apply the dark body theme (falls back to browser defaults + a zinc-950 text rule). Let me confirm what the landing's dark body rules look like.
The body theme flows from CSS vars (`--background`, `--foreground`, `--font-body`). Let me find the /login var override.
The live's /login loads a **different CSS bundle** (`/static/index-Dqfc36mx.css`) — a separate app chunk with its own theme. Let me extract its body rules.
Root cause found: the live's /login loads its own CSS bundle with a LIGHT theme (`--background: 0 0% 100%`, `--foreground: 240 10% 3.9%` zinc-950, system font stack). The clone's login inherits the dark theme vars → white input text. Now let me run the VLM visual comparison to catch any remaining visual deltas.
Let me capture fresh paired screenshots (full landing + login page + pricing section + mobile menu) for the VLM comparison.
Module resolution issue — the script lives outside the repo. Let me symlink the repo's node_modules into the scripts dir.
The chat endpoint rejects image content. Let me check the SDK's API surface for the vision method.
The SDK exposes `chat.completions.createVision`. Let me fix the script.
VLM scores: full 92, login 96, pricing 97, mobile 98. Cross-checking flags against DOM evidence (the "DOM beats VLM" rule) — several look real: **nav scroll-spy highlighting**, **mockup list bullets**, **"One Platform" mockup layout**, **"15+ vs 10+ hours" copy**, and the **footer missing from the clone's full-page shot**. Let me verify each.
"15+ vs 10+ hours" is a VLM misread — both DOMs identical (word parity 1.0 confirms). Now the footer-missing flag and the nav scroll-spy.
No active class in the live's nav at `#pricing` — let me check computed colors (the highlight may be hover-state or scroll-spy via inline styles).
**Unexpected**: after scrolling, the live's nav links turn BLACK with the active section getting a 15% pill — the nav may switch to a light theme when scrolled! Let me screenshot and probe the nav's background.
**MAJOR DISCOVERY**: The live's logo SVG fills are **BLACK** when scrolled over the white features section — the navbar adapts light/dark based on the section underneath, plus scroll-spy active-link highlighting. Previous sessions only surveyed the nav at the top! Let me map this behavior across scroll positions.
**The live's navbar behavior is now fully mapped**:
- **Scroll-spy**: active section's link gets a pill — `bg-black/15` (light mode) / `bg-white/30` (dark mode), active text solid, inactive 60%
- **Adaptive theme**: over the white features section — logo fill black + black links; over dark sections — white

Let me check what the clone's navbar does.
The clone's navbar has a scrolled glass state (`bg-black/80`) that the LIVE doesn't show at 3323 — and it lacks scroll-spy/adaptive theme. Let me map the live's full nav chrome (nav bg, pill bg, Log In color) across scroll positions.
The live nav is **always bg-transparent** — no scrolled glass bar! The clone's `bg-black/80` scrolled state may be an invention. Let me verify with real wheel scrolling (in case of direction-aware behavior) and check the nav in the Session-3 capture for consistency.
Definitive: the live nav is **always transparent** — the clone's scrolled glass bar is a divergence that survived 3 sessions because full-page screenshots only show the nav over the hero. Let me find the exact adaptive-theme trigger boundaries (the features section's range).
Scroll-spy uses the viewport-center section. Now let me pin the light/dark trigger boundary precisely (nav-strip overlap vs section top).
Boundary semantics mapped: light mode ⟺ nav band (0-72px) overlaps the features section; scroll-spy ≈ last section whose top passed the ~2/3 viewport line (with no-link fallback). Let me check which element carries the white background in both features sections.
The features section is a white **gradient** (bg-image, not bg-color) — so the clone's nav light-mode detection should use a data-attribute on the light section. Let me check the clone's logo component for the fill mechanism.
The logo uses `currentColor` — the light-mode swap is a className change. Now let me verify the remaining VLM flags: mockup bullets, "One Platform" layout, and the 95px height delta.
The live's mockup bullets are **solid** `bg-primary/80` dots. Let me check what the clone renders.
Both sides use `w-2 h-2 rounded-full bg-primary/80` dots — but the clone adds a `skeleton-wave` animation class the live doesn't have. Let me check the keyframes and compare screenshot crops.
**Real bug found**: `.skeleton-wave` **overrides** `bg-primary/80` with a near-transparent white gradient (unlayered CSS beats layered utilities) — the clone's mockup dots render nearly invisible instead of solid purple. Let me verify on the clone's rendered DOM.
`.skeleton-wave` is unlayered → beats `bg-primary/80`. Also discovered: globals.css already has an unused `.accordion-panel` class (grid-rows transition) — written in Session 1 but never wired into the FAQ! Let me check whether the live's mockup tiles shimmer at all (to know where the wave SHOULD apply).
**The live's mockup has ZERO animations — it's static!** The clone's skeleton-wave + grow-in animations are inventions. Let me compare the mockup crops and check the live's tile styles.
The live's mockup tiles are static (opacity 1, no transitions) with identical base classes — the clone's `skeleton-wave` + grow-in stagger are inventions. Now the "One Platform" mockup layout flag.
The live's platform mockup: browser chrome + title lines (h-4 white/20 + h-3 violet/30) + 4 h-12 blocks + h-20 block. Let me compare the clone's.
The platform mockup is **byte-identical** — VLM misread dismissed. Now the footer-bottom check, mobile hero spacing, and the pricing Annual pill width.
Footer exists on both sides (VLM misread). The mobile hero gap needs the clone comparison — let me boot the clone and measure both sides' h1 offsets at 390, plus the Annual pill width at 1440.
Mobile hero is **identical** (VLM misread dismissed). The Annual pill differs by 4px (161 vs 165) — let me capture the live's badge classes for the fix.
The 4px comes from a JSX whitespace text node (clone renders `Annual\n<span>` = trailing space; live renders `Annual<span>` directly). One last check — the mockup chart bar heights — then `npm audit`, and I'll compile the plan.
Chart bar sources are **identical** (42,64,45,80,55,70,90,60,75,85,50,95% both sides — VLM misread). I also spotted a corrupted class `transition-eight]` in the clone's bars. The audit is complete. Let me check which e2e pins the navbar/toggle state before writing the remediation plan.
FAQ_ITEMS = 6 (+4 footer h3s = 10 total — the docs are correct; false alarm). **The audit is complete.** Let me quickly consult the repo's skills catalog for the TDD execution discipline, then write the remediation plan.
Skills catalog confirms the TDD discipline. Now let me write the comprehensive Session-4 remediation plan with the detailed ToDo list.
Plan written and validated. Now executing TDD-first. Let me update the todos and start with R1 (login theme) — RED spec first.
Now writing the RED specs for R1 + R6 in the brand-parity suite.
RED specs for R1+R6 written. Let me observe the RED state against the current build.
**RED observed exactly as designed** — 3 failed (login theme ×2, status-bar-style), 1 passed (dark-routes guard). Now GREEN: the route-scoped login theme + the metadata fix.
R1+R6 GREEN applied. Rebuild and verify the specs turn green.
**R1+R6 GREEN — 17/17 brand-parity checks pass.** Now R2 (pricing): RED unit pins first.
RED observed (4 unit failures as designed). GREEN: fix the domain.
Unit GREEN (9/9). Now the e2e RED — update the pricing block in pages.spec.ts to the live truth.
RED observed (3 e2e failures). GREEN: the component fix — annual default + the no-whitespace pill markup.
R2 GREEN applied. To batch build cycles, let me now write the RED specs for R3 (navbar), R4 (mockup), R5 (accordion) and observe all REDs against the current build in one pass. First, the navbar behavior spec.
Now the R4 mockup pins. Let me check the landing.spec.ts structure.
Now R5 — the FAQ accordion pins. Let me view the current FAQ test block.
All RED specs written. Observing RED for R3/R4/R5 against the current build.
**RED confirmed: 10 failed (all new pins), 21 passed.** Now GREEN for R3 — the section-aware navbar.
Now mark the features section as the light-theme section.
R3 complete. Now R4 — let me read the full dashboard-preview.tsx for the static rewrite.
Before rewriting, let me capture the live's dashboard-preview chrome and tile classes exactly for a byte-faithful static version.
The live's bars use randomized decimals (e.g. `45.9338%`) — the clone's fixed snapshot is the right deterministic parity choice. Now the static rewrite (R4 GREEN):
R4 component is now static (no client JS needed). Now update globals.css: remove the dead skeleton-wave, add the accordion animation tokens for R5.
Now the R5 GREEN — the FAQ view with the measured Radix-style accordion.
All GREEN changes applied. Lint + typecheck + unit first, then rebuild and run the full e2e suite.
TypeScript error in the navbar spec — the two `spy` evaluations have different shapes. Fixing:
CSS syntax error from my globals.css edit. Let me inspect the edited regions.
The error maps to the END of the combined sheet — near my accordion keyframes. Let me check how the existing keyframes are declared (inside vs outside `@theme`).
The `@theme` comment I added contains a **semicolon** (`--radix-accordion-content-height; the panel…`) — Tailwind v4's `@theme` parser may split declarations without honoring comments. Removing the semicolons from the comment:
Same error position. Let me isolate with the Tailwind CLI directly for a cleaner diagnosis.
The CLI (v4.3.3) processes it fine — the project's own Tailwind version may differ. Let me check and isolate whether my CSS or something else breaks the build.
Versions match the working CLI. The `.next` cache may hold the poisoned intermediate — let me clear it and rebuild.
The manual pipeline works too. Let me check whether the **Tailwind-generated output** contains the syntax error — parse the CLI output:
**The generated output itself is broken** — line 5621:23. Let me see it:
`aspect-ratio: 16:9` — but that class existed in the baseline too. Let me check what's at the flattened column 147675 to find the REAL culprit.
Let me empirically test the baseline: stash my changes, generate the CLI output, check if it also breaks postcss.parse.
Baseline parses OK, mine doesn't — only 5 bytes difference! Let me diff the two outputs.
Same class, different generated CSS (`16/9` vs `16:9`)! Let me compare my rewritten source string byte-for-byte against the original.
Root cause found: the original used `md:aspect-[16/9]` (slash — valid CSS output); my rewrite "corrected" it to a colon which generates invalid CSS. Fixing:
Still failing. Let me regenerate and find ALL parse errors in the current output iteratively.
The CLI output parses now, but the build still fails at the SAME position — so the build's broken content is unchanged between attempts. Let me bisect: first suspect is the login page's inline `<style>` tag (new raw CSS in JSX).
Not the login style. Let me bisect systematically — revert all components (keep globals.css + tests changed):
Still fails! Only globals.css, login, lib, and tests remain changed. Bisect further — keep ONLY globals.css:
**The culprit is globals.css alone!** Let me bisect within it — first, only the `@theme` addition:
`@theme` vars build fine — the problem is the keyframes section. Let me add just the `@keyframes` blocks:
Both parts build fine separately! The trigger must be my **comment text** — Tailwind's scanner extracts class candidates from comments too, and I wrote `data-[state=open]/[closed]` in a comment — an invalid candidate that generates broken CSS. Testing the hypothesis:
Comment alone passes too. Let me reconstruct the EXACT failing globals.css (removal of skeleton-wave + accordion-panel + full comments) and confirm:
It compiles now! The earlier same-position failures were **stale turbopack cache artifacts** — the original breakage was the `aspect-[16:9]` typo, and subsequent builds kept reusing the cached broken transform. Let me restore ALL my remediation changes and rebuild:
Build passes! But the bisect reverted `src/lib/pricing.*` and deleted `navbar-behavior.spec.ts` — let me re-apply those.
Now recreate the navbar-behavior spec (deleted during bisect):
All layers green. Now the full e2e suite — the moment of truth for all the new pins:
Both failures are my spec's fault: (1) at scroll 3400 the Features link is the ACTIVE one (solid black — correct behavior, wrong expectation), and (2) the oklab serialization (the established D6 rule). Fixing the pins:
I introduced a contradiction in the spy assertions (featuresBg and activeFeaturesBg are the same element). Cleaning up:
The dark pill's computed value has yet another serialization. Let me probe what it actually is:
The white/60-30 pills serialize as `oklab(0.999994 0.0000455678 ... / 0.3)` — long decimals, not the clean form. I need a proper parser instead of exact strings:
Navbar spec 4/4. Now the complete e2e suite:
**67/67 e2e passed!** Now the smoke suite to complete the full gate:
**FULL GATE GREEN — 178 checks** (73 unit + 67 e2e + 38 smoke). Now the R7 paired re-survey to verify parity against the live.
**PERFECT WORD PARITY: 1.0000 on every page** — including FAQ (was 0.6052 — the R5 unmount fix closed the long-standing DOM artifact)! Now the mobile menu geometry and the navbar scroll side-by-side:
Byte-identical modulo a trailing newline (capture artifact). Now the navbar scroll map on the clone — comparing against the live's audit map:
The probe inherited the 390px mobile viewport from the survey script — invalid comparison. Re-running at 1440×900:
**Clone scroll map matches the live EXACTLY** at all six positions (logo fill, active section). Now the final VLM visual verification with fresh paired screenshots:
Scores: full 92, login 90, pricing 97, mobile 98. Most flags are known artifacts (marquee frames, bar randomization, anti-aliasing) — but the **login card spacing** (score dropped to 90, all flags = "reduced spacing") needs DOM investigation. Let me probe line-height and card metrics on both sides.
Same font/line-height now ✓, but the card is 12px shorter and the h1/p margin pattern is inverted (v4 `space-y` uses margin-bottom on `:not(:last-child)`, the live's uses margin-top on subsequent siblings). Let me locate the 12px difference precisely:
Sub-pixel archaeology: the divergence is the label→input gap (live 10px vs clone 6px, ×2 blocks = the 12px card delta). Let me read the live's label classes and margins exactly:
Root cause: the live's `space-y-1.5` uses v3-style margin-top on the following sibling; v4's margin-bottom on the *inline* label is lost (vertical margins don't apply to inline boxes) — tightening each label→input gap ~4px (×2 = the 12px card delta). Scoped fix in the login route style:
Let me add a pin for the measured login-card spacing, then rebuild and verify:
18/18. Let me recapture the login pair and VLM-verify the spacing fix, plus check the two remaining mobile/pricing flags:
Live dot at y=783 vs clone 790 (7px delta to investigate). The VLM run failed on module path — rerun from the repo dir, and probe the dot's parent chain on both sides:
Login VLM: 90 → 95. Now the mobile scroll-dot 7px delta — let me check the hero geometry on both sides:
Scroll-dot containers are **byte-identical** (parentB=812 both) — the 7px dotY delta is the `animate-scroll-dot` travel caught at different phases. Dismissed. Now the pricing Pro-card gradient flag:
Pro card colors are D6-identical (oklab spelling of the same violet), but the card is 27px taller on the clone. Let me locate the delta:
Small height deltas everywhere (+4/+2/+2/+11) suggest font-metrics or wrapping differences. Let me compare the feature rows and computed fonts:
All residual flags dismissed with DOM evidence (same font/line-heights/colors; +1-2px per row is self-hosted font-cut sub-pixel accumulation — I'll document as an accepted artifact). R7 verification is complete. Now R8 — refresh the docs screenshots. Let me check the Session-3 capture script:
All 13 screenshots refreshed. Quick sanity check that the pricing shot shows the Annual default, then update the documentation:
Login shot shows the light theme correctly. Now the documentation alignment — starting with README:
Now add the Session-4 gotchas to AGENTS.md and the known-context to CLAUDE.md:
Now the PAD — revision block and the deviations ledger:
Fixing a typo ("turbopake"), then updating the SKILL doc:
Now append the Session-4 lessons and update the component notes in the SKILL doc:
Now the repo worklog record and the .env.example verification:
Let me run the final complete gate one last time before committing:
The chain broke at build — let me check whether the build actually failed or rg just missed the pattern:
The stale turbopack CSS cache resurfaced (no source changes since the successful build — only markdown edits). Clearing `.next` and rebuilding — exactly what SKILL lesson 15 now documents:
**Real root cause found** (different position: 21370): my markdown documentation itself contains the literal `aspect-[16:9]` token — Tailwind v4's scanner extracts class candidates from **.md files too**, generating the invalid CSS from the DOCS! The "cache" theory was wrong — writing the trap into the docs re-triggered it. Let me verify and fix all doc occurrences:
Confirmed — 5 doc locations carry the invalid literal. Two-part fix: (1) rewrite the docs to avoid the exact token, (2) exclude markdown from Tailwind scanning in globals.css:
Now the belt-and-braces fix — exclude markdown from Tailwind's scanning in globals.css:
Let me make the exclusions glob-explicit for reliability:
Build passes. Now the critical verification — the full e2e suite proves no utilities were lost by the scanner exclusions:
**FINAL GATE: ALL GREEN — 179 checks** (73 unit + 68 e2e + 38 smoke; +1 = the login-spacing pin). Updating the counts to 179/68 and re-running lint/typecheck after the globals change:
Let me append the @source discovery to the repo worklog and update the shared workspace worklog:
All 29 changes are source/docs/screenshots — no secrets or DB files. Staging and committing per the repo convention:
Committed (29 files, +1070/−159). Now the SSH push — let me review the runbook and set up the wrapper:
Runbook understood. Executing the field-tested sequence — shim check, key materialization, fingerprint verification:
Fingerprint matches the Session 1/2/3 records. Dry-run, then the real push:
**Push verified: remote main @ 5f4293f == local HEAD.** Shredding the operator key and recording the push in the worklog (per the handoff pattern):
All done — both commits pushed and verified, tree clean, keys shredded. Final cleanup and todo closure:
**Session 4 complete.** The full audit → remediation → re-verification → push cycle is done and verified on `main` @ `de18717` (remediation commit `5f4293f`, 29 files, +1070/−159).

**What this session delivered:**

- **Audit** (new surfaces prior sessions never probed): 13 deep computed-style probe groups, the first scroll-state navbar survey, the live's /login CSS-bundle diff, and both pricing-toggle states driven on the live. Reference confirmed unchanged; found **6 clone-side gaps**.
- **6 fixes, all TDD-first** (14 new e2e checks, every one observed RED then GREEN):
  1. **Login light theme** — typed input text had rendered near-invisible white; the route now swaps the body theme exactly like the live's own login bundle (+ the v3-style `space-y` restore for inline labels)
  2. **Pricing truth** — the live *defaults to Annual* (Pro $49 monthly / $39 annual); Session 1 had read the annual price as the monthly one
  3. **Section-aware navbar** — the scrolled-glass bar was an invention; the live nav is always transparent with scroll-spy pills + light-mode swap over the white features section
  4. **Static mockup** — the unlayered `skeleton-wave` had silently overridden `bg-primary/80` (invisible dots)
  5. **Animated FAQ accordion** with the live's Radix keyframes + unmounted closed panels → **word parity 1.0000 on every page** (the 0.6052 FAQ artifact is closed)
  6. `status-bar-style: black`
- **Bonus root cause**: Tailwind v4's scanner reads class candidates from **markdown** — documenting the invalid aspect-ratio spelling in the docs re-broke the build; fixed with reworded docs + `@source not` exclusions.
- **Gate re-locked at 179 checks** (73 unit + 68 e2e + 38 smoke); VLM 92/95/97/98 with all residual flags dismissed via DOM evidence; docs, SKILL v2.3.0, 13 screenshots, and `.env.example` all aligned.

**Suggested next steps**: (1) fresh-clone the repo and run the pre-ship checklist to spot-check the pushed state; (2) if the live site redeploys, re-run the paired survey before touching chrome; (3) standing follow-ups remain: Google OAuth wiring and containerized CI.
