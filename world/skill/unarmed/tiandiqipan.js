this.inherits(SKILL);
this.name = "天地棋盘";
this.id = "tiandiqipan";
this.grade = 6;

this.attack_actions = [
    "$N双手负于身后，周身气势骤然一变，天地仿佛化作一方棋盘",
    "$N踏前一步，双掌纵横交错，宛如落子一般攻向$n的$l",
    "$N身形如行棋落子，一式<HIC>「天地棋盘」</HIC>直取$n的要害",
    "$N双掌翻飞，攻势如棋局般层层推进，封死$n的退路",
    "$N目光如电，抬手之间杀机四伏，拳势直逼$n的$l"
];

this.desc = "以天地为盘，以众生为子，拳脚之间尽显棋局杀伐之道。";

this.can_enables = ["unarmed"];

this.learn_condition = {
    max_mp: 5000,
    skill: {
        unarmed: 1000
    }
};

// 每200级增加1点，初始15点
this.query_enable_prop = function (lv) {
    var val = 15 + parseInt(lv / 200);

    return {
        unarmed: {
            // 攻击百分比
            gj_per: val,

            // 命中百分比
            mz_per: val,

            // 暴击
            bj_per: val,

            // 暴击伤害
            add_bjsh_per: val,

            // 忽视防御
            diff_fy_per: val,

            // 最终伤害
            add_sh_per: val
        }
    };
};

