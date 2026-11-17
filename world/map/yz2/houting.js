this.inherits(ROOM);
this.name = "后厅";
this.desc = "这里是慕容家里商议事情的地方，不是慕容弟子最好不要到这里来。在后堂正中摆放着一个香案，上面摆放着一个<cmd cmd='look lingpai'>灵位牌子</cmd>，在正中墙上挂着一幅百鸟朝奉图，边墙上挂着一口宝剑。东西两面各是一间厢房，南面是内堂。";
this.exits = {
    "south": "yz2/dating",
    "east": "yz2/neitang",
};
this.set_npc(["yz2/abih", 1]);

// 原版机制（攻略第 24 节）：
//   后亭房间描述「灵位牌子」，点击并拜祭 3 次会出现还施水阁；
//   在还施水阁搜索拿到残页后回后亭，慕容博会出现并叫杀，杀他 = 100%。
// 进度全部存在副本存储（this.set_temp(me, …)）：随副本销毁，不会像玩家 temp 那样
// 残留 2 小时，导致同一角色重刷时慕容博不再出现、完成度只能 0%。
this.set_item("lingpai", "灵位牌子", "神龛上供着一块灵位牌子，牌前香烟袅袅。", [
    ["bai", "拜祭", function (me) {
        if (!me.is_player) return true;
        if (this.query_temp(me, "yz2_open")) {
            me.send_commands("enter huanshi", "进入还施水阁");
            return true;
        }
        var n = this.add_temp(me, "yz2_bai", 1);
        if (n < 3) {
            me.send_room("$N对着灵位牌子恭恭敬敬地拜了下去。");
            me.notify("<hiy>香火晃动了一下，似乎还差几拜。</hiy>");
            return true;
        }
        this.set_temp(me, "yz2_open", 1);
        me.send_room("$N第三次拜下，神龛后轰然裂开一道门户——还施水阁出现了！");
        me.notify("<hig>还施水阁的门开了。</hig>");
        me.send_commands("enter huanshi", "进入还施水阁");
        return true;
    }]
]);
this.add_action("enter", null, function (me, arg) {
    if (!me.is_player) return true;
    if (arg !== "huanshi") return false;
    if (!this.query_temp(me, "yz2_open")) {
        me.notify("神龛后面是一堵实墙，你找不到进去的门户。");
        return true;
    }
    me.moveto("yz2/huanshi", me.name + "钻进神龛后的门户。", me.name + "从神龛后走了进来。");
    return true;
});
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (!this.query_temp(me, "yz2_searched")) return;
    if (this.query_temp(me, "yz2_boss")) return;
    this.set_temp(me, "yz2_boss", 1);
    NPC.CREATE("yz2/murongbo", this);
    this.refresh(me);
    var n = this.find_obj_bypath("yz2/murongbo");
    this.send_room("<hir>" + me.name + "从水阁里出来，后厅中已多了一个白衣老者——慕容博！</hir>");
    if (n && n.do_kill) n.do_kill(me);
};
