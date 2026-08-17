this.inherits(NPC);
this.set({
    name: "瑛姑",
    desc: "一位白发苍苍的老妇人，面容带有几分昔日的风韵，眼神中透着深深的哀怨。她独自居住在沼泽深处的茅屋中，精通奇门遁甲和锻造之术。",
    title: "神算子",
    gender: 2,
    age: 55,
    per: 18,
    hp: 105450,
    max_hp: 105450,
    mp: 25000,
    max_mp: 25000,
    score: 40,
    gj: 10773,
    fy: 6031,
    mz: 10545,
    ds: 6455,
    zj: 870
});
this.skill_map(
    ["dodge", 964],
    ["parry", 964],
    ["force", 964],
    ["unarmed", 964]
);
this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 80
});
