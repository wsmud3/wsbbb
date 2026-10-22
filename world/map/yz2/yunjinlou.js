this.inherits(ROOM);
this.name = "云锦楼";
this.desc = "云锦楼陈设富丽, 一副中堂绘的是孔雀开屏,两边柱子上写了一幅对联。东面是一间客厅，西面是厢房，往北面走是后院。";
this.exits = {
    "north": "yz2/houyuan",
    "east": "yz2/xiaoting",
};
this.set_npc(["yz2/wangfuren", 1]);
