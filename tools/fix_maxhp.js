// Fix: max_hp was multiplied twice because "hp:" regex also matched "max_hp:"
const fs = require('fs');
const path = require('path');

const NPC_DIR = path.join(__dirname, '..', 'world', 'npc');

const DUNGEON_MULTIPLIERS = {
    wf: 1.4, wudu: 1.5, hs: 1.6, qc: 1.6, hs2: 1.7, ts: 1.7,
    ss: 1.8, ym: 1.9, th: 2.0, bt: 2.0, xx: 2.1, bh: 2.2,
    yh: 2.3, yz2: 2.4, hmy: 2.5, pm: 2.6, gm: 2.8, tl: 3.0,
    xd: 3.2, gm2: 3.5, hslj: 3.8,
};

let totalFixed = 0;

for (const [dir, hpMul] of Object.entries(DUNGEON_MULTIPLIERS)) {
    const dirPath = path.join(NPC_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;

    for (const file of fs.readdirSync(dirPath).filter(f => f.endsWith('.js'))) {
        const fp = path.join(dirPath, file);
        let content = fs.readFileSync(fp, 'utf-8');
        let modified = false;

        // Fix max_hp: divide by hpMul (since hp pattern also matched max_hp, it got multiplied twice)
        content = content.replace(/(max_hp:\s*)(\d+)/g, (match, prefix, num) => {
            const oldVal = parseInt(num);
            const correctVal = Math.round(oldVal / hpMul);
            if (correctVal !== oldVal) {
                modified = true;
                return prefix + correctVal;
            }
            return match;
        });

        if (modified) {
            fs.writeFileSync(fp, content, 'utf-8');
            const rel = path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/');
            console.log('Fixed: ' + rel);
            totalFixed++;
        }
    }
}

console.log('\nTotal fixed: ' + totalFixed);
