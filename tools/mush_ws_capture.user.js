// ==UserScript==
// @name         武神传说 MUD 数据采集与自动副本
// @namespace    wsbbb.tools
// @version      1.1.1
// @description  在已登录的原版页面中记录数据，并调用原版流程插件自动运行副本；不读取密码。
// @match        http://mush.aize.org/*
// @match        https://mush.aize.org/*
// @include      http://mush.aize.org/*
// @include      https://mush.aize.org/*
// @run-at       document-start
// @inject-into  page
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Tampermonkey 默认可能运行在隔离世界；unsafeWindow 才是原版页面的全局对象。
  const page = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

  if (page.__WSBBB_MUSH_CAPTURE__) return;

  const state = {
    version: 2,
    source: location.origin,
    started_at: new Date().toISOString(),
    frames: [],
    hooks: {},
    panel: null,
    timer: null,
  };

  function textOf(value) {
    if (typeof value === "string") return value;
    if (value == null) return "";
    try { return JSON.stringify(value); } catch (_) { return String(value); }
  }

  function record(direction, data, url) {
    state.frames.push({ t: Date.now(), direction, url: url || "", data: textOf(data) });
    updatePanel();
  }

  function mark(label) {
    record("marker", JSON.stringify({ label: String(label || ""), at: new Date().toISOString() }));
  }

  function exportCapture() {
    const payload = JSON.stringify({
      version: state.version,
      source: state.source,
      started_at: state.started_at,
      frames: state.frames,
    }, null, 2);
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mush-capture-${new Date().toISOString().replace(/[.:]/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function clearCapture() {
    state.frames.length = 0;
    mark("采集已清空");
  }

  function hookWebSocket() {
    const Native = page.WebSocket;
    if (typeof Native !== "function" || Native.__WSBBB_CAPTURE__) return;

    function CapturedWebSocket(url, protocols) {
      const socket = protocols === undefined ? new Native(url) : new Native(url, protocols);
      socket.addEventListener("message", event => record("in", event.data, String(url)));
      const send = socket.send;
      socket.send = function (data) {
        record("out", data, String(url));
        return send.call(this, data);
      };
      return socket;
    }

    CapturedWebSocket.prototype = Native.prototype;
    Object.setPrototypeOf(CapturedWebSocket, Native);
    ["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(key => {
      try { Object.defineProperty(CapturedWebSocket, key, { value: Native[key] }); } catch (_) { }
    });
    CapturedWebSocket.__WSBBB_CAPTURE__ = true;
    page.WebSocket = CapturedWebSocket;
    state.hooks.websocket = true;
  }

  function hookGameApi() {
    const api = page.WG;
    if (!api) return;

    if (typeof api.SendCmd === "function" && !api.SendCmd.__WSBBB_CAPTURE__) {
      const send = api.SendCmd;
      const wrapped = function (cmd) {
        record("out", cmd, "WG.SendCmd");
        return send.apply(this, arguments);
      };
      wrapped.__WSBBB_CAPTURE__ = true;
      api.SendCmd = wrapped;
      state.hooks.sendcmd = true;
    }

    if (typeof api.receive_message === "function" && !api.receive_message.__WSBBB_CAPTURE__) {
      const receive = api.receive_message;
      const wrapped = function (message) {
        record("in", message, "WG.receive_message");
        return receive.apply(this, arguments);
      };
      wrapped.__WSBBB_CAPTURE__ = true;
      api.receive_message = wrapped;
      state.hooks.receive = true;
    }
  }

  function raidReady() {
    return !!(page.ToRaid && typeof page.ToRaid.perform === "function");
  }

  // wsmud_Raid 的 @fb 参数是副本编号，不是中文名称。
  // 8 起为神龙教；24、25、27-29 等编号不是该公开流程插件的普通副本。
  const SUPPORTED = [
    [8, "神龙教"], [9, "关外"], [10, "温府"], [11, "五毒教"],
    [12, "恒山"], [13, "青城山"], [14, "衡山"], [15, "泰山"],
    [16, "嵩山"], [17, "云梦沼泽"], [18, "桃花岛"], [19, "白驼山"],
    [20, "星宿海"], [21, "冰火岛"], [22, "移花宫"], [23, "燕子坞"],
    [26, "光明顶"], [30, "华山论剑"],
  ];

  function runDungeon(number, mode) {
    if (!raidReady()) {
      mark("未检测到 wsmud_Raid，无法自动运行副本");
      alert("未检测到原版 wsmud_Raid 流程插件。请先安装并刷新页面，再运行自动采集。");
      return false;
    }
    const item = SUPPORTED.find(row => row[0] === number);
    const name = item ? item[1] : `副本${number}`;
    mark(`${name}-自动开始`);
    page.ToRaid.perform(`@fb ${number} ${mode == null ? 0 : mode}`, `WSBBB采集-${name}`);
    return true;
  }

  function runAll() {
    if (!raidReady()) {
      alert("未检测到原版 wsmud_Raid 流程插件。请先安装并刷新页面，再运行自动采集。");
      return;
    }
    if (!confirm("将按顺序运行神龙教及公开流程插件支持的后续副本。请确认角色能自动战斗，期间不要手动操作。")) return;
    const source = SUPPORTED.map(row => `@fb ${row[0]} 0`).join("\n");
    mark("神龙教及后续公开副本-自动开始");
    page.ToRaid.perform(source, "WSBBB采集-神龙教及后续");
  }

  function stopAll() {
    if (raidReady()) page.ToRaid.perform("@stop WSBBB采集-神龙教及后续", "WSBBB采集-停止");
    if (page.WG && typeof page.WG.SendCmd === "function") page.WG.SendCmd("stopstate");
    mark("自动采集已请求停止");
  }

  function statusText() {
    const hooks = Object.keys(state.hooks).filter(k => state.hooks[k]).join(",") || "等待页面接口";
    return `记录 ${state.frames.length} 条｜接口 ${hooks}｜自动流程 ${raidReady() ? "就绪" : "未安装"}`;
  }

  function updatePanel() {
    const status = document.getElementById("wsbbb-capture-status");
    if (status) status.textContent = statusText();
  }

  function addPanel() {
    if (!document.body || state.panel) return;
    const panel = document.createElement("div");
    panel.id = "wsbbb-capture-panel";
    panel.style.cssText = [
      "position:fixed !important", "top:8px !important", "right:8px !important",
      "z-index:2147483647 !important", "display:block !important", "visibility:visible !important",
      "padding:8px", "background:#151515", "color:#fff", "font:12px/1.4 sans-serif",
      "border:2px solid #e0a800", "border-radius:5px", "box-shadow:0 2px 12px #000",
      "min-width:235px", "text-align:left",
    ].join(";");
    panel.innerHTML = [
      "<div style='font-weight:bold;color:#ffd24a;margin-bottom:4px'>WSBBB 原版采集器 1.1.1</div>",
      "<div id='wsbbb-capture-status'>初始化中</div>",
      "<div style='margin-top:5px;display:flex;flex-wrap:wrap;gap:3px'>",
      "<button data-action='mark'>标记</button>", "<button data-action='export'>导出</button>",
      "<button data-action='clear'>清空</button>", "<button data-action='one'>运行一个</button>",
      "<button data-action='all'>自动采集公开副本</button>", "<button data-action='stop'>停止</button>",
      "</div>",
    ].join("");
    panel.addEventListener("click", event => {
      const action = event.target && event.target.getAttribute("data-action");
      if (action === "mark") mark(prompt("标记名称") || "");
      if (action === "export") exportCapture();
      if (action === "clear" && confirm("清空当前采集记录？")) clearCapture();
      if (action === "one") {
        const value = prompt("输入副本编号，例如神龙教输入 8", "8");
        if (value != null && /^\d+$/.test(value)) runDungeon(parseInt(value, 10), 0);
      }
      if (action === "all") runAll();
      if (action === "stop") stopAll();
    });
    document.body.appendChild(panel);
    state.panel = panel;
    updatePanel();
  }

  const api = {
    data: state,
    mark,
    clear: clearCapture,
    export: exportCapture,
    count: () => state.frames.length,
    status: statusText,
    runDungeon,
    runAll,
    stop: stopAll,
  };
  page.__WSBBB_MUSH_CAPTURE__ = api;
  page.MUSH_CAPTURE = api;
  console.info("[WSBBB] 原版采集器已加载。可执行 MUSH_CAPTURE.status() 检查，或使用右上角面板。");

  function tick() {
    hookWebSocket();
    hookGameApi();
    addPanel();
    updatePanel();
  }

  state.timer = setInterval(tick, 300);
  tick();
  setTimeout(() => clearInterval(state.timer), 120000);
})();

