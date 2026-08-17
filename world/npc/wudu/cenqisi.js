this.inherits(NPC);
this.set({
    name: "岑其斯",
    desc: "五毒教的一名高手，身材瘦削，面色蜡黄，一双眼睛如蛇般阴冷。他使一对铁钩，招式诡异，是教中排名前几的好手。",
    title: "五毒教高手",
    gender: 1,
    age: 33,
    hp: 145350,
    max_hp: 145350,
    mp: 46700,
    max_mp: 46700,
    score: 38,
    gj: 13575,
    fy: 7641,
    mz: 13725,
    ds: 6723,
    zj: 688
});
this.set_objects([
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_shou", 1, 1,
    "eq/lv1/lm_head", 1, 1,
    "eq/lv1/lm_shoes", 1, 1
]);
this.skill_map(
    ["dodge", 1264],
    ["parry", 1264],
    ["force", 1264],
    ["unarmed", 1264],
    ["wuduyanluobu", 1264, "dodge"],
    ["wudushengong", 1264, "force"],
    ["qianzhuwandushou", 1264, "unarmed"]);

this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 40
}, {
    obj: ["book/bc#qianzhuwandushou", "book/bc#wudushengong"],
    odds: 6750
}, {
    obj: ["eq/lv1/lm_cloth", "eq/lv1/lm_shou", "eq/lv1/lm_head"],
    odds: 4050
});
this.on_enter = function (me) {
    me.notify("岑其斯阴冷地盯着你：进了五毒教，就别想活着出去！");
    this.do_kill(me);
};
