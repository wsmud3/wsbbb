this.inherits(ROOM);
this.name = "水行殿";
this.desc = "五行殿中的水行之殿。殿中以蓝色为主调，空气中弥漫着湿润的水属性真气。殿中央有一池清水，水面平滑如镜。东侧通往水行秘境。";
this.exits = { "south": "yc/jinxingdian", "north": "yc/muxingdian", "east": "yc/shuixingmijing" };
this.on_create = function() { this.set_npc("yc/shuixing_ling", 1); };
