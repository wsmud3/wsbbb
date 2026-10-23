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
    if (!me.is_player) return;
    if (me.environment && me.environment.path === "kw/chuanchang")
        me.notify("船夫吆喝道：客官要回对岸吗？要过江随时招呼我。");
    else
        me.notify("船夫吆喝道：江面水急，坐船到江对面 1 两黄金。");
};

// 原版：give <船夫id> 10000 money → 交钱坐船。
// 钱由 give 命令扣（回来之后再扣），这里只判断数目对不对，
// 多给的当场退回去，然后把玩家送上去走同一段 10 秒航程。
this.on_accept = function (me, objid, count) {
    if (objid !== "money") return false;
    if (!me.is_player) return false;
    if (count < 10000) {
        me.notify("<red>船夫摇头：到江对面要 1 两黄金（10000 文）。</red>");
        return false;
    }
    if (count > 10000) me.add_money(count - 10000);   // 多给的退回，只收 1 两
    var from = (me.environment && me.environment.path) || "";
    if (from !== "kw/damen" && from !== "kw/chuanchang") {
        me.notify("船夫把银子推回来：这里没水，坐什么船。");
        return false;
    }
    me.notify("<hiy>船夫接过船资，撑起竹篙，渡船缓缓离岸。</hiy>");
    me.set_temp("kw_on_boat", 1, 60000);
    if (me.moveto("kw/jiang", me.name + "登上了渡船。", me.name + "被人扶上了渡船。") === false) {
        me.remove_temp("kw_on_boat");
        return true;
    }
    var to = (from === "kw/chuanchang") ? "kw/damen" : "kw/chuanchang";
    if (me.environment && me.environment.start_ride)
        me.environment.start_ride(me, to);
    return true;
};
