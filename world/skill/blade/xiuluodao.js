this.inherits(SKILL);
this.name = "修罗刀";
this.id = "xiuluodao";
this.grade = 6;
this.desc = "修罗刀法，刀出无回，中者流血不止，如坠修罗地狱。";

this.attack_actions = [
    "$N手中$w一抖，刀光如修罗鬼影，劈向$n的$l！",
    "$N刀锋一转，修罗刀法展开，血色刀气笼罩$n全身！",
    "$N暴喝一声，$w带着凄厉风声斩向$n的$l！",
    "$N身法诡异，$w划出诡异弧线，$n避无可避！",
    "$N刀势沉雄，一招「修罗降世」劈向$n！"
];

this.can_enables = ["blade"];

this.learn_condition = {
    max_mp: 5000,
    skill: { blade: 500 }
};

this.query_enable_prop = function (lv) {
    return {
        blade: {
            gj: 200 + parseInt(lv * 1.8),
            mz: parseInt(lv * 1.5) + 100,
            gj_per: 3 + parseInt(lv / 200),
            mz_per: 3 + parseInt(lv / 200),
            add_sh_per: 3 + parseInt(lv / 200),
            diff_fy_per: 3 + parseInt(lv / 200),
            desc: "命中后使敌人流血并降低防御，最多叠加10层。"
        }
    };
};

// 平A命中后添加流血状态
this.on_attack_over = function (me, target, par) {
    if (!par.is_dodge && !par.is_parry) {
        var lv = me.query_skill("xiuluodao", 0);
        var dps = 5 * lv + (me.gj || 0);
        target.add_status({
            id: "xiuluo_bleed",
            name: "修罗",
            desc: "每秒受到流血伤害，且防御降低",
            duration: 5000 + parseInt(lv * 5),
            max_count: 10,
            count: 1,
            downside: true,
            override: 1,
            prop: { fy_per: -parseInt(lv * 1 / 1000) },
            start_msg: "<HIR>$n被修罗刀气侵袭，血流不止！</HIR>",
            finish_msg: "<CYN>$n身上的修罗之气消散了。</CYN>",
            data: { dps: dps },
            duration_count: 10,
            on_interval: function (target, count) {
                var dps = this.data ? this.data.dps : 0;
                if (target && target.hp > 0) {
                    target.add_hp(-dps);
                    if (target.send_combat) {
                        target.send_combat("<HIR>$n因修罗流血，损失" + dps + "点气血！</HIR>", target);
                    }
                }
            }
        }, me);
    }
};

function lianyu_bonus_percent(lv) { return 1 + parseInt((lv || 0) / 500); }

// 修罗炼狱击杀后清掉自身冷却：玩家手动出招的冷却 temp（pfm/blade/lianyu）与自动出招的 release_time 都要清
function reset_lianyu_cd(me, pfm) {
    if (!me) return;
    var t = me.temp && me.temp["pfm/blade/lianyu"];
    if (t && t.e > Date.now()) pfm.change_distime(me, "blade/lianyu");
    if (me.auto_skills) {
        for (var i = 0; i < me.auto_skills.length; i++) {
            if (me.auto_skills[i].pfm === pfm) me.auto_skills[i].release_time = 0;
        }
    }
}

