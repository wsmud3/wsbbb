this.inherits(ROOM);
this.name = "毒沼边缘";
this.desc = "沼泽的边缘地带，虽然仍有瘴气，但地面已经坚实了许多。前方隐约可见干地。";
this.exits = {"west":"ym/duzhao2","south":"ym/gandi"};
this.on_enter = function(me) {
    if (!me.is_player) return;
    if (Math.random() < 0.3) {
        me.notify('<red>你陷入了沼泽的淤泥中！</red>');
        me.is_busy = 3000;
    }
};
this.set_npc([]);
