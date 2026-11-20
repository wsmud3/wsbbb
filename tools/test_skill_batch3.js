"use strict";
// 第三批技能修复回归测试（真实引擎）：未定义 lv 的 5 处钩子、小无相功冷却按玩家独立与战斗记录不存档、
// 删除 5 门技能后旧存档安全、太极剑被动、时长上限、修罗刀层数、屠神暴伤、如来神掌昏迷、玄虚步冷却、
// 反震/反击不递归、千蛛万毒手启用属性、进阶槽补齐。
// 运行：node tools/test_skill_batch3.js
const assert = require("assert");

let failed = 0, passed = 0;
async function check(name, fn) {
    try { await fn(); passed++; }
    catch (e) { failed++; console.error("✗ " + name + "\n   " + ((e && e.stack) || e).split("\n").slice(0, 5).join("\n   ")); }
}
function mkUser(id) {
    const me = new USER();
    me.id = id || ("t" + Math.random().toString(36).slice(2, 8)); me.name = "测试"; me.userid = 1;
    me.gender = 1; me.age = 30; me.level = 5; me.exp = 1e10; me.pot = 1e10;
    me.str = me.con = me.dex = me.int = 30; me.kar = 20; me.per = 20;
    me.temp = {}; me.items = []; me.stores = []; me.books = []; me.settings = {};
    me.equipment = [null, null, null, null, null, null, null, null, null, null, null];
    me.skills = {}; me.custom_skills = []; me.status = [];
    me.family = FAMILIES.NONE; me.limit_mp = 100000; me.log = [];
    me.reg_time = Math.floor(Date.now() / 60000) - 60 * 24 * 365;
    me.notify = function (t) { this.log.push(String(t)); return false; };
    me.notify_fail = me.notify; me.send = me.send_room = me.send_combat = function (t) { this.log.push(String(t)); };
    me.send_commands = function () { this.log.push([].slice.call(arguments).join("|")); };
    me.notify_hp = function () {}; me.status_changed = function () {};
    return me;
}
function learn(me, map, lv) {
    for (const id of Object.keys(map)) { me.skills[id] = { level: lv, exp: 0 }; const bs = [].concat(map[id] || []); for (const b of bs) if (!me.skills[b]) me.skills[b] = { level: lv, exp: 0 }; }
    for (const id in me.skills) { const s = SKILL.get(id); if (s) s.attach_prop(me, lv); }
    for (const id of Object.keys(map)) for (const b of [].concat(map[id] || [])) me.enable_skill(b, id);
    me.max_mp = me.limit_mp + me.query_prop("limit_mp"); me.mp = me.max_mp;
    me.init_skill(); me.recount(); me.hp = me.max_hp;
}
function fight(a, b) { a.fight_type = b.fight_type = 2; a.enemy = [b]; b.enemy = [a]; }
const statusOf = (ch, id) => (ch.status || []).find(s => s.id === id);

