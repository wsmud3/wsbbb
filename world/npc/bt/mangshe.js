this.inherits(MONSTER);
this.set({
    score: 40,
    name: "蟒蛇",
    desc: "一条水桶粗的巨蟒，鳞片乌黑发亮，血盆大口足以吞下一头牛。",
    hp: 309712,
    max_hp: 309712,
    gj: 31417,
    fy: 11805,
    mz: 30802,
    ds: 15998,
    zj: 259
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
    // 攻略：蟒蛇随机掉落怪蟒蛇血（小青那里 10 份蛇血配一份药剂）
    obj: ["res/shexue"],
    odds: 6000,
    min: 1,
    max: 3
}, {
    obj: ["book/bc#lingshezhangfa"],
    odds: 5100
});
this.on_enter = function (me) {
    me.notify("巨蟒从岩洞中窜出，张开血盆大口向你吞来！");
    this.do_kill(me);
};

// [mech] 蟒蛇：击杀后副本完成（攻略：杀了之后，完成度100%）
// 原来写在 on_die 里并往玩家身上挂一个无人读取的 bt_mangshe_dead 标记，改为死后提示。
this.score = 90;
this.on_died = function (killer) {
    if (killer && killer.is_player) {
        killer.notify("<hio>巨蟒轰然倒地，白驼山一行就此了结。</hio>");
    }
};
