this.inherits(ROOM);
this.name = "半山腰";
this.desc = "小心翼翼地走完一段陡坡后，前面是个悬崖，遥遥可以望见一个青翠的山谷，坡道也开始平坦起来。时时可以听到从山谷传来清脆的鸟鸣声。";
this.exits = {
    "east": "gm/xuantianshi",
    "west": "gm/shanpo1",
};

this.set_npc("gm/zhangzhong");   // 五散人 张中
