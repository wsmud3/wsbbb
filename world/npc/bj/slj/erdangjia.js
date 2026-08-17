this.inherits(NPC);
this.set({
    name: "胖头陀",
    desc: "神龙教的二当家，身材奇胖，头大如斗，使一根铁杖，力大无穷，是教中一等一的高手。",
    title: "神龙教二当家",
    gender: 1,
    age: 38,
    per: 20,
    mp: 2500,
    max_mp: 2500,
    hp: 2800,
    max_hp: 2800,
    score: 20,
    gj: 200
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
    ["dodge", 280],
    ["parry", 280],
    ["force", 280],
    ["staff", 280],
    ["unarmed", 280],
    ["yixingbufa", 280, "dodge"],
    ["shenlongxinfa", 280, "force"],
    ["shedaoqigong", 280, "staff"]);

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
    odds: 2500
});
