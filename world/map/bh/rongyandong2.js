this.inherits(ROOM);
this.name = "熔岩洞深处";
this.desc = "熔岩洞的深处更加酷热，洞壁被岩浆映得通红，脚下的岩石滚烫难耐。";
this.exits = {"south":"bh/rongyandong1","north":"bh/rongyandong3"};
this.on_enter = function(me) {
    if (!me.is_player) return;
    me.set_temp('bh_fire_stack', (me.query_temp('bh_fire_stack') || 0) + 1);
    if (me.query_temp('bh_fire_stack') > 5) me.set_temp('bh_fire_stack', 5);
    me.add_status({
        id: 'bh_fire', name: '灼热', duration: 20000,
        desc: '灼热难耐(' + me.query_temp('bh_fire_stack') + '层), 每3秒扣' + (me.query_temp('bh_fire_stack') * 2) + '%当前HP'
    });
};
this.set_npc([]);