this.pfm = {

    // =========================================================
    // 将军
    // 必定攻击头部
    // 必定暴击
    // 真伤
    // 初始1.5倍，每100级增加0.1倍
    // 低于10%生命直接斩杀
    // =========================================================
    jiangjun:
    {
        name: "将军",
        distime: 20000,
        enable_skill: "unarmed",
        weapon_type: WEAPON_TYPE.UNARMED,
        mp: 30,

        use: function (me, target, lv) {

            if (!target || target.hp <= 0) return;

            // 必定攻击头部
            var part = "头部";

            // 伤害倍率
            var damage_rate = 1.5 + parseInt(lv / 100) * 0.1;

            // 真实伤害
            var damage = Math.floor(me.gj * damage_rate);

            if (damage < 1) damage = 1;

            // 造成真实伤害
            target.damage3(damage, me);

            // 冷色系伤害文本
            me.send_combat(
                "<HIC>「将军」击中$n的" +
                part +
                "，造成" +
                damage +
                "点伤害！</HIC>",
                target
            );

            // 伤害后低于10%直接斩杀
            if (target.hp > 0 && target.hp / target.max_hp < 0.10) {

                me.send_combat(
                "<HIB>「将军」棋局已定，$n被直接斩杀！</HIB>",
                target
                );

                target.hp = 0;

                if (target.die(me) !== false) {
                    target.end_fight();

                    if (me.enemy) {
                        me.enemy.remove(target);
                    }

                    if (!me.enemy || !me.enemy.length) {
                        if (me.hp <= 0) me.hp = 1;
                        me.end_fight();
                    }
                }

                return;
            }

            target.send_combat(
                query_status_msg(target.hp, target.max_hp)
            );

            me.end_attack(target);
        },

        query_desc: function (me, lv) {

            var damage_rate = 1.5 + parseInt(lv / 100) * 0.1;

            return "造成一次" +
            damage_rate.toFixed(1) +
            "倍伤害，如果目标血量低于10%则直接斩杀。";
        }
    },


    // =========================================================
    // 围杀
    // 不可清除
    // 不受负面抵抗影响
    // 每秒最大生命1%真伤
    // 持续10～20秒
    // =========================================================
    weisha:
    {
        name: "围杀",
        distime: 30000,
        enable_skill: "unarmed",
        weapon_type: WEAPON_TYPE.UNARMED,
        mp: 40,

        use: function (me, target, lv) {

            var time = 10 + parseInt(lv / 200);

            if (time > 20) time = 20;

            target.add_status({
                id: "tiandiqipan_weisha",
                name: "围杀",

                // 简洁状态描述
                desc: "每秒损失最大生命1%。",

                duration: 1000,
                duration_count: time,

                // 负面状态
                downside: true,

                // 不可清除
                no_clear: true,

                // 不受负面抵抗影响
                no_diff: true,

                // 每秒触发
                on_interval: function (obj, count) {

                    if (obj.hp <= 0) return false;

                    // 每秒扣除最大生命1%，向下取整
                    var damage = Math.floor(obj.max_hp * 0.01);

                    if (damage < 1) damage = 1;

                    // 真伤
                    obj.damage3(damage, me);

                    // 冷色系伤害文本
                    obj.send_combat(
                        "<HIC>「围杀」造成" +
                        damage +
                        "点伤害！</HIC>",
                        obj
                    );

                    if (obj.hp <= 0) {

                        obj.hp = 0;

                        if (obj.die(me) !== false) {

                            obj.end_fight();

                            if (me.enemy) {
                                me.enemy.remove(obj);
                            }

                            if (!me.enemy || !me.enemy.length) {
                                if (me.hp <= 0) me.hp = 1;
                                me.end_fight();
                            }
                        }

                        return false;
                    }

                    return true;
                },

                // 冷色系添加状态文本
                start_msg:
                "<HIB>$N使$n陷入「围杀」！</HIB>",

                finish_msg:
                "<HIC>$N的「围杀」结束。</HIC>"
            }, me);
        },

        query_desc: function (me, lv) {

            var time = 10 + parseInt(lv / 200);

            if (time > 20) time = 20;

            return "使目标陷入「围杀」，每秒损失最大生命1%，持续" +
            time +
            "秒。";
        }
    },


    // =========================================================
    // 退守
    // 无敌 + 免控
    // 持续10～30秒
    // =========================================================
    tuishou:
    {
        name: "退守",
        distime: 40000,
        enable_skill: "unarmed",
        weapon_type: WEAPON_TYPE.UNARMED,
        mp: 50,

        use: function (me, target, lv) {

            var time = 10 + parseInt(lv / 200);

            if (time > 30) time = 30;

            me.add_status({
                id: "tiandiqipan_tuishou",
                name: "退守",

                // 简洁状态描述
                desc: "无敌并免疫控制。",

                duration: time * 1000,

                // 免疫控制
                ig_control: time * 1000,

                // 100%伤害减免
                prop: {
                    diff_sh_per: 100
                },

                // 冷色系添加状态文本
                start_msg:
                "<HIB>$N进入「退守」状态！</HIB>",

                finish_msg:
                "<HIC>$N的「退守」结束。</HIC>"
            });
        },

        query_desc: function (me, lv) {

            var time = 10 + parseInt(lv / 200);

            if (time > 30) time = 30;

            return "进入无敌并免疫控制状态，持续" +
            time +
            "秒。";
        }
    }
};


// =========================================================
// 生命状态显示
// =========================================================
function query_status_msg(hp, maxhp) {

    var ratio = parseInt(hp * 10 / maxhp);

    if (ratio < 0) ratio = 0;
    if (ratio > 9) ratio = 9;

    var status_msg = [
        "($N<HIG>看起来充满活力，一点也不累。</HIG>)\n",
        "($N<HIG>似乎有些疲惫，但是仍然十分有活力。</HIG>)\n",
        "($N<HIY>看起来可能有些累了。</HIY>)\n",
        "($N<HIY>动作似乎开始有点不太灵光，但是仍然有条不紊。</HIY>)\n",
        "($N<HIY>气喘嘘嘘，看起来状况并不太好。</HIY>)\n",
        "($N<RED>似乎十分疲惫，看来需要好好休息了。</RED>)\n",
        "($N<RED>已经一副头重脚轻的模样，正在勉力支撑著不倒下去。</RED>)\n",
        "($N<RED>看起来已经力不从心了。</RED>)\n",
        "($N<HIR>摇头晃脑、歪歪斜斜地站都站不稳，眼看就要倒在地上。</HIR>)\n",
        "($N<HIR>已经陷入半昏迷状态，随时都可能摔倒晕去。</HIR>)\n"
    ];

    return status_msg[9 - ratio];
}
