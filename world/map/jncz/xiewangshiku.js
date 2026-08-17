this.inherits(ROOM);
this.name = "邪王石窟";
this.desc = "崖底深处隐藏着一座古老的石窟，洞壁上刻满了诡异的符文。一股霸道的气息从石窟深处涌出。前方有一扇沉重的石门，上面刻着「以力证道」四个大字，需要万钧臂力才能推开。";
this.exits = { "east": "jncz/yadi" };
this.set_npc([]);
this.door_opened = false;
this.shizhixuan_spawned = false;

this.add_action("push_stone_door", "推开石门", function(me) {
    if (this.door_opened) {
        me.notify("石门已经被推开了。");
        return true;
    }
    if (me.query_prop("str") + me.str < 10000) {
        me.notify("<red>石门沉重无比，你的臂力不足10000，无法撼动分毫。</red>");
        return true;
    }
    this.door_opened = true;
    // 生成石之轩残魂NPC（请教不死印法交互在NPC身上）
    NPC.CREATE("jncz/shizhixuan", this);
    this.shizhixuan_spawned = true;
    this.remove_action("push_stone_door");
    me.notify("<hig>你运足全身功力，奋力推开沉重的石门！</hig>");
    me.notify("<hiy>一道若有若无的霸道身影从石窟深处浮现——邪王石之轩的残魂！点击他的身影请教不死印法吧。</hiy>");
    this.refresh(me);
    return true;
});

// 离开石窟时石之轩残魂不消失（让玩家可以回来请教）
this.on_leave = function(me, dir) {
    return true;
};
