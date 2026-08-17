this.inherits(ROOM);
this.name = "走廊";
this.desc = "走廊在此处转了一个弯，光线更加昏暗。墙上的油灯似乎少了几盏，阴影在墙角堆积。偶尔能听到远处传来低沉的呢喃声，像是有人在念诵什么，又像是痛苦的呻吟。空气中飘着一股淡淡的药味。北面和南面都是走廊。";
this.exits = { "north": "wf/lang1", "south": "wf/lang3" };
this.set_npc(["wf/wenjia", 1]);
