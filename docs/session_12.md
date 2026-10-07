The workspace exists from previous sessions. Let me read the full worklog and refresh the repo state.
The local repo is at Session 7 state, but the task references session_9/session_10 docs — the remote has advanced. Let me pull the latest.
Only one new commit arrived (docs/session_10.md). Let me inspect the docs folder and read the key status documents.
Now let me read the remaining status docs — session_8.md, remediation-plan-session7.md, and the repo worklog.
Clear picture forming. The repo is at Session-7 remediation state (gate 227). Now let me read the repo worklog and root docs to complete the status review.
I now have the complete state picture. Let me review the root docs to complete Phase 1 (mandatory per the task).
Now the PAD — I'll read the key sections (deviations ledger, gate, standing follow-ups).
All documentation reviewed. I have the full picture: the repo is at **Session-7 remediation state** (gate 227 = 80 unit + 109 e2e + 38 smoke, word parity 1.0000 on all 8 routes). Now let me set up the session plan and validate the codebase.
Environment validated — `.env`/`.env.example`/`db/` all correct, configs exclude `skills/`, and the shell `DATABASE_URL` trap is live again (must neutralize per AGENTS.md). Now the baseline gate:
Lint ✓, typecheck ✓, Vitest 80/80 ✓. Now build + smoke + e2e:
**BASELINE GATE: ALL GREEN — 227 checks** (lint ✓ typecheck ✓ Vitest 80/80 ✓ build ✓ smoke 38/38 ✓ Playwright 109/109 ✓). Codebase matches the documented Session-7 state exactly.
Phase 2 — the audit. Let me check the survey tooling left by prior sessions:
The prior session's tooling is intact. Let me set up this session's survey directory and check the drift-check script:
**DRIFT CHECK: reference UNCHANGED — word parity 1.0000 on all 8 routes.** All findings will be clone-side or live-side bugs. Now the NEW survey surfaces. This session's targets — layers no prior session systematically surveyed:

