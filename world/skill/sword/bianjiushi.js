    this.inherits(SKILL);
    this.name = "彼岸九式";
    this.id = "bianjiushi";
    this.grade = 4;
    this.desc = "魔师庞斑从彼岸花开花落中悟出的绝世剑法，剑出如彼岸花开，九式连环，招招致命。传说此剑法需以魔心御剑，每一式皆踏在生死边缘。";

    this.attack_actions = [
        "$N手中$w一振，剑尖绽放出妖异的彼岸花影，直取$n的$l！",
        "$N剑势一转，$w化作漫天血色花瓣，铺天盖地般笼罩$n！",
        "$N身形如鬼魅般闪动，$w破空而至，剑锋直指$n的$l！",
        "$N剑招再变，$w上泛起幽幽寒芒，一式「花开彼岸」刺向$n！",
        "$N低喝一声，$w连颤九次，九道剑气如彼岸花绽放，$n避无可避！",
        "$N剑走偏锋，$w从一个不可思议的角度刺出，直取$n的$l！",
        "$N剑意凌厉，$w化作一道血色惊虹，带着死亡的气息袭向$n！"
    ];

    this.parry_actions = [
        "$n手中$w横挡，血色剑光在身前交织成网，化解了$P的攻势。",
        "$n剑势回旋，$w如彼岸花瓣飘落，将$P的攻击尽数卸去。",
        "$n不退反进，$w上泛起妖异红光，以攻为守逼退$P。",
        "$n施展「花落彼岸」，剑光如落花般层层叠叠，$P难以突破。"
    ];

    this.can_enables = ["sword", "parry"];

    this.learn_condition = {
        max_mp: 3000,
        skill: { sword: 400 }
    };

    this.query_enable_prop = function (lv) {
        return {
            sword: {
                gj: Math.floor(8 + lv * 2.5),
                mz: 15 + Math.floor(lv * 2.5),
                add_sh_per: 4 + Math.floor(lv / 250),
                mz_per: 2 + Math.floor(lv / 250),
                gjsd_per: 12,
            },
            parry: {
                zj: 8 + Math.floor(lv * 2),
                diff_sh_per: 4 + Math.floor(lv / 250),
                zj_per: 4 + Math.floor(lv / 250)
            }
        };
    };

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

    this.pfm = {
        bian: {
            name: "彼岸九式",
            distime: 24000,
            enable_skill: "sword",
            weapon_type: WEAPON_TYPE.SWORD,
            release_time: 3000,
            mp: 0,
            use: function (me, target, lv) {
                if (!target) return me.notify("你要对谁使用绝招？");
                me.send_room("<HIR>$N眼中红芒大盛，$W上血光暴涨——彼岸九式，花开见血！</HIR>", target);

                for (var i = 0; i < 9; i++) {
                    me.do_attack({
                        target: target,
                        attack_msg: "<HIR>彼岸花开——第" + (i + 1) + "式！</HIR>"
                    });
                }
                start_auto_attack(me);
            },
            query_desc: function (me, lv) {
                return "彼岸花开的九式连斩，对敌人造成9段伤害，招式环环相扣。";
            }
        }
    };
