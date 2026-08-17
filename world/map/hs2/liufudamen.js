this.inherits(ROOM);
this.name = "刘府大门";
this.desc = `一座朱漆大门巍然而立，门楣上悬挂着"刘府"二字的匾额，笔力遒劲。门口站着两位家丁，神色肃穆。门内隐隐传来丝竹之声，似乎在筹备什么重要聚会。北边是来时的山路，南边通向刘府大院。`;
this.exits = { "north": "hs2/shanlu", "south": "hs2/liufudayuan" };
this.set_npc(["hs2/songshandizi", 2]);
