this.inherits(SKILL);
this.name = "战神图录";
this.id = "zhanshentulu";
this.grade = 6;
this.force_rad = 1.4;
this.is_public = true;
this.desc = "上古四大奇书之首，传为远古战神所留。修炼者可得战神附体之力，臂力、身法、根骨、悟性皆大幅提升。传说此功共有九幅图录，每一幅皆蕴含天地至理，尽悟者可破碎九重天，证得无上武道。";
this.can_enables = ["force"];
this.learn_condition = {
    skill: { force: 800 }
};

this.query_enable_prop = function (lv) {
    return {
        force: {
            str: parseInt(lv * 1.0),
            dex: parseInt(lv * 1.0),
            con: parseInt(lv * 1.0),
            int: parseInt(lv * 1.0),
            limit_mp: lv * 1050,
            desc: "震慑：降低附近敌人15%的防御和免伤\n破碎：每次攻击附加最大内力1%的伤害（空手时加倍），并吸收部分伤害\n唯一：将你内力的140%转化为气血",
        },
    };
};

// 震慑：每个新敌人进入战斗时降低15%防御和免伤
this.on_new_enemy = function (me, target) {
    if (target && target.hp > 0) {
        target.add_status({
            id: "zhanshentulu_zhenshe",
            name: "震慑",
            desc: "被战神图录震慑，防御和免伤降低15%",
            duration: 86400000,
            downside: false,
            no_clear: true,
            override: 2,
            only_combat: true,
            prop: { fy_per: -15, diff_sh_per: -15 },
        }, me);
    }
};

// 进场驱散：驱散房间内所有敌人的增益buff
this.on_beginfight = function (me, target) {
    var room = me.environment;
    if (room) {
        for (var j = 0; j < room.items.length; j++) {
            var enemy = room.items[j];
            if (enemy === me || !enemy.status || !enemy.status.length) continue;
            if (enemy.is_player && !me.is_fighting(enemy)) continue;
            for (var i = enemy.status.length - 1; i >= 0; i--) {
                var st = enemy.status[i];
                if (!st.downside && !st.no_clear) {
                    enemy.remove_status(st.id, true);
                }
            }
        }
    }
};

// 破碎：每次攻击附加最大内力1%伤害（空手加倍），吸收部分伤害
this.on_force_over = function (me, target, par, sh) {
    if (sh <= 0 || !target || target.hp <= 0) return;
    var weapon = me.query_weapon();
    var isUnarmed = !weapon || weapon.weapon_type === WEAPON_TYPE.NONE;
    var bonusDmg = parseInt(me.max_mp * (isUnarmed ? 0.02 : 0.01));
    if (bonusDmg > 0) {
        target.damage2(bonusDmg, me);
        var absorb = parseInt(bonusDmg * 0.3);
        if (absorb > 0) {
            me.do_recover(absorb);
        }
    }
};

this.pfm = {
    zhanshenjue: {
        name: "战神决",
        distime: 60000,
        release_time: 4000,
        enable_skill: "force",
        use_type: 2,
        allow_busy: true,
        allow_faint: true,
        mp: 20,
        use: function (me, target, lv) {
            var boost = 30 + parseInt(lv / 100);
            if (boost > 60) boost = 60;

            me.send_room("<hio>$N催动战神图录——「战神决」！战神附体，威势滔天！</hio>");
            me.add_status({
                id: "force",
                name: "战神决",
                desc: "攻击+" + boost + "%，命中+" + boost + "%，伤害+" + boost + "%，免疫控制",
                duration: 10000 + parseInt(lv / 100),
                downside: false,
                override: 2,
                prop: {
                    gj_per: boost,
                    mz_per: boost,
                    add_sh_per: boost,
                    ig_control: 1,
                },
                start_msg: "<hio>$N战神附体，战力飙升，威不可挡！</hio>",
                finish_msg: "$N的战神决状态消散了。",
            });
        },
        query_desc: function (me, lv) {
            var boost = 30 + parseInt(lv / 100);
            if (boost > 60) boost = 60;
            return "战神附体，短时间内攻击、命中、伤害各提升" + boost + "%，并免疫控制。";
        }
    },

    yanmie: {
        name: "湮灭",
        distime: 40000,
        release_time: 4000,
        enable_skill: "force",
        use_type: 2,
        mp: 20,
        use: function (me, target, lv) {
            if (!target) {
                me.notify("你需要指定一个目标。");
                return;
            }

            me.send_room("<hio>$N催动战神图录——「湮灭」！一拳轰出，拳破天地！</hio>", target);

            // 造成11%最大内力伤害
            var dmg = parseInt(me.max_mp * 0.11);
            if (dmg > 0) {
                target.damage2(dmg, me);
            }

            // 重置对方所有持续状态
            if (target.status && target.status.length) {
                for (var i = target.status.length - 1; i >= 0; i--) {
                    var st = target.status[i];
                    if (!st.no_clear) {
                        target.remove_status(st.id, true);
                    }
                }
            }

            // 减少对方的伤害和破防
            var debuffVal = 30 + parseInt(lv / 200);
            if (debuffVal > 50) debuffVal = 50;
            target.add_status({
                id: "zhanshentulu_yanmie",
                name: "湮灭",
                desc: "被湮灭之力重创，伤害-" + debuffVal + "%，破防-" + debuffVal + "%",
                duration: 10000 + parseInt(lv / 100),
                downside: true,
                override: 2,
                prop: { gj_per: -debuffVal, diff_fy_per: -debuffVal },
                start_msg: "<hir>$N被湮灭之力重创，伤害和破防大减！</hir>",
                finish_msg: "$N的湮灭状态消散了。",
            }, me);

            me.end_attack(target);
        },
        query_desc: function (me, lv) {
            var debuffVal = 30 + parseInt(lv / 200);
            if (debuffVal > 50) debuffVal = 50;
            return "造成11%最大内力伤害，重置对方所有持续状态，并使其伤害和破防降低" + debuffVal + "%。";
        }
    },

    posuijiuchongtian: {
        name: "破碎九重天",
        distime: 60000,
        release_time: 4000,
        enable_skill: "force",
        use_type: 2,
        mp: 0,
        use: function (me, target, lv) {
            var consumeMp = parseInt(me.mp * 0.25);
            if (consumeMp <= 0) {
                me.notify("你的内力不足，无法施展破碎九重天。");
                return;
            }

            me.add_mp(-consumeMp);
            me.send_room("<hio>$N催动战神图录终极奥义——「破碎九重天」！天地破碎，虚空崩灭！</hio>");

            var enemies = me.environment ? me.environment.query_all_enemy(me) : [];
            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];
                if (enemy.hp <= 0) continue;

                // 造成同等消耗内力的伤害
                enemy.damage2(consumeMp, me);

                // 昏迷7秒（不成长）
                enemy.add_status({
                    id: "faint",
                    name: "昏迷",
                    desc: "被破碎九重天之力震晕",
                    duration: Math.min(2000 + parseInt(lv * 5), 7000),
                    downside: true,
                    override: 2,
                    is_faint: true,
                    start_msg: "<hir>$N被破碎九重天之力震得昏迷过去！</hir>",
                    finish_msg: "$N悠悠转醒。",
                }, me);
            }
        },
        query_desc: function (me, lv) {
            return "消耗25%当前内力，对附近敌人造成同等伤害，并使其昏迷" + (Math.min(2000 + parseInt(lv * 5), 7000) / 1000) + "秒。";
        }
    }
};
