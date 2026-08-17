this.inherits(NPC);
this.set({
    name: "卓不凡",
    desc: "剑神卓不凡，剑法凌厉，妄图夺取天山童姥的武功秘籍。",
    gender: 1,
    age: 38,
    per: 18,
    hp: 676000,
    max_hp: 676000,
    mp: 189200,
    max_mp: 189200,
    score: 65,
    gj: 68068,
    fy: 41891,
    mz: 62322,
    ds: 34090,
    zj: 1620
});
this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
this.skill_map(
    ["dodge", 2143],
    ["parry", 2108],
    ["force", 2143],
    ["sword", 2220],
    ["tianyuqijian", 2220, "sword"]
);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 200
}, {
    obj: ["book/bc#tianyuqijian"],
    odds: 10600
});
this.on_enter = function (me) {
    me.notify("卓不凡拔出长剑：「想过去，先接我天羽奇剑三招！」剑光霎时绽放！");
    this.do_kill(me);
};
