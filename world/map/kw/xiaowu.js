this.inherits(ROOM);
this.name = "小茅屋";
this.desc = "这是一座用长白山松木垒成的小屋，屋内打扫的很干净。四周的墙壁上挂满了兽皮和雪橇，一张小小的桌旁坐着一个英俊少年。";
this.exits = {
    "south": "kw/baihe",
};
this.set_npc(["kw/auto_2", 1]);
