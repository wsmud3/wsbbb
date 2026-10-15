# tools/audit —— 只读审计工具

这些工具**不会修改任何文件**，用于排查「服务端报文 / 按钮 HTML / 前端浮窗渲染」这条链路上的
问题。它们不接入 `npm test`（判据里有"发现即提示"的软性项，不适合当硬性门禁），
需要时手工执行；其中按钮质量部分已被 `tools/test_zc_command.js` 覆盖为硬性回归。

在**仓库根目录**执行：

| 工具 | 用途 |
|---|---|
| `node tools/audit/audit_buttons.js [角色名]` | 按钮生成器的质量与安全：属性是否齐全、`style` 是否被中途截断、危险字符是否实体化、点击派发的命令是否与输入一致；再用真实 `send_commands` 检查每个已推演部位的词条管理菜单（升级/替换按钮数应等于词条数、主消息栏 0 条）。给角色名则读真实存档，否则用合成角色。 |
| `node tools/audit/audit_messages.js` | `send_commands` 报文的 32 种字段组合是否都合法、`jsonStr` 对危险字符的转义往返、`Setting.float_dialog` 关闭时各分支的 fallback、`{type:"cmds"}` 生成点清单、数据隔离函数的结构检查。 |
| `node tools/audit/audit_zc_refactor.js [旧版ref]` | 把 `cmd_words`/`cmd_pfms`/`cmd_skill_info` 与旧版本（默认 `9a5d88a`）逐项对比，列出丢失/新增的信息项，并核对关键防呆逻辑（剑心 269 上限、累积潜能、`_confirm lvlset` 参数顺序等）。 |
| `node tools/audit/audit_callsites.js` | 全仓扫描 `send_commands` 调用点：options 里出现的字段是否都被处理、是否存在奇数参数（会被丢弃）、哪些调用用 `.apply` 动态构造参数。 |

## 背景：为什么需要这些工具

一次真实事故：`world/cmd/skill/zc.js` 在生成按钮时写了 `\'` 转义，
而 `os/base.js#sanitizeScript` 处理字符串内反斜杠时会多跳一个字符，
使源码损坏、`vm.compileFunction` 报语法错误 → 整个命令文件静默加载失败 →
命令未注册 → 玩家点「推演」只收到一句「什么？」。

`node --check`、单元测试、CI 都**不经过** `sanitizeScript`，所以长期全绿而线上无反应。
另有两个只靠静态阅读很难发现的同类问题：
- `style` 属性在中间被提前闭合 → `padding`/`cursor` 等样式被浏览器丢弃
- `onclick` 里的命令没做实体化 → 可注入，且命令含单引号时点击无效

这些都必须**真的把 HTML 解析出来**才能查出来，因此有了 `audit_buttons.js`。
