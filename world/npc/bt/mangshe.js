this.inherits(MONSTER);
this.set({
    name: "蟒蛇",
    desc: "一条水桶粗的巨蟒，鳞片乌黑发亮，血盆大口足以吞下一头牛。",
    hp: 664000,
    max_hp: 664000,
    gj: 53140,
    fy: 27336,
    mz: 52100,
    ds: 32232,
    zj: 600
});
this.skill_map(
    ["dodge", 2080],
    ["force", 2080],
    ["unarmed", 2052]);
this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 80
}, {
    obj: ["res/shexue"],
    odds: 322320
}, {
    obj: ["book/bc#lingshezhangfa"],
    odds: 5100
});
this.on_enter = function (me) {
    me.notify("巨蟒从岩洞中窜出，张开血盆大口向你吞来！");
    this.do_kill(me);
};
