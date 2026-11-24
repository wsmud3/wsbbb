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

    check("武馆教习：基本功只教到 500 级，基础牛头已删除", () => {
        const jx = NPC.CLONE("pub/jiaoxi");
        assert.ok(!SKILL.get("niutou"), "基础牛头技能文件已删除");
        assert.ok(!jx.skills.niutou, "教习不再教基础牛头");
        for (const id in jx.skills) assert.strictEqual(jx.query_skill(id, 0), 500, id + " 应为 500 级");
        const me = mkUser("nt_save");
        me.skills = { niutou: { level: 3000, exp: 0 }, force: { level: 100, exp: 0 } };
        me.init(); me.recount();
        assert.ok(!me.skills.niutou, "旧存档里的基础牛头登录时被清掉");
    });
    check("重复的催心掌（无绝招，cuixinzhang）已删除：保留有绝招的摧心掌，旧存档清掉不报错", () => {
        assert.ok(!SKILL.get("cuixinzhang"), "技能文件已删除");
        assert.ok(SKILL.get("cuixinzhang2") && SKILL.get("cuixinzhang2").pfm, "摧心掌保留且有绝招");
        const src = require("fs").readFileSync(__dirname + "/../world/npc/pub/wudao.js", "utf8");
        assert.ok(!/"cuixinzhang"/.test(src), "武道塔 NPC 不再引用");
        const me = mkUser("cxz_save");
        me.skills = { unarmed: { level: 500, exp: 0, enable_skill: "cuixinzhang" }, cuixinzhang: { level: 500, exp: 0, unarmed: true }, force: { level: 100, exp: 0 } };
        me.init(); me.recount();
        assert.ok(!me.skills.cuixinzhang); assert.strictEqual(me.skills.unarmed.enable_skill, null);
        const bc = OBJ.CREATE("book/bc#cuixinzhang"); assert.ok(bc && !bc.skill, "旧残页不再对应技能");
    });

    check("空明拳·左右互搏 / 斗转星移·斗转：记录 10 秒内有效，超时清空，新绝招覆盖；登录清掉旧存档残留", () => {
        const realNow = Date.now; let now = realNow();
        Date.now = () => now;
        try {
            assert.strictEqual(CHARACTER.PFM_MEM_TIME, 10000);
            const a = mkUser("zy_a"), b = mkUser("zy_b");
            const T = CHARACTER.PFM_MEM_TIME;
            const replayed = [];
            const xd = SKILL.get("xuedao"), xpid = Object.keys(xd.pfm).find(k => xd.pfm[k].name === "血海魔刀");
            const realUse = xd.pfm[xpid].use; xd.pfm[xpid].use = () => { replayed.push("血海魔刀"); };
            a.do_attack = () => 0; a.end_attack = () => {}; a.with_temp_prop = (k, pr, fn) => fn();
            try {
                const zy = SKILL.get("kongmingquan").pfm.pfm2, dz = SKILL.get("douzhuanxingyi").pfm.pfm2;
                a.set_mem("sk/last_pfm_id", "xuedao/" + xpid, T); a.set_mem("sk/last_pfm_lv", 1000, T);
                now += 9000; zy.use(a, b, 1000); assert.deepStrictEqual(replayed, ["血海魔刀"], "10 秒内可复用");
                a.set_mem("sk/last_pfm_id", "xuedao/" + xpid, T);
                now += 10001; zy.use(a, b, 1000); assert.strictEqual(replayed.length, 1, "超过 10 秒清空，不再复用");
                // 斗转：被打中的记录同样 10 秒
                a.set_mem("sk/last_hit_pfm", "xuedao/" + xpid, T);
                now += 10001; dz.use(a, b, 1000); assert.strictEqual(replayed.length, 1, "斗转超过 10 秒不再复制");
                a.set_mem("sk/last_hit_pfm", "xuedao/" + xpid, T); now += 5000; dz.use(a, b, 1000);
                assert.strictEqual(replayed.length, 2, "斗转 10 秒内可复制");
                // 新绝招覆盖
                a.set_mem("sk/last_pfm_id", "xuedao/" + xpid, T); a.set_mem("sk/last_pfm_id", "kongmingquan/pfm1", T);
                assert.strictEqual(a.query_mem("sk/last_pfm_id"), "kongmingquan/pfm1");
            } finally { xd.pfm[xpid].use = realUse; }
            // 旧版本写进存档的残留
            const c = mkUser("zy_c"); c.temp["sk/last_pfm_id"] = "xuedao/" + xpid; c.temp["sk/last_pfm_lv"] = 3000;
            c.set_mem("sk/last_pfm_id", "xuedao/" + xpid, T);
            c.clear_pfm_memory();
            assert.ok(!c.temp["sk/last_pfm_id"] && !c.temp["sk/last_pfm_lv"] && !c.query_mem("sk/last_pfm_id"), "清掉存档残留与内存记录");
            const src = require("fs").readFileSync(__dirname + "/../os/char/user.js", "utf8");
            assert.ok(/do_login = function \(\) \{\s*try \{ this\.clear_pfm_memory\(\); \}/.test(src), "登录时清除");
            assert.ok(/relogin = function \(newUser\) \{\s*if \(!newUser\.socket\) return;\s*try \{ this\.clear_pfm_memory\(\); \}/.test(src), "断线重连时清除");
            for (const f of ["world/cmd/battle/pfm.js", "world/extends/char/auto_combat.js"]) {
                const t = require("fs").readFileSync(__dirname + "/../" + f, "utf8");
                assert.ok(!/sk\/last_(pfm_id|pfm_lv|hit_pfm)", [^,]+, (30000|60000)/.test(t) && /PFM_MEM_TIME/.test(t), f + " 用 10 秒");
            }
        } finally { Date.now = realNow; }
    });

    check("武道塔残页：守门人奖励不再抽基础技能（秘籍碎片）；公共池跳过运行中已删除的技能、热更新后能抽到新对象", () => {
        const src = require("fs").readFileSync(__dirname + "/../world/task/wd_task.js", "utf8");
        assert.ok(/SKILL_TYPES\.BASE \|\| !\(sk\.grade >= 1\)/.test(src), "守门人奖励排除 0 品基础技能");
        for (const b of ["force", "sword", "dodge"]) { const o = OBJ.CREATE("book/bc#" + b); assert.ok(!o.skill, b + " 确实生成不了残页"); }
        const fam = FAMILIES.NONE; fam.skill_levels = null;
        const victim = fam.skills.find(s => s.grade === 3);
        const saved = WORLD.SKILLS[victim.id];
        try {
            delete WORLD.SKILLS[victim.id];                 // 模拟运行中被删除
            for (let i = 0; i < 300; i++) assert.notStrictEqual(fam.query_skill(3), victim, "抽到已删除技能");
            assert.ok(!fam.query_skills(3).includes(victim));
        } finally { WORLD.SKILLS[victim.id] = saved; }
        fam.skill_levels = null;
        const g1 = fam.query_skills(1); assert.ok(g1.length > 0 && g1.every(s => SKILL.get(s.id) === s));
        // 热更新同 id：update() 会让缓存失效，新对象能被抽到
        const old = fam.query_skills(2)[0]; const neo = Object.create(old); neo.id = old.id; neo.grade = old.grade; neo.family = old.family;
        WORLD.SKILLS[old.id] = neo;
        try {
            const ary = fam.skills; ary[ary.indexOf(old)] = neo; fam.skill_levels = null;
            assert.ok(fam.query_skills(2).includes(neo) && !fam.query_skills(2).includes(old));
        } finally { WORLD.SKILLS[old.id] = old; fam.skills[fam.skills.indexOf(neo)] = old; fam.skill_levels = null; }
        assert.ok(/fam\.skill_levels = null;/.test(require("fs").readFileSync(__dirname + "/../os/skill/skill.js", "utf8")), "update 里清缓存");
    });

    check("武道进阶消耗：2×(品级+1)² 本，1 品进满约 108 本，特殊项贵 20%；进阶记下实际花费、重置按记录退还", () => {
        const L = WORLD.COMMANDS.lingwu, P = SKILL.PROPERTIES;
        const ATK = 12, BJ = 9;   // 进攻之道（普通）、残暴之心（特殊）
        assert.deepStrictEqual([1, 2, 3, 4].map(g => L.wudao_cost(g, P[ATK])), [8, 18, 32, 50]);
        assert.strictEqual([1, 2, 3, 4].reduce((a, g) => a + L.wudao_cost(g, P[ATK]), 0), 108);
        assert.deepStrictEqual([1, 2, 3, 4].map(g => L.wudao_cost(g, P[BJ])), [10, 22, 39, 60]);
        const me = mkUser("wd_cost"); me.skills.club = { level: 3000, exp: 0 }; me.skills.juemengun = { level: 3000, exp: 0 };
        me.enable_skill("club", "juemengun"); me.init_skill(); me.recount();
        const books = () => { const o = me.find_obj_bypath("book/wudao"); return o ? o.count : 0; };
        OBJ.clone_to("book/wudao", me, 30);
        const sb = SKILL.get("juemengun"); assert.strictEqual(sb.grade, 1, "绝门棍 1 品");
        L.enter(me, "juemengun", "weapon", String(ATK));                       // 1→2 品，8 本
        assert.strictEqual(books(), 22); assert.strictEqual(me.skills.juemengun.addin_cost[ATK], 8);
        L.enter(me, "juemengun", "weapon", String(BJ));                        // 2→3 品，特殊项 22 本
        assert.strictEqual(books(), 0); assert.strictEqual(sb.query_grade(me), 3);
        L.enter(me, "juemengun", "weapon", "13");                              // 3→4 品要 32 本，书不够
        assert.strictEqual(sb.query_grade(me), 3, "书不够进不了");
        L.enter(me, "juemengun", "reset", String(BJ)); assert.strictEqual(books(), 22, "退还当时花的 22 本");
        L.enter(me, "juemengun", "reset", String(ATK)); assert.strictEqual(books(), 30);
        // 老存档里没有花费记录的进阶：按新公式估算退还这一级的价钱
        me.skills.juemengun.addin = [ATK]; delete me.skills.juemengun.addin_cost; me.init_skill(); me.recount();
        L.enter(me, "juemengun", "reset", String(ATK)); assert.strictEqual(books(), 38, "无记录按 1→2 品价钱 8 本退");
    });
    check("武道塔守护者：按玩家进度标定的曲线（逐层递增、标定点吻合）、90~99 层免控、第一百层与上 1~5 层", () => {
        const n = NPC.CLONE("pub/wudao");
        for (const tier of n.skills_def) for (const r of tier) assert.ok(SKILL.get(r[0]), "技能表里的 " + r[0] + " 不存在");
        const at = lv => { const g = NPC.CLONE("pub/wudao"); g.init_from(null, lv); return g; };
        // 标定点
        const K = n.WD_GJ_SCALE; assert.ok(K > 0 && K <= 1, "攻击系数");
        for (const [lv, gj, mz, ds, hp] of [[10, 1500, 1500, 1000, 30000], [30, 10000, 18000, 6000, 100000], [65, 35000, 33000, 20000, 700000], [89, 50000, 95000, 35000, 900000], [90, 60000, 100000, 40000, 1300000], [99, 60000, 120000, 50000, 1300000]]) {
            const g = at(lv);
            assert.ok(g.gj === Math.round(gj * K) && g.mz === mz && g.ds === ds && g.zj === ds && g.max_hp === hp, lv + " 层：" + [g.gj, g.mz, g.ds, g.zj, g.max_hp].join("/"));
            assert.strictEqual(g.fy, Math.round(gj * 0.3), lv + " 层防御 = 攻击原值×0.3");
        }
        // 逐层不减
        let prev = at(1);
        for (let lv = 2; lv <= 99; lv++) { const g = at(lv); for (const k of ["gj", "mz", "ds", "zj", "fy", "max_hp"]) assert.ok(g[k] >= prev[k], lv + " 层 " + k + " 比上一层低"); prev = g; }
        // 免控只在 90~99 层
        assert.ok(!at(89).query_prop("ig_control") && at(90).query_prop("ig_control") && at(99).query_prop("ig_control"));
        const g95 = at(95); g95.hp = g95.max_hp; assert.strictEqual(g95.add_status({ id: "faint", is_faint: true, duration: 3000, downside: true }), false, "95 层不吃昏迷");
        // 增减益照常生效
        const g50 = at(50); const ds0 = g50.ds; g50.add_status({ id: "x", name: "x", duration: 5000, downside: true, prop: { ds_per: -50 } }); g50.recount();
        assert.strictEqual(g50.ds, Math.round(ds0 / 2));
        // 第一百层 / 上 1~5 层
        const t100 = NPC.CLONE("pub/wudao_boss100"); t100.init_from(null);
        assert.ok(t100.gj === Math.round(115000 * K) && t100.mz === 195000 && t100.ds === 55000 && t100.max_hp === 12500000, [t100.gj, t100.mz, t100.ds, t100.max_hp].join("/"));
        assert.strictEqual(t100.max_mp, 1500000, "第一百层内力按武帝玩家量给，不按血量一半");
        assert.ok(t100.skills.liumaishenjian.level === 5000 && t100.skills.force.level === 4000);
        let last = t100;
        for (let k = 1; k <= 5; k++) {
            const b = NPC.CLONE("pub/wudao_boss100"); b.init_from(null, k);
            assert.strictEqual(b.max_hp, 30000000 + (k - 1) * 5000000, "上" + k + "层气血");
            assert.strictEqual(b.gj, Math.round(115000 * (1 + 0.1 * k) * K));
            assert.strictEqual(b.skills.liumaishenjian.level, 5000 + (k - 1) * 500);
            assert.ok(b.gj > last.gj); last = b;
        }
        assert.ok(/npc\.init_from\(me, level\)/.test(require("fs").readFileSync(__dirname + "/../world/map/wudao/ta2.js", "utf8")), "上 N 层把层号传给守护者");
    });
    check("移花接木：无移花时绝招照常生效；移花增益期间化解对方下一招后增益结束，减益保留", () => {
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
        assert.ok(!statusOf(a, "yihua_self"), "化解后自身移花增益立即结束");
        assert.ok(statusOf(b, "yihua_debuff"), "对方的移花减益是单纯减益，不随化解移除");
        assert.strictEqual(b.use_pfm(a, pfm, 100, "unarmed"), true);
        assert.strictEqual(pfm.used, 2, "之后的绝招照常生效");
        // 3) 护体仍在、对方减益已被驱散：仍化解下一招（护体期间生效，不依赖对方减益），护体随即结束
        SKILL.get("yihuajiemu").pfm.pfm1.use(a, b, 1000);
        b.remove_status("yihua_debuff", true);
        b.use_pfm(a, pfm, 100, "unarmed");
        assert.strictEqual(pfm.used, 2, "护体期间对方减益已消失也照样化解");
        assert.ok(!statusOf(a, "yihua_self"), "化解后护体结束");
        b.use_pfm(a, pfm, 100, "unarmed");
        assert.strictEqual(pfm.used, 3, "护体结束后照常生效");
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
        assert.strictEqual(statusOf(a, "hanbing").do_force_attack(a, b, {}), 4000, "附加伤害写在状态上，融入自创武学同样生效");
        const g0 = b.gjsd;
        b.do_attack({ target: a, gj: 1000, mz: 1e9, no_dodge: true, no_parry: true });
        assert.ok(statusOf(b, "hanbing_slow"), "攻击者被冻结");
        assert.ok(b.gjsd > g0, "攻击间隔变长");
    });
    check("神霄九灭(含进阶)·阳雷：阳雷状态在每次攻击结算时附加当前内力伤害", () => {
        for (const id of ["shenxiaojiumie", "shenxiaojiumie2"]) {
            const sk = SKILL.get(id);
            assert.ok(!sk.on_force_over, id + " 不再依赖内功位钩子");
            const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
            a.max_mp = a.mp = 100000;
            sk.pfm.yanglei.use(a, b, 1000);
            const hp0 = b.hp; b.fy = 0; b.diff_sh_per = 0;
            a.status.find(x => x.id.indexOf("shenxiao_yanglei") === 0).on_attack_over(a, b, {}, 100);   // 阳雷写在状态上，融入自创武学同样生效
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
