const fs = require('fs');
const path = require('path');

const BASE_SKILLS = ['parry','dodge','force','unarmed','sword','blade','staff','club','whip','throwing','cuff','finger','hand','strike','claw'];
const NPC_DIR = path.join(__dirname, '..', 'world', 'npc');

function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) { walk(fp); continue; }
        if (!f.endsWith('.js')) continue;
        const content = fs.readFileSync(fp, 'utf-8');
        const match = content.match(/skill_map\(([\s\S]*?)\);/);
        if (!match) continue;
        const args = match[1];
        const entries = args.match(/\[[\s\S]*?\]/g) || [];
        const defined = new Set();
        for (const e of entries) {
            const parts = e.replace(/[\[\]"'\s]/g, '').split(',');
            if (parts[0]) defined.add(parts[0]);
            if (parts.length >= 3) {
                const types = parts[2].replace(/[\[\]"']/g, '').split(',');
                for (const t of types) {
                    if (!t || !BASE_SKILLS.includes(t)) continue;
                    if (!defined.has(t)) {
                        const rel = path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/');
                        console.log(rel + ' | skill=' + parts[0] + ' enables ' + t + ' but MISSING');
                    }
                }
            }
        }
    }
}

console.log('Scanning for skill_map bugs...\n');
walk(NPC_DIR);
console.log('\nDone.');
