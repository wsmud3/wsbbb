"use strict";
// 回归测试（真实引擎）：审计报告里其余装备 / 丹药问题。
// 运行：node tools/test_eq_fixes2.js
const assert = require("assert");

function mute(me) {
    me.msgs = [];
    me.notify = function (t) { this.msgs.push(String(t)); };
    me.send = function (t) { this.msgs.push(String(t)); };
    me.send_room = function () {}; me.send_combat = function () {}; me.notify_hp = function () {};
}
let uid = 0;
function mkUser(id) {
    const me = new USER();
    me.id = id || ("t" + (++uid)); me.name = "测试"; me.level = 1; me.userid = 1;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20; me.gender = 1;
    me.exp = 1000; me.pot = 1000; me.money = 0;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.equipment = []; me.skills = {};
    me.status = []; me.titles = []; me.eq_groups = []; me.sk_groups = [null, [], []]; me.settings = {};
    me.max_mp = 100000; me.limit_mp = 200000; me.mp = 0; me.hp = 1000;
    mute(me);
    me.init_skill(); me.recount(); me.hp = me.max_hp;
    return me;
}
function relog(me) {
    const role = me.getData();
    const u = mkUser(me.id);
    u.loadData(role); mute(u);
    u.init(); u.recount();
    u.restore_item_buffs();
    return u;
}
function give(me, path) {
    const o = OBJ.CREATE(path, 1);
    assert.ok(o, "物品存在：" + path);
    me.items.push(o);
    return o;
}
function wear(me, path) { const o = give(me, path); assert.notStrictEqual(me.equip(o), false, "装备 " + path); me.recount(); return o; }
function withRandom(v, fn) { const r = Math.random; Math.random = () => v; try { return fn(); } finally { Math.random = r; } }
function npcTarget() {
    const t = NPC.CLONE("pub/gaoshou1");
    mute(t);
    t.max_hp = t.hp = 1000000; t.gj = 50000; t.fy = 0; t.diff_sh_per = 0; t.ds = 0; t.zj = 0;
    return t;
}
function engage(me, t) {
    const room = ROOM.Get(DEFAULT_ROOM);
    me.environment = room; t.environment = room;
    me.fight_type = 2; t.fight_type = 2; me.enemy = [t]; t.enemy = [me];
}
// 让 me 对 target 打一次真实的普攻（必中、不被招架）
function hit(me, t, extra) {
    me.fight_type = 2; t.fight_type = 2; me.enemy = [t]; t.enemy = [me];
    t.is_busy = 1000;
    return me.do_attack(Object.assign({ target: t, mz: 1e12, no_parry: true, no_dodge: true }, extra || {}));
}

