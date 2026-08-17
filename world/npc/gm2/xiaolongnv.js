this.inherits(NPC);
this.set({
    name: "小龙女",
    desc: "古墓派传人，一袭白衣如雪，清冷脱俗。玉女剑法出神入化，银索金铃独步武林。",
    title: "<hiy>古墓仙子</hiy>",
    gender: 2,
    age: 22,
    per: 30,
    hp: 5362000,
    max_hp: 5362000,
    mp: 658000,
    max_mp: 658000,
    score: 85,
    gj: 269500,
    fy: 160050,
    mz: 295750,
    ds: 154550,
    zj: 2700
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 4375],
    ["parry", 4525],
    ["force", 4650],
    ["sword", 4375],
    ["whip", 4650],
    ["yunvxinjing", 4650, "force"],
    ["yinsuojinling", 4650, "whip"]
);
this.set_drop(
    {obj: "money/silver", min: 30, max: 300},
    {obj: ["book/bc#yunvxinjing"], odds: 13750},
    {obj: ["book/bc#yinsuojinling"], odds: 13750},
    {obj: ["eq/lv4/jinlingsuo"], odds: 8250}
);
this.on_enter = function (me) { me.notify("小龙女冷冷地看着你，玉手轻扬，银索金铃已如灵蛇般袭来！"); this.do_kill(me); };
