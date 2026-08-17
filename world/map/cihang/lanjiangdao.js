this.inherits(ROOM);
this.name = "拦江岛";
this.desc = "一座孤悬于怒江之中的小岛，四面江水奔腾咆哮，浊浪滔天。岛上寸草不生，唯有嶙峋的黑石和终年不散的阴云。此地便是浪翻云与庞斑约战之地——拦江岛。空气中弥漫着浓烈的杀意，仿佛连天地都在等待着这绝世一战。";
this.exits = { "south": "cihang/shangyuting" };
this.set_npc([]);
this.boss_spawned = false;
this.boss_kill_count = 0;

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (!me.query_temp("cihang_spar_win")) {
        me.notify("<red>你尚未通过赐教，拦江岛上的禁制将你挡了回去。</red>");
        me.moveto("cihang/shangyuting");
        return;
    }
    if (me.query_temp("cihang_lanjiang_done")) {
        me.notify("拦江岛上的战斗已经结束，天地恢复了平静。");
        return;
    }
    if (this.boss_spawned) return;

    this.boss_kill_count = me.query_temp("cihang_lanjiang_kills", 0);
    this.spawn_boss(me);
};

this.spawn_boss = function (me) {
    var route = me.query_temp("cihang_route");
    var bossPath, bossName;

    if (route === "lang") {
        // 帮浪翻云 → 杀庞斑
        bossPath = "cihang/pangban";
        bossName = "庞斑";
    } else {
        // 帮庞斑 → 杀浪翻云
        bossPath = "cihang/langfanyun";
        bossName = "浪翻云";
    }

    // 清理旧的boss
    for (var i = this.items.length - 1; i >= 0; i--) {
        if (!this.items[i].is_player) this.items[i].destroy();
    }

    var boss = NPC.CREATE(bossPath, this);
    boss._lanjiang_boss = true;
    boss._lanjiang_killer = me;

    this.boss_spawned = true;
    this.boss_kill_count = me.query_temp("cihang_lanjiang_kills", 0);

    me.notify("<hir>拦江岛上，" + bossName + "已等候多时！第" + (this.boss_kill_count + 1) + "次对决开始！</hir>");
    me.notify("<hiw>此战不死不休——你必须连续击杀" + bossName + "三次，且中间不能死亡。</hiw>");

    boss.do_kill(me);
    this.refresh(me);
};

// 清理
this.on_leave = function (me, dir) {
    return true;
};
