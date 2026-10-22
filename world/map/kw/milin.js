this.inherits(ROOM);
this.name = "密林";
this.desc = "这是一片茂密的松林，杂乱的生长在倾斜的山坡上。每棵松树都有三四抱粗细，高达十几丈。树冠枝多叶密，将天空完全遮住，因此林内显得有些昏暗。";
this.exits = {
    "west": "kw/baihe",
    "eastup": "kw/milin1",
};
this.set_npc(["kw/laohu", 1]);
