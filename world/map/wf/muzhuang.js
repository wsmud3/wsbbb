this.inherits(ROOM);
this.name = "木桩";
this.desc = "这是一间宽敞的密室，四周摆放着数十根练功用的木桩。木桩上布满了深深的刀痕和掌印，有些地方还残留着暗红色的血迹。地面上散落着一些破碎的兵器。这里像是一个秘密的练功场，不知有多少人曾在此地流血流汗，甚至丢掉性命。北面是走廊尽头，南面隐约有金光闪烁。";
this.exits = { "north": "wf/lang_end", "south": "wf/jinshe" };
this.set_npc(["wf/wenjia", 1]);
