this.inherits(ROOM);
this.name = "暗杀考验·速";
this.desc = "第二个暗杀考验——「速」。室中明亮无比——但你的对手速度极快。一击必杀，否则自身难保。「速者，快如闪电。敌未觉而命已尽。」";
this.exits = { "south": "xl/anshakaoyan1", "north": "xl/anshakaoyan3" };
this.on_create = function() { this.set_npc("xl/ansha_wei", 1); };
