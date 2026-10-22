#!/usr/bin/env node
/**
 * 通用「走到目标房间 → 执行探针命令 → 打印回应」验证工具
 * 环境变量: PU PP RID CR(副本id) PREF(房间前缀) ENTRY(入口房间短名) TARGET(目标房间短名) PROBES(用 | 分隔)
 */
'use strict';
const net = require('net'), crypto = require('crypto'), fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const U = process.env.PU, P = process.env.PP, RID = process.env.RID;
const MUD = '/home/mud/mud';
const PREF = process.env.PREF, TARGET = process.env.TARGET, ENTRY = process.env.ENTRY;
const PROBES = (process.env.PROBES || '').split('|').filter(Boolean);

function graph() {
    const d = path.join(MUD, 'world/map', PREF);
    const rooms = {};
    for (const f of fs.readdirSync(d)) {
        if (!f.endsWith('.js')) continue;
        const s = fs.readFileSync(path.join(d, f), 'utf8');
        const ex = {};
        const re = new RegExp('"([a-z]+)"\\s*:\\s*"' + PREF + '/([^"]+)"', 'g');
        let m;
        while ((m = re.exec(s))) ex[m[1]] = m[2];
        rooms[f.slice(0, -3)] = ex;
    }
    return rooms;
}

function bfs(rooms, from, to) {
    if (from === to) return [];
    const q = [[from, []]], seen = new Set([from]);
    while (q.length) {
        const [c, p] = q.shift();
        for (const [dir, nx] of Object.entries(rooms[c] || {})) {
            if (seen.has(nx) || !rooms[nx]) continue;
            const np = [...p, dir];
            if (nx === to) return np;
            seen.add(nx); q.push([nx, np]);
        }
    }
    return null;
}

class W {
    constructor(h, p) { this.h = h; this.p = p; this.buf = Buffer.alloc(0); this.hs = false; }
    connect() {
        return new Promise((res, rej) => {
            const k = crypto.randomBytes(16).toString('base64');
            this.s = net.createConnection({ host: this.h, port: this.p });
            this.s.setNoDelay(true);
            this.s.on('connect', () => {
                const hd = ['GET / HTTP/1.1', 'Host: ' + this.h + ':' + this.p, 'Upgrade: websocket', 'Connection: Upgrade', 'Sec-WebSocket-Key: ' + k, 'Sec-WebSocket-Version: 13', 'Origin: http://127.0.0.1'];
                this.s.write(hd.join('\r\n') + '\r\n\r\n');
            });
            this.s.on('data', d => {
                this.buf = Buffer.concat([this.buf, d]);
                if (!this.hs) {
                    const i = this.buf.indexOf('\r\n\r\n');
                    if (i < 0) return;
                    this.buf = this.buf.slice(i + 4); this.hs = true; res(this); this.pump();
                } else this.pump();
            });
            this.s.on('error', e => { if (!this.hs) rej(e); });
        });
    }
    pump() {
        for (; ;) {
            if (this.buf.length < 2) return;
            const b0 = this.buf[0], b1 = this.buf[1];
            const op = b0 & 0x0f, m = (b1 & 0x80) !== 0;
            let len = b1 & 0x7f, off = 2;
            if (len === 126) { if (this.buf.length < off + 2) return; len = this.buf.readUInt16BE(off); off += 2; }
            else if (len === 127) { if (this.buf.length < off + 10) return; len = this.buf.readUInt32BE(off + 4); off += 8; }
            let mk = null;
            if (m) { if (this.buf.length < off + 4) return; mk = this.buf.slice(off, off + 4); off += 4; }
            if (this.buf.length < off + len) return;
            let pl = this.buf.slice(off, off + len); this.buf = this.buf.slice(off + len);
            if (m) { const o = Buffer.alloc(len); for (let i = 0; i < len; i++) o[i] = pl[i] ^ mk[i % 4]; pl = o; }
            if (op === 8) return;
            if (op === 9) { this.frame(10, pl); continue; }
            if (op === 10) continue;
            if (op === 1 || op === 0) this.t && this.t(pl.toString('utf8'));
        }
    }
    frame(op, d) {
        const pl = Buffer.from(d), mk = crypto.randomBytes(4), len = pl.length; let hd;
        if (len < 126) { hd = Buffer.alloc(2); hd[0] = 0x80 | op; hd[1] = 0x80 | len; }
        else { hd = Buffer.alloc(4); hd[0] = 0x80 | op; hd[1] = 0x80 | 126; hd.writeUInt16BE(len, 2); }
        const mp = Buffer.alloc(len);
        for (let i = 0; i < len; i++) mp[i] = pl[i] ^ mk[i % 4];
        this.s.write(Buffer.concat([hd, mk, mp]));
    }
    send(t) { this.frame(1, t); }
    close() { try { this.s.destroy(); } catch (_) { } }
}

function clean(txt) {
    return txt
        .replace(/\{"type":"room"[\s\S]*?\}\{"type":"exits"[\s\S]*?\}\{?/g, '')
        .replace(/\{"type":"items"[\s\S]*?\]\}/g, '')
        .replace(/\{type:"sc"[\s\S]*?\}/g, '')
        .replace(/\{type:"status"[\s\S]*?\}\}?/g, '')
        .replace(/\{"type":"status"[\s\S]*?\}\}?/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);
}

(async () => {
    const rooms = graph();
    const p = bfs(rooms, ENTRY, TARGET);
    console.log('== ' + process.env.TAG + ' 入口=' + ENTRY + ' 目标=' + TARGET + ' 路径=' + (p ? p.join('→') : '找不到'));
    if (!p) process.exit(0);
    const w = new W('127.0.0.1', 31300);
    let buf = ''; w.t = t => { buf += t; };
    await w.connect(); w.send(U + ' ' + P + ' ' + RID); await sleep(4500);
    async function cmd(c, ms = 2200) { buf = ''; w.send(c); await sleep(ms); return buf; }
    await cmd('cr over', 1200);
    let r = await cmd('cr ' + process.env.CR, 4000);
    for (const d of p) r = await cmd('go ' + d);
    const cur = (r.match(/"type":"room","path":"([^"]+)"/) || [])[1];
    console.log('   到达: ' + (cur || '?'));
    for (const pr of PROBES) {
        const out = await cmd(pr, 2600);
        const room = out.match(/"type":"room","path":"([^"]+)"/);
        console.log('   > ' + pr.padEnd(14) + (room ? ' →' + room[1].split('/').pop() : '') + '  «' + clean(out) + '»');
    }
    w.close();
    process.exit(0);
})().catch(e => { console.log('ERR', e && e.stack || e); process.exit(1); });
