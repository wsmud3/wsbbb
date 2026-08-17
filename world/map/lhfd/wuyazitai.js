this.inherits(ROOM);
this.name = "无崖子残念台";
this.desc = "琅嬛福地的最终战场。一座悬浮于虚空之中的白玉平台。台上站着一个人——无崖子的「残念」。他不再是当年那个英俊的逍遥派掌门，而是一道模糊的虚影。「以彼之道，还施彼身。」他会使用你的所有技能来对付你——你必须用逍遥派的武学哲学来战胜自己。";
this.exits = { "south": "lhfd/xingxiuhai", "north": "lhfd/chuanchengdian" };
this.on_create = function() { this.set_npc("lhfd/wuyazi_cannian", 1); };
