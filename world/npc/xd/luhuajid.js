this.inherits(NPC);
this.set({
    name: "陆花流侠丙",
    desc: "陆花流水四侠之一，意气风发，前来挑战血刀门。",
    gender: 1,
    age: 27,
    per: 18,
    hp: 1830400,
    max_hp: 1830400,
    mp: 340000,
    max_mp: 340000,
    score: 55,
    gj: 152800,
    fy: 76327,
    mz: 135200,
    ds: 64135,
    zj: 1785
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3865],
    ["parry", 3760],
    ["force", 3865],
    ["unarmed", 3865]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 100},
    {obj: ["book/bc#shenzhaojing"], odds: 10160}
);
this.on_enter = function (me) { me.notify("陆花流侠丙身形一闪，连环飞踢而来！"); this.do_kill(me); };
