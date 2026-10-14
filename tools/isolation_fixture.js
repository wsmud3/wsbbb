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

const stats = { TOPS: scenario.TOPS || [], SCORE: scenario.SCORE || [], SC_STATS: scenario.SC_STATS || {} };
for (const k of ["WUDANG", "HUASHAN", "SHAOLIN", "EMEI", "GAIBANG", "XIAOYAO", "SHASHOU", "NONE"]) {
    stats["tops_" + k] = [];
}
const removed = api.sanitize(stats, scenario.sid);
process.stdout.write(JSON.stringify({ removed, stats }));
