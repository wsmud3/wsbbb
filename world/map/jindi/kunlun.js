this.inherits(ROOM);
this.name = "玉阁";
this.desc = "一座白玉砌成的小阁，阁前积雪未消，雪地里却开着几株不知名的花，花色如玉，冷香袭人。阁中帘幕低垂，素女道的祖师隐于其后，不见人影，只闻环佩轻响。阁后玉阶通往云中一座白玉山门——那是九天瑶池。";
this.exits = { "east": "jindi/sn_lu" };
this.no_fight = true;

// 本门禁地入口：只接纳本门弟子（WORLD.ZHENYI.enter_from_hub 内校验）。
this.add_action("enter_jd", "踏入九天瑶池", function (me) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.enter_from_hub(me, "yc") : false;
});
