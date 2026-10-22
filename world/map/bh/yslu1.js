this.inherits(ROOM);
this.name = "火山路";
this.desc = "这是一岩石路，由此去火山尚须四十多里路。但在此已可以看到四面山上一缕黑烟冲天而起。岩石路皆由火山灰堆成，厉时久，地面十分坚硬。";
this.exits = {
    "east": "bh/haibian",
    "west": "bh/yslu2",
};
this.set_npc(["bh/yanlong", 1]);
