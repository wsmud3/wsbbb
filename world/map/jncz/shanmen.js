this.inherits(ROOM);
this.name = "山门";
this.desc = "净念禅宗的山门巍峨耸立，两尊石狮镇守左右。门楣上刻着「净念禅宗」四个大字，笔力苍劲。穿过山门，北面便是放生池。";
this.exits = { "north": "jncz/fangshengchi" };
this.set_npc([]);

this.on_enter = function (me) {
    // 每次进入副本时，重置偷取标记（允许本轮重新偷取）
    if (!me.query_status("heshibi_carry")) {
        me.remove_temp("jncz_stolen");
        me.remove_temp("jncz_ambush");
        me.remove_temp("jncz_xiewang");
    }
    // 若携带和氏璧进入山门，触发护宝僧伏击（每轮只触发一次）
    if (me.query_status("heshibi_carry") && !me.query_temp("jncz_ambush")) {
        me.set_temp("jncz_ambush", 1);
        var npc1 = NPC.CREATE("jncz/hufaseng_ambush", this);
        var npc2 = NPC.CREATE("jncz/hufaseng_ambush", this);
        var npc3 = NPC.CREATE("jncz/hufaseng_ambush", this);
        this.refresh(me);
        me.notify("<hir>突然，三名护宝僧从天而降，拦住去路！'交出和氏璧！'</hir>");
        // 护宝僧主动攻击玩家
        if (npc1) npc1.do_kill(me);
        if (npc2) npc2.do_kill(me);
        if (npc3) npc3.do_kill(me);
    }
};

this.on_leave = function(me, dir) {
    if (!me.is_player) return true;
    // 离开副本时清理和氏璧buff
    if (dir === 'south' || !me.environment || me.environment.parent !== this.parent) {
        if (me.query_status("heshibi_carry")) {
            me.remove_status("heshibi_carry");
            me.remove_temp("jncz_stolen");
            me.notify('<hiy>你离开了净念禅宗，和氏璧的力量从你身上消散。</hiy>');
        }
    }
    return true;
};
