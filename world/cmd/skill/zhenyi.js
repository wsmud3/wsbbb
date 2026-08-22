this.inherits(COMMAND);
this.command = "zhenyi";
this.allow_busy = false;
this.allow_state = false;
this.allow_die = false;
this.allow_faint = false;

this.enter = function (me, arg) {
    if (!me || !me.is_player || !WORLD.ZHENYI) return;
    arg = (arg || "").trim();
    var parts = arg.split(/\s+/), action = parts[0];
    if (action === "active") WORLD.ZHENYI.set_active(me, parts[1]);
    else if (action === "challenge") WORLD.ZHENYI.start_trial(me, parts[1]);
    else if (action === "sweep") WORLD.ZHENYI.sweep(me, parts[1], parts[2]);
    else if (action === "trial_complete") return WORLD.ZHENYI.finish_trial_action(me, false);
    else if (action === "trial_exit") return WORLD.ZHENYI.finish_trial_action(me, true);
    else if (action === "upgrade") return WORLD.ZHENYI.request_upgrade(me, parts[1]);
    else if (action === "upgrade_confirm") return WORLD.ZHENYI.confirm_upgrade(me, parts[1], parts[2]);
    else if (action === "upgrade_cancel") return me.notify("已取消真意升级。");
    // NPC动作会把NPC id作为参数传进来；未知参数与空参数都只打开面板。
    if (!me.is_fighting()) this.send_panel(me);
};

this.send_panel = function (me) {
    var data = WORLD.ZHENYI.serialize(me);
    if (!data) return me.notify("你尚无可参悟的门派真意。");
    me.send(JSON.stringify({
        type: "dialog", dialog: "score", name: me.long_name(), has_jd: true, zhenyi: data.list,
        zy_name: data.name, zy_key: data.key, zy_area: data.area,
        zy_energy_cost: data.energy_cost
    }));
};

