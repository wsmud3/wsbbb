this.inherits(MONSTER);
this.set({
    name: "鳄鱼",
    desc: "一条巨大的鳄鱼，鳞甲坚硬，满口利齿。它潜伏在沼泽中，随时准备发起致命一击。",
    hp: 95000,
    max_hp: 95000,
    gj: 10545,
    fy: 6455,
    mz: 8607,
    ds: 5281,
    zj: 290
});
this.skill_map(
    ["dodge", 1052],
    ["parry", 1048],
    ["force", 1052],
    ["unarmed", 964]);
this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 80
}, {
    obj: ["res/eyupi"],
    odds: 8150
});
this.on_enter = function (me) {
    me.notify("鳄鱼从泥沼中猛然窜出，张开血盆大口向你咬来！");
    this.do_kill(me);
};
