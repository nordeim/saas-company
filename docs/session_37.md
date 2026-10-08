I'll continue the task chain from where we left off. Let me first set up the task tracking and refresh the workspace.
The workspace has been reset. Let me check what repo is at my-project root, then clone saas-company.
This is the sandbox workspace, not the repo. The saas-company clone has been reset — I need to clone it fresh.
Workspace refreshed — HEAD is `7898e75` on main, clean. The latest commits show Session 19 remediation completed (crash-path-honesty). Now let me review the repo structure and read the project docs.
该仓库已完全填充至 session_34。让我先阅读最新的会话文档以确定真正的中断点，然后是项目文档。
Session 34 confirms: Session 19 cycle (D91/D92 crash-path fixes, gate 413, commit `6be9888`) is **complete and pushed**. The current cycle is the **next session (Session 20)**. Let me read the remaining session docs.
Session 19's plan shows the final push item unticked — but session_34's transcript confirms the push happened (`6be9888` wrapper-verified). Let me verify the git state and read the worklog + project docs.
Worklog confirms Session 19 complete. Now the current cycle is **Session 20**. Let me read the core project docs — starting with AGENTS.md (gotchas, environment setup, push runbook).
Let me read AGENTS.md in sections directly.
I have the full AGENTS.md picture (33 gotchas, gate 413, SSH push runbook). Now let me start the environment setup in the background (npm install takes minutes) while I read the remaining docs.
npm install running. Let me read key sections of README and check the PAD's open items + revision history.
README aligned at 413 checks. Let me check PAD's open items and ledger tail.
I now have the full picture. Let me check the skills catalog for audit tools while npm install completes.
Good — the catalog lists audit-relevant skills (`code-quality-standards`, `tdd`, `agent-browser`, `clean-code`, `nextjs-react-expert`). Let me check install status and set up the environment.
npm install complete. Now let me set up the environment — `.env`, Prisma generate, DB push + seed.
The exported `DATABASE_URL` trap is LIVE (stale absolute path) — I'll neutralize it per-command. Now DB push + seed:
Canonical seed checksum `e7f6c011` matches. Now the baseline gate — starting with the fast layers (lint → typecheck → unit):
137/137 unit green. Now the production build:
**Baseline gate: 413 checks ALL GREEN** (137 unit + 79 smoke + 197 e2e — exactly matching the documented state, no flake). Let me record progress and proceed to the drift battery.
现在开始进行常规的漂移测试。由于沙箱重置清除了旧的调查脚本，我将重新创建它们。让我先检查一下 `smoke` 测试的启动模式。
现在我将创建 Session-20 漂移测试脚本（新端口，根据 gotcha-33 使用明确的 base URL，不设默认值）。
ESM import resolution issue — the script sits outside the repo's node_modules. Let me check what's available at the workspace root.
The battery came back RED — but every failure pattern smells like **my probe's methodology**, not real drift (19 sessions documented 1.0000 parity). The live is an SPA serving a shell to plain `fetch` (131-139 words on EVERY route). The established method renders BOTH sides in Chromium. Let me check the navbar's real selectors and fix the probe.
Now I see it — the panel has 6 anchors + 1 "Log In" **button** = 7 rows; my selector missed the button. And word parity must use **rendered text in Chromium** (the established method), not raw fetch. Let me fix the survey script.
**DRIFT BATTERY: GREEN** — word parity 1.0000 ×8 (reference UNCHANGED), mobile nav byte-identical (7 rows × 44px, REAL tap works — **no Tailwind v4 bug**), live login D62 holds. The first RED run was my probe's own methodology (raw fetch vs rendered-in-Chromium — a gotcha-33-family tooling lesson).

Now the **Session-20 audit** — surveying NEW surfaces. Let me examine the auth cookie attributes and the HTTP method layer (405 behavior), which no prior session systematically surveyed.
Cookie flags documented as SameSite=Lax — let me verify line 95, then probe the **HTTP method layer** (405s), a surface no prior session surveyed.
Cookie layer is clean (httpOnly, SameSite=Lax, secure-in-prod). Now let me probe the **method layer** — what do unexported HTTP methods return?
**RED evidence CONFIRMED — F1 candidate: the method layer.** 11 method-mismatch probes answer **bare 405s with EMPTY bodies, no content-type, no Allow header** — the same invariant-violation family as S19's crash paths, but on the framework-owned method-mismatch layer that `apiRoute` never sees. (OPTIONS gets a proper 204+Allow from Next; unknown API routes get the branded 404 page.)

