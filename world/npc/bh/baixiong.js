this.inherits(NPC);
this.set({
    name: "大白熊",
    desc: "一头巨大的白熊，毛发厚实如雪，熊掌足以开山裂石。",
    gender: 1,
    age: 50,
    per: 5,
    hp: 770000,
    max_hp: 770000,
    mp: 154400,
    max_mp: 154400,
    score: 55,
    gj: 60742,
    fy: 34592,
    mz: 56166,
    ds: 34886,
    zj: 800
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2080],
    ["parry", 2136],
    ["force", 2052],
    ["unarmed", 2332]);
this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 100
}, {
    obj: ["book/bc#qingfushenfa"],
    odds: 348864
}, {
    obj: ["eq/lv2/lanbaoshi"],
    odds: 5520
}, {
    obj: ["eq/lv2/hongbaoshi"],
    odds: 5520
});
this.on_enter = function (me) {
    me.notify("大白熊怒吼一声，熊掌带着巨大的力量向你拍来！");
    this.do_kill(me);
};
