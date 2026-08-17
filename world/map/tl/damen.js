this.inherits(ROOM);
this.name = "大门";
this.desc = "天龙寺大门，古朴庄严，佛门圣地。";
this.exits = { "north": "tl/sheli" };
this.set_npc([]);

// 入口清上一轮残留（仅在未背负时，防止返回误清）
this.on_enter = function(me) {
    if (!me.is_player) return;
    // 始终清理上一轮残留
    me.remove_temp('tl_carry_duanyu');
    me.remove_temp('tl_killed_any');
    me.remove_status('carry_duanyu');
};
