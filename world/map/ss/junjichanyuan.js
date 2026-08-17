	this.inherits(ROOM);
	this.name = "峻极禅院";
	this.desc = "这是嵩山派的核心所在，禅院内烛火长明，映照着墙上悬挂的五岳剑派盟约。左冷禅的宝座高高在上，俯视着整个禅院，每个角落都能感受到那股令人窒息的威压。空气中弥漫着权谋与野心的气息。西边是山门，东边通向中门。";
	this.exits = { "east": "ss/zhongmen", "west": "ss/junjishanmen", "north": "ss/cedao" };
	this.set_npc(["ss/yuehou", 1], ["ss/lubai", 1], ["ss/gaokexin", 1]);
