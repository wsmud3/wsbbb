this.inherits(NPC);
this.set({
    name: "武意化身", title: "真意试炼", gender: 1, age: 40,
    desc: "一道由历代门人武意凝成的身影。它并非活物，却能看破招式中的虚实。",
    no_refresh: true, no_fight: false, is_zhenyi_trial: true, pfm_rate: 0.25
});

// v2 门派（目前为华山）的考题参数。每种 mode 考校对应真意的用法：
//   precision 利剑：剑罡护体，须 5 秒内连中 3 次破罡（对应「封招」）
//   counter   软剑：剑势不断叠加，须绝招后 4 秒内普攻命中卸势（对应「缠兵」）
//   burst     重剑：化身持续回元，须以绝招命中打断（对应「内伤」）；并有蓄力重击（按躲闪判定）
//   endure    木剑：周期剑意冲击，有护体状态时大幅减免（对应「护体」）
//   master    无剑：剑罡 + 重击 + 低血时万剑归宗（综合考校，逼出「无剑之境」）
var V2 = {
    GUARD_EVERY: 15000, GUARD_REDUCE: 0.8, GUARD_HITS: 3, GUARD_WINDOW: 5000,
    MOMENTUM_MAX: 10, MOMENTUM_STEP: 0.08, UNBIND_WINDOW: 4000,
    REGEN_PCT: 0.02, REGEN_BLOCK: 10000,
    STRIKE_EVERY: 20000, STRIKE_WARN: 3000, STRIKE_PCT: { burst: 0.2, master: 0.15 }, FINAL_PCT: 0.3,
    IMPACT_EVERY: 10000, IMPACT_PCT: 0.15, IMPACT_GUARDED: 1 / 3,
    // 节奏控制：单次扣血上限（占化身最大气血）与忽视忙乱，保证考题机制有机会出现，
    // 不被「控制锁死 + 极限攻速」在十秒内跳过。
    // 软上限：超出部分按 HIT_OVER 计入，攻击仍有收益，但不能靠单次巨额伤害跳过考题。
    HIT_CAP: 0.012, HIT_OVER: 0.05, DIFF_BUSY_PER: 50,
    // 忽视防御：先抵消挑战者的伤害减免（须堆到 100%+此值才能免伤），余量再削防御。
    DIFF_FY_PER: 70,
    // 化身出手间隔（毫秒）。旧档位约 4.6 秒一击，面对 0.5 秒攻速的挑战者几乎构不成威胁。
    GJSD: 1000,
    // 战斗被拉长后，旧档位（按十秒战斗设计）的攻击偏高，v2 化身按此系数折算。
    // 数值依据：tools/zhenyi_sim（LEGAL=1：华山+公共武学，五个技能槽的绝招全放，含控制；独孤九剑+乾坤大挪移+狂风快剑+六脉神剑，紫霞/九阴）按开 buff 后面板「攻击 40 万、命中 20 万、
    // 招架躲闪防御 3.5 万、攻速 0.5 秒、气血 900～1100 万」实测；目标胜率 利剑～重剑 70～85%、木剑约 70%、无剑约 50%。
    GJ_SCALE: { precision: 1.02, counter: 0.8, burst: 0.64, endure: 0.62, master: 0.44 }
};
this.V2 = V2;

