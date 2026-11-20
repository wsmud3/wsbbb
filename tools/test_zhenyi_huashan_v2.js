// 华山 v2 真意 / 禁地机关 / 试炼化身 的离线回归测试。无需任何游戏账号。
// 运行：node tools/test_zhenyi_huashan_v2.js
const assert = require("assert");
const fs = require("fs");
const path = require("path");

global.WORLD = { COMMANDS: {} };
global.UTIL = { diff_time() { return 0; } };
global.WEAPON_TYPE = { NONE: 0 };
global.FAMILIES = { HUASHAN: { id: "HUASHAN", name: "华山派", boss_skills2: [["sword", 5000], ["literate", 5000], ["dugujiujian3", 5000, ["sword", "parry"]]] } };
require("../world/zhenyi.js");
const Z = WORLD.ZHENYI, HS = Z.DATA.HUASHAN;
const intent = id => HS.list.find(x => x.id === id);
const stage = id => Z.find_trial(HS, id);

let clock = 1000000;
Date.now = () => clock;

function actor(opts = {}) {
    const a = {
        id: opts.id || "p" + Math.random(), is_player: opts.is_player !== false, family: { id: "HUASHAN" }, level: 5, user_level: 0,
        hp: 1000000, max_hp: 1000000, mp: 100000, max_mp: 100000, gj: 100000,
        temp: { wd100: 1 }, status: [], messages: [], commands: [], taken: [],
        query_temp(k, d) { const v = this.temp[k]; return v === undefined ? d : v; },
        set_temp(k, v) { this.temp[k] = v; return v; },
        add_temp(k, v) { this.temp[k] = (this.temp[k] || 0) + v; return this.temp[k]; },
        remove_temp(k) { delete this.temp[k]; },
        query_bool() { return true; }, set_bool() {},
        notify(m) { this.messages.push(m); }, send() {}, send_combat(m) { this.messages.push(m); },
        send_commands(...args) { this.commands.push(args); },
        is_fighting() { return false; },
        add_status(b) { this.status.push(b); return true; },
        remove_status(id) { this.status = this.status.filter(s => s.id !== id); },
        query_status(id) { return this.status.some(s => s.id === id) ? 1 : 0; },
        clear_downside(type) { if (type === true) this.status = this.status.filter(s => !s.downside); this.cleared = type; },
        damage(sh, from, diffFy, ctx) { this.taken.push({ sh, from, diffFy, ctx }); this.hp -= sh; return sh; },
        damage2(sh) { this.taken.push({ sh, raw: true }); this.hp -= sh; return sh; },
        do_recover(v) { this.hp = Math.min(this.max_hp, this.hp + v); },
        add_mp(v) { this.mp += v; }
    };
    return Object.assign(a, opts.extra || {});
}
function huashan(id, level = 1) {
    const me = actor();
    me.temp["zy_jz_" + id] = 1; me.temp["zy_level_jz_" + id] = level; me.temp.zy_active = "jz_" + id;
    return me;
}
const ownSkill = me => ({ grade: 4, family: me.family });
const fakeSkill = me => ({ grade: 4, family: me.family, id: "x" });

// ---------- 1. 数值框架 ----------
for (const it of HS.list) {
    const l1 = Z.values_for(HS, it, 1), l10 = Z.values_for(HS, it, 10);
    for (let lv = 1; lv <= 10; lv++) {
        const v = Z.values_for(HS, it, lv);
        for (const [k, n] of Object.entries(v)) assert.ok(Number.isInteger(n), `${it.effect} ${lv}重 ${k} 非整数`);
        assert.ok(!/\d+\.\d+/.test(Z.describe(HS, it, lv)), `${it.effect} ${lv}重描述含小数`);
        assert.ok(!Z.describe(HS, it, lv).startsWith("此真意当前没有"), `${it.effect} 缺少描述`);
    }
    for (const k of Object.keys(l1)) {
        if (l1[k] > 0 && l10[k] !== l1[k]) assert.ok(l10[k] / l1[k] <= 2.5, `${it.effect}.${k} 十重/一重 = ${l10[k] / l1[k]}，超过 2.5 倍`);
    }
}
// 旧门派公式保持不变（武当借力十重 49%）
assert.strictEqual(Z.values_for(Z.DATA.WUDANG, Z.DATA.WUDANG.list[0], 10).damage, 49, "非 v2 门派数值不得变化");

