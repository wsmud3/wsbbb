this.inherits(NPC);
this.set({
    name: "周伯通",
    desc: "一个白发白须的老顽童，虽年过花甲却童心未泯，嬉皮笑脸，武功却是当世绝顶。",
    title: "<hiy>老顽童</hiy>",
    gender: 1,
    age: 65,
    per: 12,
    hp: 572000,
    max_hp: 572000,
    mp: 122000,
    max_mp: 122000,
    score: 250,
    gj: 41960,
    fy: 33592,
    mz: 45860,
    ds: 31960,
    zj: 1500
});
this.skill_map(
    ["dodge", 2220],
    ["parry", 2346],
    ["force", 2220],
    ["unarmed", 2164],
    ["kongmingquan", 2164, "unarmed"],
    ["jinyangong", 2220, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 100,
    max: 200
}, {
    obj: ["book/bc#kongmingquan", "book/bc#jinyangong"],
    odds: 8500
});
this.on_enter = function (me) {
    me.notify("周伯通笑嘻嘻地跳出来：哈哈，有人来陪我玩了！来来来，先打过我再说！");
    this.do_kill(me);
};
