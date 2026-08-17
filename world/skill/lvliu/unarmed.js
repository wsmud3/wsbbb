this.inherits(SKILL);
this.name = "绿柳掌法";
this.id = "lvliu_unarmed";
this.grade = 3;
this.no_auto = true;
this.desc = "绿柳山庄的掌法，掌力阴柔，暗藏杀机。";
this.attack_actions = [
    "$N双掌一翻，一招「柳叶掌」阴柔掌力无声无息拍向$n的$l",
    "$N掌影飘飘，一招「飞絮掌」掌势如柳絮纷飞，变幻莫测地击向$n",
    "$N身形一转，一招「柳暗花明」反手一掌自不可思议的角度劈向$n",
    "$N运起阴柔掌力，一招「柳丝缠身」连绵不绝的掌影如蛛网般笼向$n",
    "$N冷笑一声，一招「折柳断魂」挟着阴寒内力直取$n要害",
    "$N双掌交错，一招「万柳归宗」化作漫天掌影，将$n的退路尽数封死",
    "$N深吸一口气，一招「柳影无踪」身形如鬼魅般欺近$n，掌力已至胸前",
    "$N掌风忽变，一招「寒柳摧心」阴毒掌力如冰针刺向$n心脉",
];
this.parry_actions = [
    "$n双掌一翻，以绿柳掌法的柔劲将$N的攻势轻轻卸去",
    "$n掌势如柳枝拂水，借力打力将$N的攻击带偏一旁",
    "却见$n使出一招「柳叶障目」，双掌翻飞封住了$N的所有攻势",
    "$n身形微侧，绿柳掌法的阴柔掌力后发先至，将$N逼退半步",
];
this.can_enables = ["unarmed"];
this.query_enable_prop = function (lv) {
    return { unarmed: { gj: lv * 2, mz: lv * 1 } };
};
this.pfm = {
    yinrou: {
        name: "阴柔掌",
        distime: 10000,
        release_time: 3000,
        enable_skill: "unarmed",
        mp: 0,
        use: function (me, target, lv) {
            me.do_attack({
                target: target,
                attack_msg: "<him>$N掌势阴柔，一招「阴柔掌」无声无息地拍向$n，掌力未至寒气已侵！</him>",
                miss_msg: "$n急退避开$N的阴柔掌，却仍被掌风边缘扫中。",
                no_parry: true,
            });
            me.end_attack(target);
        },
        query_desc: function () { return "阴柔掌力，无视招架"; }
    }
};
