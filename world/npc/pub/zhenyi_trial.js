this.inherits(NPC);
this.set({
    name: "武意化身", title: "<hiy>真意试炼</hiy>", gender: 1, age: 40,
    desc: "一道由历代门人武意凝成的身影。它并非活物，却能看破招式中的虚实。",
    no_refresh: true, no_fight: false, is_zhenyi_trial: true, pfm_rate: 0.25
});

this.init_trial = function (player, data, intent) {
    this.trial_owner = player;
    this.trial_key = data.key;
    this.trial_id = intent.id;
    this.trial_mode = intent.mode;
    this.name = "<hiy>" + intent.trial + "·武意化身</hiy>";
    var level = WORLD.ZHENYI.get_level(player, data.key, intent.id) || 1;
    this.desc = "这是【" + intent.trial + "】凝成的武意化身。此试考校“" + intent.mech + "”之理：" + WORLD.ZHENYI.describe(data, intent, level);

    var skillLv = Math.max(800, Math.min(3000, player.skill_limit ? player.skill_limit() : 1500));
    this.skill_map(
        ["force", skillLv], ["unarmed", skillLv], ["sword", skillLv], ["parry", skillLv], ["dodge", skillLv],
        ["jiuyinshengong", skillLv, "force"], ["jiuyinbaiguzhao", skillLv, "unarmed"],
        ["xuantiejianfa", skillLv, ["sword", "parry"]], ["lingboweibu", skillLv, "dodge"]
    );
    this.con = this.dex = this.int = this.str = Math.max(50, Math.floor((player.str + player.con + player.dex + player.int) / 8));
    var hpScale = [0, 5.0, 5.8, 6.4, 7.0, 8.0][intent.id] || 6;
    var gjScale = [0, 0.34, 0.38, 0.42, 0.46, 0.52][intent.id] || 0.4;
    if (intent.mode === "endure") { hpScale *= 2.5; gjScale *= 0.72; }
    if (intent.mode === "burst") hpScale *= 0.85;
    this.max_hp = this.hp = Math.max(500000, Math.floor(player.max_hp * hpScale));
    this.max_mp = this.mp = Math.max(1000000, Math.floor(player.max_mp * 5));
    this.gj = Math.max(5000, Math.floor(player.gj * gjScale));
    this.fy = Math.max(3000, Math.floor(player.fy * (intent.mode === "burst" ? 0.75 : 1.05)));
    this.mz = Math.max(3000, Math.floor(player.mz * (intent.mode === "precision" ? 1.25 : 0.9)));
    this.ds = Math.max(3000, Math.floor(player.ds * (intent.mode === "precision" ? 1.2 : 0.85)));
    this.zj = Math.max(3000, Math.floor(player.zj * (intent.mode === "counter" ? 1.3 : 0.9)));
    this.init(); this.recount();
    this.hp = this.max_hp; this.mp = this.max_mp;

    var timeout = intent.mode === "burst" ? 60000 : (intent.mode === "endure" ? 45000 : 180000);
    this.trial_timeout_handler = this.call_out(this.trial_timeout, timeout);
    this.trial_tick_handler = this.call_out(this.trial_tick, 5000);
};

this.trial_tick = function () {
    var me = this.trial_owner;
    if (!me || me.hp <= 0 || !this.environment || me.environment !== this.environment) {
        if (me && WORLD.ZHENYI) WORLD.ZHENYI.fail_trial(me, "你离开了试炼或已无力再战。");
        return this.destroy();
    }
    if (this.trial_mode === "resource") {
        var drain = Math.max(1, Math.floor(me.max_mp * 0.025));
        me.add_mp(-drain);
        me.notify("<hib>武意化身牵引气机，你损失了" + drain + "点内力。</hib>");
    } else if (this.trial_mode === "control" && !me.query_temp("zy_trial_control_cd")) {
        me.set_temp("zy_trial_control_cd", 1, 8000);
        me.add_status({ id: "zy_trial_control", name: "试炼威压", duration: 900, downside: true, prop: { is_busy: 1 } });
    }
    this.trial_tick_handler = this.call_out(this.trial_tick, 5000);
};

this.trial_timeout = function () {
    var me = this.trial_owner;
    if (this.trial_mode === "endure" && me && me.hp > 0 && me.environment === this.environment) {
        if (WORLD.ZHENYI) WORLD.ZHENYI.complete_trial(me, this.trial_key, this.trial_id);
        me.notify("<hig>你守住心神，熬过了整场武意冲击。</hig>");
        me.end_fight(); this.end_fight(); return this.destroy();
    }
    if (me && WORLD.ZHENYI) WORLD.ZHENYI.fail_trial(me, this.trial_mode === "burst" ? "未能在一炷香内破去化身。" : "试炼历时过久，武意已经散去。");
    if (me) me.end_fight(); this.end_fight(); this.destroy();
};

this.on_die = function (killer) {
    if (this.trial_timeout_handler) clearTimeout(this.trial_timeout_handler);
    if (this.trial_tick_handler) clearTimeout(this.trial_tick_handler);
    if (killer && killer === this.trial_owner && WORLD.ZHENYI) {
        WORLD.ZHENYI.complete_trial(killer, this.trial_key, this.trial_id);
    }
};
