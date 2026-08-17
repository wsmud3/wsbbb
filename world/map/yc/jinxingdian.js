this.inherits(ROOM);
this.name = "金行殿";
this.desc = "五行殿中的金行之殿。殿中以白色和金色为主调，充满了锐利的金属性真气。殿中悬浮着一柄由金行真气凝聚成的长剑。东侧有一扇门通往金行秘境。";
this.exits = { "south": "yc/yaochiyujie", "north": "yc/shuixingdian", "east": "yc/jinxingmijing" };
this.on_create = function() { this.set_npc("yc/jinxing_ling", 1); };
