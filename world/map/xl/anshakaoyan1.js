this.inherits(ROOM);
this.name = "暗杀考验·匿";
this.desc = "第一个暗杀考验——「匿」。室中一片漆黑，你的对手是同样处于黑暗中的暗影杀手。谁先暴露自己的位置，谁就输了。「匿者，不现于敌前。现则必杀。」";
this.exits = { "south": "xl/wushengdian", "north": "xl/anshakaoyan2" };
this.on_create = function() { this.set_npc("xl/ansha_wei", 1); };
