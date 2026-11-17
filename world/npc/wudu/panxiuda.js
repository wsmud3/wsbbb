this.inherits(NPC);
this.set({
    name: "潘秀达",
    desc: "五毒教的一名高手，此人面貌清秀，看似文弱书生，实则心狠手辣。他以毒术见长，掌中藏毒，令人防不胜防。",
    title: "五毒教高手",
    gender: 1,
    age: 31,
    per: 26,
    hp: 99130,
    max_hp: 99130,
    mp: 46700,
    max_mp: 46700,
    score: 38,
    gj: 7649,
    fy: 3914,
    mz: 7733,
    ds: 4660,
    zj: 352
});
this.set_objects([
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_shoes", 1, 1,
    "eq/lv1/lm_shou", 1, 1
]);
this.skill_map(
    ["dodge", 1264],
    ["parry", 1264],
    ["force", 1264],
    ["unarmed", 1264],
    ["wuduyanluobu", 1264, "dodge"],
    ["wudushengong", 1264, "force"],
    ["qianzhuwandushou", 1264, "unarmed"]);

this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 40
}, {
    obj: ["book/bc#qianzhuwandushou", "book/bc#wudushengong"],
    odds: 6750
});
this.on_enter = function (me) {
    me.notify("潘秀达微微一笑，掌中已暗藏剧毒：得罪了！");
    this.do_kill(me);
};
