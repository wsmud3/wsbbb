"use strict";
// 技能修复回归测试（2026-11-18 审计）：在真实引擎里验证
//   论语由朱熹传授、删除火龙拳后旧存档可安全加载、NPC 专用技能不进随机池、金蛇游身掌温府掉落、
//   武馆教习不教 6 品、移花接木、紫电劲麻痹、以及「完全无效」一类技能效果。
// 运行：node tools/test_skill_fixes.js   （进程内加载引擎，隔离数据目录，不开端口）
const assert = require("assert");
const fs = require("fs");
const path = require("path");

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
    me.family = FAMILIES.NONE; me.limit_mp = 100000;
    me.log = [];
    me.notify = function (t) { this.log.push(String(t)); return false; };
    me.notify_fail = function (t) { this.log.push(String(t)); return false; };
    me.send = function (t) { this.log.push(String(t)); };
    me.send_room = function (t) { this.log.push(String(t)); };
    me.send_combat = function (t) { this.log.push(String(t)); };
    me.send_commands = function () { this.log.push([].slice.call(arguments).join("|")); };
    me.notify_hp = function () {};
    me.status_changed = function () {};
    return me;
}
function learn(me, map, lv) {
    for (const id of Object.keys(map)) {
        me.skills[id] = { level: lv, exp: 0 };
        const b = map[id];
        if (b) { if (!me.skills[b]) me.skills[b] = { level: lv, exp: 0 }; }
    }
    for (const id in me.skills) { const s = SKILL.get(id); if (s) s.attach_prop(me, lv); }
    for (const id of Object.keys(map)) if (map[id]) me.enable_skill(map[id], id);
    me.max_mp = me.limit_mp + me.query_prop("limit_mp"); me.mp = me.max_mp;
    me.init_skill(); me.recount(); me.hp = me.max_hp;
}
function fight(a, b) { a.fight_type = b.fight_type = 2; a.enemy = [b]; b.enemy = [a]; }
function statusOf(ch, id) { return (ch.status || []).find(s => s.id === id); }
function src(rel) { return fs.readFileSync(path.join(__dirname, "..", rel), "utf8"); }

