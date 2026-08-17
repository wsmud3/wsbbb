this.inherits(ROOM);
this.name = "土行秘境";
this.desc = "土行殿东侧的秘境。室中如地下宫殿般厚重坚固。在这里，土属性的防御力会得到极大的增幅。";
this.exits = { "west": "yc/tuxingdian" };
this.on_create = function() { this.set_npc("yc/tuxing_miwei", 1); };