this.init_trial = function (player, data, intent) {
    this.trial_owner = player;
    this.trial_owner_id = player.id;
    this.trial_key = data.key;
    this.trial_id = intent.id;
    this.trial_mode = intent.mode;
    this.trial_v2 = !!data.v2;
    // 坚持类试炼只检查存活时间，武意化身不能被玩家击杀。
    if (this.trial_mode === "endure") {
        this.on_before_fight = function () { return false; };
        this.on_kill = function () { return false; };
    } else {
        this.on_before_fight = null;
        this.on_kill = null;
    }
    this.name = "<hiy>" + intent.trial + "·武意化身</hiy>";
    var level = WORLD.ZHENYI.get_level(player, data.key, intent.id) || 1;
    var stats = WORLD.ZHENYI.trial_stats(intent);
    var rule = intent.mode === "endure" ? "坚持45秒即可通过。" : ("须在" + Math.floor(stats.timeout / 1000) + "秒内击败化身。");
    if (intent.mode === "resource") rule += "期间每5秒损失最大内力的2%。";
    if (this.trial_v2) rule += this.v2_rule_text(intent.mode);
    this.desc = "这是【" + intent.trial + "】凝成的武意化身。" + rule + "此试考校“" + intent.mech + "”之理：" + WORLD.ZHENYI.describe(data, intent, level);

    var skillLv = stats.skill;
    var family = this.trial_v2 && typeof FAMILIES !== "undefined" && WORLD.ZHENYI.family_of_key && FAMILIES[WORLD.ZHENYI.family_of_key(data.key)];
    if (family && family.boss_skills2) {
        // v2：化身使用本门武学（取门派首领技能表），等级统一换成试炼档位。
        var map = [];
        for (var i = 0; i < family.boss_skills2.length; i++) {
            var row = family.boss_skills2[i].slice();
            if (row[0] === "literate") continue;
            // 首领表里可能写了尚未实装的版本号（如 dugujiujian3），退回到已有的最高版本。
            while (typeof SKILL !== "undefined" && !SKILL.get(row[0]) && /\d$/.test(row[0])) {
                var n = parseInt(row[0].match(/\d+$/)[0]) - 1;
                row[0] = row[0].replace(/\d+$/, n > 1 ? String(n) : "");
            }
            row[1] = skillLv;
            map.push(row);
        }
        this.skills = null;
        this.skill_map.apply(this, map);
        // 剑法类本门武学须持剑才能施展（否则化身只会用拳脚）；铁剑只提供 1 点攻击，不改变数值档位。
        if (map.some(function (r) { return r[0] === "sword"; }) && this.set_objects && !(this.equipment && this.equipment[EQUIP_TYPE.WEAPON]))
            this.set_objects(["eq/lv0/jian", 1, 1]);
    } else {
        this.skill_map(
            ["force", skillLv], ["unarmed", skillLv], ["sword", skillLv], ["parry", skillLv], ["dodge", skillLv],
            ["jiuyinshengong", skillLv, "force"], ["jiuyinbaiguzhao", skillLv, "unarmed"],
            ["xuantiejianfa", skillLv, ["sword", "parry"]], ["lingboweibu", skillLv, "dodge"]
        );
    }
    this.con = this.dex = this.int = this.str = 50;
    var hpScale = WORLD.ZHENYI.trial_hp_scale ? WORLD.ZHENYI.trial_hp_scale(player, data, intent) : 1;
    this.max_hp = this.hp = Math.floor(stats.max_hp * hpScale);
    // 禁地机关抉择对化身气血的影响只在此处以数值说明，叙事文字里不剧透。
    var pzScale = data.trialHpScale ? hpScale / data.trialHpScale : hpScale;
    if (Math.abs(pzScale - 1) > 0.001) this.desc += "受你在禁地中的抉择影响，化身气血为原本的" + Math.round(pzScale * 100) + "%。";
    this.max_mp = this.mp = stats.max_mp;
    this.gj = stats.gj; this.fy = stats.fy; this.mz = stats.mz; this.ds = stats.ds; this.zj = stats.zj;
    if (this.trial_v2 && V2.DIFF_BUSY_PER && this.add_prop) this.add_prop("diff_busy_per", V2.DIFF_BUSY_PER);
    if (this.trial_v2 && V2.DIFF_FY_PER && this.add_prop) this.add_prop("diff_fy_per", V2.DIFF_FY_PER);
    this.init(); this.recount();
    if (this.trial_v2 && V2.GJSD && this.add_prop && this.gjsd > V2.GJSD) { this.add_prop("gjsd", this.gjsd - V2.GJSD); this.recount(); }
    this.max_hp = Math.floor(stats.max_hp * hpScale);
    this.hp = this.max_hp; this.mp = this.max_mp;
    var gjScale = typeof V2.GJ_SCALE === "number" ? V2.GJ_SCALE : (V2.GJ_SCALE[this.trial_mode] || 1);
    if (this.trial_v2 && gjScale && gjScale !== 1) this.gj = Math.floor(this.gj * gjScale);
    this.base_gj = this.gj;

    var deadline = player.query_temp("zy_trial_deadline", 0);
    if (!deadline) {
        deadline = Date.now() + stats.timeout;
        player.set_temp("zy_trial_deadline", deadline);
    }
    this.trial_started = Date.now();
    this.trial_timeout_handler = this.call_out(this.trial_timeout, Math.max(1, deadline - Date.now()));
    this.trial_tick_handler = this.call_out(this.trial_tick, 5000);
    if (this.trial_v2) {
        this.v2 = { guard: false, nextGuard: Date.now() + 5000, hits: [], momentum: 0, lastPfmHit: 0,
            nextStrike: Date.now() + V2.STRIKE_EVERY, nextImpact: Date.now() + V2.IMPACT_EVERY, finalDone: false };
        if (this.trial_mode === "precision" || this.trial_mode === "master") this.v2.nextGuard = Date.now() + 3000;
        player.notify("<hiy>" + this.v2_rule_text(this.trial_mode) + "</hiy>");
    }
};

