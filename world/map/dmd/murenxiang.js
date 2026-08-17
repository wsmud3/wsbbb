this.inherits(ROOM);
this.name = "木人巷";
this.desc = "与铜人巷类似，但这里的是木人。木人的动作更加灵活多变——它们模拟的是少林七十二绝技中的身法和步法。考验的不是硬功夫，而是随机应变。";
this.exits = { "south": "dmd/tongrenxiang", "north": "dmd/cangjingge" };
this.on_create = function() { this.set_npc("dmd/muren_zhen", 1); };
