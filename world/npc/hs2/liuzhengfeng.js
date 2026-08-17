this.inherits(NPC);
this.set({
    name: "刘正风",
    desc: "衡山派的二当家，面容清隽，气度儒雅，颇有长者之风。他精通音律，以琴入剑，是衡山派的第一高手。刘正风为人正直，淡泊名利，一心只想金盆洗手退出江湖，却身不由己被卷入一场巨大的阴谋之中。",
    title: "<hgr>衡山派二当家</hgr>",
    gender: 1,
    age: 48,
    per: 30,
    hp: 132600,
    max_hp: 132600,
    mp: 53000,
    max_mp: 53000,
    score: 40,
    gj: 16065,
    fy: 7480,
    mz: 12835,
    ds: 8284,
    zj: 810
});
this.set_objects([
    "eq/lv2/hs_qin", 1, 1,
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_shoes", 1, 1
]);
this.skill_map(
    ["dodge", 1352],
    ["parry", 1352],
    ["force", 1352],
    ["unarmed", 1352],
    ["sword", 1352],
    ["hengshanshenfa", 1352, "dodge"],    ["hengshanjianfa", 1352], ["parry", 1352, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
}, {
    obj: ["book/bc#hengshanjianfa", ],
    odds: 7450
}, {
    obj: ["eq/lv2/hs_qin"],
    odds: 4470
});
this.on_enter = function (me) {
    me.notify("刘正风看到你，微微颔首：阁下是来助我刘家脱困的么？费斌那厮就在堂上，请壮士速速出手！");
    // Friendly - does not attack
};
