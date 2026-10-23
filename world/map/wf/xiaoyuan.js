this.inherits(ROOM);
this.name = "小院";
this.desc = "这里是个小院子，打扫得甚为整洁，旁边有棵大树，院子内放了一些扫把等杂物。往北是个不大的客厅。";
this.exits = {
    "north": "wf/dating",
};

// 原版：跳上木桩后会被送到这间小院，院里除了金蛇郎君夏雪宜，还有温家小姐温仪。
this.set_npc(["wf/jinshelangjun", 1], ["follower/wenyi", 1]);

// 金蛇郎君不主动叫杀（用户指正）。
