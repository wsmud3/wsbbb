	this.inherits(ROOM);
	this.name = "刘府后厅";
	this.desc = "后厅较前厅更为幽静，帘幕低垂，光线昏暗。这里似乎是商议机密要事之所，空气中弥漫着一股山雨欲来的紧张气息。案几上散落着几封书信，上面的字迹潦草而急促。北边是前厅，南边隐约可见一座巍峨的殿宇。";
	this.exits = { "north": "hs2/liufudating", "south": "hs2/zhurongdian" };
	this.set_npc(["hs2/quyang", 1]);