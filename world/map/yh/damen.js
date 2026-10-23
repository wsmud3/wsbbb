this.inherits(ROOM);
this.name = "大门";
this.desc = "这就是通向『移花宫』的大门。大门左右各有一片鲜花,香味袭人，通过大门看进去，里面很多鲜花,你真的忍不住想要进去看看。";
this.exits = {
    "north": "yh/yihua1",
    "south": "yh/yihuage",
};
this.set_npc(["yh/huayuenv", 1]);
