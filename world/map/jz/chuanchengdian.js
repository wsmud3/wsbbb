this.inherits(ROOM);
this.name = "剑道传承殿";
this.desc = "独孤剑意消散后，星光隐去，你发现自己站在一个小小的石室中。石室正中悬浮着一本泛光的剑谱——不，那不是书，而是无数道剑意凝聚而成的光团。石壁上刻着独孤求败最后的笔迹：「剑道无尽。这便是我唯一能给后人的东西——剑意。愿你能走到我不曾到达的彼岸。」";
this.exits = { "south": "jz/zhongjijiantai" };
this.no_fight = true;

this.on_enter = function (me) {
    var count = me.add_temp("jz_complete", 1);
    if (count === 1) {
        me.notify("\n<hig>独孤剑意的最后一句话在你心中回荡：「多谢。一千年了，我终于……败了。」</hig>\n\n恭喜你！你是第一个踏破独孤剑冢五重剑境的华山弟子！");
    }
    // 发放剑道印记
    var marks = 3;
    if (me.query_temp("jz_jianyuan_done")) marks += 1;
    if (me.query_temp("jz_choice") === "proud") marks += 1;
    me.add_temp("jz_mark", marks);
    me.notify("<hig>你获得了 " + marks + " 枚剑道印记。</hig>");
};

this.add_action("shop", "兑换奖励", function (me) {
    var marks = me.query_temp("jz_mark", 0);
    me.notify("\n<hig>剑道传承殿 · 兑换</hig>\n当前剑道印记：<hic>" + marks + "</hic>\n\n可兑换物品：\n  <hio>元晶×100</hio> — 1印\n  lv3宝石自选包×10 — 2印\n  独孤九剑残页×50 — 3印\n  剑意符·精炼 — 5印\n  称号「剑魔传人」— 15印\n  称号「独孤求败」— 40印");
    me.send_commands(
        "jz exchange yuanjing", "元晶×100(1印)",
        "jz exchange gem", "lv3宝石自选包×10(2印)",
        "jz exchange dgj", "独孤九剑残页×50(3印)",
        "jz exchange jly", "剑意符·精炼(5印)",
        "jz exchange title1", "称号「剑魔传人」(15印)",
        "jz exchange title2", "称号「独孤求败」(40印)"
    );
});
