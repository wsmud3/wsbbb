"use strict";
// 境界修炼回归测试：三花聚顶提示不再给玩家看公式与消耗，测试号可反复挑战已完成的花、奖励只发一次；
// 五气朝元不满足条件时只提示「修为暂且不够」，守门人只给地点。
// 运行：node tools/test_sanhua.js
const assert = require("assert");
let failed = 0, passed = 0;
function check(name, fn) {
    try { fn(); passed++; }
    catch (e) { failed++; console.error("✗ " + name + "\n   " + ((e && e.stack) || e).split("\n").slice(0, 4).join("\n   ")); }
}
function mkUser(test) {
    const me = new USER();
    me.id = "s" + Math.random().toString(36).slice(2, 8); me.name = "测试"; me.userid = 1;
    me.gender = 1; me.age = 30; me.level = 4; me.exp = 1e12; me.pot = 1e12;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.settings = {};
    me.equipment = new Array(11).fill(null); me.skills = {}; me.custom_skills = []; me.status = [];
    me.family = FAMILIES.NONE; me.limit_mp = 100000; me.log = [];
    me.notify = me.notify_fail = function (t) { this.log.push(String(t)); return false; };
    me.send = me.send_room = me.send_combat = me.send_message = function (t) { this.log.push(String(t)); };
    me.send_commands = () => {}; me.notify_hp = () => {}; me.status_changed = () => {};
    me.init_skill(); me.recount(); me.max_mp = me.mp = 10000000;
    me.environment = { items: [me], is_fb: () => false, item_changed() {} };
    me.set_temp("rdem", 1);
    if (test) me.set_temp("test_char", 1);
    return me;
}
function doneAll(me) { for (const k of ["ren", "di", "tian"]) { me.set_temp("shjd_" + k, 1); me.set_temp("shjd_" + k + "_rwd", 1); } }
function flower(path, owner) {
    const n = Object.create(WORLD.NPC_STROE.get(path) || BASE.CREATE(__PATH.NPC, path));
    n._done = false; n._hit_count = 0; n._total_dmg = 0;
    n.call_out = function (fn) { fn.call(n); }; n.end_fight = () => {}; n.destroy = () => {};
    return n;
}
const xiulian = () => WORLD.COMMANDS["xiulian"];

