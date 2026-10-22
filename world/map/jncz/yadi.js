this.inherits(ROOM);
this.name = "崖底";
this.desc = "这是禅院后面峭壁的底下，一条小河环流而下，前面就是陡峭的山崖，崖面几近垂直，毫无借力之处，没有高明的轻功几乎不可能从这里上去。峭壁上面就是禅院的后院部分，地势险恶怪不得没有僧兵看守。";
this.exits = {
    "south": "jncz/xiaolu",
};
this.set_npc(["jncz/auto_2", 1], ["jncz/auto_3", 1], ["jncz/auto_4", 1]);
