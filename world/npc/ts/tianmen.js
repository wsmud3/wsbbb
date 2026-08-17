this.inherits(NPC);
this.set({
    name: "天门道人",
    desc: "天门道人是泰山派掌门，一身盘石神功已臻化境，内力深厚无比。",
    title: "泰山派掌门",
    gender: 1,
    age: 55,
    hp: 213520,
    max_hp: 213520,
    mp: 61000,
    max_mp: 61000,
    score: 120,
    gj: 18241,
    fy: 14244,
    mz: 25143,
    ds: 10460,
    zj: 1350
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv5/jian", 1, 1
]);
this.skill_map(
    ["dodge", 1532],
    ["parry", 1532],
    ["force", 1396],
    ["unarmed", 1532],
    ["sword", 1376],
    ["literate", 1548],
    ["taishanjianfa", 1376, "sword"],    ["panshishengong", 1396, "force"],
    ["tiyunsong", 1532, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#panshishengong", "book/bc#taishanjianfa"],
    odds: 7450
}, {
    obj: ["eq/lv3/ts_hufu"],
    odds: 4470
}, {
    obj: ["eq/lv3/ts_pao"],
    odds: 4470
});
this.on_enter = function (me) {
    me.notify("天门道人缓缓转身，沉声道：贫道镇守泰山数十年，今日便领教阁下高招！");
    this.do_kill(me);
};
