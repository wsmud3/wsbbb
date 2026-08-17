this.inherits(NPC);
this.set({
    name: "范遥",
    desc: "明教光明右使，与杨逍齐名，号称'逍遥二仙'中的'苦头陀'。他英俊的外表下隐藏着极强的实力，精通各家武学。",
    title: "<hiy>光明右使</hiy>",
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
    ["parry", 2171],
    ["force", 2087],
    ["unarmed", 2171],
    ["shenghuolingfa", 2171, "unarmed"],
    ["qiankundanuoyi", 2171, "parry"]
);
this.set_drop(
    {obj: "money/silver", min: 30, max: 300},
    {obj: ["book/bc#shenghuolingfa"], odds: 11300},
    {obj: ["eq/lv4/zhouzhiruo_shouzhuo"], odds: 6780}
);
this.on_enter = function (me) { me.notify("范遥面沉如水，冷冷道：'苦头陀在此，休想再进一步！'"); this.do_kill(me); };
