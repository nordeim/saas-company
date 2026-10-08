我将开始执行这项多阶段任务。先建立任务清单，然后刷新工作区并逐步推进。
The workspace already contains both repos. Now refreshing the saas-company repository:
仓库已刷新至最新（`6aaf19b`，包含新增的 `docs/session_24.md`）。现在精读项目文档：
仓库结构完整（.env、db/、vitest/playwright 配置、docs/screenshots 均已就绪——这是第 14 次会话周期）。现在精读核心项目文档：
worklog 确认 Session 14 已完成并推送（333 checks）。当前任务是 **Session 15 周期**。继续读 CLAUDE.md 与 PAD 关键章节：
文档研读完成。现在对照代码库验证现状——检查 `.env`、工具链排除、关键代码结构：
代码库状态与文档完全一致（.env、db/ 位置、vitest/playwright 配置、skills/ 排除均正确）。现在运行基线质量门（333 checks）：
94/94 单元测试通过。现在构建生产版本：
**基线门禁全绿——333 checks（94 unit + 48 smoke + 191 e2e）**，代码库与文档状态完全吻合。现在进入审计阶段——先检查既往调查脚本并跑漂移检查：
端口全净（无僵尸服务器）。启动独立构建并运行成对漂移检查（同一命令内完成，规避沙盒后台进程清理）：
**漂移检查：8 条路由 word parity 全部 1.0000 —— 参考站未变化。** 现在运行移动端导航 real-touch 成对探针（操作员长期关注点 + Tailwind v4 警惕）：
移动端导航克隆侧几何完全吻合（burger 342,16 24×24；面板 0,56 390×397；七个 44px 行；滚动锁/Escape/resize 守卫全部工作；oklab bg 渲染等价）。检查 `navigateCloses: false` 是否为探针伪影，并对比 live 侧结果：
发现 `navigateCloses: false` 的根源——探针脚本第 86 行选择器有笔误（`aref=` 应为 `[href=`），tap 静默失败导致未真正导航。Session 13 同一脚本也记录了 `False`（当时靠 e2e 套件钉住该行为）。运行修正版探针实证：
探针选择器定位到了桌面端隐藏的 Features 药丸链接（`href="#features"` 的第一个匹配项）。修正为在移动端面板内作用域查找：
**navigate-close 实证工作正常**——Session 11 探针的 `false` 确系选择器笔误伪影（e2e 套件一直钉住该行为）。移动端导航结论：**克隆字节级一致、可正常点击、无 Tailwind v4 bug**；live 的 burger 仍被自身 toast 门户 pointer-blocked（D32，保持克隆的可用版本）。

现在进入 Session 15 新审计面调研。先系统性检查几个候选未探测层：
第 84 行实际内容正常（此前为显示伪影）。**候选发现 A 成立：`from_url` 开放重定向（CWE-601）**——`login-card.tsx:68` 直接读取参数并在 106 行 `router.push(fromUrl)` 原样推送，外部 URL（`https://evil.com` / `//evil.com`）可被注入为登录后跳转目标（经典钓鱼向量）。

继续检查其余候选审计面：
**候选发现 C 成立：SDK 调用无超时**——`generate` 路由直接 `await zai.chat.completions.create(...)`，SDK 挂起时请求无限阻塞（"degrade-not-fail" 教义只覆盖失败、未覆盖挂起）。继续检查其余候选：
hero 视频策略与 live 一致（同样的 autoplay 循环视频——live-parity，非缺陷）；405 返回空体系（Next.js 框架行为，记为已裁决非缺陷）。现在检查 D 候选——**/demo 超集页面的 axe 可访问性扫描**（S14 仅做了 VLM 截图验证，未跑 axe）：
**RED 证据确立——三项发现全部实证：**

1. **F1 开放重定向（CWE-601）**：匿名用户从 `?from_url=https://evil.example/phish` 登录后，Next router 真实发起了外部导航（外部请求记录在案：`https://evil.example/phish?_rsc=...`），协议相对变体 `//evil.example` 同样中招。已认证门（S14）则在 from_url 消费前正确重定向到 /dashboard。
2. **F2 /demo 超集页 axe 违规**：`heading-order`（moderate）——h3 "Product" 跳级（无前置 h2）。超集页面必须 axe-clean（dashboard 实证 `[]` 干净，/demo 应同等标准）。
3. **F3 SDK 无超时**：代码级确凿（`generate` 路由裸 await，挂起即无限阻塞）。

再补充验证两个小项（429 Retry-After 头、cookie 属性）：
axe 违规根源定位：`Product` h3 是**共享 footer 的列标题**——在 landing 上有前置 h2 所以无违规，但 /demo 的 main 只有 h1（h1→h3 跳级）。footer 是 byte-pinned 的 live-parity 部件（不能动），正确修法是在 demo 表单卡内加 sr-only h2（零视觉差异、仅超集面）。

