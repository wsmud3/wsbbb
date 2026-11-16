this.inherits(COMMAND);
this.command = "cangku";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.allow_faint = true;

this.enter = function (me, arg) {
    if (!me.is_player) return;
    // 动作栏「仓库」：随时随地打开随身仓库，可存可取。
    // 开/关由前端负责（src/game/main.js 的 cangku：面板开着就收起）。这里不再按标记反向切换——
    // 玩家用 X 关掉面板时服务端不知道，标记还在，下次点按钮就会被当成「关闭」。
    // cangku_open 是 qu 判定「随身仓库」的凭据，留足时间，面板开着时一直能取。
    me.set_temp("cangku_open", 1, 30 * 60 * 1000);
    WORLD.COMMANDS["store"].enter(me);
};
