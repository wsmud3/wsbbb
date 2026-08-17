	this.inherits(ROOM);
	this.name = "光明顶";
	this.desc = "明教总坛光明顶，六大派围攻此处。";
	this.exits = { "north": "gm/houtufang", "east": "gm/hongshuifang", "west": "gm/jumufang", "south": "gm/linjianxiaowu" };
	this.set_npc(["gm/miejueshitai", 1], ["gm/shuobude", 1], ["gm/pengyingyu", 1]);
