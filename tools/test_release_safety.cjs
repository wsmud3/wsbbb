'use strict';
// Synthetic data only. Includes a real SQLite crash boundary and HTTP/WS sockets.
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const cp = require('child_process');
const net = require('net');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const quiet = { log() {}, warn() {}, error() {} };
function swsFixture(dir, crash) {
    const db = new Database(path.join(dir, 'rewards.db'));
    db.exec('CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY,userid INTEGER,name TEXT,title TEXT,level INTEGER,data TEXT,update_time TEXT)');
    db.prepare('INSERT OR IGNORE INTO players(id,userid,name,title,level,data) VALUES(?,?,?,?,?,?)').run('synthetic', 1, 'fixture', '', 1, '{"temp":{},"items":[]}');
    const adapter = require('../data/db');
    adapter.db = db; adapter.stmtCaches.clear();
    const sql = require('../data/sql');
    const file = path.join(dir, 'sws.json');
    const context = vm.createContext({ console: quiet, AREA() {}, __PATH: { DATA: dir + path.sep },
        WORLD: { DATA: { query_temp: (k, d) => d, set_temp() {} } },
        BASE: { read_json: () => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : null,
            write_json: (p, data) => { fs.writeFileSync(file, JSON.stringify(data)); return true; } },
        OBJ: { CREATE: (p, count) => ({ path: p, count, unit: '个', color_name: p }) },
        UTIL: { to_c: String }, ROOM: { Get: () => null }, COMMAND: { DO() {} }, USER: { prototype: {} }
    });
    const area = { inherits() {}, set(o) { Object.assign(this, o); }, random: () => 0 };
    vm.compileFunction(read('world/area/map/sws.js'), [], { parsingContext: context }).call(area);
    const player = Object.assign({ id: 'synthetic', is_player: true, name: 'fixture', query_temp(k,d) { return this.temp[k] ?? d; },
        set_temp(k,v) { this.temp[k] = v; }, remove_temp(k) { delete this.temp[k]; }, notify() {}, send() {},
        add_obj(item) { if (this.reject === item.path) return null; const old = this.items.find(i => i.path === item.path); if (old) { old.count += item.count; return old; } this.items.push(item); return item; },
        remove_obj(item, count) { item.count -= count; if (item.count <= 0) this.items.splice(this.items.indexOf(item), 1); },
        saveSync() {
            if (this.failSave) throw new Error('injected disk error');
            const result = sql.saveRoleSync({ id: this.id, userid: 1, name: 'fixture', title: '', level: 1, data: JSON.stringify({ temp: this.temp, items: this.items }) });
            assert.equal(result.changes, 1);
            if (crash) process.exit(66); // after SQLite commit, before shared receipt write
            return true;
        }
    }, JSON.parse(db.prepare('SELECT data FROM players').get().data));
    return { area, player, db, file };
}
const rewards = [{ path: 'book/wd', count: 20 }, { path: 'st/yuanjing', count: 1 }];
if (process.argv[2] === '--crash-child') {
    const f = swsFixture(process.argv[3], true);
    f.area.sws_commit_milestone(f.player, 'm10:10', 10, 'm10', rewards);
    process.exit(67);
}
async function freePort() {
    const server = net.createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    await new Promise(resolve => server.close(resolve));
    return port;
}
async function main() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wsbbb-safety-'));
    let child, db, ws, socket;
    try {
        const crashed = cp.spawnSync(process.execPath, [__filename, '--crash-child', dir], { encoding: 'utf8', timeout: 10000, windowsHide: true });
        assert.equal(crashed.status, 66, crashed.stderr);
        let f = swsFixture(dir, false);
        assert.equal(f.player.items.find(i => i.path === 'book/wd').count, 20);
        assert.equal(f.area.sws_player_get(f.player).pending.length, 1);
        f.area.sws_retry_pending(f.player);
        assert.equal(f.player.items.find(i => i.path === 'book/wd').count, 20);
        assert.equal(f.area.sws_player_get(f.player).pending.length, 0);
        f.player.failSave = true;
        const before = JSON.stringify(f.player.items);
        assert.equal(f.area.sws_commit_milestone(f.player, 'm10:20', 20, 'm10', rewards), false);
        assert.equal(JSON.stringify(f.player.items), before);
        assert.equal(f.player.temp['sws_reward_commit_m10:20'], undefined);
        f.player.failSave = false;
        f.area.sws_player_get(f.player).pending[0].inFlight = true;
        f.area.sws_retry_pending(f.player);
        assert.equal(f.player.items.find(i => i.path === 'book/wd').count, 40);
        f.player.reject = 'st/yuanjing';
        assert.equal(f.area.sws_commit_milestone(f.player, 'm10:30', 30, 'm10', rewards), false);
        assert.equal(f.player.items.find(i => i.path === 'book/wd').count, 40);
        f.db.close();
        console.log('PASS SQLite commit/crash/reopen, stale pending, save failure and partial bag rollback');

        const repair = require('../os/util/legacy-sws');
        const mixed = '{note:"sws_buffs: [object Object]",temp:{note:"sws_buffs: [object Object]",sws_buffs:[object Object]}}';
        const repaired = require('json5').parse(repair(mixed));
        assert.equal(repaired.note, 'sws_buffs: [object Object]');
        assert.equal(repaired.temp.note, repaired.note);
        assert.deepEqual(repaired.temp.sws_buffs, {});
        assert.equal(repair('{other:{sws_buffs:[object Object]}}'), null);
        console.log('PASS migration repairs only known root.temp fields');

        db = new Database(path.join(dir, 'database.db'));
        db.exec('CREATE TABLE users(id INTEGER PRIMARY KEY,name TEXT,pwd TEXT,phone TEXT,level INTEGER,state INTEGER); CREATE TABLE servers(id INTEGER PRIMARY KEY,name TEXT,ip TEXT,port TEXT,istest INTEGER,isdef INTEGER);');
        const hash = crypto.createHash('md5').update('fixture-password' + 'test-salt').digest('hex').toUpperCase();
        db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?)').run(2, 'fixture', hash, null, 0, 1);
        const port = await freePort();
        const env = { ...process.env, NODE_ENV: 'test', WEB_PORT: String(port), WS_PORT: '32399', MD5_PREFIX: 'test-salt', DESIV: '1234567890123456', SESSION_SECRET: 'isolated-secret-not-for-production', WS_E2E_ROOT: dir, WS_E2E_BOOT_ID: crypto.randomBytes(16).toString('hex') };
        child = cp.spawn(process.execPath, ['web.js'], { cwd: root, env, stdio: 'ignore', windowsHide: true });
        const url = 'http://127.0.0.1:' + port;
        let health;
        for (let i = 0; i < 80; i++) {
            try { health = await fetch(url + '/health').then(r => r.json()); if (health.status === 'ok') break; } catch (_) {}
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        assert.equal(health?.testScope?.nonce, env.WS_E2E_BOOT_ID, 'real web must boot against isolated database');
        const post = (p, body, headers = {}) => fetch(url + p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
        assert.equal((await post('/api/user/signIn', {})).status, 404);
        assert.equal((await fetch(url + '/api/user/resetpwd')).status, 405);
        assert.equal((await post('/api/user/login', { code: 'fixture', pwd: 'fixture-password' }, { Origin: 'https://untrusted.invalid' })).status, 403);
        const login = await post('/api/user/login', { code: 'fixture', pwd: 'fixture-password' }).then(r => r.json());
        assert.equal(login.code, 1);
        assert.match(login.p, /^v3\./);
        const context = { module: { exports: {} }, require, Buffer, process: { env }, __CONFIG: { SESSION_SECRET: env.SESSION_SECRET, DB: { getUserBySync: (k,id) => db.prepare('SELECT * FROM users WHERE id=?').get(id) } } };
        vm.runInNewContext(read('os/auth-token.js'), context);
        const auth = context.module.exports;
        assert.equal(auth.verify(login.p).id, 2);
        db.prepare('UPDATE users SET level=5 WHERE id=2').run();
        assert.equal(auth.verify(login.p).level, 5);
        db.prepare('UPDATE users SET pwd=? WHERE id=2').run('changed');
        assert.equal(auth.verify(login.p), null);
        db.prepare('UPDATE users SET pwd=?,state=0 WHERE id=2').run(hash);
        assert.equal(auth.verify(login.p), null);
        db.prepare('UPDATE users SET state=1 WHERE id=2').run();
        assert.equal((await post('/api/user/resetpwd', { name: 'fixture', phone: '13000000000', vcode: 'abcd', pwd: 'new' }).then(r => r.json())).code, 0);
        assert.equal(db.prepare('SELECT pwd FROM users WHERE id=2').get().pwd, hash);
        console.log('PASS real HTTP routes/CORS/reset closure and HTTP-issued token DB revocation');

        const Server = require('../os/net-ws'); ws = new Server({ SSL: false });
        const messages = []; ws.onReceive = msg => messages.push(msg);
        await new Promise(resolve => ws.listen(0, resolve));
        socket = net.connect(ws.tcpServer.address().port, '127.0.0.1');
        socket.on('data', () => {});
        await new Promise(resolve => socket.once('connect', resolve));
        const header = 'GET / HTTP/1.1\r\nHost: localhost\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: AAECAwQFBgcICQoLDA0ODw==\r\n\r\n';
        socket.write(header.slice(0, 12));
        await new Promise(resolve => setTimeout(resolve, 10));
        const body = Buffer.from('你好'), mask = Buffer.from([1,2,3,4]);
        const frame = Buffer.concat([Buffer.from([129, 128 | body.length]), mask, Buffer.from(body.map((b,i) => b ^ mask[i%4]))]);
        socket.write(Buffer.concat([Buffer.from(header.slice(12)), frame.subarray(0,7)]));
        socket.write(frame.subarray(7));
        for (let i=0; i<50 && !messages.length; i++) await new Promise(resolve => setTimeout(resolve,10));
        assert.deepEqual(messages, ['你好']);
        console.log('PASS real TCP fragmented handshake and Chinese WebSocket frame');
    } finally {
        if (socket) socket.destroy();
        if (ws) await ws.close();
        if (child && child.exitCode === null) { child.kill(); await new Promise(resolve => child.once('exit', resolve)); }
        if (db) db.close();
        fs.rmSync(dir, { recursive: true, force: true });
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
