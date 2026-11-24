
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "缚神索",
    desc: "丐帮至宝，缚神灭鬼"
    ,
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 5,
    is_shortcut: true,
    distime: 60000,
    prop: {
        fy: 1276,
        gj: 1276,
        str: 440,
        gj_per: 13,
        busy_per: 17,
        desc: "缚神：使用后束缚房间内所有敌人10秒，群攻cd60s",
    },
});

this.on_use = function (me) {
    var room = me.environment;
    if (!room) {
        me.notify("你不在任何房间中。");
        return false;
    }
    var enemies = room.query_all_enemy(me) || [];
    if (!enemies.length) {
        me.notify("周围没有可以束缚的敌人。");
        return false;
    }
    me.send_room("<HIZ>$N大喝一声，抛出缚神索，将周围敌人尽数束缚！</HIZ>");
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].add_status({
            id: "wushen_fushen",
            name: "<HIZ>缚神</HIZ>",
            desc: "你被缚神索束缚，无法行动",
            is_busy: true,
            duration: 10000,
            downside: true,
            start_msg: "\n<HIZ>$N被缚神索牢牢捆住，动弹不得！</HIZ>",
            finish_msg: "$N挣开了缚神索的束缚。",
        }, me);
    }
    return true;
};
