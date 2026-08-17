	this.inherits(ROOM);
	this.name = "中门";
	this.desc = "一道厚重的铜门将前院与内堂隔开，门上镶嵌着嵩山派的徽记——一座巍峨的山峰。门两侧站立的弟子目光凛然，对每一个进入之人都严加盘查。空气中弥漫着一股凝重的气氛，令人不由自主地放轻脚步。西边是峻极禅院，东边通往会盟堂。";
	this.exits = { "east": "ss/huimengtang", "west": "ss/junjichanyuan" };
	this.set_npc(["ss/bochen", 1], ["ss/dengbagong", 1], ["ss/shatianweng", 1], ["ss/tangyinge", 1]);
