this.inherits(NPC);
this.set({
    name: "神龙教弟子",
    desc: "一名神龙教的普通弟子，目光中透着几分邪气，对洪教主忠心耿耿。",
    gender: 1,
    age: 25,
    per: 20,
    mp: 500,
    max_mp: 500,
    hp: 700,
    max_hp: 700,
    score: 1
});
this.set_objects([
    "eq/lv0/cloth", 1, 1
]);
this.skill_map(
    ["dodge", 150],
    ["parry", 150],
    ["force", 150],
    ["unarmed", 150],
    ["yixingbufa", 150, "dodge"],
    ["shenlongxinfa", 150, "force"]);

this.set_drop({
    obj: "money/silver",
    min: 5,
    max: 15
}, {
    obj: ["eq/lv0/cloth"],
    odds: 8000
}, {
    obj: ["book/bc#yixingbufa"],
    odds: 3000
}, {
    obj: ["book/bc#shenlongxinfa"],
    odds: 3000
}, {
    obj: ["book/bc#shedaoqigong"],
    odds: 3000
});
