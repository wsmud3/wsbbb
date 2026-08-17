this.inherits(NPC);
this.set({
    name: "阎基",
    desc: "一个面目可憎的独眼汉子，手持一柄鬼头大刀。此人阴险狡诈，专干杀人越货的勾当。",
    title: "<hired>关外悍匪</hired>",
    gender: 1,
    age: 35,
    per: 8,
    hp: 122000,
    max_hp: 122000,
    mp: 88000,
    max_mp: 88000,
    score: 55,
    gj: 11570,
    fy: 8960,
    mz: 14860,
    ds: 6820,
    zj: 400
});
this.set_objects([
    "eq/lv3/kw_dao", 1, 1
]);
this.skill_map(
    ["dodge", 1504],
    ["parry", 1344],
    ["force", 1504],
    ["blade", 1548],
    ["hujiadaofa", 1344, "blade"],
    ["sixiangbu", 1364, "dodge"],
    ["lengyueshengong", 1344, "force"]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#hujiadaofa", "book/bc#sixiangbu", "book/bc#lengyueshengong"],
    odds: 5000
}, {
    obj: ["eq/lv3/kw_dao"],
    odds: 2000
}, {
    obj: ["res/xiongdan"],
    odds: 3000
});
this.on_enter = function (me) {
    me.notify("阎基狞笑道：嘿嘿，又来一个送死的！看刀！");
    this.do_kill(me);
};
