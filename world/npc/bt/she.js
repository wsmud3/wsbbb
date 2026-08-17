this.inherits(MONSTER);
this.set({
    name: "毒蛇",
    desc: "一条色彩斑斓的毒蛇，三角蛇头，吐着猩红的信子。",
    hp: 520000,
    max_hp: 520000,
    gj: 39600,
    fy: 18479,
    mz: 35600,
    ds: 20978,
    zj: 150
});
this.skill_map(
    ["dodge", 1941],
    ["force", 1941],
    ["unarmed", 1941]);
this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 30
}, {
    obj: ["res/shexue"],
    odds: 6800
});
this.on_enter = function (me) {
    me.notify("毒蛇嘶嘶吐信，猛地向你窜来！");
    this.do_kill(me);
};
