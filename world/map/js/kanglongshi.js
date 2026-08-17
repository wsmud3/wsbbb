this.inherits(ROOM);
this.name = "亢龙室";
this.desc = "第一间密室——亢龙有悔。室中石壁上刻着「亢龙有悔」的掌法图谱，一道龙形真气在室中游走。丐帮长老的留音在耳边响起：「亢龙有悔，盈不可久——这一掌的精髓不在刚猛，在悔字。」";
this.exits = { "south": "js/zongduomidao", "north": "js/feilongshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
