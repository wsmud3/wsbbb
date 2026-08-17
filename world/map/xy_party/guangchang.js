	this.inherits(ROOM);
	this.name = "中央广场"
	this.desc = "这里是襄阳城的中央广场，地面由青石铺成，四周是繁华的街道。广场中央立着一座石碑，上面刻着襄阳历代守城英烈的名字。";
	this.exits = { "west": "xy_party/westjie1", "east": "xy_party/eastjie1", "south": "xy_party/southjie1", "north": "xy_party/northjie1" };
	this.no_fight = true;
	this.set_npc("xiangyang/guo");
