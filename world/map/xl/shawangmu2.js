this.inherits(ROOM);
this.name = "杀手之王墓二";
this.desc = "第二位杀手之王的墓室。石棺盖上的铭文：「夜影。女，本为世家小姐，因家族被陷害而沦为杀手。以美色接近猎物，杀敌从不失手。晚年归隐，将毕生暗杀心法写成《影杀术》。卒年不详。」";
this.exits = { "south": "xl/shawangmu1", "north": "xl/shawangmu3" };
this.on_create = function() { this.set_npc("xl/shawang_zhiying2", 1); };
