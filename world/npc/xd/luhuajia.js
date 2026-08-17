this.inherits(NPC);
this.set({
    name: "陆花流侠甲",
    desc: "陆花流水四侠之一，意气风发，前来挑战血刀门。",
    gender: 1,
    age: 28,
    per: 17,
    hp: 2745600,
    max_hp: 2745600,
    mp: 510000,
    max_mp: 510000,
    score: 55,
    gj: 213920,
    fy: 101727,
    mz: 189280,
    ds: 89535,
    zj: 1785
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 4820],
    ["parry", 4680],
    ["force", 4820],
    ["unarmed", 4820]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 100},
    {obj: ["book/bc#shenzhaojing"], odds: 10160}
);
this.on_enter = function (me) { me.notify("陆花流侠甲大喝一声，挥掌向你攻来！"); this.do_kill(me); };
