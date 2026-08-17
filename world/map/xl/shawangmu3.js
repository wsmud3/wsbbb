this.inherits(ROOM);
this.name = "杀手之王墓三";
this.desc = "第三位杀手之王的墓室。石棺盖上的铭文：「无常。杀手楼第七代楼主。一生从不以真面目示人。传闻他精通易容、毒药、暗器、剑术、掌法——无人能在他手下走过三招。被暗杀时面带微笑——他说他等这一天等了一辈子。」";
this.exits = { "south": "xl/shawangmu2", "north": "xl/xiuluoxuechi" };
this.on_create = function() { this.set_npc("xl/shawang_zhiying3", 1); };
