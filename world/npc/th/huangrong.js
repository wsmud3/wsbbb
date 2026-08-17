this.inherits(NPC);
this.set({
    name: "黄蓉",
    desc: "一个娇美无匹的少女，一双漆黑大眼甚是灵动，嘴角带着狡黠的笑意。她正是桃花岛主黄药师的女儿。",
    gender: 2,
    age: 18,
    per: 30,
    hp: 560000,
    max_hp: 560000,
    mp: 176000,
    max_mp: 176000,
    score: 80,
    gj: 43260,
    fy: 30464,
    mz: 43260,
    ds: 31008,
    zj: 750
});
this.set_objects([
    "eq/lv0/cloth", 1, 1
]);
this.skill_map(
    ["dodge", 2052],
    ["parry", 2262],
    ["force", 2052],
    ["unarmed", 2052]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#kongmingquan"],
    odds: 8500
});
this.on_enter = function (me) {
    me.notify("黄蓉娇叱一声：什么人胆敢闯入我爹的卧室！");
    this.do_kill(me);
};
