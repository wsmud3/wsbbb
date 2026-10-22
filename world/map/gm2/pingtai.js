this.inherits(ROOM);
this.name = "平台";
this.desc = "一处临海的石台，台下惊涛拍岸。石台上有一块突兀的石块，石缝间似有门户。";
this.exits = { "north": "gm2/qiaobi", "east": "gm2/jianzhong" };
this.set_npc([]);

// 原版机制：点石块 → 杨过出现 → 点「我准备好了」硬抗海潮 → 进剑冢。
this.add_action("push_stone", "推动石块", function (me) {
    if (!this.find_obj_bypath || !this.find_obj_bypath("gm2/yangguo")) {
        NPC.CREATE("gm2/yangguo", this);
    }
    me.set_temp("gm2_stone", 1, 7200000);
    me.notify("<hiw>石块缓缓移开，露出一道石门。杨过抱着玄铁重剑站在门口。</hiw>");
    me.notify("<hiy>杨过道：「海潮马上就到，你确定要进去？」</hiy>");
    return true;
});

this.add_action("ready", "我准备好了", function (me) {
    if (!me.query_temp("gm2_stone")) {
        me.notify("<red>石门还没开，先推动那块石块。</red>");
        return true;
    }
    if (me.max_hp < 550000) {
        me.notify("<red>海潮汹涌而至，你气血不足五十万，被一掌拍得倒飞出去，胸口剧痛。</red>");
        me.hp = Math.max(1, Math.floor(me.hp * 0.3));
        return true;
    }
    me.hp = Math.max(1, me.hp - 550000);
    me.notify("<hig>海潮轰然拍下，你硬生生扛住了这一击！</hig>");
    me.moveto("gm2/jianzhong", me.name + "冲进了石门。", me.name + "从石门中走了进来。");
    return true;
});