function pct(v) { return Math.round(v * 100) + "%"; }
function sec(ms) { return Math.round(ms / 1000) + "秒"; }
function modeValue(v, mode) { return typeof v === "number" ? v : (v && v[mode]) || 0; }
this.v2_strike_pct = function () { return modeValue(V2.STRIKE_PCT, this.trial_mode); };
// 说明文字一律由 V2 参数生成，避免描述与实装分叉。
this.v2_rule_text = function (mode) {
    var strike = pct(modeValue(V2.STRIKE_PCT, mode));
    return this.v2_mode_text(mode, strike) + (V2.DIFF_FY_PER ? "化身剑意凌厉，自带" + V2.DIFF_FY_PER + "%无视防御。" : "");
};
this.v2_mode_text = function (mode, strike) {
    if (mode === "precision") return "化身会周期凝聚剑罡（受到伤害降低" + pct(V2.GUARD_REDUCE) + "），须在" + sec(V2.GUARD_WINDOW) + "内连续命中" + V2.GUARD_HITS + "次方能破罡。";
    if (mode === "counter") return "化身剑势每5秒增强一层（每层伤害+" + pct(V2.MOMENTUM_STEP) + "），须在绝招命中后" + sec(V2.UNBIND_WINDOW) + "内以普通攻击命中，方能卸去全部剑势。";
    if (mode === "burst") return "化身每5秒回复" + pct(V2.REGEN_PCT) + "气血，绝招命中可震伤其脏腑、" + sec(V2.REGEN_BLOCK) + "内无法回元；它还会蓄力施展重击（最大气血" + strike + "），蓄力时以绝招命中可将其打断，身法足够灵动也能躲开。";
    if (mode === "endure") return "化身每" + sec(V2.IMPACT_EVERY) + "释放剑意冲击（最大气血" + pct(V2.IMPACT_PCT) + "），若身有紫气东来或剑意护体，冲击减为三分之一。";
    if (mode === "master") return "化身兼具剑罡与蓄力重击（最大气血" + strike + "）；气血低于30%时将施展万剑归宗（最大气血" + pct(V2.FINAL_PCT) + "）；蓄力时以绝招命中可将其打断，也可躲闪。";
    return "";
};

