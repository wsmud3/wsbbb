this.inherits(COMMAND);
this.command = "zhizuo";

this.enter = function (player, arg) {
    var rm = player.environment;
    if (!rm) return;
    if (rm.items) {
        for (var i = 0; i < rm.items.length; i++) {
            if (rm.items[i] && rm.items[i].on_zhizuo) {
                rm.items[i].on_zhizuo(player, arg);
                return;
            }
        }
    }
    player.notify("这里没有杂货店老板。");
};
