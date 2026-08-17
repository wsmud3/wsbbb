this.inherits(NPC);
this.set({
    name: "齐云敖",
    desc: "五毒教的一名高手，身材魁梧，满脸横肉，使一根精铁杖。他力大无穷，脾气暴躁，是教中出名的打手。",
    title: "五毒教高手",
    gender: 1,
    age: 36,
    hp: 145350,
    max_hp: 145350,
    mp: 46700,
    max_mp: 46700,
    score: 38,
    gj: 13575,
    fy: 7641,
    mz: 13725,
    ds: 6723,
    zj: 688
});
this.set_objects([
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_head", 1, 1,
    "eq/lv1/qimeigun", 1, 1
]);
this.skill_map(
    ["dodge", 1264],
    ["parry", 1264],
    ["force", 1264],
    ["unarmed", 1264],
    ["staff", 1264],
    ["wuduyanluobu", 1264, "dodge"],
    ["wudushengong", 1264, "force"],
    ["qianzhuwandushou", 1264, "unarmed"]);

this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 40
}, {
    obj: ["book/bc#wudushengong", "book/bc#qianzhuwandushou"],
    odds: 6750
}, {
    obj: ["eq/lv1/lm_cloth", "eq/lv1/qimeigun"],
    odds: 4050
});
this.on_enter = function (me) {
    me.notify("齐云敖大吼一声：找死！吃我一杖！");
    this.do_kill(me);
};
