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
const intent = id => HS.list[id - 1];

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

// ---------- 2. 利剑·争锋：封招 ----------
{
    const me = huashan(1), foe = actor({ is_player: false });
    const v = Z.values_for(HS, intent(1), 1);
    Z.after_attack(me, foe, {}, 100, ownSkill(me)); clock += 1000;
    Z.after_attack(me, foe, {}, 100, ownSkill(me));
    assert.ok(!foe.temp.sealed_pfm, "两次命中不应封招");
    clock += 1000; Z.after_attack(me, foe, {}, 100, ownSkill(me));
    assert.strictEqual(foe.temp.sealed_pfm, 1, "5 秒内三次命中应封招");
    assert.ok(me.temp.zy_seal_cd, "封招后进入冷却");
    delete foe.temp.sealed_pfm;
    for (let i = 0; i < 3; i++) { clock += 500; Z.after_attack(me, foe, {}, 100, ownSkill(me)); }
    assert.ok(!foe.temp.sealed_pfm, "冷却期间不再封招");
    const slow = actor({ is_player: false }), me2 = huashan(1);
    for (let i = 0; i < 3; i++) { clock += 3000; Z.after_attack(me2, slow, {}, 100, ownSkill(me2)); }
    assert.ok(!slow.temp.sealed_pfm, "间隔超过窗口不应封招");
    const other = huashan(1); other.family = { id: "HUASHAN" };
    const foreign = { grade: 4, family: { id: "OTHER" } };
    const f3 = actor({ is_player: false });
    for (let i = 0; i < 3; i++) Z.after_attack(other, f3, {}, 100, foreign);
    assert.ok(!f3.temp.sealed_pfm, "外门武学不触发");
    assert.ok(v.seal >= 2 && v.cooldown === 20);
}

// ---------- 3. 软剑·缠丝：缠兵 ----------
{
    const me = huashan(2), foe = actor({ is_player: false });
    const v = Z.values_for(HS, intent(2), 1), pfm = { id: "kuangfengkuaijian/duoming" }, sk = ownSkill(me);
    assert.ok(Z.begin_pfm(me, foe, pfm, sk));
    me._zy_casting = pfm.id; Z.after_attack(me, foe, {}, 100, sk); delete me._zy_casting;
    Z.end_pfm(me, foe, pfm, sk, true);
    assert.ok(me.temp.zy_bind_ready, "剑法绝招成功后进入缠兵窗口");
    assert.ok(!foe._zy_bind, "绝招自身命中不触发缠兵");
    Z.after_attack(me, foe, {}, 100, sk);
    assert.ok(foe._zy_bind && foe._zy_bind.by === me, "窗口内普攻命中应施加缠兵");
    const dealt = Z.modify_damage(me, foe, 1000);
    assert.strictEqual(Math.round(dealt), Math.round(1000 * (1 - v.weaken / 100)), "缠兵目标对你的伤害按 weaken 降低");
    assert.strictEqual(foe.taken.length, 1, "缠兵目标攻击你时被反震");
    assert.strictEqual(foe.taken[0].sh, Math.floor(me.gj * v.reflect / 100));
    assert.strictEqual(foe.taken[0].ctx.kind, "reflect", "反震伤害标记为 reflect，防止互相反弹递归");
    Z.modify_damage(me, foe, 1000);
    assert.strictEqual(foe.taken.length, 1, "反震每秒至多一次");
    clock += v.duration * 1000 + 1;
    assert.strictEqual(Z.modify_damage(me, foe, 1000), 1000, "缠兵到期后不再减伤");
}

// ---------- 4. 重剑·崩岳：内伤 ----------
{
    const me = huashan(3), foe = actor({ is_player: false });
    foe.max_hp = foe.hp = 30000000;
    const v = Z.values_for(HS, intent(3), 1), pfm = { id: "dugujiujian/poqi" }, sk = ownSkill(me);
    Z.begin_pfm(me, foe, pfm, sk); Z.end_pfm(me, foe, pfm, sk, true);
    assert.ok(!foe._zy_rupture, "未命中不施加内伤");
    Z.begin_pfm(me, foe, pfm, sk); Z.after_attack(me, foe, {}, 100, sk); Z.end_pfm(me, foe, pfm, sk, true);
    assert.ok(foe._zy_rupture, "命中后施加内伤");
    Z.on_use_pfm(foe);
    const expect = Math.floor(Math.min(foe.max_hp * v.pct / 100, me.gj * v.cap / 100));
    assert.strictEqual(foe.taken[0].sh, expect, "内伤伤害 = min(最大气血 pct%, 攻击力 cap%)");
    assert.strictEqual(foe.taken[0].diffFy, 100, "内伤无视防御");
    clock += v.duration * 1000 + 1; Z.on_use_pfm(foe);
    assert.strictEqual(foe.taken.length, 1, "内伤到期不再触发");
}

// ---------- 5. 木剑·养意：剑意护体 ----------
{
    const me = huashan(4), v = Z.values_for(HS, intent(4), 1), pfm = { id: "zixiashengong/xi" }, sk = ownSkill(me);
    Z.begin_pfm(me, null, pfm, sk); Z.end_pfm(me, null, pfm, sk, true);
    const shield = Math.floor(me.max_hp * v.shield / 100);
    assert.strictEqual(me._zy_armor.amount, shield);
    assert.strictEqual(Z.modify_damage(me, actor(), shield - 100), 0, "护盾内伤害全部吸收");
    assert.strictEqual(Z.modify_damage(me, actor(), 1000), 900, "护盾破碎后剩余伤害照常结算");
    assert.ok(!me._zy_armor);
}

