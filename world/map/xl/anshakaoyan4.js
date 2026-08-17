this.inherits(ROOM);
this.name = "暗杀考验·决";
this.desc = "第四个暗杀考验——「决」。室中有三个敌人，你必须在一瞬间决定先杀哪一个。选错了——代价就是死亡。「决者，瞬息决断。暗杀之中，犹豫即是死亡。」";
this.exits = { "south": "xl/anshakaoyan3", "north": "xl/anshakaoyan5" };
this.on_create = function() { this.set_npc("xl/ansha_wei", 1); };
