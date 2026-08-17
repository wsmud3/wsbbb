	this.inherits(ROOM);
	this.name = "山洞";
	this.desc = "幽暗的山洞中，血刀老祖与四位大侠混战，刀光剑影。";
	this.exits = { "west": "xd/dongkou" };
	this.set_npc(["xd/xuedaolaozu", 1], ["xd/luhuajia", 1], ["xd/luhuajib", 1], ["xd/luhuajid", 1], ["xd/luhuaji", 1]);
