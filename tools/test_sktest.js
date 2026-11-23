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

    check("技能范围：10 门基础 + 全部公共武学（不属于门派），不含门派、NPC 专用、自创", () => {
        for (const b of ["force", "dodge", "parry", "sword", "blade", "club", "staff", "whip", "unarmed", "throwing"]) assert.ok(ids.includes(b), b);
        for (const id of ["bite", "lvliu_force", "lvliu_sword", "xuanmingshenzhang_m"]) assert.ok(!ids.includes(id), id + " 是怪物/NPC 专用，不应在名单里");
        for (const id of ["literate", "lianyao", "lunyu"]) assert.ok(ids.includes(id), id + " 知识技能要包含");
        for (const id of ids) assert.ok(SKILL.get(id).family !== FAMILIES.MONSTER, id + " 是怪物技能");
        for (const id of ["anranxiaohunzhang", "liumaishenjian", "hujiadaofa", "jiuyangshengong", "bixiejianfa", "xiuluodao"]) assert.ok(ids.includes(id), id + " 是公共武学");
        // 与游戏自己的公共技能池一致：FAMILIES.NONE 下所有非隐藏的武学都要在
        const pool = Object.values(WORLD.SKILLS).filter(s => s.type !== SKILL_TYPES.BASE && !s.is_custom && !s.is_hidden && (!s.family || s.family === FAMILIES.NONE));
        for (const s of pool) assert.ok(ids.includes(s.id), s.id + "(" + s.name + ") 漏了");
        for (const id of ids) { const s = SKILL.get(id); assert.ok(s.type === SKILL_TYPES.BASE || s.is_public || !s.family || s.family === FAMILIES.NONE, id + " 是门派武学"); }
        assert.ok(ids.length > 100, "共 " + ids.length + " 门");
    });
    check("原有技能（含门派武学、知识）也设为固定等级；客户端收到刷新", () => {
        const me = mkUser(); me.user_level = 5;
        me.skills.huashanjianfa = { level: 120, exp: 5 }; me.skills.force = { level: 50, exp: 0 };
        cmd.enter(me, "fix");
        for (const id of ["huashanjianfa", "literate", "force"]) assert.strictEqual(me.skills[id].level, 3000, id);
        assert.ok(lvOf(me).every(l => l === 3000));
        assert.ok(me.log.some(t => /dialog:"skills",item:\{"id":"hujiadaofa"/.test(t)), "新学技能推送给客户端");
        assert.ok(me.log.some(t => /dialog:"skills",id:"huashanjianfa",level:3000/.test(t)), "原有技能等级推送给客户端");
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
        assert.deepStrictEqual(got, { "book/wudao": 10000, "st/yuanjing": 10000, "cash/tuoli": 1,
            "cash/test_jing": 2, "cash/test_saodang": 2, "cash/test_xi": 2, "cash/test_bian": 2 });   // mock 的 add_obj 不进背包，所以第二次 fix 也会补
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
    check("金古易：测试号可自由调整境界、无限领玄晶；按钮只对测试号可见，普通玩家不行", () => {
        const npc = NPC.CLONE("yz/zhubanxian");
        const t = mkUser(); t.user_level = 5; cmd.enter(t, "fix");
        const n = mkUser(); n.level = 1;
        const act = (me, c) => me.do_item_action(npc, c, [me]);
        // 按钮
        const tj = JSON.parse(npc.query_commands(t)), nj = JSON.parse(npc.query_commands(n));
        assert.ok(tj.commands.some(c => /调整境界/.test(c.name)) && tj.commands.some(c => /领取玄晶/.test(c.name)), "测试号看到测试按钮");
        assert.ok(!nj.commands.some(c => /测试|sktlv|sktxj|sktlevel/.test(c.name + c.cmd)), "普通玩家看不到任何测试按钮：" + JSON.stringify(nj.commands.map(c => c.name)));
        assert.ok(!JSON.parse(npc.query_commands(n)).commands.some(c => /测试/.test(c.name)), "测试号先点过也不会污染普通玩家的缓存");
        // 调整境界
        act(t, "sktlv5"); assert.strictEqual(t.level, 5);
        act(t, "sktlv0"); assert.strictEqual(t.level, 0);
        act(n, "sktlv6"); assert.strictEqual(n.level, 1, "普通玩家不能调境界");
        let cmds = null; t.send_commands = (...a) => { cmds = a; };
        act(t, "sktlevel");
        assert.ok(cmds && cmds.some(c => /^sktlv6 /.test(c)), "调整境界(测试)列出可选境界");
        // 玄晶
        const xj = me => me.items.filter(i => i.path === "st/xuanjing").reduce((a, i) => a + i.count, 0);
        act(t, "sktxj"); act(t, "sktxj"); act(t, "sktxj");
        assert.strictEqual(xj(t), 30000, "可反复领取");
        act(n, "sktxj"); assert.strictEqual(xj(n), 0, "普通玩家领不到");
    });
    // 准备一个能按正常流程过金古易考核的测试号
    const readyChar = () => {
        const me = mkUser(); me.user_level = 5;
        me.environment = { item_changed() {}, item_json() { return ""; }, send() {}, items: [], is_fb() { return false; } };
        cmd.enter(me, "fix");
        for (const [b, sk] of [["force", "jiuyangshengong"], ["unarmed", "anranxiaohunzhang"], ["sword", "xuantiejianfa"], ["parry", "qiankundanuoyi"], ["dodge", "xuanxubu"]]) me.enable_skill(b, sk);
        me.max_mp = 2000000; me.mp = me.max_mp; me.query_status = () => null;
        me.callme = me.call = () => "阁下";
        return me;
    };
    check("测试号按正常流程提升境界：每个境界的突破奖励只发一次，降境界再升不重复发", () => {
        const npc = NPC.CLONE("yz/zhubanxian"); const me = readyChar();
        let master = 0, chats = 0, tasks = 0;
        npc.send_master = () => { master++; }; npc.do_command = (c) => { if (c === "chat") chats++; };
        const realGet = USERTASK.GET; USERTASK.GET = () => ({ on_finish() { tasks++; } });
        try {
            me.set_temp("rdem", 1); me.set_temp("shjd", 3);
            me.level = 0; me.remove_temp("lvup_top");
            const up = () => npc.actions.levelup.action.call(npc, me);
            const mp0 = me.limit_mp, exp0 = me.exp;
            up(); up(); up(); up();
            assert.strictEqual(me.level, 4, "正常流程升到武圣");
            assert.strictEqual(me.limit_mp - mp0, 1000 + 5000 + 10000 + 20000, "第一次领到全部内力上限奖励");
            assert.ok(me.exp > exp0); assert.strictEqual(master, 3, "武士、武师、宗师各调一次师父奖励"); 
            assert.strictEqual(tasks, 2, "宗师结算一次衙门/师门任务"); assert.strictEqual(chats, 2, "宗师、武圣各广播一次");
            // 降回普通百姓再走一遍
            npc.actions.sktlv0.action.call(npc, me); assert.strictEqual(me.level, 0);
            const mp1 = me.limit_mp, exp1 = me.exp;
            up(); up(); up(); up();
            assert.strictEqual(me.level, 4, "进度保留（任督二脉、三花聚顶），可以再升回武圣");
            assert.strictEqual(me.limit_mp, mp1, "内力上限不再增加"); assert.strictEqual(me.exp, exp1, "经验潜能不再发");
            assert.strictEqual(master, 3, "师父奖励不重复"); assert.strictEqual(tasks, 2, "任务结算不重复"); assert.strictEqual(chats, 2, "不重复广播");
            assert.ok(me.log.some(m => /已领取过.*突破奖励/.test(m)), "提示已领过");
        } finally { USERTASK.GET = realGet; }
    });
    check("五气朝元、登临武神的进度保留：降境界后可再升武帝、武神，奖励不重复", () => {
        const npc = NPC.CLONE("yz/zhubanxian"); const me = readyChar();
        me.level = 4; me.set_temp("lvup_top", 6); me.set_temp("wd_absorbed", 0x1F);
        const mp0 = me.limit_mp, f0 = me.query_temp("fenpei", 0);
        npc.actions.levelup.action.call(npc, me);
        assert.strictEqual(me.level, 5, "五气已朝元，金古易处直接踏入武帝");
        const room = ROOM.Get("zhanshen/wushendian"); assert.ok(room, "武神殿");
        me.set_temp("zhanshen_wushen", 1);
        room.on_enter(me);
        assert.strictEqual(me.level, 6, "已登临过武神，降境界后可再次登临");
        assert.strictEqual(me.limit_mp, mp0); assert.strictEqual(me.query_temp("fenpei", 0), f0, "先天属性不重复给");
        // 首次登临照常发奖励
        const n = readyChar(); n.level = 5; n.remove_temp("lvup_top"); n.set_temp("zhanshen_tapotian", 1);
        const nm = n.limit_mp; room.on_enter(n);
        assert.strictEqual(n.level, 6); assert.strictEqual(n.limit_mp - nm, 500000, "首次登临武神照常发奖励");
    });
    check("sktest：重复 fix 不重置境界；top 可手动补记录；改境界前自动记下已领奖励", () => {
        const me = mkUser(); me.user_level = 5; me.level = 3; cmd.enter(me, "fix");
        assert.strictEqual(me.level, 1); assert.strictEqual(me.levelup_reward_top(), 3, "原境界记为已领");
        me.level = 4; cmd.enter(me, "fix"); assert.strictEqual(me.level, 4, "重复 fix 不动境界");
        cmd.enter(me, "top 6"); assert.strictEqual(me.levelup_reward_top(), 6);
        assert.ok(!mkUser().levelup_will_reward || mkUser().levelup_will_reward(), "普通新角色首次突破照常发奖励");
    });
    check("测试号：全部副本、禁地已解锁，扫荡不用先通关；真意禁地免境界与武道塔条件（门派仍须匹配）", () => {
        const t = mkUser(); t.user_level = 5; cmd.enter(t, "fix"); const n = mkUser();
        const fb = Object.assign(Object.create(AREA.prototype), { fb_index: 33 }), jd = Object.assign(Object.create(AREA.prototype), { jd_index: 3 });
        assert.ok(fb.is_unlock(t) && jd.is_unlock(t) && t.isenable_area(2), "测试号全部解锁");
        assert.ok(!fb.is_unlock(n) && !jd.is_unlock(n) && !n.isenable_area(2), "普通玩家不受影响");
        t.log = []; WORLD.COMMANDS.jh.enter(t, null, "lock");
        assert.ok(t.log.some(m => /unlock:9999,unlock2:2147483647/.test(m)), "江湖面板显示全部解锁：" + t.log.join("|"));
        const src = require("fs").readFileSync(__dirname + "/../world/cmd/action/cr.js", "utf8");
        assert.ok(/if \(me\.is_test_char && me\.is_test_char\(\)\) \{\s*\/\/ 测试号：所有副本（普通\/困难）都可直接扫荡/.test(src), "扫荡解锁检查对测试号跳过");
        const Z = WORLD.ZHENYI;
        t.family = FAMILIES.HUASHAN; t.level = 1; n.family = FAMILIES.HUASHAN; n.level = 1;
        assert.ok(Z.gm_bypass(t) && !Z.gm_bypass(n));
        assert.ok(Z.can_enter_hub(t, false), "测试号武士境界也能进云湺山");
        assert.ok(!Z.can_enter_hub(n, false), "普通玩家仍需武帝 + 武道塔");
        assert.ok(Z.can_enter_area(t, "huashan_jz", false) || Z.can_enter_area(t, Z.family_data(t).key, false), "测试号能进本门禁地");
    });
    check("九转金丹已删除：drug/exp#5 不再是九转金丹，金古易福利不再发", () => {
        const o = OBJ.CREATE("drug/exp#5");
        assert.ok(o && o.name !== "九转金丹" && o.exp < 1e6, o && o.name + " " + o.exp);
        assert.ok(!/九转金丹|exp#5/.test(require("fs").readFileSync(__dirname + "/../world/npc/yz/zhubanxian.js", "utf8")));
    });
    check("武道进阶：测试号等阶照常提升，等级不换算（保持 3000）；普通角色照旧换算", () => {
        const slot = SKILL.PROPERTIES.findIndex(d => d && d.positions && d.positions.indexOf("weapon") >= 0);
        assert.ok(slot >= 0, "找到武器部位进阶");
        const run = (fixed) => {
            const me = mkUser(); me.user_level = 5;
            if (fixed) cmd.enter(me, "fix");
            else { me.skills.hujiadaofa = { level: 3000, exp: 0 }; me.init_skill(); me.recount(); }
            const sk = me.skills.hujiadaofa; sk.addin = sk.addin || [];
            OBJ.clone_to("book/wudao", me, 100);
            const g0 = SKILL.get("hujiadaofa").query_grade(me);
            WORLD.COMMANDS.lingwu.enter(me, "hujiadaofa", "weapon", String(slot));
            return { g0, g1: SKILL.get("hujiadaofa").query_grade(me), lv: sk.level, log: me.log.join("\n") };
        };
        const t = run(true);
        assert.ok(t.g1 > t.g0, "测试号等阶提升了 " + t.g0 + "→" + t.g1 + "\n" + t.log.slice(-300));
        assert.strictEqual(t.lv, 3000, "测试号等级不变");
        const n = run(false);
        assert.ok(n.g1 > n.g0 && n.lv < 3000, "普通角色进阶后等级照旧换算：" + n.lv);
    });
    check("读书写字残页进阶：测试号等级不换算", () => {
        const me = mkUser(); me.user_level = 5; cmd.enter(me, "fix");
        const o = OBJ.CREATE("book/lt#500"); assert.ok(o && o.recalc_level, "残页可创建");
        const sk = me.skills.literate; sk.addin = [500, 501];   // 模拟等阶已提升
        o.recalc_level(me, SKILL.get("literate"), sk, 0);
        assert.strictEqual(sk.level, 3000);
        const n = mkUser(); n.skills.literate = { level: 3000, exp: 0, addin: [500, 501] };
        o.recalc_level(n, SKILL.get("literate"), n.skills.literate, 0);
        assert.ok(n.skills.literate.level < 3000, "普通角色照旧换算：" + n.skills.literate.level);
    });
    check("测试专用无限道具：不可交易、价值 0，fix 时缺哪个补哪个", () => {
        for (const path of ["cash/test_jing", "cash/test_saodang", "cash/test_xi", "cash/test_bian"]) {
            const o = OBJ.CREATE(path); assert.ok(o, path);
            assert.ok(!o.transable && !(o.value > 0), path + " 不可交易、不值钱");
        }
        const me = mkUser(); me.user_level = 5; cmd.enter(me, "fix"); cmd.enter(me, "fix");
        for (const path of ["cash/test_jing", "cash/test_saodang", "cash/test_xi", "cash/test_bian"])
            assert.strictEqual(me.items.filter(i => i.path === path).reduce((n, i) => n + (i.count || 1), 0), 1, path + " 只有 1 个");
    });
    const useItem = (me, path, par) => { const o = me.find_obj_bypath(path); WORLD.COMMANDS.use.enter(me, o.id, par); return me.find_obj_bypath(path); };
    const testChar = () => { const me = mkUser(); me.user_level = 5; me.environment = { item_changed() {}, item_json() { return ""; }, send() {}, items: [], is_fb() { return false; } }; me.is_fighting = () => false; cmd.enter(me, "fix"); return me; };
    check("无限精力丹：测试号用后精力补满且不消耗；普通玩家不能用", () => {
        const me = testChar(); me.set_temp("ex_jl", 200); assert.ok(me.query_jingli() < 100);
        assert.ok(useItem(me, "cash/test_jing"), "用后还在");
        assert.ok(me.query_jingli() >= 10000, "精力 " + me.query_jingli());
        assert.ok(useItem(me, "cash/test_jing") && me.query_jingli() >= 10000, "可反复使用");
        const n = mkUser(); n.environment = me.environment; n.is_fighting = () => false; OBJ.clone_to("cash/test_jing", n, 1); n.set_temp("ex_jl", 200);
        useItem(n, "cash/test_jing"); assert.ok(n.query_jingli() < 100, "普通玩家无效");
    });
    check("无限扫荡符：测试号扫荡用它（不消耗），没有它或普通玩家用普通扫荡符", () => {
        const cr = WORLD.COMMANDS.cr;
        const me = testChar(); const t = cr.sweep_ticket(me);
        assert.ok(t && t.unlimited && t.count > 0, "测试号用无限扫荡符");
        const n = mkUser(); OBJ.clone_to("cash/test_saodang", n, 1);
        assert.ok(!cr.sweep_ticket(n), "普通玩家持有无限扫荡符也不生效");
        OBJ.clone_to("cash/saodang", n, 3); const nt = cr.sweep_ticket(n);
        assert.ok(nt && !nt.unlimited && nt.count === 3, "普通玩家用普通扫荡符");
        const src = require("fs").readFileSync(__dirname + "/../world/cmd/action/cr.js", "utf8");
        assert.ok(/if \(!fu\.unlimited\) me\.remove_obj\(fu, 1\);/.test(src), "无限扫荡符不扣除");
        assert.ok(/var drops = area\.query_drops\(isdiff, me\);/.test(src), "掉落走同一套 query_drops");
    });
    check("无限洗髓丹：测试号确认后属性改变、丹不消耗；普通洗髓丹照旧扣除", () => {
        const me = testChar(); me.str = me.con = me.dex = me.int = 20;
        useItem(me, "cash/test_xi"); assert.ok(me.wait_input, "进入输入流程");
        me.wait_input(me, "x 30 20 15 15"); me.wait_input(me, "ok");
        assert.deepStrictEqual([me.str, me.con, me.dex, me.int], [30, 20, 15, 15]);
        assert.ok(me.find_obj_bypath("cash/test_xi"), "无限洗髓丹还在");
        OBJ.clone_to("cash/xi", me, 1);
        useItem(me, "cash/xi"); me.wait_input(me, "x 20 20 20 20"); me.wait_input(me, "ok");
        assert.ok(!me.find_obj_bypath("cash/xi"), "普通洗髓丹被扣除");
        const n = mkUser(); n.environment = me.environment; n.is_fighting = () => false; OBJ.clone_to("cash/test_xi", n, 1);
        useItem(n, "cash/test_xi"); assert.ok(!n.wait_input, "普通玩家不能用");
    });
    check("无限变性丹：测试号确认后变性、丹不消耗；普通玩家不能用", () => {
        const me = testChar(); me.gender = 1; me.add_status = () => {}; me.send_room = () => {};
        useItem(me, "cash/test_bian"); useItem(me, "cash/test_bian");
        assert.strictEqual(me.gender, 2); assert.ok(me.find_obj_bypath("cash/test_bian"), "还在");
        useItem(me, "cash/test_bian"); useItem(me, "cash/test_bian"); assert.strictEqual(me.gender, 1, "可反复使用");
        const n = mkUser(); n.gender = 1; n.environment = me.environment; n.is_fighting = () => false; OBJ.clone_to("cash/test_bian", n, 1);
        useItem(n, "cash/test_bian"); useItem(n, "cash/test_bian"); assert.strictEqual(n.gender, 1, "普通玩家无效");
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
