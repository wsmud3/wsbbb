'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'www');
const stage = fs.mkdtempSync(path.join(root, '.vite-stage-'));
try {
    const vite = path.join(path.dirname(require.resolve('vite/package.json')), 'bin/vite.js');
    const result = cp.spawnSync(process.execPath, [vite, 'build', '--outDir', stage], { cwd: root, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error('Vite build failed: ' + result.status);
    const html = fs.readFileSync(path.join(stage, 'index.html'), 'utf8');
    const refs = [...html.matchAll(/(?:src|href)="\.\/assets\/([^"<>]+)"/g)].map(m => m[1]);
    if (!refs.some(f => f.endsWith('.js')) || !refs.some(f => f.endsWith('.css'))) throw new Error('Missing JS/CSS references');
    for (const file of refs) if (!fs.statSync(path.join(stage, 'assets', file)).size) throw new Error('Empty asset: ' + file);
    fs.mkdirSync(output, { recursive: true });
    // Publish assets before the entry; retain previous hashes for open pages.
    fs.cpSync(path.join(stage, 'assets'), path.join(output, 'assets'), { recursive: true });
    const entry = path.join(output, '.index-' + process.pid + '.tmp');
    fs.copyFileSync(path.join(stage, 'index.html'), entry);
    fs.renameSync(entry, path.join(output, 'index.html'));
} finally {
    fs.rmSync(stage, { recursive: true, force: true });
}
