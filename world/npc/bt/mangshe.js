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

// [mech] 蟒蛇：击杀后副本完成（攻略：杀了之后，完成度100%）
this.score = 90;
this.on_die = function (killer) {
    if (killer && killer.is_player) {
        killer.set_temp("bt_mangshe_dead", 1);
        killer.notify("<hio>巨蟒轰然倒地，白驼山一行就此了结。</hio>");
        killer.notify("<hig>可回动作栏点「完成副本」结算。</hig>");
    }
};
