this.inherits(ROOM);
this.name = "巨木旗";
this.desc = "这里是明教的巨木旗，墙边的一个木架上放满了砍伐工具，中间堆放着刚砍下来的木材，数十个教众忙着将木材整理加工，由于明教日渐壮大，巨木旗肩负起了不断扩建这个宏大建筑的重任。西面是一片遮云蔽日的树林。东面是练武场。";
this.exits = {
    "east": "gm/qi_houtu",
    "north": "gm/qi_ruijin",
};
this.set_npc("gm/wencangsong");   // 巨木旗掌旗使 闻苍松
