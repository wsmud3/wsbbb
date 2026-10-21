this.inherits(ROOM);
this.name = "云锦楼";
this.desc = "云锦楼陈设富丽, 一副中堂绘的是孔雀开屏,两边柱子上写了一幅对联。东面是一间客厅，西面是厢房，往北面走是后院。";
this.exits = {
    "north": "yz2/houyuan",
    "east": "yz2/xiaoting",
};

// [mech] 曼陀罗山庄庄主王夫人镇守云锦楼（攻略：小径一直向南，到云锦楼遇见王夫人，杀）
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.find_obj_bypath("yz2/wangfuren")) return;
    var npc = NPC.CREATE("yz2/wangfuren", this);
    this.refresh(me);
    if (npc) npc.do_kill(me);
};
