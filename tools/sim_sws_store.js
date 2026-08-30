// 山外山持久化与一次性奖励逻辑模拟（本地，无游戏服务器）
// 用法：node tools/sim_sws_store.js
// 以与游戏一致的方式加载 world/area/map/sws.js（vm.compileFunction，全局走 globalThis），
// 模拟：首次通关 10/100 层发放奖励 → 再次通关同层不重复发放 →
// 模拟服务器重启（新进程，只读档案文件）后本人最佳/全服最高/领取记录仍保留。
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const SIM_DATA_DIR = path.join(root, 'log', 'sws_sim_data');
const TMP = path.join(SIM_DATA_DIR, 'sws.json');
let failed = 0;
function ok(cond, msg) {
    if (cond) console.log('  [PASS] ' + msg);
    else { failed++; console.error('  [FAIL] ' + msg); }
}
// 清理模拟数据目录，确保每次运行从干净状态开始
function cleanSimData() {
    try { fs.rmSync(SIM_DATA_DIR, { recursive: true, force: true }); } catch (e) {}
}

// —— 安装/卸载游戏全局桩（真实引擎里 os/ 模块同样把 AREA/WORLD/... 挂到 globalThis） ——
function installGlobals() {
    const worldData = {
        _t: {},
        query_temp: function (k, d) { return (k in this._t) ? this._t[k] : d; },
        set_temp: function (k, v) { this._t[k] = v; },
    };
    const globals = {
        AREA: function () {},
        BASE: {
            read_json: function (fp) {
                if (!fs.existsSync(fp)) return null;
                try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { return null; }
            },
            write_json: function (fp, obj) {
                fs.mkdirSync(path.dirname(fp), { recursive: true });
                fs.writeFileSync(fp, JSON.stringify(obj));
                return true;
            },
        },
        WORLD: { DATA: worldData },
        UTIL: { to_c: function (n) { return String(n); } },
        ROOM: { Get: function () { return { query_copy2: function () { return { clear_copy: function () {} }; } }; } },
        NPC: { CLONE: function () { return {}; } },
        OBJ: { CREATE: function (p, c) { return { path: p, count: c, unit: '个', color_name: p }; } },
        COMMAND: { DO: function () {} },
        USER: { prototype: { die: function () {} } },
        __PATH: { DATA: path.dirname(TMP) + '/' },
    };
    globals.AREA.prototype = {
        set: function (o) { Object.assign(this, o); },
        inherits: function () {},
        random: function (n) { return Math.floor(Math.random() * n); },
    };
    const saved = {};
    for (const k in globals) { saved[k] = globalThis[k]; globalThis[k] = globals[k]; }
    return {
        worldData,
        restore: function () { for (const k in globals) { if (saved[k] === undefined) delete globalThis[k]; else globalThis[k] = saved[k]; } },
    };
}

function loadArea() {
    const src = fs.readFileSync(path.join(root, 'world', 'area', 'map', 'sws.js'), 'utf8');
    const func = vm.compileFunction(src, [], { filename: 'sws.js' });
    const obj = new globalThis.AREA();
    func.call(obj);
    return obj;
}

function makePlayer(id, name) {
    return {
        id, name, temp: {}, grants: [], is_player: true,
        query_temp: function (k, d) { return (k in this.temp) ? this.temp[k] : d; },
        set_temp: function (k, v) { this.temp[k] = v; },
        add_temp: function (k, v) { this.temp[k] = (this.temp[k] || 0) + v; return this.temp[k]; },
        remove_temp: function (k) { delete this.temp[k]; },
        add_exp: function () {}, notify: function () {}, send: function () {},
        add_obj: function (o) { this.grants.push(o.path); return o; },
        recount: function () {}, notify_hp: function () {},
    };
}

