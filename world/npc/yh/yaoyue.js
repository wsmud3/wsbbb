this.inherits(NPC);
this.set({
    name: "邀月",
    desc: "移花宫大宫主，冷若冰霜，武功盖世。明玉功第九重，举手投足皆有宗师风范。",
    title: "<hiy>移花宫主·邀月</hiy>",
    gender: 0,
    age: 35,
    per: 24,
    hp: 1145400,
    max_hp: 1145400,
    mp: 219000,
    max_mp: 219000,
    score: 90,
    gj: 84180,
    fy: 39594,
    mz: 67160,
    ds: 45744,
    zj: 1815
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2616],
    ["parry", 2680],
    ["force", 2616],
    ["sword", 2616],
    ["mingyugong", 2616, "force"],
    ["yihuajiemu", 2680, "parry"],
    ["yifengjianfa", 2616, "sword"]);
this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 300
}, {
    obj: ["book/bc#mingyugong"],
    odds: 9550
}, {
    obj: ["book/bc#yihuajiemu"],
    odds: 9550
}, {
    obj: ["eq/lv3/yaoyue_shouzhuo"],
    odds: 5730
});
this.on_enter = function (me) {
    me.notify("邀月宫主冷若冰霜地注视着你，明玉功真气四溢，寒意刺骨！");
    this.do_kill(me);
};
