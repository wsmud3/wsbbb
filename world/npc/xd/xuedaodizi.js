this.inherits(NPC);
this.set({
    name: "血刀弟子",
    desc: "血刀门的弟子，手持血刀，面目狰狞。",
    gender: 1,
    age: 30,
    per: 10,
    hp: 1664000,
    max_hp: 1664000,
    mp: 302000,
    max_mp: 302000,
    score: 45,
    gj: 112000,
    fy: 78994,
    mz: 113600,
    ds: 76708,
    zj: 1575
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3850],
    ["parry", 3700],
    ["force", 3850],
    ["blade", 3850],
    ["xuedao", 3850, "blade"]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 100},
    {obj: ["book/bc#xuedao"], odds: 7620}
);
this.on_enter = function (me) { me.notify("血刀弟子怪叫一声，举刀向你砍来！"); this.do_kill(me); };
