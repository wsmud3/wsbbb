this.inherits(ROOM);
this.name = "腾蛇室";
this.desc = "第八间密室——腾蛇乘雾。室中真气如蛇蜿蜒升腾。「腾蛇乘雾，终为土灰——此掌之巧在于变幻莫测，令敌难以捉摸。」";
this.exits = { "south": "js/zhenjingshi", "north": "js/longzhanshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
