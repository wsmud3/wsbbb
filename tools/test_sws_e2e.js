// 山外山端到端冒烟测试（本地）
// 前置：本地已启动 web.js 与 main.js 100（.env 指向 8088/31300/31303）
// 用法：
//   node tools/test_sws_e2e.js stage1  # 建测试账号/角色，写库把角色境界提到宗师，然后需重启 main.js
//   node tools/test_sws_e2e.js stage2  # 重启后运行完整山外山流程断言
'use strict';
require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const path = require('path');
const Database = require('better-sqlite3');

const WEB_HOST = '127.0.0.1';
const WEB_PORT = process.env.WEB_PORT || 8088;
const WS_PORT = process.env.WS_PORT || 31300;
const ACCOUNT = 'swstest';
const PASSWORD = 'swstest123';
const ROLE_NAME = '山外试炼';
const PLAYER_ID_FILE = path.join(__dirname, '..', 'log', 'sws_test_player_id.txt');
const DB_PATH = path.join(__dirname, '..', 'data', 'database.db');

let passed = 0, failed = 0;
function ok(cond, desc) {
    if (cond) { passed++; console.log('  [PASS] ' + desc); }
    else { failed++; console.error('  [FAIL] ' + desc); }
}

function md5Pwd(str) {
    return crypto.createHash('md5').update(str + process.env.MD5_PREFIX).digest('hex').toUpperCase();
}

function httpRequest(method, pathName, body, cookie) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const req = http.request({
            hostname: WEB_HOST, port: WEB_PORT, path: pathName, method,
            headers: Object.assign({ 'Content-Type': 'application/json' },
                data ? { 'Content-Length': Buffer.byteLength(data) } : {},
                cookie ? { Cookie: cookie } : {}),
            timeout: 10000,
        }, res => {
            let chunks = '';
            res.on('data', c => chunks += c);
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(chunks); } catch (e) {}
                const setCookie = (res.headers['set-cookie'] || []).map(s => s.split(';')[0]);
                resolve({ status: res.statusCode, json, raw: chunks, setCookie });
            });
        });
        req.on('error', reject);
        req.on('timeout', () => req.destroy(new Error('timeout')));
        if (data) req.write(data);
        req.end();
    });
}

// —— 极简游戏客户端：原生 WebSocket，收到的每条文本进缓冲，支持条件等待 ——
class GameClient {
    constructor() { this.buffer = []; this.waiters = []; }
    connect() {
        return new Promise((resolve, reject) => {
            // 走 web 进程的 /ws/100 代理（生产路径，代理会按 net-ws.js 要求重造大写握手头）
            this.ws = new WebSocket('ws://' + WEB_HOST + ':' + WEB_PORT + '/ws/100');
            this.ws.onopen = () => resolve();
            this.ws.onerror = (e) => reject(new Error('WS连接失败'));
            this.ws.onmessage = (ev) => {
                const text = String(ev.data);
                const index = this.buffer.length;
                this.buffer.push(text);
                this.waiters = this.waiters.filter(w => {
                    if (index >= (w.from || 0) && w.pred(text)) { w.resolve(text); return false; }
                    return true;
                });
            };
            this.ws.onclose = () => {
                this.waiters.forEach(w => w.reject(new Error('WS已关闭')));
                this.waiters = [];
            };
        });
    }
    send(text) { this.ws.send(text); }
    // 等待满足条件的消息（先扫缓冲，再挂监听；from 可只看之后的新消息）
    waitFor(desc, pred, timeout, from) {
        const start = from || 0;
        for (let i = start; i < this.buffer.length; i++) if (pred(this.buffer[i])) return Promise.resolve(this.buffer[i]);
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                console.error('  -- 已收到消息(' + this.buffer.length + ') --');
                this.buffer.slice(-12).forEach(m => console.error('  << ' + m.substring(0, 300)));
                reject(new Error('等待超时: ' + desc));
            }, timeout || 15000);
            this.waiters.push({
                pred,
                from: start,
                resolve: (t) => { clearTimeout(timer); resolve(t); },
                reject: (e) => { clearTimeout(timer); reject(e); },
            });
        });
    }
    text(desc, substr, timeout) {
        return this.waitFor(desc, t => t.indexOf(substr) >= 0, timeout);
    }
    close() { try { this.ws.close(); } catch (e) {} }
}

async function webLogin() {
    const res = await httpRequest('POST', '/api/user/login', { code: ACCOUNT, pwd: PASSWORD });
    if (!res.json || res.json.code !== 1) throw new Error('web登录失败: ' + res.raw);
    return { p: res.json.p, u: res.json.u };
}

async function adminLogin() {
    const res = await httpRequest('POST', '/api/admin/login', { code: 'administrator', pwd: '123456' });
    if (!res.json || !res.json.ok) throw new Error('管理员登录失败: ' + res.raw);
    const cookies = res.setCookie.filter(c => c.startsWith('u=') || c.startsWith('p='));
    return cookies.join('; ');
}

