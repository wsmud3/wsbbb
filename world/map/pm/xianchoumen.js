this.inherits(ROOM);
this.name = "仙愁门";
this.desc = "这里就快到缥缈峰绝顶了，越往上走，山势越高，缭绕在你身边的白雾愈来愈浓，往南则是下山的路。沿着山道没走几步，在你眼前出现一个石坊，上书『仙愁门』三个大字，概因上山之艰辛吧。";
this.exits = { "north": "pm/dadao", "south": "pm/baizhangjian" };
this.set_npc([]);
this._spawned = false;

// 原版：李秋水就在仙愁门。背着童姥来 = 直接进 Boss 战；
// 没背童姥 = 李秋水不搭理你（也拿不到满分）。
this.on_enter = function(me) {
    if (!me.is_player) return;
    if (this._spawned) return;
    this._spawned = true;

    var lqs = NPC.CREATE("pm/liqiushui", this);
    if (!lqs) return;

    if (me.query_temp('pm_carry_tonglao')) {
        me.remove_temp('pm_carry_tonglao');
        me.remove_status('carry_tonglao');
        me.notify('<hig>童姥从你背上跳下，冷冷地盯着李秋水：「贱人，今天就是你的死期！」</hig>');
        var tonglao = NPC.CREATE("pm/tianshantonglao", this);
        if (tonglao) {
            tonglao.no_fight = false;
            // 提升童姥生存能力，防止被李秋水 AOE 秒杀导致任务无法完成
            tonglao.hp = 400000;
            tonglao.max_hp = 400000;
            this._tonglao = tonglao;
            me.notify('<hiy>天山童姥加入了战斗！在她被李秋水杀死之前，干掉李秋水！</hiy>');
            lqs.do_kill(tonglao);
        }
    } else {
        me.notify('李秋水冷冷地看了你一眼：「不相干的人，滚远些。」');
    }
};

this.add_action("bei", "背起女童", function (me) {
    if (!me.is_player) return true;
    var alive = 0;
    for (var i = 0; i < this.items.length; i++) {
        var o = this.items[i];
        if (o && o.path === "pm/liqiushui" && o.hp > 0) alive++;
    }
    if (alive) {
        me.notify("<red>李秋水还没死，童姥不会跟你走。</red>");
        return true;
    }
    me.set_temp("pm_carry", 1, 7200000);
    me.send_room("$N把女童负在背上，四维一沉——原来她就是天山童姥。");
    me.moveto("pm/biguanshi", me.name + "背着童姥飞奔而去。", me.name + "背着童姥冲进闭关室。");
    me.add_fbscore(250);
    me.notify("<hig>童姥在你背上吐出一口气：总算到了。此关便算你过。</hig>");
    return true;
});
