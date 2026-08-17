this.inherits(SKILL);
this.name = "阴阳九转";
this.id = "yinyangjiuzhuan";
this.grade = 6;
this.force_rad = 1.25;
this.is_public = true;
this.desc = "上古奇功，以阴阳二气为根基，可在九烛与九幽两种状态间转换。九烛主守，气血如烛火不灭；九幽主攻，杀伐如幽冥无际。传说此功源自天地初开时的阴阳流转，修炼至大成者可一念定乾坤，一掌镇天地。";
this.can_enables = ["force"];
this.learn_condition = {
    skill: { force: 800 }
};

this.query_enable_prop = function (lv) {
    return {
        force: {
            hp_per: parseInt(lv * 0.015),
            add_sh_per: parseInt(lv / 100),
            diff_fy_per: parseInt(lv / 100),
            diff_sh_per: parseInt(lv / 100),
            limit_mp: lv * 950,
            desc: "唯一：将你内力的125%转化为气血",
        },
    };
};

// 九烛状态下的反震：被命中后对敌人造成伤害（随等级成长）
this.on_damage = function (me, from, sh) {
    if (me.query_temp("yinyang_jiuzhu") && from && from.hp > 0 && sh > 0) {
        var lv = me.query_skill("yinyangjiuzhuan");
        var reboundDmg = parseInt(12000 * lv / 1000);
        from.damage(reboundDmg, me, 0);
        me.send_room("<hiy>$N的九烛之力反震，将" + reboundDmg + "点伤害反弹给$n！</hiy>", from);
    }
    return sh;
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

this.pfm = {
    zhuanyinyang: {
        name: "转阴阳",
        distime: 30000,
        release_time: 4000,
        enable_skill: "force",
        use_type: 2,
        allow_busy: true,
        allow_faint: true,
        mp: 20,
        use: function (me, target, lv) {
            var isJiuzhu = me.query_temp("yinyang_jiuzhu");

            if (isJiuzhu) {
                // 当前是九烛，切换到九幽
                me.remove_temp("yinyang_jiuzhu");
                me.send_room("<hiy>$N催动阴阳九转，阴阳流转——九烛灭，九幽生！</hiy>");
                var jy_gj = parseInt(30 + lv / 100);
                var jy_fy = parseInt(30 + lv / 100);
                var jy_spd = parseInt(10 + lv / 100);
                me.add_status({
                    id: "force",
                    name: "九幽",
                    desc: "攻击+" + jy_gj + "%，无视防御+" + jy_fy + "%，攻击速度+" + jy_spd + "%",
                    duration: 86400000,
                    downside: false,
                    override: 2,
                    no_clear: true,
                    only_combat: true,
                    prop: { gj_per: jy_gj, diff_fy_per: jy_fy, gjsd_per: jy_spd },
                    start_msg: "<hio>$N周身幽光流转，进入九幽状态——攻伐如幽冥无际！</hio>",
                    finish_msg: "$N的九幽状态消散了。",
                });
            } else {
                // 当前是九幽或无状态，切换到九烛
                me.set_temp("yinyang_jiuzhu", 1);
                me.send_room("<hiy>$N催动阴阳九转，阴阳流转——九幽隐，九烛明！</hiy>");
                var jz_hp = parseInt(45 + lv / 100);
                var jz_dr = parseInt(15 + lv / 100);
                me.add_status({
                    id: "force",
                    name: "九烛",
                    desc: "最大气血+" + jz_hp + "%，伤害减免+" + jz_dr + "%，被命中后对敌人造成反震伤害",
                    duration: 86400000,
                    downside: false,
                    override: 2,
                    no_clear: true,
                    only_combat: true,
                    prop: { hp_per: jz_hp, diff_sh_per: jz_dr },
                    start_msg: "<hio>$N周身烛光笼罩，进入九烛状态——气血如烛火不灭！</hio>",
                    finish_msg: "$N的九烛状态消散了。",
                });
            }
        },
        query_desc: function (me, lv) {
            var jz_hp = parseInt(45 + lv / 100);
            var jz_dr = parseInt(15 + lv / 100);
            var jy_gj = parseInt(30 + lv / 100);
            var jy_fy = parseInt(30 + lv / 100);
            var jy_spd = parseInt(10 + lv / 100);
            var reboundDmg = parseInt(12000 * lv / 1000);
            return "转换阴阳二气：九烛增加" + jz_hp + "%最大气血和" + jz_dr + "%伤害减免（被动），命中后对敌人造成" + reboundDmg + "点反震伤害。九幽增加" + jy_gj + "%攻击、" + jy_fy + "%无视防御、" + jy_spd + "%攻击速度。";
        }
    },

    dingqiankun: {
        name: "定乾坤",
        distime: 60000,
        release_time: 4000,
        enable_skill: "force",
        use_type: 2,
        mp: 20,
        use: function (me, target, lv) {
            var sealTime = 4000 + parseInt((lv - 1000) / 666) * 1000;
            if (sealTime < 4000) sealTime = 4000;
            if (sealTime > 10000) sealTime = 10000;

            me.send_room("<hio>$N催动阴阳九转——「定乾坤」！一股无形之力笼罩全场，压制四方！</hio>");
            var enemies = me.environment ? me.environment.query_all_enemy(me) : [];
            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];
                if (enemy.hp <= 0) continue;
                // 累加剩余封印时间，实现叠加
                var remain = 0;
                var ext = enemy.temp && enemy.temp["sealed_pfm"];
                if (ext && ext.e && Date.now() <= ext.e) {
                    remain = ext.e - Date.now();
                }
                enemy.set_temp("sealed_pfm", 1, remain + sealTime);
                enemy.add_status({
                    id: "yinyang_dingqiankun",
                    name: "定乾坤",
                    desc: "被阴阳九转之力封印，无法使用技能",
                    duration: remain + sealTime,
                    downside: false,
                    override: 2,
                    prop: {},
                    start_msg: "<hir>$N被定乾坤之力封印，技能无法使用！</hir>",
                    finish_msg: "$N的封印解除了。",
                }, me);
            }
        },
        query_desc: function (me, lv) {
            var sealTime = 4000 + parseInt((lv - 1000) / 666) * 1000;
            if (sealTime < 4000) sealTime = 4000;
            if (sealTime > 10000) sealTime = 10000;
            return "压制附近敌人，" + (sealTime / 1000) + "秒内封印敌方技能。（最高成长至10秒）";
        }
    },

    zhentiandi: {
        name: "镇天地",
        distime: 60000,
        release_time: 4000,
        enable_skill: "force",
        use_type: 2,
        mp: 20,
        use: function (me, target, lv) {
            // 如果正在镇守中，再次使用取消
            if (me.query_temp("yinyang_zhentiandi")) {
                me.remove_temp("yinyang_zhentiandi");
                me.remove_status("yinyang_zhentiandi_buff", true);
                me.send_room("<hiy>$N收起镇天地之势，恢复如常。</hiy>");
                return;
            }

            if (!target) {
                me.notify("你需要指定一个目标来镇守。");
                return;
            }

            me.set_temp("yinyang_zhentiandi", 1);
            me.set_temp("yinyang_zhentiandi_target", target.id || target.name);

            var dr = 60 + parseInt(lv / 100);
            if (dr > 85) dr = 85;

            me.send_room("<hio>$N催动阴阳九转——「镇天地」！天地之力汇聚于身，镇守四方！</hio>");
            me.add_status({
                id: "yinyang_zhentiandi_buff",
                name: "镇天地",
                desc: "大幅增加减伤，每秒对目标造成伤害",
                duration: parseInt(lv * 10),
                downside: false,
                override: 2,
                no_diff: true,
                prop: { diff_sh_per: dr },
                duration_count: 5,
                start_msg: "<hio>$N引天地之力入体，防御大增，目标被天地之力锁定！</hio>",
                finish_msg: "$N的镇天地状态消散了。",
                on_interval: function (p, count) {
                    var t = target;
                    if (!t || t.hp <= 0 || p.hp <= 0) {
                        p.remove_temp("yinyang_zhentiandi");
                        p.remove_status("yinyang_zhentiandi_buff", true);
                        return;
                    }
                    var dmg = parseInt(p.gj + t.hp * 0.014);
                    if (dmg > 0) {
                        t.damage2(dmg, p);
                        p.send_room("<hiy>天地之力轰击$n，造成" + dmg + "点伤害！</hiy>", t);
                    }
                },
                on_expire: function (p) {
                    p.remove_temp("yinyang_zhentiandi");
                },
            });
        },
        query_desc: function (me, lv) {
            var dr = 60 + parseInt(lv / 100);
            if (dr > 85) dr = 85;
            return "5秒内减伤+" + dr + "%，引导天地之力攻击单个敌人，每秒造成自己攻击力附加敌方1.4%当前气血的伤害，1秒后再次使用可取消镇守状态。";
        }
    }
};
