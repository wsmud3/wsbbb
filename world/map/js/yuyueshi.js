this.inherits(ROOM);
this.name = "鱼跃室";
this.desc = "第十三间密室——鱼跃于渊。室中真气如鲤鱼跃龙门。「鱼跃于渊，不离于渚——此掌之势如鱼跃龙门，一飞冲天。」";
this.exits = { "south": "js/shuanglongshi", "north": "js/shichengshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
