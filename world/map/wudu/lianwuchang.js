	this.inherits(ROOM);
	this.name = "练武场";
	this.desc = "一片黄土夯成的练武场，地面上画着奇怪的符文图案。场边摆放着几个瓦罐，罐中不时有蝎子、蜈蚣爬出。几个披头散发的教徒正在练习诡异的武功，动作扭曲如同蛇行。空气中飘散着各种毒虫毒草的混合气味，令人头晕目眩。北面是大门，南面是南院。";
	this.exits = { "north": "wudu/damen", "south": "wudu/nanyuan" };
	this.set_npc(["wudu/wududizi", 2], ["wudu/zangao", 1]);
