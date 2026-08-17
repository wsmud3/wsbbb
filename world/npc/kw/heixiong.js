this.inherits(NPC);
this.set({
    name: "黑熊",
    desc: "一头膘肥体壮的黑熊，力大无穷，一掌能拍碎石块，比阎基还要难缠几分。",
    gender: 0,
    age: 8,
    hp: 93400,
    max_hp: 93400,
    mp: 42850,
    max_mp: 42850,
    score: 40,
    gj: 9500,
    fy: 5740,
    mz: 9350,
    ds: 5600,
    zj: -100
});
this.skill_map(
    ["dodge", 1164],
    ["parry", 1244],
    ["force", 1164],
    ["unarmed", 1164]);
this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 25
}, {
    obj: "res/xiongdan",
    odds: 5000
}, {
    obj: ["eq/lv0/cloth", "eq/lv0/dao", "eq/lv0/jian", "eq/lv0/tiezhang"],
    odds: 8000
}, {
    obj: ["book/bc#lengyueshengong", "book/bc#hujiadaofa"],
    odds: 3000
});
this.on_enter = function (me) {
    me.notify("黑熊发出一声怒吼，挥起巨大的熊掌朝你拍来！");
    this.do_kill(me);
};
