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
