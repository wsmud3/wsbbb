"use strict";
// 攻速符号审计回归测试：启用后攻击间隔应缩短（gjsd 正值为加快）。
// 运行：node tools/test_skill_speed_signs.js
const assert = require("assert");

function mkUser() {
    const me = new USER();
    me.id = "spd" + Math.random().toString(36).slice(2, 8); me.name = "测试"; me.userid = 1;
    me.gender = 1; me.age = 30; me.level = 5; me.exp = 1e10; me.pot = 1e10;
    me.str = me.con = me.dex = me.int = 30;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.settings = {};
    me.equipment = [null, null, null, null, null, null, null, null, null, null, null];
    me.skills = {}; me.custom_skills = []; me.status = []; me.family = FAMILIES.NONE;
    me.notify = me.send = me.send_room = me.send_combat = me.send_commands = me.notify_hp = me.status_changed = () => {};
    return me;
}
function gjsdWith(sk, base, lv) {
    const me = mkUser();
    me.skills[base] = { level: lv, exp: 0 };
    me.init_skill(); me.recount();
    const before = me.gjsd;
    me.skills[sk] = { level: lv, exp: 0 };
    SKILL.get(sk).attach_prop(me, lv);
    assert.notStrictEqual(me.enable_skill(base, sk), false, sk + " 启用失败");
    me.recount();
    return [before, me.gjsd];
}

async function main() {
    const cases = [
        ["kuangfengkuaijian2", "sword", 250], ["kuangfengkuaijian2", "dodge", 250],
        ["dugujiujian2", "sword", 400], ["liuyunzhang", "unarmed", 200],
        ["kuangfengkuaijian", "sword", 250],   // 一阶对照
    ];
    let n = 0;
    for (const [sk, base, ms] of cases) {
        const [b, a] = gjsdWith(sk, base, 1000);
        assert.strictEqual(b - a, ms, sk + "@" + base + " 攻击间隔应缩短 " + ms + "ms：" + b + "→" + a);
        n++;
    }
    console.log("攻速符号测试通过 " + n + "/" + cases.length);
    process.exit(0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e && e.stack || e); process.exit(1); });
