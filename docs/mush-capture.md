# 原版副本地图探索采集

`tools/mush_ws_capture.user.js` 是运行在 `mush.aize.org` 登录页面中的用户脚本。它记录页面实际收到/发出的 WebSocket 与游戏接口消息，并可进入副本后按服务器返回的出口自动探索：每到一个新房间，保存房间信息、出口和当前物件/NPC，再发送 `look`（有气血字段的 NPC 额外发送 `cha`）。默认不击杀 NPC、不依赖副本路线，也不会读取账号密码或 Cookie。

## 安装与面板检查

1. 在 Tampermonkey 中删除或停用旧版同名脚本，然后安装仓库内 `tools/mush_ws_capture.user.js` 的完整内容。
2. 确认脚本匹配 `http://mush.aize.org/*` 或 `https://mush.aize.org/*`，重新打开原版页面并硬刷新一次。
3. 页面右上角应出现 **WSBBB 副本地图探索采集器 2.0.4** 面板。
4. 若仍没有面板，在原版页面控制台执行：

   ```js
   typeof MUSH_CAPTURE
   MUSH_CAPTURE && MUSH_CAPTURE.status()
   document.getElementById("wsbbb-capture-panel")
   ```

   第一条应为 `"object"`，第三条应返回面板元素。若为 `undefined/null`，说明脚本没有匹配当前页面，检查 Tampermonkey 启用状态和 URL 后再刷新。

## 探索方式

- **进入并探索**：输入副本编号。脚本只发送进入命令（`jh fb …; cr …`），进入后不执行原版的固定战斗路线；后续移动完全由服务器返回的 `exits` 决定。
- **探索当前副本**：适合已经手动进入、或公开脚本没有内置入口的副本。脚本从当前房间开始。
- **标记**：在关键位置添加时间标记。
- **停止**：停止自动移动并发送 `stopstate`，不会杀 NPC。
- **导出**：下载 `mush-map-capture-*.json`。文件中的 `rooms` 是已探索的房间快照，`frames` 是原始接口消息。

探索器会跳过 `out` 出口，避免自动离开副本；每个其他方向都会实际尝试一次，不依赖出口值是否是标准房间路径。若抵达已有房间，则自动按反方向回到上一个房间继续尝试其余出口；不可达出口、战斗或没有回退方向时会停止/回退并保留已采集数据。为防止异常循环，单次最多采集 500 个房间。

当前内置入口编号为：`8-23`、`26`、`30`。其他副本可以手动进入后使用“探索当前副本”。

## 控制台接口

```js
MUSH_CAPTURE.status();
MUSH_CAPTURE.enterAndExplore(8); // 进入神龙教并探索
MUSH_CAPTURE.exploreCurrent();    // 从当前房间开始
MUSH_CAPTURE.stop();
MUSH_CAPTURE.export();
```

不要把账号密码、Cookie 或其他登录信息发到聊天中。采集文件可能包含角色名和战斗记录，分享前请先检查内容。

