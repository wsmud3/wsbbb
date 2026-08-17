this.inherits(NPC);
this.set({
    name: "余沧海",
    desc: "一个身材矮小的道人，面目阴沉，一双眼珠滴溜溜地转动，透着几分狡诈和狠毒。他便是青城派掌门余沧海，外号「松风剑客」，一手松风剑法使得出神入化。此人武功极高，心机深沉，为了得到辟邪剑谱不择手段。",
    title: "<hri>青城掌门</hri>",
    gender: 1,
    age: 55,
    hp: 225920,
    max_hp: 225920,
    mp: 80200,
    max_mp: 80200,
    score: 60,
    gj: 17952,
    fy: 12723,
    mz: 21088,
    ds: 10877,
    zj: 1235
});
this.set_objects([
    "eq/lv2/lm_cloth", 1, 1,
    "eq/lv2/lm_tou", 1, 1,
    "eq/lv2/lm_shoes", 1, 1,
    "eq/lv2/lm_pifeng", 1, 1,
    "eq/lv2/lm_pei", 1, 1,
    "eq/lv2/jiangjunjian", 1, 1
]);
this.skill_map(
    ["dodge", 1548],
    ["parry", 1548],
    ["force", 1548],
    ["unarmed", 1548],
    ["sword", 1548],
    ["tagexing", 1548, "dodge"],    ["songfengjianfa", 1548], ["parry", 1548, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 120
}, {
    obj: ["book/bc#songfengjianfa",  "book/bc#tagexing"],
    odds: 7100
}, {
    obj: ["eq/lv2/lm_cloth", "eq/lv2/lm_tou", "eq/lv2/lm_shoes", "eq/lv2/lm_pifeng", "eq/lv2/lm_pei", "eq/lv2/jiangjunjian"],
    odds: 4260
});
this.on_enter = function (me) {
    me.notify("余沧海阴沉着脸，缓缓拔出长剑：贫道在此清修，竟有人敢来滋扰。既然如此，便送你一程！");
    this.do_kill(me);
};
