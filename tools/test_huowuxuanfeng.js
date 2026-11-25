"use strict";
// 火舞旋风（原天地同寿）回归测试：改名迁移、面板、被动「火舞」、火云漫天、天地同寿。
// 运行：node tools/test_huowuxuanfeng.js
const assert = require("assert");
let failed = 0, passed = 0;
function check(name, fn) {
    try { fn(); passed++; }
    catch (e) { failed++; console.error("✗ " + name + "\n   " + ((e && e.stack) || e).split("\n").slice(0, 4).join("\n   ")); }
}
function mkUser(id) {
    const me = new USER();
    me.id = id || ("p" + Math.random().toString(36).slice(2, 8)); me.name = "测试"; me.userid = 1;
    me.gender = 1; me.age = 30; me.level = 5; me.exp = 1e12; me.pot = 1e12;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.settings = {};
    me.equipment = [null, null, null, null, null, null, null, null, null, null, null];
    me.skills = {}; me.custom_skills = []; me.status = [];
    me.family = FAMILIES.NONE; me.limit_mp = 100000; me.log = [];
    for (const k of ["notify", "notify_fail", "send", "send_room", "send_combat"]) me[k] = function (t) { this.log.push(String(t)); return false; };
    me.send_commands = () => {}; me.notify_hp = () => {}; me.status_changed = () => {};
    me.init_skill(); me.recount(); me.max_hp = me.hp = 1e6;
    return me;
}
const st = (ch, id) => (ch.status || []).find(s => s.id === id);
const SK = () => SKILL.get("huowuxuanfeng");

