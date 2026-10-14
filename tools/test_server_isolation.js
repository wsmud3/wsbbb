// 两服数据隔离回归：按服的越界角色必须被剔除，本服角色不得误伤。
//
// 背景：正式服（sid=200）的世界档案 data/200/data.js 里曾出现测试服（sid=100）
// 的角色（问奈何 / 古力娜扎 / 夜无痕），导致正式服排行榜显示测试服角色。
//
// 覆盖三层：
//   1. 静态：按角色读取必须带 sid 约束；登录取档必须显式传本服 sid
//   2. 逻辑：直接执行 world/extends/data.js 里的真实剔除实现
//   3. 契约：剔除挂在 DATA.on_load 上，且原有的榜单加载行为不被破坏
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const sql = read("data/sql.js");
const dataExt = read("world/extends/data.js");
const loginCmd = read("world/cmd/comm/login.js");
const loginExt = read("world/extends/login.js");
const saveUtil = read("os/util/data.js");

// ---------------------------------------------------------------------------
// 1. 静态检查
// ---------------------------------------------------------------------------
assert.ok(/getRoles:\s*function[\s\S]{0,200}?a\.sid=\?/.test(sql),
    "getRoles 必须按 (userid, sid) 过滤，否则会列出其它服的角色");

assert.ok(/getData:\s*function[\s\S]{0,600}?a\.sid=\?/.test(sql),
    "getData 必须支持按 (userid, id, sid) 过滤，否则可跨服读取角色存档");

assert.ok(/getLocalRoles:\s*function[\s\S]{0,200}?select id,name,userid,sid from players where sid=\?/.test(sql),
    "data/sql.js 必须提供 getLocalRoles(server)，供存档自检判定角色归属");

assert.ok(saveUtil.includes("DB.getData(userid, id, server)"),
    "os/util/data.js 的 getRoleData 必须把 server 透传给 DB.getData");

assert.ok(loginCmd.includes("getRoleData(user.userid, id, WORLD.SERVERID)"),
    "登录取档必须显式传本服 sid，避免同账号跨服取到另一服的角色");

assert.ok(/user\.serverid = WORLD\.SERVERID;\s*\n\s*\}\s*\n\s*\/\/ 始终显示角色列表/.test(loginExt),
    "显示角色列表前必须写好 user.serverid，保证后续按服取档有依据");

// ---------------------------------------------------------------------------
// 2. 逻辑检查：直接执行真实实现
// ---------------------------------------------------------------------------
const FAMILIES = {
    WUDANG: { id: "WUDANG", name: "武当" }, HUASHAN: { id: "HUASHAN", name: "华山" },
    SHAOLIN: { id: "SHAOLIN", name: "少林" }, EMEI: { id: "EMEI", name: "峨眉" },
    GAIBANG: { id: "GAIBANG", name: "丐帮" }, XIAOYAO: { id: "XIAOYAO", name: "逍遥" },
    SHASHOU: { id: "SHASHOU", name: "杀手楼" }, NONE: { id: "NONE", name: "无门无派" },
};
const WORLD = { SERVERID: 200, DB: {}, DATA: {}, MESSAGE: { load() { } } };
const call = new Function("WORLD", "FAMILIES", "console", "SKILL", "OBJ", "NPC", "BASE", "UTIL", "COPY_PROPS",
    dataExt + "\n;return { sanitize: DATA._sanitizeStats, collect: DATA._collectLocalIds };");
const api = call(WORLD, FAMILIES, { log() { }, warn() { }, error() { } }, {}, {}, {}, {}, {}, []);

assert.ok(typeof api.sanitize === "function", "sanitize_foreign_stats 必须存在并可被调用");

const ALL_TOP_KEYS = ["WUDANG", "HUASHAN", "SHAOLIN", "EMEI", "GAIBANG", "XIAOYAO", "SHASHOU", "NONE"];
const blankTops = () => { const s = {}; for (const k of ALL_TOP_KEYS) s["tops_" + k] = []; return s; };

// 场景 A：正式服档案里混入测试服角色 -> 必须剔除，本服角色不得误伤
WORLD.DB = { getLocalRoles: () => [{ id: "only200" }, { id: "also200" }] };
const statsA = Object.assign(blankTops(), {
    TOPS: [
        { userid: "foreign1", name: "外服乙", title: "武帝" },
        { userid: "only200", name: "本服甲", title: "武圣" },
    ],
    SCORE: [{ id: "foreign1", name: "外服乙", score: 999 }, { id: "only200", name: "本服甲", score: 10 }],
    SC_STATS: { HUASHAN: [{ id: "foreign2", name: "外服丙", score: 5 }, { id: "also200", name: "本服丁", score: 3 }] },
});
const removedA = api.sanitize(statsA, 200);
// TOPS 清空 1 条 + SCORE 剔除 1 条 + 门派积分榜剔除 1 条 = 3
assert.strictEqual(removedA, 3, "越界角色的剔除条数必须是 3，实际 " + removedA);
assert.strictEqual(statsA.TOPS[0].userid, null, "越界角色的榜单条目必须清空 userid");
assert.strictEqual(statsA.TOPS[0].name, "武林高手", "越界角色的榜单条目必须回到默认名");
assert.strictEqual(statsA.TOPS[0].title, null, "越界角色的称号必须清空");
assert.strictEqual(statsA.TOPS[1].userid, "only200", "本服角色的榜单条目不得被清空");
assert.strictEqual(statsA.TOPS[1].name, "本服甲", "本服角色的名字不得被改写");
assert.strictEqual(statsA.SCORE.length, 1, "积分榜必须只保留本服角色");
assert.strictEqual(statsA.SCORE[0].id, "only200", "保留的必须是本服角色");
assert.strictEqual(statsA.SC_STATS.HUASHAN.length, 1, "门派积分榜同样要剔除越界角色");
assert.strictEqual(statsA.SC_STATS.HUASHAN[0].id, "also200", "门派积分榜要保留本服角色");

