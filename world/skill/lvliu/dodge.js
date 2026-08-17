this.inherits(SKILL);
this.name = "柳絮身法";
this.id = "lvliu_dodge";
this.grade = 3;
this.no_auto = true;
this.desc = "绿柳山庄的轻功身法，身如柳絮，飘忽不定。";
this.dodge_actions = [
    "$n身如柳絮，随风飘出三丈，轻巧地避开了$N的攻势",
    "$n足尖轻点地面，柳絮身法施展开来，如柳叶般飘忽不定，$N一击落空",
    "$n身形一晃化作一道绿影，柳絮身法让$N的攻击尽数落空",
    "$n衣袖翻飞借力打力，如柳枝轻拂水面，堪堪避过$N的杀招",
    "$n不待$N招式用老，早已如柳絮般飘然退开，姿态从容之极",
    "$n腰肢轻摆，整个人仿佛没有重量般随风而动，$N的攻势尽皆擦身而过",
];
this.can_enables = ["dodge"];
this.query_enable_prop = function (lv) {
    return { dodge: { ds: lv * 2, dex: parseInt(lv / 5) } };
};
