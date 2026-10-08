我将接续上一个会话继续执行这项多阶段任务。让我先建立任务清单，然后检查工作区状态。
工作区已存在 `saas-company` 仓库和之前的对比截图。让我先刷新工作区，然后读取 worklog 了解上次会话进度。
工作区已包含 Session 11/12 的工作成果（最近提交 853b3aa）。现在执行 `git pull` 获取最新的会话文档（session_19/20）。
`git pull` 成功，带来了新的 `docs/session_20.md`（本次会话的指令文档）。现在开始精读项目文档与会话文档。
仓库结构完整。现在精读会话文档（session_20 是本次指令、session_19 是上次记录）与 remediation-plan-session12。
session_20 是上一会话的执行记录（Session 12 修复）。现在精读项目核心文档与 remediation-plan-session12。
现在读取 CLAUDE.md、README.md 及仓库根 worklog 的最新条目。
现在快速核对 PAD 关键部分（修订块、台账、质量门禁、已知问题）与 SKILL 文档版本。
文档已全部内化（AGENTS 26 条 gotchas、PAD v1.0 Session 12 修订、SKILL v2.11.0、314 检查门禁）。现在对照代码库验证现状：检查工具链排除 `skills/`、环境陷阱，然后跑基线门禁。
代码库结构验证一致。`DATABASE_URL` shell 陷阱确实存在（须用 `env -u DATABASE_URL` 中和）。现在跑基线门禁（lint → typecheck → unit）：
lint ✓ typecheck ✓ 94 unit ✓。现在构建生产包（smoke 与 e2e 依赖构建产物）：
**基线门禁全绿：314/314 检查**（lint ✓ typecheck ✓ 94 unit ✓ build ✓ 47 smoke ✓ 173 e2e ✓）。项目现状与文档完全一致。

现在检查两个仓库的 skills 目录（用户指定 `clone-app-pat-pro`、`agent-browser`、`tdd` 技能）：
技能确认就位。现在快速验证我在初步扫描中发现的候选审计面（Next.js 生产就绪缺口）：
确认了几个候选缺口（`error.tsx`/`global-error.tsx` 缺失、hero 无 poster、移动菜单焦点管理待查）。先检查之前会话留下的调查脚本，然后做常设配对验证（live 站 + 漂移检查）：
drift 脚本可复用。现在在同一 Bash 调用中启动 standalone 服务器并运行配对漂移检查（沙箱会杀后台进程的已知限制）：
**漂移检查：全部 8 条路由的字数一致性（word parity）为 1.0000 — 参考站未变化。** 移动端菜单需要 `hasTouch` 上下文（已知伪影），运行专用 `mobile-nav` 探针：
**常设验证完成**：
- 漂移检查：8 条路由 word parity 1.0000（参考站未变化）
- 移动端菜单配对探针：clone 与 live 逐字节一致（burger 342,16 24×24、面板 0,56 390×397、7×44px 行、滚动锁/Escape/resize guard 全部正常）——**无 Tailwind v4 bug**；live 的 burger 仍被自身 toast 门户挡住（已知 D32 缺陷，clone 的可用性反而更强）

现在深入审查我发现的候选新审计面。读取 dashboard-app 与 navbar 源码：
dashboard 分析完成：compose 有防重提交保护 ✓，但确认两个真实缺口：
1. **会话过期 (401) 处理缺口** — cookie 过期后重试提示误导用户（"Try again" 永远 401，用户被困）
2. **渲染错误边界缺失** — `refresh()` 若收到畸形数据 `setWorkflows(null)` 会让 `workflows.filter` 崩溃 → Next.js 默认无品牌错误页

继续检查 navbar 焦点管理与 login 表单：
navbar 有 ARIA 语义但 **Escape 关闭后焦点不返回 burger**（键盘用户失焦——第三个确认缺口）。再快速核查 auth cookie 属性与现有 e2e 辅助模式：
基础设施了解完毕。查看 Session 12 的 resilience spec 模式以便复用：
模式清晰。现在为三个确认缺口编写 RED 证据探针（在当前构建上观察缺陷的实际行为——这是写 remediation plan 前的验证步骤）：
**三个 RED 证据全部确认**：
- **P1 会话过期**：删除 cookie 后点击 Pause → 困在 /dashboard，横幅误导性提示 "Try again"（重试永远 401）
- **P2 渲染崩溃**：畸形 API 信封 → `TypeError: Cannot read properties of null (reading 'filter')` → Next.js 16 默认错误页"This page couldn't load"（无品牌、亮色、通用文案）
- **P3 移动菜单焦点**：Escape 关闭后 `activeElement === BODY`（焦点丢失，不返回 burger）

检查 login 页的 `from_url` 契约（R1 修复需匹配服务端网关的重定向行为）：
契约确认：`/login?from_url=/dashboard`。所有证据齐备，现在编写 Session 13 的综合 remediation plan：
按指令要求，先对照代码库复核 remediation plan 的关键触点（auth POST 预算、现有 spec 冲突检查）：
预算核对无误（新增 4 次登录，总计 ~18/50）。现在开始 TDD 执行。

