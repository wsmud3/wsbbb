this.inherits(ROOM);
this.name = "山门";
this.desc = "天龙寺的山门，古朴庄严，门上刻着盘龙图案。";
this.exits = {"north":"tl/qiandian"};
this.set_npc([]);

// 进入时清上一轮残留（仅在未背负时，防止返回山门误清）
this.on_enter = function(me) {
    if (!me.is_player) return;
    if (!me.query_temp('tl_carry_duanyu')) {
        me.remove_temp('tl_carry_duanyu');
        me.remove_temp('tl_killed_any');
        me.remove_status('carry_duanyu');
    }
};
