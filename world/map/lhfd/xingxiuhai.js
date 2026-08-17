this.inherits(ROOM);
this.name = "星宿海幻境";
this.desc = "逍遥派的对立面——星宿海的幻境。这里毒雾弥漫、妖兽横行——象征着逍遥派武学中阴暗的一面。北冥神功吸取他人内力，本身也是一种「掠夺」。如何面对自己的阴暗面？";
this.exits = { "south": "lhfd/xiaoyaomijing", "north": "lhfd/wuyazitai" };
this.on_create = function() { this.set_npc("lhfd/xingxiu_huanjing", 1); };
