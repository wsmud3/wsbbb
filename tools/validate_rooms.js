// Validate all fb room references
const fs = require('fs');
const path = require('path');

const fb_dir = path.join(__dirname, '..', 'world', 'area', 'fb1');
const map_dir = path.join(__dirname, '..', 'world', 'map');

const fb_files = fs.readdirSync(fb_dir).filter(f => f.match(/^fb\d+\.js$/)).sort();

let total = 0, missing = 0, found = 0;

for (const fb_file of fb_files) {
    const content = fs.readFileSync(path.join(fb_dir, fb_file), 'utf8');
    const map_match = content.match(/this\.map\s*=\s*\[([\s\S]*?)\];/);
    if (!map_match) continue;

    const room_regex = /id:\s*"([^"]+)"/g;
    let match;
    while ((match = room_regex.exec(map_match[1])) !== null) {
        total++;
        const room_id = match[1];
        const room_path = room_id + '.js';
        const full_path = path.join(map_dir, room_path);
        if (!fs.existsSync(full_path)) {
            console.log(`MISSING: ${room_path} (from ${fb_file})`);
            missing++;
        } else {
            found++;
        }
    }
}

console.log(`\nTotal: ${total}, Found: ${found}, Missing: ${missing}`);
if (missing === 0) console.log('ALL ROOM FILES EXIST!');
