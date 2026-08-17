	this.inherits(ROOM);
	this.name = "论剑台";
	this.desc = "华山论剑台，千年武林圣地。东邪西毒南帝北丐中神通，五绝争锋，在此一决高下。切记不可离开论剑台。";
	this.exits = { "north": "hslj/juebi", "south": "hslj/lunjian" };
	this.set_npc(["hslj/dongxie", 1], ["hslj/xidu", 1], ["hslj/nandi", 1], ["hslj/beigai", 1], ["hslj/zhongshentong", 1]);
