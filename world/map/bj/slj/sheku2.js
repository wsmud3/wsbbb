this.inherits(ROOM);
this.name = "蛇窟深处";
this.desc = "这里是蛇窟的深处，光线昏暗，几乎看不清脚下的路。四周的蛇群更加密集，嘶嘶声不绝于耳。西面似乎有一个巨大的巢穴。";
this.exits = { "east": "bj/slj/sheku", "west": "bj/slj/sheku3" };
this.set_npc("bj/shenlong/dushe", "bj/shenlong/zyshe", "bj/shenlong/dushe");