this.pfm = {
    // 修罗炼狱：根据流血层数多次攻击
    lianyu: {
        name: "修罗炼狱",
        distime: 20000,
        enable_skill: "blade",
        weapon_type: WEAPON_TYPE.BLADE,
        mp: 1803,   // 与多数 6 品绝招一致（固定 mp 20，引擎按等级放大：20 + lv*20/20）
        release_time: 4000,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要对谁使用绝招？");
            me.send_room("<HIR>$N暴喝一声：「修罗炼狱！」刀光化作万千血影，笼罩$n！</HIR>", target);

            // query_status 返回的就是层数（数字），原先在数字上取 .count，层数恒为 1
            var layer = target.query_status("xiuluo_bleed");   // 攻击次数 = 1 + 层数（无层数时 1 次）
            var count = 1 + Math.min(layer, 10);
            var killed = false;

            // 每段附加目标当前气血 (1 + lv/500)%（2300 级 5%），附加部分不超过自身攻击 ×2
            var bonusPercent = lianyu_bonus_percent(lv);
            for (var i = 0; i < count; i++) {
                var bonus = Math.min(parseInt(target.hp * bonusPercent / 100), (me.gj || 0) * 2);
                var dmg = me.do_attack({
                    target: target,
                    gj: me.gj + bonus,
                    mz: me.mz,
                    attack_msg: (i === 0 ? "" : "<HIC>刀影再起，又一道修罗斩！</HIC>")
                });
                if (dmg && target.hp <= 0) {
                    killed = true;
                    break;
                }
            }

            if (killed) {
                // 冷却是在 use 返回之后才由 pfm.js / auto_combat.js 写入的，这里直接重置会被随后写入的冷却覆盖，
                // 所以推迟到本次出招结算完再清。原先传的 id "xiuluodao/lianyu" 也不对（冷却键是 pfm/blade/lianyu）。
                var pfmObj = this;
                setTimeout(function () { reset_lianyu_cd(me, pfmObj); }, 0);
                me.send_combat("<HIG>修罗炼狱斩杀了敌人，技能冷却重置！</HIG>", target);
            }
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            var bonus = lianyu_bonus_percent(lv);
            var cap = me && me.gj ? "（最多" + (me.gj * 2) + "点）" : "（最多为自身攻击的2倍）";
            return "根据敌人身上的修罗层数进行多次攻击（1+层数，最多11次），每次附加敌人当前气血" + bonus + "%的伤害" + cap + "。击杀重置冷却。冷却" + (me && this.query_distime ? this.query_distime(me, lv) / 1000 : 20) + "秒，出招" + (me && this.query_releasetime ? this.query_releasetime(me, lv) / 1000 : 4) + "秒。"
        }
    },

    // 六道轮回：先按层数增伤攻击，命中后清除流血，并将伤害值转化为自身攻击/命中增益
    liudao: {
        name: "六道轮回",
        distime: 20000,
        enable_skill: "blade",
        weapon_type: WEAPON_TYPE.BLADE,
        mp: 1803,   // 与多数 6 品绝招一致（固定 mp 20，引擎按等级放大：20 + lv*20/20）
        release_time: 4000,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要对谁使用绝招？");

            // 获取当前流血层数（若没有则按1层计算）
            // query_status 返回的就是层数（数字），原先在数字上取 .count，层数恒为 1
            var layer = target.query_status("xiuluo_bleed") || 1;

            // 每层增加 (lv/2)% 伤害
            var per = 100 + layer * parseInt(lv / 2);
            var damage = me.do_attack({
                target: target,
                gj: parseInt(me.gj * per / 100),
                mz: me.mz,
                attack_msg: "<HIR>$N低喝：「六道轮回！」刀光化作六道虚影，引动轮回之力！</HIR>",
                damage_msg: "<HIR>$n被轮回之力重创，浑身血光四溅！</HIR>"
            });

            // 命中后（damage > 0）清除流血状态，并根据伤害值给予自身增益
            if (damage && damage > 0) {
                // 清除目标身上的流血状态（不清理其他负面状态，若需清理可用 target.clear_downside(false)）
                target.remove_status("xiuluo_bleed", true);

                // 增益数值 = 本次造成的伤害值（设置上限避免过高）
                var buffVal = damage;
                if (buffVal > 500000) buffVal = 500000;

                me.add_status({
                    id: "xiuluo_buff",
                    name: "修罗之力",
                    desc: "攻击和命中大幅提升",
                    duration: Math.min(5000 + parseInt(lv * 10), 10000),
                    prop: {
                        gj: buffVal,
                        mz: buffVal
                    },
                    start_msg: "<HIY>$N吸收了六道轮回之力，修罗之气灌注全身！</HIY>",
                    finish_msg: "<CYN>$N的修罗之力渐渐消散。</CYN>"
                }, me);
                me.send_combat("<HIG>$N从轮回中汲取力量，刀势愈发凌厉！</HIG>", target);
            }
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            var per = parseInt(lv / 2);
            return "根据敌人身上的修罗层数（无层数则按1层）造成每层" + per + "%的额外伤害，命中后清除目标流血状态，并将本次造成的伤害值转化为自身攻击和命中增益，持续" + (Math.min(5000 + parseInt(lv * 10), 10000) / 1000) + "秒。冷却" + (me && this.query_distime ? this.query_distime(me, lv) / 1000 : 20) + "秒，出招" + (me && this.query_releasetime ? this.query_releasetime(me, lv) / 1000 : 4) + "秒。"
        }
    }
};
