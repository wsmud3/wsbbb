this.inherits(ROOM);
this.name = "云梦沼泽";
this.desc = "你眼前是一片一望无际的芦苇荡。眺望远处，芦苇一直连接到天边，天空显得特别低矮。芦苇中的水洼发出阵阵的恶臭。水里和芦苇中似乎有些东西在爬动。身临此地，使人感到一股莫名的恐惧。";
this.exits = {
    "west": "ym/zhaoze2",
    "north": "ym/weiqiang",
};
this.set_npc(["ym/eyu", 2]);
