	this.inherits(ROOM);
	this.name = "圣火堂";
	this.desc = "圣火熊熊燃烧，张无忌与光明左右使在此守卫。";
	this.exits = { "south": "gm/liehuofang" };
	this.set_npc(["gm/zhangwuji", 1], ["gm/yangxiao", 1], ["gm/fanyao", 1], ["gm/weiyixiao", 1], ["gm/yintianzheng", 1]);
