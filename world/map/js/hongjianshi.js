this.inherits(ROOM);
this.name = "鸿渐室";
this.desc = "第四间密室——鸿渐于陆。室中真气如大雁列阵飞行。「鸿渐于陆，夫征不复——此掌如雁阵之序，一招之中蕴含三重叠劲。」";
this.exits = { "south": "js/jianlongshi", "north": "js/qianlongshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
