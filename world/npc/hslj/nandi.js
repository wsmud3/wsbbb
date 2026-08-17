this.inherits(NPC);
this.set({
    name: "段智兴",
    desc: "大理国前皇帝，一阳指造诣天下无双。",
    title: "<hiy>南帝</hiy>",
    gender: 1,
    age: 55,
    per: 20,
    hp: 4955200,
    max_hp: 4955200,
    mp: 796000,
    max_mp: 796000,
    score: 90,
    gj: 296400,
    fy: 169312,
    mz: 292600,
    ds: 166352,
    zj: 3360
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
this.on_enter = function (me) { me.notify("段智兴端坐不动，一阳指的无形指力已破空而至！"); this.do_kill(me); };
