"use strict";
// 三花聚顶回归测试：提示不再给玩家看公式与消耗；测试号可反复挑战已完成的花，奖励只发一次。
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

    console.log((failed ? "三花测试失败 " : "三花测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
