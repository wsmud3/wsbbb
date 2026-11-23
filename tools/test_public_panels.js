"use strict";
// 太玄功 / 玄虚步 / 七弦无形剑 按 1000 级面板对齐后的回归测试。运行：node tools/test_public_panels.js
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
    me.init_skill(); me.recount(); me.max_hp = me.hp = 1e9;
    return me;
}
const P = (sk, p) => SKILL.get(sk).pfm[p];
const st = (ch, id) => (ch.status || []).find(s => s.id === id);
async function main() {
    const me = mkUser();
    const meta = (sk, p) => { const x = P(sk, p); return [x.query_mp(me, 1000), x.query_releasetime(me, 1000), x.query_distime(me, 1000)]; };
    check("太玄功：面板数值、绝招内力 918 / 出招 4 秒 / 冷却 30、45 秒", () => {
        const f = SKILL.get("taixuangong").query_enable_prop(1000).force;
        assert.ok(f.gj === 2100 && f.add_sh_per === 8 && f.diff_busy === 4 && f.limit_mp === 286000 && /4000内功伤害/.test(f.desc));
        assert.strictEqual(SKILL.get("taixuangong").force_rad, 0.8);
        assert.deepStrictEqual(meta("taixuangong", "shibu"), [918, 4000, 30000]);
        assert.deepStrictEqual(meta("taixuangong", "baishou"), [918, 4000, 45000]);
        assert.ok(/13秒内/.test(P("taixuangong", "baishou").query_desc(me, 1000)));
    });
    check("太玄功：命中附加 4000 内功伤害（被招架也有、被闪避没有），白首太玄期间加倍", () => {
        const sk = SKILL.get("taixuangong"); const a = mkUser(), b = mkUser();
        a.skills.taixuangong = { level: 1000, exp: 0 }; const hits = [];
        b.damage = (n) => { hits.push(n); return n; };
        sk.on_force_over(a, b, { is_dodge: false }, 100); sk.on_force_over(a, b, { is_parry: true }, 0); sk.on_force_over(a, b, { is_dodge: true }, 0);
        assert.deepStrictEqual(hits, [4000, 4000]);
        P("taixuangong", "baishou").use(a, b, 1000);
        const s = st(a, "force"); assert.ok(s && s.taixuan_double && !(s.prop && s.prop.add_sh_per), "白首太玄不再给最终伤害");
        sk.on_force_over(a, b, {}, 100); assert.strictEqual(hits[2], 8000, "加倍");
    });
    check("玄虚步：面板数值；幻影内力 918 / 出招 0.5 秒 / 冷却 45 秒；反击没有冷却", () => {
        const d = SKILL.get("xuanxubu").query_enable_prop(1000).dodge;
        assert.ok(d.ds === 2100 && d.dex === 251 && d.ds_per === 4 && /反击/.test(d.desc));
        assert.deepStrictEqual(meta("xuanxubu", "pfm1"), [918, 500, 45000]);
        assert.ok(/15%的躲闪.*15%/.test(P("xuanxubu", "pfm1").query_desc(me, 1000)));
        const a = mkUser(), b = mkUser(); a.skills.xuanxubu = { level: 1000, exp: 0 }; let n = 0;
        a.do_attack = () => { n++; return 1; }; a.end_attack = () => {};
        assert.ok(!SKILL.get("xuanxubu").on_dodge, "不再挂在「没躲开」时调用的 on_dodge 上");
        for (let i = 0; i < 3; i++) SKILL.get("xuanxubu").on_dodge_success(a, b, {});
        assert.strictEqual(n, 3, "连续躲闪每次都反击");
        SKILL.get("xuanxubu").on_dodge_success(a, b, { is_counter: true }); assert.strictEqual(n, 3, "对方的反击不再反击");
    });
    check("七弦无形剑：grade 4、只装剑法；面板数值；七绝音 7 击、魔音贯耳命中降防御躲闪 30% 12 秒", () => {
        const s = SKILL.get("qixianwuxingjian"); assert.strictEqual(s.grade, 4);
        assert.deepStrictEqual(s.can_enables, ["sword"]);
        const w = s.query_enable_prop(1000).sword; assert.ok(w.gj === 1320 && w.mz === 1620 && w.dex === 108 && /音波/.test(w.desc));
        assert.deepStrictEqual(meta("qixianwuxingjian", "qijueyin"), [2754, 4000, 36000]);
        assert.deepStrictEqual(meta("qixianwuxingjian", "moyin"), [3672, 4000, 47000]);
        const a = mkUser(), b = mkUser(); const calls = [];
        a.do_attack = p => { calls.push(p); return 1; }; a.end_attack = () => {};
        P("qixianwuxingjian", "qijueyin").use(a, b, 1000); assert.strictEqual(calls.length, 7);
        P("qixianwuxingjian", "moyin").use(a, b, 1000);
        const m = st(b, "qixian_moyin"); assert.ok(m && m.duration === 12000 && m.prop.fy_per === -30 && m.prop.ds_per === -30);
        const c = mkUser(); a.do_attack = p => { p.is_dodge = true; return 0; };
        P("qixianwuxingjian", "moyin").use(a, c, 1000); assert.ok(!st(c, "qixian_moyin"), "未命中不降");
    });
    console.log((failed ? "面板对齐测试失败 " : "面板对齐测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
