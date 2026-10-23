this.inherits(ROOM);
this.name = "桂花廊";
this.desc = "这是通往宫主寝宫的长廊，柱子和栏杆上都缠满了美丽的鲜花，香气扑鼻。";
this.exits = {
    "north": "yh/yihuage",
    "south": "yh/changlang1",
};
this.set_npc(["yh/gongnv", 2]);