async function adminUpdatePlayer(cookie, playerId, fields) {
    const res = await httpRequest('POST', '/api/admin/player_update',
        Object.assign({ id: playerId }, fields), cookie);
    if (!res.json || !res.json.ok) throw new Error('player_update失败: ' + res.raw);
}

function ensureUser() {
    const db = new Database(DB_PATH, { timeout: 10000 });
    try {
        const row = db.prepare('SELECT id FROM users WHERE name=?').get(ACCOUNT);
        if (row) return row.id;
        db.prepare('INSERT INTO users(name,pwd,phone,state,level) VALUES(?,?,NULL,1,0)')
            .run(ACCOUNT, md5Pwd(PASSWORD));
        return db.prepare('SELECT id FROM users WHERE name=?').get(ACCOUNT).id;
    } finally { db.close(); }
}

// —— 第一阶段：建号建角，写库提境界为宗师 ——
async function stage1() {
    ensureUser();
    const { p, u } = await webLogin();
    const gc = new GameClient();
    await gc.connect();
    gc.send(u + ' ' + p);
    const rolesMsg = await gc.waitFor('roles列表', t => t.indexOf("type:'roles'") >= 0 || t.indexOf('"type":"roles"') >= 0);
    let playerId = null;
    // 服务端消息是单引号伪 JSON，规范化后解析
    const roles = JSON.parse(rolesMsg.replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
    if (roles.roles && roles.roles.length) {
        playerId = roles.roles[0].id;
        console.log('角色已存在: ' + playerId);
    } else {
        gc.send('createrole ' + ROLE_NAME + ' 1 20 20 20 20');
        const loginMsg = await gc.text('创建角色成功(login)', '"type":"login"', 15000);
        playerId = /"id":"([^"]+)"/.exec(loginMsg)[1];
        console.log('角色已创建: ' + playerId);
    }
    gc.close();

    const db = new Database(DB_PATH, { timeout: 10000 });
    try {
        const info = db.prepare('UPDATE players SET level=3 WHERE id=? AND userid=?')
            .run(playerId, ensureUser());
        ok(info.changes === 1, '角色境界已写库为宗师(level=3)');
    } finally { db.close(); }

    require('fs').writeFileSync(PLAYER_ID_FILE, playerId);
    console.log('\nSTAGE1_DONE：请重启 main.js 后运行 stage2');
}

