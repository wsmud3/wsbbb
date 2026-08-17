this.inherits(NPC);
this.set({
    name: "不平道人",
    desc: "三十六洞洞主之一，道貌岸然，实则阴险毒辣。",
    gender: 1,
    age: 45,
    per: 14,
    hp: 717600,
    max_hp: 717600,
    mp: 176000,
    max_mp: 176000,
    score: 55,
    gj: 52182,
    fy: 40534,
    mz: 71786,
    ds: 42061,
    zj: 1260
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2381],
    ["parry", 2409],
    ["force", 2381],
    ["sword", 2381]
);
this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 100
}, {
    obj: ["eq/lv4/zhuyandan"],
    odds: 6360
});
this.on_enter = function (me) {
    me.notify("不平道人冷笑道：「无知小儿，敢来断魂崖送死！」长剑刺来！");
    this.do_kill(me);
};
