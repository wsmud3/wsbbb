this.inherits(NPC);
this.set({
    name: "嵩山弟子",
    desc: "一名嵩山派的弟子，身着黑色劲装，手持长剑，面色冷峻。嵩山派在左冷禅的带领下，近年来势力大增，门下弟子个个武功不凡，行事霸道。",
    title: "嵩山派弟子",
    gender: 1,
    age: 30,
    hp: 85000,
    max_hp: 85000,
    mp: 38500,
    max_mp: 38500,
    score: 35,
    gj: 8874,
    fy: 5215,
    mz: 8925,
    ds: 5304,
    zj: 810
});
this.set_objects([
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_shoes", 1, 1,
    "eq/lv1/lm_jian", 1, 1
]);
this.skill_map(
    ["dodge", 1064],
    ["parry", 1064],
    ["force", 1064],
    ["unarmed", 1064],
    ["sword", 1064],
    ["songshanjianfa", 1064], ["parry", 1064, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 40
}, {
    obj: ["book/bc#songshanjianfa", ],
    odds: 7450
}, {
    obj: ["eq/lv1/lm_cloth", "eq/lv1/lm_jian"],
    odds: 4470
});
this.on_enter = function (me) {
    me.notify("嵩山弟子拔出长剑，厉声喝道：嵩山派办事，闲杂人等回避！想死的尽管上来！");
    this.do_kill(me);
};