// ---------- 6. 无剑·无招：不拘兵器施展剑法绝招 ----------
{
    assert.strictEqual(intent(5).effect, "jz_swordless");
    assert.ok(Z.describe(HS, intent(5), 1).startsWith("灭烛见真火，忘剑得神兵。"), "说明带典故");
    assert.ok(Z.weapon_free(huashan(5), "sword"), "启用无剑：剑法绝招不拘兵器");
    assert.ok(!Z.weapon_free(huashan(5), "blade"), "只放开剑，刀等其他兵器照旧");
    assert.ok(!Z.weapon_free(huashan(4), "sword"), "启用其他真意时不生效");
    const lv0 = huashan(5); delete lv0.temp.zy_level_jz_5; delete lv0.temp.zy_jz_5;
    assert.ok(!Z.weapon_free(lv0, "sword"), "未获得该真意不生效");
    // 旧版低血领域已移除：跌破 20% 不再清负面、不再还击
    const me = huashan(5), foe = actor({ is_player: false });
    me.hp = 250000; me.status.push({ id: "busy", downside: true });
    Z.modify_damage(me, foe, 100000);
    assert.ok(me.status.some(s => s.id === "busy") && !foe.taken.length, "不再触发旧版无剑之境");
}

// ---------- 7. 禁地机关 ----------
{
    global.ROOM = { Get: p => ({ name: p, parent: { rooms: [] }, query_copy() {} }) };
    const me = huashan(1); delete me.temp.zy_jz_1; delete me.temp.zy_level_jz_1; delete me.temp.zy_active;
    me.environment = { parent: { id: "jz" } };
    assert.strictEqual(Z.puzzle_solved(me, HS, 1), false);
    assert.strictEqual(Z.start_trial(me, 1), false, "未解机关不能首次挑战");
    assert.ok(me.messages.pop().includes("参透机关"));
    assert.strictEqual(Z.puzzle_gate(me, "jz", 1, "north"), false, "未解机关拦住北面出口");
    assert.strictEqual(Z.puzzle_gate(me, "jz", 1, "south"), true, "回头路不拦");
    const other = huashan(1); delete other.temp.zy_jz_1;
    Z.solve_puzzle(me, "jz", 1);
    assert.strictEqual(Z.puzzle_solved(me, HS, 1), true);
    assert.strictEqual(Z.puzzle_solved(other, HS, 1), false, "机关进度按玩家记录，互不影响");
    const veteran = huashan(5);
    assert.strictEqual(Z.puzzle_solved(veteran, HS, 1), true, "已领悟无剑的老角色视为五处机关都已解");
    Z.solve_puzzle(me, "jz", 3, { hp: 60 });
    assert.strictEqual(Z.trial_hp_scale(me, HS, stage(3)), HS.trialHpScale * 0.6, "献祭抉择影响化身气血");
    assert.strictEqual(Z.trial_hp_scale(me, HS, stage(2)), HS.trialHpScale);

    // 房间脚本：利剑阁 / 软剑阁 走一遍
    function loadRoom(file) {
        const room = { actions: {}, inherits() {}, add_action(c, n, f) { this.actions[c] = f; }, set_npc() {}, set_item() {} };
        new Function("WORLD", "WEAPON_TYPE", fs.readFileSync(path.join(__dirname, "../world/map/jz", file), "utf8")).call(room, WORLD, WEAPON_TYPE);
        return room;
    }
    const lj = loadRoom("lijiange.js"), p = huashan(1); delete p.temp.zy_jz_1;
    lj.actions.jz_walls.call(lj, p);
    const answer = p.temp.zy_pzs_jz_1, wrong = ["east", "south", "west", "north"].find(d => d !== answer);
    assert.ok(p.messages.pop().includes("径直穿过"), "察看四壁时给出正确提示");
    assert.strictEqual(p.commands.pop().length, 8, "给出四个方向按钮");
    assert.strictEqual(lj.zy_puzzle(p, wrong), false);
    assert.ok(p.hp < p.max_hp, "选错受剑气所伤");
    lj.actions.jz_walls.call(lj, p);
    assert.ok(lj.zy_puzzle(p, p.temp.zy_pzs_jz_1));
    assert.ok(Z.puzzle_solved(p, HS, 1), "利剑阁解开");

    const rj = loadRoom("ruanjiange.js"), q = huashan(2); delete q.temp.zy_jz_2;
    rj.actions.jz_sword.call(rj, q);
    const seq = q.temp.zy_pzs_jz_2.split(",").map(Number);
    assert.strictEqual(rj.zy_puzzle(q, String((seq[0] + 1) % 9 === seq[0] ? 0 : [0,1,2,3,4,5,6,7,8].find(n => n !== seq[0]))), false, "踩错重置");
    rj.actions.jz_sword.call(rj, q);
    q.temp.zy_pzs_jz_2.split(",").forEach(n => rj.zy_puzzle(q, n));
    assert.ok(Z.puzzle_solved(q, HS, 2), "软剑阁按序踩完解开");

    const mj = loadRoom("mujiange.js"), w = huashan(4); delete w.temp.zy_jz_4;
    w.query_weapon = () => ({ weapon_type: 1 });
    mj.actions.jz_sit.call(mj, w);
    assert.ok(!Z.puzzle_solved(w, HS, 4), "持兵器盘坐不能通过");
    w.query_weapon = () => null;
    mj.actions.jz_sit.call(mj, w);
    assert.ok(Z.puzzle_solved(w, HS, 4), "卸下兵器后通过");

    // 剑渊谷底：紫薇软剑残片——5 分钟内受到剑魔的伤害降低 20%
    const jy = loadRoom("jianyuandi.js"), zp = huashan(1);
    jy.actions.pick_fragment.call(jy, zp);
    const zw = zp.status.find(x => x.id === "jz_ziwei");
    assert.ok(zw && zw.duration === 300000 && zw.desc === "一股剑意充斥着丹田，你感到对剑的领悟更深一层！", "拾取残片获得紫薇剑意 5 分钟");
    assert.strictEqual(zw.on_damage(zp, { is_zhenyi_trial: true, trial_key: "jz", trial_id: 5 }, 1000), 800, "受到剑魔伤害降低 20%");
    assert.strictEqual(zw.on_damage(zp, { is_zhenyi_trial: true, trial_key: "jz", trial_id: 2 }, 1000), 1000, "其他化身不受影响");

    // 无剑虚空：谦卑线点化 + 参悟（不领悟、不放行），骄傲线当场开战
    const wx = loadRoom("wujianxukong.js"), h = huashan(5); delete h.temp.zy_jz_5; delete h.temp.zy_level_jz_5; delete h.temp.zy_active;
    [1, 2, 3, 4].forEach(n => { h.temp["zy_stage_jz_" + n] = 1; });
    wx.zy_puzzle(h, "humble");
    const cw = h.status.find(x => x.id === "jz_canwu");
    assert.ok(h.messages.some(m => m.includes("长叹一声") && m.includes("重剑无锋，大巧不工")), "谦卑线以剑冢铭文点化");
    assert.deepStrictEqual(cw && [cw.duration, cw.prop.int, cw.prop.lianxi_per, cw.prop.study_per, cw.prop.dazuo_per], [3600000, 500, 100, 100, 100], "参悟：一小时、悟性+500、练习学习打坐+100%");
    assert.ok(!Z.puzzle_solved(h, HS, 5) && !Z.get_level(h, "jz", 5), "谦卑线不领悟无剑、不放行");
    // 参悟存档：到期时间记在 temp（会存档），下线后状态丢失，登录时按剩余时间重挂，到期则不再挂
    h.status = []; h.temp.zy_buff_jz_canwu = { v: 1, e: clock + 600000 };
    Z.restore_timed_buffs(h);
    assert.ok(h.status.some(x => x.id === "jz_canwu" && x.duration === 600000 && x.prop.int === 500), "上线按剩余时间恢复参悟");
    h.status = []; h.temp.zy_buff_jz_canwu = { v: 1, e: clock - 1 }; Z.restore_timed_buffs(h);
    assert.ok(!h.status.length, "参悟到期后上线不再恢复");
    h.status = []; wx.zy_puzzle(h, "humble");
    assert.ok(!h.status.length, "参悟每日一次");
    let started = 0; const st0 = Z.start_trial; Z.start_trial = (m, id) => { started = id; return true; };
    try { wx.zy_puzzle(h, "proud"); } finally { Z.start_trial = st0; }
    assert.ok(Z.puzzle_solved(h, HS, 5) && started === 5, "骄傲线当场开启第五关化身之战");
    assert.ok(!h.commands.some(c => c[0] === "zhenyi challenge 5"), "骄傲线不再弹出开启试炼按钮");
}

