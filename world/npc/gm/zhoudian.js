this.inherits(NPC);
this.set({
    name: "周颠",
    desc: "明教五散人之一，性如烈火，言行颠狂，但为人耿直忠义。",
    gender: 1,
    age: 38,
    per: 12,
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
    {obj: ["book/bc#yingzhuagong"], odds: 11300}
);
this.on_enter = function (me) { me.notify("周颠疯疯癫癫地大笑一声，朝你扑了过来！"); this.do_kill(me); };
