this.inherits(NPC);
this.set({
    name: "说不得",
    desc: "明教五散人之一，外号'布袋和尚'，身背一个大布袋，笑容可掬。他武功虽不算顶尖，但在五散人中辈分最高。",
    title: "布袋和尚",
    gender: 1,
    age: 45,
    per: 10,
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
    {obj: ["book/bc#qiankundanuoyi"], odds: 11300}
);
this.on_enter = function (me) { me.notify("说不得笑呵呵地解下布袋，说道：'施主请进我这布袋一游！'"); this.do_kill(me); };
