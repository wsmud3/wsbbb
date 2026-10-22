this.inherits(ROOM);
this.name = "试剑亭";
this.desc = "这里是一个用白玉石砌成的亭子，亭子砌得小巧玲珑，十分精巧。亭子的北面是一片桃花林，南面则是桃花山庄的正门。";
this.exits = {
    "east": "th/damen",
    "north": "th/road1",
};
this.set_npc(["th/luchengfeng", 1]);
