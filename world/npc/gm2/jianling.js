this.inherits(NPC);
this.set({
    name: "剑灵",
    desc: "剑冢中守护神剑的剑灵，剑气纵横，威力无穷。",
    title: "<hiy>剑灵</hiy>",
    gender: 1,
    age: 999,
    per: 20,
    hp: 5320000,
    max_hp: 5320000,
    mp: 754000,
    max_mp: 754000,
    score: 110,
    gj: 283500,
    fy: 147950,
    mz: 232750,
    ds: 150700,
    zj: 3375
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 5850],
    ["parry", 4775],
    ["force", 5375],
    ["sword", 5375]
);
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["eq/lv4/bingpoyinzhen"], odds: 11000},
    {obj: ["eq/lv5/wushen/panlong_head"], odds: 8250}
);
this.on_enter = function (me) { me.notify("剑灵眼中剑光一闪，万道剑气铺天盖地而来！"); this.do_kill(me); };