// ---------- 7b. 剑冢五关：解一处机关，现一道化身；五关全过领悟无剑 ----------
{
    assert.strictEqual(HS.list.length, 1, "华山只剩一道真意");
    assert.deepStrictEqual(HS.stages.map(x => x.mode), ["precision", "counter", "burst", "insight", "jianmo"]);
    const me = huashan(1); delete me.temp.zy_jz_1; delete me.temp.zy_level_jz_1; delete me.temp.zy_active;
    me.environment = { parent: { id: "jz" } };
    const pass = n => { delete me.temp.zy_trial_completed; me.temp.zy_trial_active = "jz_" + n; return Z.complete_trial(me, "jz", n); };
    Z.solve_puzzle(me, "jz", 1);
    assert.strictEqual(me.commands.pop()[0], "zhenyi challenge 1", "解开机关后询问是否开启该关试炼");
    assert.strictEqual(Z.puzzle_gate(me, "jz", 1, "north"), false, "未击败化身不能往深处走");
    assert.strictEqual(me.commands.pop()[0], "zhenyi challenge 1", "回到关前仍可开启试炼");
    assert.ok(pass(1));
    assert.ok(Z.stage_cleared(me, "jz", 1) && Z.puzzle_gate(me, "jz", 1, "north"), "过关后放行");
    assert.strictEqual(Z.get_level(me, "jz", 5), 0, "前几关不领悟真意");
    delete me.temp.zy_trial_active; delete me.temp.zy_trial_completed;
    Z.solve_puzzle(me, "jz", 3);
    assert.strictEqual(Z.start_trial(me, 3), false, "不能跳关");
    assert.ok(me.messages.pop().includes("须先闯过【软剑回环】"));
    assert.strictEqual(Z.start_trial(me, 1), false, "已过的关不再开启");
    for (const n of [2, 3, 4]) { assert.ok(pass(n)); assert.strictEqual(Z.get_level(me, "jz", 5), 0); }
    assert.ok(pass(5));
    assert.strictEqual(Z.get_level(me, "jz", 5), 1, "第五关通过即领悟无剑");
    assert.ok(me.messages.some(m => m.includes("灭烛见真火，忘剑得神兵")), "领悟时带典故");
    me.is_fighting = () => false;
    assert.strictEqual(Z.sweep(me, 5, 1), false, "五关只需闯过一次，不能扫荡");
    assert.strictEqual(Z.request_upgrade(me, 5), false, "不分重数，不能升级");
    me.temp.zy_active = "jz_5";
    const panel = Z.serialize(me);
    assert.ok(panel.list.length === 1 && panel.list[0].mechanic_only && panel.list[0].no_level && panel.list[0].acquired, "面板只有一道纯机制真意");

    // 旧档：领悟过的其他真意折算为对应关卡已过，旧数据清除，启用中的旧真意卸下
    const old = huashan(2); old.temp.zy_jz_1 = 1; old.temp.zy_level_jz_1 = 4; old.temp.zy_jz_3 = 1; delete old.temp.zy_migrate_version;
    Z.migrate(old);
    assert.ok([1, 2, 3].every(n => Z.stage_cleared(old, "jz", n)) && !Z.stage_cleared(old, "jz", 4), "旧真意折算为关卡进度");
    assert.ok(!old.temp.zy_jz_1 && !old.temp.zy_jz_2 && !old.temp.zy_level_jz_1 && !old.temp.zy_active, "旧真意数据清除、卸下");
    assert.strictEqual(Z.get_level(old, "jz", 5), 0);
    const vet = huashan(5); delete vet.temp.zy_migrate_version; Z.migrate(vet);
    assert.ok(Z.get_level(vet, "jz", 5) === 1 && vet.temp.zy_active === "jz_5" && [1, 2, 3, 4, 5].every(n => Z.stage_cleared(vet, "jz", n)), "已领悟无剑者原样保留");
}

