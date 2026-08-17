this.inherits(ROOM);
this.name = "松花江";
this.desc = "松花江畔，江面宽阔，水流湍急。一位船夫在此摆渡，可以送你过江。";
this.exits = { "east": "kw/damenkanzi", "west": "kw/xuedi1" };
this.set_npc(["kw/chuanfu", 1]);
