this.inherits(ROOM);
this.name = "后殿";
this.desc = "后厅之中，桌上放着一只精致的<span cmd='look wan'>瓷碗</span>，似是机关。";
this.exits = { "west": "hmy/chengdedian" };

// [mech] 后厅的碗：转动打开密道（攻略：到后厅，房间描述「碗」，转动打开密道）
//   密道 hmy/midao1 的回路是 south → 这里，所以打开的是 north。
//   描述里的瓷碗必须可点（cmd='look wan'），否则看不到「转动瓷碗」按钮，进不了东方不败那边。
function hmy_turn_bowl(me) {
    if (!me.is_player) return true;
    if (this.query_exits("north")) {
        me.notify("密道已经开了，往北进去便是。");
        return true;
    }
    this.add_exit("north", "hmy/midao1");
    me.send_room("$N转动瓷碗，桌下传来一阵机关响动，一道石阶显露出来。");
    me.notify("<hig>碗底一转，后厅北面的地面缓缓裂开，露出一道向下的石阶。</hig>");
    this.refresh(me);
    return true;
}
this.set_item("wan", "瓷碗", "桌上放着一只精致的瓷碗，碗底似乎与桌面连在一起，像是可以转动。", [
    ["zhuan", "转动瓷碗", hmy_turn_bowl]
]);
