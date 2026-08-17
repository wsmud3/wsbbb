this.inherits(ROOM);
this.name = "熔岩洞";
this.desc = "炽热的熔岩洞，岩浆在脚下缓缓流淌，空气中弥漫着硫磺的气味。热浪扑面而来，让人喘不过气。";
this.exits = {"south":"bh/huoshanjiaoxia","north":"bh/rongyandong2"};
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
