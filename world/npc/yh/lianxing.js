this.inherits(NPC);
this.set({
    name: "涟星",
    desc: "移花宫二宫主，温柔似水，但武功丝毫不逊于邀月。",
    title: "<hiy>移花宫主·涟星</hiy>",
    gender: 0,
    age: 32,
    per: 22,
    hp: 924600,
    max_hp: 924600,
    mp: 262500,
    max_mp: 262500,
    score: 85,
    gj: 73140,
    fy: 39995,
    mz: 64400,
    ds: 40129,
    zj: 1650
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2440],
    ["parry", 2592],
    ["force", 2440],
    ["sword", 2440],
    ["mingyugong", 2440, "force"],
    ["yihuajiemu", 2592, "parry"],
    ["yifengjianfa", 2440, "sword"]);
this.set_drop({
    obj: "money/silver",
    min: 25,
    max: 250
}, {
    obj: ["book/bc#yifengjianfa"],
    odds: 9550
}, {
    obj: ["eq/lv3/lianxing_bingyuzan"],
    odds: 5730
});
this.on_enter = function (me) {
    me.notify("涟星宫主微微一笑，剑光如涟如星，霎时笼罩四周！");
    this.do_kill(me);
};
