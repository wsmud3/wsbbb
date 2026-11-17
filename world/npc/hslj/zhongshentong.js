this.inherits(NPC);
this.set({
    name: "王重阳",
    desc: "全真教创教祖师，武功冠绝天下，先天功已臻化境。",
    title: "中神通",
    gender: 1,
    age: 58,
    per: 24,
    hp: 7189600,
    max_hp: 7189600,
    mp: 850000,
    max_mp: 850000,
    score: 100,   // 五绝依次出场，合计 300 = 100%
    gj: 150000,
    fy: 78000,
    mz: 150000,
    ds: 70000,
    zj: 1831
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 5525],
    ["parry", 5850],
    ["force", 5625],
    ["sword", 5625],
    ["unarmed", 5525],
    ["quanzhenjianfa", 5625, "sword"],
    ["jinyangong", 5525, "dodge"],
    ["jiuyinshengong", 5625, "force"]
);
this.set_drop(
    {obj: "money/silver", min: 80, max: 800},
    {obj: ["book/bc#jiuyinshengong"], odds: 14800},
    {obj: ["book/bc#quanzhenjianfa"], odds: 14800},
    {obj: ["book/bc#jinyangong"], odds: 14800},
    {obj: ["eq/lv5/wushen/tianlong_waist"], odds: 8880}
);
this.on_enter = function (me) { if (!me || !me.is_player || this.hp <= 0) return; me.notify("王重阳缓缓睁开眼睛，先天功的真气如海啸般涌来：「贫道等这一战已经很久了！」"); this.do_kill(me); };

// 依次出场：死后请下一位（world/area/fb1/fb31.js）
this.on_died = function (killer) {
    var room = this.environment;
    if (room && room.parent && room.parent.hslj_on_died) room.parent.hslj_on_died(this, killer);
};
