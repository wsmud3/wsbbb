this.inherits(ROOM);
this.name = "宫主卧室";
this.desc = "这里是移花宫两位宫主的卧室。这里到处都充满了花香，使你陶醉其中。床铺也是装饰的像花床一样。你仔细的看了一下<cmd cmd='look bed'>床(bed)</cmd>，似乎有点不对劲，你凑上前去看了一下。";
this.exits = {
    "northwest": "yh/yaoyuegong",
    "northeast": "yh/lianxinggong",
};
this.set_npc([]);

// 原版机制：卧室里的床可以点，左边宫里几朵花就向左移动几下，右边几朵就向右几下，会出现暗道。
this.set_item("chuang", "床", "一张宽大的绣榻。", [
    ["yidong", "移动床", function (me) {
        var l = me.query_temp("yh_hua_yue") || 0;
        var r = me.query_temp("yh_hua_xing") || 0;
        if (!l && !r) {
            me.notify("<red>你还没看过邀月宫和涟星宫的花丛，不知道要移几下。</red>");
            return true;
        }
        me.send_room("$N依着花数把绣榻向左移了 " + l + " 下、向右移了 " + r + " 下。");
        me.set_temp("yh_anmen", 1, 7200000);
        me.notify("<hig>床后墙上裂开一道暗道入口。</hig>");
        me.send_commands("enter andao", "进入暗道");
        return true;
    }]
]);
this.add_action("enter", null, function (me, arg) {
    if (!me.is_player) return true;
    if (arg !== "andao") return false;
    if (!me.query_temp("yh_anmen")) {
        me.notify("墙上没有门。");
        return true;
    }
    me.moveto("yh/andao", me.name + "钻进暗道。", me.name + "从暗道另一头钻出来。");
    return true;
});
