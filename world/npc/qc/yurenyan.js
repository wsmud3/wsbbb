this.inherits(NPC);
this.set({
    name: "余人彦",
    desc: "余寒海的独子，也是青城派下一任掌门。此人身着华贵锦袍，腰悬一柄松纹古剑，眉宇间颇有几分傲气。他在父亲的悉心调教下，武功已有相当火候，但心高气傲，常目中无人。",
    title: "<hgr>青城少主</hgr>",
    gender: 1,
    age: 30,
    per: 26,
    hp: 119200,
    max_hp: 119200,
    mp: 53000,
    max_mp: 53000,
    score: 45,
    gj: 13360,
    fy: 6901,
    mz: 11440,
    ds: 8122,
    zj: 845
});
this.set_objects([
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_shoes", 1, 1,
    "eq/lv1/lm_jian", 1, 1,
    "eq/lv1/lm_head", 1, 1
]);
this.skill_map(
    ["dodge", 1144],
    ["parry", 1144],
    ["force", 1144],
    ["unarmed", 1144],
    ["sword", 1144],
    ["tagexing", 1144, "dodge"],    ["songfengjianfa", 1144], ["parry", 1144, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
}, {
    obj: ["book/bc#songfengjianfa",  "book/bc#tagexing"],
    odds: 7100
}, {
    obj: ["eq/lv1/lm_cloth", "eq/lv1/lm_jian", "eq/lv1/lm_head"],
    odds: 4260
});
this.on_enter = function (me) {
    me.notify("余人彦傲慢地瞥了你一眼：又一个不知死活的！看本少主取你狗命！");
    this.do_kill(me);
};
