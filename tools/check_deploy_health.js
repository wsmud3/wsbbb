'use strict';
require('dotenv').config({ quiet: true });
const http = require('http');
const expected = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(expected || '')) throw new Error('Expected release SHA');
const targets = [
    { port: Number(process.env.WEB_PORT) || 8088, service: 'web' },
    { port: Number(process.env.ADMIN_IPC_PORT) || 31303, service: 'game', sid: 100 },
    { port: Number(process.env.ADMIN_IPC_PORT_FORMAL) || 31304, service: 'game', sid: 200 }
];
function probe(target) {
    return new Promise(resolve => {
        const req = http.get({ host: '127.0.0.1', port: target.port, path: '/health', timeout: 1500 }, res => {
            let body = '';
            res.on('data', chunk => { body += chunk; if (body.length > 4096) req.destroy(); });
            res.on('end', () => {
                try { const data = JSON.parse(body); resolve(res.statusCode === 200 && data.status === 'ok' && data.release === expected && data.service === target.service && (!target.sid || data.sid === target.sid)); }
                catch (_) { resolve(false); }
            });
            res.on('error', () => resolve(false));
        });
        req.on('timeout', () => req.destroy());
        req.on('error', () => resolve(false));
    });
}
(async () => {
    for (let attempt = 0; attempt < 20; attempt++) {
        if ((await Promise.all(targets.map(probe))).every(Boolean)) { console.log('All services running verified release ' + expected); return; }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Release health check failed; deployed_ref was not advanced. Do not restore live database.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
