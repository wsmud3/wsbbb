this.inherits(NPC);
this.set({
    name: "灭绝师太",
    desc: "峨嵋派掌门，脾气刚烈，嫉恶如仇。她手持倚天剑，剑法凌厉狠辣，对明教深恶痛绝。此次率领峨嵋弟子攻打光明顶，誓要铲除魔教。",
    title: "峨嵋派掌门",
    gender: 2,
    age: 50,
    per: 16,
    hp: 520800,
    max_hp: 520800,
    mp: 112000,
    max_mp: 112000,
    score: 0,
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
    {obj: ["eq/lv5/wushen/yitian_sword"], odds: 17}
);
// [mech] 灭绝师太是被营救的 NPC（规则见 world/area/fb1/fb27.js）：不主动攻击玩家、不能被玩家杀，
// 被说不得/彭莹玉围攻也不会死（攻略：她抗揍）。二人都死后脱困，并按上面的掉落表赠礼给救她的人。
// 倚天剑原写 odds 261482（必出），改为与副本扫荡表一致的 17。
this.on_kill = function (me) {
    if (me && me.is_player) return me.notify_fail("灭绝师太正被明教高手围在当中，你此时向她出手，岂非乘人之危？");
    return true;
};
this.on_die = function () {
    return false;
};