async function main() {
    // ---------- 1. 《论语》 ----------
    check("论语：朱熹在读书写字 3000 级以下拒绝并用称呼回话", () => {
        const zhu = NPC.CLONE("yz/zhu");
        assert.ok(zhu && zhu.skills.lunyu, "朱熹会《论语》");
        assert.ok(zhu.pot_teach && zhu.pot_teach.lunyu, "论语按潜能传授，不走学费 do_teach");
        const me = mkUser(); me.skills.literate = { level: 2999, exp: 0 };
        assert.strictEqual(zhu.on_teach(me, "lunyu"), false);
        const msg = me.log.join("\n");
        assert.ok(msg.indexOf(me.call() + "你的学问还没到火候，等你学有所成再来吧") >= 0, msg);
        me.skills.literate.level = 3000; me.log = [];
        assert.strictEqual(zhu.on_teach(me, "lunyu"), true);
        // 读书写字仍走原来的学费流程
        assert.strictEqual(zhu.on_teach(me, "literate"), false, "未交学费时读书写字仍需交钱");
        assert.ok(me.log.join("|").indexOf("xue lunyu from") >= 0, "交费菜单里带「学习《论语》」按钮");
    });
    check("论语、NPC 专用技能都不在随机池", () => {
        const hidden = ["lunyu", "xuanmingshenzhang_m", "lvliu_dodge", "lvliu_force", "lvliu_sword", "lvliu_unarmed", "bite"];
        for (const id of hidden) assert.ok(SKILL.get(id) && SKILL.get(id).is_hidden, id + " 带 is_hidden");
        for (let g = 0; g <= 6; g++) {
            const pool = FAMILIES.NONE.query_skills(g).map(s => s.id);
            for (const id of hidden) assert.ok(pool.indexOf(id) < 0, id + " 不应在 FAMILIES.NONE 品级 " + g + " 池");
        }
        // 武道塔每日奖励：真实调用 reward，统计发出的残页
        const wd = WORLD.TASKS.find(t => t.id === "wudao");
        const got = new Set();
        const me = mkUser();
        me.query_party = () => null; me.add_exp = () => {};
        me.add_obj = function (o) { if (o && o.path && o.path.indexOf("book/bc") === 0) got.add(o.skill_id || o.path.split("#")[1] || o.id); return o; };
        for (let i = 0; i < 400; i++) wd.reward(me, i % 2 ? 5 : 45);
        assert.ok(got.size > 5, "抽样拿到了残页 " + got.size);
        for (const id of hidden) assert.ok(!got.has(id), id + " 不应出现在武道塔残页");
    });

    // ---------- 2. 删除火龙拳：旧存档 ----------
    check("火龙拳已删除，旧存档里的 huolongquan 登录时被清掉且不报错", () => {
        assert.ok(!SKILL.get("huolongquan"), "技能文件已删除");
        const me = mkUser("hlq_save");
        me.skills = {
            unarmed: { level: 100, exp: 0, enable_skill: "huolongquan" },
            huolongquan: { level: 100, exp: 0, unarmed: true },
            parry: { level: 100, exp: 0, enable_skill: "huolongquan" },
            force: { level: 100, exp: 0 },
        };
        me.init(); me.recount();
        assert.ok(!me.skills.huolongquan, "未知技能被移除");
        assert.strictEqual(me.skills.unarmed.enable_skill, null, "指向已删技能的装备关系被清空");
        assert.strictEqual(me.skills.parry.enable_skill, null);
        assert.ok(me.attack_skill && me.parry_skill, "默认技能可用");
        // 常用界面/命令不抛错
        WORLD.COMMANDS.cha.render_skill(me, me, false);
        me.on_skillchanged && me.on_skillchanged();
        me.enable_skill("unarmed", null);
        me.save && assert.doesNotThrow(() => me.save_data ? me.save_data() : null);
    });

    // ---------- 3. 金蛇游身掌温府掉落 ----------
    check("武馆教习不再教 6 品武学", () => {
        const jx = NPC.CLONE("pub/jiaoxi");
        for (const id in jx.skills) { const s = SKILL.get(id); assert.ok(!s || s.grade < 6, id + " 品级 " + (s && s.grade)); }
    });

    // ---------- 7. 移花接木 ----------
    check("移花接木：无移花时绝招照常生效；对带减益的敌人化解下一招后双方移花结束", () => {
        const a = mkUser("yh_a"), b = mkUser("yh_b");
        learn(a, { yihuajiemu: "parry" }, 1000);
        learn(b, { tianshanzhang: null }, 1000);
        fight(a, b);
        const pfm = { name: "测试招", query_mp: () => 0, used: 0, use() { this.used++; return true; } };
        // 1) 没有移花：照常释放
        assert.strictEqual(b.use_pfm(a, pfm, 100, "unarmed"), true);
        assert.strictEqual(pfm.used, 1, "无移花增益时绝招必须照常执行");
        // 2) 施放移花：a 得增益，b 得减益
        const room = { query_all_enemy: () => [b] };
        a.environment = room;
        SKILL.get("yihuajiemu").pfm.pfm1.use(a, b, 1000);
        assert.ok(statusOf(a, "yihua_self") && statusOf(b, "yihua_debuff"));
        assert.strictEqual(b.use_pfm(a, pfm, 100, "unarmed"), true, "被化解仍算释放（扣内力）");
        assert.strictEqual(pfm.used, 1, "下一招被化解");
        assert.ok(!statusOf(a, "yihua_self") && !statusOf(b, "yihua_debuff"), "双方移花立即结束");
        assert.strictEqual(b.use_pfm(a, pfm, 100, "unarmed"), true);
        assert.strictEqual(pfm.used, 2, "之后的绝招照常生效");
        // 3) 有增益但对方没有减益：照常
        SKILL.get("yihuajiemu").pfm.pfm1.use(a, b, 1000);
        b.remove_status("yihua_debuff", true);
        b.use_pfm(a, pfm, 100, "unarmed");
        assert.strictEqual(pfm.used, 3, "不带移花减益的敌人不受影响");
        assert.ok(statusOf(a, "yihua_self"), "增益保留");
        assert.ok(!a.query_temp("yihua_block"), "不再写存档 temp");
    });
    check("移花接木：玩家手动 pfm 分派与自动出招一致（=== true 才化解）", () => {
        const s = src("world/cmd/battle/pfm.js");
        assert.ok(/on_parry_pfm\(target, me, pfm, lv, sk\) === true\)/.test(s));
        assert.ok(/on_parry_pfm\(target, this, pfm, level, sktype\) === true\)/.test(src("world/extends/char/auto_combat.js")));
    });

    // ---------- 8. 紫电劲麻痹 ----------
    check("紫电劲麻痹让敌人变慢（攻速、冷却、出招）", () => {
        for (const id of ["zidianjin", "zidianjin2"]) {
            const a = mkUser(), b = mkUser();
            learn(a, { [id]: null }, 1000); learn(b, {}, 100); fight(a, b);
            a.do_attack = () => 1; a.end_attack = () => {};
            const p = Object.values(SKILL.get(id).pfm).find(x => String(x.use).indexOf("zidian_mabi") >= 0);
            const gjsd0 = b.gjsd;
            const fake = { distime: 30000, release_time: 3000, __proto__: PERFORM.prototype };
            const cd0 = fake.query_distime(b, 1), rt0 = fake.query_releasetime(b, 1);
            p.use(a, b, 1000);
            assert.ok(statusOf(b, "zidian_mabi"), id + " 挂上麻痹");
            assert.ok(b.gjsd > gjsd0, id + " 攻击间隔变长 " + gjsd0 + "→" + b.gjsd);
            assert.ok(fake.query_distime(b, 1) > cd0, id + " 冷却变长");
            assert.ok(fake.query_releasetime(b, 1) > rt0, id + " 出招时间变长");
        }
    });

    // ---------- 9. 完全无效类 ----------
    check("千蛛万毒手·万蛊噬天：被命中时反噬攻击者 2200", () => {
        const a = mkUser(), b = mkUser();
        learn(a, { qianzhuwandushou: "unarmed" }, 1000); learn(b, {}, 100); fight(a, b);
        a.environment = b.environment = null;
        SKILL.get("qianzhuwandushou").pfm.pfm2.use(a, b, 1000);
        const hp0 = b.hp;
        b.do_attack({ target: a, gj: 1000, mz: 1e9, no_dodge: true, no_parry: true });
        assert.ok(hp0 - b.hp >= 2000, "反噬伤害 " + (hp0 - b.hp));
    });
    check("神照经·拳经盾：吸收 1392 伤害后消失", () => {
        const a = mkUser(); learn(a, { shenzhaojing: "force" }, 1000);
        a.add_status({ id: "quanjing", name: "拳经盾", duration: 60000, shield: 1392 });
        const hp0 = a.hp;
        a.damage(1000, null, 100); assert.strictEqual(a.hp, hp0, "护盾吸收");
        assert.strictEqual(statusOf(a, "quanjing").shield, 392);
        a.damage(1000, null, 100);
        assert.ok(!statusOf(a, "quanjing"), "护盾耗尽移除");
        assert.ok(hp0 - a.hp > 0 && hp0 - a.hp <= 608 + 1, "超出部分照常扣血 " + (hp0 - a.hp));
        assert.ok(String(SKILL.get("shenzhaojing").pfm.pfm2.use).indexOf("shield: 1392") >= 0);
    });
    check("寒冰真气·寒冰：附加 4000 伤害，被命中时攻击者减速 35%", () => {
        const a = mkUser(), b = mkUser();
        learn(a, { hanbingzhenqi: "force" }, 1000); learn(b, {}, 100); fight(a, b);
        SKILL.get("hanbingzhenqi").pfm.pfm1.use(a, b, 1000);
        assert.strictEqual(a.force_skill.do_force_attack(a, b, {}), 4000);
        const g0 = b.gjsd;
        b.do_attack({ target: a, gj: 1000, mz: 1e9, no_dodge: true, no_parry: true });
        assert.ok(statusOf(b, "hanbing_slow"), "攻击者被冻结");
        assert.ok(b.gjsd > g0, "攻击间隔变长");
    });
    check("神霄九灭(含进阶)·阳雷：杖法位 on_attack_over 附加当前内力伤害", () => {
        for (const id of ["shenxiaojiumie", "shenxiaojiumie2"]) {
            const sk = SKILL.get(id);
            assert.ok(!sk.on_force_over, id + " 不再依赖内功位钩子");
            const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
            a.max_mp = a.mp = 100000;
            sk.pfm.yanglei.use(a, b, 1000);
            const hp0 = b.hp; b.fy = 0; b.diff_sh_per = 0;
            sk.on_attack_over(a, b, {}, 100);
            assert.ok(hp0 - b.hp >= 2999, id + " 阳雷附加 " + (hp0 - b.hp));
        }
    });
    check("斗转星移·星移：招架成功按本应受到的伤害 150% 反弹", () => {
        const a = mkUser(), b = mkUser();
        learn(a, { douzhuanxingyi: "unarmed" }, 1000); learn(b, {}, 100); fight(a, b);
        SKILL.get("douzhuanxingyi").pfm.pfm1.use(a, b, 1000);
        a.zj = 1e12; // 必定招架
        const hp0 = b.hp, ahp0 = a.hp;
        b.do_attack({ target: a, gj: 2000, mz: 1, no_dodge: true });
        assert.strictEqual(a.hp, ahp0, "招架未受伤");
        assert.ok(hp0 - b.hp > 0, "反弹伤害 " + (hp0 - b.hp));
    });
    check("无念禅功·无念：攻击附加最大内力 1%", () => {
        const a = mkUser(); learn(a, { wunianchangong: "force" }, 1000);
        a.max_mp = 200000;
        assert.strictEqual(a.force_skill.do_force_attack(a, null, {}), 0);
        SKILL.get("wunianchangong").pfm.pfm2.use(a, null, 1000);
        assert.strictEqual(a.force_skill.do_force_attack(a, null, {}), 2000);
    });
    check("天魔策·拳罡：命中后叠层（每层 +8% 伤害 +5% 破防）", () => {
        const a = mkUser(), b = mkUser(); learn(a, { tianmoce: "force" }, 1000); learn(b, {}, 100); fight(a, b);
        a.do_attack = () => 100; a.end_attack = () => {};
        const p = SKILL.get("tianmoce").pfm.quangang;
        const s0 = a.query_prop("add_sh_per");
        p.use(a, b, 1000); p.use(a, b, 1000);
        assert.strictEqual(a.query_status("tianmoce_quangang"), 2);
        assert.strictEqual(a.query_prop("add_sh_per") - s0, 16);
    });
    check("化功大法·化毒：被击中后腐蚀攻击者 8000 内力", () => {
        const a = mkUser(), b = mkUser(); learn(a, { huagongdafa: "force" }, 1000); learn(b, {}, 100); fight(a, b);
        b.max_mp = b.mp = 50000;
        SKILL.get("huagongdafa").pfm.pfm1.use(a, b, 1000);
        b.do_attack({ target: a, gj: 1000, mz: 1e9, no_dodge: true, no_parry: true });
        assert.strictEqual(b.mp, 42000);
    });
    check("血海魔功·血祭：期间不会死亡，结束后恢复", () => {
        const a = mkUser(); learn(a, { xuehaimogong: "force" }, 1000); a.fight_type = 2; a.enemy = [];
        SKILL.get("xuehaimogong").pfm.pfm1.use(a, null, 1000);
        a.add_hp(-a.max_hp * 10);
        assert.ok(a.hp >= 1, "血祭期间锁血");
        a.remove_status("xueji", true);
        assert.ok(!(a.min_hp > 0), "结束后取消锁血");
    });
    check("太极剑法·绕字诀：真正让敌人忙乱", () => {
        const a = mkUser(), b = mkUser(); learn(a, { taijijian: "sword" }, 1000); learn(b, {}, 100); fight(a, b);
        a.do_attack = () => 1; a.end_attack = () => {};
        SKILL.get("taijijian").pfm.rao.use(a, b, 1000);
        assert.ok(b.is_busy > 0, "忙乱 " + b.is_busy);
    });
    check("燃木刀法(高阶)·护体真焰：被命中后对攻击者造成伤害", () => {
        const a = mkUser(), b = mkUser(); learn(a, { ranmudao2: "blade" }, 1000); learn(b, {}, 100); fight(a, b);
        SKILL.get("ranmudao2").pfm.hu.use(a, b, 1000);
        const hp0 = b.hp;
        b.do_attack({ target: a, gj: 1000, mz: 1e9, no_dodge: true, no_parry: true });
        assert.ok(hp0 - b.hp >= 2500, "真焰反伤 " + (hp0 - b.hp));
    });
    check("乾坤大挪移：招架成功 2 层、失败 1 层，5 秒", () => {
        const a = mkUser(), b = mkUser(); learn(a, { qiankundanuoyi: "parry" }, 1000); learn(b, {}, 100);
        const sk = SKILL.get("qiankundanuoyi");
        sk.on_parry_over(a, b, { is_parry: true });
        assert.strictEqual(a.query_status("qkdny_stack"), 2);
        sk.on_parry_over(a, b, { is_parry: false });
        assert.strictEqual(a.query_status("qkdny_stack"), 3);
        assert.strictEqual(statusOf(a, "qkdny_stack").duration, 5000);
    });
    check("八卦拳 / 秋风拂尘：进阶槽属性生效", () => {
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
        let par = null; a.do_attack = p => { par = p; return 1; }; a.end_attack = () => {};
        a.max_mp = 100000;
        a.change_prop({ bgq_mz: 10, bgq_nl: 5 }, true);
        SKILL.get("baguaquan").pfm.pfm1.use(a, b, 100);
        assert.strictEqual(par.gj, 25000); // 震字诀按说明只造成 (20+bgq_nl)% 最大内力的伤害
        assert.ok(Math.abs(par.mz - a.mz * 1.1) < 1e-6);
        a.change_prop({ qffc_mz: 20, qffc_ml: 1000 }, true);
        SKILL.get("qiufengfuchen").pfm.pfm1.use(a, b, 100);
        assert.ok(Math.abs(par.mz - a.mz * 1.2) < 1e-6);
        assert.strictEqual(statusOf(b, "busy").duration, Math.min(5000 + 500, 10000) + 1000);
    });

    console.log((failed ? "技能修复测试失败 " : "技能修复测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}

require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
