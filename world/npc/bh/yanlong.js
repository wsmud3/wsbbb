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
    score: 72,
    gj: 23330,
    fy: 12357,
    mz: 25049,
    ds: 16283,
    zj: 426
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
    obj: ["st/st_blu#1"],
    odds: 5520
}, {
    obj: ["st/st_red#1"],
    odds: 5520
}, {
    obj: ["st/st_yel#1"],
    odds: 5520
}, {
    obj: ["st/st_gre#1"],
    odds: 5520
}, {
    obj: ["st/xuanjing"],
    odds: 7360
}, {
    obj: ["st/st_blu#2"],
    odds: 3680
}, {
    obj: ["st/st_gre#2"],
    odds: 3680
}, {
    obj: ["st/st_yel#2"],   // 攻略列有精致的黄宝石（与蓝/绿同掉率）
    odds: 3680
});
this.on_enter = function (me) {
    me.notify("炎龙喷出一口烈焰，热浪扑面而来！");
    this.do_kill(me);
};
