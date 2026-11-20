this.inherits(ROOM);
this.name = "竹棚";
this.desc = "山涧边一座歪歪斜斜的竹棚，棚下吊着一只褪了色的酒葫芦，几根打狗棍随意靠在棚柱上。丐帮的祖师隐居于此，终日饮酒钓鱼。涧水尽头泊着一条乌篷船，船头朝着云雾里一座青螺般的小岛——那是君山。";
this.exits = { "west": "jindi/gb_lu" };
this.no_fight = true;

// 本门禁地入口：只接纳本门弟子（WORLD.ZHENYI.enter_from_hub 内校验）。
this.add_action("enter_jd", "踏入君山密录", function (me) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.enter_from_hub(me, "js") : false;
});
