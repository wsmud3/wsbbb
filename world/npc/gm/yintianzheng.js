this.inherits(NPC);
this.set({
    name: "<hig>殷天正</hig>",
    desc: "白眉鹰王殷天正，鹰爪功天下无双。",
    title: "白眉鹰王",
    gender: 1,
    age: 60,
    per: 18,
    hp: 3000000,
    max_hp: 3000000,
    mp: 128000,
    max_mp: 128000,
    score: 85,
    gj: 72212,
    fy: 34352,
    mz: 63476,
    ds: 42488,
    zj: 2090
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2486],
    ["parry", 2283],
    ["force", 2304],
    ["unarmed", 2192],
    ["yingzhuagong", 2192, "unarmed"]
);
this.set_drop(
    {obj: "money/silver", min: 20, max: 200},
    {obj: ["book/bc#yingzhuagong"], odds: 11300},
    {obj: ["eq/lv4/zhaomin_jiezhi"], odds: 6780}
);
this.on_enter = function (me) { if (!me || !me.is_player) return; me.notify("殷天正白眉一轩，喝道：'鹰爪功之下，从无活口！'"); this.do_kill(me); };
