this.inherits(ROOM);
this.name = "神龙室";
this.desc = "第十间密室——神龙摆尾。室中龙影回首一击。「神龙摆尾，转败为胜——此掌之精髓在于回身一击，于不可能中求可能。」";
this.exits = { "south": "js/longzhanshi", "north": "js/lvshuangshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
