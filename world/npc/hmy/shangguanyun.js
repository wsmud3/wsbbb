this.inherits(NPC);
this.set({
    name: "上官云",
    desc: "日月神教白虎堂长老，身材魁梧，掌力刚猛。",
    gender: 1,
    age: 45,
    per: 10,
    hp: 690000,
    max_hp: 690000,
    mp: 149600,
    max_mp: 149600,
    score: 65,
    gj: 50175,
    fy: 39196,
    mz: 69025,
    ds: 40672,
    zj: 1400
});
this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/dao", 1, 1]);
this.skill_map(
    ["dodge", 2381],
    ["parry", 2409],
    ["force", 2381],
    ["unarmed", 2381],
    ["blade", 2381]);
this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 150
}, {
    obj: ["eq/lv3/shangguanyunpifeng"],
    odds: 6150
}, {
    obj: ["res/baihulingpai"],
    odds: 10250
});
this.on_enter = function (me) {
    me.notify("上官云喝道：「擅闯白虎堂者，死！」掌力如山压来！");
    this.do_kill(me);
};
