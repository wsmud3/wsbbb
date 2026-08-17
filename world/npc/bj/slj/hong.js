this.inherits(NPC);
this.set({
    name: "洪安通",
    desc: "神龙教教主，身材魁梧，双目如电，举手投足间霸气外露。他武功深不可测，教中弟子对其奉若神明。",
    title: "<hib>神龙教主</hib>",
    gender: 1,
    age: 50,
    per: 25,
    mp: 5000,
    max_mp: 5000,
    hp: 7000,
    max_hp: 7000,
    score: 60,
    gj: 350,
    zj: -200
});
this.set_objects([
    "eq/lv2/sl_cloth", 1, 1,
    "eq/lv2/sl_tou", 1, 1,
    "eq/lv2/sl_shoes", 1, 1,
    "eq/lv2/sl_yao", 1, 1,
    "eq/lv2/sl_ling", 1, 1,
    "eq/lv2/sl_zhang", 1, 1
]);
this.skill_map(
    ["dodge", 380],
    ["parry", 380],
    ["force", 380],
    ["staff", 380],
    ["unarmed", 380],
    ["yixingbufa", 380, "dodge"],
    ["shenlongxinfa", 380, "force"],
    ["shedaoqigong", 380, "staff"],
    ["huagumianzhang", 380, "unarmed"]);

this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
}, {
    obj: ["eq/lv0/cloth"],
    odds: 8000
}, {
    obj: ["book/bc#shenlongxinfa", "book/bc#shedaoqigong"],
    odds: 8000
}, {
    obj: ["eq/lv2/sl_cloth", "eq/lv2/sl_tou", "eq/lv2/sl_shoes", "eq/lv2/sl_yao", "eq/lv2/sl_ling"],
    odds: 3000
}, {
    obj: ["eq/lv2/sl_zhang"],
    odds: 1000
});
