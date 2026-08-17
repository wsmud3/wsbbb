this.inherits(ROOM);
this.name = "冰谷深处";
this.desc = "冰谷的深处更加寒冷，脚下是万年不化的坚冰，四周的冰柱折射出幽蓝的光芒。";
this.exits = {"south":"bh/binggu1","north":"bh/binggu3"};
this.on_enter = function(me) {
    if (!me.is_player) return;
    me.set_temp('bh_ice_stack', (me.query_temp('bh_ice_stack') || 0) + 1);
    if (me.query_temp('bh_ice_stack') > 5) me.set_temp('bh_ice_stack', 5);
    me.add_status({
        id: 'bh_ice', name: '寒气入体', duration: 20000,
        desc: '寒气已侵入骨髓(' + me.query_temp('bh_ice_stack') + '层)',
        prop: { gj_per: -(me.query_temp('bh_ice_stack') * 3), ds_per: -(me.query_temp('bh_ice_stack') * 2) }
    });
};
this.set_npc([]);
