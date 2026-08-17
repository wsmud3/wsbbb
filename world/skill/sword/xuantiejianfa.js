    this.inherits(SKILL);
    this.name = "玄铁剑法";
    this.id = "xuantiejianfa";
    this.grade = 5;
    this.is_public = true;
    this.attack_actions = [
        "$N举起$w，玄铁剑法一招「重剑无锋」，以无匹巨力直劈$n",
        "$N运劲于臂，玄铁剑法大巧不工，$w横扫千军般挥向$n的$l",
        "$N使出玄铁剑法「大巧不工」，$w虽无锋刃，剑风却已令$n喘不过气来",
        "$N手中$w缓缓递出，玄铁剑法看似笨拙，实则以拙胜巧刺向$n",
        "$N大步踏前，玄铁剑法一招「重剑无锋，大巧不工」，$w如山岳般压下",
        "$N运起玄铁剑法，$w挟着排山倒海之势击向$n的$l",
        "$N催动内力，玄铁剑法使得地动山摇，$w带起一阵狂风吹向$n"
    ];
    this.parry_actions = [
        "$n横剑当胸，玄铁重剑如同一面铁盾，轻松挡开$N的攻击",
        "$n运起玄铁剑法守势，$w一横，以重剑之威将$N的招式尽数封住",
        "$n手中$w缓缓画出圆弧，玄铁剑法以拙破巧，化解了$N的凌厉攻势",
        "$n不闪不避，$w一竖，玄铁剑气形成一道无形屏障挡在身前"
    ];
    this.desc = "玄铁剑法，重剑无锋，大巧不工，越是平平无奇的剑招，对方越难抗御。如挺剑直刺，只要劲力强猛，威力远比变幻奇妙的剑招威力更大";
    this.can_enables = ["sword", "parry"];
    this.learn_condition = {
        max_mp: 8000,
        skill: { sword: 800 }
    };

    this.on_before_attack = function (me, target, par) {
        if (!par.no_append_before && par.target && !par.no_weapon) {
            var add_sh = Math.floor(me.max_mp * 0.01);
            if (add_sh > 0) {
                par.gj = (par.gj || me.gj) + add_sh;
            }
        }
    };

    this.query_enable_prop = function (lv) {
        return {
            sword: {
                gj: parseInt(lv * 2010 / 1000),
                mz: parseInt(lv * 2020 / 1000),
                str: parseInt(lv * 335 / 1000),
                diff_fy_per: 8,
                desc: "每次攻击附加你最大内力1%的伤害",
            },
            parry: {
                zj: parseInt(lv * 2010 / 1000),
                fy: parseInt(lv * 2310 / 1000),
                fy_per: 13,
                max_hp: parseInt(lv * 20000 / 1000),
            },
        };
    };

    this.pfm = {
        haichao: {
            name: "海潮汹涌",
            distime: 29000,
            enable_skill: "sword",
            weapon_type: WEAPON_TYPE.SWORD,
            release_time: 3800,
            mp: 0,
            use: function (me, target, lv) {
                me.send_room("<HIC>$N运起玄铁剑法「海潮汹涌」，剑光如潮水般一波接一波地涌向$n！</HIC>", target);
                var count = 4 + Math.floor(lv / 250);
                if (count > 8) count = 8;
                for (var i = 0; i < count; i++) {
                    var cost = Math.floor(me.mp * 0.04);
                    if (cost > 0) {
                        me.add_mp(-cost);
                        var add_damage = cost;
                        me.do_attack({
                            target: target,
                            gj: (me.gj + add_damage),
                            attack_msg: "<HIC>第" + (i + 1) + "波剑浪带着$N的内力向$n涌去！</HIC>"
                        });
                    } else {
                        me.do_attack({
                            target: target,
                            attack_msg: "<HIC>第" + (i + 1) + "波剑浪向$n涌去！</HIC>"
                        });
                    }
                }
                me.end_attack(target);
            },
            query_desc: function (me, lv) {
                var count = 4 + Math.floor(lv / 250);
                if (count > 8) count = 8;
                return "快速对附近敌人攻击" + count + "次，每次攻击附加并消耗你当前内力的4%";
            }
        },
        zhongjian: {
            name: "重剑无锋",
            distime: 29000,
            enable_skill: "sword",
            weapon_type: WEAPON_TYPE.SWORD,
            release_time: 3800,
            mp: 20,
            use: function (me, target, lv) {
                me.send_room("<HIW>$N高举$w，玄铁重剑以泰山压顶之势砸向$n——「重剑无锋」！</HIW>", target);
                me.do_attack({
                    target: target,
                    gj: me.gj * 2.5,
                    attack_msg: "<HIW>$N的玄铁重剑带着万钧之力砸下！</HIW>"
                });
                target.add_status({
                    id: "xuantie_canque",
                    name: "残缺",
                    desc: "战斗属性降低" + (10 + parseInt(lv / 100)) + "%，攻击速度降低" + (10 + parseInt(lv / 100)) + "%",
                    duration: 5000 + parseInt(lv * 5),
                    downside: true,
                    prop: {
                        gj_per: -(10 + parseInt(lv / 100)),
                        fy_per: -(10 + parseInt(lv / 100)),
                        mz_per: -(10 + parseInt(lv / 100)),
                        ds_per: -(10 + parseInt(lv / 100)),
                        zj_per: -(10 + parseInt(lv / 100)),
                        distime_per: -(10 + parseInt(lv / 100)),
                    },
                    start_msg: "<HIW>$n被玄铁重剑之力震伤，招式残缺不全！</HIW>",
                    finish_msg: "$n从重剑震伤中恢复了过来。",
                }, me);
                me.end_attack(target);
            },
            query_desc: function (me, lv) {
                return "重剑打击敌人，命中后使敌方处于残缺状态，降低战斗属性" + (10 + parseInt(lv / 100)) + "%，攻击速度" + (10 + parseInt(lv / 100)) + "%";
            }
        }
    };
