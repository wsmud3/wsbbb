this.inherits(SKILL);
this.name = "掌中之国";
this.id = "zhangzhongzhiguo";
this.grade = 6;
this.desc = "掌中可纳山河，方寸即是天下。此功以天地为棋盘，众生为棋子，举手投足间尽显王者气象。";

this.attack_actions = [
    "$N一掌拍出，掌风如千军万马奔腾，直袭$n的$l！",
    "$N五指虚握，仿佛将天地纳入掌心，猛然向$n的$l抓去！",
    "$N拳势沉雄，一招「君临天下」击向$n的$l！",
    "$N掌法圆转，如抚山河，劲力暗涌，$n只觉周身被无形之力笼罩！",
    "$N双掌齐出，气劲交织成网，$n避无可避！",
    "$N踏前一步，拳掌交替，招式雄浑磅礴，$n的$l被牢牢锁定！"
];

this.parry_actions = [
    "$n双掌交错，气劲形成无形屏障，$N的招式被轻松化解。",
    "$n不慌不忙，以掌中乾坤之势引开$N的攻击。",
    "$n掌力微吐，将$N的攻势尽数卸去，稳如泰山。",
    "$n长袖轻挥，气劲如城墙般坚不可摧，$N难越雷池。"
];

this.can_enables = ["unarmed", "parry"];

this.learn_condition = {
    max_mp: 5000,
    skill: { unarmed: 500 }
};

// ========== 属性加成 ==========
this.query_enable_prop = function (lv) {
    var unarmed_gj = Math.floor(20 + lv * 3.5);
    var unarmed_mz = Math.floor(20 + lv * 3.5);
    var unarmed_gjsd_per = Math.floor(5 + lv / 500);
    var unarmed_str = Math.floor(50 + lv * 0.5);

    var parry_fy = Math.floor(20 + lv * 3);
    var parry_con = Math.floor(40 + lv * 0.6);
    var parry_diff_sh_per = Math.floor(5 + lv / 300);

    return {
        unarmed: {
            gj: unarmed_gj,
            mz: unarmed_mz,
            gjsd_per: unarmed_gjsd_per,
            str: unarmed_str,
            desc: "你的攻击每命中一次，攻击和命中提高10%，持续10秒，最多叠加5层。"
        },
        parry: {
            fy: parry_fy,
            con: parry_con,
            diff_sh_per: parry_diff_sh_per
        }
    };
};

// ========== 被动叠层（示例模式） ==========
function add_power_buff(me) {
    if (!me) return;
    me.add_status({
        id: "zhangzhongzhiguo_power",
        name: "掌中之国",
        desc: "提升你的攻击和命中",
        duration: parseInt(lv * 10),
        downside: false,
        override: 1,
        count: 1,
        max_count: 5,
        prop: {
            gj_per: parseInt(lv / 100),
            mz_per: parseInt(lv / 100)
        },
        start_msg: "<HIC>$N气势大涨，掌中仿佛握住天下！</HIC>",
        finish_msg: "<CYN>$N的气势渐渐平息。</CYN>"
    }, me);
}

// 战斗系统命中回调
this.do_attack = function (me, target, par) {
    if (target && target.hp > 0) {
        add_power_buff(me);
    }
};

// ========== 自动攻击启动 ==========
function start_auto_attack(me) {
    if (!me) return;
    if (me.fight_type && !me.attack_handler && me.call_out && me.auto_attack) {
        me.attack_handler = me.call_out(me.auto_attack, Math.random() * (me.gjsd || 1000));
    }
}

this.on_new_enemy = function(me, target) {
    start_auto_attack(me);
};
this.on_beginfight = function(me, target) {
    start_auto_attack(me);
};

