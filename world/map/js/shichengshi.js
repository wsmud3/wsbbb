this.inherits(ROOM);
this.name = "时乘室";
this.desc = "第十四间密室——时乘六龙。室中六道龙影盘旋飞舞。「时乘六龙，以御天——此掌之势最为宏大，六龙齐出，无可匹敌。」";
this.exits = { "south": "js/yuyueshi", "north": "js/miyunshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