async function main() {
    check("提示里没有修为公式、剩余内力", () => {
        const me = mkUser(false);
        xiulian().enter(me);
        assert.ok(me.log.some(t => /憋了半天|召唤人花/.test(t)), "走到了三花流程：" + me.log.join("|"));
        assert.ok(!me.log.some(t => /修为：|还需消耗|×|=/.test(t)), me.log.join("|"));
    });
    check("测试号三花全部完成后弹出重开浮窗；普通玩家只提示已完成", () => {
        const t = mkUser(true); doneAll(t);
        const sent = []; t.send = s => sent.push(s);
        xiulian().enter(t);
        assert.ok(sent.some(s => /xiulian ren/.test(s) && /重开天花/.test(s)), "弹出重开浮窗");
        const p = mkUser(false); doneAll(p);
        xiulian().enter(p);
        assert.ok(p.log.some(s => /已完成三花聚顶/.test(s)) && !p.log.some(s => /五气朝元/.test(s)), "三花完成不提五气朝元");
        xiulian().enter(p, "ren");
        assert.ok(!p.state, "普通玩家不能重开");
    });
    check("测试号重开：可以召唤已完成的花", () => {
        const t = mkUser(true); doneAll(t);
        xiulian().enter(t, "di");
        assert.ok(t.state && t.state.id === "shjd_flower" && t.query_temp("shjd_cultivating") === "di");
    });
    check("开花奖励只发一次：第一次发先天属性和内力上限，重开不发", () => {
        const me = mkUser(true);
        me.set_temp("shjd_cultivating", "ren");
        const mp0 = me.max_mp, n1 = flower("pub/renhua", me);
        n1.on_damage(me, 10000000);
        assert.strictEqual(me.query_temp("fenpei"), 2);
        assert.strictEqual(me.max_mp, mp0 + 10000);
        assert.ok(me.query_temp("shjd_ren_rwd"));
        me.set_temp("shjd_cultivating", "ren");
        const n2 = flower("pub/renhua", me);
        n2.on_damage(me, 10000000);
        assert.strictEqual(me.query_temp("fenpei"), 2, "重开不再加先天属性");
        assert.strictEqual(me.max_mp, mp0 + 10000, "重开不再加内力上限");
        assert.ok(me.log.some(s => /重温试炼/.test(s)));
        assert.ok(!me.log.some(s => /伤害\/|击未破|累计/.test(s)), "提示不报伤害与次数");
    });

    check("五气朝元：技能条件不满足时唤不出试炼之影，只提示修为暂且不够", () => {
        const me = mkUser(false); me.level = 4; me.set_temp("wd_quest", 1);
        me.environment = { path: "huashan/jueding", items: [me], item_changed() { throw new Error("不该召唤影子"); } };
        WORLD.COMMANDS["wudi_xl"].enter(me, "huashan");
        assert.ok(me.log.some(s => s === "你的修为暂且不够。"), me.log.join("|"));
        assert.ok(!me.log.some(s => /2500|150万|橙色/.test(s)));
    });
    check("守门人只说在五岳，不点明地点和条件", () => {
        const src = require("fs").readFileSync(require("path").join(__dirname, "../world/npc/pub/wudao_men.js"), "utf8");
        assert.ok(!/2500|一百五十万|需任意武器|需内功|需招架|需拳脚|需轻功/.test(src));
        for (const n of ["华山绝顶", "泰山玉皇顶", "恒山见性峰", "衡山祝融殿", "嵩山封禅台"]) assert.ok(src.indexOf(n) < 0, n);
        assert.ok(src.indexOf("五岳") >= 0);
    });

    check("守门人：没有金古易引荐的玩家看不到「提升境界」按钮", () => {
        const men = WORLD.NPC_STROE.get("pub/wudao_men") || BASE.CREATE(__PATH.NPC, "pub/wudao_men");
        const p = mkUser(false); p.level = 4;
        const names = pl => JSON.parse(men.query_commands(pl)).commands.map(c => c.name);
        assert.ok(names(p).indexOf("提升境界") < 0, "没有引荐看不到");
        p.set_temp("wd", 1);
        assert.ok(names(p).indexOf("提升境界") >= 0, "有引荐能看到");
        assert.ok(names(p).indexOf("武帝之路") < 0, "按钮已改名");
    });
    check("金古易引荐：五门基础技能和装备的特殊技能都要 2200 级，内力上限 120 万", () => {
        const zhu = WORLD.NPC_STROE.get("yz/zhubanxian") || BASE.CREATE(__PATH.NPC, "yz/zhubanxian");
        const ask = zhu.actions.levelup.action;
        const build = spLv => {
            const p = mkUser(false); p.level = 4; p.max_mp = 1300000;
            p.callme = p.call = () => "阁下";
            const pairs = [["force", "sp_force"], ["unarmed", "sp_unarmed"], ["sword", "sp_sword"], ["parry", "sp_parry"], ["dodge", "sp_dodge"]];
            p.skills = {};
            for (const [b, sp] of pairs) { p.skills[b] = { level: 2200, enable_skill: sp }; p.skills[sp] = { level: spLv }; }
            return p;
        };
        const low = build(2199); ask.call(zhu, low);
        assert.ok(!low.query_temp("wd"), "特殊技能 2199 级不给引荐");
        const ok = build(2200); ask.call(zhu, ok);
        assert.ok(ok.query_temp("wd"), "都到 2200 级才给引荐");
    });

    console.log((failed ? "三花测试失败 " : "三花测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
