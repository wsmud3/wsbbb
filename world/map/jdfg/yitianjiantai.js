this.inherits(ROOM);
this.name = "倚天剑台";
this.desc = "一座悬浮于云海之上的剑台。台上插着倚天剑——不是幻影，而是真正的倚天剑（的副本镜像）。剑身泛着金光，剑意冲天而起。守护倚天剑的剑灵在此等候有缘人。";
this.exits = { "south": "jdfg/foguangpuzhaotai", "north": "jdfg/lunhuimijing" };
this.on_create = function() { this.set_npc("jdfg/yitian_jianling", 1); };
