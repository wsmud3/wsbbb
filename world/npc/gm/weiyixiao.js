this.inherits(NPC);
this.set({
    name: "韦一笑",
    desc: "青翼蝠王韦一笑，轻功天下无双。",
    title: "<hiy>青翼蝠王</hiy>",
    gender: 1,
    age: 50,
    per: 16,
    hp: 873600,
    max_hp: 873600,
    mp: 128000,
    max_mp: 128000,
    score: 80,
    gj: 68208,
    fy: 34171,
    mz: 59472,
    ds: 41765,
    zj: 1900
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2276],
    ["parry", 2283],
    ["force", 2486],
    ["unarmed", 2486],
    ["qingfushenfa", 2276, "dodge"]
);
this.set_drop(
    {obj: "money/silver", min: 20, max: 200},
    {obj: ["book/bc#qingfushenfa"], odds: 11300},
    {obj: ["eq/lv4/weiyixiao_taomingshoe"], odds: 6780}
);
this.on_enter = function (me) { me.notify("韦一笑如鬼魅般飘至，冷笑道：'让你见识什么叫真正的轻功！'"); this.do_kill(me); };
