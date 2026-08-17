this.inherits(ROOM);
this.name = "大厅";
this.desc = `温府大厅，雕梁画栋，气派非凡。紫檀木的桌椅光可鉴人，墙上挂着几幅名家字画。正中悬着一块金匾，上书"积善余庆"四字。然而空气中弥漫着一股若有若无的霉味，仿佛有什么东西正在暗处腐烂。北面通往大院，南面是一条幽深的走廊。`;
this.exits = { "north": "wf/dayuan", "south": "wf/lang1" };
this.set_npc(["wf/wenlaoda", 1]);
