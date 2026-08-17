this.inherits(NPC);
this.set({
    name: "本尘",
    desc: "天龙寺高僧，佛法精深，武功高强。",
    gender: 1,
    age: 54,
    per: 19,
    hp: 858000,
    max_hp: 858000,
    mp: 164000,
    max_mp: 164000,
    score: 65,
    gj: 62940,
    fy: 47424,
    mz: 60210,
    ds: 44736,
    zj: 1900
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2388],
    ["parry", 2437],
    ["force", 2388],
    ["sword", 2388],
    ["duanjiajian", 2388, "sword"],
    ["kumushengong", 2388, "force"]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 100},
    {obj: ["book/bc#kumushengong"], odds: 9600}
);
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp('tl_carry_duanyu')) {
        me.notify("本尘眼中精光一闪，沉声道：'放下段公子！'"); this.do_kill(me);
    } else {
        me.notify("本尘双手合十：'阿弥陀佛，施主请便。'");
    }
}; this.on_die = function(killer) { if (killer && killer.is_player) killer.set_temp('tl_killed_any', 1); };
