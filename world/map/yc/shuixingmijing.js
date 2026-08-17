this.inherits(ROOM);
this.name = "水行秘境";
this.desc = "水行殿东侧的秘境。室中如水晶宫般美丽，水流在四壁间循环流动。在这里，水属性的回复力会得到极大的增幅。";
this.exits = { "west": "yc/shuixingdian" };
this.on_create = function() { this.set_npc("yc/shuixing_miwei", 1); };
