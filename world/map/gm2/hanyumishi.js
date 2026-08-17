this.inherits(ROOM);
this.name = "寒玉密室尽头";
this.desc = "据说这里是林朝英闭关修炼之所，寒玉床的寒气能让内力在体内流转得更快。";
this.exits = {"west":"gm2/hanyuchuang2","south":"gm2/qinshi"};
this.on_enter = function(me) {
    if (!me.is_player) return;
    me.add_status({
        id: 'hanyu_buff', name: '寒玉床修炼', duration: 0,
        desc: '寒玉床的寒气让你内力回复速度翻倍，但移动变得迟缓。',
        prop: { mp_recover_per: 200, ds_per: -50 }
    });
};
this.set_npc([]);