// ---------- 6. 无剑·无招：无剑之境 ----------
{
    const me = huashan(5), foe = actor({ is_player: false }), v = Z.values_for(HS, intent(5), 1);
    me.status.push({ id: "busy", downside: true });
    Z.modify_damage(me, foe, 100000);
    assert.ok(!me._zy_domain_used, "未跌破阈值不触发");
    me.hp = 250000;
    Z.modify_damage(me, foe, 100000);
    assert.ok(me._zy_domain_used, "跌破 20% 触发领域");
    assert.strictEqual(me.cleared, true, "clear_downside 必须传 true 才会真正清除负面");
    assert.ok(me.status.some(s => s.id === "zy_domain" && s.prop.ig_control), "领域期间免疫控制");
    assert.ok(!me.status.some(s => s.id === "busy"), "负面状态已清除");
    assert.strictEqual(foe.taken[0].sh, Math.floor(me.gj * v.counter / 100), "受击自动还击");
    clock += 1001; Z.modify_damage(me, foe, 1);
    assert.strictEqual(foe.taken.length, 2, "每秒至多还击一次");
    clock += v.duration * 1000; Z.modify_damage(me, foe, 1);
    assert.strictEqual(foe.taken.length, 2, "领域到期不再还击");
    Z.on_combat_end(me);
    assert.ok(!me._zy_domain_used, "每场战斗重置");
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
    const veteran = huashan(1);
    assert.strictEqual(Z.puzzle_solved(veteran, HS, 1), true, "已领悟该真意的老角色视为已解");
    Z.solve_puzzle(me, "jz", 3, { hp: 60 });
    assert.strictEqual(Z.trial_hp_scale(me, HS, intent(3)), HS.trialHpScale * 0.6, "献祭抉择影响化身气血");
    assert.strictEqual(Z.trial_hp_scale(me, HS, intent(2)), HS.trialHpScale);

    // 房间脚本：利剑阁 / 软剑阁 走一遍
    function loadRoom(file) {
        const room = { actions: {}, inherits() {}, add_action(c, n, f) { this.actions[c] = f; }, set_npc() {} };
        new Function("WORLD", "WEAPON_TYPE", fs.readFileSync(path.join(__dirname, "../world/map/jz", file), "utf8")).call(room, WORLD, WEAPON_TYPE);
        return room;
    }
    const lj = loadRoom("lijiange.js"), p = huashan(1); delete p.temp.zy_jz_1;
    lj.actions.jz_walls.call(lj, p);
    const answer = p.temp.zy_pzs_jz_1, wrong = ["east", "south", "west", "north"].find(d => d !== answer);
    assert.ok(p.messages.pop().includes("微光透出"), "察看四壁时给出正确提示");
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
    n.init_trial(me, HS, intent(1)); n.environment = me.environment = {};
    assert.ok(n.mapped.some(r => r[0] === "dugujiujian3") && !n.mapped.some(r => r[0] === "literate"), "v2 化身使用本门武学");
    assert.strictEqual(n.max_hp, Math.floor(12000000 * HS.trialHpScale));
    assert.ok(!/抉择影响/.test(n.desc), "未做抉择时化身描述不提抉择");
    { const m2 = huashan(3); m2.temp.zy_pzhp_jz_3 = 60; const n2 = npc(); n2.init_trial(m2, HS, intent(3));
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
    timers = []; me = huashan(2); n = npc(); n.init_trial(me, HS, intent(2)); n.environment = me.environment = {};
    run(15000);
    assert.strictEqual(n.v2.momentum, 3); assert.ok(n.gj > n.base_gj);
    n.trial_on_hit(me, false);
    assert.strictEqual(n.v2.momentum, 3, "没有先出绝招时普攻不能卸势");
    n.trial_on_hit(me, true); clock += 2000; n.trial_on_hit(me, false);
    assert.strictEqual(n.v2.momentum, 0, "绝招后 4 秒内普攻卸去剑势"); assert.strictEqual(n.gj, n.base_gj);

    // burst：回元 + 重击闪避
    timers = []; me = huashan(3); n = npc(); n.init_trial(me, HS, intent(3)); n.environment = me.environment = {};
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
    timers = []; me = huashan(4); n = npc(); n.init_trial(me, HS, intent(4)); n.environment = me.environment = {};
    let h = me.hp; run(10000);
    assert.strictEqual(h - me.hp, Math.floor(me.max_hp * 0.15), "无护体全额冲击");
    me.status.push({ id: "force" }); h = me.hp; run(10000);
    assert.strictEqual(h - me.hp, Math.floor(me.max_hp * 0.15 / 3), "紫气东来护体时冲击减为三分之一");

    // 非 v2 门派化身行为不变
    timers = []; me = actor(); me.family = { id: "WUDANG" }; n = npc(); n.init_trial(me, Z.DATA.WUDANG, Z.DATA.WUDANG.list[0]);
    assert.ok(!n.v2 && n.mapped.some(r => r[0] === "jiuyinshengong"), "旧门派仍用原化身");
}

// ---------- 9. GM 旁路 ----------
{
    const low = huashan(1); low.level = 1; delete low.temp.wd100;
    assert.strictEqual(Z.get_active(low), null, "未达条件不生效");
    low.temp.zy_gm_bypass = 1;
    assert.strictEqual(Z.get_active(low), null, "普通玩家即使有标记也不能旁路");
    low.user_level = 5;
    assert.ok(Z.get_active(low), "GM 开启旁路后视为满足条件");
}

console.log("华山 v2 通过：数值框架（十重≤2.5倍一重）、封招/缠兵/内伤/剑意护体/无剑之境、五处禁地机关、化身考题机制、GM 测试旁路均正常；旧门派数值与化身未变。");

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
