this.inherits(ROOM);
this.name = "毒沼";
this.desc = "一片冒着气泡的墨绿色沼泽，浓郁的瘴气几乎凝成了雾。每走一步都要小心陷入泥潭。";
this.exits = {"west":"ym/shendi1","south":"ym/duzhao2"};
this.on_enter = function(me) {
    if (!me.is_player) return;
    if (Math.random() < 0.3) {
        me.notify('<red>你陷入了沼泽的淤泥中！</red>');
        me.is_busy = 3000;
    }
};
this.set_npc([]);
