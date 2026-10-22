this.inherits(ROOM);
this.name = "草丛";
this.desc = "这里是乱草丛。东边是扇拱月形小敞门。其余三面都是齐腰高的蒿草，常有蛇出没。";
this.exits = {
    "west": "bt/caocong",
    "south": "bt/caocong",
    "east": "bt/ximen",
    "north": "bt/caocong2",
};

// [mech] 草丛里的毒蛇（攻略：继续向西走到草丛有一只毒蛇，杀）
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("bt_she1_dead")) return;
    if (this.find_obj_bypath("bt/she")) return;
    NPC.CREATE("bt/she", this);
    this.refresh(me);
};
