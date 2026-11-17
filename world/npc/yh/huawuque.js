this.inherits(NPC);
this.set({
    name: "花无缺",
    desc: "移花宫的少主，英俊潇洒，剑法精妙。",
    title: "花无缺",
    gender: 1,
    age: 22,
    per: 22,
    hp: 986700,
    max_hp: 986700,
    mp: 249000,
    max_mp: 249000,
    score: 75,
    gj: 38115,
    fy: 23319,
    mz: 28484,
    ds: 17440,
    zj: 813
});
this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
this.skill_map(
    ["dodge", 2680],
    ["parry", 2552],
    ["force", 2680],
    ["sword", 2680],
    ["mingyugong", 2592, "force"],
    ["yifengjianfa", 2680, "sword"]);
this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 300
}, {
    obj: ["book/bc#jueqingzhang"],
    odds: 3000
}, {
    obj: ["eq/lv3/huawuque_yupei"],
    odds: 300
});
// 碧血照丹青仅困难掉落：困难副本开启时由 yh/midao2 的 on_set_difficulty 加进本实例的掉落表；
// 困难扫荡走 fb23 的 drop_npcs1（yh/hard_drops）。
this.YH_HARD_DROP = { obj: ["eq/lv5/wushen/bixue_sword"], odds: 30 };   // 橙装 Boss 档 0.3%
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("花无缺负手而立，淡淡道：你能走到这里，也算有本事。他一动不动，并无出手之意。");
};
