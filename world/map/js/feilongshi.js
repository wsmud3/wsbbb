this.inherits(ROOM);
this.name = "飞龙室";
this.desc = "第二间密室——飞龙在天。室中真气形成一道冲天而起的龙影。「飞龙在天，利见大人——此掌之势，如龙腾九天。居高临下，所向披靡。」";
this.exits = { "south": "js/kanglongshi", "north": "js/jianlongshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
