this.inherits(ROOM);
this.name = "后厅";
this.desc = "这里是慕容家里商议事情的地方，不是慕容弟子最好不要到这里来。在后堂正中摆放着一个香案，上面摆放着一个<cmd cmd='look pai'>灵位牌子</cmd>，在正中墙上挂着一幅百鸟朝奉图，边墙上挂着一口宝剑。东西两面各是一间厢房，南面是内堂。";
this.exits = {
    "south": "yz2/dating",
    "east": "yz2/neitang",
};
this.set_npc(["yz2/abih", 1]);

// 原版机制（攻略第 24 节）：
//   后亭房间描述「灵位牌子」，点击并拜祭 3 次会出现还施水阁；
//   在还施水阁搜索拿到残页后回后亭，慕容博会出现并叫杀，杀他 = 100%。
this.set_item("lingpai", "灵位牌子", "神龛上供着一块灵位牌子，牌前香烟袅袅。", [
    ["bai", "拜祭", function (me) {
        var n = (me.query_temp("yz2_bai") || 0) + 1;
        me.set_temp("yz2_bai", n, 7200000);
        if (n < 3) {
            me.send_room("$N对着灵位牌子拜了三拜（第 " + n + " 次）。");
            me.notify("<hiy>香火晃动了一下，似乎还差几拜。</hiy>");
            return true;
        }
        me.remove_temp("yz2_bai");
        me.send_room("$N第三次拜下，神龛后轰然裂开一道门户——还施水阁出现了！");
        me.notify("<hig>还施水阁的门开了。</hig>");
        me.send_commands("enterhuanshi", "进入还施水阁");
        return true;
    }]
]);
this.add_action("enter", null, function (me, arg) {
    if (!me.is_player) return true;
    if (arg !== "huanshi") return false;
    me.moveto("yz2/huanshi", me.name + "钻进神龛后的门户。", me.name + "从神龛后走了进来。");
    return true;
});
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (!me.query_temp("yz2_shushi")) return;
    if (me.query_temp("yz2_boss")) return;
    me.set_temp("yz2_boss", 1, 7200000);
    var n = NPC.CREATE("yz2/murongbo", this);
    if (n) {
        this.send_room("$N从水阁里出来，后厅中已多了一个白衣老者——慕容博！");
        n.do_kill(me);
    }
};
