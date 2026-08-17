this.inherits(NPC);
this.set({
    name: "花无缺",
    desc: "移花宫的少主，英俊潇洒，剑法精妙。",
    title: "<hiy>花无缺</hiy>",
    gender: 1,
    age: 22,
    per: 22,
    hp: 986700,
    max_hp: 986700,
    mp: 249000,
    max_mp: 249000,
    score: 75,
    gj: 85560,
    fy: 47349,
    mz: 63940,
    ds: 40129,
    zj: 1650
});
this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
this.skill_map(
    ["dodge", 2680],
    ["parry", 2552],
    ["force", 2680],
    ["sword", 2680],
    ["mingyugong", 2592, "force"],
    ["yifengjianfa", 2680, "sword"]);
this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 300
}, {
    obj: ["book/bc#jueqingzhang"],
    odds: 9550
}, {
    obj: ["eq/lv3/huawuque_yupei"],
    odds: 5730
}, {
    obj: ["eq/lv5/wushen/bixue_sword"],
    odds: 3820
});
this.on_enter = function (me) {
    me.notify("花无缺淡淡道：「既入此地，便分个高下吧。」碧血照丹青出鞘，剑光凛冽！");
    this.do_kill(me);
};
