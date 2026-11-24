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
//   REALM=0~6 按境界构造「正常玩家」（设置后才生效，不设则沿用全技能的旧行为）：
//     本门武学只学品级 ≤ 境界+1 的；公共武学只学 PUBLIC 指定的一门（受精力限制一般只刷得到一门，
//     同样要求品级 ≤ 境界+1）；基础武功全有；每个部位自动装品级最高的技能（MAP 可覆盖）。
//     公共武学优先装在它能装的第一个部位；上古传承（is_ultimate，禁地所得）默认不学，ULTIMATE=1 才学。
//     FAMILY=门派 ID（默认 HUASHAN）。境界：1 武士 2 武师 3 宗师 4 武圣 5 武帝 6 武神
//     PUBLIC 不指定时按境界上限从「玩家优先刷的强力公共武学」里按权重抽一门（PUBLIC=none 不带）。
//     装备：境界对应等级（EQLV 可改）的全部装备里按部位挑最好的混搭，满精炼（REFINE，默认 12）；武器、暗器用自制装备
//     （宗师起；满精炼，5 条百分比攻击/命中词条，不算重铸；CUSTOM=0/1 关闭/强制）；先天属性 ATTR（默认 20）；
//     技能等级默认按境界（300/800/1500/2200/2300，LV 可改）；内力打满到自身上限（境界奖励+技能+武帝起五气朝元 150 万，MPV 可改）；撑面板：用不上的基础部位各装一门 ≤2 品公共武学（FILLER=0 关闭）；
//     武道进阶：宗师起，按武道书预算（BOOKS，默认宗师 30、武圣 80、近武帝 150）逐次进阶、书不够就停，走游戏真实消耗；
//     门数上限 ADVSK（默认宗师 2~3、武圣 4、近武帝 6），攻击→命中→臂力→暴击，先进剩余次数多的。
//     不必再给 PANEL：面板由技能、装备、先天、内力按真实公式算出，战斗中自身增益正常叠加。
//     SHOWSKILLS=1 打印学到的技能与装备搭配  SHOWPANEL=1 打印面板
// 华山禁地五项试炼的真实引擎模拟：玩家拥有全部 grade<6 技能、均为 LV 级，开自动出招。
// 技能等级：REALM 模式下不给 LV 时按境界后期取默认值（境界条件等级 + 经验上限，半年多到武帝的节奏）
const REALM_LV = [100, 300, 800, 1500, 2200, 2300, 3000];
const LV = parseInt(process.env.LV || (process.env.REALM !== undefined && process.env.REALM !== "" ? REALM_LV[parseInt(process.env.REALM)] : 3000));
const RUNS = parseInt(process.env.RUNS || 5);
const MP = parseInt(process.env.MP || 0);              // 额外内力上限（如五气朝元 1500000）
const SET = process.env.SET || "huashan";              // huashan=本门 / best=任意最强
const EQ = (process.env.EQ || "eq/lv0/jian").split(",");
const VERBOSE = !!process.env.V;
require("./boot.js")().then(process.env.SIMLIB ? () => require(require("path").resolve(process.env.SIMLIB))() : main).catch(e => { console.error(e); process.exit(1); });

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