// —— v2 钩子：由 WORLD.ZHENYI.modify_damage / after_attack 调用 ——
this.trial_on_damage = function (from, sh) { return sh; };
// 剑罡减伤与单次扣血上限挂在 add_hp 上：damage / damage2 / damage3 最终都经此扣血，任何来源都绕不过去。
var baseAddHp = this.add_hp; // inherits(NPC) 之后取到的是 CHARACTER 原型上的实现
this.add_hp = function (v) {
    if (this.v2 && v < 0) {
        if (this.v2.guard) v *= (1 - V2.GUARD_REDUCE);
        var cap = V2.HIT_CAP > 0 ? Math.max(1, Math.floor(this.max_hp * V2.HIT_CAP)) : 0;
        if (cap && -v > cap) v = -(cap + (-v - cap) * (V2.HIT_OVER || 0));
        v = Math.floor(v);
    }
    return baseAddHp.call(this, v);
};
this.trial_on_hit = function (attacker, isPfm) {
    var st = this.v2, now = Date.now(), me = this.trial_owner;
    if (!st || attacker !== me) return;
    if (st.guard) {
        st.hits.push(now);
        while (st.hits.length && now - st.hits[0] > V2.GUARD_WINDOW) st.hits.shift();
        if (st.hits.length >= V2.GUARD_HITS) {
            st.guard = false; st.hits = []; st.nextGuard = now + V2.GUARD_EVERY;
            me.notify("<hic>你剑势连绵，一举击碎了化身的剑罡！</hic>");
        }
    }
    if (isPfm) {
        st.lastPfmHit = now;
        if (this.trial_mode === "burst") st.regenBlockedUntil = now + V2.REGEN_BLOCK;
        // 蓄力中的重击可被绝招打断（与躲闪并列的第二条出路，躲闪低的玩家靠这一条）。
        if (st.strikePending && !st.strikeBroken) {
            st.strikeBroken = true;
            me.notify("<hic>你一记绝招正中化身，打断了它的蓄力！</hic>");
        }
    } else if (this.trial_mode === "counter" && st.momentum > 0 && st.lastPfmHit && now - st.lastPfmHit <= V2.UNBIND_WINDOW) {
        st.momentum = 0; this.gj = this.base_gj; st.lastPfmHit = 0;
        me.notify("<hic>你剑势一软，借绝招余劲缠住对方兵刃，化身的剑势被尽数卸去！</hic>");
    }
};

this.v2_strike = function (pct, name) {
    var st = this.v2, me = this.trial_owner, self = this;
    if (!st || st.strikePending || !me) return;
    st.strikePending = true; st.strikeBroken = false;
    me.notify("<hir>化身剑势一沉，蓄力施展「" + name + "」，剑意如山压来！</hir>");
    st.strikeHandler = this.call_out(function () {
        st.strikeHandler = null; st.strikePending = false;
        if (!me || me.hp <= 0 || me.environment !== self.environment || self.hp <= 0) return;
        // 与普通攻击相同的躲闪判定（combat.js）：昏迷时躲不开，忙乱时仍可躲闪。
        if (st.strikeBroken) return;
        var dodged = !me.is_faint && Math.random() * (me.ds / 2) + me.ds / 2 > self.mz;
        if (dodged) return me.notify("<hig>你身形一晃，堪堪避过了「" + name + "」。</hig>");
        var dmg = Math.floor(me.max_hp * pct);
        me.damage2(dmg, self);
        me.notify("<hir>「" + name + "」当头压下，你受到" + dmg + "点伤害！</hir>");
    }, V2.STRIKE_WARN);
};

this.v2_tick = function (me) {
    var st = this.v2, now = Date.now(), mode = this.trial_mode;
    if ((mode === "precision" || mode === "master") && !st.guard && now >= st.nextGuard) {
        st.guard = true; st.hits = [];
        me.notify("<hiy>化身周身剑罡流转，寻常攻击难以伤它分毫！（5秒内连中3次可破）</hiy>");
    }
    if (mode === "counter" && st.momentum < V2.MOMENTUM_MAX) {
        st.momentum++;
        this.gj = Math.floor(this.base_gj * (1 + V2.MOMENTUM_STEP * st.momentum));
        if (st.momentum % 3 === 0) me.notify("<hiy>化身剑势已叠至" + st.momentum + "层。</hiy>");
    }
    if (mode === "burst") {
        if (st.regenBlockedUntil && now < st.regenBlockedUntil) { /* 内伤未愈 */ }
        else if (this.hp < this.max_hp) {
            var heal = Math.floor(this.max_hp * V2.REGEN_PCT);
            this.hp = Math.min(this.max_hp, this.hp + heal);
            me.notify("<hig>化身吐纳回元，气血回复了" + heal + "点。</hig>");
        }
    }
    if ((mode === "burst" || mode === "master") && now >= st.nextStrike) {
        st.nextStrike = now + V2.STRIKE_EVERY;
        this.v2_strike(this.v2_strike_pct(), "重剑无锋");
    }
    if (mode === "master" && !st.finalDone && this.hp / this.max_hp < 0.3) {
        st.finalDone = true;
        this.v2_strike(V2.FINAL_PCT, "万剑归宗");
    }
    if (mode === "endure" && now >= st.nextImpact) {
        st.nextImpact = now + V2.IMPACT_EVERY;
        var guarded = (me.query_status && me.query_status("force")) || me._zy_armor;
        var dmg = Math.floor(me.max_hp * V2.IMPACT_PCT * (guarded ? V2.IMPACT_GUARDED : 1));
        me.damage2(dmg, this);
        me.notify(guarded ? "<hiy>剑意冲击撞上你的护体真气，只受到" + dmg + "点伤害。</hiy>" : "<hir>剑意冲击贯体而过，你受到" + dmg + "点伤害！</hir>");
    }
};

