"use strict";
// 真意试炼实战模拟：进程内加载真实引擎（隔离数据目录、不开端口、虚拟时钟），
// 构造拥有全部 grade<6 技能的华山玩家，开自动出招挑战五项试炼。
// 用法（在项目根目录）：
//   RUNS=8 MP=1500000 BOOST=2.5 GJSD=1000 node tools/zhenyi_sim/sim.js
// 环境变量：LV 技能等级(3000)  RUNS 每项场次  ONLY=1,3 只跑指定试炼
//   MP 额外内力上限  BOOST 在技能面板基础上放大攻防命躲招与气血，模拟装备/词条
//   GJSD 攻速间隔减少的毫秒数  EQ 逗号分隔的装备路径  NPCDB 化身忽视忙乱%
//   KEEPBUFF=1 PANEL 下仍叠加自身增益对面板项的加成（默认剥掉，面板视为开 buff 后）
//   PFMS=weapon,dodge,parry 只放这些槽的绝招
//   LEGAL=1 只学华山+公共武学  SET=best MAP='{"force":...}' 自选装备槽  NPCINFO=1 打印化身面板
//   PFMLOG=1 打印每场绝招与伤害  ERRS=1 打印计时器异常
// 华山禁地五项试炼的真实引擎模拟：玩家拥有全部 grade<6 技能、均为 LV 级，开自动出招。
const LV = parseInt(process.env.LV || 3000), RUNS = parseInt(process.env.RUNS || 5);
const MP = parseInt(process.env.MP || 0);              // 额外内力上限（如五气朝元 1500000）
const SET = process.env.SET || "huashan";              // huashan=本门 / best=任意最强
const EQ = (process.env.EQ || "eq/lv0/jian").split(",");
const VERBOSE = !!process.env.V;
require("./boot.js")().then(process.env.SIMLIB ? () => require(process.env.SIMLIB)() : main).catch(e => { console.error(e); process.exit(1); });

// —— 虚拟时钟 ——
let T = Date.now(); const Q = []; let seq = 0;
function installClock() {
    Date.now = () => T;
    global.setTimeout = (fn, ms, ...a) => { const t = { at: T + Math.max(1, ms || 0), fn, a, id: ++seq, unref() { return t; }, ref() { return t; }, hasRef() { return true; } }; Q.push(t); return t; };
    global.clearTimeout = t => { const i = Q.indexOf(t); if (i >= 0) Q.splice(i, 1); };
    global.setInterval = () => ({ unref() {} }); global.clearInterval = () => {};
}
function runUntil(pred, maxMs) {
    const end = T + maxMs;
    while (Q.length && !pred()) {
        Q.sort((a, b) => a.at - b.at || a.id - b.id);
        const t = Q.shift(); if (t.at > end) { Q.unshift(t); break; }
        T = t.at; try { t.fn(...t.a); } catch (e) { if (VERBOSE || process.env.ERRS) console.error("timer err", e && e.stack && e.stack.split("\n").slice(0, 6).join(" | ")); }
    }
}

