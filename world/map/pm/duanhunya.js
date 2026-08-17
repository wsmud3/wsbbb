this.inherits(ROOM);
this.name = "断魂崖";
this.desc = "断魂崖之上，乌道老大和不平道人正围攻天山童姥。";
this.exits = { "north": "pm/shizuyan", "south": "pm/shanjiao" };
this.set_npc(["pm/wudaolaoda", 1]);
this.set_npc(["pm/bupingdaoren", 1]);