this.clear_trial_timers = function () {
    if (this.trial_timeout_handler) clearTimeout(this.trial_timeout_handler);
    if (this.trial_tick_handler) clearTimeout(this.trial_tick_handler);
    if (this.v2 && this.v2.strikeHandler) { clearTimeout(this.v2.strikeHandler); this.v2.strikeHandler = null; }
};

this.trial_tick = function () {
    var me = this.trial_owner;
    if (!me || me.hp <= 0 || !this.environment || me.environment !== this.environment) {
        if (me && WORLD.ZHENYI) WORLD.ZHENYI.fail_trial(me, "你离开了试炼或已无力再战。");
        this.clear_trial_timers();
        return this.destroy();
    }
    if (this.trial_mode === "resource") {
        var drain = Math.max(1, Math.floor(me.max_mp * 0.02));
        me.add_mp(-drain);
        me.notify("<hib>武意化身牵引气机，你损失了" + drain + "点内力。</hib>");
    } else if (this.trial_mode === "control" && !me.query_temp("zy_trial_control_cd")) {
        me.set_temp("zy_trial_control_cd", 1, 8000);
        // is_busy 必须放在 buff 顶层；放进 prop 只会改一个可查询数值，并不会真正忙乱。
        me.add_status({ id: "zy_trial_control", name: "试炼威压", duration: 900, downside: true, is_busy: 900 });
    }
    if (this.v2) this.v2_tick(me);
    this.trial_tick_handler = this.call_out(this.trial_tick, 5000);
};

this.trial_timeout = function () {
    var me = this.trial_owner;
    this.clear_trial_timers();
    if (this.trial_mode === "endure" && me && me.hp > 0 && me.environment === this.environment) {
        if (WORLD.ZHENYI) WORLD.ZHENYI.complete_trial(me, this.trial_key, this.trial_id);
        me.notify("<hig>你守住心神，熬过了整场武意冲击。</hig>");
        me.end_fight(); this.end_fight(); return this.destroy();
    }
    if (me && WORLD.ZHENYI) WORLD.ZHENYI.fail_trial(me, this.trial_mode === "burst" ? "未能在120秒内破去化身。" : "试炼历时过久，武意已经散去。");
    if (me) me.end_fight(); this.end_fight(); this.destroy();
};

this.on_die = function (killer) {
    // 不可击杀的坚持类试炼不能清掉计时器，否则玩家误触攻击会让试炼永远无法结算。
    if (this.trial_mode === "endure") {
        this.hp = 1;
        return false;
    }
    this.clear_trial_timers();
    var owner = this.trial_owner;
    var sameOwner = !!(owner && killer && (killer === owner || (killer.id && owner.id && killer.id === owner.id)));
    // 试炼房间只允许入场玩家存在；即使底层死亡回调没有带出 killer，
    // 只要持有者仍在本副本内，也应按该持有者结算，避免奖励丢失。
    var ownerInRoom = !!(owner && owner.environment && owner.environment === this.environment);
    if ((sameOwner || ownerInRoom) && WORLD.ZHENYI) {
        // 先记录一次性成功标记，再按入场玩家结算；不要把奖励绑定到战斗链路
        // 中可能被包装/替换的 killer 引用上。
        owner.set_temp && owner.set_temp("zy_trial_npc_dead", this.trial_key + "_" + this.trial_id, 120000);
        var completed = WORLD.ZHENYI.complete_trial(owner, this.trial_key, this.trial_id);
        if (!completed && killer !== owner) WORLD.ZHENYI.complete_trial(killer, this.trial_key, this.trial_id);
    }
};
