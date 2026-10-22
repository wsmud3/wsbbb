this.inherits(NPC);
this.set({
    name: "费斌",
    desc: "嵩山派的大弟子，身材高大，满脸横肉，一双三角眼透出凶光。他奉左冷禅之命来此监视衡山派，武功高强，剑法狠辣，是嵩山派十三太保之一。此人最是心狠手辣，下手从不留情。",
    title: "<hir>嵩山十三太保</hir>",
    gender: 1,
    age: 38,
    hp: 289000,
    max_hp: 289000,
    mp: 94600,
    max_mp: 94600,
    score: 55,
    gj: 20859,
    fy: 11264,
    mz: 18241,
    ds: 11622,
    zj: 1013
});
this.set_objects([
    "eq/lv2/lm_cloth", 1, 1,
    "eq/lv2/lm_tou", 1, 1,
    "eq/lv2/lm_shoes", 1, 1,
    "eq/lv2/lm_pifeng", 1, 1,
    "eq/lv2/lm_jian", 1, 1
]);
this.skill_map(
    ["dodge", 1420],
    ["parry", 1420],
    ["force", 1420],
    ["unarmed", 1420],
    ["sword", 1420],
    ["songshanjianfa", 1420], ["parry", 1420, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 70
}, {
    obj: ["book/bc#songshanjianfa"],
    odds: 7450
}, {
    obj: ["eq/lv2/lm_cloth", "eq/lv2/lm_tou", "eq/lv2/lm_shoes", "eq/lv2/lm_pifeng", "eq/lv2/lm_jian"],
    odds: 4470
});
this.on_enter = function (me) {
    me.notify("费斌狞笑道：左盟主有令，刘正风勾结魔教，格杀勿论！既然你来了，也一并受死吧！");
    this.do_kill(me);
};
