this.inherits(ROOM);
this.name = "云梦沼泽";
this.desc = "一片泥泞的沼泽地，污水横流，杂草丛生。泥潭中隐约可见一具巨大的鳄鱼骨架，空气中弥漫着腐臭的味道。";
this.exits = { "north": "ym/senlin", "south": "ym/zhaoze2" };
this.set_npc(["ym/eyu", 2]);
