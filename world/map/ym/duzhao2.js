this.inherits(ROOM);
this.name = "毒沼深处";
this.desc = "毒沼的最深处，瘴气浓郁到遮蔽了视线，脚下的淤泥散发着腐烂的气味。";
this.exits = {"north":"ym/duzhao1","east":"ym/duzhao3","west":"ym/shendi2"};
this.on_enter = function(me) {
    if (!me.is_player) return;
    if (Math.random() < 0.3) {
        me.notify('<red>你陷入了沼泽的淤泥中！</red>');
        me.is_busy = 3000;
    }
};
this.set_npc([]);