function makePlayer(idx) {
    const me = new USER();
    me.id = "sim" + idx + "_" + Math.random().toString(36).slice(2, 8); me.name = "模拟华山弟子"; me.userid = 1;
    me.gender = 1; me.level = 5; me.exp = 1e10; me.pot = 1e10;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.settings = {};
    me.equipment = []; me.skills = {}; me.custom_skills = [];
    me.family = FAMILIES.HUASHAN; me.set_temp("family", "HUASHAN"); me.set_temp("wd_level", 100);
    me.limit_mp = 86000 + MP;
    me.log = []; me.notify = function (t) { this.log.push(String(t)); }; me.send = function (t) { if (typeof t === "string" && t.indexOf("脱手") >= 0) this.log.push("脱手"); }; me.send_commands = function () {};
    // 技能：全部 grade<6 的门派/特殊武学 + 全部基本功
    const bases = new Set();
    for (const id in WORLD.SKILLS) {
        const sk = WORLD.SKILLS[id];
        if (!sk || sk.is_custom) continue;
        if (sk.type === SKILL_TYPES.BASE) { bases.add(id); continue; }
        if (typeof sk.grade !== "number" || sk.grade >= 6) continue;
        if (sk.family && sk.family.id === "MONSTER") continue;
        // LEGAL=1：只学本门（华山）与无门派的公共武学，符合实际规则
        if (process.env.LEGAL && sk.family && sk.family.id !== "HUASHAN") continue;
        me.skills[id] = { level: LV, exp: 0 };
    }
    for (const b of bases) me.skills[b] = { level: LV, exp: 0 };
    for (const id in me.skills) { const s = SKILL.get(id); if (s) s.attach_prop(me, LV); }
    const map = SET === "huashan"
        ? { sword: "dugujiujian2", parry: "dugujiujian2", force: "zixiashengong2", dodge: "kuangfengkuaijian2", unarmed: "poyuquan2" }
        : JSON.parse(process.env.MAP);
    for (const b in map) if (me.enable_skill(b, map[b]) === false) console.log("enable fail", b, map[b]);
    for (const p of EQ) { const o = OBJ.CREATE(p, 1); if (!o) { console.log("no obj", p); continue; } me.items.push(o); if (me.equip(o) === false) console.log("equip fail", p); }
    me.max_mp = me.limit_mp + me.query_prop("limit_mp");
    me.init_skill(); me.recount(); me.hp = me.max_hp; me.mp = me.max_mp;
    const B = parseFloat(process.env.BOOST || 1), G = parseInt(process.env.GJSD || 0);
    if (B !== 1 || G) { me.change_prop({ gj: me.gj * (B - 1), fy: me.fy * (B - 1), mz: me.mz * (B - 1), ds: me.ds * (B - 1), zj: me.zj * (B - 1), max_hp: me.max_hp * (B - 1), gjsd: G ? Math.max(0, me.gjsd - G) : 0 }, true); me.recount(); me.hp = me.max_hp; }
    // PANEL="gj=400000,mz=200000,zj=35000,ds=35000,fy=35000,hp=3000000,gjsd=500"：直接把静态面板调到指定值。
    if (process.env.PANEL) {
        const want = Object.fromEntries(process.env.PANEL.split(",").map(kv => kv.split("=")).map(([k, v]) => [k, Number(v)]));
        for (let pass = 0; pass < 4; pass++) {
            const d = {};
            for (const k of ["gj", "mz", "zj", "ds", "fy"]) if (want[k]) d[k] = (want[k] - me[k]) / Math.max(1, (100 + me.query_prop(k + "_per")) / 100);
            if (want.hp) d.max_hp = (want.hp - me.max_hp) / Math.max(1, (100 + me.query_prop("hp_per")) / 100);
            if (want.gjsd) d.gjsd = me.gjsd - want.gjsd;
            me.change_prop(d, true); me.recount();
        }
        me.hp = me.max_hp;
        // 用户给的是「开 buff 后」的面板：玩家自身增益在这几项上的加成已含在面板里，战斗中不再叠加；
        // 增益的其他效果（忽视防御、伤害减免、反震、控制等）照常生效。负面状态（敌方施加）不受影响。
        if (!process.env.KEEPBUFF) {
            const STRIP = ["gj", "gj_per", "mz", "mz_per", "ds", "ds_per", "zj", "zj_per", "fy", "fy_per", "gjsd", "gjsd_per", "max_hp", "hp_per"];
            const as = me.add_status;
            me.add_status = function (st) {
                if (st && !st.downside && st.prop) {
                    const p = Object.assign({}, st.prop); let hit = false;
                    for (const k of STRIP) if (k in p) { delete p[k]; hit = true; }
                    if (hit) st = Object.assign({}, st, { prop: p });
                }
                return as.apply(this, [st].concat([].slice.call(arguments, 1)));
            };
        }
    }
    // PFMS=weapon,dodge,parry：自动出招只放这些槽的绝招（weapon=当前武器槽，如 sword/blade）。
    if (process.env.PFMS) {
        const allow = process.env.PFMS.split(","); const ip = me.init_pfms;
        me.init_pfms = function () {
            ip.apply(this, arguments);
            const w = this.query_weapon_type();
            this.auto_skills = (this.auto_skills || []).filter(it => allow.indexOf(it.type === w && w ? "weapon" : it.type) >= 0);
        };
    }
    me.jingli = me.max_jingli = 1e6;
    me.auto_pfm = true; me.is_player = true;
    return me;
}

