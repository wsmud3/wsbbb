"use strict";
// 回归测试（真实引擎）：倚天剑破防一击、邪帝舍利一次性内力上限、装备 max_mp 不随存读档叠加、
// 魔刀入邪残留 temp、先天太极图残留 temp。
// 运行：node tools/test_eq_fixes.js
const assert = require("assert");

function mkUser(id) {
    const me = new USER();
    me.id = id; me.name = "测试"; me.level = 1; me.userid = 1;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20; me.gender = 1;
    me.exp = 1000; me.pot = 1000; me.money = 0;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.equipment = []; me.skills = {};
    me.status = []; me.titles = []; me.eq_groups = []; me.sk_groups = [null, [], []]; me.settings = {};
    me.max_mp = 100000; me.limit_mp = 200000; me.mp = 0; me.hp = 1000;
    mute(me);
    me.init_skill();
    return me;
}
function mute(me) {
    me.msgs = [];
    me.notify = function (t) { this.msgs.push(String(t)); };
    me.send = function () {}; me.send_room = function () {}; me.send_combat = function () {}; me.notify_hp = function () {};
}
function relog(me) {
    const role = me.getData();
    const u = mkUser(me.id);
    u.loadData(role); mute(u);
    u.init(); u.recount();
    return u;
}
function give(me, path) {
    const o = OBJ.CREATE(path, 1);
    assert.ok(o, "物品存在：" + path);
    me.items.push(o);
    return o;
}
function withRandom(v, fn) {
    const r = Math.random; Math.random = () => v;
    try { return fn(); } finally { Math.random = r; }
}

function testYitian() {
    const me = mkUser("yt_a"); me.recount();
    const sword = give(me, "eq/lv5/wushen/yitian_sword");
    me.equip(sword); me.recount();
    const gj = me.gj;
    assert.ok(gj > 0);
    const mkTarget = (diffSh) => {
        const t = mkUser("yt_t"); t.recount(); t.max_hp = t.hp = 1e9;
        t.fy = 1e6; t.diff_sh_per = diffSh;
        return t;
    };
    // 5% 触发：伤害 = 1.5×攻击，无视防御（fy）与伤害减免
    let t = mkTarget(60);
    const before = t.hp;
    assert.strictEqual(withRandom(0.01, () => sword.do_attack(me, t, {})), 0, "钩子不改主攻击伤害");
    assert.strictEqual(before - t.hp, Math.floor(gj * 1.5), "破防一击 = 1.5 倍攻击，忽视防御与免伤");
    // 未触发
    t = mkTarget(0);
    withRandom(0.5, () => sword.do_attack(me, t, {}));
    assert.strictEqual(t.hp, 1e9, "95% 不触发");
    // 无敌类（免伤 ≥100%）不被击穿
    t = mkTarget(1080);
    withRandom(0.01, () => sword.do_attack(me, t, {}));
    assert.strictEqual(t.hp, 1e9, "免伤 ≥100% 的无敌状态不被击穿");
    // 任何异常都不能逃出钩子（原版 me.query 不存在 → TypeError → 进程退出）
    t = mkTarget(0); t.damage = () => { throw new Error("boom"); };
    const err = console.error; console.error = () => {};
    try { assert.doesNotThrow(() => withRandom(0.01, () => sword.do_attack(me, t, {}))); } finally { console.error = err; }
    assert.doesNotThrow(() => withRandom(0.01, () => sword.do_attack(me, null, {})));
}

function testXiedi() {
    let me = mkUser("xd_a");
    const sl = give(me, "eq/lv5/wushen/xiedisheli");
    const use = WORLD.COMMANDS["use"];
    assert.ok(use, "use 命令");
    use.enter(me, sl.id);
    assert.strictEqual(me.limit_mp, 200000, "未装备不能使用");
    me.equip(sl); me.recount();
    const exp = me.exp, pot = me.pot, lim0 = me.limit_mp, maxmp0 = me.max_mp;
    assert.doesNotThrow(() => use.enter(me, sl.id));
    assert.strictEqual(me.limit_mp, lim0 + 300000, "+30 万内力上限");
    assert.strictEqual(me.max_mp, maxmp0, "不加最大内力"); assert.strictEqual(me.exp, exp, "不给经验"); assert.strictEqual(me.pot, pot, "不给潜能");
    assert.strictEqual(me.equipment[sl.eq_type], sl, "舍利不消耗");
    // 第二次：提示且不生效、不计冷却
    me.msgs = [];
    use.enter(me, sl.id);
    assert.strictEqual(me.limit_mp, lim0 + 300000, "同一颗只能吸收一次");
    assert.ok(me.msgs.some(m => m.indexOf("吸收殆尽") >= 0), "第二次给出明确提示");
    // 穿脱后标记仍在
    me.unequip(sl); me.equip(sl); me.recount();
    use.enter(me, sl.id);
    assert.strictEqual(me.limit_mp, lim0 + 300000, "穿脱后不能再吸收");
    // 存读档：基础内力含 30 万且标记随物品保存
    me = relog(me);
    const sl2 = me.equipment.find(o => o && o.path === sl.path);
    assert.ok(sl2 && sl2.query_temp("xdsl_used"), "标记随物品存档");
    assert.strictEqual(me.limit_mp, lim0 + 300000, "读档后内力上限不变");
    use.enter(me, sl2.id);
    assert.strictEqual(me.limit_mp, lim0 + 300000, "读档后也不能再吸收");
    // 复制实例（比武/随从等走 clone）也保留标记
    assert.ok(sl2.clone(me).query_temp("xdsl_used"), "clone 保留标记");
    // 另一颗新舍利可以再用一次
    me.unequip(sl2);
    const other = give(me, "eq/lv5/wushen/xiedisheli");
    me.equip(other); me.recount();
    use.enter(me, other.id);
    assert.strictEqual(me.limit_mp, lim0 + 600000, "每颗舍利各可吸收一次");
}

