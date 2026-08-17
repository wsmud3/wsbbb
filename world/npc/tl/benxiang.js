this.inherits(NPC);
this.set({
    name: "本相",
    desc: "天龙寺高僧，佛法精深，武功高强。",
    gender: 1,
    age: 52,
    per: 18,
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
    ["unarmed", 2388]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 100},
    {obj: ["book/bc#liumaishenjian"], odds: 9600}
);
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp('tl_carry_duanyu')) {
        me.notify("本相不动如山，一掌推出：「休想带走段公子！」"); this.do_kill(me);
    } else {
        me.notify("本相正在打坐，一动不动。");
    }
}; this.on_die = function(killer) { if (killer && killer.is_player) killer.set_temp('tl_killed_any', 1); };
