this.inherits(ROOM);
this.name = "龙门";
this.desc = "这里便是泰山十八盘的起点。此处山势陡峭，登山的人一个不小心很容易便会跌堕到崖谷之中。";
this.exits = {
    "southdown": "ts/shiba1",
    "northup": "ts/shiba2",
};
this.set_npc(["ts/npc02", 1]);

// 每往上走一步都要验轻功（规则见 ts/daizong.js 的 WORLD.ts_climb）
this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (!dir || dir.indexOf("up") < 0) return true;
    return WORLD.ts_climb(me);
};
