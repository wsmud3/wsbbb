
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "女娲石",
    desc: "传说中女娲补天遗留下来的一块五彩神石"
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
        desc: "女娲：使用后复活附近所有阵亡的队友，恢复30%气血内力，冷却30分",
    },
});

// 女娲：复活同一房间里阵亡的队友（只限队友），流程与原地复活（relive locale）一致：
// 遵守房间的 no_relive 与 on_relive 限制，发出客户端的复活消息，清掉死亡时的状态后重新进入房间。
// 没有可复活的队友时不生效、不计冷却。
this.on_use = function (me) {
    var room = me.environment;
    if (!room) {
        me.notify("你不在任何房间中。");
        return false;
    }
    if (room.no_relive || me.is_in("yz/leitai/leitai")) {
        me.notify("这里不能复活。");
        return false;
    }
    var team = me.team || [];
    var dead = [];
    for (var i = 0; i < team.length; i++) {
        var p = team[i];
        if (!p || p === me || !p.is_player || !(p.hp <= 0) || p.environment !== room) continue;
        if (p.query_temp("relive")) continue; // 已在用天师符等待复活
        dead.push(p);
    }
    if (!dead.length) {
        me.notify("附近没有需要复活的队友。");
        return false;
    }
    var count = 0;
    for (var j = 0; j < dead.length; j++) {
        var q = dead[j];
        if (room.on_relive && room.on_relive(q, true) === false) continue;
        q.die = USER.prototype.die;
        q.clear_status();
        q.hp = Math.max(1, Math.floor(q.max_hp * 0.3));
        q.mp = Math.floor(q.max_mp * 0.3);
        q.notify('{type:"die",relive:true}');
        if (q.force_skill && q.force_skill.on_relive) q.force_skill.on_relive(q);
        q.environment = null;
        q.moveto(room, null, "<HIZ>" + q.name + "沐浴在五彩神光之中，重新站了起来。</HIZ>");
        q.notify_hp && q.notify_hp();
        if (q.restore_item_buffs) q.restore_item_buffs();
        q.send("<HIZ>你被女娲石的五彩神光复活了！</HIZ>");
        count++;
    }
    if (!count) {
        me.notify("附近没有可以复活的队友。");
        return false;
    }
    me.send_room("<HIZ>$N举起女娲石，五彩神光照耀四方，阵亡的同伴纷纷复活！</HIZ>");
    return true;
};
