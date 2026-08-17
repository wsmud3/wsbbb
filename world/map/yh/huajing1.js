this.inherits(ROOM);
this.name = "花径";
this.desc = "一条铺满花瓣的小径，花香浓郁得令人头晕。两旁的绣球花开得正盛，美得令人心醉，却也暗藏杀机。\n四面八方都是看似相同的花径，只有朝着同一方向连续前进五步，才能走出这片迷花阵。";
this.exits = {"north":"yh/huajing2","south":"yh/huajing3","east":"yh/huajing4","west":"yh/huajing2"};

this.no_fight = true;
this.on_enter = function(me) {
    if (!me.is_player) return;
    var dir = me.query_temp('hj_last_dir') || '';
    var count = me.query_temp('hj_count') || 0;

    // 每步扣除5%当前气血
    var drain = Math.floor(me.hp * 0.05);
    if (drain > 0) {
        me.add_hp(-drain);
        me.notify('<red>花香之毒侵蚀着你的身体，你失去了' + drain + '点气血。</red>');
    }
    // 5步同方向 = 逃出
    if (count >= 5) {
        me.remove_temp('hj_last_dir');
        me.remove_temp('hj_count');
        me.notify('<hig>你终于走出了花径！虽然花香仍在体内残留，但前路已经清晰。</hig>');
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
