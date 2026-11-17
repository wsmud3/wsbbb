this.inherits(NPC);
this.set({
    name: "何红药",
    desc: "一个身着红衣的中年女子，脸上覆着一张诡异的面具，只露出两只冰冷的眼睛。她便是五毒教的前教主何红药，功力深厚，手段狠辣。据说她那张面具之下，是一张早已被毒物腐蚀得不成人形的脸。",
    title: "五毒教主",
    gender: 2,
    age: 45,
    hp: 255000,
    max_hp: 255000,
    mp: 94600,
    max_mp: 94600,
    score: 55,
    gj: 12500,
    fy: 6500,
    mz: 11790,
    ds: 7000,
    zj: 448
});
this.set_objects([
    "eq/lv2/hs_qin", 1, 1,
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_shoes", 1, 1
]);
this.skill_map(
    ["dodge", 1420],
    ["parry", 1420],
    ["force", 1420],
    ["unarmed", 1420],
    ["wuduyanluobu", 1420, "dodge"],
    ["wudushengong", 1420, "force"],
    ["qianzhuwandushou", 1420, "unarmed"],
    ["wudugoufa", 1420, "parry"]);

this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 70
}, {
    obj: ["book/bc#wudushengong", "book/bc#qianzhuwandushou", "book/bc#wuduyanluobu"],
    odds: 5000
}, {
    obj: ["eq/lv2/wd_mianju"],
    odds: 1500
});
this.on_enter = function (me) {
    me.notify("何红药发出一阵刺耳的怪笑：哈哈哈哈！又一个不要命的！既然来了，就留下做我五毒教的药人吧！");
    this.do_kill(me);
};
