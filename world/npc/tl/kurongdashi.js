this.inherits(NPC);
this.set({
    name: "枯荣大师",
    desc: "天龙寺第一高僧，枯荣禅功已臻化境，面容半枯半荣，佛法武功皆深不可测。",
    title: "枯荣大师",
    gender: 1,
    age: 80,
    per: 8,
    hp: 1494000,
    max_hp: 1494000,
    mp: 202500,
    max_mp: 202500,
    score: 0,   // 完成度只来自「背段誉回大门」（tl_deliver）；原先全杀不背也能 100%
    gj: 93600,
    fy: 57648,
    mz: 92400,
    ds: 49752,
    zj: 2800
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2480],
    ["parry", 2568],
    ["force", 2912],
    ["unarmed", 2912],
    ["kumushengong", 2912, "force"],
    ["liumaishenjian", 2480, "unarmed"]
);
this.set_drop(
    {obj: "money/silver", min: 40, max: 400},
    {obj: ["book/bc#kumushengong"], odds: 5000},
    {obj: ["book/bc#liumaishenjian"], odds: 5000},
    {obj: ["eq/lv5/wushen/longgu_jewels"], odds: 30, diff: 1}   // 龙骨舍利仅困难（diff:1，击杀与扫荡都按难度过滤）
);
// 天龙寺机制见 world/area/fb1/fb28.js
var tlA = function (o) { var r = o.environment || o.die_room; return r && r.parent && r.parent.tl_carry ? r.parent : null; };
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    var a = tlA(this);
    if (a && a.tl_is_carrying(me)) {
        me.notify("枯荣大师半枯半荣的面容终于动容：「放下段誉！」六脉神剑的无形剑气已向你袭来！"); this.do_kill(me);
    } else {
        me.notify("枯荣大师正在入定，半枯半荣的面容毫无表情。");
    }
};
this.on_died = function (killer, corpse) {
    var a = tlA(this);
    if (a) a.tl_on_died(this, killer);
};
