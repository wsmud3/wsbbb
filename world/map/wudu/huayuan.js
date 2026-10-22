this.inherits(ROOM);
this.name = "花园";
this.desc = "这里是个花园，一年四季都生长着各种奇异的花草，在阳光下发出七彩妖艳的光辉。花园里一片沉寂，竟看不到一只蜜蜂或蝴蝶飞舞。有一条石子小路通向前面一座花厅。";
this.exits = {
    "west": "wudu/dating",
    "east": "wudu/huating",
    "north": "wudu/huayuan2",
};
this.set_npc(["wudu/hehongyao", 1]);
