this.inherits(NPC);
this.set({
    name: "张无忌",
    desc: "明教教主，身怀九阳神功和乾坤大挪移两大绝学，武功当世无敌。",
    title: "<hiy>明教教主</hiy>",
    gender: 1,
    age: 22,
    per: 24,
    hp: 1192800,
    max_hp: 1192800,
    mp: 253500,
    max_mp: 253500,
    score: 100,
    gj: 74480,
    fy: 50014,
    mz: 86240,
    ds: 54760,
    zj: 2660
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2864],
    ["parry", 2520],
    ["force", 2608],
    ["unarmed", 2608],
    ["jiuyangshengong", 2608, "force"],
    ["qiankundanuoyi", 2864, "parry"],
);
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["book/bc#jiuyangshengong"], odds: 11300},
    {obj: ["book/bc#qiankundanuoyi"], odds: 11300},
    {obj: ["eq/lv4/shenghuoling"], odds: 6780}
);
this.on_enter = function (me) { me.notify("张无忌缓缓站起，九阳神功真气鼓荡，沉声道：'明教存亡，在此一战！'"); this.do_kill(me); };
