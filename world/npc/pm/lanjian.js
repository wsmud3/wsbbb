this.inherits(NPC);
this.set({
    name: "兰剑",
    desc: "灵鹫宫四剑侍之一，素白衣衫，气质清冷。",
    gender: 2,
    age: 19,
    per: 12,
    hp: 120000,
    max_hp: 120000,
    mp: 60000,
    max_mp: 60000,
    score: 0,
    gj: 9000,
    fy: 6000,
    mz: 9000,
    ds: 6000,
    zj: 900
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 900],
    ["parry", 900],
    ["force", 900],
    ["sword", 900]
);
this.on_enter = function (me) {
    me.notify("兰剑轻声道：「宫主吩咐过，此处不许外人踏入。」");
};
