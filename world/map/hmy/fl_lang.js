this.inherits(ROOM);
this.name = "走廊";
this.desc = "这是『日月神教』下第一大堂：风雷堂的内部，一个空旷的草地，里面就是风雷堂的大厅。";
// 补回堂口方向的出口（原来只能进不能出）
this.exits = {
    "south": "hmy/fl_tang",
    "north": "hmy/fl_ting",
};
this.set_npc(["hmy/jiaotu", 1]);
