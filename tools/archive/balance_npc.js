// NPC数值平衡脚本 — 按副本梯次调整怪物数值
const fs = require("fs");
const path = require("path");

const NPC_DIR = path.join(__dirname, "..", "world", "npc");

// 副本 → 目录 → 倍率
// hpMul: HP倍率, dmgMul: 攻击/命中倍率, defMul: 防御(0.7系数)
const DUNGEON_MULTIPLIERS = {
    wf:     { hpMul: 1.4, dmgMul: 1.4, name: "温府" },
    wudu:   { hpMul: 1.5, dmgMul: 1.5, name: "五毒教" },
    hs:     { hpMul: 1.6, dmgMul: 1.6, name: "华山" },
    qc:     { hpMul: 1.6, dmgMul: 1.6, name: "青城" },
    hs2:    { hpMul: 1.7, dmgMul: 1.7, name: "衡山刘府" },
    ts:     { hpMul: 1.7, dmgMul: 1.7, name: "泰山" },
    ss:     { hpMul: 1.8, dmgMul: 1.8, name: "嵩山" },
    ym:     { hpMul: 1.9, dmgMul: 1.9, name: "苗疆" },
    th:     { hpMul: 2.0, dmgMul: 2.0, name: "桃花岛" },
    bt:     { hpMul: 2.0, dmgMul: 2.0, name: "白驼山" },
    xx:     { hpMul: 2.1, dmgMul: 2.1, name: "星宿海" },
    bh:     { hpMul: 2.2, dmgMul: 2.2, name: "冰火岛" },
    yh:     { hpMul: 2.3, dmgMul: 2.3, name: "移花宫" },
    yz2:    { hpMul: 2.4, dmgMul: 2.4, name: "燕子坞" },
    hmy:    { hpMul: 2.5, dmgMul: 2.5, name: "黑木崖" },
    pm:     { hpMul: 2.6, dmgMul: 2.6, name: "缥缈峰" },
    gm:     { hpMul: 2.8, dmgMul: 2.8, name: "光明顶" },
    tl:     { hpMul: 3.0, dmgMul: 3.0, name: "天龙寺" },
    xd:     { hpMul: 3.2, dmgMul: 3.2, name: "血刀门" },
    gm2:    { hpMul: 3.5, dmgMul: 3.5, name: "古墓2" },
    hslj:   { hpMul: 3.8, dmgMul: 3.8, name: "华山论剑" },
};

let totalFiles = 0;
let totalChanges = 0;

function applyMultiplier(content, mul, statName) {
    // 匹配: statName: NUMBER,
    const regex = new RegExp(`(${statName}:\\s*)(\\d+(\\.\\d+)?)`, 'g');
    return content.replace(regex, (match, prefix, num) => {
        const oldVal = parseFloat(num);
        const newVal = Math.round(oldVal * mul);
        if (newVal !== oldVal) {
            return prefix + newVal;
        }
        return match;
    });
}

for (const [dir, cfg] of Object.entries(DUNGEON_MULTIPLIERS)) {
    const dirPath = path.join(NPC_DIR, dir);
    if (!fs.existsSync(dirPath)) {
        console.log(`  [SKIP] ${dir} (${cfg.name}) — 目录不存在`);
        continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".js"));
    if (files.length === 0) continue;

    console.log(`\n=== ${dir} (${cfg.name}) HP×${cfg.hpMul} 伤害×${cfg.dmgMul} ===`);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, "utf-8");
        let modified = false;

        // HP相关
        const hpOld = content.match(/(?:hp|max_hp):\s*(\d+)/g);
        content = applyMultiplier(content, cfg.hpMul, "hp");
        content = applyMultiplier(content, cfg.hpMul, "max_hp");

        // 攻击相关
        content = applyMultiplier(content, cfg.dmgMul, "gj");
        content = applyMultiplier(content, cfg.dmgMul, "mz");

        // 防御相关 (0.7系数)
        const defMul = 1 + (cfg.dmgMul - 1) * 0.7;
        content = applyMultiplier(content, defMul, "fy");
        content = applyMultiplier(content, defMul, "ds");

        // 招架 (0.5系数)
        const zjMul = 1 + (cfg.dmgMul - 1) * 0.5;
        content = applyMultiplier(content, zjMul, "zj");

        // 技能等级也略微提升
        const skillMul = 1 + (cfg.dmgMul - 1) * 0.3;
        const skillRegex = /(?:dodge|parry|force|unarmed|sword|blade|staff|club|whip|throwing|cuff|finger|hand|strike|claw)\w*],\s*(\d+)/g;
        let skillModified = false;
        const newContent = content.replace(skillRegex, (match) => {
            const numMatch = match.match(/(\d+)(?=\]|\))/);
            if (numMatch) {
                const oldVal = parseInt(numMatch[1]);
                const newVal = Math.round(oldVal * skillMul);
                if (newVal !== oldVal) {
                    skillModified = true;
                    return match.replace(oldVal, newVal);
                }
            }
            return match;
        });
        if (skillModified) {
            content = newContent;
            modified = true;
        }

        if (modified || content !== fs.readFileSync(filePath, "utf-8")) {
            fs.writeFileSync(filePath, content, "utf-8");
            console.log(`  ✓ ${file}`);
            totalFiles++;
            totalChanges++;
        }
    }
}

console.log(`\n=== 完成 ===`);
console.log(`处理文件: ${totalChanges}`);
console.log(`涉及副本: ${Object.keys(DUNGEON_MULTIPLIERS).filter(d => fs.existsSync(path.join(NPC_DIR, d))).length}`);
