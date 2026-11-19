"use strict";
// P2「效果没写代码」类修复回归测试（2026-11-18 审计）：在真实引擎里逐个调用绝招验证效果。
// 运行：node tools/test_skill_p2_effects.js   （进程内加载引擎，隔离数据目录，不开端口）
const assert = require("assert");

let failed = 0, passed = 0;
function check(name, fn) {
    try { fn(); passed++; }
    catch (e) { failed++; console.error("✗ " + name + "\n   " + ((e && e.stack) || e).split("\n").slice(0, 4).join("\n   ")); }
}
function mkUser(id) {
    const me = new USER();
    me.id = id || ("p" + Math.random().toString(36).slice(2, 8)); me.name = "测试"; me.userid = 1;
    me.gender = 1; me.age = 30; me.level = 5; me.exp = 1e10; me.pot = 1e10;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.settings = {};
    me.equipment = [null, null, null, null, null, null, null, null, null, null, null];
    me.skills = {}; me.custom_skills = []; me.status = [];
    me.family = FAMILIES.NONE; me.limit_mp = 100000;
    me.log = [];
    for (const k of ["notify", "notify_fail", "send", "send_room", "send_combat"]) me[k] = function (t) { this.log.push(String(t)); return false; };
    me.send_commands = () => {}; me.notify_hp = () => {}; me.status_changed = () => {};
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
function pair(skmap, lv) {
    const a = mkUser(), b = mkUser();
    learn(a, skmap || {}, lv || 1000); learn(b, {}, 100);
    a.fight_type = b.fight_type = 2; a.enemy = [b]; b.enemy = [a];
    return [a, b];
}
// 记录 do_attack 的参数；hit=true 时返回 1（命中），否则 0（落空）
function spy(a, hit) { const calls = []; a.do_attack = p => { calls.push(p); return typeof hit === "function" ? hit(p, calls.length) : (hit ? 1 : 0); }; a.end_attack = () => {}; return calls; }
const st = (ch, id) => (ch.status || []).find(s => s.id === id);
const P = (sk, p) => SKILL.get(sk).pfm[p];

async function main() {
    check("狂风二十一式：出招期间攻速 +100%", () => {
        const [a, b] = pair(); spy(a, true);
        const g0 = a.gjsd; P("kuangfengkuaidao", "pfm1").use(a, b, 1000);
        assert.ok(st(a, "kuangfeng21")); assert.ok(a.gjsd < g0, g0 + "→" + a.gjsd);
    });
    check("九阴白骨爪·夺命：命中后昏迷 3+lv*5/1000 秒；高阶说明写出 8 秒上限", () => {
        const [a, b] = pair(); spy(a, true);
        P("jiuyinbaiguzhao", "duo").use(a, b, 1000);
        assert.ok(b.is_faint > 0 && st(b, "faint").duration === 8000);
        const [c, d] = pair(); spy(c, false);
        P("jiuyinbaiguzhao", "duo").use(c, d, 1000); assert.ok(!d.is_faint, "未命中不昏迷");
        assert.ok(P("jiuyinbaiguzhao2", "po").query_desc(a, 5000).indexOf("8秒") >= 0);
    });
    check("金蛇狂舞：200% 伤害，命中后忙乱 6 秒", () => {
        const [a, b] = pair(); const c = spy(a, true);
        P("jinshejianfa", "pfm1").use(a, b, 1000);
        assert.strictEqual(c[0].gj, a.gj * 2); assert.strictEqual(st(b, "busy").duration, 6000);
    });
    check("寸劲：基本攻击附加 1100", () => {
        const [a, b] = pair(); const c = spy(a, true);
        P("houquan", "pfm1").use(a, b, 1000); assert.strictEqual(c[0].gj, a.gj + 1100);
    });
    check("七伤：七拳 + 总诀（每中一拳 +50%），自伤 20%", () => {
        const [a, b] = pair(); const c = spy(a, () => 1000);
        const hp0 = a.hp; P("qishangquan", "pfm1").use(a, b, 1000);
        assert.strictEqual(c.length, 8); assert.strictEqual(c[7].gj, Math.floor(a.gj * 4.5));
        assert.strictEqual(hp0 - a.hp, 7 * 200);
    });
    check("三阴毒爪 / 追魂爪", () => {
        const [a, b] = pair(); const c = spy(a, true); a.mp = 100000;
        P("sanyinwugongzhao", "pfm1").use(a, b, 1000);
        assert.strictEqual(c.length, 3); assert.strictEqual(c[0].power_gj, 7000);
        b.hp = Math.floor(b.max_hp / 2);
        P("sanyinwugongzhao", "pfm2").use(a, b, 1000);
        const lost = 100 - b.hp * 100 / b.max_hp;
        assert.strictEqual(c[3].gj, Math.floor(a.gj * 2 * (100 + lost * 2) / 100));
    });
    check("斗转：使用前一个打你的武器/拳脚绝招", () => {
        const [a, b] = pair({ douzhuanxingyi: "unarmed" }); const c = spy(a, true);
        a.set_mem("sk/last_hit_pfm", "houquan/pfm1", 60000);
        P("douzhuanxingyi", "pfm2").use(a, b, 1000);
        assert.strictEqual(c[0].gj, a.gj + 1100, "复制了寸劲");
        a.remove_mem("sk/last_hit_pfm");
        P("douzhuanxingyi", "pfm2").use(a, b, 1000);
        assert.strictEqual(c[1].gj, b.gj, "无记录时退回原反击");
        // 自动出招成功后在目标身上记录
        const [x, y] = pair(); x.use_pfm(y, { id: "houquan/pfm1", name: "寸劲", query_mp: () => 0, use: () => true }, 1, "unarmed");
        assert.strictEqual(y.query_mem("sk/last_hit_pfm"), "houquan/pfm1");
    });
    check("重剑无锋：残缺降攻速且只在命中后生效", () => {
        const [a, b] = pair(); spy(a, false);
        P("xuantiejianfa", "zhongjian").use(a, b, 1000); assert.ok(!st(b, "xuantie_canque"), "未命中不残缺");
        spy(a, true); const g0 = b.gjsd;
        P("xuantiejianfa", "zhongjian").use(a, b, 1000);
        assert.ok(st(b, "xuantie_canque") && b.gjsd > g0 && !("distime_per" in st(b, "xuantie_canque").prop));
    });
    check("黯然销魂掌：无中生有未命中不偷取；呆若木鸡降攻速", () => {
        const [a, b] = pair(); spy(a, false);
        b.add_status({ id: "buffx", name: "增益", duration: 60000, prop: { gj: 1 } });
        P("anranxiaohunzhang", "wuzhong").use(a, b, 1000); assert.ok(st(b, "buffx"), "未命中不偷");
        spy(a, true); P("anranxiaohunzhang", "wuzhong").use(a, b, 1000); assert.ok(!st(b, "buffx") && st(a, "buffx_stolen"));
        const g0 = b.gjsd; P("anranxiaohunzhang", "daimu").use(a, b, 1000); assert.ok(b.gjsd > g0);
    });
    check("十步杀一人：命中追加攻击（每敌最多 10 次），无视忙乱", () => {
        const [a, b] = pair(); const c = spy(a, (p, n) => n <= 3 ? 1 : 0);
        P("taixuangong", "shibu").use(a, b, 1000); assert.strictEqual(c.length, 4);
        const c2 = spy(a, true); P("taixuangong", "shibu").use(a, b, 1000); assert.strictEqual(c2.length, 10);
        assert.ok(P("taixuangong", "shibu").allow_busy);
    });
    check("狂风快剑(高阶)·夺命连环：三剑全中后续发", () => {
        const [a, b] = pair(); const c = spy(a, true);
        P("kuangfengkuaijian2", "duoming").use(a, b, 1000);
        assert.ok(a.query_temp("kuangfeng"));
        SKILL.get("kuangfengkuaijian2").on_attack_over(a, b, {});
        assert.strictEqual(c.length, 6); assert.strictEqual(a.query_temp("kuangfeng"), 2);
    });
    check("万佛朝宗：按实际伤害 30% 回血", () => {
        const [a, b] = pair(); spy(a, () => 10000); a.hp = 1;
        P("rulaishenzhang", "pfm1").use(a, b, 1000); assert.ok(a.hp > 1, "回血 " + a.hp);
    });
    check("极乐六性 / 魅魂：比较总容貌；魅魂说明写出上限", () => {
        const [a, b] = pair(); spy(a, true);
        a.per = 10; b.per = 15; a.change_prop({ per: 30 }, true);
        const hp0 = b.hp; P("jileliuxing", "liuxing").use(a, b, 1000); assert.ok(b.hp < hp0, "总容貌更高则必中");
        P("sunvxinjing", "meihun").use(a, b, 1000); assert.ok(st(b, "sunv_mihun"));
        assert.ok(P("sunvxinjing", "meihun").query_desc(a, 5000).indexOf("11秒") >= 0);
    });
    console.log((failed ? "P2 效果测试失败 " : "P2 效果测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
