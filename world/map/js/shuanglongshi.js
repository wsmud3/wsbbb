this.inherits(ROOM);
this.name = "双龙室";
this.desc = "第十二间密室——双龙取水。室中两道龙形真气盘旋交汇。「双龙取水，刚柔并济——此掌为降龙十八掌中唯一双手齐出的招式。」";
this.exits = { "south": "js/lvshuangshi", "north": "js/yuyueshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
