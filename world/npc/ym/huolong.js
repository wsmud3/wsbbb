this.inherits(NPC);
this.set({
    name: "火龙",
    desc: "一条通体赤红的巨龙，口中喷吐烈焰，双翼遮天蔽日。龙鳞在火光下闪烁着妖异的光芒。",
    title: "<hir>洪荒火龙</hir>",
    gender: 1,
    age: 500,
    per: 5,
    hp: 162830,
    max_hp: 162830,
    mp: 39000,
    max_mp: 39000,
    score: 200,
    gj: 13205,
    fy: 9421,
    mz: 18715,
    ds: 9715,
    zj: 1160
});
this.skill_map(
    ["dodge", 1348],
    ["parry", 1304],
    ["force", 1348],
    ["unarmed", 1196]);
this.set_drop({
    obj: "money/silver",
    min: 100,
    max: 200
}, {
    obj: ["res/huolongpi"],
    odds: 8150
}, {
    obj: ["st/xuanjing"],
    odds: 6520
}, {
    obj: ["eq/lv3/hl_jian", "eq/lv3/hl_gun", "eq/lv3/hl_bian", "eq/lv3/hl_dao", "eq/lv3/hl_quan"],
    odds: 6520
}, {
    obj: ["eq/lv2/lanbaoshi", "eq/lv2/hongbaoshi", "eq/lv2/lvbaoshi", "eq/lv2/huangbaoshi"],
    odds: 8150
});
this.on_enter = function (me) {
    me.notify("火龙咆哮震天，张开巨口喷出一团烈焰！");
    this.do_kill(me);
};
