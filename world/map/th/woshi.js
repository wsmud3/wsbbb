	this.inherits(ROOM);
	this.name = "卧室";
	this.desc = "一间清雅的卧房，布置精致而不失素雅。窗外便是碧海蓝天，涛声阵阵。房中挂着一幅字画，笔法飘逸，似乎出自高人之手。";
	this.exits = { "south": "th/qianyuan" };
	this.set_npc(["th/huangrong", 1], ["th/huangyaoshi", 1]);
