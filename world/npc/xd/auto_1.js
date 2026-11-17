this.inherits(NPC);
// 「落花流水」四侠之一。原版采集数据里这四人在雪山山谷（这里原先误套了词条石商人模板，不能打）。
// 机制（world/area/fb1/fb29.js）：玩家在山洞惊动血刀老祖后，四侠赶去与老祖混战；
// 老祖每砍死一人就往山谷退一步。四侠是友军：不攻击玩家，也不能被玩家杀，不计完成度、不掉落。
this.set({
    name: "陆天抒",
    title: "<hic>仁义陆大刀</hic>",
    desc: "「落花流水」四侠之一，一路追杀血刀老祖至此，誓要为江湖除此大害。",
    gender: 1,
    age: 52,
    per: 18,
    hp: 4400000,
    max_hp: 4400000,
    mp: 300000,
    max_mp: 300000,
    score: 0,
    gj: 60000,
    fy: 1500000,   // 四侠要能在老祖刀下撑一阵（老祖一刀七八十万），否则还没跟上就被砍光
    mz: 150000,
    ds: 64000,
    zj: 1785
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3865],
    ["parry", 3760],
    ["force", 3865],
    ["unarmed", 3865]
);
this.on_kill = function (me) {
    if (me && me.notify) me.notify("陆天抒怒道：「我等是来诛杀血刀恶僧的，你分不清敌友么？」");
    return false;
};
this.on_died = function (killer, corpse) {
    var room = this.environment;
    if (room && room.parent && room.parent.xd_npc_died) room.parent.xd_npc_died(this, killer);
};
this.on_before_fight = function (me) {
    if (me && me.notify) me.notify(this.name + "摆手道：「大敌当前，哪有工夫和你切磋！」");
    return false;
};
