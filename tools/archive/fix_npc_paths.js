// Fix NPC references in room files to match actual existing NPC files
const fs = require('fs');
const path = require('path');

const map_dir = path.join(__dirname, '..', 'world', 'map');
const npc_dir = path.join(__dirname, '..', 'world', 'npc');

// Map of wrong NPC paths → correct NPC paths (based on actual existing files)
// null value means remove the NPC reference entirely
const npc_fix_map = {
    // 流氓巷 (yz/lmw) → NPCs are in yz/lm/
    'yz/lmw/liumang': 'yz/lm/liumang',
    'yz/lmw/liumangtou': 'yz/lm/lmtou',

    // 财主家 (yz/cuifu)
    'yz/cuifu/huyuan': 'yz/cuifu/jiading',
    'yz/cuifu/huyuan2': 'yz/cuifu/guanjia',
    'yz/cuifu/caizhu_npc': 'yz/cuifu/cui',

    // 丽春院 (yz/lcy)
    'yz/lcy/laobao': 'yz/lcy/guigong',
    'yz/lcy/taofan': 'yz/lcy/shisong',

    // 天地会 (bj/tdh)
    'bj/tdh/dizi': 'bj/tdh/xu',

    // 庄府 (bj/zhuang)
    'bj/zhuang/jiading': 'bj/zhuang/zhang',
    'bj/zhuang/funu': 'bj/zhuang/furen',
};

function npc_exists(npc_path) {
    const full_path = path.join(npc_dir, npc_path + '.js');
    return fs.existsSync(full_path);
}

function fix_file(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    for (const [wrong, correct] of Object.entries(npc_fix_map)) {
        if (content.includes(`"${wrong}"`)) {
            if (correct === null) {
                // Remove the entire set_npc line
                const lines = content.split('\n');
                const new_lines = lines.filter(line => !line.includes(`"${wrong}"`));
                content = new_lines.join('\n');
                console.log(`  REMOVED NPC ${wrong} in ${path.basename(filepath)}`);
            } else if (npc_exists(correct)) {
                content = content.replace(new RegExp(`"${wrong}"`, 'g'), `"${correct}"`);
                console.log(`  FIXED: ${wrong} → ${correct} in ${path.basename(filepath)}`);
            } else {
                console.log(`  WARNING: ${correct} also doesn't exist, removing reference in ${path.basename(filepath)}`);
                const lines = content.split('\n');
                const new_lines = lines.filter(line => !line.includes(`"${wrong}"`));
                content = new_lines.join('\n');
            }
            modified = true;
        }
    }

    // Clean up: remove duplicate blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    if (modified) {
        fs.writeFileSync(filepath, content, 'utf8');
    }
    return modified;
}

function walk_dir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let fixed = 0;
    for (const entry of entries) {
        const full_path = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            fixed += walk_dir(full_path);
        } else if (entry.name.endsWith('.js')) {
            if (fix_file(full_path)) fixed++;
        }
    }
    return fixed;
}

// First verify all correct NPCs exist
console.log('Verifying NPC references...');
for (const [wrong, correct] of Object.entries(npc_fix_map)) {
    if (correct !== null && !npc_exists(correct)) {
        console.log(`  WARNING: Target NPC ${correct} does not exist either!`);
    } else if (correct !== null) {
        console.log(`  OK: ${wrong} → ${correct} (exists)`);
    }
}

console.log('\nFixing room files...\n');
const total = walk_dir(map_dir);
console.log(`\nFixed ${total} room files.`);
