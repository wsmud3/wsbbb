this.inherits(ROOM);
this.name = "火山脚下";
this.desc = "火山脚下，硫磺的气味弥漫在空气中。西面的火山口喷吐着浓烟。";
this.exits = { "west": "bh/huoshan", "east": "bh/huoshanlu2" };
this.on_enter = function(me) {
    if (!me.is_player) return;
    me.set_temp('bh_fire_stack', (me.query_temp('bh_fire_stack') || 0) + 1);
    if (me.query_temp('bh_fire_stack') > 5) me.set_temp('bh_fire_stack', 5);
    me.add_status({
        id: 'bh_fire', name: '灼热', duration: 20000,
        desc: '灼热难耐(' + me.query_temp('bh_fire_stack') + '层), 每3秒扣' + (me.query_temp('bh_fire_stack') * 2) + '%当前HP'
    });
};
this.set_npc(["bh/yanlongwang", 1]);
