this.inherits(NPC);
this.set({
    name: "左冷禅",
    desc: "左冷禅乃嵩山派掌门，五岳剑派盟主，大嵩阳神掌和寒冰真气威震武林。",
    title: "嵩山派掌门",
    gender: 1,
    age: 55,
    hp: 236880,
    max_hp: 236880,
    mp: 85000,
    max_mp: 85000,
    score: 180,
    gj: 21834,
    fy: 13166,
    mz: 19314,
    ds: 11887,
    zj: 1960
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv5/jian", 1, 1
]);
this.skill_map(
    ["dodge", 1512],
    ["parry", 1512],
    ["force", 1396],
    ["unarmed", 1396],
    ["sword", 1376],
    ["literate", 1532],
    ["songshanjianfa", 1376, "sword"],    ["songshanquanfa", 1376, "unarmed"],
    ["dasongyangshenzhang", 1396, "unarmed"],
    ["hanbingzhenqi", 1396, "force"],);
this.set_drop({
    obj: "money/silver",
    min: 80,
    max: 150
}, {
    obj: ["book/bc#dasongyangshenzhang"],
    odds: 7800
}, {
    obj: ["book/bc#hanbingzhenqi"],
    odds: 7800
}, {
    obj: ["book/bc#songshanjianfa"],
    odds: 7800
}, {
    obj: ["eq/lv3/ss_lingqi"],
    odds: 4680
}, {
    obj: ["eq/lv3/ss_pifeng"],
    odds: 4680
});
this.on_enter = function (me) {
    me.notify("左冷禅端坐盟主宝座，冷冷道：能闯到此处也算不易。可惜，你终究要死在这里！");
    this.do_kill(me);
};
