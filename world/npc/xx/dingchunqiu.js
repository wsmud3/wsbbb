this.inherits(NPC);
this.set({
    name: "丁春秋",
    desc: "星宿老仙，一派宗师。他面容枯槁，眼神阴鸷，周身环绕着碧绿色的毒雾。化功大法威力无穷，三阴蜈蚣爪歹毒无比。",
    title: "<hiy>星宿老仙</hiy>",
    gender: 1,
    age: 55,
    per: 5,
    hp: 844200,
    max_hp: 844200,
    mp: 249000,
    max_mp: 249000,
    score: 300,
    gj: 66780,
    fy: 37064,
    mz: 58800,
    ds: 38179,
    zj: 1550
});
this.set_objects([
    "eq/lv4/shenmuwangding", 1, 1
]);
this.skill_map(
    ["dodge", 2680],
    ["parry", 2824],
    ["force", 2440],
    ["unarmed", 2440],
    ["huagongdafa", 2440, "force"],
    ["feixingshu", 2680, "unarmed"],
    ["sanyinwugongzhao", 2680, "unarmed"],
    ["zhaixinggong", 2680, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 150,
    max: 300
}, {
    obj: ["book/bc#huagongdafa", "book/bc#sanyinwugongzhao"],
    odds: 8850
}, {
    obj: ["book/bc#feixingshu", "book/bc#zhaixinggong"],
    odds: 8850
}, {
    obj: ["eq/lv4/shenmuwangding"],
    odds: 5310
}, {
    obj: ["eq/lv3/bilinzhen"],
    odds: 5310
});
this.on_enter = function (me) {
    me.notify("丁春秋端坐药炉之前，阴森森地说道：星宿老仙在此，小辈还不跪下受死！");
    this.do_kill(me);
};
