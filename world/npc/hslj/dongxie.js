this.inherits(NPC);
this.set({
    name: "黄药师",
    desc: "桃花岛主，青袍飘飘，手持玉箫，弹指神通天下无双。",
    title: "<hiy>东邪</hiy>",
    gender: 1,
    age: 50,
    per: 22,
    hp: 1438367,
    max_hp: 1438367,
    mp: 796000,
    max_mp: 796000,
    score: 50,   // 五绝依次出场，合计 300 = 100%
    gj: 175940,
    fy: 86131,
    mz: 173684,
    ds: 73832,
    zj: 1709
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 4625],
    ["parry", 4800],
    ["force", 4575],
    ["unarmed", 4575],
    ["sword", 4625],
    ["tanzhishengong", 4575, "unarmed"],
    ["luoyingshenjian", 4625, "sword"],
    ["biboshengong", 4575, "force"]
);
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["book/bc#tanzhishengong"], odds: 14800},
    {obj: ["book/bc#luoyingshenjian"], odds: 14800},
    {obj: ["book/bc#biboshengong"], odds: 14800},
    {obj: ["eq/lv4/yuxiao"], odds: 8880}
);
this.on_enter = function (me) { if (!me || !me.is_player || this.hp <= 0) return; me.notify("黄药师轻抚玉箫，冷冷道：'能上得华山，也算一号人物。接我弹指神通！'"); this.do_kill(me); };

// 依次出场：死后请下一位（world/area/fb1/fb31.js）
this.on_died = function (killer) {
    var room = this.environment;
    if (room && room.parent && room.parent.hslj_on_died) room.parent.hslj_on_died(this, killer);
};
