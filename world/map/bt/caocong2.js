this.inherits(ROOM);
this.name = "草丛";
this.desc = "再往北走，蒿草更深，几乎没到胸口。草叶上凝着露水，脚下一阵阵发凉，草丛深处有鳞片擦过枯枝的细响。";
this.exits = {
    "south": "bt/caocong",
    "north": "bt/yandong"
};

// [mech] 北面草丛又有一条毒蛇，再往北走到底便是岩洞（攻略原文）
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("bt_she2_dead")) return;
    if (this.find_obj_bypath("bt/she")) return;
    NPC.CREATE("bt/she", this);
    this.refresh(me);
    me.notify("<hiy>草丛里又是一条毒蛇拦路，杀之再向北，便是岩洞。</hiy>");
};