function stat(me) { return { hp: me.max_hp, mp: me.max_mp, gj: me.gj, fy: me.fy, mz: me.mz, ds: me.ds, zj: me.zj, gjsd: me.gjsd, bj: me.bj }; }

function runTrial(id, idx) {
    const me = makePlayer(idx);
    // 剑冢五关须依次闯过：模拟第 id 关时视为前面各关已过。
    for (let k = 1; k < id; k++) me.set_temp("zy_stage_jz_" + k, 1);
    WORLD.ZHENYI.solve_puzzle(me, "jz", id);
    const start = ROOM.Get("jz/wuyitai_trial");
    const pub = start.query_copy("zhenyi_public:jz") || start.create_copy("zhenyi_public:jz");
    me.moveto(pub); WORLD.USERS.push(me);
    const t0 = T; let minHp = me.hp;
    const ok = WORLD.ZHENYI.start_trial(me, id);
    if (VERBOSE) { const mv = me.moveto; me.moveto = function (r) { console.log("MOVETO", typeof r === "string" ? r : r && r.path, new Error().stack.split("\n").slice(2, 7).join(" <- ")); return mv.apply(this, arguments); }; const co = me.call_out; me.call_out = function (f, t) { if (f && f.name === "finishReturn") console.log("RETURN SCHEDULED", new Error().stack.split("\n").slice(2, 8).join(" <- ")); return co.apply(this, arguments); }; const d = me.die; me.die = function () { console.log("DIE hp", this.hp); return d.apply(this, arguments); }; }
    if (!ok) return { id, err: me.log.slice(-2).join(" | ") };
    const npc = me.environment.items.find(o => o.is_zhenyi_trial);
    if (VERBOSE) { const e = me.environment; console.log("DIAG owner", me.query_temp("zy_trial_owner"), "envOwner", e.owner, "parent", e.parent && e.parent.id, "npc?", !!npc, npc && npc.trial_owner === me); }
    // V2='{"HIT_CAP":0.004,"DIFF_BUSY_PER":50}'：临时覆盖化身考题参数，用于调参。
    if (process.env.V2) { const o = JSON.parse(process.env.V2), def = npc.V2.DIFF_BUSY_PER || 0; Object.assign(npc.V2, o);
        if ("GJ_SCALE" in o) { const st = WORLD.ZHENYI.trial_stats({ id: id, mode: npc.trial_mode }); const g = typeof o.GJ_SCALE === "number" ? o.GJ_SCALE : (o.GJ_SCALE[npc.trial_mode] || 1); npc.gj = npc.base_gj = Math.floor(st.gj * g); }
        if ("DIFF_BUSY_PER" in o) { npc.add_prop("diff_busy_per", o.DIFF_BUSY_PER - def); npc.recount(); } }
    if (process.env.NPCDB) { npc.change_prop({ diff_busy_per: parseInt(process.env.NPCDB) }, true); }
    const src = {}; { const ah = me.add_hp; me.add_hp = function (v) { if (v < 0) { const st = new Error().stack; const k = /v2_strike/.test(st) ? "重击/万剑" : /v2_tick/.test(st) ? "剑意冲击" : /use_pfm|PERFORM/.test(st) ? "化身绝招" : /do_attack/.test(st) ? "化身普攻" : "其他"; src[k] = (src[k] || 0) - v; src[k + "#"] = (src[k + "#"] || 0) + 1; } return ah.apply(this, arguments); }; }
    const pfmLog = {};
    if (process.env.PFMLOG) {
        const up = me.use_pfm;
        me.use_pfm = function (target, pfm) {
            const before = target ? target.hp : 0, b0 = target && target.is_busy;
            const r = up.apply(this, arguments);
            const k = pfm.id + (b0 ? "(目标忙)" : "");
            const e = pfmLog[k] || (pfmLog[k] = { n: 0, dmg: 0, busyAfter: 0 });
            e.n++; e.dmg += Math.max(0, before - (target ? target.hp : 0)); if (target && target.is_busy) e.busyAfter++;
            return r;
        };
        const da = me.do_attack;
        me.do_attack = function (par) { const t = par && par.target, before = t ? t.hp : 0; const r = da.apply(this, arguments); const e = pfmLog["普攻"] || (pfmLog["普攻"] = { n: 0, dmg: 0, busyAfter: 0 }); e.n++; e.dmg += Math.max(0, before - (t ? t.hp : 0)); return r; };
    }
    const npcInfo = { hp: npc.max_hp, gjsd: npc.gjsd, dfp: npc.diff_fy_per, gj: npc.gj, mz: npc.mz, ds: npc.ds, fy: npc.fy, zj: npc.zj, skills: Object.keys(npc.skills || {}).join(",") };
    let lastT = T, lastHp = me.hp, taken = 0, busyMs = 0, meBusyMs = 0, doneAt = 0;
    const tick = () => {
        const dt = T - lastT; lastT = T;
        if (npc.is_busy || npc.is_faint) busyMs += dt;
        if (me.is_busy || me.is_faint) meBusyMs += dt;
        if (me.hp < lastHp) taken += lastHp - me.hp; lastHp = me.hp; minHp = Math.min(minHp, me.hp);
        if (!doneAt && (npc.hp <= 0 || me.query_temp("zy_trial_completed", ""))) doneAt = T;
    };
    runUntil(() => { tick(); return doneAt || !me.query_temp("zy_trial_active", "") || me.hp <= 0; }, 200000);
    if (VERBOSE) console.log("Q", Q.length, "active", me.query_temp("zy_trial_active", ""), "hp", me.hp, "fight", me.fight_type, npc.fight_type, "env", me.environment === npc.environment);
    if (VERBOSE) console.log(me.log.map(l => l.replace(/<[^>]+>/g, "")).join("\n").slice(0, 3000));
    const res = { id, win: !!me.query_temp("zy_trial_completed", "") || WORLD.ZHENYI.stage_cleared(me, "jz", id) || me.log.some(l => /试炼完成|领悟|熬过/.test(l)),
        secs: Math.round(((doneAt || T) - t0) / 1000), takenPct: Math.round(100 * taken / me.max_hp),
        npcBusy: Math.round(100 * busyMs / Math.max(1, T - t0)), meBusy: Math.round(100 * meBusyMs / Math.max(1, T - t0)), npcLeft: Math.round(100 * Math.max(0, npc.hp) / npc.max_hp), minHp: Math.round(100 * Math.max(0, minHp) / me.max_hp),
        fail: (me.log.find(l => /试炼失败/.test(l)) || "").replace(/<[^>]+>/g, ""),
        events: {} };
    for (const l of me.log) for (const k of ["击碎了化身的剑罡", "打断了它的蓄力", "脱手", "卸去", "吐纳回元", "当头压下", "堪堪避过", "剑意冲击", "封住"]) if (l.includes(k)) res.events[k] = (res.events[k] || 0) + 1;
    res.npc = npcInfo; res.me = stat(me); res.src = src;
    if (process.env.NPCINFO) console.log("   化身", JSON.stringify(npcInfo).slice(0, 200));
    if (process.env.PFMLOG) console.log("   [" + id + "] " + (res.win ? "胜" : "负") + " " + res.secs + "s 化身受制" + res.npcBusy + "% :: " + Object.entries(pfmLog).sort((a, b) => b[1].dmg - a[1].dmg).map(([k, v]) => k + " x" + v.n + " 伤" + Math.round(v.dmg / 1e4) + "万" + (v.busyAfter ? " 后忙" + v.busyAfter : "")).join(" | "));
    try { me.end_fight && me.end_fight(); } catch (e) {}
    WORLD.USERS.splice(WORLD.USERS.indexOf(me), 1);
    runUntil(() => false, 15000);
    return res;
}

