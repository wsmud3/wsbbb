this.inherits(NPC);
this.set({
    name: "温老大",
    desc: "温家五兄弟之首，身材高大，面目狰狞，一双鹰目精光四射，显然内力修为颇为不弱。他手持一杆八卦棍，浑身散发着一股阴狠之气。",
    title: "温家五虎之首",
    gender: 1,
    age: 42,
    hp: 134680,
    max_hp: 134680,
    mp: 53000,
    max_mp: 53000,
    score: 10,
    gj: 13230,
    fy: 6426,
    mz: 10570,
    ds: 7117,
    zj: 720
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv0/shoes", 1, 1,
    "eq/lv1/qimeigun", 1, 1
]);
this.skill_map(
    ["dodge", 1160],
    ["parry", 1160],
    ["force", 1160],
    ["unarmed", 1160],
    ["club", 1160],
    ["wuduyanluobu", 1160, "dodge"],
    ["wudushengong", 1160, "force"],
    ["baguaquan", 1160, "unarmed"],
    ["staff", 1160],
    ["baguagunfa", 1160, "staff"]);

this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
}, {
    obj: ["book/bc#baguaquan", "book/bc#baguagunfa"],
    odds: 6400
}, {
    obj: ["eq/lv1/qimeigun", "eq/lv0/cloth"],
    odds: 3840
});
this.on_enter = function (me) {
    me.notify("温老大冷笑一声：敢闯温府，找死！看棍！");
    this.do_kill(me);
};
