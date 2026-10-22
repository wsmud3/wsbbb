this.inherits(ROOM);
this.name = "走廊";
this.desc = "这是『日月神教』下第二大堂：白虎堂的走廊，周围有几个教下的弟子再巡逻。";
this.exits = {
    "south": "hmy/baihutang",
    "north": "hmy/bh_ting",
};
this.set_npc(["hmy/auto_1", 1]);
