	this.inherits(ROOM);
	this.name = "大门";
	this.desc = "五毒教的大门由两根粗大的枯木搭成，门楣上缠绕着数条干枯的毒蛇，蛇头朝外，狰狞可怖。门前的石阶上长满了青苔，空气中弥漫着一股辛辣刺鼻的气味。远处传来苗疆特有的芦笙之音，低沉而诡异。南面是练武场。";
	this.exits = { "south": "wudu/lianwuchang" };
	this.set_npc(["wudu/wududizi", 2]);
