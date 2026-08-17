this.inherits(NPC);
this.set({
    name: "田伯光",
    desc: "一个身形消瘦的男子，手持一柄快刀，双目如鹰，嘴角带着一丝淫邪的笑意。他便是臭名昭著的采花大盗田伯光，一身狂风刀法快如闪电，轻功更是出神入化。此人极难对付，据说要连杀四次才能真正将他置于死地。",
    title: "<hri>万里独行</hri>",
    gender: 1,
    age: 35,
    hp: 272000,
    max_hp: 272000,
    mp: 94600,
    max_mp: 94600,
    score: 55,
    gj: 19632,
    fy: 13348,
    mz: 17168,
    ds: 9514,
    zj: 910
});
this.set_objects([
    "eq/lv2/lm_cloth", 1, 1,
    "eq/lv2/lm_shoes", 1, 1,
    "eq/lv1/dandao", 1, 1
]);
this.skill_map(
    ["dodge", 1504],
    ["parry", 1504],
    ["force", 1504],
    ["unarmed", 1504],
    ["blade", 1504],
    ["yanxingbu", 1504, "dodge"],    ["kuangfengkuaidao", 1504], ["parry", 1504, "blade"]);

this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 80
}, {
    obj: ["book/bc#kuangfengkuaidao", "book/bc#yanxingbu"],
    odds: 7100
}, {
    obj: ["eq/lv3/kuangfengdao", "eq/lv3/mianzhao"],
    odds: 4260
}, {
    obj: ["eq/lv2/lm_cloth", "eq/lv2/lm_shoes"],
    odds: 4260
});
this.on_enter = function (me) {
    me.notify("田伯光怪笑一声：嘿嘿，又来一个小娘们……哦不，是个男人？那也不妨，老子的刀可不挑人！");
    this.do_kill(me);
};
