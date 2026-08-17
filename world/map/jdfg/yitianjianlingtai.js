this.inherits(ROOM);
this.name = "倚天剑灵台";
this.desc = "金顶佛光的最终战场。倚天剑的本体悬浮于空中，剑中走出一道金色的人影——倚天剑灵。她融合了峨眉历代掌门的执念与剑意：「峨眉剑法，从郭襄到我——历代传承，尽在此剑之中。」";
this.exits = { "south": "jdfg/lunhuimijing", "north": "jdfg/chuanchengdian" };
this.on_create = function() { this.set_npc("jdfg/yitian_zhongji", 1); };
