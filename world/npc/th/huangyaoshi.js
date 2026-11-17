this.inherits(NPC);
this.set({
    name: "黄药师",
    desc: "桃花岛主，面容清瘦，双目如电，一袭青袍飘飘若仙，举手投足间自有一股宗师气度。",
    title: "东邪",
    gender: 1,
    age: 50,
    per: 25,
    hp: 804000,
    max_hp: 804000,
    mp: 249000,
    max_mp: 249000,
    score: 300,
    gj: 32500,
    fy: 16900,
    mz: 28616,
    ds: 18200,
    zj: 737
});
this.set_objects([
    "eq/lv4/yuxiao", 1, 1
]);
this.skill_map(
    ["dodge", 2616],
    ["parry", 2680],
    ["force", 2616],
    ["sword", 2616],
    ["unarmed", 2440],
    ["luoyingshenjian", 2616, "sword"],
    ["tanzhishengong", 2616, "unarmed"],
    ["biboshengong", 2616, "force"],
    ["anyingfuxiang", 2616, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 150,
    max: 300
}, {
    obj: ["book/bc#anyingfuxiang", "book/bc#tanzhishengong"],
    odds: 8500
}, {
    obj: ["book/bc#luoyingshenjian", "book/bc#biboshengong"],
    odds: 8500
}, {
    obj: ["eq/lv4/yuxiao"],
    odds: 5100
}, {
    obj: ["eq/lv4/ruanjia"],
    odds: 5100
});
// 困难模式卧室只有黄药师（普通模式由 th/woshi 的 on_set_difficulty 移除），主动叫杀，杀了就 100%
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("黄药师负手而立，淡然道：能到此处，也算有缘。可惜，桃花岛不是你该来的地方。");
    this.do_kill(me);
};
