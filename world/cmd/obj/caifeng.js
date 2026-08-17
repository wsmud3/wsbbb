this.inherits(COMMAND);
this.command = "caifeng";

this.enter = function (player, arg) {
    var rm = player.environment;
    if (!rm) return;
    var npc = rm.find_by_path ? rm.find_by_path("yz/zeng") : null;
    if (!npc) {
        // Try to find any NPC with on_caifeng
        if (rm.items) {
            for (var i = 0; i < rm.items.length; i++) {
                if (rm.items[i] && rm.items[i].on_caifeng) {
                    rm.items[i].on_caifeng(player, arg);
                    return;
                }
            }
        }
        player.notify("这里没有裁缝。");
        return;
    }
    npc.on_caifeng(player, arg);
};
