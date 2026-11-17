this.inherits(ROOM);
this.name = "邀月宫";
this.desc = "这是邀月宫主休息的地方，只见一个身材奇好, 貌美如花的女子站立在<cmd cmd='look hua'>花丛</cmd>中,她就是武功奇高,身份神秘的移花宫大宫主。以前因为被燕南天抛弃所以她非常恨男人，如果你是男人最好不要接近她。";
this.exits = {
    "southeast": "yh/woshi",
    "northeast": "yh/changlang1",
};
this.set_npc(["yh/yaoyue", 1]);

// 原版机制：两宫各自房间描述里有「花丛」，可以点开，记下花朵的数量。
this.set_item("hua", "花丛", "宫墙边一片花丛，花开得正盛。", [
    ["chakan", "查看花丛", function (me) {
        // 每个副本实例只随机一次，存在副本存储里（原来每看一次重随机、且挂在玩家身上跨副本残留）
        var n = this.query_temp(me, "yh_hua_yue");
        if (!n) { n = 3 + Math.floor(Math.random() * 5); this.set_temp(me, "yh_hua_yue", n); }   // 3~7 朵
        me.notify("<hiy>你拨开花丛细数，共有 " + n + " 朵花。</hiy>");
        return true;
    }]
]);

// 两位宫主是否都已伏诛（没杀完谁都别想进卧室、也别想推床）
this.yh_both_dead = function (me) {
    var area = this.parent;   // 房间的区域在 parent 上（房间没有 environment，原写法恒为 false → 进宫出不来）
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
    // 只拦通往卧室的方向；原来任何方向都拦，杀完一位宫主就去不了另一宫（死锁）
    if (dir !== "southeast") return true;
    if (this.yh_both_dead(me)) return true;
    me.notify("<red>两宫之主尚未伏诛，你过不去。</red>");
    return false;
};
