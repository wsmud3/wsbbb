/* 静态校验真意配置：每门五项、PFM 存在、归属正确且绝不包含 grade 6。 */
const fs = require("fs");
const path = require("path");

global.WORLD = {};
require(path.join(__dirname, "..", "world", "zhenyi.js"));

const root = path.join(__dirname, "..", "world", "skill");
const skills = {};

function stripStringsAndComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "")
        .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, m => " ".repeat(m.length));
}

function pfmKeys(source) {
    source = stripStringsAndComments(source);
    const start = source.indexOf("this.pfm");
    if (start < 0) return [];
    const open = source.indexOf("{", start);
    let depth = 0;
    const keys = [];
    for (let i = open; i < source.length; i++) {
        const ch = source[i];
        if (ch === "{") depth++;
        else if (ch === "}") {
            depth--;
            if (!depth) break;
        } else if (depth === 1 && /[A-Za-z_]/.test(ch)) {
            const match = source.slice(i).match(/^([A-Za-z_]\w*)\s*:/);
            if (match) {
                keys.push(match[1]);
                i += match[0].length - 1;
            }
        }
    }
    return keys;
}

function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
        const file = path.join(dir, name);
        const stat = fs.statSync(file);
        if (stat.isDirectory()) walk(file);
        else if (name.endsWith(".js")) {
            const source = fs.readFileSync(file, "utf8");
            const id = source.match(/this\.id\s*=\s*["']([^"']+)/);
            const grade = source.match(/this\.grade\s*=\s*(\d+)/);
            const family = source.match(/this\.family\s*=\s*FAMILIES\.([A-Z_]+)/);
            if (id) skills[id[1]] = { file, grade: grade ? Number(grade[1]) : 0, family: family && family[1], pfms: pfmKeys(source) };
        }
    }
}
walk(root);

const errors = [];
const data = WORLD.ZHENYI.DATA;
for (const [family, config] of Object.entries(data)) {
    if (config.list.length !== 5) errors.push(`${family}: 应有 5 项真意，实际 ${config.list.length}`);
    for (const intent of config.list) {
        for (const binding of intent.pfms) {
            const [skillId, pfmId] = binding.split("/");
            const skill = skills[skillId];
            if (!skill) errors.push(`${binding}: 技能不存在`);
            else if (skill.grade >= 6) errors.push(`${binding}: grade ${skill.grade} 红色技能禁止受真意强化`);
            else if (skill.family !== family) errors.push(`${binding}: 属于 ${skill.family || "未知"}，并非 ${family}`);
            else if (!skill.pfms.includes(pfmId)) errors.push(`${binding}: PFM 不存在，可用 ${skill.pfms.join(", ") || "无"}`);
        }
    }
}

if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
}
console.log(`真意配置通过：${Object.keys(data).length} 个门派、${Object.values(data).reduce((n, item) => n + item.list.length, 0)} 项真意，未绑定 grade 6 技能。`);
