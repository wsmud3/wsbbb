this.inherits(ROOM);
this.name = "寒玉床室";
this.desc = "一间寒气逼人的石室，正中摆放着一张巨大的寒玉床，散发出的寒气让整个房间如坠冰窖。";
this.exits = {"west":"gm2/houtang","north":"gm2/hanyuchuang2"};
this.on_enter = function(me) {
    if (!me.is_player) return;
    me.add_status({
        id: 'hanyu_buff', name: '寒玉床修炼', duration: 0,
        desc: '寒玉床的寒气让你内力回复速度翻倍，但移动变得迟缓。',
        prop: { mp_recover_per: 200, ds_per: -50 }
    });
};
this.set_npc([]);
