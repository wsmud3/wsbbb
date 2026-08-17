this.inherits(ROOM);
this.name = "损泽室";
this.desc = "第十六间密室——损泽以柔。室中真气柔中带刚。「损泽以柔，顺以巽——此掌为降龙十八掌中唯一以柔为主的变式。」";
this.exits = { "south": "js/miyunshi", "north": "js/xianglongtai" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
