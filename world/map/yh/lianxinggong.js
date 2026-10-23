this.inherits(ROOM);
this.name = "涟星宫";
this.desc = "这是涟星宫主休息的地方，只见一个身材奇好,貌美如花的女子站立在<cmd cmd='look hua'>花丛</cmd>中,她就是武功奇高,身份神秘的移花宫二宫主。以前因为她的姐姐邀月宫主被燕南天抛弃所以她非常恨男人，如果你是男人最好不要接近她。";
this.exits = {
    "southwest": "yh/woshi",
    "northwest": "yh/changlang1",
};
this.set_npc(["yh/lianxing", 1]);

// 原版机制：两宫各自房间描述里有「花丛」，可以点开，记下花朵的数量。
this.set_item("hua", "花丛", "宫墙边一片花丛，花开得正盛。", [
    ["chakan", "查看花丛", function (me) {
        var n = 3 + Math.floor(Math.random() * 5);   // 3~7 朵
        me.set_temp("yh_hua_xing", n, 7200000);
        me.notify("<hiy>你拨开花丛细数，共有 " + n + " 朵花。</hiy>");
        return true;
    }]
]);

// 两位宫主是否都已伏诛（没杀完谁都别想进卧室、也别想推床）
this.yh_both_dead = function (me) {
    var area = this.environment && this.environment.parent;
    if (!area || !area.rooms) return false;
    var team = me && me.query_teamid ? me.query_teamid() : null;
    var yue = false, xing = false;
    for (var i = 0; i < area.rooms.length; i++) {
        var cp = area.rooms[i].query_copy(team);
        if (!cp || !cp.items) continue;
        for (var j = 0; j < cp.items.length; j++) {
            var o = cp.items[j];
            if (!o || o.is_player) continue;
            if (o.path === "yh/yaoyue" && o.hp > 0) yue = true;
            if (o.path === "yh/lianxing" && o.hp > 0) xing = true;
        }
    }
    return !yue && !xing;
};

this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (!dir) return true;
    if (this.yh_both_dead(me)) return true;
    me.notify("<red>两宫之主尚未伏诛，你过不去。</red>");
    return false;
};
