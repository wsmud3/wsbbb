this.inherits(ROOM);
this.name = "太极化身台";
this.desc = "真武秘境的最终战场——一座悬浮于虚空之中的巨大太极圆台。台上立着一道人影，白发白须，身着道袍，周身阴阳二气环绕。这便是张三丰的「太极化身」——他百年修为凝聚而成的残影，在此等候一位能真正领悟太极真谛的武当弟子。";
this.exits = { "south": "zw/biguandong", "north": "zw/chuanchengdian" };
this.on_create = function () { this.set_npc("zw/zsf_huashen", 1); };
