this.inherits(NPC);
this.set({
    name: "白髯老者",
    desc: "一位白发苍苍的老者，面容清瘦，三缕长髯飘洒胸前。他虽然年迈，但双目炯炯有神，举手投足间自有一股威严之气。他乃是五毒教中的一位长老。",
    title: "五毒教长老",
    gender: 1,
    age: 68,
    per: 22,
    hp: 91500,
    max_hp: 91500,
    mp: 38500,
    max_mp: 38500,
    score: 35,
    gj: 8325,
    fy: 5346,
    mz: 8910,
    ds: 5049,
    zj: 625
});
this.set_objects([
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_head", 1, 1
]);
this.skill_map(
    ["dodge", 992],
    ["parry", 992],
    ["force", 992],
    ["unarmed", 992],
    ["wuduyanluobu", 992, "dodge"],
    ["wudushengong", 992, "force"],
    ["qianzhuwandushou", 992, "unarmed"]);

this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 35
}, {
    obj: ["book/bc#wudushengong", "book/bc#qianzhuwandushou"],
    odds: 50490
}, {
    obj: ["eq/lv1/lm_cloth", "eq/lv1/lm_head"],
    odds: 4050
});
this.on_enter = function (me) {
    me.notify("白髯老者冷哼一声：擅闯我五毒教者，死！");
    this.do_kill(me);
};
