this.inherits(NPC);
this.set({
    name: "毒郎中",
    desc: "一个身着青衫的中年男子，手持一个药箱，面色枯黄，一双眼睛却异常的亮。他精通毒术和医术，能救人也能杀人，是五毒教中专司制毒的郎中。",
    title: "五毒教毒郎中",
    gender: 1,
    age: 40,
    hp: 97500,
    max_hp: 97500,
    mp: 38500,
    max_mp: 38500,
    score: 30,
    gj: 6435,
    fy: 4698,
    mz: 8910,
    ds: 3672,
    zj: 563
});
this.set_objects([
    "eq/lv1/lm_cloth", 1, 1
]);
this.skill_map(
    ["dodge", 964],
    ["parry", 964],
    ["force", 964],
    ["unarmed", 964],
    ["wuduyanluobu", 964, "dodge"],
    ["wudushengong", 964, "force"],
    ["qianzhuwandushou", 964, "unarmed"]);

this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 30
}, {
    obj: ["book/bc#wudushengong", "book/bc#qianzhuwandushou"],
    odds: 6750
}, {
    obj: ["eq/lv1/lm_cloth"],
    odds: 4050
});
this.on_enter = function (me) {
    me.notify("毒郎中阴森森地笑道：来得正好，试试我新配的毒药！");
    this.do_kill(me);
};
