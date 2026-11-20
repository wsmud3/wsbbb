this.inherits(ROOM);
this.name = "剑道传承殿";
this.desc = "独孤剑意消散后，星光隐去，你发现自己站在一个小小的石室中。石室正中悬浮着一本泛光的剑谱——不，那不是书，而是无数道剑意凝聚而成的光团。石壁上刻着独孤求败最后的笔迹：「剑道无尽。这便是我唯一能给后人的东西——剑意。愿你能走到我不曾到达的彼岸。」";
this.exits = { "south": "jz/zhongjijiantai" };
this.no_fight = true;
this.set_npc("jz/wuming_jian");   // 通关后在此重温（扫荡）剑冢五关

// 原先每次进入都发剑道印记、可在此兑换奖励（来回进出可无限刷），已随华山真意改版删除。
this.on_enter = function (me) {
    if (me.query_temp("jz_complete", 0)) return;
    me.set_temp("jz_complete", 1);
    me.notify("\n<hig>独孤剑意的最后一句话在你心中回荡：「多谢。一千年了，我终于……败了。」</hig>\n\n你踏破了独孤剑冢的五重剑境。");
};
