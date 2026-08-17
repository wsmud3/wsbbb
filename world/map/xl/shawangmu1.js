this.inherits(ROOM);
this.name = "杀手之王墓一";
this.desc = "第一位杀手之王的墓室。室中摆放着一具石棺，棺盖上刻着他的生平：「无名。少时为仇人灭门，隐于暗巷十年，终报大仇。此后以杀为生，创立杀手楼第一分堂。卒于七十岁，一生杀敌三千七百二十一人。」";
this.exits = { "south": "xl/anyinghuilang", "north": "xl/shawangmu2" };
this.on_create = function() { this.set_npc("xl/shawang_zhiying1", 1); };
