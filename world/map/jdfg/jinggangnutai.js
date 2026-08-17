this.inherits(ROOM);
this.name = "金刚怒目台";
this.desc = "慈航殿后方的演武台。台上的气氛与前殿截然不同——这里充满了怒目金刚的威猛气势。台中央悬浮着一柄金色巨剑的幻影：「金刚怒目，所以降伏四魔。」";
this.exits = { "south": "jdfg/cihangdian", "north": "jdfg/foguangpuzhaotai" };
this.on_create = function() { this.set_npc("jdfg/jingang_jianling", 1); };