**R1 — 编写 session-lifecycle spec（先观察 RED）**：
**R1 RED 完美观察**：(a)(b)(c) 失败（401 未重定向）、(d) 回归 pin 通过。现在实现 GREEN 修复——`apiFetch` 助手带 401 重定向：
修正两处代码卫生问题（class 移到组件外、删除死代码行）：
R1 修复完成。现在编写 R2 的 error-boundary spec（先观察 RED）：
R3 — 在 mobile-navigation spec 中添加焦点返回 pin（先观察 RED）。先看现有结构：
三个 RED spec 就绪。重建（含 R1 修复、尚无 error.tsx）并观察 error-boundary 与 focus pin 的 RED：
**R2/R3 RED 观察完毕**（3 个新 pin 失败，8 个现有 pin 通过）。现在实现 GREEN。先检查根布局结构（error boundary 会渲染在布局内）：
布局极简（navbar 在页面级组合）。查看 not-found 的品牌样式作为 error boundary 的设计参照：
编写品牌化的 `error.tsx` 与 `global-error.tsx`：
现在是 R3 — navbar 焦点返回修复：
三处修复完成。重建并验证所有新 spec GREEN：
**全部 GREEN — 19/19**（R1 重定向契约、R2 品牌错误边界+恢复、R3 焦点返回、Session-12 回归无伤）。现在跑完整门禁：
**完整门禁全绿 — 321 检查**（94 unit + 47 smoke + 180 e2e）。现在运行配对复验电池（三个 RED 探针复跑 GREEN + 全路由 console 清扫 + 漂移复查）：
**僵尸服务器陷阱**（gotcha 26）：端口 3000 被占用，旧构建仍在服务。按纪律先杀掉并验证磁盘上的当前构建：
**GREEN 复验电池全部通过**：
- P1 会话过期 → 重定向 `/login?from_url=/dashboard`，无误导横幅，零 pageerror
- P2 渲染崩溃 → 品牌错误边界渲染，Try again 恢复仪表板，零 pageerror（React 19 生产模式吞掉边界捕获的错误——比预期更好）
- P3 移动菜单 → Escape 后焦点返回 burger
- Console 清扫：8 路由零噪音；漂移：1.0000 ×8（CSS chunk 校验确认非僵尸服务器）

现在刷新截图。查看之前的截图脚本：
截图脚本覆盖 18 张标准截图。为 Session 13 新表面加一张错误边界证据截图，先跑标准刷新：
19 张截图完成（18 标准 + 新增 15-error-boundary）。VLM 抽查新截图验证品牌边界正确渲染：
**VLM 确认**：品牌暗色错误卡（"Something went wrong" + Try again + Go to home）✓；控制组正常 ✓。

进入文档更新阶段。先更新 PAD（修订块 + 台账 D70–D72 + §7 计数 + §11 关键文件）：
更新 PAD（修订块、台账 D70–D72、§7 计数、§11 关键文件）：
PAD 更新完成。现在更新 AGENTS.md（gotcha 27 + 计数）：
第二处编辑未匹配（原子失败）。改用更小的锚点——在 gotcha 26 结尾后追加 gotcha 27：
AGENTS.md 完成。更新 CLAUDE.md（session-13 上下文 + 计数）：
CLAUDE.md 完成。更新 README.md（徽章、features 行、troubleshooting）：
README 完成。更新 SKILL 文档（v2.12.0 + lessons 34–35）：
SKILL 完成。勾选 remediation plan 清单并编写会话日志 `docs/session_21.md`：
现在追加到仓库 worklog.md：
文档全部完成。最终树审查与提交前确认层：
27 项变更确认。代码自 321 门禁后未变（仅文档/截图）。跑最终确认层（lint/typecheck/unit），并核对 `.env.example`：
**最终确认全绿**：lint ✓ typecheck ✓ 94 unit ✓；`.env.example` 与代码库完全匹配（4 变量，NODE_ENV 为平台变量正确排除）。

现在提交（遵循仓库 Conventional Commits + emoji 契约）：
提交 `3064c64` 完成，树干净。现在按 runbook 执行 SSH 推送。先查看 wrapper 用法说明：
按 runbook 执行：物化密钥（仓库外）→ 验证指纹 → dry-run → 真实推送：
指纹匹配（`3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`）。Dry-run 推送验证：
Dry-run 接受（fast-forward `de7a2e3..3064c64`）。执行真实推送：
**推送验证成功**：remote main @ `3064c64` == local HEAD。粉碎密钥并记录已验证的推送（worklog 最终 docs 提交）：
重新物化密钥推送最终 worklog 记录提交：
两个提交均推送并验证。最后更新工作区级 worklog：
**Session 13 完成 — 一切已推送并验证到 `main`**（`3064c64` + `87bc3e2`，wrapper 验证远端 == 本地 HEAD，密钥已粉碎，树干净）。

**本次会话工作**：参考站未变化（word parity 1.0000 ×8），移动端菜单重新逐字节验证**无 Tailwind v4 bug**。三个全新审计层面发现并 TDD 修复了三个缺陷：① 会话过期后 401 的误导性横幅（现重定向到登录页——与服务端网关同契约）；② 缺失的错误边界（现渲染品牌化暗色恢复卡 + Try again）；③ 移动菜单 Escape 焦点丢失（现返回 burger）。门禁从 314 提升至 **321 检查**全绿。

**建议后续**：
1. 全新克隆验证：`npm install && cp .env.example .env && npm run db:push && npm run db:seed && npm run dev`
2. 体验新行为：登录后手动删除 cookie 再点 Pause → 应跳转登录页
3. 遗留跟进项：Google OAuth 接线与容器化 CI（PAD §10）
