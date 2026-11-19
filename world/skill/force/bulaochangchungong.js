this.inherits(SKILL);
this.name = "不老长春功";
this.id = "bulaochangchungong";
this.grade = 5;
this.is_public = true;
this.force_rad = 1.5;
this.desc = "天长地久不老长春功，又名八荒六合唯我独尊，是灵鹫宫天山童姥的绝学。";
this.can_enables = ["force"];
this.learn_condition = {
    max_mp: 10000,
    skill: { force: 1000 }
};

// 年龄加成：在 -9 ~ +9 之间往复。0 级 -9，每 100 级 +1，1800 级到 +9，之后每 100 级 -1，3600 级回到 -9，循环。
// 引擎里 prop.age 的语义是「年轻多少岁」（USER.query_age = 基础年龄 - query_prop("age")，展示为「年龄：-N岁」），
// 所以「年龄加成 v」对应 prop.age = -v：v 为正显得更年长，为负更年轻。
function age_bonus(lv) {
    var p = Math.floor((lv || 0) / 100) % 36;
    return p <= 18 ? p - 9 : 27 - p;
}
this.age_bonus = age_bonus;
this.query_prop = function (lv, me) {
    var prop = {};
    if (me && me.is_player) {
        var v = age_bonus(lv);
        if (v) prop.age = -v;
    }
    return prop;
};

this.on_before_attack = function (me, target, par) {
    if (!target || target.hp <= 0 || par.no_append_before) return;
    // 年龄越大附加伤害越高：按实际年龄（含本功的年龄加成）计算。
    // 原先读的是 query_prop("age")（玩家只有 9，floor(9/10)=0），对玩家恒为 0。
    var age = me.query_age ? me.query_age() : (me.age || 0);
    if (age > 0) {
        var bonus = Math.floor(age / 10);
        if (bonus > 0) {
            par.gj = (par.gj || me.gj) + bonus * 100;
        }
    }
};

this.on_damage = function (me, from, sh) {
    // 唯一: 内力的95%转化为气血
    return sh;
};

this.query_enable_prop = function (lv) {
    return {
        force: {
            max_hp: parseInt(lv * 20100 / 1000),
            hp_per: 8,
            con: parseInt(lv * 338 / 1000),
            diff_fy_per: 6,
            limit_mp: parseInt(lv * 285000 / 1000),
            desc: "年龄：" + (age_bonus(lv) >= 0 ? "+" : "") + age_bonus(lv) + "岁\n命中后对敌人造成附加伤害(年龄越大伤害越高)\n唯一：将你内力的95%转化为气血",
        },
    };
};

this.pfm = {
    changchun: {
        name: "不老长春",
        distime: 27000,
        enable_skill: "force",
        release_time: 3800,
        mp: 35,
        use: function (me, target, lv) {
            me.send_room("<HIG>$N运转不老长春功，真气澎湃而出——「不老长春」！</HIG>", target);
            var total_damage = 0;
            if (me.enemy) {
                for (var i = 0; i < me.enemy.length; i++) {
                    var t = me.enemy[i];
                    if (t && t.hp > 0) {
                        var sh = me.do_attack({
                            target: t,
                            gj: me.gj * 2,
                            attack_msg: "<HIG>$N的长春真气如潮水般涌向" + t.name + "！</HIG>"
                        });
                        if (sh > 0) total_damage += sh;
                    }
                }
            } else if (target) {
                var sh = me.do_attack({
                    target: target,
                    gj: me.gj * 2,
                    attack_msg: "<HIG>$N的长春真气涌向$n！</HIG>"
                });
                if (sh > 0) total_damage += sh;
            }
            if (target) me.end_attack(target);
            if (total_damage > 0) {
                me.do_recover(Math.floor(total_damage));
                me.send_room("<HIG>$N吸收了" + Math.floor(total_damage) + "点气血！</HIG>");
            }
        },
        query_desc: function (me, lv) {
            return "对附近敌人造成200%的伤害，并且吸收伤害转化为自身气血。";
        }
    },
    wo: {
        name: "唯我独尊",
        distime: 39000,
        enable_skill: "force",
        release_time: 3800,
        mp: 20,
        use: function (me, target, lv) {
            me.send_room("<HIM>$N仰天长啸，不老长春功霸气外露——「唯我独尊」！</HIM>", target);
            if (me.enemy) {
                for (var i = 0; i < me.enemy.length; i++) {
                    var t = me.enemy[i];
                    if (t && t.hp > 0) {
                        t.add_status({
                            id: "bulao_chidun",
                            name: "迟钝",
                            desc: "技能释放速度和冷却时间减慢3秒",
                            duration: 12000 + parseInt(lv * 5),
                            only_combat: true,
                            downside: true,
                            prop: {
                                // 引擎读取的 key 是 releasetime / distime（负值为延长）；原先写成 release_time，没人读
                                releasetime: -3000,
                                distime: -3000,
                            },
                            start_msg: "<HIM>$N被「唯我独尊」的霸气震慑，招式运转迟缓！</HIM>",
                            finish_msg: "$N从「唯我独尊」的震慑中恢复。",
                        }, me);
                    }
                }
            }
            if (target) {
                me.do_attack({ target: target });
                me.end_attack(target);
            }
        },
        query_desc: function (me, lv) {
            return "震慑附近敌人，使对方难以释放技能，" + (12 + parseInt(lv * 5 / 1000)) + "秒内技能释放速度和冷却时间减慢3秒。";
        }
    }
};
