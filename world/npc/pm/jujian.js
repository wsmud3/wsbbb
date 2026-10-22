this.inherits(NPC);
this.set({
    name: "菊剑",
    desc: "灵鹫宫四剑侍之一，眉眼温柔，手中却握着一柄利剑。",
    gender: 2,
    age: 18,
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
    me.notify("菊剑抬头看了你一眼：「这里是 sisters 的寝阁，你走错门了。」");
};
