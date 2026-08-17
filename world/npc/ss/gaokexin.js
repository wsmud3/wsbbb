this.inherits(NPC);
this.set({
    name: "高克新",
    desc: "高克新乃嵩山派十三太保之一，剑招诡异，令人防不胜防。",
    title: "嵩山派太保",
    gender: 1,
    age: 38,
    hp: 134100,
    max_hp: 134100,
    mp: 42850,
    max_mp: 42850,
    score: 55,
    gj: 17730,
    fy: 7582,
    mz: 12510,
    ds: 9048,
    zj: 1050
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv4/jian", 1, 1
]);
this.skill_map(
    ["dodge", 1376],
    ["parry", 1376],
    ["force", 1376],
    ["unarmed", 1376],
    ["sword", 1276],
    ["literate", 1192],
    ["songshanjianfa", 1276, "sword"],    ["songshanquanfa", 1376, "unarmed"],);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
}, {
    obj: ["book/bc#songshanjianfa"],
    odds: 7800
}, {
    obj: ["eq/lv4/jian"],
    odds: 4680
});
this.on_enter = function (me) {
    me.notify("高克新阴笑道：嘿嘿，又来了个送死的！");
    this.do_kill(me);
};
