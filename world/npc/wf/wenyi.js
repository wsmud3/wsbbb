this.inherits(NPC);
this.set({
    name: "温仪",
    desc: "一个容貌绝美的女子，眉宇间却隐含着一股深深的忧郁。她便是温家小姐温仪，金蛇郎君的妻子。虽然出身温家，却心地善良，不愿参与江湖纷争。",
    title: "温家小姐",
    gender: 2,
    age: 28,
    per: 38,
    hp: 14000,
    max_hp: 14000,
    mp: 5000,
    max_mp: 5000,
    score: 10,
    gj: 700,
    fy: 512,
    mz: 560,
    ds: 384,
    zj: 360
});
this.set_objects([
    "eq/lv0/cloth", 1, 1
]);
this.skill_map(
    ["dodge", 350],
    ["parry", 350],
    ["force", 350],
    ["unarmed", 350],
    ["literate", 800]);

this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 30
}, {
    obj: ["eq/lv2/js_nang"],
    odds: 6400
}, {
    obj: ["eq/lv0/cloth"],
    odds: 10240
});
this.on_enter = function (me) {
    me.notify("温仪看了你一眼，低声道：小心……他就在前面……");
};
