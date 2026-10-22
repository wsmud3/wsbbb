this.inherits(NPC);
this.set({
    name: "温老大",
    desc: "温府的家主，性情暴烈。他一心护着温家，却也怕温家五老成阵后六亲不认。",
    title: "温府家主",
    gender: 1,
    age: 55,
    per: 10,
    hp: 60000,
    max_hp: 60000,
    mp: 30000,
    max_mp: 30000,
    score: 0,
    gj: 6000,
    fy: 4500,
    mz: 6500,
    ds: 4000,
    zj: 600
});
this.set_objects([
    "eq/lv0/cloth", 1, 1
]);
this.skill_map(
    ["dodge", 800],
    ["parry", 800],
    ["force", 800],
    ["blade", 800],
    ["baguaquan", 800, "unarmed"],
    ["baguagunfa", 800, "staff"]
);
this.on_enter = function (me) {
    me.notify("温老大怒道：哪里来的小辈，也敢闯我温府！");
    this.do_kill(me);
};
