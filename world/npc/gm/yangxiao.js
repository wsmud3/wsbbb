this.inherits(NPC);
this.set({
    name: "杨逍",
    desc: "明教光明左使，文武双全，英俊潇洒。他精通弹指神通和诸多绝学，是明教中仅次于教主的绝顶高手。当年曾与峨嵋派孤鸿子比武，凭借深厚内力不战而胜。",
    title: "<hiy>光明左使</hiy>",
    gender: 1,
    age: 40,
    per: 26,
    hp: 739200,
    max_hp: 739200,
    mp: 149600,
    max_mp: 149600,
    score: 90,
    gj: 77672,
    fy: 43573,
    mz: 67116,
    ds: 34171,
    zj: 2280
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2171],
    ["parry", 2276],
    ["force", 2087],
    ["unarmed", 2087],
    ["tanzhishengong", 2171, "unarmed"],
    ["qiankundanuoyi", 2276, "parry"]
);
this.set_drop(
    {obj: "money/silver", min: 30, max: 300},
    {obj: ["book/bc#qiankundanuoyi"], odds: 11300},
    {obj: ["eq/lv4/yangbuhui_xianglian"], odds: 6780}
);
this.on_enter = function (me) { me.notify("杨逍微微一笑，说道：'能到这里，你也算不错了。但到此为止！'"); this.do_kill(me); };
