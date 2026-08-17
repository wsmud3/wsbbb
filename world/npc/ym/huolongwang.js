this.inherits(NPC);
this.set({
    name: "火龙王",
    desc: "洪荒火龙之王，体型是普通火龙的数倍，龙威浩荡，不可一世。",
    title: "<hiy>火龙王</hiy>",
    gender: 1,
    age: 1000,
    per: 3,
    hp: 302480,
    max_hp: 302480,
    mp: 79600,
    max_mp: 79600,
    score: 300,
    gj: 24776,
    fy: 13757,
    mz: 20387,
    ds: 10921,
    zj: 1305
});
this.skill_map(
    ["dodge", 1396],
    ["parry", 1376],
    ["force", 1396],
    ["unarmed", 1512]);
this.set_drop({
    obj: "money/silver",
    min: 150,
    max: 300
}, {
    obj: ["res/huolongpi"],
    odds: 8150
}, {
    obj: ["st/xuanjing"],
    odds: 6520
}, {
    obj: ["eq/lv3/hl_jian", "eq/lv3/hl_dao", "eq/lv3/hl_bian", "eq/lv3/hl_gun", "eq/lv3/hl_quan"],
    odds: 8150
});
this.on_enter = function (me) {
    me.notify("火龙王发出震天怒吼，整片沼泽都在颤抖！");
    this.do_kill(me);
};