// ---------- 7c. 通关后重游剑冢：从第一关重走 / 直达第五关 ----------
{
    const me = huashan(5); me.environment = { parent: { id: "jz" }, path: "jz/lijiange" }; me.moveto = function (r) { this.environment = { parent: { id: "jz" }, path: r }; };
    assert.ok(Z.offer_replay(me) && me.commands.pop().some(x => x === "zhenyi replay 5"), "通关后可在第一关处选择重游");
    assert.ok(Z.start_replay(me, 5));
    assert.strictEqual(me.environment.path, "jz/wujianxukong", "直达无剑虚空");
    assert.ok([1, 2, 3, 4].every(n => Z.stage_cleared(me, "jz", n)) && !Z.stage_cleared(me, "jz", 5), "只重打第五关");
    assert.strictEqual(Z.get_level(me, "jz", 5), 1, "重游不影响已领悟的真意");
    me.temp.zy_trial_active = "jz_5"; Z.complete_trial(me, "jz", 5);
    assert.ok(!me.temp.zy_replay_jz && Z.stage_cleared(me, "jz", 5), "打完第五关自动结束重游");
    delete me.temp.zy_trial_active; delete me.temp.zy_trial_completed;
    Z.start_replay(me, 1);
    assert.ok(!Z.puzzle_solved(me, HS, 1) && Z.puzzle_gate(me, "jz", 1, "north") === false, "从第一关重走：机关与关门重新封闭");
    Z.start_replay(me, "off");
    assert.ok(Z.puzzle_gate(me, "jz", 1, "north") && !me.temp.zy_replay_jz, "放弃重走后恢复");
    const fresh = huashan(1); delete fresh.temp.zy_jz_1; fresh.environment = { parent: { id: "jz" } };
    assert.strictEqual(Z.start_replay(fresh, 1), false, "未通关者不能重游");
}

