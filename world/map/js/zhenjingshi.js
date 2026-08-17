this.inherits(ROOM);
this.name = "震惊室";
this.desc = "第七间密室——震惊百里。室中雷声隐隐，真气震荡。「震惊百里，不丧匕鬯——此掌之势如雷霆万钧，震慑八方。」";
this.exits = { "south": "js/lisheshi", "north": "js/tengsheshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
