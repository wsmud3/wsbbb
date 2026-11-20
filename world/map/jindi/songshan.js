this.inherits(ROOM);
this.name = "禅舍";
this.desc = "松柏掩映间一座低矮的禅舍，门前石阶被岁月磨得光滑如镜。舍中一位少林祖师面壁而坐，不知坐了多少年月，身上落满了松针。禅舍后的峭壁上有一处石洞，洞口刻着「面壁」二字——由此可入达摩洞。";
this.exits = { "south": "jindi/sl_lu" };
this.no_fight = true;

// 本门禁地入口：只接纳本门弟子（WORLD.ZHENYI.enter_from_hub 内校验）。
this.add_action("enter_jd", "踏入达摩洞", function (me) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.enter_from_hub(me, "dmd") : false;
});
