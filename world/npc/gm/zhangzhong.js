this.inherits(NPC);
this.set({
    name: "<hib>张中</hib>",
    desc: "明教五散人之一，武功不俗，辅佐教主治事。",
    gender: 1,
    age: 42,
    per: 15,
    hp: 2000000,
    max_hp: 2000000,
    mp: 141000,
    max_mp: 141000,
    score: 55,
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
    {obj: ["book/bc#qingfushenfa"], odds: 11300}
);
// [mech] 明教高手（蓝名）：进门先向同房间的六大门派弟子下杀手，倒下即救下弟子（规则见 world/area/fb1/fb27.js）
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("张中见你闯入，立刻摆开架势迎战！");
    var room = this.environment, area = room && room.parent;
    if (area && area.gm_engage) area.gm_engage(this, me);
    else this.do_kill(me);
};
this.on_died = function (killer) {
    var room = this.environment, area = room && room.parent;
    if (area && area.gm_rescue) area.gm_rescue(this, killer);
};
