this.inherits(NPC);
this.set({
    name: "<hib>说不得</hib>",
    desc: "明教五散人之一，外号'布袋和尚'，身背一个大布袋，笑容可掬。他武功虽不算顶尖，但在五散人中辈分最高。",
    title: "布袋和尚",
    gender: 1,
    age: 45,
    per: 10,
    hp: 2000000,
    max_hp: 2000000,
    mp: 141000,
    max_mp: 141000,
    score: 136,
    gj: 38920,
    fy: 29787,
    mz: 39760,
    ds: 23617,
    zj: 1520
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2018],
    ["parry", 2151],
    ["force", 2018],
    ["unarmed", 2018]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 100},
    {obj: ["book/bc#qiankundanuoyi"], odds: 3000}
);
// [mech] 光明顶上围攻灭绝师太，不理会玩家；与彭莹玉/说不得都死后灭绝脱困（规则见 world/area/fb1/fb27.js）
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    var room = this.environment, area = room && room.parent;
    if (area && area.gm_siege && area.gm_siege(room)) {
        me.notify(this.name + "正和同伴围攻灭绝师太，无暇理你。");
        return;
    }
    me.notify("说不得笑呵呵地解下布袋，说道：「施主请进我这布袋一游！」");
    this.do_kill(me);
};
this.on_died = function (killer) {
    var room = this.environment, area = room && room.parent;
    if (area && area.gm_on_siege_died) area.gm_on_siege_died(this, killer);
};