// ---------- 7d. 首通奖励：领过记标记；更新前已通关的老角色可补领一次 ----------
{
    const old = huashan(5); old.items = []; old.add_obj = function (path, n) { const it = { path, count: n, name: "残页" }; this.items.push(it); return it; };
    assert.ok(Z.claim_first_clear_reward(old) && old.items[0].count === 200, "老角色补领 200 张");
    assert.ok(!Z.claim_first_clear_reward(old) && old.items.length === 1, "只能补领一次");
    const fresh = huashan(1); delete fresh.temp.zy_jz_1; fresh.add_obj = old.add_obj; fresh.items = [];
    assert.ok(!Z.claim_first_clear_reward(fresh), "未通关不能领");
}

// ---------- 7e. 剑魔：放弃算整个剑冢试炼失败，五关进度清零 ----------
{
    const me = huashan(1); delete me.temp.zy_jz_1; delete me.temp.zy_level_jz_1; delete me.temp.zy_active;
    [1, 2, 3, 4].forEach(n => { me.temp["zy_stage_jz_" + n] = 1; me.temp["zy_pz_jz_" + n] = 1; });
    me.temp.zy_trial_active = "jz_5"; me.call_out = () => {};
    assert.ok(Z.quit_trial(me), "剑魔关可主动放弃");
    assert.ok([1, 2, 3, 4].every(n => !Z.stage_cleared(me, "jz", n) && !Z.puzzle_solved(me, HS, n)), "五关进度与机关全部清零");
    assert.strictEqual(me.temp.zy_trial_quit_to, "jindi/huashan", "放弃后送到云湺山剑庐");
}

