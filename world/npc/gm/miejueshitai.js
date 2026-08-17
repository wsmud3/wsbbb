this.inherits(NPC);
this.set({
    name: "灭绝师太",
    desc: "峨嵋派掌门，脾气刚烈，嫉恶如仇。她手持倚天剑，剑法凌厉狠辣，对明教深恶痛绝。此次率领峨嵋弟子攻打光明顶，誓要铲除魔教。",
    title: "<hir>峨嵋派掌门</hir>",
    gender: 2,
    age: 50,
    per: 16,
    hp: 520800,
    max_hp: 520800,
    mp: 112000,
    max_mp: 112000,
    score: 75,
    gj: 53480,
    fy: 33425,
    mz: 47320,
    ds: 26148,
    zj: 1710
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2018],
    ["parry", 2151],
    ["force", 2018],
    ["sword", 2018],
    ["emeixinfa", 2018, "force"],
    ["yitianjianfa", 1871, "sword"],
    ["linjizhuang", 2151, "dodge"]
);
this.set_drop(
    {obj: ["book/bc#yitianjianfa"], odds: 9040},
    {obj: ["eq/lv5/wushen/yitian_sword"], odds: 261482}
);
// 灭绝师太是被营救的NPC，不主动攻击玩家
