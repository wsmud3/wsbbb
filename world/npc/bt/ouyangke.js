this.inherits(NPC);
this.set({
    name: "欧阳克",
    desc: "白驼山少主，欧阳锋之子，一身白衣，手摇折扇，风流自赏。他自幼修习白驼山内功与灵蛇拳，掌法阴柔狠辣，最会趁人不备下毒手。",
    title: "<hiy>白驼山少主</hiy>",
    gender: 1,
    age: 26,
    per: 26,
    hp: 600000,
    max_hp: 600000,
    mp: 210000,
    max_mp: 210000,
    score: 0,
    gj: 45000,
    fy: 26000,
    mz: 34000,
    ds: 27000,
    zj: 1100
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2100],
    ["parry", 2100],
    ["force", 2100],
    ["unarmed", 2100],
    ["blade", 2100]);
this.set_drop({
    obj: "money/silver",
    min: 40,
    max: 120
}, {
    obj: ["book/bc#chanchubufa"],
    odds: 7100
}, {
    obj: ["eq/lv2/lm_cloth", "eq/lv2/lm_shoes"],
    odds: 4260
});
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("欧阳克摇着折扇笑道：「白驼山的花园，可不是什么人都能进的。」话音未落，折扇已化作一片扇影！");
    this.do_kill(me);
};
