this.inherits(NPC);
this.set({
    name: "欧阳锋",
    desc: "白驼山庄庄主，西域第一高手。他身材高大，面目阴沉，手持灵蛇杖，蛤蟆功威震武林。",
    title: "<hiy>西毒</hiy>",
    gender: 1,
    age: 48,
    per: 10,
    hp: 1044000,
    max_hp: 1044000,
    mp: 253500,
    max_mp: 253500,
    score: 280,
    gj: 59200,
    fy: 42143,
    mz: 55600,
    ds: 36669,
    zj: 1500
});
this.set_objects([
    "eq/lv4/lingshezhang", 1, 1
]);
this.skill_map(
    ["dodge", 2680],
    ["parry", 2824],
    ["force", 2440],
    ["unarmed", 2440],
    ["staff", 2680],
    ["hamagong", 2440, "force"],
    ["lingshezhangfa", 2680, "staff"],
    ["chanchubufa", 2680, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 150,
    max: 300
}, {
    obj: ["book/bc#hamagong", "book/bc#lingshezhangfa"],
    odds: 8500
}, {
    obj: ["book/bc#chanchubufa"],
    odds: 6800
}, {
    obj: ["eq/lv4/lingshezhang"],
    odds: 5100
});
this.on_enter = function (me) {
    me.notify("欧阳锋阴森森地说道：小辈，你既入白驼山，就别想活着出去了！");
    this.do_kill(me);
};
