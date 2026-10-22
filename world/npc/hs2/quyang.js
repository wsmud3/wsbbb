this.inherits(NPC);
this.set({
    name: "曲洋",
    desc: "一个身穿黑衣的老者，面容枯槁，但双眼精光四射。他乃是日月神教的长老，也是刘正风的知音好友。曲洋精通音律，以琴会友，虽是魔教中人却有一副侠骨丹心。他随身携带着一本失传已久的琴谱。",
    title: "<hii>日月神教长老</hii>",
    gender: 1,
    age: 55,
    per: 22,
    hp: 42500,
    max_hp: 42500,
    mp: 10000,
    max_mp: 10000,
    score: 45,
    gj: 2720,
    fy: 1565,
    mz: 1785,
    ds: 969,
    zj: 878
});
this.set_objects([
    "eq/lv2/hs_qin", 1, 1,
    "eq/lv2/lm_cloth", 1, 1,
    "eq/lv2/lm_shoes", 1, 1,
    "eq/lv2/lm_pifeng", 1, 1
]);
this.skill_map(
    ["dodge", 450],
    ["parry", 450],
    ["force", 450],
    ["unarmed", 450],
    ["sword", 450],
    ["qixianwuxingjian", 450, ["parry", "sword"]]);

this.set_drop({
    obj: "money/silver",
    min: 25,
    max: 60
}, {
    obj: ["book/bc#qixianwuxingjian", ],
    odds: 7450
}, {
    obj: ["eq/lv3/qinhuan"],
    odds: 4470
}, {
    obj: ["eq/lv2/hs_qin"],
    odds: 4470
});
this.on_enter = function (me) {
    me.notify("曲洋抚琴而坐，淡淡说道：老夫本是魔教中人，江湖上人人得而诛之。不过，能与刘兄琴箫相和，此生无憾矣。");
    // Friendly NPC - does not attack
};
