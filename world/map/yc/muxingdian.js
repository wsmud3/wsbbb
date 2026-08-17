this.inherits(ROOM);
this.name = "木行殿";
this.desc = "五行殿中的木行之殿。殿中以绿色为主调，充满了生机的木属性真气。殿中长着一棵巨大的古树，树根穿透了石质地板。东侧通往木行秘境。";
this.exits = { "south": "yc/shuixingdian", "north": "yc/huoxingdian", "east": "yc/muxingmijing" };
this.on_create = function() { this.set_npc("yc/muxing_ling", 1); };
