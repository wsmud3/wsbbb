this.inherits(NPC);
this.set({
    name: "曲灵风",
    desc: "桃花岛大弟子，武功高强，腿法凌厉。",
    gender: 1,
    age: 32,
    per: 18,
    hp: 548000,
    max_hp: 548000,
    mp: 122000,
    max_mp: 122000,
    score: 160,
    gj: 28400,
    fy: 18241,
    mz: 34800,
    ds: 17765,
    zj: 1200
});
this.set_objects([
    "eq/lv0/cloth", 1, 1
]);
this.skill_map(
    ["dodge", 1983],
    ["parry", 2158],
    ["force", 1983],
    ["unarmed", 1983],
    ["tanzhishengong", 1983, "unarmed"],
    ["biboshengong", 1983, "force"],
    ["anyingfuxiang", 1983, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#tanzhishengong"],
    odds: 8500
}, {
    obj: ["book/bc#anyingfuxiang"],
    odds: 6800
});
this.on_enter = function (me) {
    me.notify("曲灵风踏前一步，喝道：站住！桃花岛前院，岂容外人放肆！");
    this.do_kill(me);
};
