	this.inherits(ROOM);
	this.name = "花园";
	this.desc = "五毒教的后花园，出乎意料地美丽。奇花异草竞相开放，姹紫嫣红，但每一朵花下都潜伏着致命的毒虫。花丛间蝴蝶飞舞，细看却是色彩斑斓的毒蛾。园中一方小池塘，池水碧绿如翡翠，水面上漂浮着几片枯叶，偶尔有气泡从水底冒出——谁知道水下游动着什么。西面是五毒教大厅，东面是花厅，北面还有一个花园。";
	this.exits = { "west": "wudu/dating", "east": "wudu/huating", "north": "wudu/huayuan2" };
	this.set_npc(["wudu/hetieshou", 1], ["wudu/panxiuda", 1]);
this.set_npc("wudu/hehongyao");   // 五毒教长老 疤面丐婆 何红药
