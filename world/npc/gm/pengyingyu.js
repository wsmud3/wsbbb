this.inherits(NPC);
this.set({
    name: "彭莹玉",
    desc: "明教五散人之一，原为僧人，法号彭和尚。他虽为明教效命，但为人慈悲为怀，在江湖中声望颇高。",
    title: "彭和尚",
    gender: 1,
    age: 42,
    per: 14,
    hp: 565600,
    max_hp: 565600,
    mp: 141000,
    max_mp: 141000,
    score: 55,
    gj: 38920,
    fy: 29787,
    mz: 39760,
    ds: 23617,
    zj: 1520
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2018],
    ["parry", 2151],
    ["force", 2018],
    ["unarmed", 2018]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 100},
    {obj: ["book/bc#shenghuolingfa"], odds: 11300}
);
this.on_enter = function (me) { me.notify("彭莹玉口宣佛号，却毫不留情地向你出手！"); this.do_kill(me); };
