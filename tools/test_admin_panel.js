// 后台管理页回归测试：直接跑 www/admin/index.html 里的内联脚本，
// 用最小 DOM/网络桩验证「状态栏注册玩家」与「全部玩家」列表的口径。
// 用法：node tools/test_admin_panel.js
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML = path.join(__dirname, '..', 'www', 'admin', 'index.html');

let failures = 0;
function check(cond, name) {
    if (cond) console.log('  ✓ ' + name);
    else { failures++; console.error('  ✗ ' + name); }
}

// —— 最小 DOM 桩 ——
function makeEl(id) {
    return {
        id: id, innerHTML: '', value: '', textContent: '', dataset: {}, style: {},
        classList: { add() {}, remove() {}, contains() { return false; } },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        scrollIntoView() {},
        _onclick: null,
        get onclick() { return this._onclick; },
        set onclick(f) { this._onclick = f; },
    };
}

function loadPage() {
    const html = fs.readFileSync(HTML, 'utf8');
    const m = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!m) throw new Error('index.html 里找不到内联脚本');
    const els = {};
    const sandbox = {
        console: { log() {}, warn() {}, error() {} },
        setTimeout() {}, alert() {}, confirm() { return true; }, prompt() { return ''; },
        location: {}, navigator: {},
        fetch: async () => ({ json: async () => ({ ok: false, msg: '未登录' }) }),
    };
    sandbox.addEventListener = function () {};
    sandbox.window = sandbox;
    sandbox.document = {
        addEventListener() {},
        getElementById(id) { if (!els[id]) els[id] = makeEl(id); return els[id]; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        createElement() { return makeEl('tmp'); },
    };
    vm.createContext(sandbox);
    vm.runInContext(m[1], sandbox);
    sandbox.__els = els;
    return sandbox;
}

async function main() {
    // —— 1. 状态栏：注册取数据库全部角色，且与在线人数无关 ——
    console.log('状态栏统计口径');
    {
        const p = loadPage();
        p.call = async (m) => {
            if (m === 'check') return { ok: true, name: 'administrator', level: 6 };
            if (m === 'online') return { ok: true, data: [{ id: 'p1', name: 'jia', level: 10, location: 'yz', hp: 5, max_hp: 9 }] };
            if (m === 'status') return { ok: false, msg: '游戏服务器离线: connect ECONNREFUSED' };
            if (m === 'stats') return {
                ok: true, data: {
                    totalPlayers: 128, totalUsers: 45, active7: 20, active30: 88, todayNew: 5,
                    totalPlayersSid: 60, active7Sid: 12, active30Sid: 30, todayNewSid: 2,
                    sid: 100, online: 3, gameOnline: true
                }
            };
            return { ok: false };
        };
        // 走完整的面板加载流程：顺带验证状态页会刷新在线名单
        await p.loadPanel('status');
        const h = p.__els['main'].innerHTML;
        check(/注册玩家: <b[^>]*>128<\/b>/.test(h), '注册玩家显示全部服务器的 128（数据库统计）');
        check(h.indexOf('在线: <b style="color:#0f9">3</b>') >= 0, '在线单独显示 3');
        check(h.indexOf('注册账号: <b style="color:#e94560">45</b>') >= 0, '注册账号显示 45');
        check(h.indexOf('本服（🧪 测试服）：角色 60') >= 0, '附带本服分服数值');
        check(h.indexOf('与当前在线人数无关') >= 0, '口径说明可见');
        check(h.indexOf('在线玩家列表 (1)') >= 0, '游戏服离线时注册统计不受影响');
    }

    // —— 2. 统计接口失败时：注册显示 —，绝不退化成在线人数 ——
    console.log('统计接口失败时的降级');
    {
        const p = loadPage();
        p._onlinePlayers = [];
        p.call = async (m) => {
            if (m === 'status') return { ok: true, data: { playerCount: 7, status: 'running', serverName: '本地测试', serverId: 100 } };
            if (m === 'stats') return { ok: false, msg: '查询失败: database is locked' };
            return { ok: false };
        };
        const mainEl = makeEl('main');
        await p.showStatus(mainEl);
        const h = mainEl.innerHTML;
        check(h.indexOf('注册玩家: <b style="color:#e94560;font-size:15px">—</b>') >= 0, '注册取不到时显示 —');
        check(h.indexOf('统计数据获取失败') >= 0, '给出失败提示');
        check(h.indexOf('在线: <b style="color:#0f9">7</b>') >= 0, '在线仍显示 7，未被注册占用');
    }

    // —— 3. 玩家栏「全部玩家」：跨服、含离线、带总数 ——
    console.log('全部玩家列表');
    {
        const p = loadPage();
        p._onlinePlayers = [];
        let lastParams = null;
        p.call = async (m, params) => {
            if (m === 'online') return { ok: true, data: [] };
            if (m === 'players_all') {
                lastParams = params;
                return {
                    ok: true, data: {
                        total: 3, page: 1, size: 50, scope: 'all', sid: 100,
                        list: [
                            { id: 'p1', name: 'jia', userid: 1, level: 10, title: '', sid: 100, online: true, create_time: '2026-01-01 00:00:00', update_time: '2026-01-02 00:00:00' },
                            { id: 'p2', name: 'yi', userid: 1, level: 20, title: '', sid: 200, online: false, create_time: '2026-01-01 00:00:00', update_time: '2026-01-03 00:00:00' },
                            { id: 'p3', name: 'bing', userid: 2, level: 30, title: '', sid: 999, online: false, create_time: '2026-01-01 00:00:00', update_time: '2026-01-04 00:00:00' }
                        ]
                    }
                };
            }
            return { ok: false, msg: 'unexpected ' + m };
        };
        const mainEl = makeEl('main');
        await p.showPlayers(mainEl);
        check(p._plTab === 'all', '没有在线玩家时默认打开「全部玩家」');
        check(mainEl.innerHTML.indexOf('📋 全部玩家') >= 0, '玩家栏有「全部玩家」入口');
        const list = p.__els['all_pl_list'];
        const h = list ? list.innerHTML : '';
        check(h.indexOf('jia') >= 0 && h.indexOf('yi') >= 0 && h.indexOf('bing') >= 0, '列出全部服务器的角色（含离线）');
        check(h.indexOf('🧪 测试服') >= 0 && h.indexOf('🎮 正式服') >= 0 && h.indexOf('服务器999') >= 0, '每行标注所属服务器');
        check(h.indexOf('共 3 个角色（全部服务器，含离线）') >= 0, '显示总数与口径');
        check(lastParams && lastParams.scope === 'all', '默认按全部服务器查询');
        const tabBtn = p.__els['pl_tab_all'];
        check(tabBtn && tabBtn.innerHTML.indexOf('全部玩家 (3)') >= 0, '页签角标显示总数 3');
        check(h.indexOf('离线') >= 0 && h.indexOf('在线') >= 0, '状态列区分在线/离线');
        check(h.indexOf("viewPlayer('p2',200)") >= 0, '跨服角色操作带上所属服务器 sid');
    }

    console.log('');
    if (failures) { console.error(failures + ' 项未通过'); process.exit(1); }
    console.log('admin 后台面板测试全部通过');
}

main().catch(function (e) { console.error(e); process.exit(1); });