Now let me survey a second candidate surface — the request-size layer (uncapped JSON bodies):
DEPLOYMENT.md's proxy guidance doesn't mention body-size limits. Let me probe the request-size layer on a fresh port:
The 405s DO carry the security headers (from `next.config.ts`) but lack content-type/cache-control/Allow. And bodies of **50MB are fully buffered and parsed with no ceiling** (400 in 314ms — nothing caps size before the parse). Let me check the route shapes to finalize the audit.
Both F1 and F2 confirmed with RED evidence. Let me complete the audit with the dependency-currency layer (the standing S19 pattern):
依赖项版本与 S19 的判定相比没有变化（仅包含已记录的 F10 链 + 仅涉及主版本的过时行）。**审计已完成 —— 发现了两个缺陷：**

- **F1 (方法不匹配层)**：11 个探针返回了空的 405 裸响应 —— 无 `content-type`，无 envelope，无 `Cache-Control`，无 `Allow`
- **F2 (请求大小层)**：POST 路由在验证前会将无上限的数据体缓冲到内存中（已探测 50MB）

让我读取 `api.ts` 的连接点以设计修复方案：
Clean seam to extend. Let me verify the remaining body-parsing routes and locate the existing unit test layout:
Now let me examine the login route and smoke script structure to plan surgical edits:
I have everything needed. Now writing the Session-20 remediation plan:
Plan saved. Now executing **TDD-first — RED**: writing the unit pins before the helpers exist.
**RED observed: 8/8 pins fail** (helpers don't exist). Now **GREEN** — implementing the guards in `api.ts`:
**GREEN: 8/8.** Now wrapping the 10 route files. Login first (already read):
Now the register route — let me read it first:
Now logout, me, and health routes:
Now newsletter and demo (both POST-only with body parse):
Now the workflows routes (GET+POST), generate, and [id]:
All 10 routes wrapped. Verifying with lint + typecheck + full unit suite:
Lint ✓ typecheck ✓ **145/145 unit**. Now adding the smoke pins. Let me check the `field` helper first:
Gotcha-31 discipline — syntax-check the script and verify the curl header-extraction approach works:
`%{header{...}}` isn't supported — let me fix the cache-control check to use `%{header_json}` like the Allow extraction:
Build clean with the guards. Now the full smoke suite:
89/92 — two fix categories needed: (1) `header_json` values are **arrays** (`['OPTIONS, POST']` — need `[0][0]`); (2) the newsletter big-body pins hit the rate limit (bucket consumed by the earlier section) — move them to the broken-DB third server where the newsletter bucket is fresh:
One pin still red on the broken server (500 instead of 413). Let me reproduce manually to see the actual response:
Reproduced — something throws before the body guard. Let me see the full stack:
The 500 is a PrismaClientInitializationError thrown inside the newsletter handler BEFORE the body guard. Let me inspect the actual current route order:
**Found it — my probe's bug, not the route's**: the "2MB" newsletter body generator forgot to pad the email — it produced a 31-byte body that parsed fine, passed validation, and hit the broken DB's upsert (correct behavior!). Fixing the pin:
**SMOKE: 94/94 GREEN.** Now the e2e layer — expecting 197 unchanged (no client-observable changes for real traffic):
**FULL GATE GREEN: 436 checks** (145 unit + 94 smoke + 197 e2e, no flake). Now the re-verification — the method + body-size catalog on the remediated build:
**Catalogs fully GREEN** — every mismatch row an envelope with Allow + no-store; giant bodies now 413 in 15-91ms (vs 314ms full-parse pre-fix). Now the drift battery re-run (regression guard — routes were touched):
Drift battery GREEN — zero regressions. Now the screenshot refresh. Let me check the existing 20-shot set:
已针对规范 DB 捕获 20 张截图。让我通过沙箱的 z-ai-web-dev-sdk 运行 VLM 抽查：
Let me extract the verdicts properly:
Two VLM flags — both smell like the S19 check-prompt drift lesson. Let me verify the ACTUAL contracts from the code and parity evidence:
**Confirmed — both flags are check-prompt drift (the S19 lesson repeating):** the login card's real contract is the "S" logo chip + "Welcome to SAAS Company" heading (measured from the live, word-parity 1.0000); and the mockup sits below the 900px fold. Correcting the prompts to the ACTUAL contracts:
One flag left — layout ORDER. Let me read the actual markup order (word parity 1.0000 already proves the text sequence matches the live):
The real order is Google → or-divider → Email → Password → Sign In — my prompt had it backwards. Third prompt-drift; the page is proven correct. Fixing:
**VLM: 5/5 PASS** (three check-prompt drifts adjudicated against the actual contracts). DB still canonical. Now the documentation phase — starting with the PAD:
Now inserting the S20 revision entry at the top of the revision block:
Now the ledger rows (D93-D94), §7 counts, and §11 key files:
Now appending the S20 pin descriptions to §7.2 and updating §11 key files:
PAD done. Now updating the Last Updated date, then AGENTS.md (gotcha 34 + counts):
AGENTS.md done. Now CLAUDE.md session-20 context + pre-push checklist counts:
CLAUDE.md done. Now README badge, verification block, and troubleshooting rows:
README done. Now SKILL.md v2.19.0 with lessons 48-49:
SKILL done. Now the DEPLOYMENT.md §2 proxy body-cap note:
Now ticking the remediation plan with the final counts:
Now the session log `docs/session_35.md`:
Now appending the S20 entry to the repo worklog:
Worklog appended. Final verification layers on the complete tree, then the pre-commit review:
Wait — I don't see `src/lib/api-guards.test.ts` in the status. Let me check:
All 42 changes as expected. Per the established discipline, a final full smoke + e2e re-check on the complete tree for bulletproof commit evidence:
**FINAL GATE: 436 checks GREEN on the complete tree.** Now the commit — staging and verifying nothing sensitive is included:
**Commit `7826728` on main.** Now the SSH wrapper push — reading the runbook first:
Runbook loaded. Executing the field-tested sequence — key materialization, fingerprint check, ssh availability:
No ssh binary, no paramiko — the documented sandbox situation. Installing paramiko and deploying the Appendix-A shim:
Fingerprint verification, then the dry-run:
The wrapper defaulted to the runbook's original repo (`task-management`) — authentication works, but wrong remote. Re-running with the explicit `--remote` for **saas-company**:
Dry-run clean — remote at `7898e75`, fast-forward to `7826728` ready. Executing the real push:
**Push verified — remote main @ `7826728` == local HEAD.** Shredding the operator key per the runbook:
Push complete, key shredded, tree clean. Now the closing transcript (`docs/session_36.md`) + recording the verified push in the plan — the established pattern:
Now pushing the transcript commit — re-materializing the key for the second push:
Both commits pushed and verified. Final state check and sandbox worklog completion:
The wrapper already verified both pushes (remote @ `a1e1529` == HEAD; the direct `ls-remote` without `GIT_SSH_COMMAND` just can't use the shim — expected). Everything is complete. Final worklog update:
**Session 20 complete — committed and pushed to `main` (`a1e1529`, wrapper-verified, operator key destroyed).**

This cycle's audit theme was **method-and-payload honesty** — what the wire carries *below and before* every handler, the layers no wrapper sees. After confirming the baseline (413 checks green, reference unchanged, mobile nav byte-identical — **no Tailwind v4 bug**), the survey found two defects, both fixed TDD-first:

1. **The method-mismatch envelope (D93)** — 11 probes of unexported HTTP methods answered *bare 405s with empty bodies* (no content-type, no `Allow`, no cache-control). Every route file now exports guards claiming its unimplemented methods for the `METHOD_NOT_ALLOWED` envelope, with the RFC 9100 `Allow` header and an explicit OPTIONS preflight.
2. **The request-size ceiling (D94)** — POST routes buffered unbounded bodies (a 50MB login body was fully parsed in 314ms). A 128KB declared-size guard now answers `413 PAYLOAD_TOO_LARGE` at the header in 91ms, with a proxy body-cap note as the belt-and-braces half.

The gate rose **413 → 436 checks** (145 unit + 94 smoke + 197 e2e, no flake); 20 screenshots refreshed (VLM 5/5); all docs aligned (PAD ledger D93–D94, AGENTS gotcha 34, SKILL v2.19.0); `DATABASE_URL`, vitest/Playwright configs, and `.env.example` all verified in place.

**Suggested next steps:** try the guards on your infra (`curl -X DELETE https://your-host/api/workflows` → JSON envelope with `Allow`; a >128KB body → 413) — or the next session could survey fresh layers (e.g., Lighthouse-style performance budgets or the dashboard's client data flow).
