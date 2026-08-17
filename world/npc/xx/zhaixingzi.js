this.inherits(NPC);
this.set({
    name: "摘星子",
    desc: "星宿派大师兄，武功为众弟子之首，飞星术出神入化。",
    gender: 1,
    age: 32,
    per: 10,
    hp: 735000,
    max_hp: 735000,
    mp: 154400,
    max_mp: 154400,
    score: 140,
    gj: 42966,
    fy: 33276,
    mz: 55797,
    ds: 35117,
    zj: 1085
});
this.skill_map(
    ["dodge", 2409],
    ["parry", 2332],
    ["force", 2409],
    ["unarmed", 2409],
    ["feixingshu", 2409, "unarmed"],
    ["zhaixinggong", 2409, "dodge"],
    ["huagongdafa", 2332, "force"]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#feixingshu", "book/bc#zhaixinggong"],
    odds: 8850
}, {
    obj: ["book/bc#huagongdafa"],
    odds: 5310
});
this.on_enter = function (me) {
    me.notify("摘星子冷冷道：连我三师弟都打不过，也敢来星宿海？");
    this.do_kill(me);
};
