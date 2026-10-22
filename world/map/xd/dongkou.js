this.inherits(ROOM);
this.name = "洞口";
this.desc = "一个幽暗的洞口，阴风阵阵，通往山腹深处。";
this.exits = {
    "west": "xd/xuechi3",
    "east": "xd/xuechi1",
};
this.set_npc(["xd/xuedaodizi", 2]);