const tests = {
    "荧惑：噬血按实际伤害吸收为气血内力，重复使用不扣冷却"() {
        const me = mkUser(); const blade = wear(me, "eq/lv6/wushen/yinghuo_blade");
        assert.strictEqual(blade.on_use(me), true);
        assert.ok(me.query_status("wushen_yinghuo"));
        assert.strictEqual(blade.on_use(me), false, "已在状态中返回 false");
        me.hp = 1; me.mp = 0;
        blade.on_attack_over(me, null, {}, 1000);
        assert.strictEqual(me.hp, 501); assert.strictEqual(me.mp, 500);
        // 真实攻击链路：攻击结束后经 CHARACTER.on_attack_over 转给武器
        me.hp = 1; me.mp = 0; const t = npcTarget();
        const sh = hit(me, t);
        assert.ok(sh > 0, "造成伤害");
        assert.strictEqual(me.mp, Math.min(me.max_mp, Math.floor(sh / 2)), "内力 = 实际伤害的 50%");
        me.remove_status("wushen_yinghuo");
        me.mp = 0; hit(me, npcTarget()); assert.strictEqual(me.mp, 0, "状态结束后不再吸收");
    },
    "地候：暴击判定之后追加 2% 最大气血伤害"() {
        const me = mkUser(); wear(me, "eq/lv6/wushen/dihou_axe");
        let t = npcTarget(); const calls = []; const orig = t.damage;
        t.damage = function (sh, from, diff_fy) { calls.push(sh); return orig.call(this, sh, from, diff_fy); };
        hit(me, t, { bj: 1000 });
        assert.ok(calls.includes(Math.floor(t.max_hp * 2 / 100)), "暴击时追加 2% 最大气血");
        t = npcTarget(); calls.length = 0; t.damage = function (sh, from, diff_fy) { calls.push(sh); return orig.call(this, sh, from, diff_fy); };
        hit(me, t, { bj: -1000 });
        assert.ok(!calls.includes(Math.floor(t.max_hp * 2 / 100)), "不暴击不追加");
    },
    "长庚：拳套普攻叠战意，叠满后刷新持续时间"() {
        const me = mkUser(); wear(me, "eq/lv6/wushen/changgeng_glove");
        for (let i = 0; i < 5; i++) hit(me, npcTarget());
        assert.strictEqual(me.query_status("wushen_changgeng"), 5, "普攻叠到 5 层");
        const st = me.status.find(s => s.id === "wushen_changgeng"); const h = st.handler;
        hit(me, npcTarget());
        assert.strictEqual(me.query_status("wushen_changgeng"), 5);
        assert.notStrictEqual(st.handler, h, "满层后刷新计时器");
    },
    "轩辕剑：叠满后刷新持续时间"() {
        const me = mkUser(); const sw = wear(me, "eq/lv6/wushen/xuanyuan_sword");
        const t = npcTarget();
        for (let i = 0; i < 10; i++) sw.do_attack(me, t, {});
        const st = me.status.find(s => s.id === "wushen_xuanyuan"); const h = st.handler;
        assert.strictEqual(st.count, 10);
        sw.do_attack(me, t, {});
        assert.notStrictEqual(st.handler, h, "满层后刷新计时器");
    },
    "蚩尤之血、战神甲：加最大气血"() {
        const me = mkUser(); const base = me.max_hp;
        wear(me, "eq/lv6/wushen/chiyouzhixue"); wear(me, "eq/lv6/wushen/zhanshenjia");
        assert.strictEqual(me.query_prop("max_hp"), 22000 + 33000);
        assert.ok(me.max_hp > base + 50000);
    },
    "盘古斧：冷却变长；NPC 攻击也降低并在结束后恢复"() {
        const me = mkUser(); const axe = wear(me, "eq/lv6/wushen/pangu_axe");
        const t = npcTarget(); const gj = t.gj;
        axe.do_attack(me, t, {});
        assert.ok(t.query_prop("distime_per") < 0, "冷却缩减为负 = 冷却变长");
        assert.strictEqual(t.gj, gj - Math.floor(gj * 0.3), "NPC 攻击降低 30%");
        axe.do_attack(me, t, {});
        assert.strictEqual(t.gj, gj - Math.floor(gj * 0.3), "重复命中不重复扣");
        t.remove_status("wushen_pangu");
        assert.strictEqual(t.gj, gj, "状态结束恢复");
        const p = mkUser(); axe.do_attack(me, p, {});
        assert.strictEqual(p.query_prop("gj_per"), -30, "玩家仍走 gj_per");
    },
    "太阴：冷却变长，没目标不扣冷却"() {
        const me = mkUser(); const th = wear(me, "eq/lv6/wushen/taiyin_throw");
        assert.strictEqual(th.on_use(me), false);
        const t = npcTarget(); engage(me, t);
        assert.strictEqual(th.on_use(me), true);
        assert.strictEqual(t.query_prop("distime_per"), -20);
    },
    "朱雀骨环：18% 血斩杀，否则造成已损失气血 10%"() {
        const me = mkUser(); const w = wear(me, "eq/lv6/wushen/zhuque_wrist");
        assert.strictEqual(w.on_use(me), false, "没目标不扣冷却");
        let t = npcTarget(); engage(me, t);
        t.hp = t.max_hp; assert.strictEqual(w.on_use(me), false, "满血不扣冷却");
        t.hp = t.max_hp / 2; assert.strictEqual(w.on_use(me), true);
        assert.strictEqual(t.hp, t.max_hp / 2 - t.max_hp / 2 * 0.1, "已损失气血的 10%");
        t = npcTarget(); t.die = function () { this._died = true; return true; };
        engage(me, t);
        t.hp = t.max_hp * 0.18; w.on_use(me);
        assert.ok(t.hp <= 0 && t._died, "18% 血斩杀并结算死亡");
    },
    "鹰刀：按几率触发并保留冷却"() {
        const me = mkUser(); const b = wear(me, "eq/lv6/wushen/ying_blade");
        const t = npcTarget();
        withRandom(0.9, () => b.do_attack(me, t, {}));
        assert.ok(!t.query_status("wushen_ying") && !me.query_temp("wushen_ying_cd"), "未中几率不触发");
        withRandom(0.1, () => b.do_attack(me, t, {}));
        assert.ok(t.query_status("wushen_ying") && me.query_temp("wushen_ying_cd"), "触发并进入冷却");
    },
    "女娲石：只复活同房间队友，没人可复活不扣冷却"() {
        const room = ROOM.Get(DEFAULT_ROOM);
        const me = mkUser(); const st = wear(me, "eq/lv6/wushen/nvwa_jewels");
        me.moveto(room); mute(me);
        assert.strictEqual(st.on_use(me), false, "没有队友");
        const mate = mkUser(); const other = mkUser();
        for (const p of [mate, other]) { p.moveto(room); mute(p); p.hp = 0; p.mp = 0; p.environment = room; }
        me.team = [me, mate]; mate.team = me.team;
        assert.strictEqual(st.on_use(me), true);
        assert.ok(mate.hp > 0 && mate.msgs.some(m => m.indexOf('relive:true') >= 0), "队友复活并收到客户端复活消息");
        assert.strictEqual(other.hp, 0, "非队友不复活");
        assert.strictEqual(st.on_use(me), false, "再用时没人可复活，不扣冷却");
        room.no_relive = true; mate.hp = 0;
        try { assert.strictEqual(st.on_use(me), false, "no_relive 房间不能用"); } finally { delete room.no_relive; }
    },
    "失败分支返回 false：太岁、缚神索"() {
        const me = mkUser(); const sw = wear(me, "eq/lv6/wushen/taisui_sword");
        const hp = me.hp; assert.strictEqual(sw.on_use(me), false); assert.strictEqual(me.hp, hp, "没目标不消耗气血");
        const me2 = mkUser(); const waist = wear(me2, "eq/lv6/wushen/fushen_waist");
        me2.moveto(ROOM.Get(DEFAULT_ROOM)); mute(me2);
        assert.strictEqual(waist.on_use(me2), false, "没敌人");
    },
    "覆雨剑：追加伤害并入正常伤害流程"() {
        const me = mkUser(); const sw = wear(me, "eq/lv6/wushen/fuyu_sword");
        const t = npcTarget();
        assert.strictEqual(withRandom(0.1, () => sw.do_attack(me, t, {})), Math.floor(me.gj * 0.3));
        assert.strictEqual(t.hp, t.max_hp, "不再直接扣血");
    },
    "周年庆微章：下线、死亡后按剩余时间恢复"() {
        let me = mkUser("wz1"); const w = wear(me, "eq/lv6/wushen/weizhang_jewels");
        assert.strictEqual(w.on_use(me), true);
        assert.ok(me.query_status("wushen_weizhang"));
        me = relog(me);
        assert.ok(me.query_status("wushen_weizhang"), "下线再登录仍在");
        const st = me.status.find(s => s.id === "wushen_weizhang");
        assert.ok(st.duration > 86000000 && st.duration <= 86400000, "按剩余时间");
        me.clear_status(); assert.ok(!me.query_status("wushen_weizhang"));
        me.restore_item_buffs();
        assert.ok(me.query_status("wushen_weizhang"), "死亡清掉后复活可恢复");
    },
    "神力丸 / 风行丹 / 飞燕丹：各自的状态，不互相顶掉"() {
        const a = OBJ.CREATE("drug/buff#10"), b = OBJ.CREATE("drug/buff#11"), c = OBJ.CREATE("drug/buff#12");
        assert.strictEqual(a.name, "神力丸"); assert.strictEqual(b.name, "风行丹"); assert.strictEqual(c.name, "飞燕丹");
        const me = mkUser();
        a.on_use(me); c.on_use(me);
        assert.strictEqual(me.query_prop("str"), 50); assert.strictEqual(me.query_prop("dex"), 50);
    },
    "聚气丹、熊胆：不超过内力上限"() {
        const me = mkUser(); me.max_mp = me.limit_mp - 5;
        OBJ.CREATE("drug/max_mp#4").on_use(me);
        assert.strictEqual(me.max_mp, me.limit_mp);
        me.max_mp = me.limit_mp - 5; OBJ.CREATE("drug/xiongdan").on_use(me);
        assert.strictEqual(me.max_mp, me.limit_mp);
    },
    "练功类武神装备：练习/打坐效率生效"() {
        const me = mkUser(); wear(me, "eq/lv5/wushen/liangong_cloth");
        assert.strictEqual(me.query_prop("lianxi_per"), 17); assert.strictEqual(me.query_prop("dazuo_per"), 17);
        assert.strictEqual(me.query_prop("practice_per"), 0);
    },
    "锻造旧词条映射到生效属性"() {
        const me = mkUser();
        const o = OBJ.CREATE("eq/cp#cloth");
        o.load_db(["eq/cp#cloth", "cpx", 0, "custom", "words", ["bj_resist_per", 2, "ignore_busy_per", 1, "debuff_resist_per", 1]]);
        o.on_load(me);
        assert.deepStrictEqual(o.words.map(w => w.key), ["diff_bj_per", "diff_busy_per", "diff_downside_per"]);
        assert.ok(o.prop.diff_bj_per > 0 && o.prop.diff_busy_per > 0 && o.prop.diff_downside_per > 0);
        assert.ok(!o.prop.bj_resist_per && !o.prop.ignore_busy_per);
        const dz = WORLD.COMMANDS.duanzao;
        assert.ok(dz.PROPS.diff_bj_per && !dz.PROPS.bj_resist_per);
    },
    "套装：三件档与五件档累计；不同门派不凑件；登录后一致"() {
        let me = mkUser("grp1");
        const emei = ["head", "cloth", "shoes", "waist", "wrist"].map(p => "eq/lv5/emei/" + p);
        const grant = u => u._group_grants["mp_set_lv5@EMEI"] || {};
        emei.slice(0, 3).forEach(p => wear(me, p));
        assert.deepStrictEqual(grant(me), { con: 100 }, "三件档");
        emei.slice(3).forEach(p => wear(me, p));
        assert.deepStrictEqual(grant(me), { con: 100, hp_per: 10, diff_fy_per: 10 }, "五件时三件档仍在");
        const norm = p => JSON.stringify(Object.keys(p).filter(k => p[k]).sort().map(k => [k, p[k]]));
        const props = norm(me.prop);
        me = relog(me);
        assert.strictEqual(norm(me.prop), props, "登录后与穿戴时一致");
        me.unequip(me.equipment.find(o => o && o.path === "eq/lv5/emei/wrist"));
        assert.deepStrictEqual(grant(me), { con: 100 }, "卸一件回到三件档");
        // 混搭不同门派
        const mix = mkUser();
        ["eq/lv5/emei/head", "eq/lv5/emei/cloth", "eq/lv5/wudang/shoes", "eq/lv5/wudang/waist", "eq/lv5/huashan/wrist"].forEach(p => wear(mix, p));
        assert.ok(Object.values(mix._group_grants).every(g => !g || !Object.keys(g).length), "混搭凑不出三件档");
        // 描述高亮两档
        const desc = me.equipment.find(o => o && o.path === "eq/lv5/emei/head").get_desc(me);
        assert.ok(/三件套/.test(desc) && /五件套/.test(desc) && !/四件套/.test(desc));
        // 龙纹套
        const lm = mkUser();
        ["lm_cloth", "lm_jian", "lm_pei", "lm_pifeng"].forEach(p => wear(lm, "eq/lv2/" + p));
        const baseInt = lm.equipment.reduce((sum, o) => sum + ((o && o.prop && o.prop.int) || 0), 0);
        assert.strictEqual(lm.query_prop("int"), baseInt + 10, "4 件拿到三件档");
        ["lm_shoes", "lm_tou"].forEach(p => wear(lm, "eq/lv2/" + p));
        assert.strictEqual(lm._group_grants[Object.keys(lm._group_grants)[0]].lianxi_per, 15, "6 件拿到五件档");
    },
    "采药效率、挖矿效率生效；移山镐可在后院挖矿"() {
        // 采药：效率高时第二次抽取取较好的一株
        const me = mkUser(); wear(me, "eq/lv6/wushen/shennong_jewels");
        let state = null; me.set_state = s => { state = s; };
        me.environment = { can_caiyao: true, is: () => false };
        WORLD.COMMANDS.caiyao.enter(me);
        const got = []; me.add_obj = p => { got.push(p); return null; }; me.add_exp = () => {};
        let seq = [0, 0.999]; let k = 0;
        const rnd = me.random; me.random = n => Math.floor(seq[(k++) % 2] * n);
        withRandom(0.5, () => state.on_enter.call(state, me));
        me.random = rnd;
        assert.strictEqual(got[0], "res/cao#17", "神农百草经重抽并取较好的一株");
        // 挖矿
        const m = mkUser(); wear(m, "eq/lv6/wushen/yishan_pick");
        m.is_in = p => p === "home/huayuan";
        let ws = null; m.set_state = s => { ws = s; };
        WORLD.COMMANDS.wk.enter(m);
        assert.ok(ws, "移山镐可在自家后院挖矿（无观山诀）");
        const g2 = []; m.add_obj = p => { g2.push(p); return null; }; m.add_exp = () => {};
        m.random = () => 1; // st/st_red#0
        withRandom(0.01, () => ws.on_enter.call(ws, m));
        assert.strictEqual(g2[0], "st/st_red#1", "宝石成色提升一级");
    },
    "钓鱼竿、钓棍可以钓鱼"() {
        for (const p of ["eq/lv5/wushen/diaoyu_rod", "eq/lv2/gun"]) {
            const me = mkUser(); wear(me, p);
            me.environment = { can_diaoyu: true };
            WORLD.COMMANDS.diaoyu.enter(me);
            assert.ok(!me.msgs.some(m => m.indexOf("没有装备钓竿") >= 0), p + " 被认作钓竿");
            assert.ok(me.msgs.some(m => m.indexOf("鱼饵") >= 0), "进入下一步检查鱼饵");
        }
    },
    "擂台/排行镜像：max_mp 不重复计算装备"() {
        const me = mkUser(); wear(me, "eq/lv5/xiaoyao/head");
        const npc = WORLD.COMMANDS.biwu.create_npc(me);
        assert.strictEqual(npc.max_mp, me.max_mp, "镜像内力与本人一致");
    },
};

require("./zhenyi_sim/boot.js")().then(() => {
    let fail = 0;
    for (const name in tests) {
        try { tests[name](); console.log("  ✓ " + name); }
        catch (e) { fail++; console.log("  ✗ " + name + "\n    " + (e && e.stack || e).split("\n").slice(0, 4).join("\n    ")); }
    }
    if (fail) { console.log("test_eq_fixes2: " + fail + " failed"); process.exit(1); }
    console.log("test_eq_fixes2: all passed");
    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
