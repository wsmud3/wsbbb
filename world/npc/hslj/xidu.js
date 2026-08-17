this.inherits(NPC);
this.set({
    name: "欧阳锋",
    desc: "白驼山庄庄主，手持灵蛇杖，蛤蟆功蓄势待发。",
    title: "<hiy>西毒</hiy>",
    gender: 1,
    age: 52,
    per: 14,
    hp: 4955200,
    max_hp: 4955200,
    mp: 796000,
    max_mp: 796000,
    score: 90,
    gj: 296400,
    fy: 169312,
    mz: 292600,
    ds: 166352,
    zj: 3360
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 4625],
    ["parry", 4800],
    ["force", 4575],
    ["unarmed", 4625],
    ["staff", 4575],
    ["hamagong", 4575, "force"],
    ["lingshezhangfa", 4575, "staff"],
    ["chanchubufa", 4625, "dodge"]
);
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["book/bc#hamagong"], odds: 14800},
    {obj: ["book/bc#lingshezhangfa"], odds: 14800},
    {obj: ["book/bc#chanchubufa"], odds: 14800},
    {obj: ["eq/lv5/wushen/lingshe_zhang"], odds: 8880}
);
this.on_enter = function (me) { me.notify("欧阳锋怪眼一翻，蛤蟆功蓄势待发，灵蛇杖法如毒蛇吐信！"); this.do_kill(me); };
