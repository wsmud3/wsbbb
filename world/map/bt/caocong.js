this.inherits(ROOM);
this.name = "草丛";
this.desc = "一片茂密的草丛，足有半人高。草丛中传来窸窸窣窣的声音，无数毒蛇潜伏其中，吐着猩红的信子，令人毛骨悚然。北面是一个幽深的岩洞。";
this.exits = { "east": "bt/yaofang", "north": "bt/yandong" };
this.set_npc(["bt/she", 3]);
