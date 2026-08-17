this.inherits(ROOM);
this.name = "心魔幻境·痴";
this.desc = "石室中一切如常——但你会看到你最想见的人。师父、亲人、挚友……他们叫你放弃，叫你回头。痴念最是难破。放下执念，方见真如。";
this.exits = { "south": "dmd/xinmo_chen", "north": "dmd/tongrenxiang" };
this.on_create = function() { this.set_npc("dmd/xinmo_chi", 1); };
