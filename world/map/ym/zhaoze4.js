this.inherits(ROOM);
this.name = "云梦沼泽";
this.desc = "你眼前是一片一望无际的芦苇荡。眺望远处，芦苇一直连接到天边，天空显得特别低矮。芦苇中的水洼发出阵阵的恶臭。水里和<cmd cmd='look lu'>芦苇</cmd>中似乎有些东西在爬动。身临此地，使人感到一股莫名的恐惧。";
this.exits = {
};
// 原版机制（实测）：描述里「芦苇」可点，砍开后才出现 north → 洪荒古泽
this.set_item("lu", "芦苇", "这是一片看上去无边无际的芦苇荡，到这里似乎无路可走了。", [
    ["kan", "砍开", function (me) {
        if (!me.is_player) return true;
        me.send_room("$N对着芦苇丛一阵乱砍。$N累得气喘吁吁，终于砍出一条小路。");
        this.add_exit("north", "ym/huozhao1");
        me.notify("<hig>芦苇被砍出一条小路，北面可以走了。</hig>");
        return true;
    }]
]);
this.set_npc(["ym/auto_2", 1]);
this.set_npc(["ym/auto_2", 1]);
