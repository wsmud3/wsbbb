this.inherits(ROOM);
this.name = "利涉室";
this.desc = "第六间密室——利涉大川。室中真气如江河奔涌。「利涉大川，往有功也——此掌之势如劈波斩浪，无可阻挡。」";
this.exits = { "south": "js/qianlongshi", "north": "js/zhenjingshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
