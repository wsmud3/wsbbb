this.inherits(ROOM);
this.name = "李秋水居";
this.desc = "李秋水的居所，布置雅致却不失威严。墙上挂着一幅画像，正是李秋水年轻时的模样。她正冷冷地注视着来人。";
this.exits = {"north":"pm/mishi"};
this.set_npc([]);
this._spawned = false;

this.on_enter = function(me) {
    if (!me.is_player) return;
    if (this._spawned) return;
    this._spawned = true;

    // 生成李秋水
    var lqs = NPC.CREATE("pm/liqiushui", this);
    if (!lqs) return;

    if (me.query_temp('pm_carry_tonglao')) {
        // === Boss战 ===
        me.remove_temp('pm_carry_tonglao');
        me.remove_status('carry_tonglao');
        me.notify('<hig>童姥从你背上跳下，冷冷地盯着李秋水：「贱人，今天就是你的死期！」</hig>');
        var tonglao = NPC.CREATE("pm/tianshantonglao", this);
        if (tonglao) {
            tonglao.no_fight = false;
            // 提升童姥生存能力，防止被李秋水AOE秒杀导致任务无法完成
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
