this.inherits(ROOM);
this.name = "密林";
this.desc = "一片茂密的树林，东北虎常在林间出没，需小心前行。";
this.exits = { "east": "kw/milin2", "west": "kw/baihe" };
this.set_npc(["kw/laohu", 1]);
