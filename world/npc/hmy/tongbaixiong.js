this.inherits(NPC);
this.set({
    name: "童百熊",
    desc: "日月神教风雷堂长老，风雷掌法威震江湖。",
    gender: 1,
    age: 50,
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
    obj: ["eq/lv3/tongbaixiongjie"],
    odds: 6150
}, {
    obj: ["res/fengleilingpai"],
    odds: 10250
});
this.on_enter = function (me) {
    me.notify("童百熊双掌推出，风雷之声大作：「风雷堂不是你放肆的地方！」");
    this.do_kill(me);
};
