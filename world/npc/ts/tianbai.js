this.inherits(NPC);
this.set({
    name: "天柏道人",
    desc: "天柏道人是泰山派的高手，性情刚直，剑法沉稳有力。",
    title: "泰山派高手",
    gender: 1,
    age: 40,
    hp: 126650,
    max_hp: 126650,
    mp: 56850,
    max_mp: 56850,
    score: 50,
    gj: 14790,
    fy: 7480,
    mz: 15725,
    ds: 8165,
    zj: 945
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv4/jian", 1, 1
]);
this.skill_map(
    ["dodge", 1304],
    ["parry", 1304],
    ["force", 1304],
    ["unarmed", 1304],
    ["sword", 1348],
    ["literate", 1144],
    ["taishanjianfa", 1348, "sword"],    ["panshishengong", 1304, "force"],
    ["tiyunsong", 1304, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
}, {
    obj: ["book/bc#taishanjianfa", "book/bc#panshishengong"],
    odds: 7450
}, {
    obj: ["eq/lv3/ts_pao"],
    odds: 4470
}, {
    obj: ["eq/lv0/cloth"],
    odds: 2980
});
this.on_enter = function (me) {
    me.notify("天柏道人大喝：来者止步！泰山重地，岂容闲人乱闯！");
    this.do_kill(me);
};
