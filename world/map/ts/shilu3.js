this.inherits(ROOM);
this.name = "石路";
this.desc = `行至此处，山风骤然猛烈起来，吹得人几乎站立不稳。俯瞰山下，群峰如黛，村落如棋，壮丽的景色令人心旷神怡。崖边立有一块石碑，刻着"一览众山小"的诗句。山路继续向上，通往山巅。`;
this.exits = { "north": "ts/shilu4", "south": "ts/shilu2" };
this.set_npc(["ts/tianbai", 1]);
