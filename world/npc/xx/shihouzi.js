this.inherits(NPC);
this.set({
    name: "狮吼子",
    desc: "星宿派二师兄，此人功力深厚，是三阴蜈蚣爪的传人。",
    gender: 1,
    age: 31,
    per: 7,
    hp: 613200,
    max_hp: 613200,
    mp: 130400,
    max_mp: 130400,
    score: 160,
    gj: 48153,
    fy: 26762,
    mz: 51702,
    ds: 35117,
    zj: 1085
});
this.skill_map(
    ["dodge", 2409],
    ["parry", 2332],
    ["force", 2409],
    ["unarmed", 2409],
    ["sanyinwugongzhao", 2409, "unarmed"],
    ["huagongdafa", 2458, "force"]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#sanyinwugongzhao", "book/bc#huagongdafa"],
    odds: 8850
});
this.on_enter = function (me) {
    me.notify("狮吼子怒吼道：想过此处，先接我一招三阴蜈蚣爪！");
    this.do_kill(me);
};
