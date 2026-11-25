"use strict";
// P2「数值或公式与说明不符」修复回归测试（2026-11-18 审计，第一类 + 左右互搏 + 掌中之国说明时长）。
// 运行：node tools/test_skill_p2_numbers.js   （进程内加载真实引擎，隔离数据目录，不开端口）
const assert = require("assert");

let failed = 0, passed = 0;
function check(name, fn) {
    try { fn(); passed++; }
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
    me.family = FAMILIES.NONE; me.limit_mp = 100000; me.log = [];
    const log = function (t) { this.log.push(String(t)); return false; };
    me.notify = me.notify_fail = me.send = me.send_room = me.send_combat = log;
    me.send_commands = function () {}; me.notify_hp = function () {}; me.status_changed = function () {};
    return me;
}
function learn(me, map, lv) {
    for (const id of Object.keys(map)) {
        me.skills[id] = { level: lv, exp: 0 };
        if (map[id] && !me.skills[map[id]]) me.skills[map[id]] = { level: lv, exp: 0 };
    }
    for (const id in me.skills) { const s = SKILL.get(id); if (s) s.attach_prop(me, lv); }
    for (const id of Object.keys(map)) if (map[id]) me.enable_skill(map[id], id);
    me.max_mp = me.limit_mp + me.query_prop("limit_mp"); me.mp = me.max_mp;
    me.init_skill(); me.recount(); me.hp = me.max_hp;
}
function fight(a, b) { a.fight_type = b.fight_type = 2; a.enemy = [b]; b.enemy = [a]; }
function statusOf(ch, id) { return (ch.status || []).find(s => s.id === id); }
// 把 do_attack 换成记录参数、按给定结果返回的桩
function stubAttack(me, results) {
    const calls = []; let i = 0;
    me.do_attack = function (par) { calls.push(par); const r = typeof results === "function" ? results(par, i) : (results[i] !== undefined ? results[i] : results[results.length - 1]); i++; return r; };
    me.end_attack = () => {};
    return calls;
}
function pair(map, lv) { const a = mkUser(), b = mkUser(); learn(a, map || {}, lv || 1000); learn(b, {}, 100); fight(a, b); return [a, b]; }

