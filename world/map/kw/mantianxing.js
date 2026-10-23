this.inherits(ROOM);
this.name = "满天星";
this.desc = "这里是一片开阔的平原，附近不但没有任何小山丘陵，就连一棵树也找不到。抬眼望去，地平线笔直的将蓝天与雪原分隔在两边。据说夜间因这里无物遮挡，可遍观满天星斗。进山的人们多在此祈求上苍的保佑。";
this.exits = {
    "southeast": "kw/caoguduo",
    "west": "kw/ermenkan",
};
this.set_npc(["kw/jindiao", 1]);
