	this.inherits(ROOM);
	this.name = "花园";
	this.desc = "五毒教的后花园，出乎意料地美丽。奇花异草竞相开放，姹紫嫣红，但每一朵花下都潜伏着致命的毒虫。花丛间蝴蝶飞舞，细看却是色彩斑斓的毒蛾。园中一方小池塘，池水碧绿如翡翠，水面上漂浮着几片枯叶，偶尔有气泡从水底冒出——谁知道水下游动着什么。北面是五毒教大厅。";
	this.exits = { "north": "wudu/dating" };
	this.set_npc(["wudu/hetieshou", 1], ["wudu/panxiuda", 1]);
