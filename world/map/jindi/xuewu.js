this.inherits(ROOM);
this.name = "暗楼";
this.desc = "一座孤零零的黑木小楼，窗棂紧闭，檐下不挂一盏灯。楼前的砂石泛着铁锈般的颜色，杀手楼的祖师隐居于此，四下寂无声息，连山风到了这里都似刻意放轻了脚步。楼底一道暗门半掩，门后的石阶通往修罗暗殿。";
this.exits = { "west": "jindi/xl_lu" };
this.no_fight = true;

// 本门禁地入口：只接纳本门弟子（WORLD.ZHENYI.enter_from_hub 内校验）。
this.add_action("enter_jd", "踏入修罗暗殿", function (me) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.enter_from_hub(me, "xl") : false;
});
