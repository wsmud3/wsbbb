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
    if (!me || !me.is_player) return;
    me.notify("花无缺负手而立，淡淡道：你能走到这里，也算有本事。他一动不动，并无出手之意。");
};
