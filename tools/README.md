# tools —— 脚本与工具

按用途分四类。**只读检查/测试类**接入 `npm test`（CI 会跑）；**一次性脚本**已移入
[`archive/`](archive/)，保留作历史记录但不要直接运行。

## 1. 回归测试（接入 `npm test`，CI 会执行）

| 脚本 | 覆盖 |
|---|---|
| `test_acceptance.cjs` | 端到端验收（`--strict`） |
| `test_server_isolation.js` | 测试服/正式服数据隔离：越界角色必须被剔除、本服角色不得误伤、冷启动路径 |
| `test_system_integrity.js` | 系统完整性 |
| `test_release_safety.cjs` | 发布安全（`.git` 状态、产物一致性等） |
| `test_external_fixes.cjs` | 外部报告的修复项 |
| `test_equipment_recast.js` | 自制装备重铸 |
| `test_zc_command.js` | 自创武学命令：**资源可加载性（零反斜杠转义）+ 按钮 HTML 质量 + 命令注册契约 + 报文渲染** |
| `test_zhenyi_logic.js` / `test_zhenyi_trial.js` | 真意系统逻辑与试炼 |
| `test_admin_panel.js` / `test_admin_api.js` / `test_admin_stats.cjs` | 后台面板与接口 |
| `sim_sws_store.js` | 山外山商店模拟 |

## 2. 校验脚本（接入 `npm test`）

| 脚本 | 覆盖 |
|---|---|
| `check_source_encoding.js` | 源码编码（UTF-8 / BOM / 行尾） |
| `validate_zhenyi.js` / `validate_zhenyi_ui.js` | 真意数据与 UI 一致性 |
| `validate_rooms.js` | 房间定义 |
| `validate_sws.js` | 山外山 |
| `check_release_assets.js` | 发布产物的 `www` 引用是否存在（CI + 部署用） |

## 3. 部署与运维（由 `deploy/` 调用）

| 脚本 | 用途 |
|---|---|
| `build_frontend.js` | 构建前端产物（`npm run build` 与 `deploy/pull.sh` 都调用） |
| `check_deploy_health.js <sha>` | 校验三个服务上报的 release 是否等于给定 sha |
| `backup_database.js` | 数据库备份 |

## 4. 审计工具（手工执行，只读）

见 [`audit/README.md`](audit/README.md)。共 4 个：按钮质量与安全、报文/转义/fallback、
自创武学重构保真度对比、`send_commands` 调用点扫描。

## 5. 手工测试与修复工具（不接入 CI）

| 脚本 | 用途 |
|---|---|
| `test_sws_e2e.js` | 山外山端到端冒烟（需本地起 web.js + main.js，分 stage1/stage2） |
| `test_chat_text.html` | 浏览器打开即跑的 `chatText()` XSS 单测 |
| `repair_sws_data.js` | 修复旧版山外山存档（对象被写成 `[object Object]` 导致存档无法解析） |
| `isolation_fixture.js` | `test_server_isolation.js` 的子进程夹具（非独立工具） |
| `mush_ws_capture.user.js` | 浏览器用户脚本：副本地图探索采集 |
| `audit_external_report.cjs` | `BUG_REPORT.md` 的只读探针（非回归） |

## archive/ —— 已归档的一次性脚本

这些脚本对**当时的**副本/技能/NPC/房间内容做过一次性批量修改，输入或目标与现行数据不一致，
**再运行可能覆盖现行内容**，因此移入归档。需要查历史做法时再读。

- `apply_backup_npcs.js`
- `assign_missing_npcs.js`
- `fix_critical_rooms.js`
- `gen_fb_rooms.js`
- `balance_npc.js`
- `fix_maxhp.js`
- `fix_npc_paths.js`
- `fix_npc_refs.js`
- `enhance_attacks.js`
- `fix_skill_descs.js`
- `check_skills.js`
- `audit_skills.js`
- `clean_vite_assets.js`
- `restart.sh`
- `production_upgrade.py`
