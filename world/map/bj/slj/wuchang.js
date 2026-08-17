this.inherits(ROOM);
this.name = "练武场";
this.desc = "这是一个宽大的练武场，有几个手执短剑的少年少女在这里练功。北面通往一片空地，南面是一条上山的山道，西面是一个阴森的蛇窟。";
this.exits = { "north": "bj/slj/kongdi", "south": "bj/slj/shandao", "west": "bj/slj/sheku" };
this.set_npc(["bj/slj/dizi", 3]);
