this.inherits(NPC);
this.set({
    name: "杨过",
    desc: "独臂大侠杨过，虽然身有残疾，但武功盖世。黯然销魂掌和玄铁剑法威震天下。",
    title: "<hiy>神雕大侠</hiy>",
    gender: 1,
    age: 30,
    per: 26,
    hp: 5572000,
    max_hp: 5572000,
    mp: 946000,
    max_mp: 946000,
    score: 100,
    gj: 273000,
    fy: 157300,
    mz: 269500,
    ds: 154550,
    zj: 2925
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 5725],
    ["parry", 4375],
    ["force", 5725],
    ["sword", 5575],
    ["unarmed", 4900],
    ["xuantiejianfa", 5575, "sword"],
    ["anranxiaohunzhang", 4900, "unarmed"]
);
this.set_drop(
    {obj: "money/silver", min: 40, max: 400},
    {obj: ["book/bc#xuantiejianfa"], odds: 13750},
    {obj: ["book/bc#anranxiaohunzhang"], odds: 13750},
    {obj: ["eq/lv4/bingpoyinzhen"], odds: 8250}
);
this.on_enter = function (me) { me.notify("杨过叹息一声，独臂缓缓抬起，黯然销魂掌的掌意已弥漫四周！"); this.do_kill(me); };
