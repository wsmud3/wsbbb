this.inherits(ROOM);
this.name = "玫瑰廊";
this.desc = "这是通往二位宫主寝宫的长廊，柱子和栏杆上都缠满了美丽的玫瑰。";
this.exits = {
    "north": "yh/changlang",
    "southwest": "yh/yaoyuegong",
    "southeast": "yh/lianxinggong",
};
this.set_npc(["yh/gongnv", 2]);
