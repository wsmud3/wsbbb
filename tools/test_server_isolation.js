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

// 世界档案里的榜单不是普通数组，而是**类数组对象（稀疏数组）**：
//   {"0":{...},"1":{...},length:30}
// 而且字段名是小写的 tops / score / score_stats，条目用 id 标识角色。
// 这里按真实结构构造测试数据——否则测试会"通过"却验证不了真实场景
// （原测试用 TOPS/普通数组/userid，正是该 Bug 能通过 CI 的原因）。
const sparse = (arr) => {
    const o = { length: arr.length };
    for (let i = 0; i < arr.length; i++) if (arr[i]) o[i] = arr[i];
    return o;
};
const blankTops = () => {
    const s = {};
    for (const k of ALL_TOP_KEYS) s["tops_" + k] = sparse([{ path: "pub/gaoshou1" }, { path: "pub/gaoshou1" }]);
    return s;
};
const compact = (list) => {
    const out = [];
    for (let i = 0; i < (list.length || 0); i++) if (list[i]) out.push(list[i]);
    return out;
};

// 场景 A：正式服档案里混入测试服角色 -> 必须剔除，本服角色不得误伤
WORLD.DB = { getLocalRoles: () => [{ id: "only200" }, { id: "also200" }] };
const statsA = Object.assign(blankTops(), {
    tops: sparse([
        { id: "foreign1", name: "外服乙", score: 100 },      // 越界：清空归属
        { id: "only200", name: "本服甲", score: 90 },        // 本服：保留
        { path: "pub/gaoshou1" },                            // NPC 占位：保留
    ]),
    score: sparse([
        { id: "foreign1", name: "外服乙", score: 999 },      // 越界：整条剔除
        { id: "only200", name: "本服甲", score: 10 },
    ]),
    score_stats: { HUASHAN: sparse([
        { id: "foreign2", name: "外服丙", score: 5 },        // 越界：整条剔除
        { id: "also200", name: "本服丁", score: 3 },
    ]) },
});
const removedA = api.sanitize(statsA, 200);
// tops 清空 1 条 + score 剔除 1 条 + score_stats 剔除 1 条 = 3
assert.strictEqual(removedA, 3, "越界角色的剔除条数必须是 3，实际 " + removedA);
assert.strictEqual(statsA.tops[0].id, undefined, "越界条目的 id 必须被清空");
assert.strictEqual(statsA.tops[0].name, "武林高手", "越界条目必须回到默认名");
assert.strictEqual(statsA.tops[1].id, "only200", "本服条目不得被清空");
assert.strictEqual(statsA.tops[1].name, "本服甲", "本服条目的名字不得被改写");
assert.strictEqual(statsA.tops[2].path, "pub/gaoshou1", "NPC 占位条目（无 id）必须保留");
assert.strictEqual(compact(statsA.score).length, 1, "积分榜必须只保留本服角色");
assert.strictEqual(compact(statsA.score)[0].id, "only200", "积分榜保留的必须是本服角色");
assert.strictEqual(compact(statsA.score_stats.HUASHAN).length, 1, "门派积分榜同样要剔除越界角色");
assert.strictEqual(compact(statsA.score_stats.HUASHAN)[0].id, "also200", "门派积分榜要保留本服角色");

// 场景 B：干净档案不得被改动（幂等、无误伤）
const statsB = Object.assign(blankTops(), {
    tops: sparse([{ id: "only200", name: "本服甲", score: 90 }]),
    score: sparse([{ id: "only200", name: "本服甲", score: 10 }]),
    score_stats: { HUASHAN: sparse([{ id: "also200", name: "本服丁", score: 3 }]) },
});
const snapshot = JSON.stringify(statsB);
assert.strictEqual(api.sanitize(statsB, 200), 0, "干净档案不得剔除任何条目");
assert.strictEqual(JSON.stringify(statsB), snapshot, "干净档案内容必须原样不变");

