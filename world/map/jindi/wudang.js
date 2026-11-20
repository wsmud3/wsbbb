this.inherits(ROOM);
this.name = "静室";
this.desc = "竹林深处一间静室，门楣上悬着一幅褪了色的太极图。室中武当祖师盘膝吐纳，气息绵长，似有似无。静室后的石门半掩在藤萝之后，门上刻着「真武」二字——由此可入真武秘境。";
this.exits = { "west": "jindi/wd_lu" };
this.no_fight = true;

// 本门禁地入口：只接纳本门弟子（WORLD.ZHENYI.enter_from_hub 内校验）。
this.add_action("enter_jd", "踏入真武秘境", function (me) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.enter_from_hub(me, "zw") : false;
});
