// 后台统计/全部玩家接口测试：不依赖 better-sqlite3，
// 用假 DB + 假游戏服 IPC 验证 api/admin.js 的 stats / players_all 口径。
// 用法：node tools/test_admin_api.js
'use strict';

const http = require('http');
const path = require('path');

// 后台已改为「IPC 密钥必须配置 + 管理员会话校验」，测试先备好这两样
process.env.ADMIN_IPC_SECRET = process.env.ADMIN_IPC_SECRET || 'test-ipc-secret-0123456789';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret-0123456789';

let failures = 0;
function check(cond, name) {
    if (cond) console.log('  ✓ ' + name);
    else { failures++; console.error('  ✗ ' + name); }
}

const PORT_TEST = 31393;   // 模拟 sid=100 测试服 IPC
const PORT_FORMAL = 31394; // 模拟 sid=200 正式服 IPC

const adminUser = { id: 1, name: 'administrator', pwd: 'HASH', state: 1, level: 6 };

const roles = [
    { id: 'r1', name: 'jia', userid: 1, sid: 100, level: 10, title: '', create_time: '2026-01-01 00:00:00', update_time: '2026-01-05 00:00:00' },
    { id: 'r2', name: 'yi', userid: 1, sid: 200, level: 20, title: '', create_time: '2026-01-01 00:00:00', update_time: '2026-01-04 00:00:00' },
    { id: 'r3', name: 'bing', userid: 2, sid: 200, level: 30, title: '', create_time: '2026-01-01 00:00:00', update_time: '2026-01-03 00:00:00' },
    { id: 'r4', name: 'ding', userid: 3, sid: 777, level: 40, title: '', create_time: '2026-01-01 00:00:00', update_time: '2026-01-02 00:00:00' },
];

// 假数据库：全部服 + 本服两套数值（broken=true 时模拟查询失败，用于验证兜底）
let broken = false;
const fakeDB = {
    getUserBySync: (type, value) => (type === 'id' && Number(value) === adminUser.id ? adminUser : null),
    getPlayerStats: async (sid) => {
        if (broken) throw new Error('database is locked');
        return {
            totalPlayers: roles.length, totalUsers: 3,
            active7: 3, active30: 4, todayNew: 1,
            totalPlayersSid: roles.filter(r => r.sid === sid).length,
            active7Sid: 1, active30Sid: 2, todayNewSid: 0,
            sid: sid,
        };
    },
    countPlayersAll: async () => roles.length,
    listPlayersAll: async (keyword, limit, offset) => {
        const rows = keyword ? roles.filter(r => r.name.indexOf(keyword) >= 0) : roles;
        return rows.slice(offset, offset + limit);
    },
    countPlayers: async (sid) => roles.filter(r => r.sid === sid).length,
    listPlayers: async (sid, keyword, limit, offset) => roles.filter(r => r.sid === sid).slice(offset, offset + limit),
};

// 假游戏服 IPC：只实现后台用到的三个端点
function startIpc(port, onlineIds, playerCount) {
    const server = http.createServer((req, res) => {
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
            let payload;
            if (req.url === '/api/online') payload = onlineIds.map(id => ({ id: id, name: id }));
            else if (req.url === '/api/status') payload = { status: 'running', playerCount: playerCount, connectCount: 1, serverId: port };
            else if (req.url === '/api/stats') payload = { ok: true, data: { totalPlayers: -1 } };
            else payload = { error: 'not found' };
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(payload));
        });
    });
    return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

async function main() {
    globalThis.__CONFIG = {
        DB: fakeDB,
        DESIV: Buffer.alloc(16),
        MD5: 'md5-prefix',
        SESSION_SECRET: process.env.SESSION_SECRET,
        def_server: { istest: true },
        ADMIN_IPC_PORT: PORT_TEST,
        ADMIN_IPC_PORT_FORMAL: PORT_FORMAL,
    };
    const authToken = require(path.join(__dirname, '..', 'os', 'auth-token.js'));
    const AdminAPI = require(path.join(__dirname, '..', 'api', 'admin.js'));

    const ipcTest = await startIpc(PORT_TEST, ['r1'], 1);
    const ipcFormal = await startIpc(PORT_FORMAL, ['r2'], 1);

    try {
        // 管理后台登录后会把管理员会话写进 req.session.admin_auth（含管理证明）
        const makeApi = () => {
            const req = {
                cookies: {}, headers: {},
                session: { admin_auth: { id: adminUser.id, expiresAt: Date.now() + 3600000, proof: authToken.adminProof(adminUser) } },
            };
            return new AdminAPI(req, { cookie() {}, json() {}, setHeader() {} });
        };

        console.log('未登录时拒绝访问');
        {
            const api = new AdminAPI({ cookies: {}, headers: {}, session: {} }, { cookie() {}, json() {}, setHeader() {} });
            const r = await api.stats({ sid: 100 });
            check(r.ok === false, '没有管理员会话时 stats 被拒绝');
        }

        console.log('stats 接口');
        {
            const r = await makeApi().stats({ sid: 200 });
            check(r.ok === true, '接口返回 ok');
            check(r.data.totalPlayers === 4, '注册玩家=全部服务器 4 个角色（含 sid=777 的游离角色与离线角色）');
            check(r.data.totalPlayersSid === 2, '本服（sid=200）角色数 2');
            check(r.data.online === 1, '在线人数来自所选服务器的 IPC');
            check(r.data.totalUsers === 3, '注册账号数 3');
        }

        console.log('players_all 接口');
        {
            const r = await makeApi().players_all({ sid: 100, scope: 'all' });
            check(r.ok === true, '接口返回 ok');
            check(r.data.total === 4, '默认跨全部服务器：共 4 个角色');
            check(r.data.list.length === 4, '列表返回全部角色的当前页');
            const byId = {};
            r.data.list.forEach(x => { byId[x.id] = x; });
            check(byId.r1.online === true, 'sid=100 的角色按测试服在线名单标记在线');
            check(byId.r2.online === true, 'sid=200 的角色按正式服在线名单标记在线（分服查询）');
            check(byId.r3.online === false, '同为 sid=200 但不在在线名单 → 离线');
            check(byId.r4.sid === 777 && byId.r4.online === false, '游离服务器的角色也能列出（服务器离线按离线显示）');
        }

        console.log('players_all 分服视图');
        {
            const r = await makeApi().players_all({ sid: 200, scope: 'server' });
            check(r.data.total === 2 && r.data.scope === 'server', 'scope=server 时只看当前所选服务器');
        }

        console.log('关键词搜索');
        {
            const r = await makeApi().players_all({ sid: 100, keyword: 'yi' });
            check(r.data.list.length === 1 && r.data.list[0].id === 'r2', '关键词命中跨服角色');
        }

        console.log('统计查询失败时的兜底');
        {
            broken = true;
            const r = await makeApi().stats({ sid: 100 });
            broken = false;
            check(r.ok === true && r.fallback === true, '本地库查询失败时退回游戏进程统计（不会掉成 0）');
        }
    } finally {
        ipcTest.close();
        ipcFormal.close();
    }

    console.log('');
    if (failures) { console.error(failures + ' 项未通过'); process.exit(1); }
    console.log('admin 接口测试全部通过');
}

main().catch(function (e) { console.error(e); process.exit(1); });
