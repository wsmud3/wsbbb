this.inherits(NPC);
this.set({
    name: "唐洋",
    desc: "明教五行旗之洪水旗掌旗使，精通水系功法和洪水阵法。",
    gender: 1,
    age: 40,
    per: 15,
    hp: 448000,
    max_hp: 448000,
    mp: 101000,
    max_mp: 101000,
    score: 60,
    gj: 53480,
    fy: 28679,
    mz: 45080,
    ds: 23617,
    zj: 1615
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2137],
    ["parry", 2018],
    ["force", 2137],
    ["unarmed", 2137]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 100},
    {obj: ["book/bc#shenghuoshengong"], odds: 9040}
);
this.on_enter = function (me) { me.notify("唐洋大喝一声，洪水阵法瞬间展开！"); this.do_kill(me); };
