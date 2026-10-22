this.inherits(ROOM);
this.name = "后厅";
this.desc = "后厅之中，桌上放着一只精致的瓷碗，似是机关。";
this.exits = { "west": "hmy/damen", "south": "hmy/midao" };

// [mech] 后厅的碗：转动打开密道（攻略：到后厅，房间描述「碗」，转动打开密道）
this.set_item("wan", "瓷碗", "桌上放着一只精致的瓷碗，碗底似乎与桌面连在一起，像是可以转动。", [
    ["zhuan", "转动瓷碗", null]
]);
this.midao_open = false;
this.remove_exit("south");

this.add_action("zhuan", null, function (me, arg) {
    if (!me.is_player) return true;
    if (this.midao_open) {
        me.notify("密道已经开了，往南下去便是。");
        return true;
    }
    this.midao_open = true;
    this.add_exit("south", "hmy/midao");
    me.send_room("$N转动瓷碗，桌下传来一阵机关响动，一道向下的石阶显露出来。");
    me.notify("<hig>碗底一转，后厅地面裂开一道石阶——密道开了。</hig>");
    this.exits_changed();
    this.refresh(me);
    return true;
});

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.midao_open && !this.query_exits("south")) {
        this.add_exit("south", "hmy/midao");
    }
};
