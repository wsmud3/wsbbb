this.inherits(NPC);
this.set({
    name: "东北虎",
    desc: "一只体型硕大的东北虎，通体雪白，獠牙外露，低吼声中充满杀意。",
    gender: 0,
    age: 6,
    hp: 70000,
    max_hp: 70000,
    mp: 39500,
    max_mp: 39500,
    score: 35,
    gj: 5340,
    fy: 3260,
    mz: 4080,
    ds: 3220,
    zj: -100
});
this.skill_map(
    ["dodge", 1192],
    ["parry", 1120],
    ["force", 1052],
    ["unarmed", 1192]);

this.set_drop({
    obj: "money/silver",
    min: 8,
    max: 20
}, {
    obj: ["res/xiongdan"],
    odds: 5000
}, {
    obj: ["eq/lv0/cloth", "eq/lv0/dao", "eq/lv0/jian"],
    odds: 8000
}, {
    obj: ["book/bc#lengyueshengong", "book/bc#sixiangbu"],
    odds: 3000
});
this.on_enter = function (me) {
    me.notify("一声震天虎啸，东北虎张着血盆大口朝你扑来！");
    this.do_kill(me);
};
