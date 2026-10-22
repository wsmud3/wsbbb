this.inherits(ROOM);
this.name = "丛林";
this.desc = "向北一直走出二十余里，就是一大片丛林了。原来此岛方圆极广，延伸至北，不知尽头。丛林老树参天，阴森森的遮天蔽日，林内有什么古怪，却是不得而知。遇有好事之人肯定要进入一探的。";
this.exits = {
    "north": "bh/conglin2",
};
this.set_npc(["bh/baixiong", 1]);
