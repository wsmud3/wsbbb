this.inherits(ROOM);
this.name = "山脚";
this.desc = "缥缈峰山脚，云雾缭绕，古木参天。一条陡峭的山路蜿蜒而上。";
this.exits = { "north": "pm/duanhunya" };
this.set_npc([]);

// 原版：山脚只是入口，童姥在断魂崖被围攻（不在山脚生成）。
// 这里只负责清掉上一轮残留的背负状态。
this.on_enter = function(me) {
    if (!me.is_player) return;
    me.remove_temp('pm_carry_tonglao');
    me.remove_status('carry_tonglao');
};
