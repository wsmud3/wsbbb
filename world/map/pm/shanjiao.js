this.inherits(ROOM);
this.name = "山脚";
this.desc = "缥缈峰山脚，云雾缭绕，古木参天。一条陡峭的山路蜿蜒而上。";
this.exits = { "north": "pm/shandao1" };
this.set_npc([]);
this.tonglao_spawned = false;

this.on_enter = function(me) {
    if (!me.is_player) return;
    if (!this.tonglao_spawned) {
        // 清理上一轮残留的背负状态
        me.remove_temp('pm_carry_tonglao');
        me.remove_status('carry_tonglao');
        this.tonglao_spawned = true;
        NPC.CREATE("pm/tianshantonglao", this);
    }
};
