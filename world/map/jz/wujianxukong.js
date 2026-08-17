this.inherits(ROOM);
this.name = "无剑虚空";
this.desc = "这不再是你所能理解的任何空间。四周是纯粹的黑暗与寂静，时间和空间在这里失去了意义。唯一的存在是远处一道模糊的人影——他负手而立，一动不动。你看不清他的面容，甚至不确定他是否真实存在。他开口了，声音像是从你心底升起——「一千年了，你是第一个走到这里的人。我一生求一败而不能。但今日，我想先问你一个问题——你，觉得自己能战胜我吗？」";
this.exits = { "south": "jz/wujianshi", "north": "jz/zhongjijiantai" };
this.no_fight = true;

this.add_action("admit_defeat", "坦然道：我不如你", function (me) {
    if (me.query_temp("jz_choice")) return me.notify("你已经做出了选择。");
    me.set_temp("jz_choice", "humble");
    if (me.query_temp("jz_meditate_done")) {
        me.notify("\n<hig>独孤求败微微点头：「知耻近乎勇。但你已在悟剑石中增长了傲气——这谦卑来之不易。」</hig>\n\n你获得了<hic>「谦卑剑心」</hic>：最终战全伤害+15%（若未在悟剑石参悟则为+25%）。");
    } else {
        me.notify("\n<hig>独孤求败微微点头：「好。知耻近乎勇。你已悟得剑道第一义。」</hig>\n\n你获得了<hic>「谦卑剑心」</hic>：最终战全伤害+25%。");
    }
});
this.add_action("challenge", "拔剑道：我来败你", function (me) {
    if (me.query_temp("jz_choice")) return me.notify("你已经做出了选择。");
    me.set_temp("jz_choice", "proud");
    me.notify("\n<hig>独孤求败大笑：「无谓的勇气。看来你还没明白——但这般锐气，倒也有趣。」</hig>\n\n独孤求败对你产生了敬重。战斗结束后你将额外获得<hic>「独孤求败的残页」</hic>，但战斗中无任何增益。");
});
