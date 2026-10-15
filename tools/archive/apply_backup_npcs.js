// Apply backup rooms to current — keep ALL backup content but fix exits
// Backup has correct names, descs, NPCs, items, actions — only exits might be wrong

const fs = require('fs');
const path = require('path');

const map_dir = path.join(__dirname, '..', 'world', 'map');
const backup_dir = path.join(__dirname, '..', 'dungeon_backup', 'map');

const areas_with_backup = [
    'bj/slj',
    'gm2', 'hs', 'hs2', 'jncz', 'qc', 'ss', 'ts', 'wf', 'wudu', 'xd', 'xx', 'yh'
];

let total = 0;

for (const area of areas_with_backup) {
    const backup_area_dir = path.join(backup_dir, area);
    const current_area_dir = path.join(map_dir, area);

    if (!fs.existsSync(backup_area_dir) || !fs.existsSync(current_area_dir)) continue;

    // Get all named (non-r) files from backup
    const backup_files = fs.readdirSync(backup_area_dir).filter(f => f.endsWith('.js') && !f.match(/^r\d+\.js$/));

    for (const file of backup_files) {
        const backup_path = path.join(backup_area_dir, file);
        const current_path = path.join(current_area_dir, file);

        // Only process if the current file also exists (room is actually used)
        if (!fs.existsSync(current_path)) continue;

        const backup_content = fs.readFileSync(backup_path, 'utf8');
        const current_content = fs.readFileSync(current_path, 'utf8');

        // Extract exits from CURRENT (correct exits from fb map)
        const current_exits_match = current_content.match(/this\.exits\s*=\s*\{([^}]*)\}/s);

        if (!current_exits_match) {
            console.log(`  No exits in current ${area}/${file}, skipping`);
            continue;
        }

        // Replace exits in backup content with correct exits
        // Find the exits block in backup
        const backup_has_exits = backup_content.match(/this\.exits\s*=\s*\{/);

        let new_content;
        if (backup_has_exits) {
            // Replace backup exits with current exits
            new_content = backup_content.replace(
                /this\.exits\s*=\s*\{[^}]*\}/s,
                current_exits_match[0]
            );
        } else {
            // Add exits before NPCs
            new_content = backup_content.replace(
                /(this\.set_npc)/,
                current_exits_match[0] + ';\n$1'
            );
        }

        fs.writeFileSync(current_path, new_content, 'utf8');
        console.log(`Applied: ${area}/${file}`);
        total++;
    }
}

console.log(`\nTotal: ${total} rooms fixed.`);
