	this.inherits(ROOM);
	this.name = "前院";
	this.desc = "燕子坞的前院，花木扶疏，小径直通各处。";
	this.exits = { "west": "yz2/zhuangfu", "east": "yz2/dating", "south": "yz2/xiaojing" };
	this.set_npc(["yz2/abih", 1], ["yz2/azhu", 1]);