const REALM = process.env.REALM !== undefined && process.env.REALM !== "" ? parseInt(process.env.REALM) : null;
const FAMILY_ID = process.env.FAMILY || "HUASHAN";
const PUBLIC_ENV = process.env.PUBLIC || "";
// 玩家刷公共武学时优先刷的强力技能（按品级，[技能, 权重]）。PUBLIC 不指定时按境界上限从这里抽一门。
// 4/5 品按用户说法（移花接木、明玉功；九阴神功为首）；3 品是我选的，用户未给
const STRONG_PUBLIC = {
    5: [["jiuyinshengong", 4], ["qiankundanuoyi", 2], ["liumaishenjian", 1], ["jiuyangshengong", 1], ["xuedao", 1]],
    4: [["yihuajiemu", 1], ["mingyugong", 1]],
    3: [["jinsheyoushenzhang", 1], ["kuangfengkuaidao", 1]],
};
function drawPublic(cap, idx) {
    for (let g = Math.min(cap, 5); g >= 3; g--) {
        const list = (STRONG_PUBLIC[g] || []).filter(([id]) => SKILL.get(id));
        if (!list.length) continue;
        const tot = list.reduce((a, [, w]) => a + w, 0);
        let r = ((idx * 7919 + 13) % 1000) / 1000 * tot;   // 按场次编号确定性抽取，同参数复跑结果一致
        for (const [id, w] of list) { if ((r -= w) < 0) return id; }
        return list[0][0];
    }
    return "";
}
// 内力：玩家打坐很快，基本都打满到上限。上限 = 境界提升累计奖励 + 技能加成（内功、基本内功等）+ 五气朝元（武帝起 +150 万）。
// MPV 可直接指定。
const LEVELUP_LIMIT_MP = [0, 1000, 6000, 16000, 36000, 86000, 586000];
const BASE_SLOTS = ["force", "unarmed", "sword", "blade", "club", "staff", "whip", "throwing", "parry", "dodge"];
let shown = false;
// 混搭装备：在 eqlv 等级的全部装备（各门派套装 + 普通装备）里，按部位挑「对攻命最有用」的一件。
// 武器只挑与所装兵器技能相符的类型。自制装备不算（最保守情况）。
const EQ_CACHE = {};
function eqScore(o) {
    const p = o.prop || {};
    const v = k => p[k] || 0;
    return v("gj") + v("mz") + 0.5 * (v("fy") + v("ds") + v("zj")) + 20 * (v("str") + v("dex") + v("con") + v("int"))
        + 800 * (v("gj_per") + v("mz_per") + v("bj_per") + v("add_sh_per") + v("diff_fy_per") + v("add_bjsh_per")) + v("max_hp") / 50;
}
function pickMixedEquipment(me, map, eqlv) {
    const fs = require("fs"), path = require("path");
    if (!EQ_CACHE[eqlv]) {
        const root = path.join(__dirname, "../../world/obj/eq/lv" + eqlv), list = [];
        (function walk(d, rel) {
            for (const e of fs.readdirSync(d, { withFileTypes: true })) {
                if (e.isDirectory()) walk(path.join(d, e.name), rel + e.name + "/");
                else if (e.name.endsWith(".js")) {
                    const pth = "eq/lv" + eqlv + "/" + rel + e.name.slice(0, -3);
                    try { const o = OBJ.CREATE(pth); if (o && o.is_equipment && o.eq_type !== undefined) list.push({ path: pth, o }); } catch (ex) {}
                }
            }
        })(root, "");
        EQ_CACHE[eqlv] = list;
    }
    const wtype = ["sword", "blade", "club", "staff", "whip"].find(t => map[t]) || null;
    const best = {};
    for (const it of EQ_CACHE[eqlv]) {
        const o = it.o;
        if (o.eq_type === EQUIP_TYPE.WEAPON && (!wtype || o.weapon_type !== wtype)) continue;
        if (o.eq_type === EQUIP_TYPE.THROWING) continue;
        const sc = eqScore(o);
        if (!best[o.eq_type] || sc > best[o.eq_type].sc) best[o.eq_type] = { sc, path: it.path, name: o.name };
    }
    // 精炼：玩家基本都满精炼（REFINE，默认 12）
    const refine = parseInt(process.env.REFINE === undefined ? 12 : process.env.REFINE);
    const out = [];
    for (const t in best) {
        const o = OBJ.CREATE(best[t].path, 1);
        if (refine > 0 && o.level_up) o.level_up(refine);
        out.push(o);
    }
    // 武器、暗器用自制装备（CUSTOM=0 关闭）：满精炼，5 条词条选百分比攻击/命中（不算重铸，词条都是 1 级）
    // 自制装备按 5 级规格打造，需要元晶等材料，默认宗师起才有（CUSTOM=1 强制打开，CUSTOM=0 关闭）
    if (process.env.CUSTOM === "1" || (process.env.CUSTOM !== "0" && REALM >= 3)) {
        const words = [{ key: "gj_per", level: 1 }, { key: "gj_per", level: 1 }, { key: "gj_per", level: 1 }, { key: "mz_per", level: 1 }, { key: "mz_per", level: 1 }];
        const mk = (type, eqType) => {
            const o = OBJ.CREATE("eq/cp#" + type, 1);
            o.set_temp && o.set_temp("name", "自制" + (eqType === EQUIP_TYPE.THROWING ? "暗器" : "兵器"));
            WORLD.COMMANDS.duanzao.default_template(o, eqType);
            o.words = words.map(w => Object.assign({}, w));
            if (refine > 0) o.level_up(refine); else o.apply_words();
            o.on_reload && o.on_reload(me);
            return o;
        };
        for (let i = out.length - 1; i >= 0; i--) if (out[i].eq_type === EQUIP_TYPE.WEAPON) out.splice(i, 1);
        if (wtype) out.push(mk(wtype, EQUIP_TYPE.WEAPON));
        out.push(mk("throwing", EQUIP_TYPE.THROWING));
    }
    if (process.env.SHOWSKILLS && !shown) console.log("装备(lv" + eqlv + ", 精炼" + refine + "):", out.map(o => o.name + (o.is_custom ? "[自制]" : "")).join(" "));
    return out;
}
// 武道进阶：宗师起，按「攻击→命中→臂力→暴击」在部位允许的范围里选，走真实的 lingwu 命令（消耗武道书、升品级、折算等级）。
// 5 品（橙色）技能不能再进阶；内功位没有这四项，不进阶。总次数 ADV（受武道书限制），默认按境界估计。
// 武道进阶：宗师起才有余力做，武道书难得，按「进阶了几门技能」限制，每门进阶到 5 品（橙色）为止。
//   用户描述：宗师能进阶两三门已算书多；武圣做不到全部进满；武帝要沉淀近一年才全部进满。
//   默认门数（ADVSK 可改）：宗师 2~3（按场次轮换）、武圣 4、近武帝 6、武神 全部。
//   先进阶剩余次数多的（2 品撑面板技能能进 3 次），同样多时主武器优先；进阶项按 攻击→命中→臂力→暴击。
//   走真实的 lingwu 命令（消耗武道书、升品级、折算等级）。内功位没有这四项，不进阶。ADV 可再限制总次数。
const REALM_ADVSK = [0, 0, 0, null, 4, 6, 99];
// 武道书预算（BOOKS 可改）：武道书很难拿（设计上武道塔通关后每天 1 本，1 品进满约 108 本），按书逐次进阶、书不够就停。
// 默认是估计值：宗师 30、武圣 80、近武帝 150。
const REALM_BOOKS = [0, 0, 0, 30, 80, 150, 400];
const ADV_ORDER = { weapon: [12, 13, 8, 9], unarmed: [12, 13, 8], parry: [12, 13], dodge: [12, 13] };
function applyAdvance(me, map, idx) {
    if (!(REALM >= 3)) return [];
    let nsk = process.env.ADVSK !== undefined ? parseInt(process.env.ADVSK) : REALM_ADVSK[REALM];
    if (nsk === null) nsk = 2 + (idx % 2);   // 宗师 2~3 门
    let left = parseInt(process.env.ADV || 999);
    if (!(nsk > 0) || !(left > 0)) return [];
    const budget = parseInt(process.env.BOOKS !== undefined ? process.env.BOOKS : REALM_BOOKS[REALM]);
    if (!(budget > 0)) return [];
    OBJ.clone_to("book/wudao", me, budget);
    const weaponBase = ["sword", "blade", "club", "staff", "whip"].find(t => map[t] && me.skills[map[t]] && SKILL.get(map[t]).family === me.family);
    const slots = [["weapon", "sword"], ["weapon", "blade"], ["weapon", "club"], ["weapon", "staff"], ["weapon", "whip"], ["weapon", "throwing"],
        ["unarmed", "unarmed"], ["parry", "parry"], ["dodge", "dodge"]].filter(([, b]) => map[b]);
    // 候选：每门技能取它所在的第一个部位；剩余可进阶次数 = 5 - 当前品级
    const seen = {}, cands = [];
    for (const [pos, base] of slots) {
        const skid = map[base], sb = SKILL.get(skid), sk = me.skills[skid];
        if (!sb || !sk || seen[skid] || sk.level < 1000) continue;
        seen[skid] = 1;
        const room = 5 - sb.query_grade(me);
        if (room > 0) cands.push({ skid, pos, room, main: base === weaponBase ? 1 : 0 });
    }
    cands.sort((a, b) => b.room - a.room || b.main - a.main);
    const done = [];
    for (const c of cands.slice(0, nsk)) {
        const sk = me.skills[c.skid], sb = SKILL.get(c.skid);
        sk.addin = sk.addin || [];
        for (const opt of ADV_ORDER[c.pos]) {
            if (left <= 0 || sb.query_grade(me) >= 5) break;
            if (sk.addin.indexOf(opt) >= 0 || SKILL.PROPERTIES[opt].positions.indexOf(c.pos) < 0) continue;
            const before = sk.addin.length;
            WORLD.COMMANDS.lingwu.enter(me, c.skid, c.pos, String(opt));
            if (sk.addin.length > before) { left--; done.push(sb.name + "·" + SKILL.PROPERTIES[opt].name + "(" + sk.addin_cost[opt] + "本)"); }
            else break;   // 书不够了
        }
    }
    return done;
}
function makePlayer(idx) {
    const me = new USER();
    me.id = "sim" + idx + "_" + Math.random().toString(36).slice(2, 8); me.name = "模拟华山弟子"; me.userid = 1;
    me.gender = 1; me.level = 5; me.exp = 1e10; me.pot = 1e10;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20;
    if (process.env.REALM !== undefined && process.env.REALM !== "") { const a = parseInt(process.env.ATTR || 20); me.str = me.con = me.dex = me.int = a; }
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.settings = {};
    me.equipment = []; me.skills = {}; me.custom_skills = [];
    const fam = REALM === null ? FAMILIES.HUASHAN : FAMILIES[FAMILY_ID];
    if (!fam) throw new Error("没有门派 " + FAMILY_ID);
    me.family = fam; me.set_temp("family", REALM === null ? "HUASHAN" : FAMILY_ID); me.set_temp("wd_level", 100);
    if (REALM !== null) me.level = REALM;
    me.limit_mp = 86000 + MP;
    me.log = []; me.notify = function (t) { this.log.push(String(t)); }; me.send = function (t) { if (typeof t === "string" && t.indexOf("脱手") >= 0) this.log.push("脱手"); }; me.send_commands = function () {};
    // 技能：全部 grade<6 的门派/特殊武学 + 全部基本功
    const bases = new Set();
    if (REALM !== null) {
        // 正常玩家：本门品级 ≤ 境界+1 的武学 + 指定的一门公共武学 + 全部基础武功
        const cap = REALM + 1;
        for (const id in WORLD.SKILLS) {
            const sk = WORLD.SKILLS[id];
            if (!sk || sk.is_custom || sk.id !== id) continue;
            if (sk.type === SKILL_TYPES.BASE) { if (BASE_SLOTS.indexOf(id) >= 0) bases.add(id); continue; }
            if (sk.is_ultimate && !process.env.ULTIMATE) continue;   // 上古传承（禁地所得）默认不算，ULTIMATE=1 才学
            if (sk.family === fam && sk.grade <= cap) me.skills[id] = { level: LV, exp: 0 };
        }
        const PUBLIC = PUBLIC_ENV === "none" ? "" : (PUBLIC_ENV || drawPublic(cap, idx));
        me._sim_public = PUBLIC;
        // 撑面板：给用不上的基础部位各学一门低品级公共武学（≤2 品且 ≤ 境界+1），挑该部位加成最高的；FILLER=0 关闭
        if (process.env.FILLER !== "0") {
            const fcap = Math.min(2, cap);
            for (const base of BASE_SLOTS) {
                let best = null, bestV = -1;
                for (const id in WORLD.SKILLS) {
                    const sk = WORLD.SKILLS[id];
                    if (!sk || sk.id !== id || sk.type !== SKILL_TYPES.SKILL || sk.is_custom || sk.is_hidden || sk.grade > fcap) continue;
                    if (sk.family && sk.family !== FAMILIES.NONE) continue;
                    if (sk.can_enables.indexOf(base) < 0) continue;
                    const ep = ((sk.query_enable_prop && sk.query_enable_prop(LV)) || {})[base] || {};
                    const v = (ep.gj || 0) + (ep.mz || 0) + 0.5 * ((ep.zj || 0) + (ep.ds || 0) + (ep.fy || 0)) + 20 * ((ep.str || 0) + (ep.dex || 0));
                    if (v > bestV) { bestV = v; best = sk; }
                }
                if (best && !me.skills[best.id]) { me.skills[best.id] = { level: LV, exp: 0 }; (me._sim_fillers = me._sim_fillers || {})[base] = best.id; }
            }
        }
        if (PUBLIC) {
            const ps = SKILL.get(PUBLIC);
            if (!ps) throw new Error("没有技能 " + PUBLIC);
            if (ps.family && ps.family !== FAMILIES.NONE && !ps.is_public) throw new Error(PUBLIC + " 不是公共武学");
            if (ps.grade > cap) throw new Error(PUBLIC + " 品级 " + ps.grade + " 超过境界允许的 " + cap);
            me.skills[ps.id] = { level: LV, exp: 0 };
        }
    }
    for (const id in WORLD.SKILLS) {
        if (REALM !== null) break;
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
    let map;
    if (REALM !== null) {
        // 专门刷来的那门公共武学优先装上（装在它能装的第一个部位，如乾坤大挪移→招架）；
        // 其余部位装品级最高的（同品级优先本门）；MAP 可逐项覆盖
        map = {};
        if (me._sim_public) map[SKILL.get(me._sim_public).can_enables[0]] = me._sim_public;
        for (const slot of BASE_SLOTS) {
            if (map[slot]) continue;
            let best = null;
            for (const id in me.skills) {
                const sk = SKILL.get(id);
                if (!sk || sk.type === SKILL_TYPES.BASE || sk.can_enables.indexOf(slot) < 0) continue;
                if (!best || sk.grade > best.grade || (sk.grade === best.grade && sk.family === fam && best.family !== fam)) best = sk;
            }
            if (best) map[slot] = best.id;
        }
        // 每个部位按品级挑完后，仍空着的部位用撑面板技能（品级低，挑选时可能被本门技能占掉）
        for (const base in (me._sim_fillers || {})) if (!map[base]) map[base] = me._sim_fillers[base];
        if (process.env.MAP) Object.assign(map, JSON.parse(process.env.MAP));
        if (process.env.SHOWSKILLS && !shown) { console.log("技能:", Object.keys(me.skills).filter(id => !bases.has(id)).map(id => SKILL.get(id).name + "(" + SKILL.get(id).grade + "品)").join(" "), "| 装备:", Object.entries(map).map(([k, v]) => k + "=" + SKILL.get(v).name).join(" ")); }
    } else map = SET === "huashan"
        ? { sword: "dugujiujian2", parry: "dugujiujian2", force: "zixiashengong2", dodge: "kuangfengkuaijian2", unarmed: "poyuquan2" }
        : JSON.parse(process.env.MAP);
    for (const b in map) if (me.enable_skill(b, map[b]) === false) console.log("enable fail", b, map[b]);
    // 正常玩家：穿境界对应等级的门派套装（武士 lv1 … 武帝 lv5），EQLV 可改；EQ 显式给出时以 EQ 为准
    let eqList = EQ;
    if (REALM !== null && !process.env.EQ) eqList = pickMixedEquipment(me, map, parseInt(process.env.EQLV || Math.max(1, Math.min(5, REALM))));
    for (const p of eqList) { const o = typeof p === "string" ? OBJ.CREATE(p, 1) : p; if (!o) { console.log("no obj", p); continue; } me.items.push(o); if (me.equip(o) === false) console.log("equip fail", p); }
    if (REALM !== null) { const adv = applyAdvance(me, map, idx); if (process.env.SHOWSKILLS && !shown) console.log("武道进阶:", adv.join(" ") || "无"); }
    me.max_mp = me.limit_mp + me.query_prop("limit_mp");
    if (REALM !== null) {
        me.limit_mp = LEVELUP_LIMIT_MP[REALM] + (REALM >= 5 ? 1500000 : 0) + MP;
        me.max_mp = process.env.MPV ? parseInt(process.env.MPV) : me.limit_mp + me.query_prop("limit_mp");
    }
    me.init_skill(); me.recount(); me.hp = me.max_hp; me.mp = me.max_mp;
    if (process.env.SHOWSKILLS) shown = true;
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