// ---------- 8. 试炼化身 v2 机制 ----------
{
    let timers = [];
    function npc() {
        const n = actor({ is_player: false });
        Object.assign(n, {
            is_zhenyi_trial: true, inherits() {}, set(o) { Object.assign(this, o); }, skill_map() { this.mapped = [...arguments]; },
            add_hp(v) { this.hp += v; return v; }, add_prop(k, v) { this.props = this.props || {}; this.props[k] = (this.props[k] || 0) + v; },
            init() {}, recount() {}, destroy() { this.destroyed = true; }, end_fight() {},
            call_out(fn, ms) { const t = { fn: fn.bind(this), at: clock + ms }; timers.push(t); return t; }
        });
        new Function("NPC", fs.readFileSync(path.join(__dirname, "../world/npc/pub/zhenyi_trial.js"), "utf8")).call(n, {});
        return n;
    }
    global.clearTimeout = t => { timers = timers.filter(x => x !== t); };
    const run = ms => { const end = clock + ms; for (;;) { timers.sort((a, b) => a.at - b.at); const t = timers[0]; if (!t || t.at > end) break; timers.shift(); clock = t.at; t.fn(); } clock = end; };

    // precision：剑罡
    let me = huashan(1), n = npc(); delete me.temp.zy_jz_1; delete me.temp.zy_active;
    n.init_trial(me, HS, stage(1)); n.environment = me.environment = {};
    assert.ok(n.mapped.some(r => r[0] === "dugujiujian3") && !n.mapped.some(r => r[0] === "literate"), "v2 化身使用本门武学");
    assert.strictEqual(n.max_hp, Math.floor(12000000 * HS.trialHpScale));
    assert.ok(!/抉择影响/.test(n.desc), "未做抉择时化身描述不提抉择");
    { const m2 = huashan(3); m2.temp.zy_pzhp_jz_3 = 60; const n2 = npc(); n2.init_trial(m2, HS, stage(3));
      assert.ok(n2.desc.includes("化身气血为原本的60%"), "献祭后化身描述写明气血比例"); }
    run(5000);
    assert.ok(n.v2.guard, "开场后凝聚剑罡");
    { const h0 = n.hp; n.add_hp(-1000); assert.strictEqual(h0 - n.hp, 200, "剑罡期间伤害降低 80%（挂在 add_hp，damage2/3 也绕不过）"); }
    { const st = n.v2.guard; n.v2.guard = false; const cap = Math.floor(n.max_hp * n.V2.HIT_CAP), h0 = n.hp;
      n.add_hp(-cap * 11); assert.strictEqual(h0 - n.hp, Math.floor(cap + cap * 10 * n.V2.HIT_OVER), "单次扣血超出软上限的部分按比例计入");
      n.hp = h0; n.add_hp(500); n.hp = h0; n.v2.guard = st; }
    assert.strictEqual(n.props.diff_busy_per, n.V2.DIFF_BUSY_PER, "v2 化身带忽视忙乱");
    assert.strictEqual(n.props.diff_fy_per, 70, "v2 化身带 70% 无视防御（挑战者须 170% 免伤才免疫）");
    assert.ok(n.desc.includes("70%无视防御"), "化身说明写明无视防御");
    n.trial_on_hit(me, false); n.trial_on_hit(me, false); n.trial_on_hit(me, true);
    assert.ok(!n.v2.guard, "连中三次破罡");

    // counter：剑势
    timers = []; me = huashan(2); n = npc(); n.init_trial(me, HS, stage(2)); n.environment = me.environment = {};
    run(15000);
    assert.strictEqual(n.v2.momentum, 3); assert.ok(n.gj > n.base_gj);
    n.trial_on_hit(me, false);
    assert.strictEqual(n.v2.momentum, 3, "没有先出绝招时普攻不能卸势");
    n.trial_on_hit(me, true); clock += 2000; n.trial_on_hit(me, false);
    assert.strictEqual(n.v2.momentum, 0, "绝招后 4 秒内普攻卸去剑势"); assert.strictEqual(n.gj, n.base_gj);

    // burst：回元 + 重击闪避
    timers = []; me = huashan(3); n = npc(); n.init_trial(me, HS, stage(3)); n.environment = me.environment = {};
    n.hp = n.max_hp / 2; run(5000);
    assert.ok(n.hp > n.max_hp / 2, "未受内伤时回元");
    const hpBefore = n.hp; n.trial_on_hit(me, true); run(5000);
    assert.strictEqual(n.hp, hpBefore, "绝招命中后 10 秒内不能回元");
    run(10000); // t=20s 重击预警
    assert.ok(n.v2.strikePending && !me.commands.some(c => /trial_dodge/.test(c[0])), "重击有蓄力预警，但不弹出临时按钮");
    me.ds = n.mz * 3; const myHp = me.hp; run(3000);
    assert.strictEqual(me.hp, myHp, "躲闪远高于化身命中时必定躲开重击");
    me.ds = 0; run(17000);
    const hp2 = me.hp; run(3000);
    assert.strictEqual(hp2 - me.hp, Math.floor(me.max_hp * n.V2.STRIKE_PCT.burst), "躲闪不足时承受重击");
    run(17000); assert.ok(n.v2.strikePending); n.trial_on_hit(me, true);
    const hp3 = me.hp; run(3000);
    assert.strictEqual(me.hp, hp3, "蓄力期间绝招命中可打断重击");
    assert.ok(/最大气血20%/.test(n.v2_rule_text("burst")) && /万剑归宗（最大气血30%）/.test(n.v2_rule_text("master")), "考题说明数值取自参数");

    // endure：剑意冲击
    timers = []; me = huashan(4); n = npc(); n.init_trial(me, HS, Object.assign({}, stage(4), { mode: "endure" })); n.environment = me.environment = {};   // 坚持类考法（华山第四关已改为悟性考校，其他门派仍用）
    let h = me.hp; run(10000);
    assert.strictEqual(h - me.hp, Math.floor(me.max_hp * 0.15), "无护体全额冲击");
    me.status.push({ id: "force" }); h = me.hp; run(10000);
    assert.strictEqual(h - me.hp, Math.floor(me.max_hp * 0.15 / 3), "紫气东来护体时冲击减为三分之一");

    // insight：木剑守拙——先天悟性 × 后天悟性 ≥ 10 万才出剑；一剑为最大气血 100%，只受伤害减免影响
    {
        const calls = []; const f0 = Z.fail_trial, c0 = Z.complete_trial;
        Z.fail_trial = m => calls.push("fail"); Z.complete_trial = () => calls.push("done");
        try {
            timers = []; me = huashan(4); n = npc(); me.add_hp = function (v) { this.hp += v; return v; }; me.int = 20; me.query_prop = () => 0;
            n.init_trial(me, HS, stage(4)); n.environment = me.environment = {};
            run(3000);
            assert.deepStrictEqual(calls, ["fail"], "悟性不足：领悟失败");
            assert.ok(me.messages.some(m => /冥思苦想半天，终究未能领悟其中奥妙/.test(m)));
            calls.length = 0; timers = []; me = huashan(4); n = npc(); me.add_hp = function (v) { this.hp += v; return v; }; me.int = 200; me.query_prop = k => k === "int" ? 500 : 0; me.diff_sh_per = 40;
            n.init_trial(me, HS, stage(4)); n.environment = me.environment = {};
            run(3000);
            assert.deepStrictEqual(calls, ["done"], "悟性足够且接下一剑：通过");
            assert.strictEqual(me.hp, 1000000 - 600000, "一剑为最大气血 100%，只按伤害减免 40% 降低");
            calls.length = 0; timers = []; me = huashan(4); n = npc(); me.add_hp = function (v) { this.hp += v; return v; }; me.int = 200; me.query_prop = k => k === "int" ? 500 : 0; me.diff_sh_per = 0;
            n.init_trial(me, HS, stage(4)); n.environment = me.environment = {};
            run(3000);
            assert.ok(calls[0] === "fail" && me.hp === 1, "接不下：留 1 点气血并判定失败");
        } finally { Z.fail_trial = f0; Z.complete_trial = c0; }
    }

    // 非 v2 门派化身行为不变
    timers = []; me = actor(); me.family = { id: "WUDANG" }; n = npc(); n.init_trial(me, Z.DATA.WUDANG, Z.DATA.WUDANG.list[0]);
    assert.ok(!n.v2 && n.mapped.some(r => r[0] === "jiuyinshengong"), "旧门派仍用原化身");
}

