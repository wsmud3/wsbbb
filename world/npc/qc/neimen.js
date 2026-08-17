this.inherits(NPC);
this.set({
    name: "内门弟子",
    desc: "一名青城派的内门弟子，身着青色道袍，腰悬长剑，目光锐利。此人已得青城派真传，是余沧海座下的得力弟子，武功在年轻一辈中已属上乘。",
    title: "青城内门弟子",
    gender: 1,
    age: 28,
    hp: 80000,
    max_hp: 80000,
    mp: 38500,
    max_mp: 38500,
    score: 35,
    gj: 9072,
    fy: 4288,
    mz: 7248,
    ds: 4232,
    zj: 715
});
this.set_objects([
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_shoes", 1, 1,
    "eq/lv1/lm_jian", 1, 1
]);
this.skill_map(
    ["dodge", 960],
    ["parry", 960],
    ["force", 960],
    ["unarmed", 960],
    ["sword", 960],
    ["tagexing", 960, "dodge"],    ["songfengjianfa", 960], ["parry", 960, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 35
}, {
    obj: ["book/bc#songfengjianfa", ],
    odds: 7100
}, {
    obj: ["eq/lv1/lm_cloth", "eq/lv1/lm_jian"],
    odds: 4260
});
this.on_enter = function (me) {
    me.notify("内门弟子拔出长剑，冷声道：擅闯青城派者，剑下领死！");
    this.do_kill(me);
};
