this.inherits(NPC);
this.set({
    name: "冷谦",
    desc: "明教五散人之一，性格冷傲寡言，武功高强。",
    gender: 1,
    age: 40,
    per: 16,
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
    {obj: ["book/bc#shenghuoshengong"], odds: 11300}
);
this.on_enter = function (me) { me.notify("冷谦冷眼盯着你，一言不发地冲了过来！"); this.do_kill(me); };