(async () => {
    console.log('== 山外山持久化与一次性奖励逻辑模拟 ==');
    cleanSimData();

    // —— 第一轮（服务器 A） ——
    const s1 = installGlobals();
    const area = loadArea();
    const p1 = makePlayer(10086, '测试侠');

    // 第 10 层：首次 → 发放 武道残页+元晶；best/max 更新
    p1.set_temp('sws_layer', 10);
    p1.set_temp('sws_cleared', 0);
    area.sws_on_npc_die({ destroy: function () {} }, p1);
    ok(p1.grants.indexOf('book/wd') >= 0 && p1.grants.indexOf('st/yuanjing') >= 0, '首次通关第10层发放武道残页+元晶');
    ok(p1.grants.indexOf('st/xuanjing') >= 0, '玄晶仍发放（周收益）');
    ok(p1.query_temp('sws_best', 0) === 10, '本人最佳更新为 10');
    ok(area.sws_max_get().layer === 10 && area.sws_max_get().user === '测试侠', '全服最高更新为 10/测试侠');

    // 第 100 层：首次 → 发放 神魂/神器碎片（单对象 count=5）
    p1.set_temp('sws_layer', 100);
    area.sws_on_npc_die({ destroy: function () {} }, p1);
    ok(p1.grants.filter(g => g === 'eq/lv6/wushen/shenhunsuipian').length === 1, '第100层发放神魂碎片（count=5）');
    ok(p1.grants.filter(g => g === 'eq/lv6/wushen/shenqisuipian').length === 1, '第100层发放神器碎片（count=5）');
    s1.restore();

    // —— 第二轮（模拟新一次挑战，回到第 1 层重新爬；服务器 A 仍在运行） ——
    const s1b = installGlobals();
    const area1b = loadArea();
    const p1b = makePlayer(10086, '测试侠');
    p1b.temp = Object.assign({}, p1.temp); // 模拟存档保存/读回（含 sws_best）
    p1b.set_temp('sws_layer', 10);
    p1b.set_temp('sws_cleared', 0);
    area1b.sws_on_npc_die({ destroy: function () {} }, p1b);
    ok(p1b.grants.indexOf('book/wd') < 0 && p1b.grants.indexOf('st/yuanjing') < 0, '再次通关第10层不再重复发放武道残页+元晶');
    ok(p1b.grants.indexOf('st/xuanjing') >= 0, '再次通关第10层玄晶仍按周收益发放');
    p1b.set_temp('sws_layer', 100);
    area1b.sws_on_npc_die({ destroy: function () {} }, p1b);
    ok(p1b.grants.filter(g => g.indexOf('shenhun') >= 0 || g.indexOf('shenqi') >= 0).length === 0, '再次通关第100层不再重复发放神魂/神器碎片');
    s1b.restore();

    // —— 服务器重启（全新进程，只读档案文件） ——
    const s2 = installGlobals();
    const area2 = loadArea();
    ok(area2.sws_max_get().layer === 100 && area2.sws_max_get().user === '测试侠', '重启后全服最高仍为 100/测试侠');
    const p1c = makePlayer(10086, '测试侠');
    p1c.set_temp('sws_layer', 1);
    area2.sws_setup_start({}, p1c); // 进入山门 → 同步档案回临时状态
    ok(p1c.query_temp('sws_best', 0) === 100, '重启后本人最佳从档案恢复（即使临时状态丢失）');
    const pd = area2.sws_player_get(p1c);
    ok(pd.m10.indexOf(10) >= 0 && pd.m10.indexOf(100) >= 0, '重启后 10/100 层武道残页·元晶领取记录保留（100 同为 10 的倍数）');
    ok(pd.m100.indexOf(100) >= 0, '重启后 100 层神魂/神器碎片领取记录保留');

    // 另一名玩家不受影响
    const p2 = makePlayer(20001, '路人乙');
    area2.sws_on_npc_die({ destroy: function () {} }, p2);
    ok(p2.grants.indexOf('book/wd') < 0, '第1层不是 10 的倍数，不触发里程碑奖励');
    p2.set_temp('sws_layer', 10);
    p2.set_temp('sws_cleared', 0);
    area2.sws_on_npc_die({ destroy: function () {} }, p2);
    ok(p2.grants.indexOf('book/wd') >= 0, '路人乙首次通关第10层正常领取（领取记录按玩家隔离）');
    s2.restore();

    cleanSimData();
    console.log('\n== 模拟结束：' + (failed ? '失败 ' + failed + ' 项' : '全部通过') + ' ==');
    process.exit(failed ? 1 : 0);
})().catch(e => { console.error('[异常]', e); process.exit(1); });