1. **The MOTION layer** (computed transition + animation values — durations, easings, delays, iterations; the live's config may override scale values like it did with tracking)
2. **The line-height/leading scale** (typography survey covered letter-spacing + font-family, never line-height)
3. **Border-radius + box-shadow scales**
4. **Intermediate breakpoints 640/1024** (never measured; set was 1440/1280/768/390 + edges 1920/320)
5. **Pseudo-elements** (::before/::after decorative layers)
6. **prefers-reduced-motion behavior**
Rich findings already. Let me capture the full output to a file for careful analysis:
The `/` section reveals important patterns. Let me analyze the full output systematically — matching MISSING entries to their clone counterparts by text:
The `/` section output was truncated (78 diffs, 40 shown). Let me get the full data as JSON:
Key findings emerging. My text-matcher has a flaw for position-based matching (petals). Let me refine the analysis and probe the Reveal behavior — the biggest lead:
Major discoveries. Now the critical lead — the **Reveal entrance vs hover-transition conflict**. Let me examine the clone's Reveal component and probe the live's entrance behavior:
Root cause confirmed — the clone's `<Reveal>` IS the card, appending `transition-all duration-700 ease-out` onto elements that carry their own hover transitions. Now the critical question: **what does the LIVE's entrance actually do?** Let me probe:
The live page has the cards — my probe raced the SPA boot. Let me make the entrance probe robust:
**BREAKTHROUGH FINDING.** The live's entrance eases in over ~600ms (0→0.33→0.61→0.86→1) while the clone's **snaps instantly** — and the clone's settled cards carry corrupted hover transitions (0.7s+delay vs the live's 0.15s). The root cause: the Reveal's `transition-all` loses the cascade to the card's own `transition-colors`, so opacity/transform never animate. Let me capture the live's exact entrance mechanism:
**THE LIVE'S ENTRANCE IS rAF-DRIVEN** — per-frame inline style writes (`translateY(17.7654px)` at ~17ms intervals), opacity over ~650ms, transform over ~900ms — bypassing CSS transitions entirely. The clone uses CSS transitions that conflict with card classes. Let me identify the live's animation library and extract exact parameters:
Framer-motion-like signatures confirmed. Let me extract the exact entrance configs from the bundle:
Framer-motion with per-element y-offsets (20/30/40/60). Let me extract the full component contexts with transitions:
The complete entrance choreography extracted — per-section y-offsets, durations, staggers. Now the easing — let me extract framer-motion's default easing from the bundle and fit it against my samples:
The easings extracted: `easeOut = cubic-bezier(0, 0, 0.58, 1)`, `easeInOut = cubic-bezier(0.42, 0, 0.58, 1)`. Let me fit the sampled curve to determine which one the entrance uses:
**Easing confirmed: `easeOut` = cubic-bezier(0, 0, 0.58, 1)** (MAE 0.014 — sampling noise). The live's entrance system is now fully characterized. Let me verify the settled end-state, reduced-motion behavior, and diff the remaining EXTRA elements:
More findings: the **live is BROKEN under reduced-motion** (below-fold content stuck at opacity 0 — never appears), while the clone correctly reveals. Also: Log In button class-order diff, newsletter button's invented `disabled:opacity-50`, and an inline-style residue. Let me verify the reduced-motion bug more thoroughly and chase the remaining elements:
More real findings: the clone's nav logo anchor carries invented classes, the FAQ chevron color class differs (`text-muted-foreground` vs `text-white/50`), and **the login submit's focus outline diverges (live: white ring; clone: violet)**. Let me see the full RM output and dissect the live's login focus CSS:
The full RM output shows the live's content DOES appear under reduced motion — the earlier op=0 was a timing artifact. Let me measure the live's RM entrance timing precisely:
**The live animates entrances IDENTICALLY under reduced-motion** (RM curve ≈ normal curve); the clone snaps instantly — a documented-superset candidate (a11y-correct). Now the login focus-ring — let me fetch the live's login CSS bundle:
The live's login `--ring: 240 10% 3.9%` (slate-950) and the button carries `focus-visible:ring-ring`. Let me capture the actual keyboard-focused rendering on both sides:
**NEW SYSTEMATIC FINDING — the v4 shadow-scale shift**: v4 renamed shadows (v3 `shadow-sm`→v4 `shadow-xs`, v3 `shadow`→v4 `shadow-sm`), so the live's `shadow-sm` (0 1px 2px 0.05) renders bigger on the clone (0 1px 3px 0.1). Plus the login input ring diverges (live: slate-400; clone: violet). Let me survey all shadows and the input classes:
The live's login has a **round logo avatar (h-20 w-20, shadow-lg, ring-4 ring-white/50)** that the clone lacks entirely, plus the v4 `shadow-sm` scale shift on the Sign in button. Let me compare the login logo structures:
**MAJOR FINDING: the LIVE's login card opens with a 96px round avatar** (letter 'S', ring-4 ring-white/50, shadow-lg, gradient glow) **that the clone lacks entirely**. Let me examine the clone's login page source:
The clone HAS the avatar (line 234) — my dump was just truncated. Let me see the clone's card top:
The clone's avatar shadow string was truncated in my dump — and my survey's alpha regex may have failed on v4's oklab serialization. Let me get the full computed shadows:
**Avatar shadow = PARITY** (oklab spelling — my survey's filter false-negatived it), but the **Sign in button's `shadow-sm` divergence is CONFIRMED** (v3 `0 1px 2px 0.05` vs v4 `0 1px 3px 0.1` — the v4 scale shift). Now let me map the clone's Reveal parameters against the live's extracted choreography table:
Testimonial cards, dashboard mockup, hero mount animations, and FAQ-page items — all unanimated on the clone but animated on the live. Let me extract the complete motion config inventory from the live bundle:
Hero mount animations identified (badge y=20/.6, H1 y=40/.8/delay.4, subtitle y=30/.8/delay.6). Let me identify the four `max-w-3xl mx-auto` mount-animated blocks and check the CTA scope:
The four `max-w-3xl` blocks are the legal pages' content (mount-animated y=20/.6), and the CTA animates only its badge. Let me check the FAQ page heading and the login page's mount animations:
Login = static both sides ✓. Let me check the FAQ chevron's computed color and the clone's shadow/disabled-class usages — the last verification items:
Let me check the landing's FAQ section and the live's /faq heading animation state:
The live wraps each FAQ item in an unclassed motion DIV. The audit is nearly complete — let me run the remaining planned survey surfaces (line-height scale, border-radius map, intermediate breakpoints 640/1024) to be thorough:
Geometry at 640/1024 identical, pseudo-elements identical, `rounded-full` = 9999px vs v4's infinity (rendering-identical engine artifact). Let me see the line-height results:
**THREE REAL LINE-HEIGHT DIFFS** — v4 changed default leading values (text-base 24→26px, text-4xl 40→45px, text-6xl 60→75px). Let me extract both sides' full text scale:
The rules reference vars — I need the `:root` custom-property values. Let me diff those:
The clone's `@theme` already pins most line-heights to v3 values but `--text-base--line-height` resolves empty. Let me read the repo's globals.css:
v4's default ratios match v3 — yet the clone renders 45px. Let me probe which rule actually wins on the clone's H3:
The root cause is the **v3/v4 cascade inversion**: v3's `text-*` line-height beats `leading-*` utilities; v4 inverts this via `--tw-leading`. Let me verify the mechanism and enumerate the blast radius:
Let me verify the remaining co-occurrence cases directly against the live (step copy, problem copy, KV span):
The complete cascade rule is now clear: **responsive text-size (`sm:`/`md:`) beats `leading-*` in v3, but v4's `--tw-leading` always wins** — exactly 3 affected elements. Let me read the hero and CTA structures to finalize fix sites:
The live's H1 IS the motion element (inline style grows to include opacity/transform). One last check — the logo cloud container's motion state on the live:
**AUDIT COMPLETE.** The logo-cloud container's Reveal is an invention (live = static), and the mockup/strip cards are confirmed motion elements. I have the full findings inventory — time to write the remediation plan:
Plan saved. Now TDD execution — RED specs first. Let me check the e2e conventions:
Now writing the RED specs. First the unit test for the motion module — let me compute the exact bezier values to pin:
Now the e2e motion-parity spec (the RED batch):
Now observe the RED state — unit first, then e2e against the current build:
RED observed: **20/21 e2e checks failing + unit module missing** (the one passing is the intended non-regression guard). Before writing GREEN — verify the v4 emission mechanics for the two token overrides:
Both utilities emit static values — I need to check whether `@theme` keys can override them at build time:
`--shadow-sm` is theme-driven (R2 works), but transition-property lists are hardcoded (R3 needs a layered override), and `.leading-relaxed` sets line-height DIRECTLY — let me check the cascade order for R4:
`--tw-leading: initial` will work (the later responsive text rule wins the cascade and the invalid var forces its fallback). Let me fix the CTA e2e target and read the remaining fix sites:
All fix sites confirmed. Note: the login comment claims `ring-ring` was "kept verbatim" but the strings actually omit it — Session 5 missed that it's ACTIVE on the submit button. Now writing the GREEN implementations:
Unit GREEN 12/12. Now the Reveal rewrite:
Now updating the hero with the mount animations + the leading pin:
Now problem.tsx — params, inner-Reveal removal, note timing:
**NEW FINDING**: the live's floating chevron is framer-driven — `y: [0, -15, 0]`, **4s** repeat infinity easeInOut — while the clone ships a 6s CSS keyframe. Let me check the clone's float keyframes:
The clone's float: -12px over 6s vs the live's -15px over 4s. Let me check the live's chevron parent for entrance motion, then fix everything:
The live's chevron parent has NO motion (the wrapper Reveal is an invention) and the circle oscillates inline (-14.7px mid-flight). Applying all problem.tsx edits:
Now pricing, how-it-works, testimonials, logo-cloud, features, cta:
Now the e2e CTA fix (the badge's parent carries the motion) and the remaining files — faq-view, legal-page-view, dashboard-preview, navbar, login, globals:
Now navbar, login, logo, and globals:
The bare anchor needs checking — how does the live swap the logo color in light mode? Let me verify:
The live's logo stays WHITE in both modes — the clone's light-mode logo swap was invented. But the navbar-behavior spec may pin it — let me check:
The existing spec pins the light-mode logo as black — but my probe showed the live staying white. Let me re-probe carefully (my section finder may have been wrong):
The live's chrome shows NO transitions in my probe — but Lenis may be intercepting programmatic scrolls. Let me check how the passing spec scrolls and replicate:
Session 4 measured with real wheel scrolling — my 60ms steps outran Lenis. Re-probing with proper dwells:
**Key finding**: at y=3400 the live's Log In swaps to black but the **logo stays WHITE** — Session 4's spec pinned the logo swap incorrectly. Let me visually confirm with a screenshot:
**Confirmed by pixel sampling**: the live's logo is white-on-white (invisible) over the features section — it never swaps. My bare-anchor fix matches the live; the Session-4 spec pin must be corrected to the measured truth:
Line 258 is the **Google icon wrapper** (not the back button) — the live's DIV vs clone's SPAN. Fix the close tag and the e2e target:
Now the login route style — `--ring` + the outline-color neutralization:
Now globals.css — shadow-sm, transition-colors, muted-foreground, float keyframes, flogo aliases:
The logo petals animate via `transform`, not opacity — my flogo aliases are wrong. Let me see the real keyframes and fix:
All green so far — unit now 92/92 (80 + 12 new). Now the e2e against the fresh build:
16/21 GREEN. Let me examine the 5 failures:
All failure causes identified — spec bugs (SSR serialization, the H2's leading pin) + the `--ring` scope. Fixing:
React renders `className=""` as an empty attribute — the live has NO class attribute. Fix the Reveal to omit it when empty:
**MOTION-PARITY: 27/27 GREEN.** Now the full gate to catch regressions in the other suites:
**FULL GATE: ALL GREEN — 266 checks** (92 unit + 136 e2e + 38 smoke; was 227). Now Phase 4 — the paired re-verification:
Word parity holds at 1.0000. Now the paired motion re-survey:
Down from 78→17 diffs on `/`. Let me examine the remaining value-diffs and the CTA button case:
The live's non-popular pricing CTAs DO carry `disabled:*` — my earlier text-matched analysis was misleading. Let me compare all three CTAs precisely:
The live's disabled utilities are **per-plan** (Free has them, Enterprise doesn't). Let me check the Pro card's CTA and restore correctly:
The live: Free + Pro CTAs carry `disabled:*`, Enterprise doesn't. Restoring per-plan in the clone:
Typecheck has an error (my exit-code capture was wrong). Fixing the null issue:
Typecheck clean. One remaining /faq structural item — the live's mounted accordion panel. Let me check:
The live mounts all 6 panels closed (invisible, height 0) — rendered-equivalent to the clone's unmount; documenting as a deviation. Now the entrance-timing validation — clone vs live curves:
**The clone's entrance ramp now matches the live's** (412→1024ms vs the live's 415→1034ms — the ~600ms easeOut curve), with RM collapsing instantly (documented superset). Now VLM spot checks — let me check the prior session's VLM tooling:
VLM: hero IDENTICAL, CTA IDENTICAL, but the features shot flags the **logo visible on live but blank on clone** over the white section. Let me examine the actual pixels:
The computed color says white — yet pixels are dark. Let me find WHERE the dark pixels cluster:
**CRITICAL CORRECTION**: the live's logo DOES render black in light mode — via a **path-level fill rule** (the anchor's color stays white; the paths' computed fill flips). My anchor-strip was right for class parity but I removed the clone's rendered swap. Let me find the live's mechanism:
The live's logo paths carry `fill="black"` as a **React-driven attribute** in light mode. Let me get the dark-state attribute value:
The live's logo svg has 2 extra paths (an arrow icon?). Let me examine the svg's full structure:
The 2 extra paths were the Get Started pill's arrow (my selector crossed anchors). **Final truth**: all 11 logo paths carry explicit `fill="white"`/`fill="black"` attributes (React-driven). Let me check the footer logo's fills, then implement:
Footer = `fill="white"` always. Implementing the React-driven fill swap:
All 31 pass. Re-verify the features section visually with the fill fix:
Only the scroll-spy capture-timing artifact remains (D20-class — the navbar-behavior suite pins the spy deterministically and passes). The logo flag is resolved. Now the FULL final gate:
**FINAL GATE: ALL GREEN — 266 checks.** Now the screenshots refresh:
All 17 shots refreshed. Quick verification of the key shots (the standing mobile-nav ask):
Mobile menu verified working. Now Phase 5 — docs alignment. Starting with the PAD:
Now the session log and worklogs:
Now the final gate on the exact tree before commit:
**FINAL GATE: ALL GREEN — 266 checks.** Now the commit — reviewing the tree first:
Tree clean — no secrets, 06c/12/13 shots byte-identical, `.env.example` unchanged (all changes are code). Committing:
Committed `01072c6` on main. Now the SSH push per the runbook:
Fingerprint matches all prior sessions. Dry-run then push:
**PUSH VERIFIED** — remote main @ `01072c6` (confirmed via wrapper + independent ls-remote), key shredded, tree clean. Recording the push in the worklog and pushing that record:
**All pushed and verified** — remote main @ `fbbec41`, tree clean, keys shredded. Updating the workspace worklog:
**Session 8 complete — everything pushed and verified on `main`** (`01072c6` + `fbbec41`).

**What I did:** Refreshed the workspace (repo was at Session-7 state, gate 227/227), then audited with **five new survey layers** — the biggest being the **motion layer**: the reference drives its scroll entrances with framer-motion (rAF per-frame inline writes, `easeOut cubic-bezier(0,0,0.58,1)` — fit from sampled frames), while the clone's CSS-transition `Reveal` **snapped entrances on transition-colors children, corrupted every card's hover to 0.7s + stagger delays**, and missed a dozen entrances (testimonial cards, mockup, hero trio, legal pages, FAQ items). Found and fixed **8 gap groups**: the rAF entrance rebuild (`src/lib/motion.ts`), three v4 engine shifts (shadow-sm rename, transition-colors list, the **line-height cascade inversion**), the login focus chrome, the logo's hidden **React-driven path-fill swap** (pixel evidence overturned a 7-session-old computed-color assumption), the FAQ chevron color, the float timing, and per-plan CTA classes. Final gate: **266/266 checks, VLM hero/CTA IDENTICAL, word parity 1.0000** on all 8 routes.

**Suggested next steps:**
1. Fresh-clone spot-check: `npm install && cp .env.example .env && npm run db:push && npm run db:seed && npm run dev` — scroll the landing page to see the entrances ease in like the reference
2. If the live redeploys, re-run the drift check before touching chrome
3. Standing follow-ups remain: Google OAuth wiring and containerized CI (PAD §10)
