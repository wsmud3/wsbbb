this.inherits(ROOM);
this.name = "药房";
this.desc = "这里是间药房，靠墙放着一只大药柜。屋子里有张桌子，上边摆满了炼药用的瓶瓶罐罐。其中一个药瓶里只装了清水。炼药师是位小姑娘，正在那里发呆，不知在想什么。北面是气派的长廊。";
this.exits = {
    "north": "bt/changlang",
};
this.set_npc(["bt/xiaoqing", 1]);
