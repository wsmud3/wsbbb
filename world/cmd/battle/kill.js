this.inherits(COMMAND);
this.command = "kill";
this.allow_busy = true;
this.enter = function (me, argid) {
    if (me.state) {
        return me.notify("你现在正在" + me.state.title + ",没时间杀人。");
    }
    if (me.environment.no_fight) {
        return me.notify("这里不允许战斗。");
    }
    var target = me.find_obj(argid, me.environment);
    if (!target || !target.do_kill) {
        return me.notify("你要攻击谁？");
    }
    if (target === me) return me.notify("你要攻击谁？");
    // 主动出手即重新结仇：解除该 NPC 因「躺尸」而放弃的敌意（见 CHARACTER.do_kill）
    if (target._feign_forgive) delete target._feign_forgive[me.id];
    if (target.is_player) {

        // me.add_temp('k_ss', 1, UTIL.diff_time());
        if (target.query_setting("ban_pk"))
            return me.notify(target.name + "正在开启PK保护，你不能击杀" + target.call3() + "。");
        if (me.query_setting("ban_pk"))
            return me.notify("你正在开启PK保护，无法主动PK玩家。");
        else {
            if (!me.query_temp("pk")) {
                me.notify("<hic>你主动击杀玩家，7天内不能开启PK保护。</hic>");
            }
            me.set_temp("pk", 1, 24 * 3600000 * 7);
        }
    } else if (target.family && target.on_master) {
        if (me.query_setting("ban_pk"))
            return me.notify("你正在开启PK保护，无法击杀拜师NPC。");
    }

    if (me.enemy && me.enemy[0] == target) {
        return me.notify("加油，加油！！");
    }
    if (me.fight_type == 1) return me.notify("你先比试完再说。");
    if (me.is_fighting()) {
        for (var i = 0; i < me.enemy.length; i++) {
            if (me.enemy[i] == target) {

                me.enemy.splice(i, 1);
                me.enemy.splice(0, 0, target);
                return me.send_room("$N扑向$n！", target);;
            }
        }
        if (target.on_kill && target.on_kill(me) == false) return;
        target.do_kill(me);
        target.begin_kill && target.begin_kill(me);
        // 战斗中叫杀新目标：do_kill 只把目标追加到敌人列表末尾，出招仍打 enemy[0]（原先的对手），
        // 等于叫杀没反应（如血刀门叫杀四侠，刀刀都还砍在老祖身上）。和上面「已在列表里」一样挪到最前。
        var idx = me.enemy ? me.enemy.indexOf(target) : -1;
        if (idx > 0) {
            me.enemy.splice(idx, 1);
            me.enemy.splice(0, 0, target);
        }
        return me.send_room("$N扑向$n！", target);
    }
    if (target.fight_type == 1) {
        // var eny = target.query_enemy();
        // if (eny) {
        //     eny.end_fight();
        // }
        // target.end_fight();
        // return me.notify('对方正在比试，你不能趁人之危。');
    }
    // me.send_room("$N对$n大喊一声：看招！\n", target);
    me.send_room("\n$N对著$n喝道：「"
        + target.call(me, true) + "！今日不是你死就是我活！」\n", target);
    //me.begin_attack(target, 2);

    if (target.on_kill && target.on_kill(me) == false) return;

    if (me.team) {
        for (var i = 0; i < me.team.length; i++) {
            var item = me.team[i];
            if (item.master == me.id && item.query_setting("auto_kill") == 2 && item.is_here(me)) {
                item.do_kill(target);
            }
        }
    }
    me.do_kill(target);
    target.begin_kill && target.begin_kill(me);
    if (me.team) {
        for (var i = 0; i < me.team.length; i++) {
            var item = me.team[i];
            if (item.master == me.id && item.query_setting("auto_kill") == 1 && item.is_here(me)) {
                item.do_kill(target);
            }
        }
    }

    WORLD.auto_pfm(me, target);

}

