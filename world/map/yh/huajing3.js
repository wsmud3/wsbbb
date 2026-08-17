this.inherits(ROOM);
this.name = "花径";
this.desc = "花径的中间，四周的花朵似乎都在注视着你。你分不清这眩晕是来自花香，还是来自这诡异的美景。";
this.exits = {"north":"yh/huajing4","south":"yh/huajing2","east":"yh/huajing1","west":"yh/huajing4"};

this.no_fight = true;
this.on_enter = function(me) {
    if (!me.is_player) return;
    var count = me.query_temp('hj_count') || 0;
    var drain = Math.floor(me.hp * 0.05);
    if (drain > 0) {
        me.add_hp(-drain);
        me.notify('<red>花香之毒侵蚀着你的身体，你失去了' + drain + '点气血。</red>');
    }
    if (count >= 5) {
        me.remove_temp('hj_last_dir');
        me.remove_temp('hj_count');
        me.notify('<hig>你终于走出了花径！</hig>');
        me.moveto('yh/qianting', me.name + '走出了花径。', me.name + '从花径中走来。');
    }
};
this.on_leave = function(me, dir) {
    if (!me.is_player) return true;
    var lastDir = me.query_temp('hj_last_dir') || '';
    if (lastDir === dir) {
        me.add_temp('hj_count', 1);
    } else {
        me.set_temp('hj_count', 1);
        if (lastDir) {
            var extra = Math.floor(me.hp * 0.10);
            me.add_hp(-extra);
            me.notify('<red>你改变了方向，花香之毒加剧！额外失去' + extra + '点气血。</red>');
        }
    }
    me.set_temp('hj_last_dir', dir);
    return true;
};

