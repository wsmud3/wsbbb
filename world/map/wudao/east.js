this.inherits(ROOM);
this.name = "青龙台";
this.desc = "这里是武道塔顶部的东面平台，云雾缭绕间，隐约可见一条青色巨龙盘旋其中。平台之上古木参天，龙气弥漫，让人心生敬畏。";
this.exits = { "west": "wudao/ding" };
this.max_item_count = 1;
this.is_shadow = true;
this.no_relive = true;

this.on_before_enter = function (me) {
    if (me.query_temp("ss_trial_done_0")) {
        me.notify("你已完成青龙试炼，青龙台恢复平静。");
        return;
    }
    var npc = this.find_by_path("pub/wudao_ss");
    if (!npc) {
        npc = NPC.CLONE("pub/wudao_ss");
        npc.init_from(me, 0);
        npc.environment = this;
        this.items.length = 0;
        this.items.push(npc);
        this.refresh();
    }
};

this.on_enter = function (me) {
    if (me.query_temp("ss_trial_done_0")) return;
    var npc = this.find_by_path("pub/wudao_ss");
    if (!npc) return;
    me.notify("<hig>青龙试炼开始！神兽将驱散你所有增益效果，命中达20万即可通过试炼。</hig>");
    npc.init_trial(me, 0);
    if (!me.is_in("wudao/east")) return;
    me.do_kill(npc);
};

this.on_leave = function (me) {
    var npc = this.find_obj_bypath("pub/wudao_ss");
    if (npc) npc.destroy();
    me._trial_active = false;
    me.remove_temp("ss_trial_beast");
    if (!me.query_temp("ss_trial_done_0")) {
        me.die = USER.prototype.die;
    }
};
