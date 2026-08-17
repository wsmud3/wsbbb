	this.inherits(ROOM);
	this.name = "南院";
	this.desc = "南院中栽种着各种奇花异草，色彩艳丽得有些反常。走近一看，每株花草上都爬满了细小的毒虫，花蕊中滴落着黑色的汁液。院角的几个大缸里泡着不知名的毒物，散发出令人作呕的气味。这里的一切都透着一股死亡的气息。北面是练武场，南面是西房。";
	this.exits = { "north": "wudu/lianwuchang", "south": "wudu/xifang" };
	this.set_npc(["wudu/shaqianli", 1]);
