'use strict';
const cp = require('child_process');
const ref = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(ref || '')) throw new Error('Expected commit SHA');
const git = args => cp.execFileSync('git', args, { encoding: 'utf8' });
const html = git(['show', ref + ':www/index.html']);
const refs = [...html.matchAll(/(?:src|href)="\.\/assets\/([^"<>]+)"/g)].map(m => m[1]);
if (!refs.some(f => f.endsWith('.js')) || !refs.some(f => f.endsWith('.css'))) throw new Error('Missing frontend entry assets');
for (const file of refs) {
    if (!/^[\w.-]+$/.test(file)) throw new Error('Invalid asset name');
    const size = Number(git(['cat-file', '-s', ref + ':www/assets/' + file]));
    if (!(size > 0)) throw new Error('Empty asset: ' + file);
}
console.log('Candidate frontend assets verified');
