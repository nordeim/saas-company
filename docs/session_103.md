我将开始执行这个多阶段任务。首先创建任务清单，然后从阶段 1 开始。
仓库已存在于本地。现在执行 `git pull` 刷新工作区，并检查当前状态。
`git pull` 成功，新增了 `docs/session_100.md`。现在阅读核心文档。
文档很大，我将分批读取关键部分。
直接分块读取原文件。
AGENTS.md 已读完。现在读取 CLAUDE.md 的核心部分。
现在阅读 README.md 和会话文档。
现在读取 worklog.md 的最新条目和 S47 候选项。
核心状态已掌握：Session 46 已关闭（gate 764，21 个 parity 表面，D1-D160），本会话为 **Session 47**。S47 候选已记录在 worklog。现在读取 PAD 和 SKILL 的关键部分。
技能目录已确认。现在对照代码库验证理解（Phase 1 收尾）。
环境完好（.env 已正确配置、依赖已装、无僵尸端口）。现在进入 Phase 2：验证 DB 规范状态并运行基线 gate。
DB 规范状态验证通过（1 user / 6 workflows / 7,120 runs / 5 active / 1 paused）。运行基线 gate。
Lint ✓，typecheck ✓，单元测试 248/248 ✓。现在干净构建（gotcha 50b: 先清 `.next`）。
构建 ✓，冒烟测试 125/125 ✓。现在分块运行 e2e 测试套件（遵循 S46 的分块模式以应对 10 分钟工具上限）。
**基线 gate 764/764 全绿**（248 unit + 125 smoke + 391 e2e）。现在审计 S46 的代码变更。
S46 diff 是纯版本化会话（仅新 spec + 文档 + 截图，零 src/ 变更）。审计新 spec 文件的合规性。
S46 spec 审计通过（参数模式、无模块级 page 引用、断言与测量记录一致）——**无缺陷**。进入 Phase 3：S47 recon。先探测参考站状态。
参考站在线（sitemap 7 URLs，不变）。现在查看 S46 recon 脚本以遵循房屋模式编写 S47 recon。
现在编写 S47 recon 脚本。先检查 global-setup 如何创建 scratch DB。
理解了 scratch DB 模式。现在编写 S47 recon 脚本（第 22 表面三候选 + 21 表面路由扩展 + route-watch + 移动端导航复核）。
超时（10 分钟工具上限）。检查增量保存的结果，然后分阶段运行（房屋的 phase-split 模式）。
所有 6 个阶段已捕获（增量保存生效）。分析 recon 结果。
R1 零漂移。分析第 22 表面三候选。
焦点环渲染契约在首个焦点处两侧一致（violet/50），规则计数差异疑为层级盲测（需裁定）。继续分析。
发现三个测量工具问题需修复（emulateMedia 值、PDF 文本提取需解压、菜单探测器）。先看 R3 结果。
R3 有一个意外发现需调查：clone /faq 离线渲染 h1=False。用 curl 验证 SSR HTML。
/faq 的标题是 h2（非 h1）——离线 h1=False 是正常行为。但 clone /faq 离线 87 词 vs 完整 101 词，差 14 词需查明。快速探测。
谜底揭晓：14 词差异是**CSS 被中止导致的未样式化拼接**（"FeaturesHow" 等连词）——内容完整，只是计数方式受影响。这符合 gotcha-26 特征，但在全请求中止下属预期。现在修复其余三个探针（forced-colors、PDF 文本、菜单检测）并合并为裁定脚本 B。
裁定结果：**forced-colors 两侧完全一致**（零规则空集 + 系统色替换行为相同）；**D160 复核确认**（live 的汉堡 y20/y28 仍被阻挡，y36 可用；clone 三点全开）。PDF 文本提取对 CID 子集字体不可靠，检查 pdftotext。
pdftotext 和 pymupdf 可用。用正确工具重测 print-text 层（探针 C）。
print-text 层在 4/5 路由**精确一致**（26/104/344/36 词）。首页（landing）有 40 词差异需裁定。对比提取文本。
Clone 的 PDF 多出 40 个 token（logo-cloud + problem/testimonials 内容）——需查明为何 clone 的折叠下方内容在 PDF 中被绘制。检查 Reveal 的 mode 用法。
需要实测：PDF 生成前后 logo-cloud 的 opacity 状态（两侧）。写探针 D。
关键线索：clone 的折叠下方 Reveal 未滚动就已处于 opacity 1——怀疑是 Playwright Chromium 默认强制 `prefers-reduced-motion: reduce`。验证这个理论。
理论被否定（reduce=false）。直接观测：新页面加载后 scrollY 和 Reveal 包装器的 opacity 时间线。
探针读错了元素（clone 侧读到了 Reveal 内部的普通 div）。查看 problem.tsx 完整结构后修正。
CTA 的 h2 是裸元素（S8 移除了虚构的 whole-CTA 入场）。现在需测量 live 侧 logo-cloud 和 CTA 的实际 motion 包装结构。写探针 F。
词标（wordmark）结构两侧一致（opacity 1）。检查 cloudDump 中是否有 opacity-0 的祖先包装器。
**核心发现**：live 的每个 wordmark 都包在自己的 framer motion div 中（inline `opacity: 0`，滚动进入时逐个显现）——clone 的 wordmark 是静态渲染（无逐词入场）。查 S8 motion-parity spec 是否有此记录。
**重大发现**：print-text 表面揭露了两个入场层差异——(1) live 的 8 个 wordmark 各自有 motion div（初始 opacity 0），clone 是静态；(2) live 的 CTA h2 有 motion 包装（y=30），与 S8 "仅 badge 有动画" 的记录矛盾（live 是移动目标）。这是 **clone 缺口**（需构建）。写探针 G 全面测量。
完整图景确认：live 的 CTA 整块内容（badge+h2+p+按钮）是**一个** motion div（y=30），而 clone 只有 badge 有入场；live 的 8 个 wordmark 各自有**仅透明度**的入场，clone 全静态。这是真正的 clone 缺口。现在测量入场时序（时长/延迟/ stagger）。
时序已测量：wordmark 为仅透明度入场（~0.4s，~50ms stagger），CTA 整块 y=30（~0.8s，easeOut）。验证 live CTA motion div 的精确范围和 clone 的 logo-cloud 结构。
完整裁定已成型。查看 motion.ts 以设计 Reveal 的 opacity-only 模式扩展。
设计完备。检查 S8 motion-parity spec 的 CTA pin（我的修改可能会影响它）。
S8 的 CTA pin 断言的是 settled 状态（两侧结构下相同）——我的重构后它仍会通过，但其意图注释需更新。所有影响面已分析完毕（DOM 数量不变 → 各 inventory pin 安全）。现在撰写 S47 整改计划。
整改计划已写好并验证（会话日志编号 101/102 正确、pin 存活分析完成、SSR/hydration 安全）。开始 F1：TDD RED——先写 y=null 模式的单元测试。
RED 确认（4 个新测试失败）。现在实现 GREEN：motion.ts 的 y=null 分支。
现在更新 Reveal 组件以接受 `y: number | null`：
F1 GREEN (16/16)。现在 F2：logo-cloud 的 8 个 wordmark 载体入场化。
F2 完成。现在 F3：CTA 整块入场重构。先读完整 cta.tsx。
F3 完成。更新 motion-parity spec 的 CTA pin 至今日真相。
运行 lint + typecheck + 单元测试验证修改。
已知常设警告，构建干净。运行受影响的 e2e specs 验证重构。
全部通过。现在实测新构建的入场行为 + print-text 收敛值（用于 spec pin 的测量值）。
**完美收敛**：落地页 PDF 词数 **291 → 251 = 线上环境 251**（40 token 差距归零）；wordmark 载体初始 `opacity:0`（无 transform 键）+ 落定 `opacity: 1`——与线上环境逐字节一致；CTA 包装器 y=30、4 个子元素 ✓。现在写 session47 spec（TDD pins）。
两个失败均为 pin 转录错误（非代码缺陷）：浏览器序列化为 `opacity: 1;`（带分号，与 live 一致）；h1 背景是透明白 `rgba(255, 255, 255, 0)`。修正 pin。
**F4 GREEN：9/9**。现在 F5：配对漂移电池（两侧真相）。先看 S46 电池结构。
**电池 17/17 全绿零漂移**——两侧真相确认（print-text 5 路由精确一致、入场结构配对、forced-colors 空集、route-watch 字节一致）。现在执行 Phase 4 常设验证 + 全 gate。
Phase-4 常设验证全绿（robots/sitemap 8 URLs/og-image/JSON-LD/canonical/twitter:url/安全头/.env 同步）。现在 F6：全 gate。
**全门禁通过：777 项检查全部绿色**（252 个单元测试 + 125 个冒烟测试 + 400 个端到端测试）。现在进行 F7：截图刷新。检查 S46 捕获脚本以复用。
需注意 gotcha-44 法则：我的入场修改使全页截图必须先滚动穿透（否则 wordmark/CTA 保持 opacity 0 出现空白带）。检查 VLM 检查脚本覆盖的 8 张截图。
VLM 集 8 张（01/02/06/08/10/14/15/17）。现在写 S47 捕获脚本（加 gotcha-44 滚动穿透，确保新入场的 wordmark/CTA 在全页截图中沉淀）。
**21/21 截图捕获完成，DB 规范零变更**。现在运行 VLM 常设检查。
7/8——查看哪个检查失败及原因。
第一次 7/8 是 CLI 瞬态输出混杂（S46 记录过的怪癖），第二次 **8/8 全过**。再跑一次确认稳定性。
**VLM 稳定 8/8**。现在 F8：文档对齐。先定位 PAD 的锚点。
定位完成。现在写文档对齐脚本（房屋一次性 Python 约定）。先看修订块和 SKILL 教程 85 的结构。
现在写 S47 文档对齐脚本。先确认 README 的锚点。
锚点齐备。编写 S47 文档对齐脚本。
修复 SKILL lesson 86 的插入锚点（当前是无操作）。查看 lesson 85 的结尾。
**21/21 文档编辑应用成功**。验证无重复后勾选整改计划并附加测量记录附录。
文档编辑全部验证通过（多处 D161 提及均为合法引用）。现在勾选整改计划并附加测量记录附录。
9 项全勾。现在写会话日志（session_101 curated + session_102 raw）。
现在追加 worklog 条目（Task 47 + 收尾条目占位）。
worklog 完成。现在 F9：提交与推送。先审查变更集与 SSH 推送指南。
变更集正确（25 修改 + 4 新增）。阅读 SSH 推送指南。
Runbook 已内化（关键：必须显式 `--remote`，S31 陷阱）。检查 shim 状态并提交。
Shim 完好（paramiko 5.0.0）。现在创建提交。
提交 `8e65f42` 创建，工作树干净。现在执行 SSH 推送序列（指纹验证 → dry-run → 真实推送 → 密钥销毁）。
指纹匹配 S1-S46 记录。Dry-run（显式 `--remote`，S31 纪律）。
Dry-run 确认快进 `cf70c4e..8e65f42` 至正确远程。执行真实推送。
**推送已验证**（HTTPS ls-remote 同意 `8e65f42`，密钥已销毁，零僵尸）。执行收尾纪律：pushed-hash 记录 + 收尾 worklog + 收尾提交。
**Session 47 完全关闭**（`2c2dae4` 推送并双验证，工作树干净，密钥销毁，零僵尸）。最后更新共享工作区 worklog。
**Session 47 全部完成并推送至 main**（`8e65f42` 整改 + `2c2dae4` 收尾，wrapper + HTTPS 双验证，密钥销毁，零僵尸）。

**核心成果：** 第 22 表面（print-to-PDF 文本层）揭露并**修复了两个入场层真实缺口**——live 的 8 个 logo-cloud 词标各自有仅透明度入场（~50ms 错峰），CTA 整块内容包在一个 y=30 包装器中。构建后首页 PDF 文本 **291→251 = live 的 251**（收敛预测精确到词确认）。Gate 764→777，电池 17/17 零漂移，21 截图 + VLM 8/8 全过，移动端导航 D160 记录复核无变化。

**建议下一步：** S48 候选已记录在 worklog——可继续第 22 表面路由扩展（剩余路由的 print-text）或第 23 表面（PDF 链接层/字体嵌入层/视口方向表面）。
