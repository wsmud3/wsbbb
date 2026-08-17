this.inherits(ROOM);
this.name = "金刚殿";
this.desc = "殿中供奉着一尊巨大的金刚怒目像，手持降魔杵，威风凛凛。殿中真气波动极强——金刚之力在此凝聚，守护着通往禅武石壁的道路。";
this.exits = { "south": "dmd/boretang", "north": "dmd/chanwushibi" };
this.on_create = function() { this.set_npc("dmd/jingang_hufa", 1); };
