this.inherits(ROOM);
this.name = "长廊";
this.desc = "这里是非常气派的长廊。两边站着数十个刀斧手,警卫森严,透着腾腾杀气。";
this.exits = {
    "south": "hmy/ql_ting",
    "north": "hmy/qinglongtang",
};
this.set_npc(["hmy/auto_1", 1]);
