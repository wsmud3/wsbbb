this.inherits(NPC);
this.set({
    name: "日月神教教徒",
    desc: "日月神教的普通教众，一身黑衣，腰间挂着堂口腰牌。他们惯于结队巡廊，见了外人先拔刀再问话。",
    title: "日月神教",
    gender: 1,
    age: 28,
    per: 15,
    hp: 320000,
    max_hp: 320000,
    mp: 95000,
    max_mp: 95000,
    score: 0,
    gj: 24000,
    fy: 14000,
    mz: 18000,
    ds: 14000,
    zj: 900
});
this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/dao", 1, 1]);
this.skill_map(
    ["dodge", 1900],
    ["parry", 1900],
    ["force", 1900],
    ["blade", 1900]);
this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 80
});
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("日月神教教徒喝道：「什么人？教你见识神教的手段！」");
    this.do_kill(me);
};
