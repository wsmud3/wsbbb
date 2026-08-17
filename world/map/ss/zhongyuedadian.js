this.inherits(ROOM);
this.name = "中岳大殿";
this.desc = "宏伟的大殿气势磅礴，飞檐斗拱，雕梁画栋。殿前广场上，数十名嵩山弟子正在操练剑法，剑光霍霍，整齐划一。殿内供奉着中岳大帝的神像，香火缭绕中透着一股凛然的威严。西边是太室阙，东边通向峻极山门。";
this.exits = { "east": "ss/junjishanmen", "west": "ss/taishique" };
this.set_npc(["ss/zhongzhen", 1]);
