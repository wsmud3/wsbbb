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

this.pfm = {
    // 修罗炼狱：根据流血层数多次攻击
    lianyu: {
        name: "修罗炼狱",
        distime: 0,
        enable_skill: "blade",
        weapon_type: WEAPON_TYPE.BLADE,
        mp: 0,
        release_time: 0,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要对谁使用绝招？");
            me.send_room("<HIR>$N暴喝一声：「修罗炼狱！」刀光化作万千血影，笼罩$n！</HIR>", target);

            var status = target.query_status("xiuluo_bleed");
            var layer = status ? (status.count || 1) : 1;
            var count = 1 + Math.min(layer, 10);
            var killed = false;

            for (var i = 0; i < count; i++) {
                var bonusPercent = 1 + parseInt(lv / 10);
                var bonus = parseInt(target.hp * bonusPercent / 100);
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
                this.change_distime(me, "xiuluodao/lianyu");
                me.send_combat("<HIG>修罗炼狱斩杀了敌人，技能冷却重置！</HIG>", target);
            }
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            var bonus = 1 + parseInt(lv / 10);
            return "根据敌人身上的修罗层数进行多次攻击（1+层数，最多11次），每次附加敌人当前气血" + bonus + "%的伤害。击杀重置冷却。"
        }
    },

    // 六道轮回：先按层数增伤攻击，命中后清除流血，并将伤害值转化为自身攻击/命中增益
    liudao: {
        name: "六道轮回",
        distime: 0,
        enable_skill: "blade",
        weapon_type: WEAPON_TYPE.BLADE,
        mp: 0,
        release_time: 0,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要对谁使用绝招？");

            // 获取当前流血层数（若没有则按1层计算）
            var status = target.query_status("xiuluo_bleed");
            var layer = status ? (status.count || 1) : 1;

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
                    duration: 5000 + parseInt(lv * 10),          // 持续15秒
                    prop: {
                        gj: buffVal,
                        mz: buffVal
                    },
                    start_msg: "<HIY>$N吸收了六道轮回之力，修罗之气灌注全身！</HIY>",
                    finish_msg: "<CYN>$N的修罗之力渐渐消散。</CYN>"
                }, me);
                me.send_combat("<HIG>$N从轮回中汲取力量，攻击和命中提升了" + buffVal + "点！</HIG>", target);
            }
            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            var per = parseInt(lv / 2);
            return "根据敌人身上的修罗层数（无层数则按1层）造成每层" + per + "%的额外伤害，命中后清除目标流血状态，并将本次造成的伤害值转化为自身攻击和命中增益，持续15秒。"
        }
    }
};
