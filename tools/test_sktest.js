"use strict";
// 技能测试号（sktest）回归测试：学会全部基础 + 公共武学并固定等级，各种途径都不能改变等级。
// 运行：node tools/test_sktest.js
const assert = require("assert");
let failed = 0, passed = 0;
function check(name, fn) {
    try { fn(); passed++; }
    catch (e) { failed++; console.error("✗ " + name + "\n   " + ((e && e.stack) || e).split("\n").slice(0, 4).join("\n   ")); }
}
function mkUser(id) {
    const me = new USER();
    me.id = id || ("p" + Math.random().toString(36).slice(2, 8)); me.name = "测试" + me.id; me.userid = 1;
    me.gender = 1; me.age = 30; me.level = 5; me.exp = 1e12; me.pot = 1e12;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.settings = {};
    me.equipment = [null, null, null, null, null, null, null, null, null, null, null];
    me.skills = {}; me.custom_skills = []; me.status = [];
    me.family = FAMILIES.NONE; me.limit_mp = 100000; me.log = [];
    for (const k of ["notify", "notify_fail", "send", "send_room", "send_combat"]) me[k] = function (t) { this.log.push(String(t)); return false; };
    me.send_commands = () => {}; me.notify_hp = () => {}; me.status_changed = () => {}; me.save = () => Promise.resolve();
    me.init_skill(); me.recount();
    return me;
}
async function main() {
    const cmd = WORLD.COMMANDS.sktest;
    assert.ok(cmd, "sktest 命令已加载");
    const ids = cmd.skill_ids();
    const lvOf = (me) => ids.map(id => me.skills[id] && me.skills[id].level);

    check("技能范围：10 门基础 + 全部公共武学，不含门派武学", () => {
        for (const b of ["force", "dodge", "parry", "sword", "blade", "club", "staff", "whip", "unarmed", "throwing"]) assert.ok(ids.includes(b), b);
        assert.ok(!ids.includes("bite"));
        for (const id of ids) { const s = SKILL.get(id); assert.ok(s.type === SKILL_TYPES.BASE || s.is_public, id); }
        assert.ok(ids.includes("anranxiaohunzhang") && ids.includes("liumaishenjian"));
        assert.ok(ids.length >= 25, "共 " + ids.length + " 门");
    });
    check("非 GM 不能用", () => {
        const me = mkUser(); me.user_level = 0; cmd.enter(me, "fix");
        assert.ok(!me.skill_fixed() && !me.skills.anranxiaohunzhang);
    });
    check("fix：全部 3000 级并锁定；锁定标记写进存档", () => {
        const me = mkUser(); me.user_level = 5; cmd.enter(me, "fix");
        assert.ok(lvOf(me).every(l => l === 3000), JSON.stringify(lvOf(me)));
        assert.strictEqual(me.skill_fixed(), 3000);
        assert.ok(/skill_fixed"?:3000/.test(me.format_temp(me.temp)), "temp.skill_fixed 进存档：" + me.format_temp(me.temp));
    });
    check("fix 可指定等级和其他在线玩家", () => {
        const gm = mkUser(); gm.user_level = 5; const p = mkUser("sk_target");
        WORLD.USERS.push(p);
        try { cmd.enter(gm, "fix 1200 sk_target"); } finally { WORLD.USERS.splice(WORLD.USERS.indexOf(p), 1); }
        assert.ok(lvOf(p).every(l => l === 1200)); assert.strictEqual(p.skill_fixed(), 1200); assert.ok(!gm.skill_fixed());
    });
    check("锁定后：加经验、set_skill、学习/练习/读书/放弃都不改变等级", () => {
        const me = mkUser(); me.user_level = 5; cmd.enter(me, "fix");
        SKILL.get("force").add_exp(me, 1e15);
        SKILL.get("yiyangzhi").add_exp(me, 1e15);
        me.set_skill("sword", 5000);
        for (const c of ["xue", "study", "lianxi", "fangqi"]) {
            me.log = []; WORLD.COMMANDS[c].enter(me, "force", "force", "x");
            assert.ok(me.log.some(t => t.includes("固定")), c + " 提示已固定");
        }
        assert.ok(lvOf(me).every(l => l === 3000), JSON.stringify(lvOf(me)));
        assert.strictEqual(me.skills.force.exp, 0);
    });
    check("测试号：境界武士、首次发 1 万武道 1 万元晶 1 张叛师符，重复 fix 不重复发", () => {
        const me = mkUser(); me.user_level = 5; me.level = 4; const got = {};
        me.add_obj = function (path, n) { got[path] = (got[path] || 0) + n; return { unit_name: () => "" }; };
        cmd.enter(me, "fix"); cmd.enter(me, "fix");
        assert.ok(me.is_test_char()); assert.strictEqual(me.level, 1);
        assert.deepStrictEqual(got, { "book/wudao": 10000, "st/yuanjing": 10000, "cash/tuoli": 1 });
        for (const path of Object.keys(got)) assert.ok(OBJ.CREATE(path), path + " 物品存在");
        assert.ok(OBJ.CREATE("st/yuanjing").name === "元晶" && OBJ.CREATE("book/wudao").name === "武道");
        assert.ok(!mkUser().is_test_char(), "普通玩家不是测试号");
    });
    check("测试号无限叛师：叛师符不消耗、无冷却；普通玩家照旧有冷却", () => {
        const fuse = (me) => { const o = OBJ.CREATE("cash/tuoli"); return o; };
        const mk = (test) => { const me = mkUser(); if (test) { me.user_level = 5; cmd.enter(me, "fix"); } me.family = FAMILIES.HUASHAN; me.environment = { item_changed() {}, item_json() { return ""; }, send() {}, items: [] }; me.add_title = () => {}; return me; };
        const t = mk(true), n = mk(false);
        const o = fuse(); assert.ok(o, "能创建叛师符");
        for (let i = 0; i < 3; i++) {
            t.family = FAMILIES.HUASHAN; o.on_use(t); const r = o.on_use(t);
            assert.strictEqual(r, false, "测试号确认叛师后返回 false（不消耗）"); assert.strictEqual(t.family, FAMILIES.NONE);
        }
        assert.ok(!t.query_temp("tuolicd"));
        o.on_use(n); const r2 = o.on_use(n); assert.notStrictEqual(r2, false, "普通玩家消耗"); assert.ok(n.query_temp("tuolicd"), "普通玩家有冷却");
    });
    check("金古易：测试号可自由调整境界，普通玩家不行", () => {
        const npc = NPC.CLONE("yz/zhubanxian");
        const t = mkUser(); t.user_level = 5; cmd.enter(t, "fix");
        assert.notStrictEqual(npc.on_ask(t, "测试境界5"), false); assert.strictEqual(t.level, 5);
        npc.on_ask(t, "测试境界0"); assert.strictEqual(t.level, 0);
        const n = mkUser(); n.level = 1; assert.strictEqual(npc.on_ask(n, "测试境界6"), false); assert.strictEqual(n.level, 1);
        t.log = []; let cmds = null; t.send_commands = (...a) => { cmds = a; };
        npc.actions.levelup.action.call(npc, t);
        assert.ok(cmds && cmds.some(c => /测试境界6/.test(c)), "提升境界给测试号列出可选境界");
    });
    check("九转金丹已删除：drug/exp#5 不再是九转金丹，金古易福利不再发", () => {
        const o = OBJ.CREATE("drug/exp#5");
        assert.ok(o && o.name !== "九转金丹" && o.exp < 1e6, o && o.name + " " + o.exp);
        assert.ok(!/九转金丹|exp#5/.test(require("fs").readFileSync(__dirname + "/../world/npc/yz/zhubanxian.js", "utf8")));
    });
    check("unfix 后恢复正常", () => {
        const me = mkUser(); me.user_level = 5; cmd.enter(me, "fix"); cmd.enter(me, "unfix");
        assert.ok(!me.skill_fixed() && !me.is_test_char());
        me.set_skill("sword", 3100); assert.strictEqual(me.skills.sword.level, 3100);
    });
    console.log((failed ? "sktest 测试失败 " : "sktest 测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
