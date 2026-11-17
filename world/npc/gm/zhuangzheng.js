this.inherits(NPC);
this.set({
    name: "<hib>庄铮</hib>",
    desc: "明教五行旗之锐金旗掌旗使，精通金系功法和锐金阵法。",
    gender: 1,
    age: 41,
    per: 16,
    hp: 1600000,
    max_hp: 1600000,
    mp: 101000,
    max_mp: 101000,
    score: 60,
    gj: 53480,
    fy: 28679,
    mz: 45080,
    ds: 23617,
    zj: 1615
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2137],
    ["parry", 2018],
    ["force", 2137],
    ["unarmed", 2137]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 100},
    {obj: ["book/bc#shenghuoshengong"], odds: 3000}
);
// [mech] 明教高手（蓝名）：进门先向同房间的六大门派弟子下杀手，倒下即救下弟子（规则见 world/area/fb1/fb27.js）
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("庄铮拔刀出鞘，锐金阵金光四射！");
    var room = this.environment, area = room && room.parent;
    if (area && area.gm_engage) area.gm_engage(this, me);
    else this.do_kill(me);
};
this.on_died = function (killer) {
    var room = this.environment, area = room && room.parent;
    if (area && area.gm_rescue) area.gm_rescue(this, killer);
};
