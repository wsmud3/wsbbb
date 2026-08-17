this.inherits(ROOM);
this.name = "见龙室";
this.desc = "第三间密室——见龙在田。室中石壁上刻画着一道龙影从田间升起。「见龙在田，德施普也——此掌之意，不在杀敌，在立德。掌出如龙现田野，恩威并施。」";
this.exits = { "south": "js/feilongshi", "north": "js/hongjianshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
