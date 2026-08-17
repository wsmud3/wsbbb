	this.inherits(ROOM);
	this.name = "练毒室";
	this.desc = `这里是五毒教的核心之地——练毒室。四周的架子上摆满了瓶瓶罐罐，标签上写着"断肠散""七步倒""鹤顶红"等骇人的名字。中央一口大鼎正冒着绿色的烟雾，鼎中毒液翻滚，发出咕嘟咕嘟的声响。墙壁上渗出的水珠都是暗绿色的，空气令人窒息。北面是西房，南面通向大厅。`;
	this.exits = { "north": "wudu/xifang", "south": "wudu/dating" };
	this.set_npc(["wudu/bairan", 1], ["wudu/cenqisi", 1]);
