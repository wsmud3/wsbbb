"use strict";
// 炼药系统回归测试：丹方数据、丹方学习条件、炼药流程（材料、效率、测试号免材料）、丹药效果、价格与出售。
// 运行：node tools/test_lianyao.js
const assert = require("assert");
let failed = 0, passed = 0;
async function check(name, fn) {
    try { await fn(); passed++; }
    catch (e) { failed++; console.error("✗ " + name + "\n   " + ((e && e.stack) || e).split("\n").slice(0, 4).join("\n   ")); }
}
function mkUser() {
    const me = new USER();
    me.id = "t" + Math.random().toString(36).slice(2, 8); me.name = "测试"; me.userid = 1;
    me.gender = 1; me.age = 30; me.level = 5; me.exp = 1e12; me.pot = 1e12;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.settings = {};
    me.equipment = new Array(11).fill(null);
    me.skills = {}; me.custom_skills = []; me.status = []; me.money = 0;
    me.family = FAMILIES.NONE; me.limit_mp = 100000; me.log = [];
    me.notify = function (t) { this.log.push(String(t)); return false; };
    me.notify_fail = me.notify; me.send = me.send_room = me.send_combat = function (t) { this.log.push(String(t)); };
    me.save = () => {}; me.send_commands = () => {}; me.notify_hp = () => {}; me.status_changed = () => {}; me.items_changed = () => {};
    me.init_skill(); me.recount(); me.max_hp = me.hp = 100000; me.max_mp = me.mp = 100000;
    return me;
}
const L = () => WORLD.LIANYAO;
const room = () => ({ can_lianyao: true, items: [], item_changed() {}, is_fb: () => false });
function give(me, path, n) { me.add_obj(path, n); }
function giveMats(me, rec, times) { for (const p in rec.mats) give(me, p, rec.mats[p] * times); }

