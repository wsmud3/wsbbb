this.inherits(ROOM);
this.name = "死门";
this.desc = "死门——八卦中最凶险之门，象征终结与消亡。石室中阴冷刺骨，地面上绘制着一个倒转的太极图。张三丰的留音在耳边响起：「置之死地而后生——此乃死门之真义。」必须在此经历一次'死亡'，方能通过。";
this.exits = { "south": "zw/jingmen", "north": "zw/jingmen2" };
this.on_create = function () { this.set_npc("zw/simen_shouwei", 1); };
