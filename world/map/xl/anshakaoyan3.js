this.inherits(ROOM);
this.name = "暗杀考验·忍";
this.desc = "第三个暗杀考验——「忍」。室中有一个永远不会主动攻击你的对手——但你必须在规定时间内找到它的弱点并一击致命。否则时间一到，你便失败。「忍者，静如处子。忍耐至最后一刻，一剑封喉。」";
this.exits = { "south": "xl/anshakaoyan2", "north": "xl/anshakaoyan4" };
this.on_create = function() { this.set_npc("xl/ansha_wei", 1); };