async function main() {
    check("长生诀·震慑：降低敌人终伤 15+lv/100%，仍是增益型状态", () => {
        const [a, b] = pair({ changshengjue: "force" }, 1000);
        const s0 = b.query_prop("add_sh_per");
        SKILL.get("changshengjue").on_new_enemy(a, b);
        const st = statusOf(b, "changsheng_zhenshe");
        assert.ok(st && st.downside === false && !st.no_clear);
        assert.deepStrictEqual(st.prop, { add_sh_hard: 25 });
        assert.strictEqual(b.query_prop("add_sh_per"), s0, "不改终伤本身（不参与软上限）");
        // 硬减：在软上限折算之后整额扣除——例如折算后 97%，震慑 25 → 72%
        b.add_status({ id: "t_ash", name: "测试", duration: 10000, prop: { add_sh_per: 150 } });
        const capped = b._query_soft_prop("add_sh_per");
        assert.ok(Math.abs(b.query_soft_prop("add_sh_per") - (capped - 25)) < 1e-9, "软上限后再减 25");
        assert.ok(/最终伤害降低25%/.test(SKILL.get("changshengjue").query_enable_prop(1000).force.desc));
    });
    check("九阴神功被动：每层 1%", () => {
        const [a, b] = pair({ jiuyinshengong: "force" }, 500);
        const g0 = b.query_prop("gj_per");
        a.force_skill.on_force_over(a, b, {}, 100);
        assert.strictEqual(b.query_prop("gj_per") - g0, -1);
    });
    check("生死符：比例 10+lv/300，10 秒", () => {
        for (const id of ["liuyangzhang", "liuyangzhang2"]) {
            const [a, b] = pair({ [id]: "unarmed" }, 3000);
            stubAttack(a, [100]);
            SKILL.get(id).pfm.zhong.use(a, b, 3000);
            assert.strictEqual(statusOf(b, "liuyang").duration, 10000, id);
            assert.ok(/10秒后爆发/.test(SKILL.get(id).pfm.zhong.query_desc(a, 3000)) && /当前气血20%/.test(SKILL.get(id).pfm.zhong.query_desc(a, 3000)), id);
        }
    });
    check("破玉拳：破玉 +lv+紫霞×2；劈石 lv+600、5+lv/500 秒，被招架不挂", () => {
        for (const id of ["poyuquan", "poyuquan2"]) {
            const [a, b] = pair({ [id]: "unarmed", zixiashengong: "force" }, 1000);
            let calls = stubAttack(a, [1]);
            SKILL.get(id).pfm.po.use(a, b, 1000);
            assert.strictEqual(calls[0].gj, a.gj + 1000 + a.query_skill("zixiashengong", 0) * 2, id);
            calls = stubAttack(a, p => { p.is_dodge = false; p.is_parry = true; return 0; });
            SKILL.get(id).pfm.pi.use(a, b, 1000);
            assert.ok(!statusOf(b, "pishi"), id + " 被招架不挂劈石");
            stubAttack(a, p => { p.is_dodge = false; p.is_parry = false; return 1; });
            SKILL.get(id).pfm.pi.use(a, b, 1000);
            const st = statusOf(b, "pishi");
            assert.strictEqual(st.prop.fy, -1600); assert.strictEqual(st.duration, 7000);
        }
    });
    check("回马枪：命中 +50+lv/50%（中平枪上限 +100%），中平枪后续为突击倍率", () => {
        let [a, b] = pair({ mengguqiangfa: "club" }, 1000);
        let calls = stubAttack(a, [0]);
        SKILL.get("mengguqiangfa").pfm.hui.use(a, b, 1000);
        assert.ok(Math.abs(calls[0].mz - a.mz * 1.7) < 1e-6);
        [a, b] = pair({ zhongpingqiang: "club" }, 1000);
        calls = stubAttack(a, [1, 1]);
        SKILL.get("zhongpingqiang").pfm.hui.use(a, b, 1000);
        assert.ok(Math.abs(calls[0].mz - a.mz * 1.7) < 1e-6);
        assert.ok(Math.abs(calls[1].gj - a.gj * 4) < 1e-6, "突击 200%+lv/5%");
    });
    check("惊雷爆五岳：未命中即中断、不返还内力", () => {
        const [a, b] = pair({ zidianjin2: "force" }, 1000);
        a.max_mp = a.mp = 100000;
        const calls = stubAttack(a, [500, 0, 500]);
        SKILL.get("zidianjin2").pfm.jinglei.use(a, b, 1000);
        assert.strictEqual(calls.length, 2, "第二击未中即停止，也不触发五连额外伤害");
        assert.strictEqual(a.mp, 90000, "未命中那一击的内力不返还");
    });
    check("天打五雷轰：命中才回复等同伤害的内力，不超上限", () => {
        for (const id of ["shenxiaojiumie", "shenxiaojiumie2"]) {
            const [a, b] = pair({ [id]: "staff" }, 1000);
            a.max_mp = 100000; a.mp = 1000;
            stubAttack(a, [300, 0, 0, 0, 0]);
            SKILL.get(id).pfm.wulei.use(a, b, 1000);
            assert.strictEqual(a.mp, 1300, id);
            a.mp = 99990; stubAttack(a, [500]);
            SKILL.get(id).pfm.wulei.use(a, b, 1000);
            assert.strictEqual(a.mp, 100000, id + " 不超上限");
        }
    });
    check("罗汉伏魔：每层 +(1+lv/150)%（1000 级 7%），最多 5 层", () => {
        const [a, b] = pair({ fumozhang: "staff" }, 1000);
        stubAttack(a, [1]);
        const g0 = a.query_prop("gj_per");
        for (let i = 0; i < 7; i++) SKILL.get("fumozhang").pfm.pfm1.use(a, b, 1000);
        assert.strictEqual(a.query_status("luohan_fumo"), 5);
        assert.strictEqual(a.query_prop("gj_per") - g0, 35);
    });
    check("吼仙法：一次性释放，每层 +1000，清空全部层数", () => {
        const [a, b] = pair({ shedaoqigong: "staff" }, 1000);
        for (let i = 0; i < 4; i++) SKILL.get("shedaoqigong").pfm.pfm1.use(a, b, 1000);
        const calls = stubAttack(a, [1]);
        SKILL.get("shedaoqigong").pfm.pfm2.use(a, b, 1000);
        assert.strictEqual(calls.length, 1); assert.strictEqual(calls[0].gj, a.gj + 4000);
        assert.ok(!statusOf(a, "changxian"));
    });
    check("剑气 310%、绵里藏针先手 83%、云龙三现 150%", () => {
        let [a, b] = pair({}, 100), calls = stubAttack(a, [0, 0, 0]);
        SKILL.get("duanjiajian").pfm.pfm2.use(a, b, 100);
        assert.strictEqual(calls[0].gj, Math.floor(a.gj * 3.1));
        calls = stubAttack(a, [0, 0]);
        SKILL.get("hengshanjianfa").pfm.pfm1 && SKILL.get("hengshanjianfa").pfm.pfm1.name === "绵里藏针"
            ? SKILL.get("hengshanjianfa").pfm.pfm1.use(a, b, 100)
            : Object.values(SKILL.get("hengshanjianfa").pfm).find(p => p.name === "绵里藏针").use(a, b, 100);
        assert.strictEqual(calls[0].gj, Math.floor(a.gj * 0.83));
        assert.strictEqual(calls[1].gj, Math.floor(a.gj * 2.66));
        calls = stubAttack(a, [0, 0, 0]);
        Object.values(SKILL.get("yunlongjian").pfm).find(p => p.name === "云龙三现").use(a, b, 100);
        assert.ok(calls.every(c => c.gj === Math.floor(a.gj * 1.5)));
    });
    check("万岳朝宗：未被闪避时造成与消耗内力等量伤害", () => {
        const [a, b] = pair({ songshanjianfa: "sword" }, 1000);
        a.mp = 100000; b.fy = 1e9; b.diff_sh_per = 90; b.max_hp = b.hp = 1e9;
        stubAttack(a, p => { p.is_dodge = false; return 0; });
        const hp0 = b.hp;
        SKILL.get("songshanjianfa").pfm.pfm1.use(a, b, 1000);
        assert.strictEqual(a.mp, 70000); assert.strictEqual(hp0 - b.hp, 30000);
        stubAttack(a, p => { p.is_dodge = true; return 0; });
        const hp1 = b.hp; SKILL.get("songshanjianfa").pfm.pfm1.use(a, b, 1000);
        assert.strictEqual(b.hp, hp1, "被闪避不造成内力伤害");
    });
    check("震字诀：伤害为 20% 最大内力", () => {
        const [a, b] = pair({}, 100); a.max_mp = 100000;
        const calls = stubAttack(a, [0]);
        SKILL.get("baguaquan").pfm.pfm1.use(a, b, 100);
        assert.strictEqual(calls[0].gj, 20000);
    });
    check("罗汉伏虎：倍率 str×5+lv/20", () => {
        const [a, b] = pair({}, 100); const calls = stubAttack(a, [0]);
        SKILL.get("fuhuquan").pfm.zhen.use(a, b, 600);
        assert.strictEqual(calls[0].gj, a.gj * (a.str * 5 + 30) / 100);
    });
    check("乱拳：最后一拳只无视 150 点防御；左右互搏再次施展上一个绝招", () => {
        const [a, b] = pair({ kongmingquan: "unarmed" }, 1000);
        b.recount(); const f0 = b.fy; const seen = [];
        stubAttack(a, p => { seen.push(b.fy); return 1; });
        SKILL.get("kongmingquan").pfm.pfm1.use(a, b, 1000);
        // 最后一拳期间目标挂临时状态防御 -150（经 recount 生效，不直接改写 fy）
        assert.deepStrictEqual(seen, [f0, f0, f0, f0, f0, f0 - Math.round(150 * (100 + b.query_prop("fy_per")) / 100)]);
        assert.strictEqual(b.fy, f0, "打完复原");
        assert.ok(!stubAttack(a, [1]).some(c => c.diff_fy));
        // 左右互搏：上一招为罗汉伏虎
        a.set_mem("sk/last_pfm_id", "fuhuquan/zhen", 30000); a.set_mem("sk/last_pfm_lv", 600, 30000);
        const gj = a.gj; const calls = stubAttack(a, [0]);
        SKILL.get("kongmingquan").pfm.pfm2.use(a, b, 2500);
        assert.strictEqual(calls.length, 1);
        assert.ok(Math.abs(calls[0].gj - Math.floor(gj * 1.0) * (a.str * 5 + 30) / 100) < 1e-6, "效果按 75%+lv/100% = 100% 攻击");
        assert.strictEqual(a.gj, gj, "攻击力复原");
        // 没有上一招时退回普通一击
        a.remove_mem("sk/last_pfm_id"); const c2 = stubAttack(a, [0]);
        SKILL.get("kongmingquan").pfm.pfm2.use(a, b, 2500);
        assert.strictEqual(c2[0].gj, gj);
    });
    check("玄冥神掌：固定消耗 100 内力", () => {
        const a = mkUser(); learn(a, { xuanmingshenzhang: "unarmed" }, 3000);
        assert.strictEqual(SKILL.get("xuanmingshenzhang").pfm.hanbing.query_mp(a, 3000), 100);
    });
    check("游龙庄：每个人都按同一回复量回血", () => {
        for (const id of ["linjizhuang", "linjizhuang2"]) {
            const a = mkUser(), c = mkUser(); learn(a, { [id]: "force" }, 100); learn(c, {}, 100);
            a.team = [a, c]; a.is_here = () => true;
            a.hp = 1; c.hp = 1; a.max_hp = c.max_hp = 1e9;
            const p = Object.values(SKILL.get(id).pfm).find(x => x.name === "游龙庄");
            p.use(a, null, 100);
            assert.strictEqual(a.hp, c.hp, id);
        }
    });
    check("参合之殇：重置全部层数", () => {
        const [a, b] = pair({ canhezhi: "unarmed" }, 1000);
        b.add_status({ id: "canhe", name: "参合", duration: 60000, override: 1, count: 6, max_count: 10 });
        stubAttack(a, [1]);
        try { SKILL.get("canhezhi").pfm.pfm2 ? SKILL.get("canhezhi").pfm.pfm2.use(a, b, 1000) : Object.values(SKILL.get("canhezhi").pfm).find(p => p.name === "参合之殇").use(a, b, 1000); } catch (e) { }
        assert.ok(!statusOf(b, "canhe"), "层数全部清除");
    });

    console.log((failed ? "P2 数值修复测试失败 " : "P2 数值修复测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
