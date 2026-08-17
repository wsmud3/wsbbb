this.inherits(NPC);
this.set({
    name: "邓八公",
    desc: "邓八公乃嵩山派十三太保之一，辈分极高，剑法老辣。",
    title: "嵩山派太保",
    gender: 1,
    age: 52,
    hp: 85500,
    max_hp: 85500,
    mp: 27750,
    max_mp: 27750,
    score: 55,
    gj: 10638,
    fy: 4462,
    mz: 7506,
    ds: 5928,
    zj: 1050
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv4/jian", 1, 1
]);
this.skill_map(
    ["dodge", 1176],
    ["parry", 1176],
    ["force", 1176],
    ["unarmed", 1176],
    ["sword", 1076],
    ["literate", 992],
    ["songshanjianfa", 1076, "sword"],    ["songshanquanfa", 1176, "unarmed"],);
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
    me.notify("邓八公捋须道：老夫镇守中门多年，休想轻易通过！");
    this.do_kill(me);
};
