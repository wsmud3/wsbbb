this.inherits(ROOM);
this.name = "火行秘境";
this.desc = "火行殿东侧的秘境。室中如火山内部般炽热，岩浆在四壁流动。在这里，火属性的爆发力会得到极大的增幅。";
this.exits = { "west": "yc/huoxingdian" };
this.on_create = function() { this.set_npc("yc/huoxing_miwei", 1); };
