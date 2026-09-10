'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
let scope = null;
if (process.env.WS_E2E_BOOT_ID) {
    if (process.env.NODE_ENV !== 'test' || !/^[a-f0-9]{32}$/.test(process.env.WS_E2E_BOOT_ID)) throw new Error('Invalid isolated test boot ID');
    const root = fs.realpathSync(process.env.WS_E2E_ROOT || '');
    const temp = fs.realpathSync(os.tmpdir());
    const rel = path.relative(temp, root);
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Test root must be a private directory below OS temp');
    const db = path.join(root, 'database.db');
    if (fs.existsSync(db) && fs.realpathSync(db) !== db) throw new Error('Test DB cannot be a symlink');
    const data = path.join(root, 'runtime');
    if (fs.existsSync(data) && fs.realpathSync(data) !== data) throw new Error('Test runtime cannot be a symlink');
    fs.mkdirSync(data, { recursive: true });
    scope = { nonce: process.env.WS_E2E_BOOT_ID, db, data: data + path.sep, wsPort: Number(process.env.WS_PORT) };
}
module.exports = scope;
