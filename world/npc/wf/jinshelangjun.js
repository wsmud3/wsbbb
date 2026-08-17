this.inherits(NPC);
this.set({
    name: "金蛇郎君",
    desc: "一个面容英俊却又带着几分邪气的男子，身着金色长袍，手持一柄奇形金蛇剑。他便是当年威震江湖的金蛇郎君夏雪宜，武功深不可测，行事亦正亦邪。",
    title: "<hiy>金蛇郎君</hiy>",
    gender: 1,
    age: 35,
    hp: 189280,
    max_hp: 189280,
    mp: 772000,
    max_mp: 772000,
    score: 30,
    gj: 3178,
    fy: 1677,
    mz: 3022,
    ds: 2189,
    zj: 960
});
this.set_objects([
    "eq/lv2/js_pifeng", 1, 1,
    "eq/lv2/js_ring", 1, 1,
    "eq/lv2/js_nang", 1, 1,
    "eq/lv1/jinshezhui", 1, 1
]);
this.skill_map(
    ["dodge", 800],
    ["parry", 800],
    ["force", 800],
    ["unarmed", 800],
    ["sword", 800],
    ["jinsheyoushenbu", 800, "dodge"],    ["jinsheyoushenzhang", 800 , "unarmed"],
    ["jinshejianfa", 800], ["parry", 800, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 80
}, {
    obj: ["book/bc#jinshejianfa", "book/bc#jinsheyoushenzhang","book/bc#jinsheyoushenbu"],
    odds: 6400
}, {
    obj: ["eq/lv2/js_pifeng", "eq/lv2/js_ring", "eq/lv2/js_nang", "eq/lv1/jinshezhui"],
    odds: 3840
}, {
    obj: ["eq/lv3/js_pifeng"],
    odds: 6400
});
this.on_enter = function (me) {
    me.notify("金蛇郎君缓缓抬起头，眼中寒光一闪：既然来了，就不要走了。");
    this.do_kill(me);
};
