"use strict";
// P2「与说明不符」第三~五类及追加项回归测试（真实引擎）：
//   命中判断（九阳真焰、刺目、燃木刀法）、说明时长、镇天地取消、闭口禅只禁下一招、不死印法闪避反击、
//   不老长春功年龄往复、枯木/葵花清负面、修罗刀冷却与击杀重置、慈航剑典慈航静斋掉落。
// 运行：node tools/test_skill_p2_misc.js
const assert = require("assert");

let failed = 0, passed = 0;
async function check(name, fn) {
    try { await fn(); passed++; }
    catch (e) { failed++; console.error("✗ " + name + "\n   " + ((e && e.stack) || e).split("\n").slice(0, 4).join("\n   ")); }
}
function mkUser(id) {
    const me = new USER();
    me.id = id || ("t" + Math.random().toString(36).slice(2, 8)); me.name = "测试"; me.userid = 1;
    me.gender = 1; me.age = 30; me.level = 5; me.exp = 1e10; me.pot = 1e10;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.settings = {};
    me.equipment = [null, null, null, null, null, null, null, null, null, null, null];
    me.skills = {}; me.custom_skills = []; me.status = [];
    me.family = FAMILIES.NONE; me.limit_mp = 100000; me.log = []; me.reg_time = Math.floor(Date.now() / 60000) - 60 * 24 * 365;
    me.notify = function (t) { this.log.push(String(t)); return false; };
    me.notify_fail = me.notify; me.send = me.send_room = me.send_combat = function (t) { this.log.push(String(t)); };
    me.send_commands = function () {}; me.notify_hp = function () {}; me.status_changed = function () {};
    return me;
}
function learn(me, map, lv) {
    for (const id of Object.keys(map)) { me.skills[id] = { level: lv, exp: 0 }; if (map[id] && !me.skills[map[id]]) me.skills[map[id]] = { level: lv, exp: 0 }; }
    for (const id in me.skills) { const s = SKILL.get(id); if (s) s.attach_prop(me, lv); }
    for (const id of Object.keys(map)) if (map[id]) me.enable_skill(map[id], id);
    me.max_mp = me.limit_mp + me.query_prop("limit_mp"); me.mp = me.max_mp;
    me.init_skill(); me.recount(); me.hp = me.max_hp;
}
function fight(a, b) { a.fight_type = b.fight_type = 2; a.enemy = [b]; b.enemy = [a]; }
const statusOf = (ch, id) => (ch.status || []).find(s => s.id === id);

