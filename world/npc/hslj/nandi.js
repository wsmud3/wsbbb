this.inherits(NPC);
this.set({
    name: "一灯大师",
    desc: "大理国前皇帝段智兴，出家后法号一灯，一阳指造诣天下无双。",
    title: "南帝",
    gender: 1,
    age: 55,
    per: 20,
    hp: 4955200,
    max_hp: 4955200,
    mp: 796000,
    max_mp: 796000,
    score: 50,   // 五绝依次出场，合计 300 = 100%
    gj: 175940,
    fy: 86131,
    mz: 173684,
    ds: 71788,
    zj: 1709
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 4625],
    ["parry", 4800],
    ["force", 4575],
    ["unarmed", 4575],
    ["sword", 4625],
    ["yiyangzhi", 4575, "unarmed"],
    ["duanjiajian", 4625, "sword"],
    ["tiannanbu", 4625, "dodge"]
);
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["book/bc#yiyangzhi"], odds: 14800},
    {obj: ["book/bc#duanjiajian"], odds: 14800},
    {obj: ["book/bc#tiannanbu"], odds: 14800}
);
this.on_enter = function (me) { if (!me || !me.is_player || this.hp <= 0) return; me.notify("一灯大师端坐不动，一阳指的无形指力已破空而至！"); this.do_kill(me); };

// 依次出场：死后请下一位（world/area/fb1/fb31.js）
this.on_died = function (killer) {
    var room = this.environment;
    if (room && room.parent && room.parent.hslj_on_died) room.parent.hslj_on_died(this, killer);
};
