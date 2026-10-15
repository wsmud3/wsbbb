// Fix room NPC references - remove non-existent NPCs, fix paths
const fs = require('fs');
const path = require('path');

const map_dir = path.join(__dirname, '..', 'world', 'map');
const npc_dir = path.join(__dirname, '..', 'world', 'npc');

function npc_exists(npc_path) {
    // npc_path like "yz/lm/liumang" or "pub/bing"
    const full_path = path.join(npc_dir, npc_path + '.js');
    return fs.existsSync(full_path);
}

function fix_room_file(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    // Find all set_npc calls
    const npc_pattern = /this\.set_npc\(\[?"([^"]+)"[^\]]*\]?\)/g;
    let match;
    const npcs_to_fix = [];

    // Reinitialize regex for each file
    const npc_regex = /this\.set_npc\((\[?"[^"]+)"\s*(?:,\s*(\d+))?\s*\]?\)/g;
    while ((match = npc_regex.exec(content)) !== null) {
        const npc_path = match[1];
        const count = match[2] ? parseInt(match[2]) : 1;
        if (!npc_exists(npc_path)) {
            npcs_to_fix.push({ full: match[0], path: npc_path, count });
            console.log(`  MISSING NPC: ${npc_path} in ${path.basename(filepath)}`);
        }
    }

    if (npcs_to_fix.length === 0) return false;

    // Remove all set_npc lines with missing NPCs
    for (const npc of npcs_to_fix) {
        // Remove the entire line
        const escaped = npc.full.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        content = content.replace(new RegExp('\\s*' + escaped + '\\s*;?\\n?', 'g'), '\n');
        modified = true;
    }

    // Clean up multiple blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    if (modified) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`  FIXED: ${filepath}`);
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
            if (fix_room_file(full_path)) fixed++;
        }
    }
    return fixed;
}

console.log('Scanning rooms for invalid NPC references...\n');
const total = walk_dir(map_dir);
console.log(`\nFixed ${total} room files.`);
