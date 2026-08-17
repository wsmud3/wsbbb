this.inherits(ROOM);
this.name = "木行秘境";
this.desc = "木行殿东侧的秘境。室中如热带雨林般繁茂，各种奇异植物在此生长。在这里，木属性的生命力和持续伤害能力会得到极大的增幅。";
this.exits = { "west": "yc/muxingdian" };
this.on_create = function() { this.set_npc("yc/muxing_miwei", 1); };
