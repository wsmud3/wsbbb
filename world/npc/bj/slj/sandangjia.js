this.inherits(NPC);
this.set({
    name: "瘦头陀",
    desc: "神龙教的三当家，身材又高又瘦，犹如一根竹竿，看似弱不禁风，实则武功阴狠，使一根铁杖。",
    title: "神龙教三当家",
    gender: 1,
    age: 35,
    per: 18,
    mp: 2000,
    max_mp: 2000,
    hp: 2600,
    max_hp: 2600,
    score: 13,
    gj: 150
});
this.set_objects([
    "eq/lv2/sl_cloth", 1, 1,
    "eq/lv2/sl_tou", 1, 1,
    "eq/lv2/sl_shoes", 1, 1,
    "eq/lv2/sl_yao", 1, 1,
    "eq/lv2/sl_ling", 1, 1,
    "eq/lv0/tiezhang", 1, 1
]);
this.skill_map(
    ["dodge", 250],
    ["parry", 250],
    ["force", 250],
    ["staff", 250],
    ["unarmed", 250],
    ["yixingbufa", 250, "dodge"],
    ["shenlongxinfa", 250, "force"],
    ["shedaoqigong", 250, "staff"]);

this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 30
}, {
    obj: ["eq/lv0/cloth", "eq/lv0/tiezhang"],
    odds: 8000
}, {
    obj: ["book/bc#shenlongxinfa", "book/bc#shedaoqigong"],
    odds: 5000
}, {
    obj: ["eq/lv2/sl_cloth", "eq/lv2/sl_tou", "eq/lv2/sl_shoes", "eq/lv2/sl_yao", "eq/lv2/sl_ling"],
    odds: 2000
});
