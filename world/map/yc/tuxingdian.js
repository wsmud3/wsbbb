this.inherits(ROOM);
this.name = "土行殿";
this.desc = "五行殿中的土行之殿。殿中以黄色为主调，充满了厚重的土属性真气。殿中地面由黄玉铺成，踩上去坚实厚重。东侧通往土行秘境。";
this.exits = { "south": "yc/huoxingdian", "north": "yc/wuxingxunhuantai", "east": "yc/tuxingmijing" };
this.on_create = function() { this.set_npc("yc/tuxing_ling", 1); };