// —— 第二阶段：完整山外山流程 ——
async function stage2() {
    const playerId = require('fs').readFileSync(PLAYER_ID_FILE, 'utf8').trim();
    const { p, u } = await webLogin();

    const gc = new GameClient();
    await gc.connect();
    gc.send(u + ' ' + p + ' ' + playerId);

    const loginMsg = await gc.text('重连登录成功', '{type:"login"', 15000);
    ok(true, '宗师角色登录成功');
    ok(/level:3/.test(loginMsg), '登录消息境界为3(宗师)');
    await gc.text('山外山自动解锁提示', '山外山】已解锁', 5000)
        .then(() => ok(true, '宗师自动解锁提示已推送'))
        .catch(() => console.log('  [INFO] 解锁提示未重复推送（解锁位已置上，属预期）'));

    // 江湖面板解锁位
    gc.send('jh');
    const unlockMsg = await gc.waitFor('jh解锁位', t => t.indexOf('"dialog":"jh"') >= 0 && t.indexOf('unlock2') >= 0);
    const unlock2 = /unlock2:(\d+)/.exec(unlockMsg);
    ok(!!unlock2 && (parseInt(unlock2[1]) & 1024) !== 0, '江湖禁地第11项(位10)已解锁 unlock2=' + (unlock2 ? unlock2[1] : '?'));

    // 进入山外山 → 初始地图「山门」（不再直接开打）
    gc.send('jh ar 10 start');
    const startRoom = await gc.waitFor('进入山门', t => t.indexOf('"path":"sws/start"') >= 0);
    ok(/山门/.test(startRoom), '初始地图显示「山门」');
    await gc.text('山门文案', '守山人', 8000).catch(() => ok(false, '山门文案包含守山人'));

    // 守山人 NPC 查询：本人最高层与全服最高层（纪录持久化，可能来自历史运行，断言做兼容）
    const itemsMsg = await gc.waitFor('山门物品', t => t.indexOf('"type":"items"') >= 0 && t.indexOf('守山人') >= 0, 8000);
    const guard = /"id":"([^"]+)","name":"守山人"/.exec(itemsMsg);
    ok(!!guard, '山门守山人 NPC 已就位');
    if (guard) {
        const markGuard = gc.buffer.length;
        gc.send('sws_ask_self ' + guard[1]);
        await gc.waitFor('查询本人最高层',
            t => t.indexOf('守山人') >= 0 && (t.indexOf('第') >= 0 || t.indexOf('尚未登临') >= 0),
            8000, markGuard)
            .then(() => ok(true, '守山人可查询本人最高层'))
            .catch(() => ok(false, '守山人可查询本人最高层'));
        const markGuard2 = gc.buffer.length;
        gc.send('sws_ask_server ' + guard[1]);
        await gc.waitFor('查询全服最高层',
            t => t.indexOf('守山人') >= 0 && (t.indexOf('最高') >= 0 || t.indexOf('无人登临') >= 0),
            8000, markGuard2)
            .then(() => ok(true, '守山人可查询全服最高层'))
            .catch(() => ok(false, '守山人可查询全服最高层'));
    }

    // 登山 → 第一层，自动开战
    gc.send('go u');
    const room1 = await gc.waitFor('进入第一层', t => t.indexOf('"path":"sws/ceng"') >= 0);
    ok(/第一层/.test(room1), '首层房间名显示「第一层」');
    await gc.text('守护者出现', '守护者', 8000);
    await gc.text('自动开战', 'combat",start:1', 8000).catch(() => ok(false, '自动开战'));
    ok(true, '第一层守护者已生成并开战');

    // 战斗中禁止上楼
    gc.send('go u');
    await gc.text('战斗中上楼被拦', '拦在阶前', 8000)
        .then(() => ok(true, '未击败守护者时禁止登临下一层'))
        .catch(() => ok(false, '未击败守护者时禁止登临下一层'));

    // GM 注入攻击力，秒杀守护者验证击败流程
    const adminCookie = await adminLogin();
    const mark1 = gc.buffer.length;
    await adminUpdatePlayer(adminCookie, playerId, { gj: 999999999, hp: 999999999 });
    await gc.text('击败守护者', '你战胜了第', 30000);
    const picksMsg = await gc.waitFor('三选一对话按钮',
        t => t.indexOf('"type":"cmds"') >= 0 && (t.match(/"cmd":"sws_pick /g) || []).length >= 3, 8000, mark1);
    ok(true, '击败后对话区出现三选一按钮');

    // 择意后层数+1，按钮失效（命令携带词条 key）
    const pickKey = /"cmd":"sws_pick ([a-z0-9_]+)"/.exec(picksMsg)[1];
    gc.send('sws_pick ' + pickKey);
    await gc.text('择意成功', '领悟了山外之意', 8000);
    await gc.text('层数推进提示', '当前已至', 8000).catch(() => {});
    ok(true, '择定山外之意成功');

    // 登临下一层
    gc.send('go u');
    const room2 = await gc.waitFor('第二层房间', t => t.indexOf('"path":"sws/ceng2"') >= 0);
    ok(/第二层/.test(room2), '下一层房间名显示「第二层」');
    ok(room2.indexOf('sws_pick') < 0, '动作栏不再挂三选一按钮');
    await gc.text('第二层开战', 'combat",start:1', 15000).catch(() => ok(false, '第二层开战'));
    ok(true, '第二层守护者已生成并开战');

    // 状态查询
    gc.send('sws_status');
    await gc.text('状态查询', '【山外山】第二层', 8000)
        .then(() => ok(true, '「山外之意」状态可查询'))
        .catch(() => ok(false, '「山外之意」状态可查询'));

    // 再打一层验证循环
    const mark2 = gc.buffer.length;
    await adminUpdatePlayer(adminCookie, playerId, { gj: 999999999, hp: 999999999 });
    await gc.text('第二层击败', '你战胜了第', 30000);
    const picks2 = await gc.waitFor('第二层三选一',
        t => t.indexOf('"type":"cmds"') >= 0 && (t.match(/"cmd":"sws_pick /g) || []).length >= 3, 8000, mark2);
    gc.send('sws_pick ' + /"cmd":"sws_pick ([a-z0-9_]+)"/.exec(picks2)[1]);
    await gc.text('第二层择意', '领悟了山外之意', 8000);
    gc.send('go u');
    await gc.waitFor('第三层房间', t => t.indexOf('"path":"sws/ceng"') >= 0 && /第三层/.test(t), 15000);
    ok(true, '第三层正常布置（无限层循环验证）');

    // 第三层不注入，等守护者击杀玩家 → 验证死亡收尾
    const dieMsg = await gc.text('挑战失败收尾', '倒在了山外山', 120000);
    ok(!!dieMsg, '战败后结束本次挑战并提示通过层数');
    const backRoom = await gc.waitFor('送回扬州', t => t.indexOf('"path":"yz/guangchang"') >= 0, 8000);
    ok(!!backRoom, '战败后送回扬州中央广场');
    ok(!/sws_pick/.test(backRoom), '离开秘境后按钮不残留');

    gc.close();
}

(async () => {
    const stage = process.argv[2] || 'stage2';
    try {
        if (stage === 'stage1') await stage1();
        else await stage2();
    } catch (e) {
        failed++;
        console.error('\n[异常] ' + (e && e.message || e));
    }
    console.log('\n== 山外山E2E(' + stage + ') 通过 ' + passed + ' 项 / 失败 ' + failed + ' 项 ==');
    process.exit(failed ? 1 : 0);
})();
