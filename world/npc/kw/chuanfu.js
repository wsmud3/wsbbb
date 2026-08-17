this.inherits(NPC);
this.set({
    name: "船夫",
    desc: "一位饱经风霜的老船夫，脸色黝黑，双手布满老茧，在此摆渡多年。",
    gender: 1,
    age: 55,
    hp: 5000,
    max_hp: 5000,
    mp: 2000,
    max_mp: 2000,
    score: 10,
    gj: 200,
    fy: 100,
    mz: 100,
    ds: 100,
    zj: -200
});
this.skill_map(
    ["dodge", 200],
    ["force", 200]);

this.on_enter = function (me) {
    me.notify("船夫吆喝道：过江吗？一两银子一位，童叟无欺！");
};
