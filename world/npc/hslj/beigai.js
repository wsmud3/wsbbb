this.inherits(NPC);
this.set({
    name: "洪七公",
    desc: "丐帮帮主，降龙十八掌刚猛无匹，打狗棒法精妙绝伦。",
    title: "<hiy>北丐</hiy>",
    gender: 1,
    age: 60,
    per: 12,
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
    ["unarmed", 4575],
    ["staff", 4625],
    ["anyingfuxiang", 4625, "dodge"],
    ["kumushengong", 4575, "force"]
);
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["book/bc#anyingfuxiang"], odds: 14800},
    {obj: ["book/bc#kumushengong"], odds: 14800},
    {obj: ["eq/lv5/wushen/yuzhu_zhang"], odds: 8880}
);
this.on_enter = function (me) { me.notify("洪七公哈哈大笑，声如洪钟：'小娃娃功夫不错，来陪老叫花走两招！'"); this.do_kill(me); };