async function main() {
    await check("丹方数据：5 个品级各 23 种，名字与效果一一对应，材料都是存在的草药 / 鱼", () => {
        assert.strictEqual(L().LIST.length, 115);
        for (let g = 1; g <= 5; g++) assert.strictEqual(L().LIST.filter(r => r.grade === g).length, 23);
        for (const r of L().LIST) {
            const dan = OBJ.CREATE("drug/dan#" + r.id), df = OBJ.CREATE("book/danfang#" + r.id);
            assert.ok(dan && dan.name === r.name && dan.grade === r.grade, "丹药 " + r.id);
            assert.ok(df && df.name === "丹方·" + r.name && df.grade === r.grade, "丹方 " + r.id);
            for (const p in r.mats) assert.ok(OBJ.CREATE(p), "材料 " + p);
        }
        assert.strictEqual(L().get(1).prop, "heal_hp"); assert.strictEqual(L().get(48).value, 10);
        assert.strictEqual(L().buff_minutes(L().get(48)), 5); assert.strictEqual(L().buff_minutes(L().get(66)), 60);
        assert.deepStrictEqual(L().LIST.filter(r => r.prop === "gjsd_per").map(r => r.value), [5, 10, 15, 20, 30], "风神丹削弱");
        const hp = OBJ.CREATE("drug/dan#1"), mp = OBJ.CREATE("drug/dan#19"), marry = OBJ.CREATE("food/marry#9");
        assert.ok(hp.distype === marry.distype && hp.distime === marry.distime, "大还丹与喜宴回血菜同冷却");
        assert.strictEqual(mp.distime, marry.distime);
    });
    await check("价格：丹药不超过同品级药材，丹方价值 0（商人不收）", () => {
        const HERB = [0, 20, 50, 100, 200, 500];
        assert.deepStrictEqual([0, 3, 6, 9, 12, 15, 18].slice(0, 6).map(i => OBJ.CREATE("res/cao#" + i).value), [10, 20, 50, 100, 200, 500], "药材按品级定价");
        assert.deepStrictEqual([0, 3, 6, 9, 12, 15].map(i => OBJ.CREATE("res/yu#" + i).value), [10, 20, 50, 100, 200, 500], "鱼按品级定价");
        for (const r of L().LIST) {
            assert.ok(OBJ.CREATE("drug/dan#" + r.id).value <= HERB[r.grade], "丹药 " + r.id);
            assert.strictEqual(OBJ.CREATE("book/danfang#" + r.id).value, 0);
        }
        const me = mkUser(); give(me, "book/danfang#1", 1);
        const df = me.find_obj_bypath("book/danfang#1");
        WORLD.COMMANDS["sell"].enter(me, df.id);
        assert.ok(me.find_obj_bypath("book/danfang#1"), "丹方卖不掉");
    });
    await check("学丹方：炼药术等级门槛 300/500/800/1500/3000，不能重复学", () => {
        const me = mkUser();
        me.set_skill("lianyao", 299);
        assert.ok(L().learn(me, 1), "299 级学不了绿色");
        me.set_skill("lianyao", 300);
        assert.strictEqual(L().learn(me, 1), null);
        assert.ok(L().knows(me, 1));
        assert.ok(L().learn(me, 1), "不能重复学");
        assert.ok(L().learn(me, 24), "300 级学不了蓝色");
        me.set_skill("lianyao", 3000);
        assert.strictEqual(L().learn(me, 93), null, "3000 级学得会橙色");
        assert.deepStrictEqual([0, 1, 2, 3, 4, 5, 6].map(g => L().learn_level(g)), [0, 300, 500, 800, 1500, 3000, 4000]);
        // 通过使用丹方物品学习，学会后物品被消耗
        const u = mkUser(); u.set_skill("lianyao", 500); give(u, "book/danfang#24", 1);
        WORLD.COMMANDS["use"].enter(u, u.find_obj_bypath("book/danfang#24").id);
        assert.ok(L().knows(u, 24) && !u.find_obj_bypath("book/danfang#24"));
    });
    await check("炼药：要在炼药房、学会丹方、材料够；每颗扣一份材料，材料用完自动停", () => {
        const me = mkUser(), rec = L().get(2);
        me.environment = room();
        const cmd = WORLD.COMMANDS["lianyao"];
        cmd.enter(me, "2"); assert.ok(!me.state, "没学会不能炼");
        me.set_skill("lianyao", 300); L().learn(me, 2);
        cmd.enter(me, "2"); assert.ok(!me.state, "材料不够不能炼");
        giveMats(me, rec, 2);
        assert.strictEqual(L().craftable(me, rec), 2);
        cmd.enter(me, "2"); assert.ok(me.state && me.state.id === "lianyao");
        const interval = L().craft_interval(me);
        let ticks = 0;
        while (me.state && ticks < 50) { ticks++; if (me.state.on_enter(me, Date.now()) === false) me.set_state(null, true); }
        assert.ok(!me.state, "材料用完后停止");
        const dan = me.find_obj_bypath("drug/dan#2");
        assert.ok(dan && dan.count === 2, "炼出 2 颗");
        assert.strictEqual(L().craftable(me, rec), 0);
        for (const p in rec.mats) assert.strictEqual(L().count_item(me, p), 0, "材料扣光");
        const other = mkUser(); other.environment = { can_lianyao: false, items: [] };
        other.set_skill("lianyao", 300); L().learn(other, 2); giveMats(other, rec, 1);
        cmd.enter(other, "2"); assert.ok(!other.state, "不在炼药房不能炼");
        assert.ok(interval <= 10000);
    });
    await check("炼药效率：每点加快 10%，最快 3 秒一颗", () => {
        const me = mkUser();
        assert.strictEqual(L().craft_interval(me), 10000);
        me.add_status({ id: "room", name: "", duration: 0, prop: { lianyao1: 10 } });
        assert.strictEqual(L().craft_interval(me), 5000);
        me.remove_status("room", true);
        me.add_status({ id: "room", name: "", duration: 0, prop: { lianyao1: 100 } });
        assert.strictEqual(L().craft_interval(me), 3000);
    });
    await check("测试号：炼药不需要也不消耗材料；sktest danfang 发放 / 直接学会丹方", () => {
        const me = mkUser(); me.user_level = 5; me.set_temp("test_char", 1); me.environment = room();
        const sk = WORLD.COMMANDS["sktest"];
        sk.enter(me, "danfang 1 learn");
        assert.strictEqual(L().known_list(me).length, 23, "直接学会绿色 23 种");
        sk.enter(me, "danfang 2");
        assert.ok(me.find_obj_bypath("book/danfang#24"), "发放蓝色丹方");
        give(me, "res/cao#0", 3);
        WORLD.COMMANDS["lianyao"].enter(me, "1");
        assert.ok(me.state, "没有材料也能炼");
        me.state.on_enter(me, Date.now()); me.state.on_enter(me, Date.now());
        assert.ok(me.find_obj_bypath("drug/dan#1"), "炼出丹药");
        assert.strictEqual(L().count_item(me, "res/cao#0"), 3, "身上的材料没被扣");
    });
    await check("丹药效果：增益与喜宴同属食物、后吃替换先吃；回血回内；突破丹只升品级不高于丹药的技能", () => {
        const me = mkUser();
        give(me, "food/marry#0", 1);
        WORLD.COMMANDS["use"].enter(me, me.find_obj_bypath("food/marry#0").id);
        assert.ok(me.status.find(s => s.id === "food"), "吃了喜宴");
        give(me, "drug/dan#2", 1);
        WORLD.COMMANDS["use"].enter(me, me.find_obj_bypath("drug/dan#2").id);
        const food = me.status.filter(s => s.id === "food");
        assert.ok(food.length === 1 && food[0].prop.gj_per === 3 && food[0].duration === 180000, "大力丸替换喜宴：攻击 +3%、3 分钟");
        me.hp = 1; give(me, "drug/dan#93", 1);
        WORLD.COMMANDS["use"].enter(me, me.find_obj_bypath("drug/dan#93").id);
        assert.strictEqual(me.hp, 1 + Math.floor(me.max_hp * 0.5), "橙色大还丹回 50% 气血");
        me.mp = 0; give(me, "drug/dan#19", 1);
        WORLD.COMMANDS["use"].enter(me, me.find_obj_bypath("drug/dan#19").id);
        assert.strictEqual(me.mp, Math.floor(me.max_mp * 0.05), "绿色无常丹回 5% 内力");
        // 突破丹：只有一门 1 品以下技能可升
        const t = mkUser(); t.exp = 1e15;
        t.set_skill("force", 100); t.set_skill("xiaoyaoyou", 100);   // force 基础(0品)，逍遥游（品级见下）
        const g = SKILL.get("xiaoyaoyou").grade;
        give(t, "drug/dan#23", 1);
        WORLD.COMMANDS["use"].enter(t, t.find_obj_bypath("drug/dan#23").id);
        const up = t.skills.force.level - 100, up2 = t.skills.xiaoyaoyou.level - 100;
        if (g > 1) assert.ok(up >= 1 && up <= 3 && up2 === 0, "只升了基础内功 " + up + "/" + up2);
        else assert.ok(up + up2 >= 1 && up + up2 <= 3);
    });

    await check("浮窗：第一级按品级列出，第二级列出该级丹药、所需材料与是否够料", () => {
        const me = mkUser(); me.environment = room(); me.set_skill("lianyao", 500);
        L().learn(me, 2); L().learn(me, 24);
        const sent = []; me.send_commands = function () { sent.push(Array.prototype.slice.call(arguments)); };
        WORLD.COMMANDS["lianyao"].enter(me, undefined);
        const lv1 = sent.pop();
        assert.deepStrictEqual(lv1.filter(x => typeof x === "string"), ["lianyao g1", "炼制一级丹药", "lianyao g2", "炼制二级丹药"]);
        assert.ok(/已掌握2个药方/.test(lv1[lv1.length - 1].text));
        giveMats(me, L().get(2), 1);
        WORLD.COMMANDS["lianyao"].enter(me, "g1");
        const html = sent.pop()[0].html;
        assert.ok(html.indexOf('cmd="lianyao 2"') >= 0 && html.indexOf("大力丸") >= 0 && html.indexOf("需要材料") >= 0 && html.indexOf("可炼1颗") >= 0);
        assert.ok(html.indexOf("lianyao 24") < 0, "只列本级");
        assert.ok(html.indexOf('cmd="lianyao"') >= 0, "有返回按钮");
    });
    await check("随从代炼：丹方按主人学会的算，材料扣随从背包，丹药进随从背包，按钮带 dc 前缀", () => {
        const owner = mkUser(); owner.environment = room(); owner.set_skill("lianyao", 300); L().learn(owner, 2);
        WORLD.USERS.push(owner);
        try {
            const sent = []; owner.send_commands = function () { sent.push(Array.prototype.slice.call(arguments)); };
            const f = new FOLLOWER(); f.id = "f" + Math.random().toString(36).slice(2, 8); f.name = "程灵素"; f.master = owner.id;
            f.items = []; f.temp = {}; f.status = []; f.skills = {}; f.environment = owner.environment; f.listener = owner;
            WORLD.COMMANDS["lianyao"].enter(f, undefined);
            assert.ok(sent.pop().indexOf("dc " + f.id + " lianyao g1") >= 0, "按钮带 dc 前缀");
            giveMats(f, L().get(2), 1);
            assert.ok(!owner.find_obj_bypath("drug/dan#2"));
            WORLD.COMMANDS["lianyao"].enter(f, "2");
            assert.ok(f.state && f.state.id === "lianyao", "随从开始炼药");
            f.listener = null;
            while (f.state) if (f.state.on_enter(f, Date.now()) === false) f.state = null;
            assert.ok(f.find_obj_bypath("drug/dan#2"), "丹药在随从背包");
            const g = new FOLLOWER(); g.id = "g1"; g.master = owner.id; g.items = []; g.temp = {}; g.status = []; g.skills = {}; g.environment = owner.environment;
            assert.ok(!L().knows(L().owner_of(g), 3), "主人没学的随从也不会");
        } finally { WORLD.USERS.remove(owner); }
    });
    await check("炼药不需要炼药术等级：学会后即便炼药术降到 0 也能炼", () => {
        const me = mkUser(); me.environment = room(); me.set_skill("lianyao", 300); L().learn(me, 2);
        me.set_skill("lianyao", 0); giveMats(me, L().get(2), 1);
        WORLD.COMMANDS["lianyao"].enter(me, "2");
        assert.ok(me.state && me.state.id === "lianyao");
    });

    console.log((failed ? "炼药测试失败 " : "炼药测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
