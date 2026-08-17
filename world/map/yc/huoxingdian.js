this.inherits(ROOM);
this.name = "火行殿";
this.desc = "五行殿中的火行之殿。殿中以红色为主调，空气中弥漫着灼热的火属性真气。殿中央燃烧着一团永不熄灭的火焰。东侧通往火行秘境。";
this.exits = { "south": "yc/muxingdian", "north": "yc/tuxingdian", "east": "yc/huoxingmijing" };
this.on_create = function() { this.set_npc("yc/huoxing_ling", 1); };
