this.inherits(ROOM);
this.name = "白虎台";
this.desc = "这里是武道塔顶部的西面平台，银白色的巨虎踞于台上，黑色斑纹如墨，目光锐利如刀，浑身上下散发着凛冽的杀气。";
this.exits = { "east": "wudao/ding" };
this.max_item_count = 1;
this.is_shadow = true;
this.no_relive = true;

this.on_before_enter = function (me) {
    if (me.query_temp("ss_trial_done_1")) {
        me.notify("你已完成白虎试炼，白虎台恢复平静。");
        return;
    }
    var npc = this.find_by_path("pub/wudao_ss");
    if (!npc) {
        npc = NPC.CLONE("pub/wudao_ss");
        npc.init_from(me, 1);
        npc.environment = this;
        this.items.length = 0;
        this.items.push(npc);
        this.refresh();
    }
};

this.on_enter = function (me) {
    if (me.query_temp("ss_trial_done_1")) return;
    var npc = this.find_by_path("pub/wudao_ss");
    if (!npc) return;
    me.notify("<hig>白虎试炼开始！神兽将驱散你所有增益效果，躲闪达20万即可通过试炼。</hig>");
    npc.init_trial(me, 1);
    if (!me.is_in("wudao/west")) return;
    npc.do_kill(me);
};

this.on_leave = function (me) {
    var npc = this.find_obj_bypath("pub/wudao_ss");
    if (npc) npc.destroy();
    me._trial_active = false;
    me.remove_temp("ss_trial_beast");
    if (!me.query_temp("ss_trial_done_1")) {
        me.die = USER.prototype.die;
    }
};