再确认第 4 项发现——429 响应的 Retry-After 头：
四项发现的证据链完备。做最后的钉冲突扫描与规范结构确认，然后撰写修复计划：
钉冲突扫描干净（现有 spec 均无 from_url 登录完成路径）。确认 /demo 页面标题大纲与 reduced-motion spec 结构：
所有结构确认完毕。撰写 Session 15 修复计划前，最后核验 `validation.ts` 与 `workflow.ts` 的结构以安放新接缝：
结构核验完毕。撰写 Session 15 修复计划并保存至 `docs/`：
计划已保存。现在进入 TDD 执行——先写全部 RED 规格。先读现有测试文件结构：
写入 R1/R3 的 RED 单元测试：
现在写 e2e RED 钉。先看 auth.spec.ts 尾部与 demo.spec.ts 完整结构：
简化 (d) 的透明度检查（用祖先链遍历替代混乱的 closest 选择器）：
现在写 R4 的 smoke RED 钉。读 smoke 脚本的 newsletter+demo 段落与计数器机制：
全部 RED 规格就绪。现在观察 RED——先跑单元层（新函数不存在，导入即失败）：
**单元层 RED 完美观察：17 个新测试全红**（函数不存在），既有 17 个全绿。现在对当前（修复前）构建观察 e2e RED：
**e2e RED 观察完美**：3 个缺陷钉全红（开放重定向 a/b + 标题大纲 g），2 个回归钉全绿（合法 from_url=/faq 旅程 + reduced-motion /demo 行——按计划即绿）。现在观察 smoke 层 RED：
**Smoke RED 观察：Retry-After 头为空——按预期失败**。三层 RED 全部确立。现在实现 GREEN——先 R1（`safeRedirectPath` 纯函数 + login-card 集成）：
Now integrate into login-card.tsx:
第 70 行疑似含特殊字符（typecheck 全绿但显示异常）。十六进制核验：
磁盘字节确为 `const ode,`——但基线 typecheck 全绿，矛盾。立即用 tsc 单点解析与 git 对象双重核验：
tsc 未标记 login-card（错误列表按路径排序，src/app/ 应最先出现）——检查 tsconfig 是否排除了该路径，并直接用 Node 解析验证：
TS 解析器零诊断 + 构建成功 + e2e 全绿，但磁盘字节显示语法异常——矛盾。用最底层工具直接核验（xxd + esbuild 独立编译）：
**谜底揭晓**：十六进制字节实为 `5b 6d` = `[m`——真实代码是 `const [mode, setMode]`，**文件完全正确**。此前所有"异常显示"均为 Bash 输出层吞掉 `[m` 字符对的渲染伪影（tsc/esbuild/构建/e2e 的一致正确性佐证）。记录此教训，继续实现 GREEN——集成 R1 到 login-card：
R1 完成（编辑后显示也恢复正常）。现在 R2——demo-view 卡片内加 sr-only h2：
R2 完成。现在 R3——workflow.ts 增加 `withTimeout` 接缝与 `SDK_TIMEOUT_MS`：
修复误折叠的换行：
现在将 `withTimeout` seam 追加到 workflow.ts：
Now wrap the generate route's SDK call:
修正 messages 数组的缩进一致性：
R3 完成。现在 R4——扩展 `fail()` 支持响应头，并在四个 429 站点传入 Retry-After：
修复 reduced-motion spec 的类型错误（`parentElement` 返回 `HTMLElement | null`）：
全部实现完成。验证 lint + typecheck + 单元层 GREEN：
**单元层 GREEN：111/111**（94+17 新增）。lint/typecheck 干净。重新构建生产版本：
**Smoke GREEN：50/50**（Retry-After 头 600s 正确携带）。现在跑完整 e2e 套件（196 项）：
195/196——仅 demo 大纲钉失败。诊断实际大纲：
h2 修复已生效——仅 footer 第二列标题实际为 "Legal" 而非我预期的 "Company"。核对 footer 真实列标题：
Footer 实际列标题为 Product/Legal/Social/Subscribe——修正钉的期望值：
demo 套件 7/7。重跑完整 e2e 确认 196/196：
**完整门禁全绿：357 checks（111 unit + 50 smoke + 196 e2e）**。现在成对再验证——重跑漂移检查 + 移动端探针 + RED 探针家族复验：
结果呈现修复前行为——疑似**僵尸服务器复发（gotcha 26）**：pkill 可能未生效，旧构建进程仍占 :3000（其 auth 桶也已耗尽导致登录 429）。按纪律核验服务进程与构建新旧：
进程列表失明（沙盒怪癖）但 chunk 与磁盘一致。直接核验服务内容是否含修复——检查服务端 HTML 是否带 sr-only h2：
僵尸服务器确认嫌疑重大（CSS chunk 名未变系因 CSS 未改动——检查失效；旧进程内存代码为修复前版本 + 其 auth 桶已耗尽）。用 /proc 扫描定位真实 PID 并击杀：
沙盒进程失明无法击杀 :3000 僵尸。按纪律改用**全新端口 3010** 启动修复后服务器重跑复验（门禁套件本就不受影响——它们自举 :3100/:3200 并已全绿）：
**GREEN 复验全绿**：四种攻击变体全部回落 `/dashboard` 零外部请求；/demo axe 清零；dashboard 保持干净；429 携带 `Retry-After: 600`。僵尸理论证实（:3000 旧进程 = 修复前代码 + 耗尽桶；:3010 新鲜服务器全绿）。

