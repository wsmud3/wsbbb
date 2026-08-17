this.inherits(ROOM);
this.name = "修罗真身台";
this.desc = "修罗暗殿的最终战场。暗影王座之后，一座悬浮于黑暗虚空中的圆形平台。台上站着五位杀手之王中最强的三位（随机选择）——他们的暗影残影在此等候最终试炼者。杀手楼的至高境界：「修罗——非神非鬼，杀中证道。」";
this.exits = { "south": "xl/anyingwangzuo", "north": "xl/chuanchengdian", "west": "xl/yingzhishilian" };
this.on_create = function() { this.set_npc("xl/xiuluo_zhenshen", 1); };
