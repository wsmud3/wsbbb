this.inherits(NPC);
this.set({
    name: "白衣少女",
    desc: "一名身着白衣的少女，美艳不可方物，却是欧阳锋的侍妾，擅长使用毒功。",
    gender: 2,
    age: 22,
    per: 28,
    hp: 340000,
    max_hp: 340000,
    mp: 141000,
    max_mp: 141000,
    score: 100,
    gj: 37800,
    fy: 19669,
    mz: 27800,
    ds: 22406,
    zj: 900
});
this.skill_map(
    ["dodge", 1752],
    ["parry", 1962],
    ["force", 1752],
    ["unarmed", 1752]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#chanchubufa"],
    odds: 6800
});
this.on_enter = function (me) {
    me.notify("白衣少女冷冷道：擅闯白驼山花园，你可知死字怎么写？");
    this.do_kill(me);
};
