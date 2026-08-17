this.inherits(ROOM);
this.name = "伤门";
this.desc = "伤门——此间气息凌厉刺骨，空气中弥漫着一股凶险之意。石壁上满是剑痕和拳印，似乎是历代闯关者在此与护门之灵激战所留。一道太极剑气在室中游走，等待着挑战者。";
this.exits = { "south": "zw/shengmen", "north": "zw/dumen" };
this.on_create = function () { this.set_npc("zw/tj_shouwei", 1); };