在新服务器上重跑常备电池（漂移 + 移动端导航）：
常备电池全部通过（parity 1.0 ×8；移动端导航几何字节一致、navigate-close 实证工作、无 v4 bug；live burger 仍 pointer-blocked=D32）。补一个触碰路由的 console 噪音扫描：
全部触碰路由 console 零噪音。现在刷新截图——检查既有截图脚本（注意指向 :3010 新服务器规避僵尸）：
18 张截图已刷新。补齐 error-boundary 证据截图（第 15 张）：
20 张截图就绪。VLM 抽检关键证据截图：
VLM 抽检全部通过。进入 Phase 5 文档更新——先勾选修复计划清单并修正实际计数（357 = 111+50+196）：
Now updating the PAD — revision block, ledger D76–D79, §7 counts, §11 key files:
现在追加 PAD 账目 D76–D79：
现在更新 PAD §7 计数与 §11 关键文件：
补充 §7.2 单元层与 smoke 层描述，并更新 §11 关键文件：
PAD 完成。更新 AGENTS.md（计数 + gotcha 29）：
更新 CLAUDE.md（计数 + session-15 上下文）：
更新 README.md（徽章、计数、真实化的 Retry-After、守卫行）：
README 完成。更新 SKILL 文档（v2.14.0 + lessons 38–39）：
SKILL 文档完成。撰写会话日志 `docs/session_25.md`：
复核 `.env.example` 与代码库同步性：
`.env.example` 完全同步（四个变量与代码消费一致，无新增）。更新仓库根 `worklog.md`：
最终提交前验证层——快速门禁复核 + 树审查：
树完全符合预期（35 文件：8 src 修复 + 6 测试 + smoke + 5 根文档 + 2 新文档 + 14 截图 + worklog，无敏感文件）。提交：
提交 `0c1afcc` 完成。现在按 runbook 执行 SSH 推送——先读操作说明：
Runbook 明确。执行推送序列——密钥落地 /tmp（仓库外，0600）+ 指纹核验：
指纹与 Session 1–14 记录完全一致（`3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`）。Dry-run 推送验证认证：
Dry-run 通过（fast-forward `6aaf19b..0c1afcc`）。执行真实推送：
**推送验证成功**（remote main @ `0c1afcc` == local HEAD，跟踪引用已同步，wrapper 临时密钥已粉碎）。粉碎操作员密钥并终验：
推送完成、密钥已粉碎、树干净。最后更新工作区级 worklog 并收尾：
**Session 15 全周期完成——一切已推送并验证到 `main`（`0c1afcc`，wrapper 复验 remote==HEAD，密钥已粉碎）。**

**本会话做了什么：**

参考站**未变化**（8 路由 word parity 1.0000；移动端导航字节级一致、可正常点击——**无 Tailwind v4 bug**；旧探针的 navigate-close "false" 被裁决为选择器笔误伪影）。四个新审计面发现并 TDD 修复了四个缺陷：

1. **开放重定向（CWE-601）**——`/login?from_url=` 曾把攻击者 URL 原样推送（实证：网络日志捕获外部导航）；现在 `safeRedirectPath` 只放行同站绝对路径
2. **/demo 标题跳级**——超集页 axe 现零违规（sr-only h2，零视觉差异）
3. **SDK 挂起类**——AI composer 增设 10s 降级上限（挂起≠失败，两类契约刻意区分）
4. **429 缺 Retry-After 头**——README 承诺现已成真（四个限流站点全部携带）

门禁 **333 → 357 checks**；20 张截图刷新（VLM 验证）；全部文档对齐（PAD D76–D79、gotcha 29、SKILL v2.14.0）。

**建议后续**：fresh-clone 验证（`npm install && cp .env.example .env && npm run db:push && npm run db:seed && npm run dev`）、试试 `?from_url=https://evil.example` 登录回落 `/dashboard`，或复审 `docs/remediation-plan-session15.md` 证据链。
