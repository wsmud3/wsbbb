// ==UserScript==
// @name         武神传说 MUD 副本地图探索采集器
// @namespace    wsbbb.tools
// @version      2.0.0
// @description  进入副本后按服务器返回的出口自动探索，记录房间、出口和 NPC 查看结果；不读取密码。
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
    version: 3,
    source: location.origin,
    started_at: new Date().toISOString(),
    frames: [],
    rooms: [],
    hooks: {},
    panel: null,
    timer: null,
    explorer: {
      running: false,
      entering: false,
      token: 0,
      current: null,
      stack: [],
      seen: new Set(),
      pending: null,
      incomingExits: null,
      incomingItems: null,
      finishTimer: null,
      stepTimer: null,
      roomTimer: null,
      maxRooms: 500,
      startedAt: 0,
      waitingCombat: false,
    },
  };

  const DIRECTIONS = [
    "north", "south", "east", "west", "northup", "southup", "eastup", "westup",
    "northdown", "southdown", "eastdown", "westdown", "up", "down", "enter", "out",
  ];
  const REVERSE = {
    north: "south", south: "north", east: "west", west: "east",
    northup: "southdown", southdown: "northup", southup: "northdown", northdown: "southup",
    eastup: "westdown", westdown: "eastup", westup: "eastdown", eastdown: "westup",
    up: "down", down: "up",
  };

  // 这里只保存进入副本所需的入口；后续移动完全以原版返回的 exits 为准。
  const DUNGEONS = [
    [8, "神龙教", "bj/shenlong/haitan"], [9, "关外", "bj/guanwai/damen"],
    [10, "温府", "cd/wen/damen"], [11, "五毒教", "cd/wudu/damen"],
    [12, "恒山", "wuyue/hengshan/daziling"], [13, "青城山", "wuyue/qingcheng/shanlu"],
    [14, "衡山", "wuyue/henshan/hengyang"], [15, "泰山", "wuyue/taishan/daizong"],
    [16, "嵩山", "wuyue/songshan/taishi"], [17, "云梦沼泽", "cd/yunmeng/senlin"],
    [18, "桃花岛", "taohua/haitan"], [19, "白驼山", "baituo/damen"],
    [20, "星宿海", "xingxiu/xxh6"], [21, "冰火岛", "mj/bhd/haibian"],
    [22, "移花宫", "huashan/yihua/shandao"], [23, "燕子坞", "murong/anbian"],
    [26, "光明顶", "mj/shanmen"], [30, "华山论剑", "huashan/lunjian/leitaixia"],
  ];

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
    record("marker", { label: String(label || ""), at: new Date().toISOString() }, "collector");
  }

  function exportCapture() {
    const payload = JSON.stringify({
      version: state.version,
      source: state.source,
      started_at: state.started_at,
      rooms: state.rooms,
      frames: state.frames,
    }, null, 2);
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mush-map-capture-${new Date().toISOString().replace(/[.:]/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function clearCapture() {
    state.frames.length = 0;
    state.rooms.length = 0;
    mark("采集已清空");
  }

  function sendCommand(command) {
    if (!command || !page.WG) return false;
    if (typeof page.WG.SendCmd === "function") {
      page.WG.SendCmd(command);
      return true;
    }
    if (typeof page.WG.Send === "function") {
      page.WG.Send(command);
      return true;
    }
    return false;
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

    if (typeof api.add_hook === "function" && !state.hooks.events) {
      api.add_hook(["room", "exits", "items", "itemadd", "itemremove", "combat", "text", "dialog"], event => {
        record("event", event, `WG.hook:${event && event.type ? event.type : "unknown"}`);
        handleExplorerEvent(event);
      });
      state.hooks.events = true;
    }
  }

  function roomKey(event) {
    if (event && event.path) return String(event.path);
    if (event && event.name) return `name:${event.name}`;
    const g = page.G;
    if (g && g.map && g.room) return `${g.map}/${g.room}`;
    return `unknown:${Date.now()}`;
  }

  function exitTarget(value) {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      return value.path || value.room || value.name || textOf(value);
    }
    return "";
  }

  function normalizeExits(items) {
    if (!items || typeof items !== "object") return [];
    return DIRECTIONS
      .filter(direction => Object.prototype.hasOwnProperty.call(items, direction))
      .map(direction => ({ direction, target: exitTarget(items[direction]) }));
  }

  function selfId() {
    return page.G && page.G.id != null ? String(page.G.id) : "";
  }

  function normalizeItems(items) {
    if (!Array.isArray(items)) return [];
    return items.filter(item => item && item.id != null && String(item.id) !== selfId());
  }

  function pageSnapshot() {
    const g = page.G || {};
    const exits = [];
    if (g.exits && typeof g.exits.forEach === "function") {
      g.exits.forEach((value, direction) => exits.push({ direction, target: exitTarget(value && value.exits != null ? value.exits : value) }));
    }
    const items = [];
    if (g.items && typeof g.items.forEach === "function") g.items.forEach((value, id) => items.push(Object.assign({ id }, value)));
    return { path: g.map && g.room ? `${g.map}/${g.room}` : "", name: g.room_name || "", desc: "", exits, items };
  }

  function clearTimer(name) {
    const timer = state.explorer[name];
    if (timer != null) {
      clearTimeout(timer);
      state.explorer[name] = null;
    }
  }

  function schedule(name, callback, delay, token) {
    clearTimer(name);
    state.explorer[name] = setTimeout(() => {
      state.explorer[name] = null;
      if (state.explorer.running && (token == null || token === state.explorer.token)) callback();
    }, delay);
  }

  function saveRoom(room) {
    if (!room || !room.key) return;
    const snapshot = {
      path: room.key,
      name: room.name || "",
      desc: room.desc || "",
      exits: room.exits || [],
      items: room.items || [],
      inspected_at: new Date().toISOString(),
    };
    const index = state.rooms.findIndex(item => item.path === snapshot.path);
    if (index < 0) state.rooms.push(snapshot);
    else state.rooms[index] = Object.assign({}, state.rooms[index], snapshot);
  }

  function inspectRoom(room, token, done) {
    const commands = [];
    (room.items || []).forEach(item => {
      const id = String(item.id);
      commands.push(`look ${id}`);
      if (item.hp != null || item.max_hp != null) commands.push(`cha ${id}`);
    });
    let index = 0;
    function next() {
      if (!state.explorer.running || token !== state.explorer.token) return;
      if (index >= commands.length) return done();
      sendCommand(commands[index++]);
      schedule("stepTimer", next, 550, token);
    }
    next();
  }

  function finishRoom(token) {
    const exp = state.explorer;
    const room = exp.current;
    if (!exp.running || !room || token !== exp.token || room.finished) return;
    if (exp.waitingCombat) {
      schedule("finishTimer", () => finishRoom(token), 1000, token);
      return;
    }
    room.finished = true;
    if (exp.incomingExits) room.exits = exp.incomingExits;
    if (exp.incomingItems) room.items = exp.incomingItems;
    saveRoom(room);
    mark(`房间 ${room.key}，出口 ${room.exits.length} 个，物件/NPC ${room.items.length} 个`);
    inspectRoom(room, token, () => {
      if (!exp.running || token !== exp.token) return;
      schedule("stepTimer", stepExplorer, 700, token);
    });
  }

  function beginRoom(event) {
    const exp = state.explorer;
    if (!exp.running) return;
    const key = roomKey(event);
    const queuedExits = exp.incomingExits || [];
    const queuedItems = exp.incomingItems || [];
    if (exp.pending) {
      const pending = exp.pending;
      clearTimer("roomTimer");
      exp.pending = null;
      if (pending.backtrack) {
        if (key === pending.parentKey) {
          if (pending.popFrame !== false) exp.stack.pop();
          exp.current = exp.stack[exp.stack.length - 1] || null;
          schedule("stepTimer", stepExplorer, 300, exp.token);
        } else {
          mark(`回退失败：期望 ${pending.parentKey}，实际 ${key}`);
          stopExplorer("回退失败");
        }
        return;
      }
      if (key === pending.fromKey) {
        mark(`出口不可达：${pending.direction}`);
        schedule("stepTimer", stepExplorer, 250, exp.token);
        return;
      }
      const existing = exp.stack.findIndex(frame => frame.key === key);
      if (existing >= 0) {
        exp.stack.length = existing + 1;
        exp.current = exp.stack[existing];
        schedule("stepTimer", stepExplorer, 300, exp.token);
        return;
      }
      // 目标房间可能已经探索过、但不在当前 DFS 栈中。先原路返回，不要把它当新分支。
      if (exp.seen.has(key)) {
        const reverse = REVERSE[pending.direction];
        if (!reverse) return stopExplorer(`无法从已访问房间回退：${pending.direction}`);
        exp.pending = { fromKey: key, direction: reverse, parentKey: pending.fromKey, backtrack: true, popFrame: false };
        mark(`已访问房间，回退 ${reverse}`);
        sendCommand(`go ${reverse}`);
        schedule("roomTimer", () => {
          if (!exp.pending) return;
          mark(`已访问房间回退无响应：${reverse}`);
          stopExplorer("回退失败");
        }, 5000, exp.token);
        return;
      }
      const frame = { key, parentKey: pending.fromKey, parentDirection: pending.direction, exits: [], tried: {} };
      const reverse = REVERSE[pending.direction];
      if (reverse) frame.tried[reverse] = true;
      exp.stack.push(frame);
      exp.current = frame;
      exp.seen.add(key);
    }

    exp.entering = false;
    if (!exp.current || exp.current.key !== key) {
      exp.current = { key, parentKey: null, parentDirection: null, exits: queuedExits, items: queuedItems, tried: {}, finished: false };
      exp.stack = [exp.current];
    }
    if (queuedExits.length && !exp.current.exits.length) exp.current.exits = queuedExits;
    if (queuedItems.length && !exp.current.items.length) exp.current.items = queuedItems;
    exp.current.name = event && event.name ? String(event.name) : exp.current.name || "";
    exp.current.desc = event && event.desc ? String(event.desc) : exp.current.desc || "";
    exp.current.finished = false;
    exp.incomingExits = null;
    exp.incomingItems = null;
    clearTimer("finishTimer");
    schedule("finishTimer", () => finishRoom(exp.token), 1200, exp.token);
    updatePanel();
  }

  function handleExplorerEvent(event) {
    const exp = state.explorer;
    if (!exp.running || !event || !event.type) return;
    if (event.type === "combat") {
      exp.waitingCombat = !!event.start && !event.end;
      if (!exp.waitingCombat && exp.current && !exp.current.finished) schedule("finishTimer", () => finishRoom(exp.token), 500, exp.token);
      updatePanel();
      return;
    }
    if (event.type === "room") {
      beginRoom(event);
      return;
    }
    if (event.type === "exits") {
      const exits = normalizeExits(event.items);
      exp.incomingExits = exits;
      if (exp.current) exp.current.exits = exits;
      return;
    }
    if (event.type === "items") {
      const items = normalizeItems(event.items);
      exp.incomingItems = items;
      if (exp.current) exp.current.items = items;
      return;
    }
    if (event.type === "itemadd" && exp.current) {
      const items = exp.current.items || [];
      if (event.id != null && !items.some(item => String(item.id) === String(event.id))) items.push(event);
      exp.current.items = items;
    }
  }

  function stepExplorer() {
    const exp = state.explorer;
    if (!exp.running || exp.waitingCombat || !exp.current) return;
    if (state.rooms.length >= exp.maxRooms) return stopExplorer("达到房间上限");
    const frame = exp.current;
    // 先筛选，只有真正发送的方向才标记 tried；否则会把被跳过的出口误标成已探索。
    const candidate = (frame.exits || []).find(exit => {
      if (frame.tried[exit.direction] || exit.direction === "out") return false;
      const target = exit.target || "";
      return !target || !exp.seen.has(target);
    });
    if (candidate) {
      frame.tried[candidate.direction] = true;
      const command = `go ${candidate.direction}`;
      exp.pending = { fromKey: frame.key, direction: candidate.direction, backtrack: false };
      mark(`移动 ${command}`);
      sendCommand(command);
      schedule("roomTimer", () => {
        if (!exp.pending) return;
        mark(`移动无房间响应：${candidate.direction}`);
        exp.pending = null;
        stepExplorer();
      }, 5000, exp.token);
      return;
    }
    if (exp.stack.length <= 1) return stopExplorer("当前区域没有新的出口");
    const reverse = REVERSE[frame.parentDirection];
    if (!reverse) return stopExplorer(`无法回退：${frame.parentDirection}`);
    exp.pending = { fromKey: frame.key, direction: reverse, parentKey: frame.parentKey, backtrack: true };
    mark(`回退 ${reverse}`);
    sendCommand(`go ${reverse}`);
    schedule("roomTimer", () => {
      if (!exp.pending) return;
      mark(`回退无房间响应：${reverse}`);
      stopExplorer("回退失败");
    }, 5000, exp.token);
  }

  function startExplorer(number, enter) {
    if (!page.WG || typeof page.WG.SendCmd !== "function") {
      alert("原版 WG 接口尚未加载，请刷新页面后重试。");
      return false;
    }
    stopExplorer("重新开始");
    const exp = state.explorer;
    exp.running = true;
    exp.entering = !!enter;
    exp.token += 1;
    exp.current = null;
    exp.stack = [];
    exp.seen = new Set();
    exp.pending = null;
    exp.incomingExits = null;
    exp.incomingItems = null;
    exp.startedAt = Date.now();
    mark(enter ? `进入副本并开始探索：${number}` : "从当前房间开始探索");
    if (enter) {
      const item = DUNGEONS.find(row => row[0] === number);
      if (!item) {
        stopExplorer("没有该副本入口");
        alert("目前只内置公开副本入口；也可以先手动进入副本，再点击“探索当前副本”。");
        return false;
      }
      sendCommand(`jh fb ${item[0]} start1;cr ${item[2]}`);
    } else {
      const snapshot = pageSnapshot();
      if (!snapshot.path) {
        stopExplorer("当前没有可识别房间");
        alert("请先进入副本并看到房间信息，再点击“探索当前副本”。");
        return false;
      }
      beginRoom({ type: "room", path: snapshot.path, name: snapshot.name, desc: snapshot.desc });
      exp.current.exits = snapshot.exits;
      exp.current.items = snapshot.items;
    }
    updatePanel();
    return true;
  }

  function stopExplorer(reason) {
    const exp = state.explorer;
    if (exp.running && reason) mark(`探索停止：${reason}`);
    exp.running = false;
    exp.entering = false;
    exp.pending = null;
    exp.token += 1;
    ["finishTimer", "stepTimer", "roomTimer"].forEach(clearTimer);
    updatePanel();
  }

  function statusText() {
    const hooks = Object.keys(state.hooks).filter(key => state.hooks[key]).join(",") || "等待页面接口";
    const exp = state.explorer;
    const exploration = exp.running ? `探索中 ${state.rooms.length}/${exp.maxRooms}` : "探索未运行";
    return `记录 ${state.frames.length} 条｜房间 ${state.rooms.length}｜接口 ${hooks}｜${exploration}`;
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
      "min-width:260px", "text-align:left",
    ].join(";");
    panel.innerHTML = [
      "<div style='font-weight:bold;color:#ffd24a;margin-bottom:4px'>WSBBB 副本地图探索采集器 2.0</div>",
      "<div id='wsbbb-capture-status'>初始化中</div>",
      "<div style='margin-top:5px;display:flex;flex-wrap:wrap;gap:3px'>",
      "<button data-action='enter'>进入并探索</button>", "<button data-action='current'>探索当前副本</button>",
      "<button data-action='mark'>标记</button>", "<button data-action='export'>导出</button>",
      "<button data-action='clear'>清空</button>", "<button data-action='stop'>停止</button>",
      "</div>",
      "<div style='margin-top:4px;color:#bbb'>只根据服务器返回出口移动；不击杀 NPC。</div>",
    ].join("");
    panel.addEventListener("click", event => {
      const action = event.target && event.target.getAttribute("data-action");
      if (action === "enter") {
        const value = prompt("输入副本编号，例如神龙教输入 8", "8");
        if (value != null && /^\d+$/.test(value)) startExplorer(parseInt(value, 10), true);
      }
      if (action === "current") startExplorer(null, false);
      if (action === "mark") mark(prompt("标记名称") || "");
      if (action === "export") exportCapture();
      if (action === "clear" && confirm("清空当前采集记录？")) clearCapture();
      if (action === "stop") {
        stopExplorer("手动停止");
        sendCommand("stopstate");
      }
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
    enterAndExplore: number => startExplorer(Number(number), true),
    exploreCurrent: () => startExplorer(null, false),
    stop: () => { stopExplorer("手动停止"); sendCommand("stopstate"); },
  };
  page.__WSBBB_MUSH_CAPTURE__ = api;
  page.MUSH_CAPTURE = api;
  console.info("[WSBBB] 副本地图探索采集器已加载。可执行 MUSH_CAPTURE.status() 检查，或使用右上角面板。");

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