// ---------- 9. GM 旁路 ----------
{
    const low = huashan(5); low.level = 1; delete low.temp.wd100;
    assert.strictEqual(Z.get_active(low), null, "未达条件不生效");
    low.temp.zy_gm_bypass = 1;
    assert.strictEqual(Z.get_active(low), null, "普通玩家即使有标记也不能旁路");
    low.user_level = 5;
    assert.ok(Z.get_active(low), "GM 开启旁路后视为满足条件");
}

console.log("华山 v2 通过：数值框架（十重≤2.5倍一重）、无剑不拘兵器、剑冢五关（机关 + 化身）、化身考题机制、GM 测试旁路均正常；旧门派数值与化身未变。");

// ---------- 九阳护体持续时间上限 ----------
{
    const src = fs.readFileSync(path.join(__dirname, "../world/skill/force/jiuyangshengong.js"), "utf8");
    const sk = { inherits() {} }; new Function("SKILL", "FAMILIES", "SKILL_TYPES", src).call(sk, {}, {}, {});
    const st = []; const me = { send_room() {}, add_status(b) { st.push(b); } };
    sk.pfm.huti.use(me, null, 3000); sk.pfm.huti.use(me, null, 1000); sk.pfm.huti.use(me, null, 500);
    assert.deepStrictEqual(st.map(b => b.duration), [10000, 10000, 5000], "九阳护体最长 10 秒，1000 级封顶");
    assert.ok(sk.pfm.huti.query_desc(me, 3000).includes("10秒"), "九阳护体说明随上限显示 10 秒");
    console.log("九阳护体上限：通过");
}
