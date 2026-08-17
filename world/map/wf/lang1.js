this.inherits(ROOM);
this.name = "走廊";
this.desc = "一条狭长的走廊，两旁墙壁上每隔几步便挂着一盏油灯，火光摇曳不定。脚下的木板发出吱呀的声响，回音在廊中久久不散。墙壁上隐约可见一些奇怪的抓痕，像是有人曾在这里拼命挣扎过。北面是大厅，南面通向更深处。";
this.exits = { "north": "wf/dating", "south": "wf/lang2" };
this.set_npc(["wf/wenjia", 1]);