// 场景 B：干净档案不得被改动（幂等、无误伤）
const statsB = Object.assign(blankTops(), {
    TOPS: [{ userid: "only200", name: "本服甲", title: "武圣" }],
    SCORE: [{ id: "only200", name: "本服甲", score: 10 }],
    SC_STATS: { HUASHAN: [{ id: "also200", name: "本服丁", score: 3 }] },
});
const snapshot = JSON.stringify(statsB);
assert.strictEqual(api.sanitize(statsB, 200), 0, "干净档案不得剔除任何条目");
assert.strictEqual(JSON.stringify(statsB), snapshot, "干净档案内容必须原样不变");

// 场景 C/D：冷启动路径必须用**全新进程**验证——成功取到的角色清单会被缓存 60 秒，
// 同进程内无法复现"数据源不可用"。子进程里加载真实实现，只断言外部可观察行为。
const { spawnSync } = require("child_process");
const runFixture = (scenario) => {
    const r = spawnSync(process.execPath, [path.join(__dirname, "isolation_fixture.js"), JSON.stringify(scenario)],
        { encoding: "utf8" });
    assert.strictEqual(r.status, 0, "冷启动用例执行失败：" + (r.stderr || "").trim());
    return JSON.parse(r.stdout);
};

// 场景 C：冷启动时数据源不可用 -> 一律不剔除（宁可保留也不误删）
const coldFail = runFixture({
    sid: 200, throwOnLocalRoles: true,
    TOPS: [{ userid: "foreign1", name: "外服乙" }],
    SCORE: [{ id: "foreign1", name: "外服乙" }],
    SC_STATS: { HUASHAN: [{ id: "foreign2", name: "外服丙" }] },
});
assert.strictEqual(coldFail.removed, 0, "数据源不可用时不得剔除任何条目");
assert.strictEqual(coldFail.stats.SCORE.length, 1, "数据源不可用时不得清空榜单");
assert.strictEqual(coldFail.stats.TOPS[0].userid, "foreign1", "数据源不可用时不得改写榜单条目");

// 场景 D：冷启动时能取到清单 -> 越界必须剔除，本服角色保留
const coldOk = runFixture({
    sid: 200, localRoles: [{ id: "only200" }],
    TOPS: [{ userid: "foreign1", name: "外服乙" }, { userid: "only200", name: "本服甲" }],
    SCORE: [{ id: "ghost", name: "幽灵" }, { id: "only200", name: "本服甲" }],
    SC_STATS: { HUASHAN: [{ id: "foreign2", name: "外服丙" }] },
});
assert.strictEqual(coldOk.removed, 3, "冷启动也必须剔除越界条目，实际 " + coldOk.removed);
assert.strictEqual(coldOk.stats.TOPS[0].userid, null, "主榜(TOPS)越界条目必须被清空");
assert.strictEqual(coldOk.stats.TOPS[1].userid, "only200", "主榜本服角色必须保留");
assert.strictEqual(coldOk.stats.SCORE.length, 1, "积分榜必须只保留本服角色");
assert.strictEqual(coldOk.stats.SCORE[0].id, "only200", "积分榜保留的必须是本服角色");
assert.strictEqual(coldOk.stats.SC_STATS.HUASHAN.length, 0, "门派积分榜越界条目必须被剔除");

// ---------------------------------------------------------------------------
// 3. 契约检查
// ---------------------------------------------------------------------------
assert.ok(/DATA\.on_load\s*=\s*function[\s\S]*?sanitize_foreign_stats\(STATS, WORLD\.SERVERID\)/.test(dataExt),
    "DATA.on_load 必须调用按服剔除，否则旧档里的越界角色不会被清掉");
assert.ok(dataExt.includes("STATS.TOPS = STATS.load_tops(data.tops)"),
    "on_load 原有的榜单加载行为不得被破坏");
assert.ok(dataExt.includes("_sanitizeStats = sanitize_foreign_stats"), "剔除实现必须可被测试直接引用");

console.log("两服数据隔离回归通过（越界剔除 / 不误伤 / 幂等 / 数据源不可用不清榜）");
