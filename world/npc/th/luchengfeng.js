this.inherits(NPC);
this.set({
    name: "陆乘风",
    desc: "桃花岛弟子，黄药师的传人。手持玉箫，风姿潇洒，武功不凡。",
    gender: 1,
    age: 30,
    per: 20,
    hp: 500000,
    max_hp: 500000,
    mp: 112000,
    max_mp: 112000,
    score: 150,
    gj: 39400,
    fy: 23715,
    mz: 37800,
    ds: 17765,
    zj: 1200
});
this.set_objects([
    "eq/lv4/yuxiao", 1, 1
]);
this.skill_map(
    ["dodge", 2109],
    ["parry", 2032],
    ["force", 2109],
    ["sword", 2109],
    ["unarmed", 2032],
    ["luoyingshenjian", 2109, "sword"],
    ["biboshengong", 2109, "force"],
    ["anyingfuxiang", 2109, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#luoyingshenjian", "book/bc#biboshengong"],
    odds: 8500
}, {
    obj: ["book/bc#anyingfuxiang"],
    odds: 6800
});
this.on_enter = function (me) {
    me.notify("陆乘风横箫而立，朗声道：阁下能破桃花阵，也算有些本事。请赐教！");
    this.do_kill(me);
};
