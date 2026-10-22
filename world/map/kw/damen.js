this.inherits(ROOM);
this.name = "大门坎子";
this.desc = "这里是沿江向东的古道，多为进山采参的参客所走，因此也称“参路”。前面一座小山截断去路，因其行似门坎，且为东去采参的第一道屏障，故被称为大门坎子。西面是宽阔的松花江。松花江在冬春时结冰可通行，夏秋化冻你只好找船家帮忙了。";
this.exits = {
    "west": "kw/jiang",
    "northeast": "kw/chuanchang",
};
this.set_npc(["kw/chuanfu", 1]);

// 见到船夫，记下可以请他摆渡
this.on_enter = function (me) {
    if (!me.is_player) return;
    me.set_temp("kw_boatman", 1, 7200000);
};
