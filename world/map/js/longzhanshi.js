this.inherits(ROOM);
this.name = "龙战室";
this.desc = "第九间密室——龙战于野。室中两条龙形真气互相搏斗。「龙战于野，其血玄黄——此掌之势如双龙交搏，刚猛无俦。」";
this.exits = { "south": "js/tengsheshi", "north": "js/shenlongshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
