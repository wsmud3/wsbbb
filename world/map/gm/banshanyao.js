this.inherits(ROOM);
this.name = "半山腰";
this.desc = "你爬上半山腰，望着对面的山。这边的山柔静阴郁，对面的山坡金色的阳光晒得一片亮晶。真象仙境一样，有什麽喜乐的事，如升平的音乐，在树梢与树梢间荡跌着，回乐着....";
this.exits = {
    "east": "gm/shanpo1",
    "north": "gm/xiaolu1",
};
this.set_npc(["gm/auto_3", 1], ["gm/auto_4", 1]);
