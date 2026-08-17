	this.inherits(ROOM);
	this.name = "花园";
	this.desc = "一座精致的花园，奇花异草遍布，芬芳扑鼻。园中有一方石桌，一名白衣少女正端坐其中抚琴，琴声悠扬却暗含杀机。";
	this.exits = { "north": "bt/menlang" };
	this.set_npc(["bt/ouyangfeng", 1], ["bt/baiyishaonv", 1]);
