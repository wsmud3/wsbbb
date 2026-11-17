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
    score: 0,   // 完成度只来自「背段誉回大门」（tl_deliver）；原先全杀不背也能 100%
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
    {obj: ["book/bc#kumushengong"], odds: 3000}
);

// 天龙寺机制见 world/area/fb1/fb28.js：拦路 / 背负段誉后追杀 / 死亡计数
var tlA = function (o) { var r = o.environment || o.die_room; return r && r.parent && r.parent.tl_carry ? r.parent : null; };
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    var a = tlA(this);
    if (a && a.tl_is_carrying(me)) {
        me.notify("本尘怒喝：「放下段公子！」"); this.do_kill(me);
    } else {
        me.notify("本尘看了你一眼，挡在通往寺内深处的路上。");
    }
};
this.on_leave = function (me, dir) {
    var a = tlA(this);
    return a ? a.tl_block(this, me, dir) : true;
};
this.on_died = function (killer, corpse) {
    var a = tlA(this);
    if (a) a.tl_on_died(this, killer);
};