function testMaxMpSave() {
    let me = mkUser("mm_a");
    const eqs = ["eq/lv5/xiaoyao/head", "eq/lv5/xiaoyao/waist"].map(p => give(me, p));
    eqs.forEach(o => me.equip(o)); me.recount();
    // 装备只加内力上限（limit_mp），不加最大内力（max_mp）
    const bonus = me.query_prop("limit_mp");
    assert.ok(bonus > 0, "逍遥套带内力上限");
    assert.strictEqual(me.query_prop("max_mp"), 0, "逍遥套不再加最大内力");
    assert.strictEqual(me.max_mp, 100000);
    for (let k = 0; k < 3; k++) {
        me = relog(me);
        assert.strictEqual(me.max_mp, 100000, "第" + (k + 1) + "次读档 max_mp 不变");
        assert.strictEqual(me.query_prop("limit_mp"), bonus, "内力上限加成不叠加");
    }
    // 精炼后内力上限属性仍在（旧版迁移表会把 limit_mp 当旧 key 删掉）
    const sl = give(me, "eq/lv5/wushen/xiedisheli");
    assert.ok(sl.prop.limit_mp > 0); sl.level_up(3);
    assert.ok(sl.prop.limit_mp > 30000, "精炼后内力上限保留并成长");
    // 卸下全部装备后回到基础值
    for (const o of me.equipment.slice()) if (o) me.unequip(o);
    assert.strictEqual(me.query_prop("max_mp"), 0);
    assert.strictEqual(me.max_mp, 100000, "卸装后回到基础内力");
    me = relog(me);
    assert.strictEqual(me.max_mp, 100000);
    // 状态带来的 max_mp 也不进存档
    me.add_status({ id: "mmtest", name: "测试", duration: 600000, prop: { max_mp: 5000 } });
    assert.strictEqual(me.max_mp, 105000);
    me = relog(me);
    assert.strictEqual(me.max_mp, 100000, "状态加成不存进基础值");
}

function testModao() {
    let me = mkUser("md_a");
    const blade = give(me, "eq/lv6/modao");
    me.equip(blade); me.recount();
    me.mp = 0;
    // 旧存档残留的不过期 temp：没有状态时不生效，并被清掉
    me.set_temp("modao_ruxie", 1);
    me = relog(me);
    const b2 = me.query_weapon();
    assert.ok(b2 && b2.path === blade.path);
    me.mp = 0;
    b2.do_attack(me, null, {});
    assert.strictEqual(me.mp, 0, "残留 temp 不再恢复内力");
    assert.ok(!me.query_temp("modao_ruxie"), "残留 temp 被清除");
    // 正常入邪：状态期间恢复，状态结束即失效
    assert.strictEqual(b2.on_use(me), true);
    assert.ok(me.query_status("modao_ruxie"));
    me.mp = 0; b2.do_attack(me, null, {});
    assert.strictEqual(me.mp, Math.floor(me.max_mp * 2 / 100), "入邪中每次攻击恢复 2%");
    assert.strictEqual(b2.on_use(me), false, "重复使用不生效、不计冷却");
    // 入邪中下线：状态不存档，读档后不再生效
    me = relog(me);
    me.mp = 0; me.query_weapon().do_attack(me, null, {});
    assert.strictEqual(me.mp, 0, "入邪中下线后效果不残留");
}

function testTaiji() {
    let me = mkUser("tj_a");
    const cloth = give(me, "eq/lv6/wushen/taiji_cloth");
    me.equip(cloth); me.recount();
    // 已卡住的旧存档
    me.set_temp("wushen_taiji", 1);
    me = relog(me);
    const c2 = me.equipment.find(o => o && o.path === cloth.path);
    const timers = []; const st = global.setTimeout;
    global.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return { unref() {} }; };
    try {
        assert.strictEqual(c2.on_use(me), true, "卡住的玩家可以重新激活");
        assert.ok(!me.query_temp("wushen_taiji"), "残留 temp 被清除");
        assert.ok(me._wushen_taiji_invincible);
        assert.strictEqual(me.damage(1e6, null), 0, "护体期间无视伤害");
        assert.strictEqual(c2.on_use(me), false, "护体中重复使用不生效");
        // 护体中存档：不留任何残留
        const u = relog(me);
        assert.ok(!u._wushen_taiji_invincible && !u.query_temp("wushen_taiji"), "存读档后不带护体残留");
        assert.strictEqual(timers.length, 1); assert.strictEqual(timers[0].ms, 8000);
        timers[0].fn();
        assert.ok(!me._wushen_taiji_invincible, "8 秒后结束");
        assert.strictEqual(c2.on_use(me), true, "结束后可再次激活");
    } finally { global.setTimeout = st; }
}

require("./zhenyi_sim/boot.js")().then(() => {
    testYitian();
    testXiedi();
    testMaxMpSave();
    testModao();
    testTaiji();
    console.log("test_eq_fixes: all passed");
    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
