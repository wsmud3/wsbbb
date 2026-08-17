this.inherits(ROOM);
this.name = "心魔幻境·贪";
this.desc = "一间昏暗的石室，空气中弥漫着令人迷醉的香气。室内散落着金银珠宝、武功秘籍、神兵利器——但这都是幻象。贪念一动，心魔便生。守住本心，方能破此幻境。";
this.exits = { "south": "dmd/chanding2", "north": "dmd/xinmo_chen" };
this.on_create = function() { this.set_npc("dmd/xinmo_tan", 1); };
