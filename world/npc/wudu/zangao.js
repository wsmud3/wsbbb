this.inherits(MONSTER);
this.set({
    name: "藏獒",
    desc: "一只体型巨大的藏獒，浑身黑色长毛，眼如铜铃，獠牙外露，口中发出低沉的咆哮声。它是五毒教驯养的恶犬，性情凶猛，见人就咬。",
    gender: 1,
    hp: 91500,
    max_hp: 91500,
    mp: 33000,
    max_mp: 33000,
    score: 15,
    gj: 6435,
    fy: 4806,
    mz: 7830,
    ds: 5049,
    zj: 500
});
this.skill_map(
    ["dodge", 1192],
    ["parry", 1192],
    ["force", 1192],
    ["unarmed", 960]);
this.set_drop({
    obj: "money/silver",
    min: 5,
    max: 15
}, {
    obj: ["eq/lv0/cloth"],
    odds: 10800
});
this.on_enter = function (me) {
    me.notify("藏獒狂吠一声，露出锋利的獠牙，猛扑上来！");
    this.do_kill(me);
};
