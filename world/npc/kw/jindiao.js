this.inherits(NPC);
this.set({
    name: "金雕",
    desc: "一只巨大的金雕，双翅展开足有一丈来长，利爪如钩，眼神锐利。",
    gender: 0,
    age: 5,
    hp: 26344,
    max_hp: 26344,
    mp: 27750,
    max_mp: 27750,
    score: 10,
    gj: 1455,
    fy: 564,
    mz: 1097,
    ds: 887,
    zj: -100
});
this.skill_map(
    ["dodge", 1052],
    ["parry", 1120],
    ["force", 1048],
    ["unarmed", 1052]);

this.set_drop({
    obj: "money/silver",
    min: 5,
    max: 15
}, {
    obj: ["eq/lv0/cloth", "eq/lv0/dao", "eq/lv0/jian"],
    odds: 8000
}, {
    obj: ["book/bc#lengyueshengong", "book/bc#sixiangbu"],
    odds: 3000
});
this.on_enter = function (me) {
    me.notify("一只金雕从空中俯冲而下，利爪直向你抓来！");
    this.do_kill(me);
};
