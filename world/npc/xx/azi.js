this.inherits(NPC);
this.set({
    name: "阿紫",
    desc: "星宿派小师妹，虽是男儿身却喜作女装打扮，妖冶异常。",
    gender: 1,
    age: 20,
    per: 22,
    hp: 357000,
    max_hp: 357000,
    mp: 129000,
    max_mp: 129000,
    score: 90,
    gj: 38010,
    fy: 18497,
    mz: 38850,
    ds: 26302,
    zj: 775
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
    obj: ["eq/lv3/bilinzhen"],
    odds: 8850
}, {
    obj: ["book/bc#zhaixinggong"],
    odds: 7080
});
this.on_enter = function (me) {
    me.notify("阿紫掩嘴笑道：又来一个不知死的，让本姑娘陪你玩玩！");
    this.do_kill(me);
};
