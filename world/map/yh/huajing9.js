this.inherits(ROOM);
this.name = "花径";
this.desc = "你走在移花宫的花径之中，四周繁花似锦，香气袭人。\n然而这花径宛如迷宫，岔路极多，每走一步都让人头晕目眩。";
this.exits = {"n":"yh/huajing7","s":"yh/huajing5","e":"yh/huajing3","w":"yh/huajing2"};

this.on_leave = function(me, dir) {
    var drain = Math.max(1, Math.floor(me.max_hp * 0.03));
    me.add_hp(-drain);
    me.send_room(me.name + "在花径中穿行，脸色微微发白。");
    var lastDir = me.query_temp("yh_huajing_dir", "");
    var count = me.query_temp("yh_huajing_count", 0);
    if (dir === lastDir) {
        count++;
        me.set_temp("yh_huajing_count", count);
    } else {
        count = 0;
        me.set_temp("yh_huajing_dir", dir);
        me.set_temp("yh_huajing_count", 0);
    }
    if (count >= 2) {
        me.remove_temp("yh_huajing_dir");
        me.remove_temp("yh_huajing_count");
        me.notify("<hig>你终于看破了花径的规律，前方出现了出口！</hig>");
        var qianting = ROOM.Get("yh/qianting");
        if (qianting) {
            me.moveto(qianting, me.name + "穿过花径，进入了移花宫。");
            return false;
        }
    }
    return true;
};