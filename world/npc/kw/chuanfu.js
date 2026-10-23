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
    score: 0,
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
    me.notify("船夫吆喝道：坐船到江对面1两黄金。");
};

// 原版：give <船夫id> 10000 money → 交钱坐船
this.on_accept = function (me, objid, count) {
    if (objid !== "money") return false;
    if (count < 10000) {
        me.notify("<red>船夫摇头：到江对面要 1 两黄金（10000 文）。</red>");
        return false;
    }
    me.set_temp("kw_ferry_paid", 1, 600000);
    me.notify("<hiy>船夫接过船资，撑起竹篙，渡船缓缓向对岸驶去。</hiy>");
    me.moveto("kw/jiang");
    return true;
};
