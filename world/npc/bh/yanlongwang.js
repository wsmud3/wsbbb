this.inherits(NPC);
this.set({
    name: "炎龙王",
    desc: "炎龙之王，体型巨大，龙威震慑人心，火焰呈金白色，温度高得可怕。",
    gender: 1,
    age: 200,
    per: 3,
    hp: 943800,
    max_hp: 943800,
    mp: 249000,
    max_mp: 249000,
    score: 70,
    gj: 81840,
    fy: 45614,
    mz: 70840,
    ds: 37628,
    zj: 1280
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2552],
    ["parry", 2752],
    ["force", 2592],
    ["unarmed", 2680]);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 200
}, {
    obj: ["eq/lv4/lihuozhu"],
    odds: 7360
}, {
    obj: ["eq/lv3/longhuozhi"],
    odds: 7360
});
this.on_enter = function (me) {
    me.notify("炎龙王发出震天咆哮，金白色火焰席卷四方！");
    this.do_kill(me);
};
