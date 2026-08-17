this.inherits(NPC);
this.set({
    name: "五毒教徒",
    desc: "一个五毒教的普通教徒，身着苗疆服饰，腰间挂着竹篓，篓中不时传来嘶嘶声响。他面色黝黑，双目透着几分狠毒之色。",
    gender: 1,
    age: 28,
    hp: 113250,
    max_hp: 113250,
    mp: 39750,
    max_mp: 39750,
    score: 20,
    gj: 6795,
    fy: 4698,
    mz: 7830,
    ds: 3807,
    zj: 500
});
this.set_objects([
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_shoes", 1, 1
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
    max: 25
}, {
    obj: ["book/bc#wudushengong", "book/bc#qianzhuwandushou"],
    odds: 6750
}, {
    obj: ["eq/lv1/lm_cloth"],
    odds: 4050
});
this.on_enter = function (me) {
    me.notify("五毒教徒怪叫一声，挥舞着毒掌向你扑来！");
    this.do_kill(me);
};
