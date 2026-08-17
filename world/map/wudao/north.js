this.inherits(ROOM);
this.name = "玄武台";
this.desc = "这里是武道塔顶部的北面平台，巨大的龟蛇合体神兽盘踞于此，厚重的龟甲上布满古老的符文，沉稳而神秘。";
this.exits = { "south": "wudao/ding" };
this.max_item_count = 1;
this.is_shadow = true;
this.no_relive = true;

this.on_before_enter = function (me) {
    if (me.query_temp("ss_trial_done_2")) {
        me.notify("你已完成玄武试炼，玄武台恢复平静。");
        return;
    }
    var npc = this.find_by_path("pub/wudao_ss");
    if (!npc) {
        npc = NPC.CLONE("pub/wudao_ss");
        npc.init_from(me, 2);
        npc.environment = this;
        this.items.length = 0;
        this.items.push(npc);
        this.refresh();
    }
};

this.on_enter = function (me) {
    if (me.query_temp("ss_trial_done_2")) return;
    var npc = this.find_by_path("pub/wudao_ss");
    if (!npc) return;
    me.notify("<hig>玄武试炼开始！神兽将驱散你所有增益效果，攻击达20万（最终伤害每1%等效1000攻击）即可通过试炼。</hig>");
    npc.init_trial(me, 2);
    if (!me.is_in("wudao/north")) return;
    me.do_kill(npc);
};

this.on_leave = function (me) {
    var npc = this.find_obj_bypath("pub/wudao_ss");
    if (npc) npc.destroy();
    me._trial_active = false;
    me.remove_temp("ss_trial_beast");
    if (!me.query_temp("ss_trial_done_2")) {
        me.die = USER.prototype.die;
    }
};
