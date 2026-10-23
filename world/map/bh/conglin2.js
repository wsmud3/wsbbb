this.inherits(ROOM);
this.name = "丛林";
this.desc = "这是一座山石，山石周围到处是奇花异树，异树丛中传来阵阵的奇香，皆由不知名之花朵传出。山脚下露出一个石洞，西面是通住火山之路，东边半里处有一小石山，北边是一片片深不见底的大丛林。";
this.exits = {
    "north": "bh/shishan",
    "south": "bh/conglin1",
};
this.set_npc(["bh/baixiong", 1]);
