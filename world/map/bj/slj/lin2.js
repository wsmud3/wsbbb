this.inherits(ROOM);
this.name = "蛇道";
this.desc = "这里是一条蜿蜒的蛇道，两旁灌木丛生，不时有毒蛇从脚边爬过。空气中弥漫着腥臭的味道，让人不寒而栗。";
this.exits = { "north": "bj/slj/lin1", "south": "bj/slj/kongdi" };
this.set_npc("bj/shenlong/dushe", "bj/shenlong/zyshe");
