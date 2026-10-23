this.inherits(ROOM);
this.name = "小院";
this.desc = "这里是个小院子，打扫得甚为整洁，旁边有棵大树，院子内放了一些扫把等杂物。往北是个不大的客厅。";
this.exits = {
    "north": "wf/xiaolou",
};

// 原版：小院只有金蛇郎君夏雪宜；温仪在小楼。
this.set_npc(["wf/jinshelangjun", 1]);
