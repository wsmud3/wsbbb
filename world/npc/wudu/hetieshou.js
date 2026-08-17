this.inherits(NPC);
this.set({
    name: "何铁手",
    desc: "一个身材苗条的黑衣女子，面容冷艳，最引人注目的是她的右手——竟是一只精铁铸成的铁手！她使一对铁钩，招式精妙狠辣，武功尤在何红药之上，是五毒教真正的第一高手。",
    title: "<hib>铁手罗刹</hib>",
    gender: 2,
    age: 32,
    per: 28,
    hp: 202800,
    max_hp: 202800,
    mp: 77200,
    max_mp: 77200,
    score: 60,
    gj: 16095,
    fy: 12474,
    mz: 20505,
    ds: 9936,
    zj: 1063
});
this.set_objects([
    "eq/lv2/lm_cloth", 1, 1,
    "eq/lv2/lm_tou", 1, 1,
    "eq/lv2/lm_shoes", 1, 1,
    "eq/lv2/lm_pifeng", 1, 1,
    "eq/lv2/lm_pei", 1, 1
]);
this.skill_map(
    ["dodge", 1548],
    ["parry", 1548],
    ["force", 1548],
    ["unarmed", 1548],
    ["sword", 1548],
    ["wuduyanluobu", 1548, "dodge"],
    ["wudushengong", 1548, "force"],
    ["qianzhuwandushou", 1548, "unarmed"],
    ["wudugoufa", 1548], ["parry", 1548, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 40,
    max: 100
}, {
    obj: ["book/bc#wudushengong", "book/bc#wudugoufa", "book/bc#wuduyanluobu"],
    odds: 6750
}, {
    obj: ["eq/lv3/jingougou"],
    odds: 4050
}, {
    obj: ["eq/lv2/lm_cloth", "eq/lv2/lm_tou", "eq/lv2/lm_shoes"],
    odds: 4050
});
this.on_enter = function (me) {
    me.notify("何铁手冷冷地看着你，铁手发出咔咔的声响：能走到这里来，算你有几分本事。不过，到此为止了！");
    this.do_kill(me);
};
