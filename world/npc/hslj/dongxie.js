this.inherits(NPC);
this.set({
    name: "黄药师",
    desc: "桃花岛主，青袍飘飘，手持玉箫，弹指神通天下无双。",
    title: "<hiy>东邪</hiy>",
    gender: 1,
    age: 50,
    per: 22,
    hp: 4955200,
    max_hp: 4955200,
    mp: 796000,
    max_mp: 796000,
    score: 90,
    gj: 296400,
    fy: 169312,
    mz: 292600,
    ds: 171088,
    zj: 3360
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
    {obj: ["eq/lv5/wushen/yuxiao"], odds: 8880}
);
this.on_enter = function (me) { me.notify("黄药师轻抚玉箫，冷冷道：'能上得华山，也算一号人物。接我弹指神通！'"); this.do_kill(me); };
