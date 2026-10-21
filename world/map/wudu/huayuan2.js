this.inherits(ROOM);
this.name = "花园";
this.desc = "这里是个花园，一年四季都生长着各种奇异的花草，在阳光下发出七彩妖艳的光辉。花园里一片沉寂，竟看不到一只蜜蜂或蝴蝶飞舞。旁边有一座小亭子。";
this.exits = {
    "east": "wudu/huating2",
    "south": "wudu/huayuan",
};
this.set_npc("wudu/hehongyao");   // 五毒教长老 疤面丐婆 何红药
