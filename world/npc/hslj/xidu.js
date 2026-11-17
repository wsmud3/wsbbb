this.inherits(NPC);
this.set({
    name: "欧阳锋",
    desc: "白驼山庄庄主，手持灵蛇杖，蛤蟆功蓄势待发。",
    title: "西毒",
    gender: 1,
    age: 52,
    per: 14,
    hp: 4955200,
    max_hp: 4955200,
    mp: 796000,
    max_mp: 796000,
    score: 50,   // 五绝依次出场，合计 300 = 100%
    gj: 175940,
    fy: 86131,
    mz: 173684,
    ds: 71788,
    zj: 1709
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
    {obj: ["book/bc#hamagong"], odds: 5000},
    {obj: ["book/bc#lingshezhangfa"], odds: 5000},
    {obj: ["book/bc#chanchubufa"], odds: 5000},
    {obj: ["eq/lv4/lingshezhang"], odds: 150}
);
this.on_enter = function (me) { if (!me || !me.is_player || this.hp <= 0) return; me.notify("欧阳锋怪眼一翻，蛤蟆功蓄势待发，灵蛇杖法如毒蛇吐信！"); this.do_kill(me); };

// 依次出场：死后请下一位（world/area/fb1/fb31.js）
this.on_died = function (killer) {
    var room = this.environment;
    if (room && room.parent && room.parent.hslj_on_died) room.parent.hslj_on_died(this, killer);
};
