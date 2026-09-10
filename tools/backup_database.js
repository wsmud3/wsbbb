'use strict';
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
async function main() {
    const source = path.resolve(process.argv[2] || '');
    const target = path.resolve(process.argv[3] || '');
    if (source === target || !fs.statSync(source).isFile() || fs.existsSync(target)) throw new Error('Unsafe backup target');
    const db = new Database(source, { readonly: true, fileMustExist: true });
    try { await db.backup(target); }
    finally { db.close(); }
    const copy = new Database(target, { readonly: true, fileMustExist: true });
    try { if (copy.pragma('quick_check', { simple: true }) !== 'ok') throw new Error('Backup integrity failed'); }
    finally { copy.close(); }
    if (/^db_predeploy_[\w-]+\.db$/.test(path.basename(target))) {
        const dir = path.dirname(target);
        const backups = fs.readdirSync(dir).filter(name => /^db_predeploy_[\w-]+\.db$/.test(name))
            .map(name => ({ file: path.join(dir, name), stat: fs.lstatSync(path.join(dir, name)) }))
            .filter(entry => entry.stat.isFile() && !entry.stat.isSymbolicLink())
            .sort((a,b) => b.stat.mtimeMs - a.stat.mtimeMs);
        for (const entry of backups.slice(20)) if (entry.file !== target) fs.unlinkSync(entry.file);
    }
    console.log('SQLite backup verified');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