async function main() {
    // ---------- 0. 未定义 lv 的 5 处钩子 ----------
    await check("长生诀·不灭：on_damage 触发不抛错并挂上不灭", () => {
        const a = mkUser(); learn(a, { changshengjue: "force" }, 2000); a.hp = a.max_hp;
        const ret = a.force_skill.on_damage(a, null, a.max_hp * 0.95);
        assert.strictEqual(ret, 0);
        assert.strictEqual(statusOf(a, "changsheng_bumie").duration, 20000);
    });
    await check("慈航剑典·灵动：进战触发不抛错", () => {
        const a = mkUser(), b = mkUser(); learn(a, { cihangjiandian: "force" }, 2000); learn(b, {}, 100); fight(a, b);
        a.environment = b.environment = { items: [a, b] };
        SKILL.get("cihangjiandian").on_beginfight(a, b);
        assert.strictEqual(statusOf(a, "cihang_lingdong").duration, 20000);
    });
    await check("参合指：命中叠层；参合之殇 5 层以上一次清空全部层数并昏迷", () => {
        const a = mkUser(), b = mkUser(); learn(a, { canhezhi: "unarmed" }, 2000); learn(b, {}, 100); fight(a, b);
        const sk = SKILL.get("canhezhi");
        for (let i = 0; i < 6; i++) sk.on_attack_over(a, b, {}, 100);
        assert.strictEqual(b.query_status("canhe"), 6, "层数正常叠加");
        assert.strictEqual(statusOf(b, "canhe").duration, 20000);
        a.do_attack = () => 1; a.end_attack = () => {};
        sk.pfm.pfm1.use(a, b, 2000);
        assert.strictEqual(b.query_status("canhe"), 0, "重置全部层数");
        assert.ok(b.is_faint > 0, "昏迷");
    });
    await check("倚天剑法·伏魔：命中叠层不抛错", () => {
        const a = mkUser(), b = mkUser(); learn(a, { yitianjianfa: "sword" }, 2000); learn(b, {}, 100);
        SKILL.get("yitianjianfa").on_attack_over(a, b, {});
        SKILL.get("yitianjianfa").on_attack_over(a, b, {});
        assert.strictEqual(b.query_status("fumo"), 2);
        assert.strictEqual(statusOf(b, "fumo").duration, 10000);
    });
    await check("少林身法(高阶)·一苇渡江被动：被打中触发不抛错", () => {
        const a = mkUser(); learn(a, { shaolinshenfa2: "dodge" }, 2000);
        SKILL.get("shaolinshenfa2").on_dodge_over(a, null, { is_dodge: false });
        assert.strictEqual(statusOf(a, "yiwei_passive").duration, 20000);
        // 被动与绝招「一苇渡江」（id dodge）不再互相挤掉
        const ds0 = a.query_prop("dex");
        SKILL.get("shaolinshenfa2").pfm.lingbo.use(a, null, 2000);
        assert.ok(statusOf(a, "dodge") && statusOf(a, "yiwei_passive"), "被动与绝招同时存在");
    });

    // ---------- 1. 小无相功 ----------
    await check("小无相功：冷却/出招按玩家独立，不改共享 pfm，不泄漏全局 pfm", () => {
        // 找一个可被模仿的 sword 绝招（grade<=4）
        let src = null;
        for (const id in WORLD.SKILLS) {
            const s = WORLD.SKILLS[id]; if (!s.pfm || s.grade > 4 || s.is_custom || s.family === FAMILIES.MONSTER) continue;
            for (const k in s.pfm) { const p = s.pfm[k]; if (p.enable_skill === "sword" && !p.no_copy && p.distime && p.distime !== 20000) { src = p; break; } }
            if (src) break;
        }
        assert.ok(src, "找到可模仿的剑法绝招");
        for (const id of ["xiaowuxianggong", "xiaowuxianggong2"]) {
            const duo = SKILL.get(id).pfm.duo;
            const a = mkUser(), b = mkUser(), t = mkUser(); learn(a, {}, 100); learn(b, {}, 100); learn(t, {}, 100); fight(a, t);
            a.use_pfm = () => true; // 只验证冷却记录
            t.set_mem("used_pfm", src.id, 20000);
            duo.use(a, t, 1000, "sword");
            assert.strictEqual(duo.query_distime(a, 1000), src.query_distime(a, 1000), id + " 本人冷却跟随模仿的绝招");
            assert.strictEqual(duo.query_distime(b, 1000), 20000, id + " 其他玩家不受影响");
            assert.strictEqual(duo.distime, 20000, id + " 共享 pfm 对象未被改写");
            assert.strictEqual(typeof globalThis.pfm, "undefined", "没有泄漏全局 pfm");
            assert.ok(a.query_temp("copy_pfm_sword"), id + " 无相学会的绝招照常存档");
        }
    });
    await check("战斗中的绝招记录只在内存里，不写 temp（不存档）", () => {
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
        const p = { id: "x/y", name: "x", query_mp: () => 0, use() { return true; } };
        a.use_pfm(b, p, 100, "unarmed");
        assert.strictEqual(b.query_mem("sk/last_hit_pfm"), "x/y");
        assert.strictEqual(a.query_mem("used_pfm"), "x/y");
        assert.strictEqual(a.query_mem("sk/last_pfm_id"), "x/y");
        for (const k of ["used_pfm", "sk/last_pfm_id", "sk/last_pfm_lv"]) assert.ok(!a.temp[k], k + " 不应进 temp");
        assert.ok(!b.temp["sk/last_hit_pfm"]);
        assert.ok(Object.keys(a).indexOf("_mem") < 0, "_mem 不可枚举");
        const src = require("fs").readFileSync(require("path").join(__dirname, "../world/cmd/battle/pfm.js"), "utf8");
        assert.ok(!src.split("\n").some(l => !/^\s*\/\//.test(l) && /set_temp\("(used_pfm|sk\/last_pfm_id|sk\/last_pfm_lv|sk\/last_hit_pfm)"/.test(l)));
    });

    // ---------- 2. 删除技能 ----------
    await check("删除的 5 门技能：文件不存在、旧存档安全、引用已清", () => {
        const gone = ["jinshezhang", "dapintianxianjue", "zhangzhongzhiguo", "tiandiqipan", "nixianmojue", "shandianwulianbian"];
        for (const id of gone) assert.ok(!SKILL.get(id), id + " 已删除");
        const me = mkUser("old_save");
        me.skills = {
            force: { level: 100, exp: 0, enable_skill: "dapintianxianjue" }, dapintianxianjue: { level: 100, exp: 0, force: true },
            unarmed: { level: 100, exp: 0, enable_skill: "tiandiqipan" }, tiandiqipan: { level: 100, exp: 0, unarmed: true },
            parry: { level: 100, exp: 0, enable_skill: "zhangzhongzhiguo" }, zhangzhongzhiguo: { level: 100, exp: 0, parry: true },
            nixianmojue: { level: 100, exp: 0 }, jinshezhang: { level: 100, exp: 0 },
            whip: { level: 100, exp: 0, enable_skill: "shandianwulianbian" }, shandianwulianbian: { level: 100, exp: 0, whip: true },
        };
        me.init(); me.recount();
        for (const id of gone) assert.ok(!me.skills[id], id + " 从存档里清掉");
        for (const b of ["force", "unarmed", "parry", "whip"]) assert.strictEqual(me.skills[b].enable_skill, null);
        WORLD.COMMANDS.cha.render_skill(me, me, false);
        me.on_skillchanged && me.on_skillchanged();
        const fs = require("fs"), path = require("path");
        const txt = f => fs.readFileSync(path.join(__dirname, "..", f), "utf8");
        for (const f of ["world/npc/yz/zhubanxian.js", "world/npc/wf/jinshelangjun.js", "world/area/fb1/fb11.js", "world/npc/pub/jiaoxi.js"])
            for (const id of gone) assert.ok(txt(f).indexOf('"' + id + '"') < 0 && txt(f).indexOf("#" + id + '"') < 0, f + " 仍引用 " + id);
    });

    // ---------- 3. 太极剑法被动 ----------
    await check("太极剑法：命中后忙乱 2 秒，内置冷却 10 秒（对方已忙乱也进冷却）", () => {
        const sk = SKILL.get("taijijian");
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
        b.add_status({ id: "busy", name: "忙乱", is_busy: true, duration: 500, downside: true });
        sk.on_attack_over(a, b, {}, 100);
        assert.ok(a.query_mem("taiji_busy_cd"), "对方已忙乱也进入冷却");
        b.remove_status("busy", true);
        sk.on_attack_over(a, b, {}, 100);
        assert.ok(!statusOf(b, "busy"), "冷却中不触发");
        a.remove_mem("taiji_busy_cd");
        sk.on_attack_over(a, b, { is_parry: true }, 0);
        assert.ok(!statusOf(b, "busy"), "未命中不触发");
        sk.on_attack_over(a, b, {}, 100);
        assert.strictEqual(statusOf(b, "busy").duration, 2000);
    });

    await check("不死印法：闪避成功幻影反击；幻魔期间闪避随机释放可使用的绝招（4 秒内置冷却，挂状态的绝招重算冷却）", () => {
        const B = SKILL.get("busiyinfa");
        // 引擎里 on_dodge_success 在被动上下文中调用（react → passive），测试按同样方式调用
        const dodgeOk = (x, y) => CHARACTER.passive(() => B.on_dodge_success(x, y, {}));
        const mk = (map) => { const a = mkUser(), b = mkUser(); learn(a, map, 3000); learn(b, {}, 100); fight(a, b);
            a.environment = b.environment = { items: [a, b], send_room() {}, item_changed() {} }; b.max_hp = b.hp = 1e12;
            const msgs = []; a.send_combat = b.send_combat = t => msgs.push(String(t)); return { a, b, msgs }; };
        let { a, b, msgs } = mk({ busiyinfa: ["force", "dodge"], dugujiujian: ["sword"] });
        dodgeOk(a, b);
        assert.ok(msgs.some(m => /幻影反手一击/.test(m)), "幻影反击有提示");
        const swordNames = Object.values(SKILL.get("dugujiujian").pfm).map(x => x.name);
        for (let r = 0; r < 20; r++) {
            a.remove_temp("busiyinfa_huanmo_trigger");
            B.pfm.huanmo.use(a, b, 3000); msgs.length = 0; dodgeOk(a, b);
            const m = msgs.find(x => /顺势使出/.test(x)) || "";
            assert.ok(!swordNames.some(n => m.indexOf("「" + n + "」") >= 0), "没装备剑时不会使出剑法绝招");
        }
        ({ a, b, msgs } = mk({ busiyinfa: ["force", "dodge"], jiuyinbaiguzhao: ["unarmed"] }));
        a.do_attack = () => 1; a.end_attack = () => {};
        B.pfm.huanmo.use(a, b, 3000); dodgeOk(a, b);
        const name = (msgs.find(m => /顺势使出/.test(m)) || "").replace(/<[^>]+>/g, "");
        assert.ok(name, "幻魔期间触发随机绝招");
        let key = null;
        for (const [slot, sid] of [["unarmed", "jiuyinbaiguzhao"], ["force", "busiyinfa"]]) {
            const pf = SKILL.get(sid).pfm;
            const k = Object.keys(pf).find(x => name.indexOf("「" + pf[x].name + "」") >= 0);
            if (k) key = "pfm/" + slot + "/" + k;
        }
        assert.ok(key, "识别出触发的绝招");
        const changed = (b.status || []).length > 0 || (a.status || []).some(s => s.id !== "busiyinfa_huanmo");
        assert.strictEqual(!!a.query_temp(key), changed, "挂了状态的绝招重新计算冷却，纯伤害绝招不动冷却");
        msgs.length = 0; dodgeOk(a, b);
        assert.ok(!msgs.some(m => /顺势使出/.test(m)), "4 秒内置冷却");
        assert.ok(/随机释放一个可使用的绝招/.test(B.pfm.huanmo.query_desc(a, 3000)));
        // 不死印法其他部位的绝招可以被触发，幻魔身法本身不会
        const got = {};
        for (let r = 0; r < 30; r++) {
            const t = mk({ busiyinfa: ["force", "dodge"] });
            B.pfm.huanmo.use(t.a, t.b, 3000); dodgeOk(t.a, t.b);
            const m = (t.msgs.find(x => /顺势使出/.test(x)) || "").replace(/<[^>]+>/g, "");
            if (/不死七幻/.test(m)) got.qihuan = 1; if (/生死逆转/.test(m)) got.nisheng = 1; if (/顺势使出「幻魔身法」/.test(m)) got.huanmo = 1;
        }
        assert.ok(got.qihuan && got.nisheng && !got.huanmo, "可触发不死七幻、生死逆转，不触发幻魔身法");
        // 先手动放过（敌人已带幻身、自己已在逆转中），再被触发：刷新被拒但效果仍在，同样重算冷却。走真实攻击 → 真实闪避
        const re = {};
        for (let r = 0; r < 60 && !(re.qihuan && re.nisheng); r++) {
            const t = mk({ busiyinfa: ["force", "dodge"] });
            B.pfm.qihuan.use(t.a, t.b, 3000); B.pfm.nisheng.use(t.a, t.b, 3000);
            t.a.max_hp = t.a.hp = t.b.max_hp = t.b.hp = 1e12; t.msgs.length = 0;
            B.pfm.huanmo.use(t.a, t.b, 3000);
            for (let i = 0; i < 5 && !t.msgs.some(m => /顺势使出/.test(m)); i++) t.b.do_attack({ target: t.a });
            const m = (t.msgs.find(x => /顺势使出/.test(x)) || "").replace(/<[^>]+>/g, "");
            for (const pid of ["qihuan", "nisheng"]) if (m.indexOf("「" + B.pfm[pid].name + "」") >= 0) {
                re[pid] = 1; assert.ok(t.a.query_temp("pfm/force/" + pid), B.pfm[pid].name + "已生效时再被触发也重算冷却");
            }
        }
        assert.ok(re.qihuan && re.nisheng, "两个都覆盖到");
        // 被动（技能面板）挂上的状态不算：参合指被动命中叠「参合」，参合之殇（本身不挂状态）被触发时不进冷却；
        // 写在绝招里的效果算：六脉神剑·无形剑气命中后的昏迷，被触发时重算冷却
        const chId = Object.keys(SKILL.get("canhezhi").pfm).find(k => SKILL.get("canhezhi").pfm[k].name === "参合之殇");
        let seenCH = 0, seenWX = 0;
        for (let r = 0; r < 80 && (!seenCH || !seenWX); r++) {
            const t = mk({ busiyinfa: ["force", "dodge"], canhezhi: ["unarmed"] });
            B.pfm.huanmo.use(t.a, t.b, 3000); dodgeOk(t.a, t.b);
            const m = (t.msgs.find(x => /顺势使出/.test(x)) || "").replace(/<[^>]+>/g, "");
            if (/参合之殇/.test(m) && (t.b.status || []).some(x => x.id === "canhe") && !(t.b.status || []).some(x => x.id !== "canhe")) {
                seenCH++; assert.ok(!t.a.query_temp("pfm/unarmed/" + chId), "被动挂的状态不让绝招进冷却");
            }
            const w = mk({ busiyinfa: ["force", "dodge"], liumaishenjian: ["unarmed"] });
            B.pfm.huanmo.use(w.a, w.b, 3000); dodgeOk(w.a, w.b);
            const wm = (w.msgs.find(x => /顺势使出/.test(x)) || "").replace(/<[^>]+>/g, "");
            if (/无形剑气/.test(wm) && (w.b.status || []).some(x => x.id === "liumai_faint")) {
                seenWX++; assert.ok(w.a.query_temp("pfm/unarmed/wuxing"), "绝招里写的昏迷算绝招挂状态，重算冷却");
            }
        }
        assert.ok(seenCH && seenWX, "两种情况都覆盖到");
    });

    await check("参合指：每层参合使受到的伤害固定增加 等级+1；幻魔触发参合之殇打出昏迷才进冷却（走真实闪避）", () => {
        const C = SKILL.get("canhezhi"), B = SKILL.get("busiyinfa");
        assert.strictEqual(C.query_enable_prop(1000).unarmed.desc, "命中后使敌人受到的伤害增加1001可叠加10层");
        const a = mkUser(), b = mkUser(); learn(a, { canhezhi: ["unarmed"] }, 1000); learn(b, {}, 100); fight(a, b);
        b.max_hp = b.hp = 1e12;
        const d0 = b.damage(5000, a);
        for (let i = 0; i < 12; i++) C.on_attack_over(a, b, {}, 1);
        assert.strictEqual(b.query_status("canhe"), 10, "最多 10 层");
        b.max_hp = b.hp = 1e12;
        assert.strictEqual(b.damage(5000, a) - d0, 10010, "10 层固定多受 10010 伤害");
        b.remove_status("canhe", true);
        assert.strictEqual(b.query_prop("diff_sh"), 0, "层数清除后恢复");
        const seen = {};
        for (let r = 0; r < 120 && !(seen[6] && seen[2]); r++) for (const st of [6, 2]) {
            const x = mkUser(), y = mkUser(); learn(x, { busiyinfa: ["force", "dodge"], canhezhi: ["unarmed"] }, 3000); learn(y, {}, 100); fight(x, y);
            x.environment = y.environment = { items: [x, y], send_room() {}, item_changed() {} };
            y.add_status({ id: "canhe", name: "参合", duration: 60000, override: 1, count: st, max_count: 10, prop: { diff_sh: -1 } });
            x.max_hp = x.hp = y.max_hp = y.hp = 1e12;
            const log = []; x.send_combat = y.send_combat = x.send_room = y.send_room = t => log.push(String(t));
            B.pfm.huanmo.use(x, y, 3000);
            for (let i = 0; i < 5 && !log.some(m => /顺势使出/.test(m)); i++) y.do_attack({ target: x });   // 真实攻击 → 真实闪避
            if (!log.some(m => /顺势使出「参合之殇」/.test(m.replace(/<[^>]+>/g, "")))) continue;
            seen[st] = 1;
            assert.strictEqual(!!y.is_faint, st >= 5, st + " 层时" + (st >= 5 ? "" : "不") + "昏迷");
            assert.strictEqual(!!x.query_temp("pfm/unarmed/pfm1"), st >= 5, st + " 层时" + (st >= 5 ? "" : "不") + "进冷却");
        }
        assert.ok(seen[6] && seen[2], "两种层数都覆盖到");
    });

    await check("华山真意「无剑·无招」：空手或持其他兵器也能施展剑法绝招（手动 / 自动出招）", () => {
        const mk = (active, weaponType) => { const a = mkUser(), b = mkUser(); a.family = FAMILIES.HUASHAN; a.temp.wd100 = 1;
            learn(a, { dugujiujian: ["sword", "parry"] }, 1000); learn(b, {}, 100); fight(a, b);
            a.environment = b.environment = { items: [a, b], send_room() {}, item_changed() {} }; b.max_hp = b.hp = 1e12;
            if (weaponType) a.query_weapon_type = () => weaponType;
            WORLD.ZHENYI.migrate(a);
            if (active) { a.set_temp("zy_jz_5", 1); a.set_temp("zy_level_jz_5", 1); a.set_temp("zy_active", "jz_5"); }
            return { a, b }; };
        const cmd = Object.values(WORLD.COMMANDS).find(c => c.command === "perform");
        const pid = Object.keys(SKILL.get("dugujiujian").pfm)[0];
        let { a } = mk(false);
        cmd.enter(a, "sword", pid);
        assert.ok(!a.query_temp("pfm/sword/" + pid), "未启用时空手不能施展剑法绝招");
        for (const wt of [null, "blade"]) {
            ({ a } = mk(true, wt));
            cmd.enter(a, "sword", pid);
            assert.ok(a.query_temp("pfm/sword/" + pid), (wt || "空手") + "：启用后可手动施展剑法绝招");
            a.auto_skills = null; a.init_pfms();
            assert.ok(a.auto_skills.some(x => x.type === "sword"), "自动出招包含剑法绝招");
            assert.ok(a.query_auto_pfm_skills().some(x => x.type === "sword"), "自动出招配置面板列出剑法绝招");
        }
    });

    await check("批量清除状态后不残留忙乱（clear_downside / clear_combat_status / remvoe_statuses / clear_status）", () => {
        for (const fn of [a => a.clear_downside(true), a => a.clear_combat_status(), a => a.remvoe_statuses(x => x.id === "tbusy"), a => a.clear_status()]) {
            const a = mkUser(); a.environment = { items: [a], send_room() {} };
            a.add_status({ id: "tbusy", name: "忙乱", duration: 3000, downside: true, is_busy: true, only_combat: true, no_diff: true });
            assert.ok(a.is_busy > 0);
            fn(a);
            assert.ok(!a.status.length && !a.is_busy, "清除后忙乱标志归零，绝招不再被判手忙脚乱");
        }
    });

    await check("天魔策·拳罡：每次施展加一层并重新计时，时间到掉一层；持续 1 秒起每 300 级 +1 秒、最长 10 秒", async () => {
        const Q = SKILL.get("tianmoce").pfm.quangang;
        assert.ok(/持续1秒/.test(Q.query_desc(null, 100)) && /持续4秒/.test(Q.query_desc(null, 1000)) && /持续10秒/.test(Q.query_desc(null, 5000)));
        const a = mkUser(), b = mkUser(); learn(a, { tianmoce: ["force", "unarmed"] }, 300); learn(b, {}, 100); fight(a, b);
        a.environment = b.environment = { items: [a, b], send_room() {}, item_changed() {} }; b.max_hp = b.hp = 1e12;
        a.do_attack = () => 1; a.end_attack = () => {};
        const sh0 = a.query_prop("add_sh_per"), msgs = []; a.notify = m => msgs.push(String(m));
        for (let i = 0; i < 7; i++) Q.use(a, b, 300);
        assert.deepStrictEqual([a.query_status("tianmoce_quangang"), a.query_prop("add_sh_per") - sh0], [5, 40], "最多 5 层、每层 +8%");
        assert.ok(!msgs.some(m => /\d+%|\d+层/.test(m)), "叠层提示不出现数值");
        await new Promise(r => setTimeout(r, 1200));
        Q.use(a, b, 300);                                   // 满层再施展：只续时
        await new Promise(r => setTimeout(r, 1200));
        assert.strictEqual(a.query_status("tianmoce_quangang"), 5, "满层施展会重新计时");
        await new Promise(r => setTimeout(r, 1000));
        assert.deepStrictEqual([a.query_status("tianmoce_quangang"), a.query_prop("add_sh_per") - sh0], [4, 32], "时间到只掉一层");
    });

    // ---------- 4. 时长上限 ----------
    await check("时长上限：生死逆转 30 秒、幻魔 10 秒，破碎/闭口禅/无念/不死法印/修罗之力 10 秒", () => {
        const lv = 10000, a = mkUser(), b = mkUser(); learn(a, { busiyinfa: ["force", "dodge"], wunianchangong: [], zhenyanshouyin: [] }, lv); learn(b, {}, 100); fight(a, b);
        const by = SKILL.get("busiyinfa").pfm;
        by.nisheng.use(a, b, lv); assert.strictEqual(statusOf(a, "force").duration, 30000);
        assert.ok(/30秒内/.test(by.nisheng.query_desc(a, lv)));
        // 生死逆转：受到的伤害降低（特殊免伤，最高 60%），不降低自己的攻击
        assert.strictEqual(statusOf(a, "force").prop.diff_sh_per2, 60, "10000 级封顶 60%");
        assert.ok(!("gj_per" in statusOf(a, "force").prop), "不再降低攻击");
        assert.ok(/受到的伤害降低60%/.test(by.nisheng.query_desc(a, lv)) && !/攻击伤害降低/.test(by.nisheng.query_desc(a, lv)));
        assert.ok(/受到的伤害降低40%/.test(by.nisheng.query_desc(a, 1000)), "1000 级 40%");
        {
            const x = mkUser(), y = mkUser(); learn(x, { busiyinfa: ["force", "dodge"] }, 1000); learn(y, {}, 100); fight(x, y);
            const gj0 = x.gj, dsp0 = x.diff_sh_per;
            by.nisheng.use(x, y, 1000);
            assert.strictEqual(x.gj, gj0, "攻击不变");
            assert.ok(Math.abs(x.diff_sh_per - dsp0 - 40) < 1e-9, "免伤 +40%");
        }
        // 幻魔身法：同凌波微步，最长 10 秒、最短 3 秒；持续期间闪避 +999999（真正闪避，不依赖内功位）
        by.huanmo.use(a, b, lv); assert.strictEqual(statusOf(a, "busiyinfa_huanmo").duration, 10000);
        assert.strictEqual(statusOf(a, "busiyinfa_huanmo").prop.ds, 999999);
        assert.ok(/^邪王独步天下的鬼魅身法。10秒内/.test(by.huanmo.query_desc(a, lv)) && /3秒内/.test(by.huanmo.query_desc(a, 100)));
        assert.ok(!a.query_temp("busiyinfa_huanmo"), "不再写会存档的标记");
        const wn = SKILL.get("wunianchangong").pfm;
        assert.ok(/^10秒内/.test(wn.pfm2.query_desc(a, lv)) && /10秒内禁止/.test(wn.pfm3.query_desc(a, lv)));
        b.max_hp = b.hp = 1e13; wn.pfm3.use(a, b, lv); assert.strictEqual(statusOf(b, "bikou").duration, 10000);
        SKILL.get("zhenyanshouyin").pfm[Object.keys(SKILL.get("zhenyanshouyin").pfm)[1]].use(a, b, lv);
        assert.strictEqual(statusOf(a, "busi_fayin").duration, 10000);
        assert.ok(/持续10秒/.test(SKILL.get("liumaishenjian").pfm[Object.keys(SKILL.get("liumaishenjian").pfm)[1]].query_desc(a, lv)));
        assert.ok(/持续10秒/.test(SKILL.get("xiuluodao").pfm.liudao.query_desc(a, lv)));
    });

    // ---------- 5. 修罗刀层数 ----------
    await check("修罗刀：炼狱攻击次数 = 1 + 流血层数；轮回按层数增伤", () => {
        const sk = SKILL.get("xiuluodao");
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
        b.max_hp = b.hp = 1e12;
        for (let i = 0; i < 3; i++) b.add_status({ id: "xiuluo_bleed", name: "修罗", duration: 60000, override: 1, max_count: 10, downside: true });
        assert.strictEqual(b.query_status("xiuluo_bleed"), 3);
        const pars = []; a.do_attack = p => { p._gj_at_call = a.gj; pars.push(p); return 1; }; a.end_attack = () => {};
        sk.pfm.lianyu.use(a, b, 1000);
        assert.strictEqual(pars.length, 4, "1+3 次");
        pars.length = 0; sk.pfm.liudao.use(a, b, 1000);
        assert.strictEqual(pars[0].gj, parseInt(pars[0]._gj_at_call * (100 + 3 * 500) / 100));
    });

    // ---------- 6. 屠神大法 ----------
    await check("屠神大法·七杀：暴伤加成叠加在角色自身值上", () => {
        const a = mkUser(), b = mkUser(); learn(a, { tushendafa: "force" }, 1000); learn(b, {}, 100);
        a.add_prop("add_bjsh_per", 50); b.hp = b.max_hp / 2;
        const par = {}; SKILL.get("tushendafa").on_before_attack(a, b, par);
        assert.ok(par.add_bjsh_per > 50, "包含自身 50 点 " + par.add_bjsh_per);
        SKILL.get("tushendafa").on_attack_over(a, b, par, 0);
    });

    await check("屠神大法·七杀：终伤加成只在内存记账，旧存档残留 temp 被清掉且不再误扣", () => {
        const sk = SKILL.get("tushendafa");
        const a = mkUser(), b = mkUser(); learn(a, { tushendafa: "force" }, 1000); learn(b, {}, 100); b.hp = b.max_hp / 2;
        a.temp.tushen_addsh = 80; a.temp.tushen_before = 1; a.temp.tushen = 1;   // 旧存档残留
        const s0 = a.query_prop("add_sh_per");
        const par = {}; sk.on_before_attack(a, b, par);
        assert.ok(!a.temp.tushen_addsh && !a.temp.tushen_before && !a.temp.tushen, "残留 temp 已清");
        assert.ok(a.query_prop("add_sh_per") > s0, "本次攻击有终伤加成（没有被残留 temp 卡住或误扣）");
        sk.on_attack_over(a, b, par, 0);
        assert.strictEqual(a.query_prop("add_sh_per"), s0, "攻击结束撤销，属性回到原值");
        // 中途没走到 on_attack_over：下一次攻击前先撤销上次的加成，不会越叠越多
        sk.on_before_attack(a, b, {}); a.remove_mem("tushen_before"); sk.on_before_attack(a, b, {});
        const once = a.query_prop("add_sh_per") - s0; sk.on_attack_over(a, b, {}, 0);
        assert.strictEqual(a.query_prop("add_sh_per"), s0); assert.ok(once > 0 && once <= 100);
        for (const k of Object.keys(a.temp)) assert.ok(!/^tushen/.test(k) || a.temp[k] == null, "不再写 temp " + k);
    });

    // ---------- 7. 如来神掌·灭魔 ----------
    await check("如来神掌·灭魔：命中后标准昏迷（最多 10 秒），未命中不昏迷，免控可挡", () => {
        const p = SKILL.get("rulaishenzhang").pfm[Object.keys(SKILL.get("rulaishenzhang").pfm).find(k => SKILL.get("rulaishenzhang").pfm[k].name === "灭魔")];
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b); a.end_attack = () => {};
        a.do_attack = () => 0; p.use(a, b, 5000); assert.ok(!statusOf(b, "faint"));
        a.do_attack = () => 1; p.use(a, b, 5000);
        assert.strictEqual(statusOf(b, "faint").duration, 10000); assert.ok(b.is_faint > 0);
        assert.ok(!(b.query_prop("busy") > 0), "不再给目标加 busy 属性");
        const c = mkUser(); learn(c, {}, 100); fight(a, c); c.add_prop("ig_control", 1); p.use(a, c, 5000);
        assert.ok(!statusOf(c, "faint"), "免控挡住昏迷");
    });

    // ---------- 8 / 10. 反击冷却与防递归 ----------
    await check("玄虚步：被打中反击有 5 秒内置冷却；双方都装不会互相无限反击", () => {
        const a = mkUser(), b = mkUser(); learn(a, { xuanxubu: "dodge" }, 1000); learn(b, { xuanxubu: "dodge" }, 1000); fight(a, b);
        a.max_hp = a.hp = b.max_hp = b.hp = 1e12; a.ds = b.ds = 0; a.zj = b.zj = 0;
        let n = 0; const da = a.do_attack; a.do_attack = function (p) { n++; return da.call(this, p); };
        b.do_attack({ target: a, gj: 100, mz: 1e9 });
        b.do_attack({ target: a, gj: 100, mz: 1e9 });
        assert.strictEqual(n, 1, "5 秒内只反击 1 次");
    });
    await check("一星混元：双方都在混元之气中，反击不会互相递归", () => {
        const a = mkUser(), b = mkUser(); learn(a, { yixinghunyuan: "parry" }, 10000); learn(b, { yixinghunyuan: "parry" }, 10000); fight(a, b);
        a.max_hp = a.hp = b.max_hp = b.hp = 1e12;
        for (const c of [a, b]) c.add_status({ id: "yixinghunyuan", name: "混元之气", duration: 60000 });
        let n = 0; for (const c of [a, b]) { const d = c.do_attack; c.do_attack = function (p) { if (++n > 200) throw new Error("递归"); return d.call(this, p); }; }
        b.do_attack({ target: a, gj: 100, mz: 1 });
        assert.ok(n <= 10, "攻击次数 " + n);
    });
    await check("九阳神功 / 阴阳九转：双方反震不递归，反震伤害不再被反震", () => {
        const a = mkUser(), b = mkUser(); learn(a, { jiuyangshengong: "force" }, 1000); learn(b, { jiuyangshengong: "force" }, 1000); fight(a, b);
        a.max_hp = a.hp = b.max_hp = b.hp = 1e12;
        const ahp = a.hp, bhp = b.hp;
        a.damage(1000, b, 0);
        assert.ok(b.hp < bhp, "b 被反震"); assert.ok(ahp - a.hp < 2000, "a 没有被反震回来");
        const c = mkUser(); learn(c, { yinyangjiuzhuan: "force" }, 1000); c.set_temp("yinyang_jiuzhu", 1); fight(c, a);
        c.max_hp = c.hp = 1e12; const a2 = a.hp, c2 = c.hp;
        c.damage(1000, a, 0);
        assert.ok(a.hp < a2, "a 被九烛反震");
        assert.ok(c2 - c.hp < 2000, "九阳不会把九烛的反震再震回去");
    });
    await check("不死印法反击、燃木刀法反伤带 reflect 标记，九阳不会再反震", () => {
        const a = mkUser(), b = mkUser(); learn(a, { busiyinfa: ["force", "dodge"] }, 1000); learn(b, { jiuyangshengong: "force" }, 1000); fight(a, b);
        a.max_hp = a.hp = b.max_hp = b.hp = 1e12; a.ds = 1e12;
        const ahp = a.hp;
        b.do_attack({ target: a, gj: 100, mz: 1 }); // 闪开 → 不死印法反击 b；b 的九阳不应再反震 a
        assert.strictEqual(a.hp, ahp);
        const r = mkUser(); learn(r, {}, 100); r.set_temp("sk_ranmu", 1000, 60000); fight(r, b); r.end_attack = () => {};
        const rhp = r.hp; SKILL.get("ranmudao").on_parry_over(r, b, { is_parry: false });
        assert.strictEqual(r.hp, rhp, "燃木反伤不被九阳反震");
    });

    // ---------- 11. 千蛛万毒手 ----------
    await check("千蛛万毒手：启用属性生效", () => {
        const e = SKILL.get("qianzhuwandushou").query_enable_prop(1000);
        assert.strictEqual(e.unarmed.gj, 1520);
        const a = mkUser(); learn(a, {}, 100); const g0 = a.gj;
        learn(a, { qianzhuwandushou: "unarmed" }, 1000);
        assert.ok(a.gj > g0);
    });

    // ---------- 9. 进阶槽 ----------
    await check("进阶界面与执行不报错、名字不再是 undefined；唐诗剑法 / 四象步已无进阶", () => {
        for (const id of ["tangshijianfa", "sixiangbu"]) assert.ok(!SKILL.get(id).slots || !SKILL.get(id).slots.length, id + " 应无进阶槽");
        for (const id of ["taizuchangquan"]) {
            const me = mkUser(); me.skills[id] = { level: 1000, exp: 0 }; me.find_obj_bypath = () => null;
            for (const args of [[], ["ss"], ["ss", "0"], ["sword"], ["dodge"], ["unarmed"], ["0"], ["reset"]]) WORLD.COMMANDS.lingwu.enter(me, id, ...args);
            assert.ok(me.log.join("").indexOf("undefined") < 0, id + " 显示 undefined");
            for (const s of SKILL.get(id).slots) assert.ok(s.name && typeof s.query_needs === "function" && s.count >= 1);
        }
    });

    // ---------- 追加 A~J ----------
    await check("金蛇游身掌(dodge 版)·金龙升天：无法闪避最多 5 秒", () => {
        const p = SKILL.get("jinsheyoushenzhang").pfm.pfm1;
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
        a.do_attack = () => 1; a.end_attack = () => {};
        p.use(a, b, 5000); assert.strictEqual(statusOf(b, "miss").duration, 5000);
        assert.ok(/5秒内/.test(p.query_desc(a, 5000)) && /3\.5秒内/.test(p.query_desc(a, 100)));
    });
    await check("阴阳九转·镇天地：每秒一跳，0 级 5 秒、每 200 级 +1 秒、最多 10 秒", () => {
        const p = SKILL.get("yinyangjiuzhuan").pfm.zhentiandi;
        for (const [lv, secs] of [[0, 5], [199, 5], [200, 6], [1000, 10], [5000, 10]]) {
            const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
            p.use(a, b, lv);
            const st = statusOf(a, "yinyang_zhentiandi_buff");
            assert.strictEqual(st.duration, 1000); assert.strictEqual(st.duration_count, secs, "lv" + lv);
            assert.ok(p.query_desc(a, lv).indexOf(secs + "秒内") === 0);
        }
    });
    await check("无念：附加最大内力 1%", () => {
        const a = mkUser(); learn(a, { wunianchangong: "force" }, 1000); a.max_mp = 300000; a.mp = 10;
        SKILL.get("wunianchangong").pfm.pfm2.use(a, null, 1000);
        assert.strictEqual(a.force_skill.do_force_attack(a, null, {}), 3000);
    });
    await check("松风剑法：普攻命中叠松风（上限随等级 3~6），松月无影消耗全部层数", () => {
        const sk = SKILL.get("songfengjianfa");
        const a = mkUser(), b = mkUser(); learn(a, { songfengjianfa: "sword" }, 600); learn(b, {}, 100); fight(a, b);
        for (let i = 0; i < 9; i++) sk.on_attack_over(a, b, {}, 100);
        assert.strictEqual(a.query_status("songfeng"), 5, "600 级上限 5 层");
        sk.on_attack_over(a, b, { is_parry: true }, 0);
        a._zy_casting = "x"; sk.on_attack_over(a, b, {}, 100); delete a._zy_casting;
        assert.strictEqual(a.query_status("songfeng"), 5, "未命中/绝招不叠层");
        assert.ok(!a.temp.sk_songfeng);
        const pars = []; a.do_attack = p => { pars.push(p); return 1; }; a.end_attack = () => {};
        sk.pfm.pfm1.use(a, b, 600);
        assert.strictEqual(pars.length, 6, "1+5 次攻击"); assert.strictEqual(a.query_status("songfeng"), 0);
        const c = mkUser(); learn(c, { songfengjianfa: "sword" }, 9000);
        for (let i = 0; i < 9; i++) sk.on_attack_over(c, b, {}, 100);
        assert.strictEqual(c.query_status("songfeng"), 6, "最多 6 层");
        assert.ok(statusOf(c, "songfeng").only_combat);
    });
    await check("神照经·拳经：护盾在场时冷却 2 倍速；提前破盾剩余恢复正常", async () => {
        const p = SKILL.get("shenzhaojing").pfm.pfm2;
        const a = mkUser(), b = mkUser(); learn(a, { shenzhaojing: "force" }, 1000); learn(b, {}, 100); fight(a, b);
        a.do_attack = () => 1; a.end_attack = () => {};
        p.use(a, b, 1000);                              // 护盾 15 秒
        a.set_temp("pfm/force/pfm2", 1, 10000);         // pfm.js 随后写入 10 秒冷却
        await new Promise(r => setTimeout(r, 5));
        let left = a.temp["pfm/force/pfm2"].e - Date.now();
        assert.ok(left > 4900 && left <= 5000, "护盾期间 10 秒冷却只需 5 秒 " + left);
        // 2 秒后破盾：已按 2 倍速走了 4 秒，冷却应剩 6 秒
        const st = statusOf(a, "quanjing"); st.qj_t0 -= 2000;
        a.damage(99999, null, 100);
        left = a.temp["pfm/force/pfm2"].e - Date.now();
        assert.ok(!statusOf(a, "quanjing")); assert.ok(left > 5900 && left <= 6000, "破盾后恢复正常速度 " + left);
    });
    await check("云龙剑·云龙三现：装备云龙心法时命中后降低敌人躲闪 30%", () => {
        const p = SKILL.get("yunlongjian").pfm[Object.keys(SKILL.get("yunlongjian").pfm).find(k => SKILL.get("yunlongjian").pfm[k].name === "云龙三现")];
        const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
        a.do_attack = () => 1; a.end_attack = () => {};
        p.use(a, b, 1000); assert.ok(!statusOf(b, "yunlong_longyin"), "没装云龙心法不触发");
        const c = mkUser(); learn(c, { yunlongxinfa: "force" }, 1000); fight(c, b); c.do_attack = () => 1; c.end_attack = () => {};
        p.use(c, b, 1000); const st = statusOf(b, "yunlong_longyin");
        assert.ok(st && st.prop.ds_per === -30 && st.duration === 10000);
    });
    await check("破玉拳·劈石：招架降低与防御降低数值相同", () => {
        for (const id of ["poyuquan", "poyuquan2"]) {
            const sk = SKILL.get(id); const p = Object.values(sk.pfm).find(x => x.name === "劈石");
            const a = mkUser(), b = mkUser(); learn(a, {}, 100); learn(b, {}, 100); fight(a, b);
            a.do_attack = par => { par.is_dodge = false; par.is_parry = false; return 1; }; a.end_attack = () => {};
            p.use(a, b, 1000);
            const st = (b.status || []).find(s => s.prop && s.prop.fy < 0);
            assert.ok(st, id + " 挂上劈石"); assert.strictEqual(st.prop.zj, st.prop.fy, id);
        }
    });
    await check("擒龙手·锁龙：我方身法按 dex1 + dex1×后天加成 比较", () => {
        const src = require("fs").readFileSync(require("path").join(__dirname, "../world/skill/unarmed/qinlong.js"), "utf8");
        assert.ok(/dex1 \+ dex1 \* me\.query_prop\(.dex.\)/.test(src) && /dex2 \+ dex2 \* target\.query_prop\(.dex.\)/.test(src));
    });

    console.log((failed ? "第三批技能测试失败 " : "第三批技能测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
