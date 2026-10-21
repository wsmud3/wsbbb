this.inherits(ROOM);
this.name = "大厅";
this.desc = "这是『白驼山庄』的大厅，内部摆设极尽豪华，当中一张黑色檀木条案，上面陈放着精美的花瓶和一些珍贵的瓷器，四壁挂满名家的字画。";
this.exits = {
    "south": "bt/huayuan",
};

// [mech] 大厅：欧阳锋（攻略：先去门廊那条路，一路走到底，先打欧阳锋）
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("bt_ouyang_dead")) return;
    if (this.find_obj_bypath("bt/ouyangfeng")) return;
    NPC.CREATE("bt/ouyangfeng", this);
    this.refresh(me);
};
