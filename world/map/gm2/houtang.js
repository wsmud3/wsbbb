	this.inherits(ROOM);
	this.name = "后堂";
	this.desc = "古墓后堂，空间宽敞，通往各处。";
	this.exits = { "west": "gm2/gumurukou", "north": "gm2/woshi", "south": "gm2/qinshi" };
	this.set_npc(["gm2/xiaolongnv", 1], ["gm2/yangguo", 1]);
