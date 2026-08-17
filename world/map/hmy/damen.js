this.inherits(ROOM);
this.name = "大门";
this.desc = "日月神教的大门，杨莲亭在此拦路。";
this.exits = { "west": "hmy/xuanya", "east": "hmy/houting" };
this.set_npc(["hmy/yanglianting", 1]);
