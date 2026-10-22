this.inherits(ROOM);
this.name = "火山路";
this.desc = "岩石路皆由火山灰堆成，厉时久，地面十分坚硬。在这里已可以看见那缕黑烟之中竟有红火光不断的喷出，原来黑烟之处是一座活火山，走到这里已感到一丝的热气扑面而来，再走十多里路就到达火山脚下了。";
this.exits = {
    "east": "bh/huoshanlu1",
    "west": "bh/huoshanjiao",
};
this.set_npc(["bh/yanlong", 1]);
