this.inherits(ROOM);
this.name = "履霜室";
this.desc = "第十一间密室——履霜冰至。室中寒气逼人。「履霜坚冰至——此掌之意在防微杜渐，见微知著。寒气之中蕴含杀机。」";
this.exits = { "south": "js/shenlongshi", "north": "js/shuanglongshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
