this.inherits(ROOM);
this.name = "悟剑石";
this.desc = "一片开阔的天然石窟。石窟正中是一块普普通通的大石头，表面光滑如镜。石面上没有刻字，但当你凝视它时，隐约能看到自己的倒影之中藏着无数剑招的残影。这就是独孤求败晚年盘坐之处——他每日在此打坐，从日出到日落，一言不发，直到最后一天才悟透无剑的真谛。";
this.exits = { "south": "jz/mujiange", "north": "jz/wujianxukong" };
this.no_fight = true;

this.add_action("meditate", "盘坐参悟", function (me) {
    if (me.query_temp("jz_meditate_done")) return me.notify("你已经在此参悟过了。");
    me.notify("<hig>你在悟剑石上盘膝坐下，闭上双眼……</hig>");
    me.set_temp("jz_meditating", 1);
    me.add_status("meditate", 30, null); // 30秒参悟状态
    setTimeout(function () {
        if (me.query_temp("jz_meditating")) {
            me.remove_temp("jz_meditating");
            me.set_temp("jz_meditate_done", 1);
            me.notify("\n<hig>你的倒影中浮现出一行字：</hig>\n\n「无剑，即是——万物皆剑。」\n\n你获得了<hic>「剑道顿悟」</hic>——最终决战中全伤害提升20%。\n但你的骄傲也随之增长了。");
        }
    }, 30000);
});
