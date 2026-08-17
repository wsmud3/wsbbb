this.inherits(NPC);
this.set({
    name: "外门弟子",
    desc: "一个青城派的外门弟子，穿着朴素的练功服，正在山道上打扫落叶。他修行尚浅，见到外人也只是好奇地张望。",
    title: "青城派外门弟子",
    gender: 1,
    age: 18,
    per: 16,
    hp: 101600,
    max_hp: 101600,
    mp: 30500,
    max_mp: 30500,
    score: 25,
    gj: 6864,
    fy: 4942,
    mz: 6480,
    ds: 5055,
    zj: 585
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 980],
    ["parry", 980],
    ["force", 980],
    ["sword", 980],
    ["songfengjianfa", 980, "sword"],
    ["tagexing", 980, "dodge"]
);
this.set_drop(
    {obj: "money/silver", min: 5, max: 15},
    {obj: ["book/bc#songfengjianfa"], odds: 4260}
);
this.on_enter = function (me) {
    me.notify("外门弟子惊慌地看着你：你……你是什么人！师父说了，外人不得擅闯！");
    this.do_kill(me);
};
