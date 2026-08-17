this.inherits(ROOM);
this.name = "朱雀台";
this.desc = "这里是武道塔顶部的南面平台，火红的神鸟盘旋空中，周身的羽翼仿佛燃烧着不灭的烈焰，炽热的气息扑面而来。";
this.exits = { "north": "wudao/ding" };
this.max_item_count = 1;
this.is_shadow = true;
this.no_relive = true;

this.on_before_enter = function (me) {
    if (me.query_temp("ss_trial_done_3")) {
        me.notify("你已完成朱雀试炼，朱雀台恢复平静。");
        return;
    }
    var npc = this.find_by_path("pub/wudao_ss");
    if (!npc) {
        npc = NPC.CLONE("pub/wudao_ss");
        npc.init_from(me, 3);
        npc.environment = this;
        this.items.length = 0;
        this.items.push(npc);
        this.refresh();
    }
};

this.on_enter = function (me) {
    if (me.query_temp("ss_trial_done_3")) return;
    var npc = this.find_by_path("pub/wudao_ss");
    if (!npc) return;
    me.notify("<hig>朱雀试炼开始！神兽将驱散你所有增益效果，防御达20万（免伤每1%等效1000防御）即可通过试炼。</hig>");
    npc.init_trial(me, 3);
    if (!me.is_in("wudao/south")) return;
    npc.do_kill(me);
};

this.on_leave = function (me) {
    var npc = this.find_obj_bypath("pub/wudao_ss");
    if (npc) npc.destroy();
    me._trial_active = false;
    me.remove_temp("ss_trial_beast");
    if (!me.query_temp("ss_trial_done_3")) {
        me.die = USER.prototype.die;
    }
};
