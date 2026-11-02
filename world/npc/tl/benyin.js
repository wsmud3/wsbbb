this.inherits(NPC);
this.set({
    name: "天龙寺主持 本因",
    desc: "天龙寺住持，枯荣大师的师侄，一手六脉神剑中的商阳剑已有相当火候。他为人持重，护寺心切，见外人窥探六脉神剑谱便不再留手。",
    title: "<hiy>天龙寺主持</hiy>",
    gender: 1,
    age: 55,
    per: 10,
    hp: 900000,
    max_hp: 900000,
    mp: 300000,
    max_mp: 300000,
    score: 0,
    gj: 56000,
    fy: 38000,
    mz: 52000,
    ds: 35000,
    zj: 1500
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2450],
    ["parry", 2450],
    ["force", 2450],
    ["unarmed", 2450],
    ["sword", 2450]);
this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 150
}, {
    obj: ["book/bc#kumushengong"],
    odds: 8100
});
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("本因合十道：「佛门清净地，施主不该来。」说罢并指为剑，剑气森然。");
    this.do_kill(me);
};
