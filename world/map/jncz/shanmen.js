this.inherits(ROOM);
this.name = "山门";
this.desc = "这是禅院的山门处，前面是一道长长的石阶，一眼望不到头，山门口放着一尊巨石，上面刻着：佛门静地，唯度有缘。 ";
this.exits = {
    "north": "jncz/shijie",
    "northeast": "jncz/xiaolu",
};
this.set_npc(["jncz/auto_1", 1]);