function main() {
    installClock();
    const p = makePlayer(0);
    console.log("玩家", SET, "LV" + LV, JSON.stringify(stat(p)), "attack_skill=" + (p.attack_skill && p.attack_skill.id), "force=" + (p.force_skill && p.force_skill.id));
    const only = process.env.ONLY ? process.env.ONLY.split(",").map(Number) : [1, 2, 3, 4, 5];
    for (const id of only) {
        const rs = []; for (let r = 0; r < RUNS; r++) rs.push(runTrial(id, r));
        if (rs[0].err) { console.log(id, "ERR", rs[0].err); continue; }
        const wins = rs.filter(r => r.win).length;
        if (process.env.LOSSES) { const c = {}; for (const r of rs.filter(r => !r.win)) { const k = (r.fail || "(无失败消息)") + (r.minHp === 0 ? " [玩家阵亡]" : ""); c[k] = (c[k] || 0) + 1; } console.log("   失败分布", JSON.stringify(c), "失败场用时", rs.filter(r => !r.win).map(r => r.secs).join(","), "失败场化身余血", rs.filter(r => !r.win).map(r => r.npcLeft).join(",")); }
        console.log(`试炼${id}: 胜${wins}/${RUNS} 用时[${rs.map(r => r.secs).join(",")}] 化身余血%[${rs.map(r => r.npcLeft).join(",")}] 玩家最低血%[${rs.map(r => r.minHp).join(",")}] 累计承伤%[${rs.map(r => r.takenPct).join(",")}] 化身受制%[${rs.map(r => r.npcBusy).join(",")}] 玩家受制%[${rs.map(r => r.meBusy).join(",")}]`);
        const ev = {}, sr = {}; for (const r of rs) { for (const k in r.events) ev[k] = (ev[k] || 0) + r.events[k]; for (const k in r.src) sr[k] = (sr[k] || 0) + r.src[k]; }
        const tot = Object.entries(sr).filter(([k]) => !k.endsWith("#")).reduce((a, [, b]) => a + b, 0) || 1;
        console.log("   事件合计", JSON.stringify(ev), " 承伤来源", Object.entries(sr).filter(([k]) => !k.endsWith("#")).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + Math.round(100 * v / tot) + "%(" + sr[k + "#"] + "次,均" + Math.round(v / sr[k + "#"] / 1e4) + "万)").join(" "));
        if (id === only[0] || VERBOSE) console.log("   化身", JSON.stringify(rs[0].npc));
    }
    process.exit(0);
}

