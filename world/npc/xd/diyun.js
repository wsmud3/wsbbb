this.inherits(NPC);
this.set({
    name: "狄云",
    desc: "一个衣衫褴褛的男子，眼神中透着不屈。他正是《连城诀》中的狄云。",
    gender: 1,
    age: 25,
    per: 14,
    hp: 112000,
    max_hp: 112000,
    mp: 8000,
    max_mp: 8000,
    score: 35,
    gj: 4800,
    fy: 2540,
    mz: 4160,
    ds: 1778,
    zj: 1260
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 600],
    ["parry", 560],
    ["force", 600],
    ["unarmed", 600],
    ["shenzhaojing", 600, "force"]
);
this.set_drop(
    {obj: ["book/bc#shenzhaojing"], odds: 7620}
);
// 狄云是被囚禁的NPC，不主动攻击玩家
