this.inherits(ROOM);
this.name = "灭绝殿";
this.desc = "供奉峨眉第三代掌门灭绝师太的殿堂。殿中剑气凌厉——灭绝师太的「灭剑」和「绝剑」剑意至今未散。殿中立着一块碑：「灭绝非杀，乃断执念。断执念者，得大自在。」";
this.exits = { "south": "jdfg/fenglingdian", "north": "jdfg/yinguolunhui" };
this.on_create = function() { this.set_npc("jdfg/miejue_jianling", 1); };
