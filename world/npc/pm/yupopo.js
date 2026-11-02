this.inherits(NPC);
this.set({
    name: "余婆婆",
    desc: "灵鹫宫管事的老婆婆，头发花白，拄着一根铁杖，脾气极坏。别看年纪大，一身内功深不可测，最听不得外人擅闯独尊厅。",
    title: "灵鹫宫",
    gender: 2,
    age: 62,
    per: 12,
    hp: 500000,
    max_hp: 500000,
    mp: 180000,
    max_mp: 180000,
    score: 0,
    gj: 42000,
    fy: 30000,
    mz: 40000,
    ds: 26000,
    zj: 1300
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2200],
    ["parry", 2200],
    ["force", 2200],
    ["staff", 2200]);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 100
});
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("余婆婆把铁杖往地上一顿：「哪里来的野人，也敢闯灵鹫宫？」");
    this.do_kill(me);
};
