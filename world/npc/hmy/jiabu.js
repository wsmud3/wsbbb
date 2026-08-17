this.inherits(NPC);
this.set({
    name: "贾布",
    desc: "日月神教青龙堂长老，面目阴鸷，擅长暗器。",
    gender: 1,
    age: 42,
    per: 8,
    hp: 690000,
    max_hp: 690000,
    mp: 149600,
    max_mp: 149600,
    score: 65,
    gj: 50175,
    fy: 39196,
    mz: 69025,
    ds: 40672,
    zj: 1400
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2381],
    ["parry", 2409],
    ["force", 2381],
    ["unarmed", 2381]);
this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 150
}, {
    obj: ["eq/lv3/jiabu_huyaosuo"],
    odds: 6150
}, {
    obj: ["res/qinglonglingpai"],
    odds: 10250
});
this.on_enter = function (me) {
    me.notify("贾布阴森一笑：「青龙堂前，有来无回！」暗器如雨袭来！");
    this.do_kill(me);
};
