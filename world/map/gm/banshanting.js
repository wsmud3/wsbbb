this.inherits(ROOM);
this.name = "半山亭";
this.desc = "半山腰的一座凉亭，可稍作歇息。";
this.exits = { "north": "gm/banshanyao", "south": "gm/shanmen" };
this.set_npc(["gm/lengqian", 1]);
