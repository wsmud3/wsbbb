'use strict';
const fs = require('fs');
const path = require('path');
const roots = new Set(['world', 'src', 'www', 'docs']);
function allowed(root, target, allowRoot = false) {
    try {
        root = path.resolve(root); target = path.resolve(target);
        const rel = path.relative(root, target);
        if (!rel) return allowRoot;
        if (path.isAbsolute(rel) || rel.startsWith('..')) return false;
        const parts = rel.split(path.sep);
        if (parts.length === 1 && !allowRoot) return false;
        if (!roots.has(parts[0]) || parts.some(p => p.startsWith('.'))) return false;
        let current = root;
        for (const part of parts) {
            current = path.join(current, part);
            if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) return false;
        }
        return true;
    } catch (_) { return false; }
}
const slug = s => typeof s === 'string' && /^[A-Za-z0-9_]{1,64}$/.test(s) && !['__proto__','constructor','prototype'].includes(s);
function validateMap(body) {
    if (!body || !slug(body.id) || typeof body.name !== 'string' || !body.name || body.name.length > 200) return false;
    if (body.desc !== undefined && (typeof body.desc !== 'string' || body.desc.length > 20000)) return false;
    const rooms = body.rooms || [];
    if (!Array.isArray(rooms) || rooms.length > 500) return false;
    const ids = new Set();
    for (const room of rooms) {
        if (!room || !slug(room.rid) || ids.has(room.rid)) return false;
        ids.add(room.rid);
        if (typeof room.name !== 'string' || room.name.length > 200 || (room.desc !== undefined && (typeof room.desc !== 'string' || room.desc.length > 20000))) return false;
        if (room.npc && !slug(room.npc)) return false;
        for (const key of ['x','y']) if (room[key] !== undefined && (!Number.isSafeInteger(room[key]) || Math.abs(room[key]) > 10000)) return false;
        if (room.exits !== undefined && (!Array.isArray(room.exits) || room.exits.length > 12)) return false;
        for (const exit of room.exits || []) if (!slug(exit) || !room.exitsTo || !slug(room.exitsTo[exit])) return false;
    }
    if (rooms.length && !ids.has('r0')) return false;
    for (const room of rooms) for (const exit of room.exits || []) if (!ids.has(room.exitsTo[exit])) return false;
    return !body.drops || (Array.isArray(body.drops) && body.drops.every(p => typeof p === 'string' && /^\w+(?:\/\w+)*(?:#\w+)?$/.test(p)));
}
function sourceText(value) { return JSON.stringify(String(value)).slice(1,-1).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029'); }
module.exports = { allowed, slug, validateMap, sourceText };