async function main() {
    await check("九阳真焰 / 刺目：未命中不挂减益，命中才挂", () => {
        for (const [sk, pid, sid] of [["jiuyangshengong", "zhenyan", "force"], ["pixiejianfa", "cimu", "pixie_shiming"]]) {
            const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
            a.end_attack = () => {};
            a.do_attack = () => 0;
            SKILL.get(sk).pfm[pid].use(a, b, 1000);
            assert.ok(!statusOf(b, sid), sk + " 未命中不应挂状态");
            a.do_attack = () => 100;
            SKILL.get(sk).pfm[pid].use(a, b, 1000);
            assert.ok(statusOf(b, sid), sk + " 命中挂状态");
        }
    });
    await check("燃木刀法：被招架不再翻倍，只在命中时反伤", () => {
        const sk = SKILL.get("ranmudao");
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
        a.set_temp("sk_ranmu", 1000, 60000); a.end_attack = () => {};
        let hp0 = b.hp; sk.on_parry_over(a, b, { is_parry: true });
        assert.strictEqual(b.hp, hp0, "招架时不反伤");
        sk.on_parry_over(a, b, { is_parry: false });
        assert.strictEqual(hp0 - b.hp, 1000, "命中时反伤 1000（不翻倍）");
    });
    await check("不死印法：闪避成功才幻影反击，没闪开不反击", () => {
        const sk = SKILL.get("busiyinfa");
        assert.ok(!sk.on_dodge && typeof sk.on_dodge_success === "function");
        const a = mkUser(), b = mkUser(); learn(a, { busiyinfa: "dodge" }, 1000); learn(b, {}, 100); fight(a, b);
        a.ds = 1e12;
        let hp0 = b.hp; b.do_attack({ target: a, gj: 100, mz: 1 });
        assert.ok(b.hp < hp0, "闪开后反击");
        a.ds = 0; a.zj = 0; hp0 = b.hp;
        b.do_attack({ target: a, gj: 100, mz: 1e9, no_dodge: true, no_parry: true });
        assert.strictEqual(b.hp, hp0, "被打中不反击");
    });
    await check("阴阳九转·镇天地：1 秒后再次使用可取消（不受冷却限制）", () => {
        const p = SKILL.get("yinyangjiuzhuan").pfm.zhentiandi;
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
        assert.strictEqual(p.try_cancel(a), false, "没有镇守状态时照常出招");
        p.use(a, b, 1000);
        const st = statusOf(a, "yinyang_zhentiandi_buff"); assert.ok(st);
        assert.strictEqual(p.try_cancel(a), true); assert.ok(statusOf(a, "yinyang_zhentiandi_buff"), "1 秒内不能取消");
        st.start_time -= 1500;
        assert.strictEqual(p.try_cancel(a), true); assert.ok(!statusOf(a, "yinyang_zhentiandi_buff"), "已取消");
        assert.ok(/^10秒内/.test(p.query_desc(a, 1000)) && /每秒/.test(p.query_desc(a, 1000)) && /^5秒内/.test(p.query_desc(a, 0)), p.query_desc(a, 1000));
    });
    await check("无念禅功·闭口禅：只禁下一个绝招", () => {
        const a = mkUser(), b = mkUser(); learn(a, { wunianchangong: "force" }, 1000); learn(b, {}, 100); fight(a, b);
        b.max_hp = b.hp = 1e12;
        SKILL.get("wunianchangong").pfm.pfm3.use(a, b, 1000);
        assert.ok(statusOf(b, "bikou"));
        const t = { name: "x", n: 0, query_mp: () => 0, use() { this.n++; return true; } };
        b.use_pfm(a, t, 1, "unarmed"); assert.strictEqual(t.n, 0, "第一招被禁");
        b.use_pfm(a, t, 1, "unarmed"); assert.strictEqual(t.n, 1, "第二招正常");
    });
    await check("不老长春功：年龄加成 -9~+9 往复，正值显得更年长；附加伤害对玩家生效", () => {
        const sk = SKILL.get("bulaochangchungong");
        const exp = { 0: -9, 900: 0, 1799: 8, 1800: 9, 1900: 8, 2700: 0, 3500: -8, 3600: -9, 5400: 9 };
        for (const lv in exp) assert.strictEqual(sk.age_bonus(+lv), exp[lv], "lv" + lv);
        const a = mkUser(); learn(a, {}, 100); const age0 = a.query_age();
        const b = mkUser(); learn(b, { bulaochangchungong: "force" }, 1800);
        assert.ok(Math.abs(b.query_age() - age0 - 9) < 0.01, "1800 级年长 9 岁 " + (b.query_age() - age0));
        const c = mkUser(); learn(c, { bulaochangchungong: "force" }, 3600);
        assert.ok(Math.abs(c.query_age() - age0 + 9) < 0.01, "3600 级年轻 9 岁");
        const par = {}; sk.on_before_attack(b, a, par);
        assert.ok(par.gj > b.gj, "附加伤害生效");
        assert.ok(/年龄：\+9岁/.test(sk.query_enable_prop(1800).force.desc));
    });
    await check("不老长春功·唯我独尊：迟钝真正延长出招与冷却", () => {
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
        a.do_attack = () => 0; a.end_attack = () => {};
        const fake = { distime: 30000, release_time: 3000, __proto__: PERFORM.prototype };
        const r0 = fake.query_releasetime(b, 1), d0 = fake.query_distime(b, 1);
        SKILL.get("bulaochangchungong").pfm.wo.use(a, b, 1000);
        assert.strictEqual(fake.query_releasetime(b, 1) - r0, 3000);
        assert.strictEqual(fake.query_distime(b, 1) - d0, 3000);
    });
    await check("枯木神功 / 葵花神功：清负面一次清掉全部层数且不额外跳伤害", () => {
        for (const sk of ["kumushengong", "kuihuashengong"]) {
            const a = mkUser(); learn(a, {}, 100);
            let ticks = 0;
            for (let i = 0; i < 3; i++) a.add_status({ id: "dot", name: "毒", downside: true, override: 1, duration: 60000, duration_count: 5, prop: { fy: -1 }, on_interval() { ticks++; } });
            assert.strictEqual(a.query_status("dot"), 3);
            SKILL.get(sk).pfm.pfm1.use(a, null, 1000);
            assert.ok(!statusOf(a, "dot"), sk + " 全部清除");
            assert.strictEqual(ticks, 0, sk + " 不触发额外一跳");
        }
    });
    await check("修罗刀：冷却 20 秒、出招 4 秒；修罗炼狱击杀后冷却被重置", async () => {
        const sk = SKILL.get("xiuluodao");
        for (const k of ["lianyu", "liudao"]) {
            assert.strictEqual(sk.pfm[k].distime, 20000); assert.strictEqual(sk.pfm[k].release_time, 4000);
            assert.ok(/冷却20秒，出招4秒/.test(sk.pfm[k].query_desc(mkUser(), 1000)), sk.pfm[k].query_desc(mkUser(), 1000));
        }
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
        a.end_attack = () => {}; a.do_attack = p => { p.target.hp = 0; return 100; };
        sk.pfm.lianyu.use(a, b, 1000);
        a.set_temp("pfm/blade/lianyu", 1, 24000);   // pfm.js 在 use 返回后写入冷却
        assert.ok(a.query_temp("pfm/blade/lianyu"));
        await new Promise(r => setTimeout(r, 5));
        assert.ok(!a.query_temp("pfm/blade/lianyu"), "击杀后冷却已清");
    });
    await check("慈航剑典：慈航静斋（梵清惠）掉落，扫荡同样生效", () => {
        const npc = NPC.CLONE("cihang/fanqinghui");
        assert.ok(JSON.stringify(npc.drop_list).indexOf("bc#cihangjiandian") >= 0);
        const area = WORLD.AREAS.find(a => a.id === "cihang");
        assert.ok(area && area.drop_npcs0.indexOf("cihang/fanqinghui") >= 0 && area.drop_npcs1.indexOf("cihang/fanqinghui") >= 0);
        assert.ok(area.drops.indexOf("book/bc#cihangjiandian") >= 0);
        assert.ok(OBJ.CREATE("book/bc#cihangjiandian"));
    });
    await check("说明里的时长随等级显示", () => {
        const d = (id, p, lv) => SKILL.get(id).pfm[p].query_desc(mkUser(), lv);
        assert.ok(/在30秒内/.test(d("yunlongxinfa", "pfm1", 2000)));
        assert.ok(/在5秒内/.test(d("jinsheyoushenzhang", "pfm1", 2000)));
        assert.ok(/忙乱6秒/.test(d("jinsheyoushenbu", Object.keys(SKILL.get("jinsheyoushenbu").pfm)[0], 5000)));
        assert.ok(/^逆转经脉，20秒内/.test(d("busiyinfa", "nisheng", 2000)));
        assert.ok(/持续10秒/.test(d("liumaishenjian", Object.keys(SKILL.get("liumaishenjian").pfm)[1], 2000)));
    });

    console.log((failed ? "P2 杂项测试失败 " : "P2 杂项测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
