this.inherits(NPC);
this.set({
    name: "东方不败",
    desc: "日月神教教主，一代枭雄。手持绣花针，身法快如鬼魅，葵花神功独步天下。",
    title: "<hiy>日出东方，唯我不败</hiy>",
    gender: 0,
    age: 35,
    per: 5,
    hp: 1170000,
    max_hp: 1170000,
    mp: 226500,
    max_mp: 226500,
    score: 100,
    gj: 66500,
    fy: 43501,
    mz: 86000,
    ds: 49671,
    zj: 2275
});
this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
this.skill_map(
    ["dodge", 2672],
    ["parry", 2824],
    ["force", 2672],
    ["unarmed", 2672],
    ["kuihuashengong", 2672, "force"],
    ["pixiejianfa", 2672, "unarmed"]);
this.set_drop({
    obj: "money/silver",
    min: 100,
    max: 1000
}, {
    obj: ["book/bc#kuihuashengong"],
    odds: 10250
}, {
    obj: ["book/bc#pixiejianfa"],
    odds: 10250
}, {
    obj: ["eq/lv4/xiuhuazhen"],
    odds: 6150
});
this.on_enter = function (me) {
    me.notify("东方不败翘起兰花指，绣花针快如闪电：「日出东方，唯我不败！」");
    this.do_kill(me);
};
