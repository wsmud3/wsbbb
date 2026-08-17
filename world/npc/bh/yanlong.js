this.inherits(NPC);
this.set({
    name: "炎龙",
    desc: "一条浑身燃烧着烈焰的巨龙，口中喷射着灼热的龙息。",
    gender: 1,
    age: 100,
    per: 5,
    hp: 642400,
    max_hp: 642400,
    mp: 128000,
    max_mp: 128000,
    score: 60,
    gj: 50446,
    fy: 27821,
    mz: 54164,
    ds: 32973,
    zj: 960
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2332],
    ["parry", 2136],
    ["force", 2409],
    ["unarmed", 2381]);
this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 100
}, {
    obj: ["eq/lv2/lanbaoshi"],
    odds: 5520
}, {
    obj: ["eq/lv2/hongbaoshi"],
    odds: 5520
}, {
    obj: ["eq/lv2/huangbaoshi"],
    odds: 5520
}, {
    obj: ["eq/lv2/lvbaoshi"],
    odds: 5520
}, {
    obj: ["st/xuanjing"],
    odds: 7360
}, {
    obj: ["eq/lv3/jingzhilanbaoshi"],
    odds: 3680
}, {
    obj: ["eq/lv3/jingzhilvbaoshi"],
    odds: 3680
});
this.on_enter = function (me) {
    me.notify("炎龙喷出一口烈焰，热浪扑面而来！");
    this.do_kill(me);
};
