this.inherits(NPC);
this.set({
    name: "杨莲亭",
    desc: "东方不败的男宠，日月神教的实际掌权者。面容俊美，心狠手辣。",
    gender: 1,
    age: 28,
    per: 18,
    hp: 755000,
    max_hp: 755000,
    mp: 122000,
    max_mp: 122000,
    score: 70,
    gj: 67075,
    fy: 36736,
    mz: 57325,
    ds: 30340,
    zj: 1575
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2346],
    ["parry", 2381],
    ["force", 2346],
    ["unarmed", 2346]);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 200
}, {
    obj: ["eq/lv3/yanglianting_xiangquan"],
    odds: 6150
});
this.on_enter = function (me) {
    me.notify("杨莲亭冷笑一声：「擅闯日月神教，待教主来了，你便死无葬身之地！」");
    this.do_kill(me);
};
