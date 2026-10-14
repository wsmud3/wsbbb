// 在**全新进程**里加载 world/extends/data.js 并执行一次剔除，用于验证冷启动路径
// （成功取到的角色清单会被缓存 60 秒，同进程内无法复现"数据源不可用"）。
//
// 由 tools/test_server_isolation.js 以子进程方式调用：
//   node tools/isolation_fixture.js '<scenario-json>'
// 输出：单行 JSON { removed, stats }
const fs = require("fs");
const path = require("path");

const scenario = JSON.parse(process.argv[2] || "{}");
const dataExt = fs.readFileSync(path.join(__dirname, "..", "world", "extends", "data.js"), "utf8");

const FAMILIES = {};
for (const k of ["WUDANG", "HUASHAN", "SHAOLIN", "EMEI", "GAIBANG", "XIAOYAO", "SHASHOU", "NONE"]) {
    FAMILIES[k] = { id: k, name: k };
}
const WORLD = {
    SERVERID: scenario.sid,
    DATA: {},
    MESSAGE: { load() { } },
    DB: {
        getLocalRoles: () => {
            if (scenario.throwOnLocalRoles) throw new Error("db down");
            return scenario.localRoles || [];
        },
    },
};

const call = new Function("WORLD", "FAMILIES", "console", "SKILL", "OBJ", "NPC", "BASE", "UTIL", "COPY_PROPS",
    dataExt + "\n;return { sanitize: DATA._sanitizeStats };");
// 屏蔽实现内部的告警输出，只保留结构化结果
const quiet = { log() { }, warn() { }, error() { } };
const api = call(WORLD, FAMILIES, quiet, {}, {}, {}, {}, {}, []);

// 按**真实档案结构**构造：榜单是类数组对象（稀疏数组），字段名小写。
// kind 为 "array" 时故意用普通数组，用来验证实现不是"只认普通数组"。
const sparse = (arr) => {
    const o = { length: arr.length };
    for (let i = 0; i < arr.length; i++) if (arr[i]) o[i] = arr[i];
    return o;
};
const build = (arr) => (scenario.kind === "array" ? arr : sparse(arr));

const stats = {
    tops: build(scenario.tops || []),
    score: build(scenario.score || []),
    score_stats: {},
};
for (const k of ["WUDANG", "HUASHAN", "SHAOLIN", "EMEI", "GAIBANG", "XIAOYAO", "SHASHOU", "NONE"]) {
    stats["tops_" + k] = build([{ path: "pub/gaoshou1" }]);
}
for (const fam in (scenario.score_stats || {})) {
    stats.score_stats[fam] = build(scenario.score_stats[fam]);
}
const removed = api.sanitize(stats, scenario.sid);
process.stdout.write(JSON.stringify({ removed, stats }));
