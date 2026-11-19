// 打印门派真意 1～10 重数值，供无测试号时审阅数值。
// 用法：node tools/sim_zhenyi_values.js [门派ID，如 HUASHAN] [--desc]
global.WORLD = { COMMANDS: {} };
require("../world/zhenyi.js");
const Z = WORLD.ZHENYI;
const only = (process.argv[2] && !process.argv[2].startsWith("--")) ? process.argv[2].toUpperCase() : null;
const withDesc = process.argv.includes("--desc");
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

for (const [fid, data] of Object.entries(Z.DATA)) {
    if (only && fid !== only) continue;
    console.log(`\n== ${fid} ${data.name}（${data.v2 ? "v2 机制型" : "旧公式"}，balance ${data.balance}）`);
    for (const it of data.list) {
        const rows = LEVELS.map(lv => Z.values_for(data, it, lv));
        const keys = Object.keys(rows[0]);
        console.log(`  ${it.id}. ${it.name}［${it.mech}/${it.mode}］ ${it.effect}`);
        for (const k of keys) {
            const vals = rows.map(r => r[k]);
            const ratio = vals[0] ? (vals[9] / vals[0]).toFixed(2) : "-";
            console.log(`     ${k.padEnd(10)} ${vals.map(v => String(v).padStart(4)).join("")}   十重/一重=${ratio}`);
        }
        if (withDesc) console.log(`     十重：${Z.describe(data, it, 10)}`);
    }
}
