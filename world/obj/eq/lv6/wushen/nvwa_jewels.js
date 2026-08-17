
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "女娲石",
    desc: "传说中女娲补天遗留下来的一块五彩神石\n特效：女娲：使用后复活附近所有阵亡的队友，恢复30%气血内力，冷却30分"
    ,
    unit: "个",
    eq_type: EQUIP_TYPE.JEWELS,
    hole_count: 5,
    is_shortcut: true,
    distime: 1800000,
    prop: {
        lianxi_per: 247,
        dazuo_per: 247,
        hp_per: 27,
        con: 440,
        int: 440,
    },
});

this.on_use = function (me) {
    var room = me.environment;
    if (!room) return me.notify("你不在任何房间中。");
    var count = 0;
    for (var i = 0; i < WORLD.USERS.length; i++) {
        var p = WORLD.USERS[i];
        if (p.hp <= 0 && p.environment == room && p != me) {
            p.hp = Math.max(1, Math.floor(p.max_hp * 0.3));
            p.mp = Math.floor(p.max_mp * 0.3);
            p.notify_hp();
            p.clear_downside();
            room.item_changed(p, true);
            p.send("<HIZ>你被女娲石的五彩神光复活了！</HIZ>");
            count++;
        }
    }
    if (count > 0) {
        me.send_room("<HIZ>$N举起女娲石，五彩神光照耀四方，周围的死者纷纷复活！</HIZ>");
    } else {
        me.notify("附近没有需要复活的玩家。");
    }
    return true;
};
