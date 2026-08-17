this.inherits(ROOM);
this.name = "蛇窟";
this.desc = "这是一个阴森恐怖的蛇窟，四处爬满了毒蛇。洞壁上挂满了蛛网，空气中弥漫着腐烂的气息。西面似乎通向蛇窟深处。";
this.exits = { "east": "bj/slj/wuchang", "west": "bj/slj/sheku2" };
this.set_npc("bj/shenlong/dushe", "bj/shenlong/zyshe");
