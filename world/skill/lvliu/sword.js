this.inherits(SKILL);
this.name = "绿柳剑法";
this.id = "lvliu_sword";
this.grade = 3;
this.no_auto = true;
this.desc = "绿柳山庄的独门剑法，剑招凌厉毒辣，招招取人要害。";
this.attack_actions = [
    "$N长剑一抖，一招「绿柳拂风」剑尖颤动如柳枝摇曳，刺向$n的$l",
    "$N剑光如柳絮般飘忽不定，一招「柳暗花明」虚实难测直取$n",
    "$N剑势凌厉，一招「折柳斩」长剑破空劈下，大有斩断江河之势",
    "$N手中长剑化作漫天柳影，剑光重重叠叠将$n笼罩其中",
    "$N手腕一转，一招「柳叶穿云」长剑自不可思议的角度刺向$n的$l",
    "$N身形疾转，一招「风卷残柳」长剑挽起数朵剑花罩住$n周身要害",
];
this.parry_actions = [
    "$n长剑一横，绿柳剑法守势如柳枝般柔韧，将$N的攻势尽数化解",
    "$n剑尖轻颤使出一招「柳丝缠」，以柔克刚将$N的兵刃缠住",
    "却见$n手腕轻转，绿柳剑法的「柳暗花明」以守为攻，轻描淡写格开了$N的攻击",
    "$n长剑斜引，「柳影重重」剑势展开，$N只觉眼前尽是柳影，攻势尽被弹开",
    "$n不闪不避，长剑一立如柳树扎根，$N的攻击如泥牛入海再难寸进",
];
this.can_enables = ["sword", "parry"];
this.query_enable_prop = function (lv) {
    return {
        sword: { gj: lv * 2, mz: lv * 2, bj_per: 3 },
        parry: { zj: lv * 2 }
    };
};
this.pfm = {
    liufeng: {
        name: "柳风刺",
        distime: 20000,
        release_time: 2000,
        enable_skill: "sword",
        mp: 0,
        use: function (me, target, lv) {
            me.send_room("<hig>$N剑尖急颤，一招「柳风刺」如疾风骤雨般刺出，万千柳影化作漫天剑雨将四周尽数笼罩！</hig>");
            var room = me.environment;
            if (room) {
                for (var i = 0; i < room.items.length; i++) {
                    var p = room.items[i];
                    if (p.is_player && p.hp > 0 && p.is_fighting(me)) {
                        me.do_attack({
                            target: p,
                            attack_msg: "",
                            miss_msg: "",
                        });
                        // 群体忙乱10秒
                        p.add_status({
                            id: "lvliu_sword_busy",
                            duration: 10000,
                            downside: true,
                            name: "剑影缭乱",
                            desc: "被绿柳剑法的剑影所困，手忙脚乱无法行动",
                            prop: {}
                        }, me);
                        p.is_busy = Math.max(p.is_busy || 0, 10000);
                    }
                }
            }
            me.end_attack(target);
        },
        query_desc: function () { return "群体攻击，使所有敌人忙乱10秒"; }
    }
};
