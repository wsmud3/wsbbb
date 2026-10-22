this.inherits(ROOM);
this.name = "龙门";
this.desc = "这里便是泰山十八盘的起点。此处山势陡峭，登山的人一个不小心很容易便会跌堕到崖谷之中。";
this.exits = {
    "southdown": "ts/shiba1",
    "northup": "ts/shiba1",
};
this.set_npc("ts/npc02");   // 玉音子
