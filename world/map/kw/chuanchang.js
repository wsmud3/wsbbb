this.inherits(ROOM);
this.name = "船厂";
this.desc = "这里是古镇船厂。船厂是位于关外大平原中部的一个古老的小镇，此镇西、南、北、三面是以高墙垒筑，利于坚守。东面临松花江天成天险，乃兵家必争的要地。松花江在冬春时结冰可通行，夏秋化冻你只好找船家帮忙了。";
this.exits = {
    "south": "kw/damen",
    "east": "kw/ermenkan",
};
this.set_npc(["kw/chuanfu", 1]);

// 见到船夫，记下可以请他摆渡
this.on_enter = function (me) {
    if (!me.is_player) return;
    me.set_temp("kw_boatman", 1, 7200000);
};