async function main() {
    check("火舞旋风：5 品剑法，剑法/招架面板", () => {
        const sk = SK();
        assert.ok(sk && sk.grade === 5 && sk.can_enables.join() === "sword,parry");
        const p = sk.query_enable_prop(1000);
        assert.ok(p.sword.gj === 2010 && p.sword.mz === 2010 && p.sword.str === 200 && p.sword.gjsd_per === 8 && p.sword.desc);
        assert.ok(p.parry.zj === 2010 && p.parry.dex === 200);
        assert.deepStrictEqual(Object.keys(sk.pfm).sort(), ["huoyun", "tianditongshou"]);
    });
    check("旧 id tianditongshou 迁移：技能改名，原先装在拳脚上的解除，技能组跟着改", () => {
        assert.strictEqual(SKILL.get("tianditongshou"), SK());
        const me = mkUser();
        me.skills = { unarmed: { level: 800, exp: 0, enable_skill: "tianditongshou" }, sword: { level: 800, exp: 0 }, tianditongshou: { level: 1500, exp: 3, unarmed: true } };
        me.sk_groups = [["tianditongshou", "", ""]];
        me.init(); me.recount();
        assert.ok(!me.skills.tianditongshou && me.skills.huowuxuanfeng.level === 1500);
        assert.ok(!me.skills.unarmed.enable_skill, "拳脚上的装备关系解除");
        assert.ok(!me.skills.huowuxuanfeng.unarmed);
        assert.strictEqual(me.sk_groups[0][0], "huowuxuanfeng");
        const bk = OBJ.CREATE("book/book#tianditongshou"); assert.strictEqual(bk.path, "book/book#huowuxuanfeng");
    });
    check("被动火舞：满血时平 A 基础伤害翻倍，半血 +50%，投掷不吃", () => {
        const me = mkUser(); me.gj = 1000;
        assert.strictEqual(SK().on_attack(me, null, {}), 1000);
        me.hp = me.max_hp / 2; assert.strictEqual(SK().on_attack(me, null, {}), 500);
        assert.strictEqual(SK().on_attack(me, null, { gj: 3000 }), 1500, "绝招指定的攻击力也按比例");
        assert.strictEqual(SK().on_attack(me, null, { is_throwing: true }), 0);
    });
    check("火云漫天：火舞状态 攻速/攻击 +(15+lv/150)%（1000 级 21%、12 秒），每次攻击回 1% 最大气血，并出一剑", () => {
        const me = mkUser(), t = mkUser(); const calls = []; me.do_attack = p => { calls.push(p); return 1; }; me.end_attack = () => {};
        SK().pfm.huoyun.use(me, t, 1000);
        const s = st(me, "huowu"); assert.ok(s && s.prop.gjsd_per === 21 && s.prop.gj_per === 21 && s.duration === 12000);
        assert.strictEqual(calls.length, 1);
        me.hp = me.max_hp / 2; s.on_attack_over(me, t, {}, 1); assert.strictEqual(me.hp, me.max_hp / 2 + me.max_hp / 100);
    });
    check("火云漫天：无剑·无招不持剑施展（攻击技能不是火舞）时补算被动；手持剑时不重复", () => {
        const me = mkUser(), t = mkUser(); const calls = []; me.do_attack = p => { calls.push(p); return 1; }; me.end_attack = () => {};
        me.gj = 1000; me.add_status = x => { me.status.push(x); }; me.query_used_skill = () => SK();  // 测试替身的 recount 会把 max_hp 算成 NaN，这里不走 recount me.attack_skill = SKILL.get("unarmed") || null;
        SK().pfm.huoyun.use(me, t, 1000); assert.strictEqual(calls[0].gj, 2000, "满血翻倍");
        me.status.length = 0;
        me.attack_skill = SK(); SK().pfm.huoyun.use(me, t, 1000); assert.strictEqual(calls[1].gj, undefined);
    });
    check("天地同寿：自身气血扣到 1，敌人受等量伤害，双方虚弱 60 秒；敌人死了不挂", () => {
        const me = mkUser(), t = mkUser(); me.end_attack = () => {}; me.roll_hit = () => true;
        me.hp = 300000; t.max_hp = t.hp = 1e6; t.fy = 0; t.diff_sh_per = 0;
        SK().pfm.tianditongshou.use(me, t, 1000);
        assert.strictEqual(me.hp, 1); assert.strictEqual(t.hp, 1e6 - 299999);
        // 吃伤害减免：50% 免伤只受一半
        const mr = mkUser(), tr = mkUser(); mr.end_attack = () => {}; mr.roll_hit = () => true;
        mr.hp = 200001; tr.max_hp = tr.hp = 1e6; tr.fy = 0; tr.diff_sh_per = 50;
        SK().pfm.tianditongshou.use(mr, tr, 1000);
        assert.strictEqual(tr.hp, 1e6 - 100000, "伤害减免生效");
        // 吃护盾：护盾先吸收
        const ms = mkUser(), ts = mkUser(); ms.end_attack = () => {}; ms.roll_hit = () => true;
        ms.hp = 100001; ts.max_hp = ts.hp = 1e6; ts.fy = 0; ts.diff_sh_per = 0;
        ts.status.push({ id: "test_shield", shield: 1e9, prop: {} });
        SK().pfm.tianditongshou.use(ms, ts, 1000);
        assert.strictEqual(ts.hp, 1e6, "护盾吸收全部伤害");
        const a = st(me, "xuruo"), b = st(t, "xuruo");
        assert.ok(a && b && a.duration === 60000 && ["gj_per","mz_per","fy_per","ds_per","zj_per"].every(k => a.prop[k] === -90));
        const me2 = mkUser(), t2 = mkUser(); me2.end_attack = () => {}; me2.roll_hit = () => true; me2.hp = 500000; t2.hp = 1000; t2.max_hp = 1e6;
        SK().pfm.tianditongshou.use(me2, t2, 1000);
        assert.ok(t2.hp <= 0 && !st(t2, "xuruo") && st(me2, "xuruo"));
        const me3 = mkUser(), t3 = mkUser(); me3.end_attack = () => {}; me3.hp = 1; const h = t3.hp;
        SK().pfm.tianditongshou.use(me3, t3, 1000); assert.strictEqual(t3.hp, h, "只剩 1 点血时放不出");
    });
    check("天地同寿：普通命中判定，被闪开也扣到 1 血、自己虚弱，敌人不挂；冷却固定 120 秒不吃冷却缩减", () => {
        const me = mkUser(), t = mkUser(); me.end_attack = () => {}; me.mz = 10; t.ds = t.zj = 1e9; me.hp = 300000; const h = t.hp;
        SK().pfm.tianditongshou.use(me, t, 1000);
        assert.ok(me.hp === 1 && t.hp === h && st(me, "xuruo") && !st(t, "xuruo"), "命中远低于闪避时落空，但气血照扣");
        assert.ok(me.log.some(x => x.includes("我跟你们拼了")), "出招描述");
        t.ds = t.zj = 0; me.mz = 1e9; assert.ok(me.roll_hit(t, {}), "命中远高于闪避招架时命中");
        const p = SK().pfm.tianditongshou; me.query_prop = () => 99;
        assert.strictEqual(p.query_distime(me, 1000), 120000);
        assert.strictEqual(SK().pfm.huoyun.query_distime(me, 1000), 4000, "火云漫天照常吃冷却缩减");
    });
    console.log((failed ? "火舞旋风测试失败 " : "火舞旋风测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
