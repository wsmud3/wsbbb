this.inherits(NPC);
this.set({
    name: "天山童姥",
    desc: "一个看似八九岁女童的人物，实则是天山缥缈峰灵鹫宫主人，武功深不可测。她瞥了你一眼：『小子，背我过去，李秋水那贱人就在前面！』",
    gender: 2,
    age: 96,
    per: 8,
    hp: 104000,
    max_hp: 104000,
    mp: 15000,
    max_mp: 15000,
    score: 0,
    gj: 5200,
    fy: 2968,
    mz: 4160,
    ds: 2120,
    zj: 1620,
    no_fight: true
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 560],
    ["parry", 540],
    ["force", 560],
    ["unarmed", 560],
    ["lingboweibu", 2616, "dodge"],
    ["liuyangzhang", 2616, "unarmed"],
    ["bulaochangchungong", 560, "force"],);

// NPC自身动作：背负童姥
this.actions = {};
this.actions["carry_tonglao"] = { name: "背负童姥" };

this.on_create = function() {
    this.actions = {};
    this.actions["carry_tonglao"] = { name: "背负童姥" };
};

// [mech] 童姥是护送目标（规则见 world/area/fb1/fb26.js）：可以切磋（攻略：和女童切磋开鹤翔），不能下杀手
this.on_kill = function (me) {
    if (me && me.is_player) return me.notify_fail("童姥冷笑：「凭你也想杀姥姥？少废话，还不快背我走！」");
    return true;
};
this.on_died = function (killer) {
    var room = this.environment, area = room && room.parent;
    if (area && area.pm_on_tl_died) area.pm_on_tl_died(this, killer);
};
