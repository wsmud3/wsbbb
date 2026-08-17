this.inherits(NPC);
this.set({
    name: "定静师太",
    desc: "一位中年尼姑，面容慈悲，手持拂尘，身披灰色僧袍。她乃是恒山派定字辈的高手，剑法精妙，佛法精深。定静师太性情沉静，武功以柔克刚，是恒山三定之一。",
    title: "恒山派首座",
    gender: 2,
    age: 48,
    hp: 124800,
    max_hp: 124800,
    mp: 57900,
    max_mp: 57900,
    score: 40,
    gj: 14480,
    fy: 8037,
    mz: 14640,
    ds: 7072,
    zj: 715
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv0/shoes", 1, 1,
    "eq/lv1/fuchen", 1, 1
]);
this.skill_map(
    ["dodge", 1352],
    ["parry", 1352],
    ["force", 1352],
    ["unarmed", 1352],
    ["sword", 1352],
    ["hengshanshenfa", 1352, "dodge"],    ["hengshanjianfa", 1352], ["parry", 1352, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 15,
    max: 40
}, {
    obj: ["book/bc#hengshanjianfa", ],
    odds: 7100
}, {
    obj: ["eq/lv0/cloth", "eq/lv0/shoes"],
    odds: 4260
});
this.on_enter = function (me) {
    me.notify("定静师太眉头微皱：施主杀气太重，贫尼来度化于你！");
    this.do_kill(me);
};
