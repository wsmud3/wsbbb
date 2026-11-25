"use strict";
// 杀手楼进阶技能（穿心掌/杀生决/漫天花雨/踏雪寻梅 2）与辟邪剑法改名迁移的回归测试。
// 运行：node tools/test_shashou_adv.js
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
// do_attack 替身：hit=true 命中，false 被闪避
function spy(a, hit) { const calls = []; a.do_attack = p => { calls.push(p); if (!hit) p.is_dodge = true; return hit ? 1000 : 0; }; a.end_attack = () => {}; return calls; }
const st = (ch, id) => (ch.status || []).find(s => s.id === id);
const P = (sk, p) => SKILL.get(sk).pfm[p];

async function main() {
    check("四门进阶技能：1000 级面板与给定数值一致，挂在杀手楼门派进阶池", () => {
        const e = id => SKILL.get(id).query_enable_prop(1000);
        assert.deepStrictEqual(e("chuanxinzhang2"), { unarmed: { gj: 1720, bj_per: 4, mz: 1710 }, parry: { zj: 1420, ds: 1420, dex: 144 } });
        const f = e("shashengjue2").force; assert.ok(f.gj === 2002 && f.mz === 2001 && f.add_bjsh_per === 4 && f.limit_mp === 160000);
        assert.strictEqual(SKILL.get("shashengjue2").force_rad, 0.75);
        assert.deepStrictEqual(e("mantianhuayu2"), {
            throwing: { gj: 1504, mz: 1504, mz_per: 9, add_sh_per: 9, diff_fy_per: 9 },
            sword: { gj: 1504, mz: 1504, bj_per: 10, diff_busy_per: 9, add_bjsh_per: 9 } });
        assert.strictEqual(SKILL.get("mantianhuayu2").query_enable_prop(1300).throwing.add_sh_per, 10, "百分比项每 300 级 +1%");
        assert.strictEqual(SKILL.get("shashengjue2").query_enable_prop(1300).force.add_bjsh_per, 5, "暴击伤害每 300 级 +1%");
        assert.strictEqual(SKILL.get("mantianhuayu2").query_prop(1000).bj_per, 8);
        assert.deepStrictEqual(e("taxuexunmei2"), { dodge: { ds: 2100, mz: 1710, dex: 510, bj_per: 4 } });
        for (const id of ["chuanxinzhang2", "shashengjue2", "mantianhuayu2", "taxuexunmei2"]) {
            const s = SKILL.get(id); assert.strictEqual(s.family, FAMILIES.SHASHOU); assert.strictEqual(s.source_skill, id.replace(/2$/, ""));
            assert.ok((FAMILIES.SHASHOU.skills2 || []).includes(s), id + " 在门派进阶池");
        }
        assert.strictEqual(SKILL.get("chuanxinzhang2").grade, 4); assert.strictEqual(SKILL.get("shashengjue2").grade, 4);
        assert.strictEqual(SKILL.get("mantianhuayu2").grade, 5); assert.strictEqual(SKILL.get("taxuexunmei2").grade, 5);
        const me = mkUser();
        for (const [s, p] of [["chuanxinzhang2", "chuan"], ["mantianhuayu2", "luo"]]) assert.strictEqual(P(s, p).query_releasetime(me, 1000), 4000, s + " 出招 4 秒");
        assert.strictEqual(P("mantianhuayu2", "wu").query_releasetime(me, 1000), 500, "定影出招 0.5 秒");
        assert.strictEqual(P("chuanxinzhang2", "chuan").query_mp(me, 1000), 1020); assert.strictEqual(P("taxuexunmei2", "power").query_mp(me, 1000), 1530);
    });
    check("掌心雷：200% 攻击，命中才昏迷；1 秒 + 每 300 级 1 秒，上限 7 秒", () => {
        const a = mkUser(), b = mkUser(); let c = spy(a, true);
        P("chuanxinzhang2", "chuan").use(a, b, 1000);
        assert.strictEqual(c[0].gj, a.gj * 2); assert.strictEqual(st(b, "faint").duration, 4000);
        b.status = []; P("chuanxinzhang2", "chuan").use(a, b, 5000); assert.strictEqual(st(b, "faint").duration, 7000, "上限 7 秒");
        const d = mkUser(); spy(a, false); P("chuanxinzhang2", "chuan").use(a, d, 1000); assert.ok(!st(d, "faint"), "被闪避不昏迷");
    });
    check("斩杀：1000 级攻击 +30%、暴击 +33%（每 100 级 +1%），1 秒 + 每 200 级 1 秒、无上限；隐杀保留", () => {
        const a = mkUser(), b = mkUser();
        P("shashengjue2", "power").use(a, b, 1000);
        const s = st(a, "force"); assert.ok(s && s.duration === 6000 && s.prop.gj_per === 30 && s.prop.bj_per === 33);
        a.status = []; P("shashengjue2", "power").use(a, b, 3000);
        const s3 = st(a, "force"); assert.ok(s3.duration === 16000 && s3.prop.gj_per === 50 && s3.prop.bj_per === 53, JSON.stringify(s3.prop) + " " + s3.duration);
        assert.ok(P("shashengjue2", "tuoli") && P("shashengjue2", "tuoli").no_auto, "隐杀");
    });
    check("落花：每 5% 暴击多一击（上限 10），每多一击命中 +5%；定影必中", () => {
        const a = mkUser(), b = mkUser(); let c = spy(a, true);
        a.bj = 23; P("mantianhuayu2", "luo").use(a, b, 1000);
        assert.strictEqual(c.length, 5); assert.strictEqual(c[0].mz, parseInt(a.mz * 1.2));
        c.length = 0; a.bj = 200; P("mantianhuayu2", "luo").use(a, b, 1000); assert.strictEqual(c.length, 10, "最多 10 次");
        P("mantianhuayu2", "wu").use(a, b, 1000); assert.ok(st(b, "rash") && st(b, "rash").duration === 8000);
        const d = mkUser(); spy(a, false); P("mantianhuayu2", "wu").use(a, d, 1000); assert.ok(st(d, "rash"), "定影必中：这一击被闪开也定身");
        c = spy(a, true); P("mantianhuayu2", "luo").use(a, b, 1000, "sword"); assert.ok(c.every(x => x.is_throwing === false), "剑法位落花");
    });
    check("无痕：免疫控制 + 躲闪 (20+lv/100)%，3 秒 + 每 200 级 1 秒，上限 8 秒", () => {
        const a = mkUser(), b = mkUser();
        P("taxuexunmei2", "power").use(a, b, 500);
        const s = st(a, "dodge"); assert.ok(s && s.duration === 5000 && s.prop.ds_per === 25);
        a.status = []; P("taxuexunmei2", "power").use(a, b, 3000); assert.strictEqual(st(a, "dodge").duration, 8000);
        assert.ok(a.ig_control > 0, "免疫控制");
    });
    check("门派进阶：杀手楼弟子的穿心掌 1000 级用门派进阶残页进阶为穿心掌（进阶）", () => {
        const me = mkUser(); me.family = FAMILIES.SHASHOU;
        me.skills.unarmed = { level: 1000, exp: 0 }; me.skills.chuanxinzhang = { level: 1000, exp: 0 };
        me.init_skill(); me.recount();
        OBJ.clone_to("book/up", me, 1000);
        WORLD.COMMANDS.lingwu.enter(me, "chuanxinzhang", "ss", "0");
        assert.ok(me.skills.chuanxinzhang2, "学会进阶版：" + me.log.slice(-3).join(" | "));
    });
    check("辟邪剑法 id 改为 bixiejianfa：旧存档的技能、装备关系、技能组、残页都迁移", () => {
        assert.ok(SKILL.get("bixiejianfa") && SKILL.get("bixiejianfa").id === "bixiejianfa");
        assert.strictEqual(SKILL.get("pixiejianfa"), SKILL.get("bixiejianfa"), "旧 id 兼容");
        const me = mkUser();
        me.skills = { sword: { level: 800, exp: 0, enable_skill: "pixiejianfa" }, parry: { level: 800, exp: 0 }, pixiejianfa: { level: 1500, exp: 7, sword: true } };
        me.sk_groups = [["pixiejianfa", "", ""]];
        me.init(); me.recount();
        assert.ok(!me.skills.pixiejianfa && me.skills.bixiejianfa.level === 1500 && me.skills.bixiejianfa.exp === 7);
        assert.strictEqual(me.skills.sword.enable_skill, "bixiejianfa");
        assert.strictEqual(me.sk_groups[0][0], "bixiejianfa");
        const old = OBJ.CREATE("book/bc#pixiejianfa"), neu = OBJ.CREATE("book/bc#bixiejianfa");
        assert.ok(old.skill === "bixiejianfa" && old.path === neu.path, "旧残页归一到新 id：" + old.path);
        const bk = OBJ.CREATE("book/book#pixiejianfa"); assert.strictEqual(bk.path, "book/book#bixiejianfa");
        const src = ["world/area/fb1/fb25.js", "world/npc/hmy/dongfangbubai.js", "world/obj/eq/lv4/xiuhuazhen.js"].map(f => require("fs").readFileSync(__dirname + "/../" + f, "utf8")).join("");
        assert.ok(!/pixiejianfa/.test(src), "掉落、东方不败、绣花针都改用新 id");
    });
    console.log((failed ? "杀手楼进阶测试失败 " : "杀手楼进阶测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
