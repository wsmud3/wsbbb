this.inherits(NPC);
this.set({
    name: "谢逊",
    desc: "金毛狮王谢逊，满头金发，双目虽盲，但武功盖世。他手持屠龙宝刀，七伤拳刚猛无匹。",
    title: "<hiy>金毛狮王</hiy>",
    gender: 1,
    age: 50,
    per: 12,
    hp: 1082400,
    max_hp: 1082400,
    mp: 262500,
    max_mp: 262500,
    score: 80,
    gj: 75680,
    fy: 40977,
    mz: 84040,
    ds: 39689,
    zj: 1600
});
this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/dao", 1, 1]);
this.skill_map(
    ["dodge", 2680],
    ["parry", 2824],
    ["force", 2440],
    ["unarmed", 2440],
    ["blade", 2680],
    ["qishangquan", 2440, "unarmed"],
    ["qingfushenfa", 2680, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 500
}, {
    obj: ["book/bc#qishangquan"],
    odds: 9200
}, {
    obj: ["book/bc#qingfushenfa"],
    odds: 9200
}, {
    obj: ["eq/lv5/wushen/tulong_blade"],
    odds: 3680
});
this.on_enter = function (me) {
    me.notify("金毛狮王谢逊睁开血红的双目，屠龙刀虎虎生风，七伤拳气劲激荡！");
    this.do_kill(me);
};
