this.inherits(NPC);
this.set({
    name: "不戒和尚",
    desc: "一个身材高大的和尚，袒露着半边胸膛，满面横肉，脖子上挂着一串巨大的佛珠。他法号不戒，却是个酒肉和尚，出手凶狠，与其说是出家人，不如说是个打家劫舍的强盗。",
    title: "不戒和尚",
    gender: 1,
    age: 40,
    hp: 119200,
    max_hp: 119200,
    mp: 54750,
    max_mp: 54750,
    score: 45,
    gj: 15120,
    fy: 7128,
    mz: 12080,
    ds: 7895,
    zj: 780
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv0/shoes", 1, 1,
    "eq/lv1/qimeigun", 1, 1
]);
this.skill_map(
    ["dodge", 1352],
    ["parry", 1352],
    ["force", 1352],
    ["unarmed", 1352],
    ["staff", 1352],
    ["shaolinshenfa", 1352, "dodge"],
    ["hunyuanyiqi", 1352, "force"],
    ["jingangquan", 1352, "unarmed"],
    ["weituogun", 1352], ["parry", 1352, "staff"]);

this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
}, {
    obj: ["book/bc#jingangquan", "book/bc#weituogun"],
    odds: 7100
}, {
    obj: ["eq/lv0/cloth", "eq/lv1/qimeigun"],
    odds: 4260
});
this.on_enter = function (me) {
    me.notify("不戒和尚一拍肚皮，大笑道：哈哈，来了个找打的！看佛爷超度了你！");
    this.do_kill(me);
};
