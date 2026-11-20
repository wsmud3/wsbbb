this.inherits(ROOM);
this.name = "琴台";
this.desc = "瀑布之下一方青石琴台，台上横着一张无弦古琴，逍遥派的祖师偶尔在此抚琴，琴不出声，听者却如闻天籁。水雾在日光里映出一道浅浅的虹，琴台旁的崖壁上有一道极窄的石缝，石缝深处隐约透出微光——那是通往琅嬛福地的路。";
this.exits = { "east": "jindi/xy_lu" };
this.no_fight = true;

// 本门禁地入口：只接纳本门弟子（WORLD.ZHENYI.enter_from_hub 内校验）。
this.add_action("enter_jd", "踏入琅嬛福地", function (me) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.enter_from_hub(me, "lhfd") : false;
});
