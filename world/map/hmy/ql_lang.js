this.inherits(ROOM);
this.name = "走廊";
this.desc = "这里是非常气派的长廊。两边站着数十个刀斧手,警卫森严,透着腾腾杀气。";
// 补回堂口方向的出口（原来只能进不能出）
this.exits = {
    "north": "hmy/ql_tang",
    "south": "hmy/ql_ting",
};
this.set_npc(["hmy/jiaotu", 1]);
