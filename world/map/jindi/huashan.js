this.inherits(ROOM);
this.name = "剑庐";
this.desc = "崖边一座简陋的草庐，庐前斜插着几柄锈迹斑斑的长剑，剑柄上缠着褪色的布条。华山一脉的祖师隐居于此，终日对着崖下的云海出神。庐后一条樵径没入乱石，隐隐传来剑鸣——那是通往独孤剑冢的路。";
this.exits = { "east": "jindi/hs_lu" };
this.no_fight = true;

// 本门禁地入口：只接纳本门弟子（WORLD.ZHENYI.enter_from_hub 内校验）。
this.add_action("enter_jd", "踏入独孤剑冢", function (me) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.enter_from_hub(me, "jz") : false;
});
