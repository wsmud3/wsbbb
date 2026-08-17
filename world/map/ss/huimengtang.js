	this.inherits(ROOM);
		this.name = "会盟堂";
		this.desc = "会盟堂是五岳剑派议事之地，堂内正中摆着一张巨大的长桌，两侧摆满座椅，每张椅上刻着各派的名号。墙壁上悬挂着历代五岳盟主的画像，左冷禅的画像高悬正中，目光俯视全场。这里见证了无数决定江湖走向的重要时刻。西边是中门。";
		this.exits = { "west": "ss/zhongmen" };
		this.set_npc(["ss/zuolengchan", 1]);