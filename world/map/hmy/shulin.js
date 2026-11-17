this.inherits(ROOM);
this.name = "密林";
this.desc = "你走在一条阴暗的林间小道上，两旁是阴森森的树林。一阵阵风吹过树梢, 发出沙沙的响声, 令你不寒而栗。";
// 补上通往风雷堂(北)的出口
this.exits = {
    "east": "hmy/up1",
    "west": "hmy/shangu",
    "south": "hmy/tx_tang",
    "north": "hmy/fl_tang",
};
this.set_npc([]);