// —— 武道塔 100 层守卫对照 ——
global.__fightBoss = function (me, path, init, maxMs) {
    const room = ROOM.Get("wudao/ta100") || ROOM.Get("wudao/ta");
    const npc = NPC.CLONE(path); if (init) init(npc, me);
    me.environment = null; me.moveto(room); npc.moveto ? npc.moveto(room) : room.item_changed(npc, true);
    const t0 = T; npc.do_kill(me);
    let minHp = me.hp;
    runUntil(() => { minHp = Math.min(minHp, me.hp); return me.hp <= 0 || npc.hp <= 0 || !npc.fight_type; }, maxMs);
    const r = { win: npc.hp <= 0 || (me.hp > 0 && !npc.fight_type && npc.hp < npc.max_hp), secs: Math.round((T - t0) / 1000), npcLeft: Math.round(100 * Math.max(0, npc.hp) / npc.max_hp), minHp: Math.round(100 * Math.max(0, minHp) / me.max_hp), npc: { hp: npc.max_hp, gj: npc.gj, fy: npc.fy, mz: npc.mz, ds: npc.ds, zj: npc.zj } };
    try { me.end_fight(); npc.end_fight(); npc.destroy && npc.destroy(); } catch (e) {}
    runUntil(() => false, 15000);
    return r;
};
global.__sim = { makePlayer, runTrial, stat, runUntil, installClock, get T() { return T; } };
