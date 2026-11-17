this.inherits(NPC);
this.set({
    name: "沙千里",
    desc: "五毒教中的一名护法，身量不高却行动如风，使一对判官笔，招式阴狠毒辣。他在教中地位不低，深得教主信任。",
    title: "五毒教护法",
    gender: 1,
    age: 35,
    hp: 99130,
    max_hp: 99130,
    mp: 46700,
    max_mp: 46700,
    score: 35,
    gj: 5874,
    fy: 3250,
    mz: 5705,
    ds: 5372,
    zj: 320
});
this.set_objects([
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_shou", 1, 1,
    "eq/lv1/lm_head", 1, 1
]);
this.skill_map(
    ["dodge", 1160],
    ["parry", 1160],
    ["force", 1160],
    ["unarmed", 1160],
    ["wuduyanluobu", 1160, "dodge"],
    ["wudushengong", 1160, "force"],
    ["qianzhuwandushou", 1160, "unarmed"]);

this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 35
}, {
    obj: ["book/bc#qianzhuwandushou", "book/bc#wudushengong"],
    odds: 77490
});
this.on_enter = function (me) {
    me.notify("沙千里冷笑一声：又一个不知死活的！看笔！");
    this.do_kill(me);
};
