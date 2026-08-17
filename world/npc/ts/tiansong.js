this.inherits(NPC);
this.set({
    name: "天松道人",
    desc: "天松道人是泰山派的高手，一柄长剑使得出神入化，剑法凌厉。",
    title: "泰山派高手",
    gender: 1,
    age: 42,
    hp: 80750,
    max_hp: 80750,
    mp: 37750,
    max_mp: 37750,
    score: 50,
    gj: 8874,
    fy: 4500,
    mz: 9435,
    ds: 5185,
    zj: 945
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv4/jian", 1, 1
]);
this.skill_map(
    ["dodge", 1104],
    ["parry", 1104],
    ["force", 1104],
    ["unarmed", 1104],
    ["sword", 1148],
    ["literate", 944],
    ["taishanjianfa", 1148, "sword"],    ["tiyunsong", 1104, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
}, {
    obj: ["book/bc#taishanjianfa", "book/bc#taishanquanfa"],
    odds: 7450
}, {
    obj: ["eq/lv3/ts_pao"],
    odds: 4470
}, {
    obj: ["eq/lv4/jian"],
    odds: 2980
});
this.on_enter = function (me) {
    me.notify("天松道人喝道：擅闯泰山者，先问过贫道手中长剑！");
    this.do_kill(me);
};
