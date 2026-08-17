this.inherits(COMMAND);
this.command = "cangku";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.allow_faint = true;

this.enter = function (me, arg) {
    if (!me.is_player) return;
    // 切换：已打开则关闭，未打开则打开
    if (me.query_temp("cangku_open")) {
        me.remove_temp("cangku_open");
        me.send('{type:"dialog",dialog:"list",close:true}');
        return;
    }
    me.set_temp("cangku_open", 1, 10000);
    WORLD.COMMANDS["store"].enter(me);
};
