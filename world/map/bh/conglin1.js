this.inherits(ROOM);
this.name = "丛林";
this.desc = "一片茂密的原始丛林，树木参天，时有野兽的嚎叫。";
this.exits = { "west": "bh/haiyanshi", "east": "bh/conglin2" };
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
this.set_npc(["bh/baixiong", 1]);
