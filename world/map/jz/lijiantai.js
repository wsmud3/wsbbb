this.inherits(ROOM);
this.name = "利剑台";
this.desc = "一座圆形石台悬于深渊之上，四周只有无尽的黑暗。石台正中，利剑剑灵已化作一道与你等高的青色剑影——快如闪电，锋锐无匹。石台边缘立着一块小碑：「此境考验剑之锋锐。以快制胜，以锋破敌。」";
this.exits = { "south": "jz/lijiange", "north": "jz/jianhen" };

this.no_fight = true;
this.set_npc("pub/zhenyi_shiyantai#jz_1");
