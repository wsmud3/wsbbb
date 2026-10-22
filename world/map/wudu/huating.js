this.inherits(ROOM);
this.name = "花厅";
this.desc = "这里是一个幽雅别致的花厅，四周挂着碧纱的幔帐，屋角香炉中飘着一股奇异的香气。有一个粉红衣裙的少女正坐在窗边发呆，听见脚步声不觉瞟了你一样，秀眉微微一颦，似乎不太高兴。";
this.exits = {
    "west": "wudu/huayuan",
    "north": "wudu/huating2",
};
this.set_npc(["wudu/hetieshou", 1]);
