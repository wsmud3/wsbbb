const fs = require('fs');
const path = require('path');

function walk(dir, results) {
    for (const f of fs.readdirSync(dir)) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) { walk(fp, results); continue; }
        if (!f.endsWith('.js')) continue;
        const content = fs.readFileSync(fp, 'utf-8');
        const hasAttack = content.includes('attack_actions');
        const hasDodge = content.includes('dodge_actions') || content.includes('query_dodge_action');
        const hasParry = content.includes('parry_actions') || content.includes('query_parry_action');
        const nameMatch = content.match(/this\.name\s*=\s*"([^"]+)"/);
        const name = nameMatch ? nameMatch[1] : f;
        const rel = path.relative('world/skill', fp).replace(/\\/g, '/');

        const issues = [];
        if (!hasAttack) issues.push('NO_ATTACK');
        const isDodge = rel.startsWith('dodge/');
        const isParry = rel.startsWith('parry/');
        const isForce = rel.startsWith('force/');
        const isUnarmed = rel.startsWith('unarmed/');
        const isWeapon = rel.startsWith('sword/') || rel.startsWith('blade/') || rel.startsWith('staff/') || rel.startsWith('club/') || rel.startsWith('whip/') || rel.startsWith('throwing/');

        if (!hasDodge && isDodge) issues.push('NO_DODGE');
        if (!hasParry && isParry) issues.push('NO_PARRY');
        if (hasAttack) {
            const match = content.match(/attack_actions\s*=\s*\[([\s\S]*?)\];/);
            if (match && match[1].trim().length < 50) issues.push('BARE_ATTACK');
        }
        if (issues.length > 0 || isDodge || isParry || isUnarmed || isWeapon) {
            results.push({file: rel, name: name, issues: issues.join(','), isDodge, isParry, isUnarmed, isWeapon, isForce});
        }
    }
}

const results = [];
walk('world/skill', results);

console.log('=== Skills missing attack actions ===');
results.filter(r => r.issues.includes('NO_ATTACK')).forEach(r => console.log(r.file + ' | ' + r.name));

console.log('\n=== Dodge skills missing dodge actions ===');
results.filter(r => r.issues.includes('NO_DODGE')).forEach(r => console.log(r.file + ' | ' + r.name));

console.log('\n=== Parry skills missing parry actions ===');
results.filter(r => r.issues.includes('NO_PARRY')).forEach(r => console.log(r.file + ' | ' + r.name));

console.log('\n=== Skills with bare attack actions (need more flavor) ===');
results.filter(r => r.issues.includes('BARE_ATTACK')).forEach(r => console.log(r.file + ' | ' + r.name));

console.log('\nTotal skills with issues:', results.filter(r => r.issues.length > 0).length);
console.log('Total combat skills checked:', results.length);