// 场景 C/D：冷启动路径必须用**全新进程**验证——成功取到的角色清单会锁存，
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
    tops: [{ id: "foreign1", name: "外服乙" }],
    score: [{ id: "foreign1", name: "外服乙" }],
    score_stats: { HUASHAN: [{ id: "foreign2", name: "外服丙" }] },
});
assert.strictEqual(coldFail.removed, 0, "数据源不可用时不得剔除任何条目");
const coldFailScore = compact(coldFail.stats.score);
assert.strictEqual(coldFailScore.length, 1, "数据源不可用时不得清空榜单");
assert.strictEqual(coldFail.stats.tops[0].id, "foreign1", "数据源不可用时不得改写榜单条目");

// 场景 D：冷启动时能取到清单 -> 越界必须剔除，本服角色保留
const coldOk = runFixture({
    sid: 200, localRoles: [{ id: "only200" }],
    tops: [{ id: "foreign1", name: "外服乙" }, { id: "only200", name: "本服甲" }],
    score: [{ id: "ghost", name: "幽灵" }, { id: "only200", name: "本服甲" }],
    score_stats: { HUASHAN: [{ id: "foreign2", name: "外服丙" }] },
});
assert.strictEqual(coldOk.removed, 3, "冷启动也必须剔除越界条目，实际 " + coldOk.removed);
assert.strictEqual(coldOk.stats.tops[0].id, undefined, "主榜越界条目必须被清空");
assert.strictEqual(coldOk.stats.tops[1].id, "only200", "主榜本服角色必须保留");
const coldScore = compact(coldOk.stats.score);
assert.strictEqual(coldScore.length, 1, "积分榜必须只保留本服角色");
assert.strictEqual(coldScore[0].id, "only200", "积分榜保留的必须是本服角色");
const coldFam = compact(coldOk.stats.score_stats.HUASHAN);
assert.strictEqual(coldFam.length, 0, "门派积分榜越界条目必须被剔除");

// 场景 E（守卫）：故意用**普通数组** —— 实现若"只认普通数组、不遍历类数组对象"，
// 真实档案（稀疏数组）就会一条都剔不掉，这个用例会因此失败。
const arrayShape = runFixture({
    sid: 200, localRoles: [{ id: "only200" }], kind: "array",
    score: [{ id: "ghost", name: "幽灵" }, { id: "only200", name: "本服甲" }],
});
assert.strictEqual(arrayShape.removed, 1,
    "普通数组形状也必须能剔除越界条目（实现不得只认某一种容器形状），实际 " + arrayShape.removed);

// 场景 F（守卫·反向）：**类数组对象**下同样必须剔除——
// 这正是原实现失效的场景（Array.isArray 恒为 false → 一条都剔不掉）。
const sparseShape = runFixture({
    sid: 200, localRoles: [{ id: "only200" }],
    score: [{ id: "ghost", name: "幽灵" }, { id: "only200", name: "本服甲" }],
});
assert.strictEqual(sparseShape.removed, 1,
    "类数组对象(稀疏数组)形状必须能剔除越界条目，实际 " + sparseShape.removed);

// ---------------------------------------------------------------------------
// 3. 契约检查
// ---------------------------------------------------------------------------
assert.ok(/DATA\.on_load\s*=\s*function[\s\S]*?sanitize_foreign_stats\(STATS, WORLD\.SERVERID\)/.test(dataExt),
    "DATA.on_load 必须调用按服剔除，否则旧档里的越界角色不会被清掉");
assert.ok(dataExt.includes("STATS.TOPS = STATS.load_tops(data.tops)"),
    "on_load 原有的榜单加载行为不得被破坏");
assert.ok(dataExt.includes("_sanitizeStats = sanitize_foreign_stats"), "剔除实现必须可被测试直接引用");
// 防止回归成"只认普通数组"：真实档案是类数组对象，必须按 length 遍历
assert.ok(/typeof list\.length === 'number'/.test(dataExt),
    "剔除实现必须按类数组对象(len)遍历，否则真实档案(稀疏数组)一条都剔不掉");

console.log("两服数据隔离回归通过（越界剔除 / 不误伤 / 幂等 / 数据源不可用不清榜）");
