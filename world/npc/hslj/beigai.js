this.inherits(NPC);
this.set({
    name: "洪七公",
    desc: "丐帮帮主，降龙十八掌刚猛无匹，打狗棒法精妙绝伦。",
    title: "北丐",
    gender: 1,
    age: 60,
    per: 12,
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
    ["unarmed", 4575],
    ["staff", 4625],
    ["anyingfuxiang", 4625, "dodge"],
    ["kumushengong", 4575, "force"]
);
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["book/bc#anyingfuxiang"], odds: 5000},
    {obj: ["book/bc#kumushengong"], odds: 5000},
    {obj: ["eq/lv4/yuzhuzhang"], odds: 150}
);
this.on_enter = function (me) { if (!me || !me.is_player || this.hp <= 0) return; me.notify("洪七公哈哈大笑，声如洪钟：「小娃娃功夫不错，来陪老叫花走两招！」"); this.do_kill(me); };

// 依次出场：死后请下一位（world/area/fb1/fb31.js）
this.on_died = function (killer) {
    var room = this.environment;
    if (room && room.parent && room.parent.hslj_on_died) room.parent.hslj_on_died(this, killer);
};
