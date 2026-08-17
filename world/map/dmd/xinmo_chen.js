this.inherits(ROOM);
this.name = "心魔幻境·嗔";
this.desc = "石室中弥漫着灼热的气息，墙壁上浮现出无数战斗的幻影——对手挑衅、仇人叫嚣、同门相争。嗔怒之火在胸中翻涌。以禅心压制怒火，方能通过此间。";
this.exits = { "south": "dmd/xinmo_tan", "north": "dmd/xinmo_chi" };
this.on_create = function() { this.set_npc("dmd/xinmo_chen", 1); };