// ========== 绝招 ==========
this.pfm = {
    // 出征：倍率随等级提升（初始2倍攻3倍命，每1000级+1倍）
    expedition: {
        name: "出征",
        distime: 20000,
        enable_skill: "unarmed",
        release_time: 2500,
        mp: 0,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要对谁使用绝招？");
            // 计算倍率：攻击倍率 = 2 + floor(lv/1000)，命中倍率 = 3 + floor(lv/1000)
            var bonus = Math.floor(lv / 1000);
            var atk_mult = 2 + bonus;
            var hit_mult = 3 + bonus;

            me.send_room("<HIR>$N沉声低喝：「出征！」双掌如令旗般挥出，气劲排山倒海！</HIR>", target);

            var damage = me.do_attack({
                target: target,
                gj: me.gj * atk_mult,
                mz: me.mz * hit_mult,
                attack_msg: "<HIY>$N掌力猛然提升，如千军万马出征！</HIY>",
                damage_msg: "<HIR>$n被掌力击中，浑身剧震！</HIR>"
            });

            if (damage && damage > 0) {
                add_power_buff(me);
                var reduce = Math.floor(10 + lv / 100);
                if (reduce > 40) reduce = 40;
                target.add_status({
                    id: "zhangzhongzhiguo_zhengtao",
                    name: "征讨",
                    desc: "防御、招架、躲闪降低",
                    duration: 10000 + parseInt(lv * 5),
                    downside: true,
                    prop: {
                        fy_per: -reduce,
                        zj_per: -reduce,
                        ds_per: -reduce
                    },
                    start_msg: "<HIR>$n被「征讨」之气笼罩，实力大减！</HIR>",
                    finish_msg: "<CYN>$n身上的征讨之气消散了。</CYN>"
                }, me);
            }
            start_auto_attack(me);
        },
        query_desc: function (me, lv) {
            var bonus = Math.floor(lv / 1000);
            var atk_mult = 2 + bonus;
            var hit_mult = 3 + bonus;
            var reduce = Math.floor(10 + lv / 100);
            if (reduce > 40) reduce = 40;
            return "对敌人造成" + atk_mult + "倍攻击、" + hit_mult + "倍命中的强力一击，命中后降低敌人" + reduce + "%防御、招架、躲闪，持续15秒。";
        }
    },

    // 围攻：不变
    siege: {
        name: "围攻",
        distime: 25000,
        enable_skill: "unarmed",
        release_time: 3000,
        mp: 0,
        use: function (me, target, lv) {
            if (!target) return me.notify("你要对谁使用绝招？");
            me.send_room("<HIR>$N暴喝一声：「围攻！」掌影重重，如千军万马包围$n！</HIR>", target);

            var count = 3 + Math.floor(lv / 200);
            if (count > 9) count = 9;
            var total_damage = 0;

            for (var i = 0; i < count; i++) {
                var damage = me.do_attack({
                    target: target,
                    attack_msg: (i === 0 ? "" : "<HIC>又一波掌影袭来！</HIC>")
                });
                if (damage && damage > 0) {
                    total_damage += damage;
                    add_power_buff(me);
                    var recover = Math.floor(damage * 0.2);
                    if (recover > 0) {
                        me.add_hp(recover);
                        me.add_mp(recover);
                        me.send_combat("<HIG>$N从伤害中汲取了" + recover + "点气血和内力！</HIG>", target);
                    }
                }
            }
            me.send_combat("<HIR>围攻结束，共造成" + total_damage + "点伤害！</HIR>", target);
            start_auto_attack(me);
        },
        query_desc: function (me, lv) {
            var count = 3 + Math.floor(lv / 200);
            if (count > 9) count = 9;
            return "连续攻击" + count + "次，每次造成普通伤害，并将伤害的20%转化为自身气血和内力。";
        }
    },

    // 坚守：不变
    hold: {
        name: "坚守",
        distime: 30000,
        enable_skill: "parry",
        release_time: 2000,
        mp: 0,
        use: function (me, target, lv) {
            me.send_room("<HIC>$N沉腰坐马，气沉丹田，掌力化作铜墙铁壁，进入「坚守」状态！</HIC>", target);
            var bonus = Math.floor(30 + lv / 100);
            if (bonus > 50) bonus = 50;
            me.add_status({
                id: "zhangzhongzhiguo_hold",
                name: "坚守",
                desc: "防御和伤害减免提升",
                duration: 10000 + parseInt(lv * 10),
                prop: {
                    fy_per: bonus,
                    diff_sh_per: bonus
                },
                start_msg: "<HIB>$N周身气劲凝实，如铜墙铁壁！</HIB>",
                finish_msg: "<CYN>$N的坚守状态解除了。</CYN>"
            }, me);
            start_auto_attack(me);
        },
        query_desc: function (me, lv) {
            var bonus = Math.floor(30 + lv / 100);
            if (bonus > 50) bonus = 50;
            return "进入坚守状态，提升自身" + bonus + "%防御和伤害减免，持续20秒。";
        }
    }
};
