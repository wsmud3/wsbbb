this.inherits(ROOM);
this.name = "寒玉密室";
this.desc = "寒玉床室的内间，寒气更甚，墙壁上结满了冰霜。在此修炼内功事半功倍。";
this.exits = {"south":"gm2/hanyuchuang1","east":"gm2/hanyumishi"};
this.on_enter = function(me) {
    if (!me.is_player) return;
    me.add_status({
        id: 'hanyu_buff', name: '寒玉床修炼', duration: 0,
        desc: '寒玉床的寒气让你内力回复速度翻倍，但移动变得迟缓。',
        prop: { mp_recover_per: 200, ds_per: -50 }
    });
};
this.set_npc([]);
