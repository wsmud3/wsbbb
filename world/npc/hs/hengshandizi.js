this.inherits(NPC);
this.set({
    name: "恒山弟子",
    desc: "一位年轻的恒山派女弟子，身着素衣，手持长剑，面容清秀。她正专心致志地在山道间巡视。",
    title: "恒山派弟子",
    gender: 2,
    age: 20,
    per: 22,
    hp: 80000,
    max_hp: 80000,
    mp: 38500,
    max_mp: 38500,
    score: 30,
    gj: 8880,
    fy: 5623,
    mz: 7248,
    ds: 4942,
    zj: 650
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 1052],
    ["parry", 1052],
    ["force", 1052],
    ["sword", 1052],
    ["hengshanjianfa", 1052, "sword"],
    ["hengshanshenfa", 1052, "dodge"],
    ["baiyunxinfa", 1052, "force"]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 30},
    {obj: ["book/bc#hengshanjianfa", "book/bc#hengshanshenfa", "book/bc#baiyunxinfa"], odds: 4260}
);
this.on_enter = function (me) {
    me.notify("恒山弟子拔出长剑，喝道：何方狂徒，擅闯恒山派！");
    this.do_kill(me);
};
