this.inherits(ROOM);
this.name = "后山小径";
this.desc = "华山后山一条人迹罕至的荒径，两侧古木参天，鸟鸣山幽。石阶上覆满青苔，显然多年无人踏足。小径蜿蜒向上，通向一处云雾缭绕的绝壁。空气中隐隐传来若有若无的剑鸣之声，令人心神微凛。";
this.exits = { "north": "jz/liefeng" };
this.no_fight = true;

this.add_action("look_around", "环顾四周", function (me) {
    me.notify("你仔细打量着周围的环境。石阶的磨损痕迹显示，这里曾有大量人往来——但那是很久以前的事了。路旁一块半埋的石碑上刻着：「剑冢禁地，擅入者死。」落款处是一道深达三寸的指痕。");
});
