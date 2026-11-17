this.inherits(NPC);
this.set({
    name: "宫女",
    desc: "移花宫的宫女，身法诡异，出手狠辣。",
    gender: 0,
    age: 20,
    per: 18,
    hp: 282871,
    max_hp: 282871,
    mp: 189200,
    max_mp: 189200,
    score: 50,
    gj: 26158,
    fy: 13922,
    mz: 26691,
    ds: 14875,
    zj: 406
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2052],
    ["parry", 2262],
    ["force", 2052],
    ["sword", 2052]);
this.set_drop({
    obj: "money/silver",
    min: 5,
    max: 50
}, {
    obj: ["res/huozhezi"],
    odds: 9550
});
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    if (me.gender == 2) {
        me.notify("宫女打量了你一眼，见是同为女子，只冷冷道：此处不是你该来的地方。");
        return;
    }
    me.notify("宫女冷喝一声，长剑出鞘，向你刺来！");
    this.do_kill(me);
};
