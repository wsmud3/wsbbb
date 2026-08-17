this.inherits(ROOM);
this.name = "走廊尽头";
this.desc = "走廊到了尽头，周围一片死寂。这里的墙上没有油灯，只有从身后远处透来的一点微光。脚下的地面变成了泥土，潮湿而冰冷。前方似乎是一个开阔的空间，隐约可以看到一些木桩的影子。空气中那股血腥味与药味混合成一种诡异的气息。北面是来时的走廊，南面通往一处阴暗之地。";
this.exits = { "north": "wf/lang3", "south": "wf/muzhuang" };
this.set_npc(["wf/wenjia", 1]);
