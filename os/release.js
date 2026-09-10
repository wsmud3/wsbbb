'use strict';
// Capture once at process startup, never read HEAD during a health request.
const fs = require('fs');
const path = require('path');
let release = 'unknown';
try {
    const dir = path.resolve(__dirname, '..', '.git');
    const head = fs.readFileSync(path.join(dir, 'HEAD'), 'utf8').trim();
    if (/^[a-f0-9]{40}$/.test(head)) release = head;
    else if (head.startsWith('ref: refs/')) {
        const ref = head.slice(5);
        try { release = fs.readFileSync(path.join(dir, ref), 'utf8').trim(); }
        catch (_) {
            const line = fs.readFileSync(path.join(dir, 'packed-refs'), 'utf8').split('\n').find(l => l.endsWith(' ' + ref));
            if (line) release = line.split(' ')[0];
        }
    }
} catch (_) {}
module.exports = /^[a-f0-9]{40}$/.test(release) ? release : 'unknown';
