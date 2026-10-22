this.inherits(ROOM);
this.name = "玫瑰廊";
this.desc = "这是通往二位宫主寝宫的长廊，柱子和栏杆上都缠满了美丽的玫瑰花，左边有一间房间是涟星宫主的寝室，右面是邀月宫主的寝室。";
this.exits = {
    "north": "yh/changlang",
    "southwest": "yh/yaoyuegong",
    "southeast": "yh/lianxinggong",
};
this.set_npc(["yh/auto_2", 1]);
